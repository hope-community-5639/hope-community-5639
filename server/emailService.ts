import nodemailer, { Transporter } from 'nodemailer';
import crypto from 'crypto';

export interface EmailDispatchOptions {
  type:
    | 'registration_confirmation'
    | 'firebase_email_verification'
    | 'password_reset'
    | 'appointment_confirmation'
    | 'appointment_cancellation'
    | 'appointment_reminder'
    | 'missing_document_request'
    | 'staff_assignment'
    | 'contact_form_acknowledgement'
    | 'admin_notification';
  recipientEmail: string;
  recipientName?: string;
  subject?: string;
  templateData?: Record<string, any>;
  idempotencyKey?: string;
}

export interface EmailDeliveryRecord {
  id: string;
  idempotencyKey?: string;
  type: string;
  recipientMasked: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'BLOCKED' | 'SKIPPED_DUPLICATE';
  providerResponse?: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  timestamp: string;
}

// In-Memory Idempotency Cache (10 minutes TTL)
interface IdempotencyCacheEntry {
  result: { status: string; id: string; timestamp: string };
  expiresAt: number;
}
const idempotencyMap = new Map<string, IdempotencyCacheEntry>();

// Delivery Audit Log (Memory store for security audits - no credentials stored)
const emailDeliveryLogs: EmailDeliveryRecord[] = [];

// Rate Limiter for email dispatches (Max 20 per minute per recipient/IP)
const emailRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkEmailRateLimit(key: string, limit: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = emailRateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    emailRateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Header injection prevention: checks for CRLF or URL-encoded carriage return/newlines
export function sanitizeHeader(value: string): string {
  if (!value) return '';
  return value.replace(/[\r\n]|%0d|%0a/gi, '').trim();
}

export function validateEmailAddress(email: string): boolean {
  if (!email || email.length > 254) return false;
  // Strict RFC 5322 compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) return false;
  if (/[\r\n]|%0d|%0a/i.test(email)) return false;
  return true;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [user, domain] = email.split('@');
  const visibleUser = user.length <= 2 ? user[0] + '*' : user[0] + '***' + user[user.length - 1];
  return `${visibleUser}@${domain}`;
}

export class ProductionEmailService {
  private transporter: Transporter | null = null;
  private verifiedStatus: 'READY' | 'BLOCKED' | 'AUTH_FAILED' | 'UNCONFIGURED' = 'UNCONFIGURED';
  private lastVerifyError: string | null = null;
  private missingVars: string[] = [];

  constructor() {
    this.evaluateConfiguration();
  }

  public evaluateConfiguration(): void {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'Hope Community Support <noreply@hopecommunitysupport.org>';

    this.missingVars = [];
    if (!host) this.missingVars.push('SMTP_HOST');
    if (!user) this.missingVars.push('SMTP_USER');
    if (!pass) this.missingVars.push('SMTP_PASS');

    if (this.missingVars.length > 0) {
      this.verifiedStatus = 'UNCONFIGURED';
      this.lastVerifyError = `Missing required environment variables: ${this.missingVars.join(', ')}`;
      this.transporter = null;
      return;
    }

    // Initialize transporter with strict TLS
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user, pass },
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Check upstream credentials asynchronously
    this.verifyConnection();
  }

  public async verifyConnection(): Promise<{ configured: boolean; status: string; reason?: string; missingOrInvalid?: string[] }> {
    if (!this.transporter) {
      return {
        configured: false,
        status: 'BLOCKED',
        reason: this.lastVerifyError || 'SMTP credentials unconfigured',
        missingOrInvalid: this.missingVars,
      };
    }

    try {
      await this.transporter.verify();
      this.verifiedStatus = 'READY';
      this.lastVerifyError = null;
      return {
        configured: true,
        status: 'READY',
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      this.lastVerifyError = errMsg;

      if (/535|bad credentials|username and password not accepted/i.test(errMsg)) {
        this.verifiedStatus = 'AUTH_FAILED';
        return {
          configured: true,
          status: 'BLOCKED',
          reason: 'SMTP Authentication Rejected (535-5.7.8 Username and Password not accepted). Upstream Gmail requires a 16-character App Password or verified Workspace SMTP relay.',
          missingOrInvalid: ['SMTP_PASS requires Google App Password (16 characters) or verified Relay credential'],
        };
      }

      this.verifiedStatus = 'BLOCKED';
      return {
        configured: true,
        status: 'BLOCKED',
        reason: `SMTP upstream verification failed: ${errMsg}`,
      };
    }
  }

  public getStatus() {
    return {
      configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      status: this.verifiedStatus === 'READY' ? 'READY' : 'BLOCKED',
      internalStatus: this.verifiedStatus,
      host: process.env.SMTP_HOST || null,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      from: sanitizeHeader(process.env.SMTP_FROM || 'Hope Community Support <noreply@hopecommunitysupport.org>'),
      userConfigured: Boolean(process.env.SMTP_USER),
      passConfigured: Boolean(process.env.SMTP_PASS),
      lastError: this.lastVerifyError,
      missingOrInvalid: this.missingVars,
      notice: 'SMTP credentials remain strictly server-side and are never exposed in browser bundles or client logs.',
    };
  }

  public getDeliveryLogs(): EmailDeliveryRecord[] {
    return emailDeliveryLogs.slice(-100);
  }

  public generateTemplate(type: EmailDispatchOptions['type'], data: Record<string, any> = {}): { subject: string; text: string; html: string } {
    const clientName = sanitizeHeader(data.clientName || 'Community Member');
    const clinicPhone = '(555) 234-HOPE';
    const portalUrl = data.portalUrl || 'https://hopecommunitysupport.org/client-portal';

    switch (type) {
      case 'registration_confirmation':
        return {
          subject: 'Welcome to Hope Community Support - Clinical Portal Access',
          text: `Hello ${clientName},\n\nWelcome to Hope Community Support. Your client account has been securely provisioned.\nAccess your portal at: ${portalUrl}\n\nIn emergency, call 988 or 911.\nHope Community Support`,
          html: `<h2>Welcome to Hope Community Support</h2><p>Hello <strong>${clientName}</strong>,</p><p>Your client portal account has been established. You can view care documents, complete intake forms, and request therapy appointments securely.</p><p><a href="${portalUrl}" style="padding:10px 16px;background:#216761;color:#fff;text-decoration:none;border-radius:4px;">Access Client Portal</a></p><p style="color:#666;font-size:12px;">If you are experiencing a mental health crisis, please call 988 or 911 immediately.</p>`,
        };

      case 'firebase_email_verification':
        return {
          subject: 'Hope Community Support - Verify Your Email Address',
          text: `Hello ${clientName},\n\nPlease verify your email address to ensure confidential communication: ${data.actionUrl || portalUrl}\n\nHope Community Support`,
          html: `<h2>Verify Your Email Address</h2><p>Hello ${clientName},</p><p>Please confirm this email address to activate all confidential client messaging features.</p><p><a href="${data.actionUrl || portalUrl}" style="padding:10px 16px;background:#216761;color:#fff;text-decoration:none;border-radius:4px;">Verify Email</a></p>`,
        };

      case 'password_reset':
        return {
          subject: 'Hope Community Support - Password Reset Instructions',
          text: `Hello ${clientName},\n\nA password reset was requested for your account. If you did not make this request, ignore this message.\nReset Link: ${data.actionUrl || portalUrl}\n\nLink expires in 1 hour.`,
          html: `<h2>Password Reset Request</h2><p>Hello ${clientName},</p><p>You recently requested to reset your password. Click below to choose a new password.</p><p><a href="${data.actionUrl || portalUrl}" style="padding:10px 16px;background:#216761;color:#fff;text-decoration:none;border-radius:4px;">Reset Password</a></p><p style="color:#777;font-size:12px;">This link expires in 1 hour. If you did not make this request, your account remains secure.</p>`,
        };

      case 'appointment_confirmation':
        return {
          subject: `Appointment Confirmed: ${data.serviceName || 'Session'} on ${data.date || 'Scheduled Date'}`,
          text: `Hello ${clientName},\n\nYour appointment for ${data.serviceName || 'Behavioral Health Service'} has been scheduled.\nDate: ${data.date}\nTime: ${data.timeSlot}\nDelivery: ${data.deliveryMethod || 'Office'}\nProvider: ${data.providerName || 'Assigned Clinician'}\n\nTo cancel or reschedule, please provide at least 24 hours advance notice.\nHope Community Support: ${clinicPhone}`,
          html: `<h2>Appointment Confirmation</h2><p>Hello ${clientName},</p><p>Your appointment has been confirmed:</p><ul><li><strong>Service:</strong> ${data.serviceName || 'Behavioral Health Service'}</li><li><strong>Date:</strong> ${data.date}</li><li><strong>Time:</strong> ${data.timeSlot}</li><li><strong>Location/Format:</strong> ${data.deliveryMethod || 'Office'}</li><li><strong>Provider:</strong> ${data.providerName || 'Assigned Clinician'}</li></ul><p>Please log in to your portal to review check-in instructions.</p>`,
        };

      case 'appointment_cancellation':
        return {
          subject: `Appointment Cancelled: ${data.serviceName || 'Session'} on ${data.date || ''}`,
          text: `Hello ${clientName},\n\nYour appointment scheduled for ${data.date} at ${data.timeSlot} has been cancelled.\nReason: ${data.cancellationReason || 'Requested by client/clinic'}\n\nTo reschedule, visit your client portal or call ${clinicPhone}.`,
          html: `<h2>Appointment Cancellation Notice</h2><p>Hello ${clientName},</p><p>The following appointment has been cancelled:</p><p><strong>${data.serviceName}</strong> on ${data.date} at ${data.timeSlot}</p><p><strong>Reason:</strong> ${data.cancellationReason || 'Client request'}</p><p><a href="${portalUrl}">Log in to reschedule</a></p>`,
        };

      case 'appointment_reminder':
        return {
          subject: `Upcoming Appointment Reminder: Tomorrow at ${data.timeSlot || ''}`,
          text: `Hello ${clientName},\n\nThis is a courtesy reminder of your upcoming session tomorrow, ${data.date} at ${data.timeSlot}.\nProvider: ${data.providerName || 'Hope Community Clinician'}\n\nHope Community Support`,
          html: `<h2>Upcoming Appointment Reminder</h2><p>Hello ${clientName},</p><p>This is a reminder for your upcoming session tomorrow at <strong>${data.timeSlot}</strong> (${data.date}).</p><p>Format: ${data.deliveryMethod || 'Office'}</p>`,
        };

      case 'missing_document_request':
        return {
          subject: 'Action Required: Documentation Needed for Your Intake',
          text: `Hello ${clientName},\n\nOur intake department requires an additional document to complete your file: ${data.documentName || 'Required Form'}.\nPlease upload this document via your secure client portal.\n\nHope Community Support Intake`,
          html: `<h2>Document Request</h2><p>Hello ${clientName},</p><p>Our care team requires additional documentation: <strong>${data.documentName || 'Intake Form / Insurance Card'}</strong>.</p><p><a href="${portalUrl}" style="padding:10px 16px;background:#216761;color:#fff;text-decoration:none;border-radius:4px;">Upload Document</a></p>`,
        };

      case 'staff_assignment':
        return {
          subject: `Staff Case Assignment: New Client Assigned (${clientName})`,
          text: `Notice: A new client (${clientName}) has been assigned to your care caseload.\nUrgency: ${data.urgency || 'Routine'}\nPlease review the intake summary in the staff portal.\n\nHope Community Support Administration`,
          html: `<h2>New Client Caseload Assignment</h2><p>A client has been assigned to your schedule:</p><ul><li><strong>Client:</strong> ${clientName}</li><li><strong>Urgency:</strong> ${data.urgency || 'Routine'}</li><li><strong>Service:</strong> ${data.serviceName || 'Individual Therapy'}</li></ul><p><a href="https://hopecommunitysupport.org/staff-portal">Open Staff Portal</a></p>`,
        };

      case 'contact_form_acknowledgement':
        return {
          subject: 'Thank You for Contacting Hope Community Support',
          text: `Hello ${clientName},\n\nWe have received your message and our intake coordinator will respond within 1-2 business days.\nIf this is an emergency, please call 988 or 911.\n\nHope Community Support`,
          html: `<h2>Inquiry Received</h2><p>Hello ${clientName},</p><p>Thank you for reaching out to Hope Community Support. A member of our community care coordination team will review your inquiry within 1-2 business days.</p><p style="color:#B3392F;font-size:12px;">For mental health crises, please call 988 or 911 directly.</p>`,
        };

      case 'admin_notification':
      default:
        return {
          subject: `Administrative Alert: ${sanitizeHeader(data.alertTitle || 'Security Notice')}`,
          text: `Administrative Alert\n\nEvent: ${data.alertTitle || 'System Event'}\nDetails: ${data.details || 'No details provided'}\nTimestamp: ${new Date().toISOString()}\n\nHope Community Support Security Operations`,
          html: `<h2>Administrative Alert</h2><p><strong>Event:</strong> ${data.alertTitle || 'System Event'}</p><p><strong>Details:</strong> ${data.details || 'N/A'}</p><p style="color:#777;font-size:12px;">Timestamp: ${new Date().toISOString()}</p>`,
        };
    }
  }

  public async dispatch(options: EmailDispatchOptions): Promise<{
    status: 'SENT' | 'FAILED' | 'BLOCKED' | 'SKIPPED_DUPLICATE';
    id: string;
    messageId?: string;
    error?: string;
    details?: string;
  }> {
    const deliveryId = `mail_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { type, recipientEmail, subject: customSubject, templateData, idempotencyKey } = options;

    // 1. Validate recipient email
    if (!validateEmailAddress(recipientEmail)) {
      const errRecord: EmailDeliveryRecord = {
        id: deliveryId,
        idempotencyKey,
        type,
        recipientMasked: maskEmail(recipientEmail),
        subject: customSubject || type,
        status: 'FAILED',
        errorCode: 'INVALID_RECIPIENT',
        errorMessage: 'Invalid recipient email address syntax or header injection detected',
        retryCount: 0,
        timestamp: new Date().toISOString(),
      };
      emailDeliveryLogs.push(errRecord);
      return {
        status: 'FAILED',
        id: deliveryId,
        error: 'Invalid recipient email address or prohibited carriage-return characters.',
      };
    }

    // 2. Check Idempotency Key
    if (idempotencyKey) {
      const existing = idempotencyMap.get(idempotencyKey);
      if (existing && Date.now() < existing.expiresAt) {
        return {
          status: 'SKIPPED_DUPLICATE',
          id: existing.result.id,
          details: 'Email was previously dispatched with identical idempotency key within 10 minutes.',
        };
      }
    }

    // 3. Rate Limit Check
    if (!checkEmailRateLimit(recipientEmail)) {
      return {
        status: 'FAILED',
        id: deliveryId,
        error: 'Email dispatch rate limit exceeded for this recipient (max 20/min).',
      };
    }

    // 4. Check SMTP status - If BLOCKED or AUTH_FAILED, return honest failure without fake simulation
    const fromAddress = sanitizeHeader(process.env.SMTP_FROM || 'Hope Community Support <noreply@hopecommunitysupport.org>');
    const template = this.generateTemplate(type, templateData);
    const finalSubject = sanitizeHeader(customSubject || template.subject);

    if (this.verifiedStatus === 'UNCONFIGURED' || !this.transporter) {
      const record: EmailDeliveryRecord = {
        id: deliveryId,
        idempotencyKey,
        type,
        recipientMasked: maskEmail(recipientEmail),
        subject: finalSubject,
        status: 'BLOCKED',
        errorCode: 'SMTP_UNCONFIGURED',
        errorMessage: `SMTP configuration incomplete. Missing: ${this.missingVars.join(', ')}`,
        retryCount: 0,
        timestamp: new Date().toISOString(),
      };
      emailDeliveryLogs.push(record);
      return {
        status: 'BLOCKED',
        id: deliveryId,
        error: `SMTP service is BLOCKED. Missing required environment variables: ${this.missingVars.join(', ')}.`,
      };
    }

    // 5. Attempt Send with Retry Logic (exponential backoff for temporary failures, no retry for permanent 5xx auth errors)
    let attempts = 0;
    const maxRetries = 2;
    let lastError: any = null;

    while (attempts <= maxRetries) {
      attempts++;
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: recipientEmail,
          subject: finalSubject,
          text: template.text,
          html: template.html,
          headers: {
            'X-Entity-Ref-ID': deliveryId,
            'X-Auto-Response-Suppress': 'OOF, AutoReply',
          },
        });

        const record: EmailDeliveryRecord = {
          id: deliveryId,
          idempotencyKey,
          type,
          recipientMasked: maskEmail(recipientEmail),
          subject: finalSubject,
          status: 'SENT',
          providerResponse: info.response || '250 OK',
          retryCount: attempts - 1,
          timestamp: new Date().toISOString(),
        };
        emailDeliveryLogs.push(record);

        if (idempotencyKey) {
          idempotencyMap.set(idempotencyKey, {
            result: { status: 'SENT', id: deliveryId, timestamp: new Date().toISOString() },
            expiresAt: Date.now() + 10 * 60 * 1000,
          });
        }

        return {
          status: 'SENT',
          id: deliveryId,
          messageId: info.messageId,
        };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const errCode = err?.responseCode || err?.code || '';

        // Permanent failure codes: do NOT retry
        const isPermanent =
          /535|550|551|552|553|554|bad credentials|username and password not accepted/i.test(errMsg) ||
          errCode === 535 ||
          errCode === 550;

        if (isPermanent) {
          this.verifiedStatus = 'AUTH_FAILED';
          const record: EmailDeliveryRecord = {
            id: deliveryId,
            idempotencyKey,
            type,
            recipientMasked: maskEmail(recipientEmail),
            subject: finalSubject,
            status: 'BLOCKED',
            errorCode: String(errCode || 'AUTH_FAILURE'),
            errorMessage: errMsg,
            retryCount: attempts - 1,
            timestamp: new Date().toISOString(),
          };
          emailDeliveryLogs.push(record);

          return {
            status: 'BLOCKED',
            id: deliveryId,
            error: `Permanent SMTP failure (${errCode}): ${errMsg}`,
          };
        }

        // Temporary failure: back off exponentially if retries remain
        if (attempts <= maxRetries) {
          const delay = Math.pow(2, attempts) * 200; // 400ms, 800ms
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Retries exhausted for temporary failure
    const failRecord: EmailDeliveryRecord = {
      id: deliveryId,
      idempotencyKey,
      type,
      recipientMasked: maskEmail(recipientEmail),
      subject: finalSubject,
      status: 'FAILED',
      errorCode: String(lastError?.code || 'TEMPORARY_NETWORK_FAILURE'),
      errorMessage: lastError?.message || 'SMTP delivery timed out after retries',
      retryCount: attempts - 1,
      timestamp: new Date().toISOString(),
    };
    emailDeliveryLogs.push(failRecord);

    return {
      status: 'FAILED',
      id: deliveryId,
      error: `SMTP delivery failed after ${attempts} attempts: ${lastError?.message || 'Connection failure'}`,
    };
  }
}

export const emailService = new ProductionEmailService();
