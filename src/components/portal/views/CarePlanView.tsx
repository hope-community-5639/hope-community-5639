import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Target,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';
import { CarePlan } from '../../../types';

interface CarePlanViewProps {
  carePlan?: CarePlan;
  onOpenBooking: () => void;
  onRequestAmendment: () => void;
}

export const CarePlanView: React.FC<CarePlanViewProps> = ({
  carePlan,
  onOpenBooking,
  onRequestAmendment,
}) => {
  const plan = carePlan || {
    id: 'cp-default-001',
    clientId: 'user-client-1',
    authorId: 'prov-jenkins',
    authorName: 'Dr. Sarah Jenkins, LPC',
    authorRole: 'provider',
    diagnosisCodes: ['F41.1 (Generalized Anxiety Disorder)', 'F43.23 (Adjustment Disorder with Mixed Mood)'],
    goals: [
      {
        id: 'g-01',
        description: 'Reduce acute autonomic anxiety episodes from 4 weekly to ≤ 1 weekly using progressive somatic regulation.',
        targetDate: '2026-11-30',
        status: 'in_progress',
        interventions: [
          'Diaphragmatic breathing and 5-4-3-2-1 sensory grounding daily',
          'Bi-weekly cognitive restructuring sessions with clinical counselor',
          'Sleep hygiene stabilization schedule',
        ],
      },
      {
        id: 'g-02',
        description: 'Establish consistent restorative sleep protocol achieving 7+ hours per night for 5 of 7 days.',
        targetDate: '2026-10-15',
        status: 'in_progress',
        interventions: [
          'Digital curfew 60 minutes prior to sleep',
          'Evening mindfulness check-in logged in portal',
          'Graduated wind-down routine',
        ],
      },
    ],
    reviewDate: '2026-10-31',
    status: 'approved',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Licensed Clinician Approved</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Personalized Clinical Care Plan
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Formulated collaboratively with your primary clinician. All objectives are measurable, time-bounded, and reviewed at scheduled clinical milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRequestAmendment}
              className="px-4 py-2.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] text-[#173F3A] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors"
            >
              Request Clarification / Amendment
            </button>
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors shadow-xs"
            >
              Schedule Plan Review
            </button>
          </div>
        </div>
      </div>

      {/* Plan Metadata Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#D9E1DC] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
            Authorizing Clinician
          </div>
          <div className="text-sm font-bold text-[#173F3A]">
            {(plan as any).authorName || (plan as any).providerName || 'Dr. Sarah Jenkins, LPC'}
          </div>
          <div className="text-xs text-[#5F6F6B] mt-0.5">Primary Care Coordinator</div>
        </div>

        <div className="bg-white rounded-xl border border-[#D9E1DC] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
            Plan Review Cadence
          </div>
          <div className="text-sm font-bold text-[#173F3A] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#216761]" />
            <span>{plan.reviewDate || '2026-11-15'}</span>
          </div>
          <div className="text-xs text-[#5F6F6B] mt-0.5">Scheduled supervisory audit</div>
        </div>

        <div className="bg-white rounded-xl border border-[#D9E1DC] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
            Clinical Status
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">{plan.status || 'Active'}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D9E1DC] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
            Clinical Focus
          </div>
          <div className="text-xs font-mono font-semibold text-[#173F3A] truncate">
            {(plan as any).diagnosisCodes
              ? (plan as any).diagnosisCodes.join(', ')
              : (plan as any).diagnosisOrFocus || 'Cognitive & Behavioral Support'}
          </div>
          <div className="text-xs text-[#5F6F6B] mt-0.5">ICD-10 clinical alignment</div>
        </div>
      </div>

      {/* Individualized Goals */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-[#173F3A] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#216761]" />
            <span>Active Clinical Objectives & SMART Goals</span>
          </h2>
          <span className="text-xs text-[#5F6F6B]">
            {plan.goals.length} Goal{plan.goals.length === 1 ? '' : 's'} defined
          </span>
        </div>

        <div className="space-y-6">
          {plan.goals.map((goal, idx) => (
            <div
              key={goal.id || idx}
              className="p-5 sm:p-6 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#216761] text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B]">
                    Target Review Date: {goal.targetDate}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-[#D9E1DC] text-xs font-semibold text-[#173F3A]">
                  <Clock className="w-3.5 h-3.5 text-[#C6A66B]" />
                  <span className="capitalize">{goal.status.replace('_', ' ')}</span>
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-[#173F3A] leading-relaxed">
                {goal.description}
              </p>

              {/* Interventions */}
              {goal.interventions && goal.interventions.length > 0 && (
                <div className="pt-3 border-t border-[#D9E1DC]/80 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B]">
                    Prescribed Interventions & Action Steps:
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {goal.interventions.map((step, i) => (
                      <li key={i} className="text-xs text-[#17312E] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#216761] mt-1.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
