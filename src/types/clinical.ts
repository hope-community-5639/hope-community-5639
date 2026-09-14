export type DeliveryMethod = 'office' | 'telehealth' | 'home' | 'video' | 'phone';
import { UserRole } from './index';
export type { UserRole };

// --------------------------------------------------------------------------
// Core Clinical & Interview Data Types
// --------------------------------------------------------------------------

export type ClientOnboardingStatus =
  | 'invited'
  | 'account_pending'
  | 'identity_verification'
  | 'intake_in_progress'
  | 'consent_pending'
  | 'submitted'
  | 'intake_review'
  | 'clarification_required'
  | 'eligible'
  | 'provider_matching'
  | 'appointment_offered'
  | 'active'
  | 'on_hold'
  | 'discharged'
  | 'archived';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  permissionToContact: boolean;
  primaryCareProvider?: string;
  existingTherapist?: string;
  preferredEmergencyFacility?: string;
}

export interface GuardianInfo {
  isMinor: boolean;
  guardianName?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  hasLegalAuthority?: boolean;
  authorityDocumentId?: string;
  verifiedByStaff?: boolean;
}

export interface ClientOnboardingData {
  id: string;
  clientId: string;
  step: number; // 1 to 10
  status: ClientOnboardingStatus;
  
  // Step 1 - Account
  legalName: string;
  preferredName: string;
  email: string;
  mobile: string;
  preferredCommunication: 'phone' | 'email' | 'sms' | 'secure_portal';
  preferredLanguage: string;
  timeZone: string;
  accessibilityRequirements?: string;
  referralSource?: string;
  
  // Step 2 - Identity & Eligibility
  dateOfBirth: string;
  address: string;
  serviceLocation: string;
  guardianInfo: GuardianInfo;
  
  // Step 3 - Emergency & Support
  emergencyContact: EmergencyContact;
  
  // Step 4 - Service Selection
  serviceRequested: string;
  clientDefinedGoals: string;
  
  // Step 5 - Initial Screening & Safety
  currentConcerns: string[];
  urgency: 'routine' | 'urgent_non_emergency' | 'safety_review_required';
  previousSupport?: string;
  safetyScreening: {
    hasImmediateDanger: boolean;
    hasSelfHarmThoughts: boolean;
    hasHarmToOthers: boolean;
    requiresImmediateEscalation: boolean;
    details?: string;
  };
  
  // Step 6 - Modality Preference
  modalityPreference: DeliveryMethod;
  preferredTimes: string[];
  
  // Step 7 - Payment & Insurance
  paymentType: 'self_pay' | 'insurance' | 'sliding_scale';
  insurerName?: string;
  memberId?: string;
  groupId?: string;
  policyholderName?: string;
  policyholderDob?: string;
  financialResponsibilityAcknowledged: boolean;
  
  // Step 8 - 13 Separated Consents
  consents: {
    privacyNotice: boolean;
    informedConsentForServices: boolean;
    telehealthConsent: boolean;
    communicationConsent: boolean;
    financialPolicy: boolean;
    cancellationPolicy: boolean;
    emergencyLimitations: boolean;
    recordingConsent: boolean;
    aiTranscriptionConsent: boolean;
    aiAssistedDocumentationConsent: boolean;
    informationSharingAuthorization: boolean;
    clientRightsAndResponsibilities: boolean;
    wellnessProgramConsent: boolean;
    signedAt?: string;
    signerName?: string;
    signerRole?: 'client' | 'parent_guardian';
  };
  
  // Step 10 - Provider Matching Result
  assignedProviderId?: string;
  assignedProviderName?: string;
  matchingScore?: number;
  matchingRationale?: string;
  matchingApprovedByStaff?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Provider Credentialing & Verification
// --------------------------------------------------------------------------

export type CredentialStatus =
  | 'submitted'
  | 'document_review'
  | 'primary_source_verification'
  | 'background_review'
  | 'supervisor_review'
  | 'approved'
  | 'system_access_granted'
  | 'active'
  | 'renewal_due'
  | 'suspended'
  | 'expired'
  | 'terminated'
  | 'archived';

export interface ProviderCredential {
  id: string;
  providerId: string;
  providerName: string;
  licenseType: string; // LPC, LCSW, LMFT, MD, PsyD, Peer Specialist
  licenseNumber: string;
  licensingJurisdiction: string; // e.g. SC, NC, GA
  issueDate: string;
  expirationDate: string;
  licensingBoardSource: string;
  status: CredentialStatus;
  scopeOfPractice: string[];
  authorizedTelehealthJurisdictions: string[];
  liabilityCarrier: string;
  liabilityPolicyNumber: string;
  liabilityExpirationDate: string;
  backgroundCheckStatus: 'cleared' | 'pending' | 'flagged';
  backgroundCheckDate: string;
  mandatoryTrainingCompleted: boolean;
  supervisorId?: string;
  supervisorName?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  isSelfApprovedBlocked: boolean; // Must always be true - self-approval is forbidden
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// 24 Interview Questionnaire Topics
// --------------------------------------------------------------------------

export interface InterviewTopicAnswer {
  topicIndex: number;
  topicTitle: string;
  questionPrompt: string;
  clientAnswer: string;
  status: 'answered' | 'skipped' | 'follow_up_required' | 'not_provided';
  confidenceScore: number; // 0.0 to 1.0
  sourceTimestamp?: string;
  clinicianNotes?: string;
  uncertaintyFlag?: boolean;
}

// --------------------------------------------------------------------------
// Online & Offline Session Recording & Transcription
// --------------------------------------------------------------------------

export type RecordingStatus =
  | 'available_offline'
  | 'recording_locally'
  | 'recording_active'
  | 'paused'
  | 'sealed'
  | 'waiting_for_connection'
  | 'uploading'
  | 'integrity_verification'
  | 'server_accepted'
  | 'local_copy_removed'
  | 'processing'
  | 'completed'
  | 'consent_withdrawn'
  | 'failed';

export interface RecordingChunk {
  chunkIndex: number;
  byteSize: number;
  sha256Checksum: string;
  capturedAt: string;
  uploaded: boolean;
  serverVerified: boolean;
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  modality: DeliveryMethod;
  consentObtained: boolean;
  consentTimestamp: string;
  consentWithdrawnAt?: string;
  isOfflineCapture: boolean;
  deviceId?: string;
  durationSeconds: number;
  totalChunks: number;
  chunks: RecordingChunk[];
  status: RecordingStatus;
  masterChecksum?: string;
  isImmutable: boolean;
  immutableMasterPath?: string;
  createdAt: string;
  sealedAt?: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: 'Client' | 'Interviewer/Provider';
  timestampStart: string; // e.g., "00:02:14"
  timestampEnd: string;
  text: string;
  confidence: number;
  uncertaintyFlags?: {
    type: 'medication' | 'health_term' | 'name' | 'date' | 'quantity' | 'low_confidence';
    word: string;
    reason: string;
  }[];
  topicMappingIndex?: number;
}

export interface SessionTranscript {
  id: string;
  recordingId: string;
  appointmentId: string;
  clientId: string;
  version: number;
  isVerbatimOriginal: boolean;
  segments: TranscriptSegment[];
  uncertaintyCount: number;
  missingSectionsDetected: boolean;
  reviewedByProviderId?: string;
  reviewedAt?: string;
  createdAt: string;
}

// --------------------------------------------------------------------------
// AI-Assisted Formal Clinical Report
// --------------------------------------------------------------------------

export type ReportApprovalStatus =
  | 'draft_generated'
  | 'provider_review'
  | 'clarification_requested'
  | 'approved_by_provider'
  | 'client_confirmed'
  | 'amendment_requested'
  | 'finalized';

export interface FormalReportSection {
  title: string;
  category: string;
  content: string;
  sourceTimestampReferences?: string[];
  classification: 'client_reported' | 'provider_observation' | 'ai_draft' | 'professional_assessment' | 'approved_recommendation';
  requiresConfirmation?: boolean;
}

export interface FormalReport {
  id: string;
  reportReference: string; // e.g. HCS-RPT-2026-0814
  appointmentId: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  providerCredentials: string;
  sessionDate: string;
  sessionModality: DeliveryMethod;
  recordingConsentStatus: 'verified_consented' | 'session_unrecorded_by_choice' | 'consent_withdrawn';
  status: ReportApprovalStatus;
  
  // Structured Branded Clinical Sections
  executiveSummary: string;
  clientReportedGoals: string[];
  presentingConcerns: string[];
  relevantHistory: string;
  interviewAnswersByCategory: FormalReportSection[];
  strengthsAndSupportResources: string[];
  preferencesAndAccommodations: string[];
  challengesAndBarriers: string[];
  providerObservations: string;
  recordedInterventions: string[];
  clientEngagementResponse: string;
  safetyOrReferralConsiderations: string;
  itemsRequiringConfirmation: string[];
  proposedWellnessFocusAreas: string[];
  agreedNextSteps: string[];
  followUpDate: string;
  
  // Mandatory Reviewer Sign-Off
  reviewedByProviderId?: string;
  reviewedByProviderName?: string;
  providerSignature?: string;
  providerSignatureTimestamp?: string;
  
  // Client Confirmation
  clientConfirmed: boolean;
  clientConfirmedAt?: string;
  clientCorrectionNotes?: string;
  
  version: number;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Personalized Wellness Program Designer & Goals
// --------------------------------------------------------------------------

export type WellnessProgramStatus =
  | 'draft'
  | 'professional_review'
  | 'client_review'
  | 'approved'
  | 'active'
  | 'paused'
  | 'revised'
  | 'completed'
  | 'archived';

export interface WellnessGoalItem {
  id: string;
  goal: string;
  baseline: string;
  target: string;
  action: string;
  frequency: string;
  responsiblePerson: 'client' | 'provider' | 'care_partner';
  reviewDate: string;
  progressStatus: 'not_started' | 'in_progress' | 'target_met' | 'revised' | 'paused';
  progressPercentage: number; // 0 to 100
}

export interface WellnessActivityItem {
  id: string;
  title: string;
  category: 'mindfulness' | 'movement' | 'social_connection' | 'routine' | 'recovery';
  frequency: string;
  instructions: string;
  completedThisWeek: boolean;
}

export interface ProgressCheckIn {
  id: string;
  programId: string;
  clientId: string;
  date: string;
  moodRating: number; // 1 to 5
  energyRating: number; // 1 to 5
  stressRating: number; // 1 to 5
  activitiesCompletedCount: number;
  barriersEncountered?: string;
  clientComments?: string;
  providerNotes?: string;
  recordedBy: 'client' | 'provider';
  createdAt: string;
}

export interface WellnessProgram {
  id: string;
  programReference: string; // e.g. HCS-WP-2026-0042
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  formalReportId?: string;
  status: WellnessProgramStatus;
  
  clientDefinedGoals: string;
  baselineSummary: string;
  strengthsSummary: string;
  priorityAreas: string[];
  
  goals: WellnessGoalItem[];
  plannedActivities: WellnessActivityItem[];
  clientResponsibilities: string[];
  providerResponsibilities: string[];
  accommodations: string[];
  measurableIndicators: string[];
  checkInSchedule: string;
  referralConditions: string;
  safetyPlanReference?: string;
  
  startDate: string;
  nextReviewDate: string;
  
  clientAcknowledged: boolean;
  clientAcknowledgedAt?: string;
  
  professionalApproved: boolean;
  approvedByProviderId?: string;
  approvedByProviderName?: string;
  approvedAt?: string;
  
  version: number;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Safety Events, Safeguarding & Incidents
// --------------------------------------------------------------------------

export type SafetyEventType =
  | 'immediate_safety_concern'
  | 'abuse_safeguarding_concern'
  | 'medical_emergency'
  | 'technology_failure'
  | 'privacy_incident'
  | 'unauthorized_recording'
  | 'lost_or_stolen_device'
  | 'failed_upload'
  | 'credential_lapse'
  | 'client_complaint';

export interface SafetyEvent {
  id: string;
  type: SafetyEventType;
  severity: 'low' | 'medium' | 'high' | 'critical_immediate';
  clientId?: string;
  clientName?: string;
  sessionId?: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reportedByUserRole: UserRole;
  immediateActionTaken: string;
  crisisTeamNotified: boolean;
  resolutionStatus: 'active_investigation' | 'mitigated' | 'resolved' | 'closed';
  resolutionNotes?: string;
  timestamp: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Telehealth Expiring Rooms
// --------------------------------------------------------------------------

export interface TelehealthMeetingRoom {
  roomId: string;
  appointmentId: string;
  clientId: string;
  providerId: string;
  status: 'waiting_room' | 'in_session' | 'ended' | 'expired';
  providerAdmittedClient: boolean;
  clientInWaitingRoom: boolean;
  captionsEnabled: boolean;
  recordingConsentGivenByAll: boolean;
  expiresAt: string;
  createdAt: string;
}

// --------------------------------------------------------------------------
// Billing & Invoices
// --------------------------------------------------------------------------

export interface ClinicalBillingCode {
  code: string;
  description: string;
  standardFee: number;
  rateCharged: number;
  requiresHumanVerification: boolean;
}

export interface ClinicalInvoice {
  id: string;
  invoiceNumber?: string;
  invoiceReference?: string;
  clientId: string;
  clientName: string;
  providerId?: string;
  providerName?: string;
  appointmentId?: string;
  formalReportId?: string;
  serviceName?: string;
  serviceDate?: string;
  sessionDate?: string;
  feeAmount?: number;
  insurancePortion?: number;
  clientResponsibility?: number;
  clientCopayDue?: number;
  totalBilled?: number;
  billingCodes?: ClinicalBillingCode[];
  paymentStatus?: 'pending' | 'pending_payment' | 'paid' | 'paid_in_full' | 'insurance_processing' | 'sliding_scale_adjusted' | 'refunded';
  paymentMethod?: string;
  status?: 'pending' | 'pending_payment' | 'paid' | 'insurance_processing' | 'sliding_scale_adjusted' | 'refunded';
  humanVerifiedStatus?: 'pending_human_verification' | 'pending_human_review' | 'verified_approved' | 'rejected_correction_needed';
  humanVerifiedByStaffId?: string; // AI is forbidden from submitting billing without human verification
  verifiedByStaffId?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  paymentReceiptNumber?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}
