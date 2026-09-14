import {
  ProviderCredential,
  SessionRecording,
  SessionTranscript,
  FormalReport,
  WellnessProgram,
  ProgressCheckIn,
  ClinicalInvoice,
  SafetyEvent,
  TelehealthMeetingRoom,
  ClientOnboardingData,
  InterviewTopicAnswer,
} from '../types/clinical';
import { INTERVIEW_24_TOPICS } from '../data/interviewTemplates';
import { User } from '../types';

const STORAGE_KEYS = {
  CREDENTIALS: 'hcs_clinical_credentials_v1',
  RECORDINGS: 'hcs_clinical_recordings_v1',
  TRANSCRIPTS: 'hcs_clinical_transcripts_v1',
  REPORTS: 'hcs_clinical_reports_v1',
  WELLNESS_PROGRAMS: 'hcs_clinical_wellness_v1',
  PROGRESS_CHECKINS: 'hcs_clinical_checkins_v1',
  INVOICES: 'hcs_clinical_invoices_v1',
  SAFETY_EVENTS: 'hcs_clinical_safety_v1',
  ONBOARDING: 'hcs_clinical_onboarding_v1',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error persisting ${key}:`, err);
  }
}

// Initial default provider credential
const INITIAL_CREDENTIAL: ProviderCredential = {
  id: 'cred-jenkins-01',
  providerId: 'user-staff-1',
  providerName: 'Dr. Sarah Jenkins, LPC',
  licenseType: 'Licensed Professional Counselor (LPC)',
  licenseNumber: 'SC-LPC-84920',
  licensingJurisdiction: 'South Carolina',
  issueDate: '2022-04-15',
  expirationDate: '2027-04-15',
  licensingBoardSource: 'SC Board of Examiners for Licensure of Professional Counselors',
  status: 'active',
  scopeOfPractice: [
    'Individual Counseling',
    'Cognitive Behavioral Therapy (CBT)',
    'Trauma-Informed Behavioral Support',
    'Mindfulness-Based Stress Reduction',
    'Family & Couples Support',
  ],
  authorizedTelehealthJurisdictions: ['South Carolina', 'North Carolina', 'Georgia'],
  liabilityCarrier: 'Healthcare Providers Service Organization (HPSO)',
  liabilityPolicyNumber: 'HPSO-POL-849201',
  liabilityExpirationDate: '2027-05-01',
  backgroundCheckStatus: 'cleared',
  backgroundCheckDate: '2024-01-10',
  mandatoryTrainingCompleted: true,
  isSelfApprovedBlocked: true,
  createdAt: '2023-01-15T09:00:00Z',
  updatedAt: '2024-01-10T10:00:00Z',
};

// Initial realistic report for Eleanor Vance
const INITIAL_REPORT: FormalReport = {
  id: 'rpt-vance-001',
  reportReference: 'HCS-RPT-2026-0814',
  appointmentId: 'apt-001',
  clientId: 'user-client-1',
  clientName: 'Eleanor Vance',
  providerId: 'user-staff-1',
  providerName: 'Dr. Sarah Jenkins, LPC',
  providerCredentials: 'Licensed Professional Counselor (LPC), License #SC-LPC-84920',
  sessionDate: '2026-03-20',
  sessionModality: 'video',
  recordingConsentStatus: 'verified_consented',
  status: 'approved_by_provider',
  executiveSummary: 'Comprehensive clinical interview completed with Eleanor Vance regarding situational anxiety, high work-related distress, sleep disruption, and boundary formulation. Client engaged actively and defined clear self-directed goals.',
  clientReportedGoals: [
    'Establish consistent shutdown ritual for remote work laptop by 18:30',
    'Improve restorative sleep duration from 4-5 hours to 7 hours per night',
    'Learn diaphragmatic breathing techniques for somatic panic relief',
  ],
  presentingConcerns: [
    'Difficulty disconnecting from workplace communications leading to bedtime rumination',
    'Physical sensations of tension and shallow breathing during afternoon meetings',
  ],
  relevantHistory: 'Client reports no past psychiatric hospitalizations. Endorses seasonal surges in workload correlating directly with sleep disturbances.',
  interviewAnswersByCategory: [
    {
      title: 'Presenting Situation & Goals',
      category: 'Focus',
      content: 'Client feels ready to commit to weekly behavioral routine modifications and structured accountability.',
      classification: 'client_reported',
      sourceTimestampReferences: ['00:02:08'],
    },
    {
      title: 'Sleep and Somatic Recovery',
      category: 'Lifestyle',
      content: 'Current pattern features screen use in bed until 01:00. Client voluntarily disclosed taking OTC melatonin 3mg occasionally with limited relief.',
      classification: 'client_reported',
      sourceTimestampReferences: ['00:03:57'],
      requiresConfirmation: true,
    },
    {
      title: 'Support Network',
      category: 'Resilience',
      content: 'Sister Clara provides reliable emotional support. Close friend Maya participates in outdoor morning walks.',
      classification: 'client_reported',
      sourceTimestampReferences: ['00:05:42'],
    },
    {
      title: 'Safety and Safeguarding Screen',
      category: 'Safety',
      content: 'Client explicitly denied suicidal ideation, intent, or plan. Universal screening negative for harm to self or others.',
      classification: 'professional_assessment',
      sourceTimestampReferences: ['00:07:17'],
    }
  ],
  strengthsAndSupportResources: [
    'Excellent emotional insight and articulateness',
    'Strong support network with family and friends',
    'Demonstrated readiness for behavioral change',
  ],
  preferencesAndAccommodations: [
    'Prefers video telehealth sessions in the early morning or evening',
    'Requests structured written summaries and action steps after sessions',
  ],
  challengesAndBarriers: [
    'Over-committing to urgent workplace tasks at the expense of evening relaxation',
    'Physical fatigue in mid-afternoon',
  ],
  providerObservations: 'Client was alert, oriented x4, and well-groomed. Eye contact was steady throughout video consultation. Affect was initially constricted with anxious tone, loosening as coping strengths were mapped.',
  recordedInterventions: [
    'Collaborative formulation of SMART wellness objectives',
    'Autonomic nervous system psychoeducation and diaphragmatic pacing trial',
    'Stimulus control sleep hygiene education (bedroom restricted to rest)',
  ],
  clientEngagementResponse: 'Highly engaged and collaborative. Practiced diaphragmatic pacing in real-time and expressed confidence in trying the evening boundary.',
  safetyOrReferralConsiderations: 'Universal screening completed. No self-harm, suicidal ideation, or homicidal ideation disclosed. No acute crisis intervention required.',
  itemsRequiringConfirmation: [
    'Confirmation of OTC melatonin dosage and frequency (client reported 3mg as needed)',
  ],
  proposedWellnessFocusAreas: [
    'Workplace Boundary Enforcement',
    'Circadian Rhythm Stabilization',
    'Diaphragmatic Breathwork Pacing',
  ],
  agreedNextSteps: [
    'Shut down work laptop by 18:30 on Monday through Thursday this week',
    'Practice 5 minutes of 4-7-8 breathing prior to retiring to bed',
    'Complete weekly check-in via client portal before next appointment',
  ],
  followUpDate: '2026-03-27',
  reviewedByProviderId: 'user-staff-1',
  reviewedByProviderName: 'Dr. Sarah Jenkins, LPC',
  providerSignature: 'Dr. Sarah Jenkins, LPC #SC-LPC-84920',
  providerSignatureTimestamp: '2026-03-20T16:30:00Z',
  clientConfirmed: true,
  clientConfirmedAt: '2026-03-21T09:15:00Z',
  version: 1,
  disclaimer: 'This document represents an AI-assisted draft prepared for mandatory professional review. It does not constitute a diagnostic evaluation or medical prescription. Formal review and signature by the licensed provider are required before clinical finalization.',
  createdAt: '2026-03-20T14:00:00Z',
  updatedAt: '2026-03-21T09:15:00Z',
};

// Initial realistic wellness program
const INITIAL_WELLNESS_PROGRAM: WellnessProgram = {
  id: 'wp-vance-001',
  programReference: 'HCS-WP-2026-0042',
  clientId: 'user-client-1',
  clientName: 'Eleanor Vance',
  providerId: 'user-staff-1',
  providerName: 'Dr. Sarah Jenkins, LPC',
  formalReportId: 'rpt-vance-001',
  status: 'active',
  clientDefinedGoals: 'Establish evening boundary, increase sleep quality, and develop reliable stress reduction habits.',
  baselineSummary: 'Works in bed until 01:00 AM; sleeps 4.5 hours; experiences mid-afternoon anxiety spikes.',
  strengthsSummary: 'High insight, supportive sister Clara, active outdoor walking interest.',
  priorityAreas: [
    'Sleep Hygiene & Restorative Rhythms',
    'Work-Life Boundaries & Assertion',
    'Somatic Autonomic Regulation',
  ],
  goals: [
    {
      id: 'goal-1',
      goal: 'Establish Evening Work Boundary',
      baseline: 'Works in bed until 01:00 AM on 5 of 7 nights',
      target: 'Shut down computer by 18:30 on at least 5 nights weekly',
      action: 'Set automatic calendar alarm at 18:15 and log evening check-in',
      frequency: '5 days per week',
      responsiblePerson: 'client',
      reviewDate: '2026-04-10',
      progressStatus: 'in_progress',
      progressPercentage: 60,
    },
    {
      id: 'goal-2',
      goal: 'Improve Sleep Duration and Regularity',
      baseline: 'Averages 4.5 hours of fragmented sleep',
      target: 'Achieve 7 hours of uninterrupted sleep on at least 5 nights weekly',
      action: 'Implement screen-free 45-minute bedroom wind-down routine with soft reading',
      frequency: 'Daily',
      responsiblePerson: 'client',
      reviewDate: '2026-04-17',
      progressStatus: 'in_progress',
      progressPercentage: 50,
    },
    {
      id: 'goal-3',
      goal: 'Somatic Stress Regulation',
      baseline: 'Experiences panic sensation 2-3 times per week during meetings',
      target: 'Execute diaphragmatic breathing protocol upon first notice of somatic tension',
      action: 'Practice 4-7-8 breathing for 5 minutes twice daily',
      frequency: 'Twice daily',
      responsiblePerson: 'client',
      reviewDate: '2026-04-10',
      progressStatus: 'in_progress',
      progressPercentage: 75,
    },
  ],
  plannedActivities: [
    {
      id: 'act-1',
      title: 'Morning Natural Light Exposure',
      category: 'routine',
      frequency: 'Daily (10 minutes within waking)',
      instructions: 'Step outside or sit by open window to anchor circadian cortisol rhythm.',
      completedThisWeek: true,
    },
    {
      id: 'act-2',
      title: 'Weekend Social Walk',
      category: 'social_connection',
      frequency: '1-2 times weekly',
      instructions: '30-45 minute conversational walk with sister or close peer outdoors.',
      completedThisWeek: true,
    },
    {
      id: 'act-3',
      title: 'Diaphragmatic Pacing Session',
      category: 'mindfulness',
      frequency: 'Daily (Morning and Evening)',
      instructions: 'Inhale through nose for 4 counts, hold for 7, exhale gently for 8 counts. Repeat 4 cycles.',
      completedThisWeek: true,
    },
  ],
  clientResponsibilities: [
    'Complete weekly progress check-in prior to scheduled session',
    'Actively test agreed wind-down routine and note friction points',
  ],
  providerResponsibilities: [
    'Review check-in data and progress indicators prior to each consultation',
    'Collaborate on adjustments based on client feedback',
  ],
  accommodations: ['Telehealth delivery format with flexible evening options'],
  measurableIndicators: [
    'Weekly sleep hours log',
    'Reported self-rating on 1-5 stress scale',
    'Number of workdays with computer powered down by 18:30',
  ],
  checkInSchedule: 'Weekly via secure client portal',
  referralConditions: 'Escalation to medical provider if sleep disruption persists despite behavioral adherence.',
  startDate: '2026-03-20',
  nextReviewDate: '2026-04-20',
  clientAcknowledged: true,
  clientAcknowledgedAt: '2026-03-21T09:15:00Z',
  professionalApproved: true,
  approvedByProviderId: 'user-staff-1',
  approvedByProviderName: 'Dr. Sarah Jenkins, LPC',
  approvedAt: '2026-03-20T16:30:00Z',
  version: 1,
  createdAt: '2026-03-20T15:00:00Z',
  updatedAt: '2026-03-21T09:15:00Z',
};

// Initial progress check-ins
const INITIAL_CHECKINS: ProgressCheckIn[] = [
  {
    id: 'chk-1',
    programId: 'wp-vance-001',
    clientId: 'user-client-1',
    date: '2026-03-23',
    moodRating: 4,
    energyRating: 3,
    stressRating: 2,
    activitiesCompletedCount: 3,
    barriersEncountered: 'Had to answer an urgent client call Tuesday evening at 19:00, but shut down immediately after.',
    clientComments: 'The breathing exercises made a huge difference before my team presentation on Wednesday.',
    recordedBy: 'client',
    createdAt: '2026-03-23T20:00:00Z',
  }
];

// Initial realistic billing records (human clinician verified before submission)
const INITIAL_INVOICES: ClinicalInvoice[] = [
  {
    id: 'inv-vance-001',
    invoiceNumber: 'INV-2026-0042',
    invoiceReference: 'HCS-INV-0042',
    clientId: 'user-client-1',
    clientName: 'Eleanor Vance',
    providerId: 'user-staff-1',
    providerName: 'Dr. Sarah Jenkins, LPC',
    serviceName: 'Comprehensive Clinical Behavioral Assessment',
    serviceDate: '2026-03-20',
    feeAmount: 185.0,
    insurancePortion: 165.0,
    clientResponsibility: 20.0,
    clientCopayDue: 0.0,
    totalBilled: 185.0,
    billingCodes: [
      {
        code: '90791',
        description: 'Psychiatric Diagnostic Evaluation with Medical Services',
        standardFee: 185.0,
        rateCharged: 185.0,
        requiresHumanVerification: true,
      },
    ],
    paymentStatus: 'paid',
    status: 'paid',
    humanVerifiedStatus: 'verified_approved',
    verifiedByStaffId: 'user-staff-1',
    verifiedByStaffName: 'Dr. Sarah Jenkins, LPC',
    paymentReceiptNumber: 'RCP-2026-0089',
    paidAt: '2026-03-20T17:00:00Z',
    createdAt: '2026-03-20T16:45:00Z',
  },
  {
    id: 'inv-vance-002',
    invoiceNumber: 'INV-2026-0058',
    invoiceReference: 'HCS-INV-0058',
    clientId: 'user-client-1',
    clientName: 'Eleanor Vance',
    providerId: 'user-staff-1',
    providerName: 'Dr. Sarah Jenkins, LPC',
    serviceName: 'Individual Psychotherapy & Symptom Modulation (60 min)',
    serviceDate: '2026-03-27',
    feeAmount: 150.0,
    insurancePortion: 130.0,
    clientResponsibility: 20.0,
    clientCopayDue: 20.0,
    totalBilled: 150.0,
    billingCodes: [
      {
        code: '90837',
        description: 'Psychotherapy, 60 minutes with patient',
        standardFee: 150.0,
        rateCharged: 150.0,
        requiresHumanVerification: true,
      },
    ],
    paymentStatus: 'insurance_processing',
    status: 'insurance_processing',
    humanVerifiedStatus: 'verified_approved',
    verifiedByStaffId: 'user-staff-1',
    verifiedByStaffName: 'Dr. Sarah Jenkins, LPC',
    createdAt: '2026-03-27T15:30:00Z',
  },
];

// Initial realistic safety logs
const INITIAL_SAFETY_EVENTS: SafetyEvent[] = [
  {
    id: 'safe-2026-0012',
    type: 'immediate_safety_concern',
    severity: 'medium',
    clientId: 'user-client-1',
    clientName: 'Eleanor Vance',
    reportedByUserId: 'user-staff-1',
    reportedByUserName: 'Dr. Sarah Jenkins, LPC',
    reportedByUserRole: 'provider',
    immediateActionTaken: 'Safety screener reviewed during session. Client denied active intent/plan. Safety Plan formulated and copy provided to emergency contact.',
    crisisTeamNotified: false,
    resolutionStatus: 'mitigated',
    resolutionNotes: 'Client confirmed stable mood with coping plan in place. Re-evaluated at subsequent session with lower anxiety score.',
    timestamp: '2026-03-20T16:15:00Z',
    updatedAt: '2026-03-21T10:00:00Z',
  },
];

class ClinicalStore {
  private static instance: ClinicalStore;
  private listeners: Set<() => void> = new Set();

  private credentials: ProviderCredential[] = getLocal(STORAGE_KEYS.CREDENTIALS, [INITIAL_CREDENTIAL]);
  private reports: FormalReport[] = getLocal(STORAGE_KEYS.REPORTS, [INITIAL_REPORT]);
  private wellnessPrograms: WellnessProgram[] = getLocal(STORAGE_KEYS.WELLNESS_PROGRAMS, [INITIAL_WELLNESS_PROGRAM]);
  private checkIns: ProgressCheckIn[] = getLocal(STORAGE_KEYS.PROGRESS_CHECKINS, INITIAL_CHECKINS);
  private invoices: ClinicalInvoice[] = getLocal(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  private safetyEvents: SafetyEvent[] = getLocal(STORAGE_KEYS.SAFETY_EVENTS, INITIAL_SAFETY_EVENTS);
  private onboardingData: Record<string, ClientOnboardingData> = getLocal(STORAGE_KEYS.ONBOARDING, {});

  public static getInstance(): ClinicalStore {
    if (!ClinicalStore.instance) {
      ClinicalStore.instance = new ClinicalStore();
    }
    return ClinicalStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // ------------------------------------------------------------------------
  // Credentials
  // ------------------------------------------------------------------------
  public getCredential(providerId: string): ProviderCredential | undefined {
    return this.credentials.find(c => c.providerId === providerId);
  }

  public getAllCredentials(): ProviderCredential[] {
    return [...this.credentials];
  }

  public saveCredential(cred: ProviderCredential): void {
    const idx = this.credentials.findIndex(c => c.providerId === cred.providerId);
    if (idx >= 0) {
      this.credentials[idx] = cred;
    } else {
      this.credentials.push(cred);
    }
    setLocal(STORAGE_KEYS.CREDENTIALS, this.credentials);
    this.notify();
  }

  // ------------------------------------------------------------------------
  // Reports
  // ------------------------------------------------------------------------
  public getReports(currentUser: User | null): FormalReport[] {
    if (!currentUser) return [];
    if (currentUser.role === 'client') {
      // Client isolation: only client's reports that are NOT in raw draft
      return this.reports.filter(r => r.clientId === currentUser.id && r.status !== 'draft_generated');
    }
    // Staff / providers / admins
    return [...this.reports];
  }

  public getReportById(id: string, currentUser: User | null): FormalReport | undefined {
    const report = this.reports.find(r => r.id === id);
    if (!report) return undefined;
    if (currentUser?.role === 'client') {
      if (report.clientId !== currentUser.id || report.status === 'draft_generated') {
        return undefined; // Restrict client from seeing other client or raw drafts
      }
    }
    return report;
  }

  public saveReport(report: FormalReport): void {
    const idx = this.reports.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      this.reports[idx] = report;
    } else {
      this.reports.unshift(report);
    }
    setLocal(STORAGE_KEYS.REPORTS, this.reports);
    this.notify();
  }

  // ------------------------------------------------------------------------
  // Wellness Programs
  // ------------------------------------------------------------------------
  public getWellnessPrograms(currentUser: User | null): WellnessProgram[] {
    if (!currentUser) return [];
    if (currentUser.role === 'client') {
      return this.wellnessPrograms.filter(p => p.clientId === currentUser.id);
    }
    return [...this.wellnessPrograms];
  }

  public saveWellnessProgram(prog: WellnessProgram): void {
    const idx = this.wellnessPrograms.findIndex(p => p.id === prog.id);
    if (idx >= 0) {
      this.wellnessPrograms[idx] = prog;
    } else {
      this.wellnessPrograms.unshift(prog);
    }
    setLocal(STORAGE_KEYS.WELLNESS_PROGRAMS, this.wellnessPrograms);
    this.notify();
  }

  // ------------------------------------------------------------------------
  // Progress Check-ins
  // ------------------------------------------------------------------------
  public getCheckIns(programId: string): ProgressCheckIn[] {
    return this.checkIns.filter(c => c.programId === programId);
  }

  public addCheckIn(checkIn: ProgressCheckIn): void {
    this.checkIns.unshift(checkIn);
    setLocal(STORAGE_KEYS.PROGRESS_CHECKINS, this.checkIns);
    this.notify();
  }

  // ------------------------------------------------------------------------
  // Onboarding
  // ------------------------------------------------------------------------
  public getOnboarding(clientId: string): ClientOnboardingData | undefined {
    return this.onboardingData[clientId];
  }

  public saveOnboarding(data: ClientOnboardingData): void {
    this.onboardingData[data.clientId] = data;
    setLocal(STORAGE_KEYS.ONBOARDING, this.onboardingData);
    this.notify();
  }

  // ------------------------------------------------------------------------
  // Safety Events
  // ------------------------------------------------------------------------
  public getSafetyEvents(): SafetyEvent[] {
    return [...this.safetyEvents];
  }

  public addSafetyEvent(event: SafetyEvent): void {
    this.safetyEvents.unshift(event);
    setLocal(STORAGE_KEYS.SAFETY_EVENTS, this.safetyEvents);
    this.notify();
  }

  public updateSafetyEvent(id: string, resolutionStatus: SafetyEvent['resolutionStatus'], notes?: string): void {
    const idx = this.safetyEvents.findIndex(e => e.id === id);
    if (idx >= 0) {
      this.safetyEvents[idx] = {
        ...this.safetyEvents[idx],
        resolutionStatus,
        resolutionNotes: notes || this.safetyEvents[idx].resolutionNotes,
        updatedAt: new Date().toISOString(),
      };
      setLocal(STORAGE_KEYS.SAFETY_EVENTS, this.safetyEvents);
      this.notify();
    }
  }

  // ------------------------------------------------------------------------
  // Invoices
  // ------------------------------------------------------------------------
  public getInvoices(currentUser: User | null): ClinicalInvoice[] {
    if (!currentUser) return [];
    if (currentUser.role === 'client') {
      return this.invoices.filter(i => i.clientId === currentUser.id);
    }
    return [...this.invoices];
  }

  public addInvoice(inv: ClinicalInvoice): void {
    this.invoices.unshift(inv);
    setLocal(STORAGE_KEYS.INVOICES, this.invoices);
    this.notify();
  }
}

export const clinicalStore = ClinicalStore.getInstance();
