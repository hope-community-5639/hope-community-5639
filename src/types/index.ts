export type UserRole =
  | 'client'
  | 'parent_guardian'
  | 'provider'
  | 'scheduler'
  | 'intake_coordinator'
  | 'supervisor'
  | 'billing_staff'
  | 'content_editor'
  | 'administrator'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'pending_verification';
  mfaEnabled?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type ServiceCategory =
  | 'therapy'
  | 'intervention'
  | 'counseling'
  | 'training'
  | 'mentoring'
  | 'individual_support'
  | 'couples_support'
  | 'family_support'
  | 'group_support'
  | 'telehealth'
  | 'in_home';

export type DeliveryMethod = 'office' | 'in_home' | 'telehealth';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  whoItHelps: string[];
  commonConcerns: string[];
  whatToExpect: string[];
  availableFormats: DeliveryMethod[];
  faqs: { question: string; answer: string }[];
  durationMinutes: number;
}

export type AppointmentStatus =
  | 'requested'
  | 'under_review'
  | 'confirmed'
  | 'rescheduled'
  | 'checked_in'
  | 'completed'
  | 'client_canceled'
  | 'staff_canceled'
  | 'no_show';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  providerId?: string;
  providerName?: string;
  serviceId: string;
  serviceName: string;
  deliveryMethod: DeliveryMethod;
  participantType: 'individual' | 'couple' | 'family' | 'group';
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  internalStaffNotes?: string;
  telehealthLink?: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

export interface IntakeSubmission {
  id: string;
  clientId: string;
  clientName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferredLanguage: string;
  serviceRequested: string;
  preferredDelivery: DeliveryMethod;
  insuranceType: 'private' | 'medicaid' | 'self_pay' | 'sliding_scale';
  insuranceProvider?: string;
  policyNumber?: string;
  primaryConcerns: string[];
  symptomSeverity: 'mild' | 'moderate' | 'significant' | 'severe';
  currentMedications?: string;
  priorMentalHealthCare: boolean;
  priorCareDetails?: string;
  consentTreatmentSigned: boolean;
  consentTelehealthSigned: boolean;
  hipaaAcknowledged: boolean;
  signatureDataUrl?: string;
  signatureDate: string;
  status: 'pending_review' | 'approved' | 'additional_info_needed';
  staffReviewerNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export type ServiceRequestStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'more_info_required'
  | 'assigned'
  | 'scheduled'
  | 'completed'
  | 'closed'
  | 'declined'
  | 'referred_elsewhere';

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  serviceType: string;
  preferredDelivery: DeliveryMethod;
  urgency: 'routine' | 'urgent_non_emergency' | 'flexible';
  details: string;
  preferredTimes: string[];
  status: ServiceRequestStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  responseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecureMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  subject?: string;
  content: string;
  attachmentName?: string;
  attachmentSize?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  staffId: string;
  staffName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountClient: number;
  unreadCountStaff: number;
  isArchived?: boolean;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: UserRole;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  category: 'intake_consent' | 'insurance_id' | 'assessment' | 'care_plan' | 'referral' | 'general';
  isSharedWithClient: boolean;
  uploadedAt: string;
  expiresAt?: string;
}

export interface CarePlan {
  id: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  diagnosisOrFocus: string;
  primaryGoals: string[];
  interventionStrategies: string[];
  reviewDate: string;
  status: 'active' | 'under_review' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SecurityIncident {
  id: string;
  reportedAt: string;
  reporterId: string;
  reporterName: string;
  type: 'unauthorized_access_attempt' | 'privacy_concern' | 'data_integrity' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'investigating' | 'mitigated' | 'resolved' | 'closed';
  resolutionNotes?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  name: string;
  credentials: string; // e.g., LPC, MSW, LMFT, Certified Peer Support Specialist
  roleTitle: string;
  areasOfFocus: string[];
  specialties: string[];
  deliveryMethods: DeliveryMethod[];
  languages: string[];
  shortBio: string;
  isAcceptingNewClients: boolean;
  avatarUrl: string;
  verificationBadge: string;
  availableDays: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'intake' | 'message' | 'security' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface CMSContent {
  announcementNotice: string;
  heroHeadline: string;
  heroSubtitle: string;
  emergencyCrisisNotice: string;
  officeHours: string;
  phoneNumber: string;
  faxNumber: string;
  emailAddress: string;
  officeAddress: string;
  lastUpdated: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  preferredContact: 'phone' | 'email';
  message: string;
  status: 'new' | 'contacted' | 'resolved' | 'converted_to_intake';
  staffNotes?: string;
  createdAt: string;
}

export interface ReferralItem {
  id: string;
  referringOrganization: string;
  referrerName: string;
  referrerTitle?: string;
  referrerPhone: string;
  referrerEmail: string;
  clientFirstName: string;
  clientLastName: string;
  clientDOB: string;
  clientPhone: string;
  clientEmail?: string;
  insuranceType: string;
  requestedService: string;
  deliveryPreference: DeliveryMethod;
  urgencyLevel: 'standard' | 'urgent_non_emergency' | 'flexible';
  clinicalReason: string;
  status: 'received' | 'benefits_verification' | 'outreach_scheduled' | 'accepted' | 'declined';
  assignedStaffId?: string;
  assignedStaffName?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobOpening {
  id: string;
  slug: string;
  title: string;
  type: string;
  location: string;
  department: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  isActive: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  licenseNumber?: string;
  coverNote: string;
  resumeFileName?: string;
  resumeFileSize?: string;
  status: 'submitted' | 'under_review' | 'interview_scheduled' | 'offer' | 'archived';
  reviewerNotes?: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  preferredProvider?: string;
  deliveryMethod: DeliveryMethod;
  preferredDays: string[];
  notes?: string;
  status: 'waiting' | 'slot_offered' | 'scheduled' | 'removed';
  createdAt: string;
}

export interface SystemSettings {
  organizationName: string;
  organizationTagline: string;
  establishedYear: number;
  crisisPhone: string;
  crisisText: string;
  mainPhone: string;
  fax: string;
  intakeEmail: string;
  primaryAddress: string;
  mfaEnforcedForAllStaff: boolean;
  appointmentLeadTimeHours: number;
  cancellationNoticeHours: number;
  maintenanceMode: boolean;
}
