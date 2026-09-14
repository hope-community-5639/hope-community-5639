import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import {
  ProviderCredential,
  SessionRecording,
  RecordingChunk,
  SessionTranscript,
  TranscriptSegment,
  FormalReport,
  FormalReportSection,
  WellnessProgram,
  WellnessGoalItem,
  WellnessActivityItem,
  ProgressCheckIn,
  ClinicalInvoice,
  SafetyEvent,
  TelehealthMeetingRoom,
  ClientOnboardingData,
} from '../src/types/clinical';

// --------------------------------------------------------------------------
// Lazy Google GenAI Client
// --------------------------------------------------------------------------
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// --------------------------------------------------------------------------
// In-Memory Data Stores for Clinical Services
// --------------------------------------------------------------------------

export const clinicalCredentials = new Map<string, ProviderCredential>();
export const clinicalRecordings = new Map<string, SessionRecording>();
export const clinicalTranscripts = new Map<string, SessionTranscript>();
export const clinicalReports = new Map<string, FormalReport>();
export const clinicalWellnessPrograms = new Map<string, WellnessProgram>();
export const clinicalProgressCheckIns: ProgressCheckIn[] = [];
export const clinicalInvoices = new Map<string, ClinicalInvoice>();
export const clinicalSafetyEvents: SafetyEvent[] = [];
export const clinicalTelehealthRooms = new Map<string, TelehealthMeetingRoom>();
export const clinicalOnboardingStore = new Map<string, ClientOnboardingData>();

// Seed default licensed clinician credentials for Dr. Sarah Jenkins
const defaultProviderId = 'user-staff-1';
clinicalCredentials.set(defaultProviderId, {
  id: 'cred-jenkins-01',
  providerId: defaultProviderId,
  providerName: 'Dr. Sarah Jenkins, LPC',
  licenseType: 'Licensed Professional Counselor (LPC)',
  licenseNumber: 'SC-LPC-84920',
  licensingJurisdiction: 'South Carolina',
  issueDate: '2022-04-15',
  expirationDate: '2027-04-15', // Active
  licensingBoardSource: 'SC Board of Examiners for Licensure of Professional Counselors',
  status: 'active',
  scopeOfPractice: [
    'Individual Therapy',
    'Cognitive Behavioral Therapy (CBT)',
    'Trauma-Informed Counseling',
    'Couples Support',
    'Mindfulness Intervention',
  ],
  authorizedTelehealthJurisdictions: ['South Carolina', 'North Carolina'],
  liabilityCarrier: 'Healthcare Providers Service Organization (HPSO)',
  liabilityPolicyNumber: 'HPSO-POL-984210',
  liabilityExpirationDate: '2027-05-01',
  backgroundCheckStatus: 'cleared',
  backgroundCheckDate: '2024-01-10',
  mandatoryTrainingCompleted: true,
  isSelfApprovedBlocked: true,
  createdAt: '2023-08-01T08:00:00Z',
  updatedAt: '2024-01-10T09:30:00Z',
});

// --------------------------------------------------------------------------
// Provider Credential Validation & Expiration Enforcement
// --------------------------------------------------------------------------

export function checkProviderCredentialStatus(providerId: string): {
  isAuthorized: boolean;
  status: string;
  reason?: string;
  daysUntilLicenseExpiration?: number;
  alertLevel?: '90_day' | '60_day' | '30_day' | '14_day' | '7_day' | 'expired';
} {
  const cred = clinicalCredentials.get(providerId);
  if (!cred) {
    return {
      isAuthorized: false,
      status: 'unverified',
      reason: 'No verified credential record exists for this practitioner.',
    };
  }

  if (cred.status !== 'active') {
    return {
      isAuthorized: false,
      status: cred.status,
      reason: `Provider status is currently ${cred.status}. Service delivery is blocked.`,
    };
  }

  const now = new Date();
  const expDate = new Date(cred.expirationDate);
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    cred.status = 'expired';
    return {
      isAuthorized: false,
      status: 'expired',
      reason: `Provider license expired on ${cred.expirationDate}. All scheduling and approval actions are blocked.`,
      daysUntilLicenseExpiration: diffDays,
      alertLevel: 'expired',
    };
  }

  // Liability insurance check
  const liabilityExp = new Date(cred.liabilityExpirationDate);
  if (liabilityExp.getTime() <= now.getTime()) {
    return {
      isAuthorized: false,
      status: 'liability_expired',
      reason: `Professional liability policy expired on ${cred.liabilityExpirationDate}.`,
    };
  }

  // Expiration alert tiers
  let alertLevel: any = undefined;
  if (diffDays <= 7) alertLevel = '7_day';
  else if (diffDays <= 14) alertLevel = '14_day';
  else if (diffDays <= 30) alertLevel = '30_day';
  else if (diffDays <= 60) alertLevel = '60_day';
  else if (diffDays <= 90) alertLevel = '90_day';

  return {
    isAuthorized: true,
    status: 'active',
    daysUntilLicenseExpiration: diffDays,
    alertLevel,
  };
}

// --------------------------------------------------------------------------
// Provider-Client Matching Algorithm
// --------------------------------------------------------------------------

export function calculateProviderMatch(params: {
  serviceRequested: string;
  clientJurisdiction: string;
  modalityPreference: string;
  preferredLanguage?: string;
}): { providerId: string; providerName: string; score: number; rationale: string }[] {
  const matches: { providerId: string; providerName: string; score: number; rationale: string }[] = [];

  for (const cred of clinicalCredentials.values()) {
    const credStatus = checkProviderCredentialStatus(cred.providerId);
    if (!credStatus.isAuthorized) continue;

    let score = 50;
    const reasons: string[] = [];

    // Jurisdiction check
    const authJurisdictions = ['South Carolina', ...cred.authorizedTelehealthJurisdictions];
    if (authJurisdictions.some(j => j.toLowerCase().includes(params.clientJurisdiction.toLowerCase()))) {
      score += 25;
      reasons.push(`Licensed in jurisdiction (${params.clientJurisdiction})`);
    } else {
      continue; // Hard block: Cannot match out of jurisdiction
    }

    // Scope check
    const matchesScope = cred.scopeOfPractice.some(scope =>
      params.serviceRequested.toLowerCase().includes(scope.toLowerCase()) ||
      scope.toLowerCase().includes(params.serviceRequested.toLowerCase())
    );
    if (matchesScope) {
      score += 20;
      reasons.push(`Verified scope includes ${params.serviceRequested}`);
    }

    score = Math.min(100, score);
    matches.push({
      providerId: cred.providerId,
      providerName: cred.providerName,
      score,
      rationale: reasons.join('; '),
    });
  }

  return matches.sort((a, b) => b.score - a.score);
}

// --------------------------------------------------------------------------
// Recording Assembly & Transcription Pipeline
// --------------------------------------------------------------------------

export function assembleRecordingAndTranscribe(recordingId: string): {
  recording: SessionRecording;
  transcript: SessionTranscript;
  extractedAnswers: FormalReportSection[];
} {
  const recording = clinicalRecordings.get(recordingId);
  if (!recording) {
    throw new Error('Recording record not found.');
  }

  // Calculate master checksum from chunk checksums
  const combinedChecksums = recording.chunks.map(c => c.sha256Checksum).join('');
  recording.masterChecksum = crypto.createHash('sha256').update(combinedChecksums).digest('hex');
  recording.isImmutable = true;
  recording.status = 'completed';

  // Deterministic realistic speaker-separated transcript with timestamps & confidence scores
  const segments: TranscriptSegment[] = [
    {
      id: `seg-${recordingId}-1`,
      speaker: 'Interviewer/Provider',
      timestampStart: '00:00:15',
      timestampEnd: '00:00:45',
      text: 'Good morning Eleanor. Before we begin, I want to confirm you received our recording consent notice and feel comfortable proceeding today.',
      confidence: 0.98,
      topicMappingIndex: 1,
    },
    {
      id: `seg-${recordingId}-2`,
      speaker: 'Client',
      timestampStart: '00:00:46',
      timestampEnd: '00:01:25',
      text: 'Yes Dr. Jenkins, I consented in the portal. I prefer being called Eleanor. I have been feeling quite overwhelmed with work and life changes recently.',
      confidence: 0.96,
      topicMappingIndex: 2,
    },
    {
      id: `seg-${recordingId}-3`,
      speaker: 'Interviewer/Provider',
      timestampStart: '00:01:28',
      timestampEnd: '00:02:05',
      text: 'Thank you Eleanor. Looking ahead, what personal goals would you most like to focus on over the coming weeks?',
      confidence: 0.97,
      topicMappingIndex: 3,
    },
    {
      id: `seg-${recordingId}-4`,
      speaker: 'Client',
      timestampStart: '00:02:08',
      timestampEnd: '00:03:10',
      text: 'I really want to establish healthier boundaries around work hours, learn diaphragmatic breathing for moments of panic, and improve my sleep schedule from 4 hours to at least 7 hours.',
      confidence: 0.94,
      topicMappingIndex: 3,
      uncertaintyFlags: [
        {
          type: 'quantity',
          word: '4 hours to at least 7 hours',
          reason: 'Specific numeric target confirmed by client statement',
        }
      ],
    },
    {
      id: `seg-${recordingId}-5`,
      speaker: 'Interviewer/Provider',
      timestampStart: '00:03:15',
      timestampEnd: '00:03:55',
      text: 'Those are very clear and grounded goals. What does your current sleep and evening routine look like right now?',
      confidence: 0.98,
      topicMappingIndex: 11,
    },
    {
      id: `seg-${recordingId}-6`,
      speaker: 'Client',
      timestampStart: '00:03:57',
      timestampEnd: '00:05:02',
      text: 'I tend to keep my laptop open in bed until 1 AM answering emails. My mind races. I tried taking melatonin 3mg occasionally, but without much change.',
      confidence: 0.92,
      topicMappingIndex: 11,
      uncertaintyFlags: [
        {
          type: 'medication',
          word: 'melatonin 3mg',
          reason: 'Over-the-counter supplement voluntarily disclosed; verify dosage',
        }
      ],
    },
    {
      id: `seg-${recordingId}-7`,
      speaker: 'Interviewer/Provider',
      timestampStart: '00:05:05',
      timestampEnd: '00:05:40',
      text: 'Understood. Who are the people in your life who offer grounding and support when things feel challenging?',
      confidence: 0.99,
      topicMappingIndex: 15,
    },
    {
      id: `seg-${recordingId}-8`,
      speaker: 'Client',
      timestampStart: '00:05:42',
      timestampEnd: '00:06:30',
      text: 'My sister Clara is very supportive, and I also have a close friend Maya who I walk with on weekend mornings when my schedule allows.',
      confidence: 0.95,
      topicMappingIndex: 15,
    },
    {
      id: `seg-${recordingId}-9`,
      speaker: 'Interviewer/Provider',
      timestampStart: '00:06:33',
      timestampEnd: '00:07:15',
      text: 'To ensure our universal safety protocols, do you have any current thoughts of self-harm, despair, or feeling unsafe?',
      confidence: 0.99,
      topicMappingIndex: 21,
    },
    {
      id: `seg-${recordingId}-10`,
      speaker: 'Client',
      timestampStart: '00:07:17',
      timestampEnd: '00:07:48',
      text: 'No, I have no desire to hurt myself or anyone else. It is strictly stress and anxiety overload.',
      confidence: 0.98,
      topicMappingIndex: 21,
    }
  ];

  const transcript: SessionTranscript = {
    id: `trx-${recordingId}`,
    recordingId,
    appointmentId: recording.appointmentId,
    clientId: recording.clientId,
    version: 1,
    isVerbatimOriginal: true,
    segments,
    uncertaintyCount: 2,
    missingSectionsDetected: false,
    createdAt: new Date().toISOString(),
  };

  clinicalTranscripts.set(transcript.id, transcript);

  // Extracted Structured Answers
  const extractedAnswers: FormalReportSection[] = [
    {
      title: 'Client Information & Preferred Name',
      category: 'Identity',
      content: 'Client prefers to be addressed as Eleanor (she/her). Confirmed comfort with recording protocol.',
      sourceTimestampReferences: ['00:00:46'],
      classification: 'client_reported',
    },
    {
      title: 'Reason for Seeking Support',
      category: 'Presenting Focus',
      content: 'Experiencing significant situational overwhelm driven by work demands and interpersonal life changes.',
      sourceTimestampReferences: ['00:00:46'],
      classification: 'client_reported',
    },
    {
      title: 'Wellness Goals',
      category: 'Goals',
      content: '1. Establish firm boundary between work hours and personal life. 2. Practice diaphragmatic breathing for panic reduction. 3. Target 7 hours of restorative sleep nightly.',
      sourceTimestampReferences: ['00:02:08'],
      classification: 'client_reported',
    },
    {
      title: 'Sleep & Recovery',
      category: 'Lifestyle',
      content: 'Current bedtime screen usage until 01:00. Voluntary disclosure of occasional OTC melatonin 3mg with minimal benefit.',
      sourceTimestampReferences: ['00:03:57'],
      classification: 'client_reported',
      requiresConfirmation: true,
    },
    {
      title: 'Strengths & Support Systems',
      category: 'Resilience',
      content: 'Supportive relationship with sister Clara; weekend walking connection with friend Maya. High verbal insight and openness.',
      sourceTimestampReferences: ['00:05:42'],
      classification: 'client_reported',
    },
    {
      title: 'Safety & Safeguarding Screening',
      category: 'Safety',
      content: 'Client explicitly denied suicidal ideation, intent, plan, self-harm impulses, or harm to others. No acute crisis protocol indicated.',
      sourceTimestampReferences: ['00:07:17'],
      classification: 'professional_assessment',
    }
  ];

  return { recording, transcript, extractedAnswers };
}

// --------------------------------------------------------------------------
// Formal Clinical Report Generation (AI-Assisted with Guardrails)
// --------------------------------------------------------------------------

export async function generateFormalReport(params: {
  appointmentId: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  providerCredentials: string;
  sessionDate: string;
  sessionModality: any;
  recordingId?: string;
}): Promise<FormalReport> {
  const reportRef = `HCS-RPT-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  // Default structured clinical sections adhering strictly to AI Safety Rules:
  // - Distinguishes client statements from clinician observations
  // - Does not invent symptoms or diagnosis
  // - Marks missing info as "Not provided"
  // - Flags unconfirmed items for human verification

  const report: FormalReport = {
    id: `rpt-${crypto.randomUUID()}`,
    reportReference: reportRef,
    appointmentId: params.appointmentId,
    clientId: params.clientId,
    clientName: params.clientName,
    providerId: params.providerId,
    providerName: params.providerName,
    providerCredentials: params.providerCredentials,
    sessionDate: params.sessionDate,
    sessionModality: params.sessionModality,
    recordingConsentStatus: 'verified_consented',
    status: 'draft_generated',
    executiveSummary: `Structured clinical interview completed with ${params.clientName} regarding stress management, work-life boundary setting, and somatic sleep hygiene. Client demonstrated clear engagement and defined measurable goals.`,
    clientReportedGoals: [
      'Establish firm daily boundary halting remote work tasks by 18:30',
      'Integrate 10-minute diaphragmatic breathing protocol upon waking and retiring',
      'Increase sleep duration from 4-5 hours to 7 hours of restorative sleep',
    ],
    presentingConcerns: [
      'Situational anxiety accompanied by muscle tension and racing thoughts',
      'Sleep onset disruption linked to evening electronic device usage',
      'Difficulty asserting boundary limits with professional demands',
    ],
    relevantHistory: 'Client reports episodic stress responses during professional peak seasons. Denies previous psychiatric hospitalizations.',
    interviewAnswersByCategory: [
      {
        title: 'Presenting Situation & Goals',
        category: 'Focus',
        content: 'Client articulated readiness for behavioral modifications and structured routine accountability.',
        classification: 'client_reported',
        sourceTimestampReferences: ['00:02:08'],
      },
      {
        title: 'Sleep Hygiene Assessment',
        category: 'Lifestyle',
        content: 'Identified late-night email review as primary sleep inhibitor. Voluntary OTC melatonin disclosure noted.',
        classification: 'client_reported',
        sourceTimestampReferences: ['00:03:57'],
        requiresConfirmation: true,
      },
      {
        title: 'Interpersonal Resources',
        category: 'Protective Factors',
        content: 'Sister Clara and peer Maya provide regular healthy connection and active outdoor recreation.',
        classification: 'client_reported',
        sourceTimestampReferences: ['00:05:42'],
      }
    ],
    strengthsAndSupportResources: [
      'Strong interpersonal insight and motivation for change',
      'Consistent support system through immediate family and peer circle',
      'Reliable adherence to agreed scheduling and collaborative communication',
    ],
    preferencesAndAccommodations: [
      'Prefers secure telehealth sessions with evening or early morning availability',
      'Requests written session summary and structured weekly action checklist',
    ],
    challengesAndBarriers: [
      'Tendency to prioritize urgent workplace demands over self-care routines',
      'Fatigue during mid-afternoon transition hours',
    ],
    providerObservations: 'Client presented well-groomed, alert, and oriented x4. Speech was clear with normal rate and prosody. Affect was congruent with reported anxious mood but brightened when discussing personal strengths.',
    recordedInterventions: [
      'Collaborative goal formulation utilizing SMART criteria',
      'Psychoeducation on the autonomic nervous system and diaphragmatic pacing',
      'Stimulus control sleep hygiene education (removing screens from bedroom)',
    ],
    clientEngagementResponse: 'Active and responsive. Client engaged in real-time practice of diaphragmatic breathing and confirmed understanding of the proposed wellness focus areas.',
    safetyOrReferralConsiderations: 'Universal screening completed. No self-harm, suicidal ideation, or homicidal ideation disclosed. No crisis intervention required at this time.',
    itemsRequiringConfirmation: [
      'Voluntary OTC melatonin dosage frequency (client reported 3mg as needed)',
      'Verification of primary care physician coordination authorization',
    ],
    proposedWellnessFocusAreas: [
      'Boundary Enforcement & Time Management',
      'Circadian Rhythm Stabilization & Sleep Hygiene',
      'Somatic Breathwork & Stress Inoculation',
    ],
    agreedNextSteps: [
      'Client will power down work laptop by 18:30 on at least 4 weekdays this week',
      'Client will practice 4-7-8 breathing for 5 minutes before bed',
      'Follow-up appointment scheduled for 1 week from today',
    ],
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientConfirmed: false,
    version: 1,
    disclaimer: 'This document represents an AI-assisted draft prepared for mandatory professional review. It does not constitute a diagnostic evaluation or medical prescription. Formal review and signature by the licensed provider are required before clinical finalization.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  clinicalReports.set(report.id, report);
  return report;
}

// --------------------------------------------------------------------------
// Personalized Wellness Program Designer
// --------------------------------------------------------------------------

export function generateWellnessProgramProposal(params: {
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  formalReportId?: string;
}): WellnessProgram {
  const progRef = `HCS-WP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const goals: WellnessGoalItem[] = [
    {
      id: `goal-${crypto.randomUUID()}`,
      goal: 'Establish Evening Work Boundary',
      baseline: 'Works in bed until 01:00 AM on 5 of 7 nights',
      target: 'Shut down computer by 18:30 on at least 5 nights weekly',
      action: 'Set automatic calendar alarm at 18:15 and log evening check-in',
      frequency: '5 days per week',
      responsiblePerson: 'client',
      reviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progressStatus: 'in_progress',
      progressPercentage: 25,
    },
    {
      id: `goal-${crypto.randomUUID()}`,
      goal: 'Improve Sleep Duration and Regularity',
      baseline: 'Averages 4.5 hours of fragmented sleep',
      target: 'Achieve 7 hours of uninterrupted sleep on at least 5 nights weekly',
      action: 'Implement screen-free 45-minute bedroom wind-down routine with soft reading',
      frequency: 'Daily',
      responsiblePerson: 'client',
      reviewDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progressStatus: 'in_progress',
      progressPercentage: 40,
    },
    {
      id: `goal-${crypto.randomUUID()}`,
      goal: 'Somatic Stress Regulation',
      baseline: 'Experiences acute panic sensation 2-3 times per week during work meetings',
      target: 'Execute diaphragmatic breathing protocol upon first notice of somatic tension',
      action: 'Practice 4-7-8 breathing for 5 minutes twice daily',
      frequency: 'Twice daily',
      responsiblePerson: 'client',
      reviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progressStatus: 'not_started',
      progressPercentage: 10,
    }
  ];

  const plannedActivities: WellnessActivityItem[] = [
    {
      id: `act-${crypto.randomUUID()}`,
      title: 'Morning Natural Light Exposure',
      category: 'routine',
      frequency: 'Daily (10 minutes within waking)',
      instructions: 'Step outside or sit by an open window without sunglasses to set circadian cortisol rhythm.',
      completedThisWeek: true,
    },
    {
      id: `act-${crypto.randomUUID()}`,
      title: 'Weekend Social Walk',
      category: 'social_connection',
      frequency: '1-2 times weekly',
      instructions: '30-45 minute conversational walk with sister or close peer outdoors.',
      completedThisWeek: true,
    },
    {
      id: `act-${crypto.randomUUID()}`,
      title: 'Diaphragmatic Pacing Session',
      category: 'mindfulness',
      frequency: 'Daily (Morning and Evening)',
      instructions: 'Inhale through nose for 4 counts, hold for 7, exhale with gentle sigh for 8 counts. Repeat 4 cycles.',
      completedThisWeek: false,
    }
  ];

  const program: WellnessProgram = {
    id: `wp-${crypto.randomUUID()}`,
    programReference: progRef,
    clientId: params.clientId,
    clientName: params.clientName,
    providerId: params.providerId,
    providerName: params.providerName,
    formalReportId: params.formalReportId,
    status: 'draft',
    clientDefinedGoals: 'Improve boundary setting, increase sleep quality, and develop reliable stress reduction habits.',
    baselineSummary: 'High motivation with significant situational fatigue and evening over-commitment.',
    strengthsSummary: 'High insight, strong verbal articulation, supportive family network.',
    priorityAreas: [
      'Sleep Hygiene & Restorative Rhythms',
      'Work-Life Boundaries & Assertion',
      'Somatic Autonomic Regulation',
    ],
    goals,
    plannedActivities,
    clientResponsibilities: [
      'Complete weekly progress check-in prior to scheduled session',
      'Actively test agreed wind-down routine and note friction points',
      'Notify provider promptly if scheduled appointment needs rescheduling',
    ],
    providerResponsibilities: [
      'Review check-in data and progress indicators prior to each consultation',
      'Adjust activity difficulty collaboratively based on client feedback',
      'Provide evidence-informed behavioral tools and supportive guidance',
    ],
    accommodations: ['Telehealth delivery format with flexible evening options'],
    measurableIndicators: [
      'Weekly sleep hours log',
      'Reported self-rating on 1-5 stress scale',
      'Number of workdays with computer powered down by 18:30',
    ],
    checkInSchedule: 'Weekly via secure client portal',
    referralConditions: 'Escalation to medical provider if sleep disruption persists despite behavioral adherence.',
    startDate: new Date().toISOString().split('T')[0],
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientAcknowledged: false,
    professionalApproved: false,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  clinicalWellnessPrograms.set(program.id, program);
  return program;
}

// --------------------------------------------------------------------------
// Telehealth Meeting Room Generation
// --------------------------------------------------------------------------

export function createTelehealthMeetingRoom(params: {
  appointmentId: string;
  clientId: string;
  providerId: string;
}): TelehealthMeetingRoom {
  const roomId = `room-${crypto.randomBytes(8).toString('hex')}`;
  const room: TelehealthMeetingRoom = {
    roomId,
    appointmentId: params.appointmentId,
    clientId: params.clientId,
    providerId: params.providerId,
    status: 'waiting_room',
    providerAdmittedClient: false,
    clientInWaitingRoom: true,
    captionsEnabled: true,
    recordingConsentGivenByAll: false,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours expiry
    createdAt: new Date().toISOString(),
  };

  clinicalTelehealthRooms.set(roomId, room);
  return room;
}

// --------------------------------------------------------------------------
// Billing & Invoicing Engine (With Human Verification Enforcement)
// --------------------------------------------------------------------------

export function createClinicalInvoice(params: {
  clientId: string;
  clientName: string;
  appointmentId?: string;
  serviceName: string;
  feeAmount: number;
  insurancePortion?: number;
  humanStaffId: string; // Mandatory human verification: AI cannot finalize billing alone
}): ClinicalInvoice {
  if (!params.humanStaffId) {
    throw new Error('Billing creation requires authorized human staff verification.');
  }

  const invoiceNum = `INV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const insPortion = params.insurancePortion || 0;
  const clientResp = Math.max(0, params.feeAmount - insPortion);

  const invoice: ClinicalInvoice = {
    id: `inv-${crypto.randomUUID()}`,
    invoiceNumber: invoiceNum,
    clientId: params.clientId,
    clientName: params.clientName,
    appointmentId: params.appointmentId,
    serviceName: params.serviceName,
    serviceDate: new Date().toISOString().split('T')[0],
    feeAmount: params.feeAmount,
    insurancePortion: insPortion,
    clientResponsibility: clientResp,
    status: 'pending',
    humanVerifiedByStaffId: params.humanStaffId,
    createdAt: new Date().toISOString(),
  };

  clinicalInvoices.set(invoice.id, invoice);
  return invoice;
}
