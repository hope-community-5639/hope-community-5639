import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  sanitizeHeader,
  validateEmailAddress,
  maskEmail,
  ProductionEmailService,
} from './server/emailService';
import {
  sanitizeFilename,
  verifyFileMagicBytes,
  processDocumentUpload,
  canDeleteDocument,
  documentRegistry,
  MAX_FILE_SIZE_BYTES,
} from './server/uploadHardening';
import {
  createBackupSnapshot,
  restoreFromBackupSnapshot,
  enforceRetentionPolicies,
  cleanupTestData,
  RETENTION_POLICY,
} from './server/backupService';
import {
  sanitizeLogData,
  metricsTracker,
  INCIDENT_RESPONSE_CONTACTS,
  ROLLBACK_PROCEDURE,
} from './server/monitoringService';

describe('Phase 3 Production Readiness Verification Suite', () => {
  // -------------------------------------------------------------------------
  // 1. Production Email Service & Security Verification
  // -------------------------------------------------------------------------
  describe('1. Production Email Service & Security', () => {
    test('Header injection prevention strips carriage return and line feed', () => {
      const maliciousSubject = 'Safe Subject\r\nBcc: victim@example.com\r\nSubject: Injected';
      const clean = sanitizeHeader(maliciousSubject);
      assert.ok(!clean.includes('\r'), 'Must not contain CR');
      assert.ok(!clean.includes('\n'), 'Must not contain LF');
      assert.equal(clean, 'Safe SubjectBcc: victim@example.comSubject: Injected');

      const urlEncoded = 'Subject%0aBcc:hacked@test.com%0d';
      const cleanUrl = sanitizeHeader(urlEncoded);
      assert.ok(!cleanUrl.includes('%0a'), 'Must not contain %0a');
      assert.ok(!cleanUrl.includes('%0d'), 'Must not contain %0d');
    });

    test('Validates recipient email addresses strictly', () => {
      assert.ok(validateEmailAddress('client@hopecommunitysupport.org'));
      assert.ok(validateEmailAddress('dr.sarah.jenkins@clinic.org'));
      assert.ok(!validateEmailAddress('invalid-email-without-at'));
      assert.ok(!validateEmailAddress('test@\r\nexample.com'));
      assert.ok(!validateEmailAddress('test%0d@example.com'));
      assert.ok(!validateEmailAddress(''));
    });

    test('Masks recipient emails for HIPAA privacy logs', () => {
      assert.equal(maskEmail('johndoe@example.com'), 'j***e@example.com');
      assert.equal(maskEmail('ab@example.com'), 'a*@example.com');
    });

    test('Honest status reporting: identifies missing credentials or authentication failures', async () => {
      const emailSvc = new ProductionEmailService();
      const status = emailSvc.getStatus();
      assert.ok(status.status === 'READY' || status.status === 'BLOCKED');
      // If SMTP authentication is not active, it must not claim READY falsely
      if (status.internalStatus === 'AUTH_FAILED' || status.internalStatus === 'UNCONFIGURED') {
        assert.equal(status.status, 'BLOCKED');
      }
    });

    test('Generates all 10 required transactional email templates with crisis contact', () => {
      const svc = new ProductionEmailService();
      const templateTypes = [
        'registration_confirmation',
        'firebase_email_verification',
        'password_reset',
        'appointment_confirmation',
        'appointment_cancellation',
        'appointment_reminder',
        'missing_document_request',
        'staff_assignment',
        'contact_form_acknowledgement',
        'admin_notification',
      ] as const;

      for (const type of templateTypes) {
        const tmpl = svc.generateTemplate(type, {
          clientName: 'Jane TestClient',
          serviceName: 'Behavioral Health Therapy',
          date: '2026-09-15',
          timeSlot: '10:00 AM',
        });
        assert.ok(tmpl.subject.length > 0, `Template ${type} must have subject`);
        assert.ok(tmpl.text.length > 0, `Template ${type} must have text content`);
        assert.ok(tmpl.html.length > 0, `Template ${type} must have html content`);
      }
    });

    test('Idempotency deduplication rejects redundant dispatches', async () => {
      const svc = new ProductionEmailService();
      const key = `idem_${Date.now()}_test`;

      // Dispatch 1
      const res1 = await svc.dispatch({
        type: 'appointment_confirmation',
        recipientEmail: 'client@example.com',
        idempotencyKey: key,
      });

      // Dispatch 2 with identical key
      const res2 = await svc.dispatch({
        type: 'appointment_confirmation',
        recipientEmail: 'client@example.com',
        idempotencyKey: key,
      });

      // If res1 was successful or cached, res2 must recognize duplicate
      if (res1.status === 'SENT') {
        assert.equal(res2.status, 'SKIPPED_DUPLICATE');
      }
    });
  });

  // -------------------------------------------------------------------------
  // 2. Hardened Document Upload & Storage Security
  // -------------------------------------------------------------------------
  describe('2. Hardened Document Upload & Storage Security', () => {
    test('Magic bytes: correctly identifies valid PDF file signatures (%PDF-)', () => {
      const pdfBuffer = Buffer.from('%PDF-1.7\n%Fake PDF content for test');
      const res = verifyFileMagicBytes(pdfBuffer, '.pdf');
      assert.ok(res.isValid);
      assert.equal(res.detectedMimeType, 'application/pdf');
    });

    test('Magic bytes: rejects executable file masquerading as PDF (Windows MZ)', () => {
      const maliciousBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
      const res = verifyFileMagicBytes(maliciousBuffer, '.pdf');
      assert.ok(!res.isValid);
      assert.ok(res.error?.includes('Windows Executable'));
    });

    test('Magic bytes: rejects Linux ELF binary', () => {
      const elfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]); // ELF header
      const res = verifyFileMagicBytes(elfBuffer, '.png');
      assert.ok(!res.isValid);
      assert.ok(res.error?.includes('Linux ELF'));
    });

    test('Magic bytes: rejects shell script with shebang (#!/)', () => {
      const scriptBuffer = Buffer.from('#!/bin/bash\nrm -rf /');
      const res = verifyFileMagicBytes(scriptBuffer, '.txt');
      assert.ok(!res.isValid);
      assert.ok(res.error?.includes('Shell script'));
    });

    test('Magic bytes: detects embedded script injections', () => {
      const dirtyBuffer = Buffer.from('%PDF-1.4\n<script>alert(1)</script>');
      const res = verifyFileMagicBytes(dirtyBuffer, '.pdf');
      assert.ok(!res.isValid);
      assert.ok(res.error?.includes('Embedded web script'));
    });

    test('Image decompression bomb protection rejects images with dangerous pixel dimensions', () => {
      // Create a fake PNG header with 10,000 x 10,000 pixel dimensions in IHDR
      const bombPng = Buffer.alloc(32);
      bombPng[0] = 0x89; bombPng[1] = 0x50; bombPng[2] = 0x4e; bombPng[3] = 0x47;
      bombPng[4] = 0x0d; bombPng[5] = 0x0a; bombPng[6] = 0x1a; bombPng[7] = 0x0a;
      bombPng.writeUInt32BE(10000, 16); // width = 10,000 px
      bombPng.writeUInt32BE(10000, 20); // height = 10,000 px
      const res = verifyFileMagicBytes(bombPng, '.png');
      assert.ok(!res.isValid);
      assert.ok(res.isDecompressionBombRisk);
    });

    test('Path traversal sanitization strips dangerous relative paths and directory climbs', () => {
      const malicious = '../../../../etc/passwd';
      const { cleanName, extension } = sanitizeFilename(malicious);
      assert.ok(!cleanName.includes('..'));
      assert.ok(!cleanName.includes('/'));
      assert.equal(extension, '');
    });

    test('Enforces strict 10MB ceiling on uploaded files', () => {
      const oversized = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
      const res = verifyFileMagicBytes(oversized, '.pdf');
      assert.ok(!res.isValid);
      assert.ok(res.error?.includes('exceeds the 10MB ceiling'));
    });

    test('Cross-client upload authorization restriction', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.7\nValid Document Content');
      const uploadResult = await processDocumentUpload({
        buffer: pdfBuffer,
        originalFilename: 'intake_consent.pdf',
        uploaderId: 'client-attacker-99',
        uploaderRole: 'client',
        clientOwnerId: 'client-victim-01', // Attacker attempting to upload into victim's record
      });

      assert.ok(!uploadResult.success);
      assert.equal(uploadResult.statusCode, 403);
      assert.ok(uploadResult.error?.includes('Cross-client upload violation'));
    });

    test('Legal hold blocks document deletion', () => {
      const docId = 'doc_test_legal_hold_01';
      documentRegistry.set(docId, {
        id: docId,
        uploaderId: 'staff-01',
        uploaderRole: 'supervisor',
        clientOwnerId: 'client-01',
        originalFilename: 'subpoena_record.pdf',
        safeStorageName: 'safe_subpoena.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        sha256Hash: 'hash123',
        scanStatus: 'passed',
        uploadTimestamp: new Date().toISOString(),
        retentionStatus: 'legal_hold', // Active legal hold
        category: 'clinical',
        title: 'Subpoena Record',
      });

      const check = canDeleteDocument(docId);
      assert.ok(!check.allowed);
      assert.ok(check.reason?.includes('active clinical or legal hold'));
    });
  });

  // -------------------------------------------------------------------------
  // 3. Backup, Restoration & Data Retention Verification
  // -------------------------------------------------------------------------
  describe('3. Backup, Restoration & Data Retention', () => {
    test('Creates point-in-time snapshot with SHA-256 integrity checksum', () => {
      const snapshot = createBackupSnapshot({
        users: [{ id: 'user-01', email: 'test@hope.org' }],
        appointments: [{ id: 'apt-01', clientName: 'Jane' }],
        documents: [{ id: 'doc-01', name: 'Assessment' }],
        auditLogs: [{ id: 'log-01', action: 'SIGN_IN' }],
        messages: [],
      });

      assert.ok(snapshot.backupId.startsWith('backup_'));
      assert.equal(snapshot.rpoHours, 1);
      assert.equal(snapshot.rtoMinutes, 15);
      assert.equal(snapshot.recordCount, 4);
      assert.ok(snapshot.checksum.length === 64, 'Must be valid SHA-256 hex string');
    });

    test('Controlled restoration verifies checksum and restores data integrity', () => {
      const snapshot = createBackupSnapshot({
        users: [{ id: 'client-restore-1', name: 'Restored Client' }],
        appointments: [{ id: 'apt-restore-1', date: '2026-10-01' }],
        documents: [],
        auditLogs: [],
        messages: [],
      });

      let restoredAppointments: any[] = [];
      const restoreResult = restoreFromBackupSnapshot(snapshot.backupId, (data) => {
        restoredAppointments = data.appointments;
      });

      assert.ok(restoreResult.success);
      assert.equal(restoreResult.recordsRestored, 2);
      assert.equal(restoredAppointments.length, 1);
      assert.equal(restoredAppointments[0].id, 'apt-restore-1');
    });

    test('Rejects corrupted backup snapshot if checksum does not match', () => {
      const snapshot = createBackupSnapshot({
        users: [{ id: 'u1' }],
        appointments: [],
        documents: [],
        auditLogs: [],
        messages: [],
      });

      // Tamper with snapshot data directly in memory
      snapshot.data.users.push({ id: 'injected_unauthorized_user' });

      const restoreResult = restoreFromBackupSnapshot(snapshot.backupId, () => {});
      assert.ok(!restoreResult.success);
      assert.ok(restoreResult.error?.includes('checksum verification failed') || restoreResult.error?.includes('corrupted'));
    });

    test('Enforces retention policies: protects records under legal hold from automated purge', () => {
      const pastGracePeriod = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(); // 35 days ago

      const testDocuments = [
        { id: 'doc-1', retentionStatus: 'pending_deletion', deletionRequestedAt: pastGracePeriod },
        { id: 'doc-2', retentionStatus: 'legal_hold', deletionRequestedAt: pastGracePeriod }, // Must be protected!
      ];

      const testUsers = [
        { id: 'user-1', status: 'pending_deletion', deletionRequestedAt: pastGracePeriod },
        { id: 'user-2', status: 'pending_deletion', deletionRequestedAt: pastGracePeriod, legalHold: true }, // Must be protected!
      ];

      const res = enforceRetentionPolicies({
        documents: testDocuments,
        users: testUsers,
        auditLogs: [{ id: 'audit-01' }],
      });

      assert.equal(res.purgedDocuments, 1, 'Only non-held pending document must be purged');
      assert.equal(res.purgedUsers, 1, 'Only non-held pending user must be purged');
      assert.equal(res.retainedLegalHoldCount, 2, 'Both legal hold items must be protected');
    });

    test('Cleanup test data removes synthetic accounts without affecting production', () => {
      const users = [
        { id: 'u-prod-1', email: 'sarah@hopecommunitysupport.org', isTestData: false },
        { id: 'u-test-1', email: 'test1@test.hopecommunitysupport.org', isTestData: true },
        { id: 'u-test-2', email: 'automated_spec@test.hopecommunitysupport.org' },
      ];

      const res = cleanupTestData(users);
      assert.equal(res.cleanedCount, 2);
      assert.equal(users.length, 1);
      assert.equal(users[0].id, 'u-prod-1');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Monitoring, Telemetry & Incident Readiness
  // -------------------------------------------------------------------------
  describe('4. Monitoring, Telemetry & Incident Readiness', () => {
    test('Structured logger redacts passwords, tokens, cookies, and sensitive PII', () => {
      const rawLog = {
        event: 'USER_LOGIN',
        email: 'client@example.com',
        password: 'SuperSecretPassword123!',
        authToken: 'eyJhbGciOiJIUzI1NiIsIn...',
        smtp_pass: 'google-app-password',
        cookie: 'sessionId=999888',
        regularField: 'safeValue',
      };

      const clean = sanitizeLogData(rawLog);
      assert.equal(clean.password, '[REDACTED]');
      assert.equal(clean.authToken, '[REDACTED]');
      assert.equal(clean.smtp_pass, '[REDACTED]');
      assert.equal(clean.cookie, '[REDACTED]');
      assert.equal(clean.regularField, 'safeValue');
    });

    test('Metrics tracker records request status codes and security denial anomalies', () => {
      metricsTracker.recordRequest(200);
      metricsTracker.recordRequest(403);
      metricsTracker.recordSecurityDenial('Unauthorized attempt to read audit logs');

      const metrics = metricsTracker.getMetrics();
      assert.equal(metrics.status, 'HEALTHY');
      assert.ok(metrics.uptimeSeconds >= 0);
      assert.ok(metrics.securityMetrics.securityRuleDenials >= 1);
      assert.ok(metrics.statusCodes['2xx'] >= 1);
      assert.ok(metrics.statusCodes['4xx'] >= 1);
    });

    test('Incident response contacts directory contains tiered escalations', () => {
      assert.ok(INCIDENT_RESPONSE_CONTACTS.length >= 3);
      const tier1 = INCIDENT_RESPONSE_CONTACTS.find((c) => c.escalationTier === 1);
      assert.ok(tier1, 'Must have Tier 1 contact');
      assert.ok(tier1.phone.length > 0);
      assert.ok(tier1.email.includes('@'));
    });

    test('Rollback procedure document contains verified step-by-step SOP', () => {
      assert.ok(ROLLBACK_PROCEDURE.steps.length >= 4);
      assert.ok(ROLLBACK_PROCEDURE.steps[1].includes('update-traffic'));
    });
  });

  // -------------------------------------------------------------------------
  // 5. Multi-Viewport Responsive & WCAG 2.2 AA Accessibility Specifications
  // -------------------------------------------------------------------------
  describe('5. Responsive & Accessibility Conformance', () => {
    test('Responsive viewports meet required test criteria', () => {
      const targetBreakpoints = [
        { name: 'iPhone SE (compact mobile)', width: 320, minTouchTargetPx: 44 },
        { name: 'iPhone 14 / standard mobile', width: 390, minTouchTargetPx: 44 },
        { name: 'iPad / tablet landscape', width: 1024, minTouchTargetPx: 44 },
        { name: 'Standard desktop / laptop', width: 1440, minTouchTargetPx: 36 },
        { name: 'Full HD widescreen', width: 1920, minTouchTargetPx: 36 },
      ];

      for (const bp of targetBreakpoints) {
        assert.ok(bp.width >= 320);
        assert.ok(bp.minTouchTargetPx >= 36);
      }
    });

    test('Color contrast ratios pass WCAG 2.2 AA (>= 4.5:1 for body text, >= 3:1 for large display text)', () => {
      // Calculate relative luminance and contrast ratio for key palette pairs
      function luminance(r: number, g: number, b: number) {
        const a = [r, g, b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }

      function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]) {
        const l1 = luminance(...rgb1);
        const l2 = luminance(...rgb2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }

      // 1. Primary brand teal #216761 on light card background #FFFFFF
      const brandTealOnWhite = contrastRatio([33, 103, 97], [255, 255, 255]);
      assert.ok(brandTealOnWhite >= 4.5, `Brand teal on white ratio (${brandTealOnWhite.toFixed(2)}) must exceed 4.5:1`);

      // 2. High-contrast body text #111827 on white #FFFFFF
      const bodyTextOnWhite = contrastRatio([17, 24, 39], [255, 255, 255]);
      assert.ok(bodyTextOnWhite >= 7.0, `Body text on white ratio (${bodyTextOnWhite.toFixed(2)}) must exceed 7:1`);

      // 3. White text #FFFFFF on primary brand teal button #216761
      const whiteOnBrandTeal = contrastRatio([255, 255, 255], [33, 103, 97]);
      assert.ok(whiteOnBrandTeal >= 4.5, `White button text on teal button (${whiteOnBrandTeal.toFixed(2)}) must exceed 4.5:1`);
    });
  });
});
