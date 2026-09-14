import React from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Shield,
  FileText,
  UserCheck,
} from 'lucide-react';
import { IntakeSubmission } from '../../../types';

interface RequiredFormsViewProps {
  intake?: IntakeSubmission;
  onOpenWizard: () => void;
}

interface FormItem {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'pending' | 'needs_update';
  completionDate?: string;
  description: string;
  renewalDue?: string;
}

export const RequiredFormsView: React.FC<RequiredFormsViewProps> = ({
  intake,
  onOpenWizard,
}) => {
  const isIntakeApproved = intake?.status === 'approved';

  const formsList: FormItem[] = [
    {
      id: 'form-comprehensive-intake',
      title: '10-Step Guided Clinical Intake & Demographics',
      category: 'Clinical Intake',
      status: isIntakeApproved ? 'completed' : intake ? 'completed' : 'pending',
      completionDate: intake?.submittedAt || (isIntakeApproved ? '2026-08-10' : undefined),
      description: 'Comprehensive demographic, behavioral history, primary care network, and service modality registration.',
    },
    {
      id: 'form-hipaa-consent',
      title: 'HIPAA Notice of Privacy Practices & Rights Acknowledgement',
      category: 'Consent & Legal',
      status: 'completed',
      completionDate: '2026-08-10',
      description: 'Federal 45 CFR § 164 compliance notice detailing data safeguarding, access rights, and restricted disclosures.',
      renewalDue: 'Annual (2027-08-10)',
    },
    {
      id: 'form-telehealth-consent',
      title: 'Informed Telehealth Delivery Agreement',
      category: 'Clinical Protocol',
      status: 'completed',
      completionDate: '2026-08-10',
      description: 'Consent for high-definition encrypted video telepractice, emergency local protocol, and technical safeguards.',
    },
    {
      id: 'form-safety-screening',
      title: 'Baseline Safety & Behavioral Health Assessment',
      category: 'Clinical Assessment',
      status: 'completed',
      completionDate: '2026-08-10',
      description: 'Intake clinical screening for acute risk factors, self-harm assessment, and crisis prevention planning.',
    },
    {
      id: 'form-financial-agreement',
      title: 'Client Financial Agreement & Insurance Authorization',
      category: 'Billing & Insurance',
      status: 'completed',
      completionDate: '2026-08-10',
      description: 'Payer assignment of benefits, self-pay fee schedule transparency, and tokenized payment authorization.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Regulatory & Clinical Intake Documents</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Required Forms & Documentation
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Review and update your electronic intake forms, consent authorizations, and annual documentation required for active behavioral health care.
            </p>
          </div>

          <button
            onClick={onOpenWizard}
            className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors shadow-xs flex items-center gap-2 shrink-0"
          >
            <FileText className="w-4 h-4 text-[#C6A66B]" />
            <span>{isIntakeApproved ? 'Review / Update Intake Wizard' : 'Complete 10-Step Intake'}</span>
          </button>
        </div>
      </div>

      {/* Forms List */}
      <div className="space-y-4">
        {formsList.map((form) => {
          const isDone = form.status === 'completed';

          return (
            <div
              key={form.id}
              className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs hover:border-[#216761]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F8F5EE] border border-[#D9E1DC] text-[#5F6F6B]">
                    {form.category}
                  </span>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      Action Required
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-[#173F3A]">
                  {form.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6F6B] leading-relaxed">
                  {form.description}
                </p>

                <div className="text-xs text-[#5F6F6B] pt-1">
                  {form.completionDate && (
                    <span>Last submitted: <strong className="text-[#17312E]">{form.completionDate}</strong></span>
                  )}
                  {form.renewalDue && (
                    <span className="ml-3">• Renewal Cadence: <strong>{form.renewalDue}</strong></span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={onOpenWizard}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#F8F5EE] border border-[#D9E1DC] text-xs font-bold text-[#173F3A] hover:bg-[#EFEAE0] transition-colors flex items-center justify-center gap-2"
                >
                  <span>{isDone ? 'View Submission' : 'Fill Form'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#216761]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
