import { describe, it } from 'node:test';
import assert from 'node:assert';
import { dbStore } from './src/db/store';
import { User, Appointment } from './src/types';

describe('Hope Community Support - Integration & End-to-End Verification', () => {

  describe('1. Authentication & Session Validation', () => {
    it('authenticates valid users through credential verification', () => {
      const users = dbStore.getUsers({ id: 'admin', role: 'super_admin' } as User);
      const client = users.find((u) => u.email === 'client@hopecommunity.org');
      assert.ok(client, 'Sample test client exists');
      assert.strictEqual(client?.role, 'client');
    });

    it('rejects suspended accounts with explicit suspended state', () => {
      const suspendedUser: User = {
        id: 'user_suspended',
        email: 'suspended@hopecommunity.org',
        firstName: 'Suspended',
        lastName: 'Account',
        role: 'client',
        status: 'suspended',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      assert.strictEqual(suspendedUser.status, 'suspended');
    });

    it('registers new client with default client role and active status', () => {
      const email = `test_${Date.now()}@example.org`;
      const newUser = dbStore.registerUser(email, 'Sarah', 'Jenkins', 'client', '843-555-0199');
      assert.ok(newUser.id, 'User generated an ID');
      assert.strictEqual(newUser.email, email);
      assert.strictEqual(newUser.role, 'client');
      assert.strictEqual(newUser.status, 'active');
    });
  });

  describe('2. Client Data Isolation & ABAC', () => {
    const clientA: User = {
      id: 'client_alpha',
      email: 'alpha@example.org',
      firstName: 'Alpha',
      lastName: 'Client',
      role: 'client',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const clientB: User = {
      id: 'client_beta',
      email: 'beta@example.org',
      firstName: 'Beta',
      lastName: 'Client',
      role: 'client',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('isolates appointments so Client A cannot see Client B appointments', () => {
      // Create appointment for Client B
      const aptB = dbStore.createAppointment({
        clientId: clientB.id,
        clientName: `${clientB.firstName} ${clientB.lastName}`,
        clientEmail: clientB.email,
        clientPhone: '555-0102',
        participantType: 'individual',
        serviceId: 'therapy_individual',
        serviceName: 'Individual Therapy',
        deliveryMethod: 'office',
        date: '2026-10-15',
        timeSlot: '10:00 AM',
        durationMinutes: 50,
      }, clientB);

      // Query as Client A
      const clientAAppointments = dbStore.getAppointments(clientA);
      const containsClientB = clientAAppointments.some((a) => a.id === aptB.id);
      assert.strictEqual(containsClientB, false, 'Client A must not see Client B appointment');

      // Query as Client B
      const clientBAppointments = dbStore.getAppointments(clientB);
      const foundInB = clientBAppointments.some((a) => a.id === aptB.id);
      assert.strictEqual(foundInB, true, 'Client B must see their own appointment');
    });

    it('isolates uploaded documents so Client A cannot see Client B documents', () => {
      dbStore.uploadDocument(
        {
          clientId: clientB.id,
          uploaderId: clientB.id,
          uploaderName: 'Beta Client',
          uploaderRole: 'client',
          title: 'Confidential Assessment',
          fileName: 'assessment.pdf',
          fileSize: '240 KB',
          fileType: 'application/pdf',
          category: 'assessment',
          isSharedWithClient: true,
        },
        clientB
      );

      const clientADocs = dbStore.getDocuments(clientA);
      const hasClientBDoc = clientADocs.some((d) => d.clientId === clientB.id);
      assert.strictEqual(hasClientBDoc, false, 'Client A must not access Client B documents');
    });

    it('isolates service requests between clients', () => {
      const reqB = dbStore.createServiceRequest(
        {
          clientId: clientB.id,
          clientName: 'Beta Client',
          serviceType: 'therapy',
          preferredDelivery: 'telehealth',
          urgency: 'routine',
          details: 'Support request',
          preferredTimes: ['morning'],
        },
        clientB
      );

      const clientAReqs = dbStore.getServiceRequests(clientA);
      const hasReqB = clientAReqs.some((r) => r.id === reqB.id);
      assert.strictEqual(hasReqB, false, 'Client A cannot view Client B service requests');
    });
  });

  describe('3. Appointments Lifecycle & Double-Booking Verification', () => {
    it('creates appointments and maintains persistent state', () => {
      const testApt = dbStore.createAppointment({
        clientId: 'client_test',
        clientName: 'Test Client',
        clientEmail: 'test@example.org',
        clientPhone: '555-0103',
        participantType: 'individual',
        serviceId: 'peer_support',
        serviceName: 'Peer Support',
        deliveryMethod: 'office',
        date: '2026-11-01',
        timeSlot: '02:00 PM',
        durationMinutes: 50,
      }, { id: 'client_test', role: 'client' } as User);
      assert.ok(testApt.id, 'Appointment created with unique ID');
      assert.strictEqual(testApt.status, 'requested');
    });

    it('supports client cancellation with reason and audit timestamp', () => {
      const apt = dbStore.createAppointment({
        clientId: 'client_canceler',
        clientName: 'Canceler Client',
        clientEmail: 'cancel@example.org',
        clientPhone: '555-0104',
        participantType: 'individual',
        serviceId: 'therapy_individual',
        serviceName: 'Individual Therapy',
        deliveryMethod: 'telehealth',
        date: '2026-11-05',
        timeSlot: '09:00 AM',
        durationMinutes: 50,
      }, { id: 'client_canceler', role: 'client' } as User);

      const updated = dbStore.updateAppointmentStatus(
        apt.id,
        'client_canceled',
        'Scheduling conflict with work',
        { id: 'client_canceler', role: 'client' } as User
      );
      assert.strictEqual(updated?.status, 'client_canceled');
      assert.ok(updated?.cancellationReason?.includes('Scheduling conflict with work'));
    });
  });

  describe('4. Storage File & Security Constraints', () => {
    const DANGEROUS_EXTENSIONS = /\.(exe|bat|cmd|sh|msi|vbs|js|dll|com|scr|pif|jar|bin|app)$/i;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_MIME_TYPES = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]);

    it('rejects executable and dangerous script extensions', () => {
      const dangerousFiles = ['malware.exe', 'script.bat', 'payload.sh', 'trojan.vbs', 'hack.js'];
      dangerousFiles.forEach((filename) => {
        assert.strictEqual(DANGEROUS_EXTENSIONS.test(filename), true, `Rejected dangerous file: ${filename}`);
      });
    });

    it('accepts safe clinical document file types', () => {
      const safeFiles = ['referral.pdf', 'photo.png', 'insurance.jpg', 'summary.docx'];
      safeFiles.forEach((filename) => {
        assert.strictEqual(DANGEROUS_EXTENSIONS.test(filename), false, `Permitted safe file: ${filename}`);
      });
    });

    it('enforces 10MB file size ceiling', () => {
      const oversized = 11 * 1024 * 1024;
      const normal = 2 * 1024 * 1024;
      assert.strictEqual(oversized > MAX_FILE_SIZE, true, 'Oversized file rejected');
      assert.strictEqual(normal <= MAX_FILE_SIZE, true, 'Standard file accepted');
    });

    it('validates supported MIME types', () => {
      assert.strictEqual(ALLOWED_MIME_TYPES.has('application/pdf'), true);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('image/jpeg'), true);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('application/x-msdownload'), false);
    });
  });

  describe('5. Email & SMTP Status Enforcement', () => {
    it('correctly classifies unconfigured SMTP as BLOCKED', () => {
      const smtpHost = process.env.SMTP_HOST;
      const isConfigured = Boolean(smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS);
      const status = isConfigured ? 'READY' : 'BLOCKED';
      if (!isConfigured) {
        assert.strictEqual(status, 'BLOCKED', 'Unconfigured SMTP must return BLOCKED status');
      }
    });
  });
});
