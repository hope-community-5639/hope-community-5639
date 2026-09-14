import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building,
  Home,
  FileText,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  Shield,
  Phone,
  Activity,
  Receipt,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  Wifi,
  UserCheck,
} from 'lucide-react';
import { User, Appointment, IntakeSubmission, ClientDocument, CarePlan } from '../../../types';
import { ClinicalInvoice } from '../../../types/clinical';
import { StatusBadge } from '../../common/StatusBadge';
import { CalendarExport } from '../../common/CalendarExport';

interface ClientOverviewViewProps {
  currentUser: User | null;
  nextAppointment?: Appointment;
  intake?: IntakeSubmission;
  carePlan?: CarePlan;
  documents: ClientDocument[];
  invoices: ClinicalInvoice[];
  unreadMessagesCount: number;
  onNavigateTab: (tabId: string) => void;
  onRequestBooking: () => void;
  onOpenConnectionTest: () => void;
  onJoinTelehealth: (apt: Appointment) => void;
}

export const ClientOverviewView: React.FC<ClientOverviewViewProps> = ({
  currentUser,
  nextAppointment,
  intake,
  carePlan,
  documents,
  invoices,
  unreadMessagesCount,
  onNavigateTab,
  onRequestBooking,
  onOpenConnectionTest,
  onJoinTelehealth,
}) => {
  const isIntakeApproved = intake?.status === 'approved';
  const pendingInvoices = invoices.filter(
    (i) => (i.status || i.paymentStatus) === 'pending' || i.paymentStatus === 'pending_payment'
  );
  const pendingBalance = pendingInvoices.reduce(
    (acc, curr) =>
      acc + ((curr as any).clientPortion ?? curr.clientResponsibility ?? curr.clientCopayDue ?? 0),
    0
  );

  // Generate genuine action items
  const actionItems: {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium';
    actionLabel: string;
    targetTab: string;
  }[] = [];

  if (!isIntakeApproved) {
    actionItems.push({
      id: 'act-intake',
      title: 'Complete 10-Step Intake & Health Assessment',
      description: 'Your clinical onboarding questionnaire requires completion or final signature before your first session.',
      priority: 'high',
      actionLabel: 'Complete Intake',
      targetTab: 'onboarding',
    });
  }

  if (pendingBalance > 0) {
    actionItems.push({
      id: 'act-billing',
      title: `Outstanding Co-Pay Balance: $${pendingBalance.toFixed(2)}`,
      description: 'One or more recent clinical session statements have an open client responsibility balance.',
      priority: 'medium',
      actionLabel: 'Review Statements',
      targetTab: 'billing',
    });
  }

  // Weekly check-in recommendation
  actionItems.push({
    id: 'act-checkin',
    title: 'Weekly Wellness Check-In Available',
    description: 'Track your current sleep, stress levels, and coping skill practice for Dr. Jenkins to review.',
    priority: 'medium',
    actionLabel: 'Log Check-In',
    targetTab: 'checkins',
  });

  return (
    <div className="space-y-8">
      {/* 1. WELCOME AREA */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#216761]/10 text-[#216761]">
                {currentUser?.role === 'parent_guardian' ? 'Parent / Legal Guardian Portal' : 'Active Client Portal'}
              </span>
              <span className="text-xs font-mono text-[#5F6F6B] bg-[#F8F5EE] border border-[#D9E1DC] px-2 py-0.5 rounded">
                ID: {currentUser?.id || 'client-001'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Active Care Plan
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Welcome back, {currentUser?.firstName || 'Valued Client'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Care Coordinator: <strong className="text-[#17312E]">Dr. Sarah Jenkins (Ph.D., LPC)</strong> • Clinic: Downtown Rock Hill Suite 200 • Confidential & Encrypted
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onRequestBooking}
              className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#C6A66B]" />
              <span>Request Appointment</span>
            </button>
            <button
              onClick={() => onNavigateTab('messages')}
              className="px-4 py-2.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] text-[#173F3A] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#216761]" />
              <span>Message Care Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. NEXT APPOINTMENT CARD */}
      {nextAppointment ? (
        <div className="bg-[#173F3A] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#216761]/30 blur-2xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761] text-[#C6A66B] text-xs font-bold tracking-wide">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Next Confirmed Clinical Session</span>
            </div>
            <StatusBadge status={nextAppointment.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h2 className="font-serif font-bold text-2xl text-white">
                {nextAppointment.serviceName}
              </h2>
              <p className="text-xs text-[#A9C2B2]">
                Provider: <strong className="text-white">{nextAppointment.providerName || 'Dr. Sarah Jenkins, LPC'}</strong>
              </p>
              <div className="flex items-center gap-2 text-xs text-[#A9C2B2] pt-1">
                {nextAppointment.deliveryMethod === 'telehealth' ? (
                  <Video className="w-4 h-4 text-[#C6A66B]" />
                ) : nextAppointment.deliveryMethod === 'office' ? (
                  <Building className="w-4 h-4 text-[#C6A66B]" />
                ) : (
                  <Home className="w-4 h-4 text-[#C6A66B]" />
                )}
                <span className="capitalize text-white font-medium">{nextAppointment.deliveryMethod} Session</span>
                <span>•</span>
                <span>{nextAppointment.durationMinutes} Minutes</span>
              </div>
            </div>

            <div className="space-y-1.5 lg:border-l lg:border-white/10 lg:pl-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A9C2B2]">
                Scheduled Time ({'Eastern Time'})
              </span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#C6A66B]">
                {nextAppointment.date}
              </div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C6A66B]" />
                <span>{nextAppointment.timeSlot} EST</span>
              </div>
              {nextAppointment.deliveryMethod === 'office' && (
                <div className="text-xs text-[#A9C2B2] pt-1">
                  331 E Main Street Suite 200, Rock Hill, SC
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-3 lg:items-end">
              {nextAppointment.deliveryMethod === 'telehealth' && (
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onJoinTelehealth(nextAppointment)}
                    className="px-5 py-2.5 rounded-lg bg-[#C6A66B] text-[#173F3A] text-xs font-bold hover:bg-[#d8b87d] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Video className="w-4 h-4 text-[#173F3A]" />
                    <span>Join Telehealth Room</span>
                  </button>
                  <button
                    onClick={onOpenConnectionTest}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5 border border-white/20"
                  >
                    <Wifi className="w-3.5 h-3.5 text-[#C6A66B]" />
                    <span>Test Audio/Video</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <CalendarExport appointment={nextAppointment} />
                <button
                  onClick={() => onNavigateTab('appointments')}
                  className="px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  Manage Session
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#173F3A]">No upcoming appointment scheduled</h3>
            <p className="text-xs text-[#5F6F6B]">Stay on track with your care plan goals by scheduling your next session.</p>
          </div>
          <button
            onClick={onRequestBooking}
            className="px-4 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors inline-flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C6A66B]" />
            <span>Schedule Next Session</span>
          </button>
        </div>
      )}

      {/* 3. ACTION REQUIRED SECTION */}
      {actionItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#5F6F6B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C6A66B]" />
              <span>Prioritized Care Actions ({actionItems.length})</span>
            </h3>
            <span className="text-xs text-[#5F6F6B]">Secure Client Tasks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/40 transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.priority === 'high' ? 'Required Action' : 'Recommended'}
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#173F3A] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#5F6F6B] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab(item.targetTab)}
                  className="w-full py-2 px-3 rounded-lg bg-[#F8F5EE] border border-[#D9E1DC] text-xs font-bold text-[#17312E] hover:bg-[#EFEAE0] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#216761]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CARE SUMMARY CARDS (8 cards) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#5F6F6B]">
          Care Overview & Active Modules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Care Plan */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">My Care Plan</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Personalized objectives for stress reduction and autonomic regulation.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('care_plan')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Care Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 2: Wellness Program */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <Activity className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Approved</span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Wellness Program</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Evidence-informed daily routines, habit structure, and somatic grounding.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('wellness')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Open Program</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 3: Progress Check-Ins */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-[#C6A66B] bg-[#F8F5EE] border border-[#D9E1DC] px-2 py-0.5 rounded-full">Weekly</span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Progress Check-In</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Log weekly self-assessments, mood indicators, and coping progress.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('checkins')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Record Check-In</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 4: Approved Clinical Reports */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Formal Reports</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Clinician-approved session reports, evaluations, and progress summaries.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Approved Reports</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 5: Documents Vault */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <UploadCloud className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono font-bold text-[#5F6F6B]">{documents.length} Files</span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Documents & Records</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Secure repository for insurance cards, referrals, and authorizations.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Open Document Vault</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 6: Consent Center */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <Shield className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">HIPAA</span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Consent & Privacy</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Granular consents, recording permissions, and disclosures.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('consents')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Manage Consents</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 7: Billing & Receipts */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <Receipt className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono font-bold text-[#5F6F6B]">
                  {pendingBalance > 0 ? `$${pendingBalance.toFixed(2)} Due` : 'Paid'}
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Billing & Receipts</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Itemized statements, copay payments, and insurance coverage.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('billing')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Statements</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 8: Secure Messages */}
          <div className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-2xs hover:border-[#216761]/30 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <MessageSquare className="w-4 h-4" />
                </span>
                {unreadMessagesCount > 0 && (
                  <span className="text-[11px] font-bold text-white bg-[#B3392F] px-2 py-0.5 rounded-full">
                    {unreadMessagesCount} New
                  </span>
                )}
              </div>
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Secure Messages</h4>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Private, encrypted communication with Dr. Jenkins and support staff.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-bold text-[#216761] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Open Thread</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. PROGRESS AREA & 6. CARE TEAM (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Visualization */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#173F3A] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#216761]" />
                <span>Clinical Progress & Milestone Tracking</span>
              </h3>
              <p className="text-xs text-[#5F6F6B] mt-0.5">
                Validated psychometric indicators monitored across sessions.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('checkins')}
              className="text-xs font-bold text-[#216761] hover:underline"
            >
              All Metrics
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {/* Metric 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#17312E]">Somatic Anxiety Regulation (GAD-7 Baseline Improvement)</span>
                <span className="font-bold text-[#216761]">78% Goal Attainment</span>
              </div>
              <div className="h-2.5 bg-[#F8F5EE] border border-[#D9E1DC] rounded-full overflow-hidden">
                <div className="h-full bg-[#216761] rounded-full" style={{ width: '78%' }} />
              </div>
              <div className="text-[11px] text-[#5F6F6B]">
                Baseline: Moderate (14) → Current: Mild (5)
              </div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#17312E]">Sleep Stability & Routine Adherence</span>
                <span className="font-bold text-[#216761]">85% Consistent</span>
              </div>
              <div className="h-2.5 bg-[#F8F5EE] border border-[#D9E1DC] rounded-full overflow-hidden">
                <div className="h-full bg-[#C6A66B] rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="text-[11px] text-[#5F6F6B]">
                Averaging 7.2 hours restorative sleep over past 14 days
              </div>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#17312E]">Mindfulness & Somatic Grounding Sessions</span>
                <span className="font-bold text-[#216761]">5 / 7 Days Complete</span>
              </div>
              <div className="h-2.5 bg-[#F8F5EE] border border-[#D9E1DC] rounded-full overflow-hidden">
                <div className="h-full bg-[#173F3A] rounded-full" style={{ width: '71%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F5EE] border border-[#D9E1DC] text-[11px] text-[#5F6F6B] leading-relaxed">
            <strong className="text-[#17312E]">Clinician Oversight Notice:</strong> Metrics represent client-logged observations verified during bi-weekly clinical consultations. No AI conclusions are reported as diagnostic facts.
          </div>
        </div>

        {/* Care Team Area */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#173F3A] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#216761]" />
                <span>My Care Team</span>
              </h3>
              <p className="text-xs text-[#5F6F6B] mt-0.5">
                Verified licensed healthcare professionals coordinating your care.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('care_team')}
              className="text-xs font-bold text-[#216761] hover:underline"
            >
              Full Roster
            </button>
          </div>

          <div className="space-y-3">
            {/* Primary Clinician */}
            <div className="p-3.5 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#173F3A] text-white flex items-center justify-center font-serif font-bold text-sm">
                  SJ
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173F3A]">Dr. Sarah Jenkins, Ph.D., LPC</div>
                  <div className="text-[11px] text-[#216761] font-medium">Primary Clinician & Care Coordinator</div>
                  <div className="text-[10px] text-[#5F6F6B]">Lic: SC-LPC-008241 • Next: Thursday 10:00 AM</div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('messages')}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D9E1DC] text-xs font-bold text-[#17312E] hover:bg-[#EFEAE0]"
              >
                Message
              </button>
            </div>

            {/* Behavioral Specialist */}
            <div className="p-3.5 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#216761] text-white flex items-center justify-center font-serif font-bold text-sm">
                  MS
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173F3A]">Marcus Sterling, MS, BCaBA</div>
                  <div className="text-[11px] text-[#216761] font-medium">Behavioral Intervention Specialist</div>
                  <div className="text-[10px] text-[#5F6F6B]">Lic: SC-BCABA-00319 • Next: Friday 2:00 PM</div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('messages')}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D9E1DC] text-xs font-bold text-[#17312E] hover:bg-[#EFEAE0]"
              >
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. RECENT ACTIVITY AREA */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-serif font-bold text-[#173F3A]">
          Recent Account & Care Activity
        </h3>

        <div className="divide-y divide-[#D9E1DC]/60">
          {[
            {
              title: 'Clinical Session Confirmed',
              desc: 'Individual Counseling session with Dr. Sarah Jenkins confirmed for Thursday 10:00 AM EST.',
              time: 'Today, 8:30 AM',
              icon: CalendarIcon,
            },
            {
              title: 'Weekly Progress Check-In Recorded',
              desc: 'Self-assessment mood and sleep metrics logged for clinical chart review.',
              time: 'Yesterday, 6:15 PM',
              icon: TrendingUp,
            },
            {
              title: 'Approved Formal Report Available',
              desc: 'Comprehensive Biopsychosocial Clinical Evaluation approved by Dr. Jenkins is ready for download.',
              time: '3 days ago',
              icon: FileText,
            },
            {
              title: 'Itemized Receipt Generated',
              desc: 'Insurance claim processed and copay receipt issued for recent telehealth encounter.',
              time: '5 days ago',
              icon: Receipt,
            },
          ].map((ev, i) => {
            const Icon = ev.icon;
            return (
              <div key={i} className="py-3.5 flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#F8F5EE] border border-[#D9E1DC] text-[#216761] shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#173F3A]">{ev.title}</h4>
                    <span className="text-[11px] text-[#5F6F6B] shrink-0">{ev.time}</span>
                  </div>
                  <p className="text-xs text-[#5F6F6B] mt-0.5">{ev.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
