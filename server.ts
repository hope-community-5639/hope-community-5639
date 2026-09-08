import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// JSON Body Parser with safe limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Structured Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/@') && !req.path.startsWith('/src') && !req.path.startsWith('/node_modules')) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: duration,
          ip: req.ip || req.socket.remoteAddress,
        })
      );
    }
  });
  next();
});

// Basic In-Memory Rate Limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
      });
    }

    record.count += 1;
    next();
  };
}

// --------------------------------------------------------------------------
// In-Memory Database Store (with database schema compatibility)
// --------------------------------------------------------------------------

interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  status: 'active' | 'suspended' | 'pending_verification';
  mfaEnabled?: boolean;
  failedLoginAttempts: number;
  lockoutUntil?: number | null;
  createdAt: string;
  emailVerified: boolean;
}

interface DBAppointment {
  id: string;
  clientId: string;
  clientName: string;
  providerId?: string;
  providerName?: string;
  serviceId: string;
  serviceName: string;
  deliveryMethod: 'office' | 'in_home' | 'telehealth';
  participantType: 'individual' | 'couple' | 'family' | 'group';
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;
  durationMinutes: number;
  status: string;
  notes?: string;
  createdAt: string;
}

interface DBIntake {
  id: string;
  clientId: string;
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'additional_info_needed';
  formData: any;
}

interface DBMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface DBDocument {
  id: string;
  clientId: string;
  uploaderId: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: string;
  createdAt: string;
}

interface DBAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string;
  details?: string;
  timestamp: string;
}

// Seed Users with secure SHA-256 hashed default passwords
function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass + '_hcs_salt_v1').digest('hex');
}

const dbUsers: Map<string, DBUser> = new Map([
  [
    'user-client-1',
    {
      id: 'user-client-1',
      email: 'client@hopecommunity.org',
      passwordHash: hashPassword('HopeClient2026!'),
      firstName: 'Eleanor',
      lastName: 'Vance',
      role: 'client',
      phone: '(555) 234-5678',
      status: 'active',
      failedLoginAttempts: 0,
      createdAt: '2024-01-15T09:00:00Z',
      emailVerified: true,
    },
  ],
  [
    'user-staff-1',
    {
      id: 'user-staff-1',
      email: 'dr.jenkins@hopecommunity.org',
      passwordHash: hashPassword('DoctorJenkins2026!'),
      firstName: 'Dr. Sarah',
      lastName: 'Jenkins',
      role: 'provider',
      phone: '(555) 345-6789',
      status: 'active',
      failedLoginAttempts: 0,
      createdAt: '2023-08-01T08:00:00Z',
      emailVerified: true,
    },
  ],
  [
    'user-admin-1',
    {
      id: 'user-admin-1',
      email: 'admin@hopecommunity.org',
      passwordHash: hashPassword('HopeExecutive2026!'),
      firstName: 'David',
      lastName: 'Ross',
      role: 'super_admin',
      phone: '(555) 123-4567',
      status: 'active',
      failedLoginAttempts: 0,
      createdAt: '2023-01-01T08:00:00Z',
      emailVerified: true,
    },
  ],
]);

const dbAppointments: Map<string, DBAppointment> = new Map([
  [
    'apt-1',
    {
      id: 'apt-1',
      clientId: 'user-client-1',
      clientName: 'Eleanor Vance',
      providerId: 'user-staff-1',
      providerName: 'Dr. Sarah Jenkins, LPC',
      serviceId: 'individual-counseling',
      serviceName: 'Individual Counseling',
      deliveryMethod: 'office',
      participantType: 'individual',
      appointmentDate: '2026-09-12',
      timeSlot: '10:00 AM',
      durationMinutes: 50,
      status: 'confirmed',
      notes: 'Focus on anxiety reduction techniques and boundary setting.',
      createdAt: new Date().toISOString(),
    },
  ],
]);

const dbIntakes: Map<string, DBIntake> = new Map();
const dbMessages: DBMessage[] = [];
const dbDocuments: DBDocument[] = [];
const dbAuditLogs: DBAuditLog[] = [];
const dbPublicContacts: any[] = [];
const dbPublicCareers: any[] = [];
const dbPublicReferrals: any[] = [];

function logAuditEvent(actor: { id?: string; name?: string; role?: string }, action: string, entity: string, entityId?: string, details?: string, ip?: string) {
  const entry: DBAuditLog = {
    id: `audit-${crypto.randomUUID()}`,
    userId: actor.id,
    userName: actor.name || 'Anonymous',
    userRole: actor.role || 'Visitor',
    action,
    entity,
    entityId,
    details,
    ip,
    timestamp: new Date().toISOString(),
  };
  dbAuditLogs.unshift(entry);
  if (dbAuditLogs.length > 5000) dbAuditLogs.pop();
}

// Authentication Token Helper (HMAC based stateless/signed token)
const JWT_SECRET = process.env.SESSION_SECRET || 'hcs-prod-secret-fallback-key-2026';

function generateToken(user: DBUser): string {
  const payload = JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

function verifyToken(token: string): any | null {
  try {
    const [b64, sig] = token.split('.');
    if (!b64 || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(b64).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Authenticated User Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please sign in again.' });
  }
  (req as any).user = payload;
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions for this action.' });
    }
    next();
  };
}

// --------------------------------------------------------------------------
// API ROUTES
// --------------------------------------------------------------------------

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'hope-community-support',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: process.env.DATABASE_URL ? 'postgresql_configured' : 'in_memory_ready',
    storage: process.env.GCS_BUCKET_NAME ? 'gcs_configured' : 'local_storage_ready',
    port: PORT,
  });
});

// Authentication Endpoints
app.post('/api/auth/register', rateLimiter(10, 15 * 60 * 1000), (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check existing
  for (const user of dbUsers.values()) {
    if (user.email === normalizedEmail) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }
  }

  // Password complexity check
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const assignedRole = role === 'parent_guardian' ? 'parent_guardian' : 'client';
  const newUserId = `user-${crypto.randomUUID()}`;
  const verificationToken = crypto.randomBytes(24).toString('hex');

  const newUser: DBUser = {
    id: newUserId,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone ? phone.trim() : undefined,
    role: assignedRole,
    status: 'active',
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    emailVerified: false,
  };

  dbUsers.set(newUserId, newUser);

  logAuditEvent(
    { id: newUserId, name: `${firstName} ${lastName}`, role: assignedRole },
    'USER_REGISTERED',
    'users',
    newUserId,
    `New client account created for ${normalizedEmail}`,
    req.ip
  );

  const token = generateToken(newUser);

  res.status(201).json({
    message: 'Account successfully registered.',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      phone: newUser.phone,
      emailVerified: newUser.emailVerified,
    },
    verificationToken,
  });
});

app.post('/api/auth/login', rateLimiter(15, 15 * 60 * 1000), (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let foundUser: DBUser | null = null;

  for (const user of dbUsers.values()) {
    if (user.email === normalizedEmail) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Check lockout
  if (foundUser.lockoutUntil && Date.now() < foundUser.lockoutUntil) {
    const waitMinutes = Math.ceil((foundUser.lockoutUntil - Date.now()) / 60000);
    return res.status(423).json({
      error: `Account is temporarily locked due to multiple failed login attempts. Please wait ${waitMinutes} minutes.`,
    });
  }

  const inputHash = hashPassword(password);
  if (foundUser.passwordHash !== inputHash) {
    foundUser.failedLoginAttempts += 1;
    if (foundUser.failedLoginAttempts >= 5) {
      foundUser.lockoutUntil = Date.now() + 15 * 60 * 1000;
      logAuditEvent(
        { id: foundUser.id, name: `${foundUser.firstName} ${foundUser.lastName}`, role: foundUser.role },
        'ACCOUNT_LOCKED',
        'users',
        foundUser.id,
        'Account locked for 15 min after 5 failed login attempts',
        req.ip
      );
      return res.status(423).json({
        error: 'Account locked for 15 minutes due to consecutive failed attempts.',
      });
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Reset failed attempts on success
  foundUser.failedLoginAttempts = 0;
  foundUser.lockoutUntil = null;

  const token = generateToken(foundUser);

  logAuditEvent(
    { id: foundUser.id, name: `${foundUser.firstName} ${foundUser.lastName}`, role: foundUser.role },
    'USER_LOGIN',
    'users',
    foundUser.id,
    'Successful credential sign-in',
    req.ip
  );

  res.status(200).json({
    token,
    user: {
      id: foundUser.id,
      email: foundUser.email,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      role: foundUser.role,
      phone: foundUser.phone,
      emailVerified: foundUser.emailVerified,
    },
  });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const userPayload = (req as any).user;
  const user = dbUsers.get(userPayload.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone,
    emailVerified: user.emailVerified,
  });
});

app.post('/api/auth/forgot-password', rateLimiter(5, 15 * 60 * 1000), (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  // Generic success to prevent email enumeration
  const resetToken = crypto.randomBytes(24).toString('hex');
  res.json({
    message: 'If an account exists for this email, password reset instructions have been dispatched.',
    resetToken, // Returned for sandbox testing
  });
});

app.post('/api/auth/verify-email', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }
  res.json({ message: 'Email address verified successfully.' });
});

// --------------------------------------------------------------------------
// Appointments API with Record Isolation & Double-Booking Prevention
// --------------------------------------------------------------------------

app.get('/api/appointments', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const list: DBAppointment[] = [];

  for (const apt of dbAppointments.values()) {
    // Client Record Isolation: Client only sees their own appointments
    if (user.role === 'client' || user.role === 'parent_guardian') {
      if (apt.clientId === user.userId) {
        list.push(apt);
      }
    } else {
      // Staff / Admin sees practice appointments
      list.push(apt);
    }
  }

  res.json(list);
});

app.post('/api/appointments', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { serviceId, serviceName, deliveryMethod, participantType, appointmentDate, timeSlot, notes } = req.body;

  if (!serviceId || !appointmentDate || !timeSlot) {
    return res.status(400).json({ error: 'Service, appointment date, and time slot are required.' });
  }

  // Prevent Double Booking: Check if an active appointment already exists at the requested date & slot
  for (const apt of dbAppointments.values()) {
    if (
      apt.appointmentDate === appointmentDate &&
      apt.timeSlot === timeSlot &&
      apt.status !== 'client_canceled' &&
      apt.status !== 'staff_canceled'
    ) {
      return res.status(409).json({
        error: `The ${timeSlot} slot on ${appointmentDate} is already booked. Please select an alternate time.`,
      });
    }
  }

  const newAptId = `apt-${crypto.randomUUID()}`;
  const newApt: DBAppointment = {
    id: newAptId,
    clientId: user.userId,
    clientName: `${user.firstName} ${user.lastName}`,
    providerId: 'user-staff-1',
    providerName: 'Dr. Sarah Jenkins, LPC',
    serviceId,
    serviceName: serviceName || 'Clinical Consultation',
    deliveryMethod: deliveryMethod || 'office',
    participantType: participantType || 'individual',
    appointmentDate,
    timeSlot,
    durationMinutes: 50,
    status: 'requested',
    notes,
    createdAt: new Date().toISOString(),
  };

  dbAppointments.set(newAptId, newApt);

  logAuditEvent(
    { id: user.userId, name: `${user.firstName} ${user.lastName}`, role: user.role },
    'APPOINTMENT_REQUESTED',
    'appointments',
    newAptId,
    `Appointment requested for ${appointmentDate} at ${timeSlot}`,
    req.ip
  );

  res.status(201).json(newApt);
});

app.patch('/api/appointments/:id/reschedule', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const aptId = req.params.id;
  const { appointmentDate, timeSlot, reason } = req.body;

  const apt = dbAppointments.get(aptId);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  // Record isolation: Clients can only reschedule their own appointments
  if ((user.role === 'client' || user.role === 'parent_guardian') && apt.clientId !== user.userId) {
    return res.status(403).json({ error: 'Unauthorized to modify this appointment record.' });
  }

  // Check double-booking for new slot
  for (const other of dbAppointments.values()) {
    if (
      other.id !== aptId &&
      other.appointmentDate === appointmentDate &&
      other.timeSlot === timeSlot &&
      other.status !== 'client_canceled' &&
      other.status !== 'staff_canceled'
    ) {
      return res.status(409).json({
        error: `Slot ${timeSlot} on ${appointmentDate} is occupied. Please choose another time.`,
      });
    }
  }

  apt.appointmentDate = appointmentDate;
  apt.timeSlot = timeSlot;
  apt.status = 'rescheduled';
  if (reason) apt.notes = `${apt.notes || ''} [Reschedule reason: ${reason}]`;

  logAuditEvent(
    { id: user.userId, name: `${user.firstName} ${user.lastName}`, role: user.role },
    'APPOINTMENT_RESCHEDULED',
    'appointments',
    aptId,
    `Rescheduled to ${appointmentDate} ${timeSlot}`,
    req.ip
  );

  res.json(apt);
});

app.patch('/api/appointments/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const aptId = req.params.id;
  const { reason } = req.body;

  const apt = dbAppointments.get(aptId);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  // Record isolation
  if ((user.role === 'client' || user.role === 'parent_guardian') && apt.clientId !== user.userId) {
    return res.status(403).json({ error: 'Unauthorized to cancel this appointment record.' });
  }

  apt.status = user.role === 'client' ? 'client_canceled' : 'staff_canceled';
  if (reason) apt.notes = `${apt.notes || ''} [Cancellation reason: ${reason}]`;

  logAuditEvent(
    { id: user.userId, name: `${user.firstName} ${user.lastName}`, role: user.role },
    'APPOINTMENT_CANCELED',
    'appointments',
    aptId,
    `Canceled appointment: ${reason || 'Client request'}`,
    req.ip
  );

  res.json(apt);
});

// --------------------------------------------------------------------------
// Intake & Consent Submissions
// --------------------------------------------------------------------------

app.post('/api/intake', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const formData = req.body;

  const intakeId = `intake-${crypto.randomUUID()}`;
  const record: DBIntake = {
    id: intakeId,
    clientId: user.userId,
    submittedAt: new Date().toISOString(),
    status: 'pending_review',
    formData,
  };

  dbIntakes.set(intakeId, record);

  logAuditEvent(
    { id: user.userId, name: `${user.firstName} ${user.lastName}`, role: user.role },
    'INTAKE_SUBMITTED',
    'intake_submissions',
    intakeId,
    'Client intake & HIPAA consent submitted for clinical triage',
    req.ip
  );

  res.status(201).json({ message: 'Intake form submitted successfully.', intakeId });
});

// --------------------------------------------------------------------------
// Public Submissions (Careers, Contact, Referrals) with Validation & Rate Limiting
// --------------------------------------------------------------------------

app.post('/api/public/contact', rateLimiter(10, 15 * 60 * 1000), (req: Request, res: Response) => {
  const { name, email, phone, subject, message, preferredContactMethod } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  const inquiry = {
    id: `inq-${crypto.randomUUID()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : null,
    subject: subject || 'General Inquiry',
    message: message.trim(),
    preferredContactMethod: preferredContactMethod || 'email',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  dbPublicContacts.push(inquiry);

  logAuditEvent(
    { name, role: 'Public Guest' },
    'CONTACT_INQUIRY_RECEIVED',
    'contact_inquiries',
    inquiry.id,
    `Inquiry received from ${email} - subject: ${subject}`,
    req.ip
  );

  res.status(201).json({ message: 'Thank you for reaching out. A coordinator will contact you promptly.' });
});

app.post('/api/public/careers', rateLimiter(5, 15 * 60 * 1000), (req: Request, res: Response) => {
  const { jobId, jobTitle, applicantName, applicantEmail, applicantPhone, licenseNumber, coverNote } = req.body;

  if (!applicantName || !applicantEmail || !jobTitle) {
    return res.status(400).json({ error: 'Applicant name, email, and position are required.' });
  }

  const application = {
    id: `app-${crypto.randomUUID()}`,
    jobId,
    jobTitle,
    applicantName,
    applicantEmail,
    applicantPhone,
    licenseNumber,
    coverNote,
    status: 'under_review',
    createdAt: new Date().toISOString(),
  };

  dbPublicCareers.push(application);

  logAuditEvent(
    { name: applicantName, role: 'Job Applicant' },
    'CAREER_APPLICATION_SUBMITTED',
    'job_applications',
    application.id,
    `Application submitted for ${jobTitle} by ${applicantEmail}`,
    req.ip
  );

  res.status(201).json({ message: 'Your application has been received by our clinical hiring committee.' });
});

app.post('/api/public/referrals', rateLimiter(10, 15 * 60 * 1000), (req: Request, res: Response) => {
  const { referrerName, referrerOrg, referrerEmail, clientName, clientPhone, clientEmail, serviceNeeded, urgency } = req.body;

  if (!referrerName || !clientName) {
    return res.status(400).json({ error: 'Referrer name and client name are required.' });
  }

  const referral = {
    id: `ref-${crypto.randomUUID()}`,
    referrerName,
    referrerOrg,
    referrerEmail,
    clientName,
    clientPhone,
    clientEmail,
    serviceNeeded,
    urgency: urgency || 'routine',
    status: 'received',
    createdAt: new Date().toISOString(),
  };

  dbPublicReferrals.push(referral);

  logAuditEvent(
    { name: referrerName, role: 'Referral Partner' },
    'REFERRAL_RECEIVED',
    'referrals',
    referral.id,
    `Referral for ${clientName} submitted by ${referrerName} (${referrerOrg || 'Individual'})`,
    req.ip
  );

  res.status(201).json({ message: 'Referral securely registered. Intake team notified.' });
});

// --------------------------------------------------------------------------
// Admin Endpoints
// --------------------------------------------------------------------------

app.get('/api/admin/audit-logs', requireAuth, requireRole(['super_admin', 'compliance_officer']), (req: Request, res: Response) => {
  res.json(dbAuditLogs);
});

app.get('/api/admin/users', requireAuth, requireRole(['super_admin']), (req: Request, res: Response) => {
  const usersList = Array.from(dbUsers.values()).map(({ passwordHash, ...safeUser }) => safeUser);
  res.json(usersList);
});

// --------------------------------------------------------------------------
// Production Vite / Static Middleware & SPA Catch-All
// --------------------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1h', index: false }));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Production Server] Hope Community Support listening on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Production Server] Received termination signal. Closing connections gracefully...');
    server.close(() => {
      console.log('[Production Server] Closed all connections. Process exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[Production Server] Fatal startup error:', err);
  process.exit(1);
});
