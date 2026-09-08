import {
  User,
  Appointment,
  AppointmentStatus,
  IntakeSubmission,
  ServiceRequest,
  ServiceRequestStatus,
  SecureMessage,
  Conversation,
  ClientDocument,
  CarePlan,
  AuditLog,
  SecurityIncident,
  NotificationItem,
  CMSContent,
  DeliveryMethod,
  ReferralItem,
  JobOpening,
  JobApplication,
  ContactInquiry,
  WaitlistEntry,
  SystemSettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_APPOINTMENTS,
  INITIAL_INTAKES,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_DOCUMENTS,
  INITIAL_CARE_PLANS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SECURITY_INCIDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CMS,
  INITIAL_REFERRALS,
  INITIAL_JOB_OPENINGS,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_CONTACT_INQUIRIES,
  INITIAL_WAITLIST,
  INITIAL_SETTINGS,
} from './initialData';

const STORAGE_KEYS = {
  USERS: 'hcs_users_v1',
  APPOINTMENTS: 'hcs_appointments_v1',
  INTAKES: 'hcs_intakes_v1',
  SERVICE_REQUESTS: 'hcs_service_requests_v1',
  CONVERSATIONS: 'hcs_conversations_v1',
  MESSAGES: 'hcs_messages_v1',
  DOCUMENTS: 'hcs_documents_v1',
  CARE_PLANS: 'hcs_care_plans_v1',
  AUDIT_LOGS: 'hcs_audit_logs_v1',
  INCIDENTS: 'hcs_incidents_v1',
  NOTIFICATIONS: 'hcs_notifications_v1',
  CMS: 'hcs_cms_v1',
  REFERRALS: 'hcs_referrals_v1',
  JOB_OPENINGS: 'hcs_job_openings_v1',
  JOB_APPLICATIONS: 'hcs_job_applications_v1',
  CONTACT_INQUIRIES: 'hcs_contact_inquiries_v1',
  WAITLIST: 'hcs_waitlist_v1',
  SETTINGS: 'hcs_settings_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

export class DatabaseStore {
  private static instance: DatabaseStore;
  private listeners: Set<() => void> = new Set();

  private users: User[] = getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  private appointments: Appointment[] = getStored(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  private intakes: IntakeSubmission[] = getStored(STORAGE_KEYS.INTAKES, INITIAL_INTAKES);
  private serviceRequests: ServiceRequest[] = getStored(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
  private conversations: Conversation[] = getStored(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  private messages: SecureMessage[] = getStored(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  private documents: ClientDocument[] = getStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  private carePlans: CarePlan[] = getStored(STORAGE_KEYS.CARE_PLANS, INITIAL_CARE_PLANS);
  private auditLogs: AuditLog[] = getStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  private incidents: SecurityIncident[] = getStored(STORAGE_KEYS.INCIDENTS, INITIAL_SECURITY_INCIDENTS);
  private notifications: NotificationItem[] = getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  private cms: CMSContent = getStored(STORAGE_KEYS.CMS, INITIAL_CMS);
  private referrals: ReferralItem[] = getStored(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
  private jobOpenings: JobOpening[] = getStored(STORAGE_KEYS.JOB_OPENINGS, INITIAL_JOB_OPENINGS);
  private jobApplications: JobApplication[] = getStored(STORAGE_KEYS.JOB_APPLICATIONS, INITIAL_JOB_APPLICATIONS);
  private contactInquiries: ContactInquiry[] = getStored(STORAGE_KEYS.CONTACT_INQUIRIES, INITIAL_CONTACT_INQUIRIES);
  private waitlist: WaitlistEntry[] = getStored(STORAGE_KEYS.WAITLIST, INITIAL_WAITLIST);
  private settings: SystemSettings = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

  private constructor() {}

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Error notifying database listener', e);
      }
    });
  }

  // --- Audit Logging ---
  public logAction(user: User | null, action: string, entity: string, entityId: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info'): void {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: user ? user.id : 'unauthenticated',
      userName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous / Guest',
      userRole: user ? user.role : 'client',
      action,
      entity,
      entityId,
      ipAddress: '127.0.0.1',
      details,
      severity,
    };
    this.auditLogs = [newLog, ...this.auditLogs];
    setStored(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    this.notify();
  }

  // --- Users ---
  public getUsers(requestingUser: User): User[] {
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      return this.users.filter((u) => u.id === requestingUser.id);
    }
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public updateUserStatus(userId: string, status: 'active' | 'suspended', adminUser: User): void {
    if (!['super_admin', 'administrator'].includes(adminUser.role)) {
      throw new Error('Permission denied: Elevated authorization required for account status change.');
    }
    this.users = this.users.map((u) => (u.id === userId ? { ...u, status } : u));
    setStored(STORAGE_KEYS.USERS, this.users);
    this.logAction(adminUser, 'USER_STATUS_CHANGE', 'users', userId, `Updated status to ${status}`, 'warning');
    this.notify();
  }

  public updateUserRole(userId: string, newRole: User['role'], adminUser: User): void {
    if (!['super_admin', 'administrator'].includes(adminUser.role)) {
      throw new Error('Permission denied: Elevated authorization required for role change.');
    }
    this.users = this.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setStored(STORAGE_KEYS.USERS, this.users);
    this.logAction(adminUser, 'USER_ROLE_CHANGE', 'users', userId, `Assigned role ${newRole}`, 'critical');
    this.notify();
  }

  public registerUser(email: string, firstName: string, lastName: string, role: User['role'] = 'client', phone?: string): User {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      firstName,
      lastName,
      role,
      phone: phone || '',
      status: 'active',
      mfaEnabled: ['provider', 'administrator', 'super_admin', 'intake_coordinator'].includes(role),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    this.users = [...this.users, newUser];
    setStored(STORAGE_KEYS.USERS, this.users);
    this.logAction(newUser, 'USER_REGISTERED', 'users', newUser.id, `New account registered as ${role}`);
    this.notify();
    return newUser;
  }

  // --- Appointments & Double-Booking Prevention ---
  public getAppointments(requestingUser: User): Appointment[] {
    // Row-level security: Clients see only their own appointments
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      return this.appointments.filter((a) => a.clientId === requestingUser.id);
    }
    // Providers see assigned or requested
    if (requestingUser.role === 'provider') {
      return this.appointments.filter((a) => a.providerId === requestingUser.id || !a.providerId);
    }
    // Staff / Admins see all
    return [...this.appointments];
  }

  public isSlotAvailable(date: string, timeSlot: string, providerId?: string, excludeAppointmentId?: string): boolean {
    const conflict = this.appointments.find((apt) => {
      if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
      if (['client_canceled', 'staff_canceled'].includes(apt.status)) return false;
      if (apt.date === date && apt.timeSlot === timeSlot) {
        if (!providerId || !apt.providerId || apt.providerId === providerId) {
          return true;
        }
      }
      return false;
    });
    return !conflict;
  }

  public createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>, requestingUser: User): Appointment {
    // Prevent double booking
    if (!this.isSlotAvailable(data.date, data.timeSlot, data.providerId)) {
      throw new Error(`The selected slot on ${data.date} at ${data.timeSlot} is no longer available. Please select another time.`);
    }

    const newAppointment: Appointment = {
      ...data,
      id: `apt_${Date.now()}`,
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      telehealthLink: data.deliveryMethod === 'telehealth'
        ? `https://meet.hopecommunitysupport.com/room/hcs-${Math.random().toString(36).substr(2, 6)}`
        : undefined,
    };

    this.appointments = [newAppointment, ...this.appointments];
    setStored(STORAGE_KEYS.APPOINTMENTS, this.appointments);

    this.logAction(requestingUser, 'APPOINTMENT_REQUESTED', 'appointments', newAppointment.id, `Requested ${data.serviceName} on ${data.date} at ${data.timeSlot}`);

    // Create confirmation notification for client
    this.addNotification(
      newAppointment.clientId,
      'Appointment Request Received',
      `Your request for ${newAppointment.serviceName} on ${newAppointment.date} at ${newAppointment.timeSlot} has been submitted for review.`,
      'appointment',
      '#appointments'
    );

    this.notify();
    return newAppointment;
  }

  public updateAppointmentStatus(appointmentId: string, newStatus: AppointmentStatus, notes: string | undefined, requestingUser: User): Appointment {
    const apt = this.appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found.');

    // RLS: Client can only cancel their own appointment
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      if (apt.clientId !== requestingUser.id) throw new Error('Unauthorized');
      if (newStatus !== 'client_canceled') throw new Error('Clients may only cancel appointments within policy.');
    }

    const updated: Appointment = {
      ...apt,
      status: newStatus,
      internalStaffNotes: notes && requestingUser.role !== 'client' ? notes : apt.internalStaffNotes,
      cancellationReason: newStatus.includes('canceled') ? notes : apt.cancellationReason,
      updatedAt: new Date().toISOString(),
    };

    this.appointments = this.appointments.map((a) => (a.id === appointmentId ? updated : a));
    setStored(STORAGE_KEYS.APPOINTMENTS, this.appointments);

    this.logAction(requestingUser, 'APPOINTMENT_STATUS_UPDATE', 'appointments', appointmentId, `Status updated to ${newStatus}`);

    // Notify client if staff changed status
    if (requestingUser.id !== apt.clientId) {
      this.addNotification(
        apt.clientId,
        `Appointment Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
        `Your appointment on ${apt.date} at ${apt.timeSlot} is now ${newStatus.replace('_', ' ')}.`,
        'appointment',
        '#appointments'
      );
    }

    this.notify();
    return updated;
  }

  public rescheduleAppointment(appointmentId: string, newDate: string, newTime: string, requestingUser: User): Appointment {
    const apt = this.appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found.');

    if (requestingUser.role === 'client' && apt.clientId !== requestingUser.id) {
      throw new Error('Unauthorized');
    }

    if (!this.isSlotAvailable(newDate, newTime, apt.providerId, appointmentId)) {
      throw new Error('The selected new slot is not available. Please choose another time.');
    }

    const updated: Appointment = {
      ...apt,
      date: newDate,
      timeSlot: newTime,
      status: 'rescheduled',
      updatedAt: new Date().toISOString(),
    };

    this.appointments = this.appointments.map((a) => (a.id === appointmentId ? updated : a));
    setStored(STORAGE_KEYS.APPOINTMENTS, this.appointments);

    this.logAction(requestingUser, 'APPOINTMENT_RESCHEDULED', 'appointments', appointmentId, `Rescheduled to ${newDate} at ${newTime}`);
    this.notify();
    return updated;
  }

  // --- Intakes ---
  public getIntakes(requestingUser: User): IntakeSubmission[] {
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      return this.intakes.filter((i) => i.clientId === requestingUser.id);
    }
    return [...this.intakes];
  }

  public getIntakeByClientId(clientId: string, requestingUser: User): IntakeSubmission | undefined {
    if (requestingUser.role === 'client' && requestingUser.id !== clientId) {
      throw new Error('Access denied: Cannot access another client’s intake record.');
    }
    return this.intakes.find((i) => i.clientId === clientId);
  }

  public submitIntake(data: Omit<IntakeSubmission, 'id' | 'submittedAt' | 'status'>, requestingUser: User): IntakeSubmission {
    const newIntake: IntakeSubmission = {
      ...data,
      id: `intake_${Date.now()}`,
      clientId: requestingUser.id,
      clientName: `${requestingUser.firstName} ${requestingUser.lastName}`,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    };

    // Remove any previous draft/submission for this client
    this.intakes = [newIntake, ...this.intakes.filter((i) => i.clientId !== requestingUser.id)];
    setStored(STORAGE_KEYS.INTAKES, this.intakes);

    this.logAction(requestingUser, 'INTAKE_SUBMITTED', 'intake_submissions', newIntake.id, 'Completed intake forms and consent signatures');

    // Create intake document automatically
    this.uploadDocument({
      clientId: requestingUser.id,
      uploaderId: requestingUser.id,
      uploaderName: `${requestingUser.firstName} ${requestingUser.lastName}`,
      uploaderRole: requestingUser.role,
      title: 'Signed Intake & Consent Package',
      fileName: `Intake_Consent_${requestingUser.lastName}_signed.pdf`,
      fileSize: '312 KB',
      fileType: 'application/pdf',
      category: 'intake_consent',
      isSharedWithClient: true,
    }, requestingUser);

    this.notify();
    return newIntake;
  }

  public reviewIntake(intakeId: string, status: 'approved' | 'additional_info_needed', notes: string, staffUser: User): void {
    if (!['intake_coordinator', 'supervisor', 'administrator', 'super_admin', 'provider'].includes(staffUser.role)) {
      throw new Error('Permission denied: Only authorized staff may review intakes.');
    }
    const intake = this.intakes.find((i) => i.id === intakeId);
    if (!intake) throw new Error('Intake record not found.');

    this.intakes = this.intakes.map((i) =>
      i.id === intakeId
        ? {
            ...i,
            status,
            staffReviewerNotes: notes,
            reviewedAt: new Date().toISOString(),
          }
        : i
    );
    setStored(STORAGE_KEYS.INTAKES, this.intakes);

    this.logAction(staffUser, 'INTAKE_REVIEWED', 'intake_submissions', intakeId, `Marked intake as ${status}`);

    this.addNotification(
      intake.clientId,
      `Intake Paperwork ${status === 'approved' ? 'Approved' : 'Requires Additional Information'}`,
      status === 'approved'
        ? 'Your intake paperwork has been reviewed and approved by our clinical coordination team.'
        : `Our staff reviewed your intake: ${notes}`,
      'intake',
      '#intake'
    );

    this.notify();
  }

  // --- Service Requests ---
  public getServiceRequests(requestingUser: User): ServiceRequest[] {
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      return this.serviceRequests.filter((r) => r.clientId === requestingUser.id);
    }
    return [...this.serviceRequests];
  }

  public createServiceRequest(data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>, requestingUser: User): ServiceRequest {
    const newReq: ServiceRequest = {
      ...data,
      id: `req_${Date.now()}`,
      clientId: requestingUser.id,
      clientName: `${requestingUser.firstName} ${requestingUser.lastName}`,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.serviceRequests = [newReq, ...this.serviceRequests];
    setStored(STORAGE_KEYS.SERVICE_REQUESTS, this.serviceRequests);

    this.logAction(requestingUser, 'SERVICE_REQUEST_CREATED', 'service_requests', newReq.id, `Requested ${newReq.serviceType}`);
    this.notify();
    return newReq;
  }

  public updateServiceRequestStatus(reqId: string, status: ServiceRequestStatus, responseNotes: string, staffUser: User): void {
    const req = this.serviceRequests.find((r) => r.id === reqId);
    if (!req) throw new Error('Service request not found.');

    this.serviceRequests = this.serviceRequests.map((r) =>
      r.id === reqId
        ? {
            ...r,
            status,
            responseNotes,
            assignedStaffId: staffUser.id,
            assignedStaffName: `${staffUser.firstName} ${staffUser.lastName}`,
            updatedAt: new Date().toISOString(),
          }
        : r
    );
    setStored(STORAGE_KEYS.SERVICE_REQUESTS, this.serviceRequests);

    this.logAction(staffUser, 'SERVICE_REQUEST_UPDATED', 'service_requests', reqId, `Updated status to ${status}`);

    this.addNotification(
      req.clientId,
      `Service Request Update: ${req.serviceType}`,
      `Your service request status is now: ${status.replace('_', ' ')}. ${responseNotes ? `Notes: ${responseNotes}` : ''}`,
      'system',
      '#requests'
    );

    this.notify();
  }

  // --- Secure Messaging ---
  public getConversations(requestingUser: User): Conversation[] {
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      return this.conversations.filter((c) => c.clientId === requestingUser.id);
    }
    if (requestingUser.role === 'provider') {
      return this.conversations.filter((c) => c.staffId === requestingUser.id);
    }
    return [...this.conversations];
  }

  public getMessages(conversationId: string, requestingUser: User): SecureMessage[] {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) return [];
    if (requestingUser.role === 'client' && conv.clientId !== requestingUser.id) {
      throw new Error('Access denied to private conversation.');
    }
    return this.messages.filter((m) => m.conversationId === conversationId);
  }

  public sendMessage(conversationId: string, content: string, sender: User, attachmentName?: string, attachmentSize?: string): SecureMessage {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation thread not found.');

    const recipientId = sender.id === conv.clientId ? conv.staffId : conv.clientId;

    const newMsg: SecureMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: sender.id,
      senderName: `${sender.firstName} ${sender.lastName}`,
      senderRole: sender.role,
      recipientId,
      content,
      attachmentName,
      attachmentSize,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.messages = [...this.messages, newMsg];
    setStored(STORAGE_KEYS.MESSAGES, this.messages);

    // Update conversation last message
    this.conversations = this.conversations.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: content,
            lastMessageAt: new Date().toISOString(),
            unreadCountClient: sender.id !== c.clientId ? c.unreadCountClient + 1 : c.unreadCountClient,
            unreadCountStaff: sender.id === c.clientId ? c.unreadCountStaff + 1 : c.unreadCountStaff,
          }
        : c
    );
    setStored(STORAGE_KEYS.CONVERSATIONS, this.conversations);

    this.logAction(sender, 'SECURE_MESSAGE_SENT', 'messages', newMsg.id, 'Sent encrypted portal message');

    this.addNotification(
      recipientId,
      `New Secure Message from ${sender.firstName} ${sender.lastName}`,
      'You have received a new secure message in your Hope Community Support portal.',
      'message',
      '#messages'
    );

    this.notify();
    return newMsg;
  }

  public markMessagesAsRead(conversationId: string, user: User): void {
    this.messages = this.messages.map((m) =>
      m.conversationId === conversationId && m.recipientId === user.id ? { ...m, isRead: true } : m
    );
    setStored(STORAGE_KEYS.MESSAGES, this.messages);

    this.conversations = this.conversations.map((c) => {
      if (c.id === conversationId) {
        return user.role === 'client' ? { ...c, unreadCountClient: 0 } : { ...c, unreadCountStaff: 0 };
      }
      return c;
    });
    setStored(STORAGE_KEYS.CONVERSATIONS, this.conversations);
    this.notify();
  }

  // --- Documents ---
  public getDocuments(requestingUser: User): ClientDocument[] {
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      return this.documents.filter((d) => d.clientId === requestingUser.id && d.isSharedWithClient);
    }
    return [...this.documents];
  }

  public uploadDocument(data: Omit<ClientDocument, 'id' | 'uploadedAt'>, requestingUser: User): ClientDocument {
    const newDoc: ClientDocument = {
      ...data,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    this.documents = [newDoc, ...this.documents];
    setStored(STORAGE_KEYS.DOCUMENTS, this.documents);

    this.logAction(requestingUser, 'DOCUMENT_UPLOADED', 'documents', newDoc.id, `Uploaded ${newDoc.title} (${newDoc.category})`);
    this.notify();
    return newDoc;
  }

  // --- Care Plans ---
  public getCarePlans(requestingUser: User): CarePlan[] {
    if (requestingUser.role === 'client' || requestingUser.role === 'parent_guardian') {
      return this.carePlans.filter((p) => p.clientId === requestingUser.id);
    }
    return [...this.carePlans];
  }

  public saveCarePlan(plan: CarePlan, staffUser: User): void {
    if (!['provider', 'supervisor', 'administrator', 'super_admin'].includes(staffUser.role)) {
      throw new Error('Permission denied: Only clinical staff may update care plans.');
    }
    const index = this.carePlans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      this.carePlans[index] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      this.carePlans = [plan, ...this.carePlans];
    }
    setStored(STORAGE_KEYS.CARE_PLANS, this.carePlans);
    this.logAction(staffUser, 'CARE_PLAN_SAVED', 'care_plans', plan.id, `Saved care plan for ${plan.clientName}`);
    this.notify();
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  public addNotification(userId: string, title: string, message: string, type: NotificationItem['type'], actionUrl?: string): void {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl,
    };
    this.notifications = [newNotif, ...this.notifications];
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationRead(notifId: string): void {
    this.notifications = this.notifications.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // --- Audit Logs & Incidents ---
  public getAuditLogs(requestingUser: User): AuditLog[] {
    if (!['administrator', 'super_admin'].includes(requestingUser.role)) {
      throw new Error('Permission denied: Audit logs are restricted to system administrators.');
    }
    return [...this.auditLogs];
  }

  public getSecurityIncidents(requestingUser: User): SecurityIncident[] {
    if (!['administrator', 'super_admin'].includes(requestingUser.role)) {
      throw new Error('Permission denied: Security incidents are restricted to system administrators.');
    }
    return [...this.incidents];
  }

  public reportSecurityIncident(data: Omit<SecurityIncident, 'id' | 'reportedAt'>, reportingUser: User): SecurityIncident {
    const newIncident: SecurityIncident = {
      ...data,
      id: `inc_${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };
    this.incidents = [newIncident, ...this.incidents];
    setStored(STORAGE_KEYS.INCIDENTS, this.incidents);
    this.logAction(reportingUser, 'SECURITY_INCIDENT_LOGGED', 'security_incidents', newIncident.id, data.description, 'warning');
    this.notify();
    return newIncident;
  }

  // --- CMS ---
  public getCMS(): CMSContent {
    return { ...this.cms };
  }

  public updateCMS(data: Partial<CMSContent>, adminUser: User): void {
    if (!['administrator', 'super_admin', 'content_editor'].includes(adminUser.role)) {
      throw new Error('Permission denied: Elevated role required to update public CMS content.');
    }
    this.cms = {
      ...this.cms,
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setStored(STORAGE_KEYS.CMS, this.cms);
    this.logAction(adminUser, 'CMS_CONTENT_UPDATED', 'content_pages', 'global_cms', 'Updated public website copy and configuration');
    this.notify();
  }

  // --- Referrals ---
  public getReferrals(requestingUser: User): ReferralItem[] {
    if (!['intake_coordinator', 'supervisor', 'administrator', 'super_admin', 'provider'].includes(requestingUser.role)) {
      throw new Error('Permission denied: Only clinical and intake staff may access partner referrals.');
    }
    return [...this.referrals];
  }

  public submitReferral(data: Omit<ReferralItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>, submittingUser?: User | null): ReferralItem {
    const newRef: ReferralItem = {
      ...data,
      id: `ref_${Date.now()}`,
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.referrals = [newRef, ...this.referrals];
    setStored(STORAGE_KEYS.REFERRALS, this.referrals);
    this.logAction(submittingUser || null, 'REFERRAL_SUBMITTED', 'referrals', newRef.id, `Referral from ${newRef.referringOrganization} for ${newRef.clientFirstName} ${newRef.clientLastName}`);
    this.notify();
    return newRef;
  }

  public updateReferralStatus(refId: string, status: ReferralItem['status'], notes: string, staffUser: User): void {
    if (!['intake_coordinator', 'supervisor', 'administrator', 'super_admin'].includes(staffUser.role)) {
      throw new Error('Permission denied: Elevated role required to update referral status.');
    }
    this.referrals = this.referrals.map((r) =>
      r.id === refId
        ? {
            ...r,
            status,
            internalNotes: notes,
            assignedStaffId: staffUser.id,
            assignedStaffName: `${staffUser.firstName} ${staffUser.lastName}`,
            updatedAt: new Date().toISOString(),
          }
        : r
    );
    setStored(STORAGE_KEYS.REFERRALS, this.referrals);
    this.logAction(staffUser, 'REFERRAL_STATUS_UPDATED', 'referrals', refId, `Updated referral status to ${status}`);
    this.notify();
  }

  // --- Careers & Applications ---
  public getJobOpenings(): JobOpening[] {
    return [...this.jobOpenings];
  }

  public getJobOpeningBySlug(slug: string): JobOpening | undefined {
    return this.jobOpenings.find((j) => j.slug === slug || j.id === slug);
  }

  public saveJobOpening(job: JobOpening, adminUser: User): void {
    if (!['administrator', 'super_admin'].includes(adminUser.role)) {
      throw new Error('Permission denied: Administrator role required to manage job listings.');
    }
    const exists = this.jobOpenings.some((j) => j.id === job.id);
    if (exists) {
      this.jobOpenings = this.jobOpenings.map((j) => (j.id === job.id ? job : j));
    } else {
      this.jobOpenings = [...this.jobOpenings, job];
    }
    setStored(STORAGE_KEYS.JOB_OPENINGS, this.jobOpenings);
    this.logAction(adminUser, 'JOB_OPENING_SAVED', 'job_openings', job.id, `Saved job opening: ${job.title}`);
    this.notify();
  }

  public deleteJobOpening(jobId: string, adminUser: User): void {
    if (!['administrator', 'super_admin'].includes(adminUser.role)) {
      throw new Error('Permission denied: Administrator role required.');
    }
    this.jobOpenings = this.jobOpenings.filter((j) => j.id !== jobId);
    setStored(STORAGE_KEYS.JOB_OPENINGS, this.jobOpenings);
    this.logAction(adminUser, 'JOB_OPENING_DELETED', 'job_openings', jobId, 'Deleted job opening');
    this.notify();
  }

  public getJobApplications(adminUser: User): JobApplication[] {
    if (!['administrator', 'super_admin', 'intake_coordinator'].includes(adminUser.role)) {
      throw new Error('Permission denied: Administrator role required to view candidate applications.');
    }
    return [...this.jobApplications];
  }

  public submitJobApplication(data: Omit<JobApplication, 'id' | 'createdAt' | 'status'>): JobApplication {
    const newApp: JobApplication = {
      ...data,
      id: `app_${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    this.jobApplications = [newApp, ...this.jobApplications];
    setStored(STORAGE_KEYS.JOB_APPLICATIONS, this.jobApplications);
    this.logAction(null, 'JOB_APPLICATION_SUBMITTED', 'job_applications', newApp.id, `Application submitted by ${newApp.applicantName} for ${newApp.jobTitle}`);
    this.notify();
    return newApp;
  }

  public updateJobApplicationStatus(appId: string, status: JobApplication['status'], reviewerNotes: string, adminUser: User): void {
    if (!['administrator', 'super_admin'].includes(adminUser.role)) {
      throw new Error('Permission denied: Administrator role required.');
    }
    this.jobApplications = this.jobApplications.map((a) =>
      a.id === appId ? { ...a, status, reviewerNotes } : a
    );
    setStored(STORAGE_KEYS.JOB_APPLICATIONS, this.jobApplications);
    this.logAction(adminUser, 'JOB_APPLICATION_STATUS_UPDATED', 'job_applications', appId, `Status updated to ${status}`);
    this.notify();
  }

  // --- Contact Inquiries ---
  public getContactInquiries(staffUser: User): ContactInquiry[] {
    if (!['intake_coordinator', 'supervisor', 'administrator', 'super_admin'].includes(staffUser.role)) {
      throw new Error('Permission denied: Authorized staff only.');
    }
    return [...this.contactInquiries];
  }

  public submitContactInquiry(data: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): ContactInquiry {
    const newInq: ContactInquiry = {
      ...data,
      id: `inq_${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.contactInquiries = [newInq, ...this.contactInquiries];
    setStored(STORAGE_KEYS.CONTACT_INQUIRIES, this.contactInquiries);
    this.logAction(null, 'CONTACT_INQUIRY_SUBMITTED', 'contact_inquiries', newInq.id, `Inquiry from ${newInq.name} (${newInq.email})`);
    this.notify();
    return newInq;
  }

  public updateContactInquiryStatus(inqId: string, status: ContactInquiry['status'], staffNotes: string, staffUser: User): void {
    if (!['intake_coordinator', 'supervisor', 'administrator', 'super_admin'].includes(staffUser.role)) {
      throw new Error('Permission denied: Authorized staff only.');
    }
    this.contactInquiries = this.contactInquiries.map((i) =>
      i.id === inqId ? { ...i, status, staffNotes } : i
    );
    setStored(STORAGE_KEYS.CONTACT_INQUIRIES, this.contactInquiries);
    this.logAction(staffUser, 'CONTACT_INQUIRY_UPDATED', 'contact_inquiries', inqId, `Status updated to ${status}`);
    this.notify();
  }

  // --- Waitlist ---
  public getWaitlist(user: User): WaitlistEntry[] {
    if (user.role === 'client' || user.role === 'parent_guardian') {
      return this.waitlist.filter((w) => w.clientId === user.id);
    }
    return [...this.waitlist];
  }

  public joinWaitlist(data: Omit<WaitlistEntry, 'id' | 'createdAt' | 'status'>, requestingUser: User): WaitlistEntry {
    const newWl: WaitlistEntry = {
      ...data,
      id: `wl_${Date.now()}`,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    this.waitlist = [newWl, ...this.waitlist];
    setStored(STORAGE_KEYS.WAITLIST, this.waitlist);
    this.logAction(requestingUser, 'WAITLIST_JOINED', 'waitlist', newWl.id, `Joined waitlist for ${newWl.serviceName}`);
    this.notify();
    return newWl;
  }

  public updateWaitlistStatus(wlId: string, status: WaitlistEntry['status'], staffUser: User): void {
    if (!['intake_coordinator', 'scheduler', 'supervisor', 'administrator', 'super_admin'].includes(staffUser.role)) {
      throw new Error('Permission denied: Authorized staff only.');
    }
    this.waitlist = this.waitlist.map((w) => (w.id === wlId ? { ...w, status } : w));
    setStored(STORAGE_KEYS.WAITLIST, this.waitlist);
    this.logAction(staffUser, 'WAITLIST_STATUS_UPDATED', 'waitlist', wlId, `Status changed to ${status}`);
    this.notify();
  }

  // --- System Settings ---
  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<SystemSettings>, adminUser: User): SystemSettings {
    if (!['administrator', 'super_admin'].includes(adminUser.role)) {
      throw new Error('Permission denied: Administrator role required.');
    }
    this.settings = { ...this.settings, ...newSettings };
    setStored(STORAGE_KEYS.SETTINGS, this.settings);
    this.logAction(adminUser, 'SYSTEM_SETTINGS_UPDATED', 'system_settings', 'global', 'Updated organization settings');
    this.notify();
    return this.settings;
  }

  // Reset to initial demo data
  public resetToFactoryDemo(): void {
    localStorage.clear();
    this.users = INITIAL_USERS;
    this.appointments = INITIAL_APPOINTMENTS;
    this.intakes = INITIAL_INTAKES;
    this.serviceRequests = INITIAL_SERVICE_REQUESTS;
    this.conversations = INITIAL_CONVERSATIONS;
    this.messages = INITIAL_MESSAGES;
    this.documents = INITIAL_DOCUMENTS;
    this.carePlans = INITIAL_CARE_PLANS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.incidents = INITIAL_SECURITY_INCIDENTS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.cms = INITIAL_CMS;
    this.referrals = INITIAL_REFERRALS;
    this.jobOpenings = INITIAL_JOB_OPENINGS;
    this.jobApplications = INITIAL_JOB_APPLICATIONS;
    this.contactInquiries = INITIAL_CONTACT_INQUIRIES;
    this.waitlist = INITIAL_WAITLIST;
    this.settings = INITIAL_SETTINGS;
    this.notify();
  }
}

export const dbStore = DatabaseStore.getInstance();
