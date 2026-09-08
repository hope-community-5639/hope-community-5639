import React from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  TrendingUp,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

interface ProcessPageProps {
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const ProcessPage: React.FC<ProcessPageProps> = ({ onOpenBooking, onOpenAuth }) => {
  const steps = [
    {
      step: '01',
      title: 'Initial Contact & Consultation',
      description:
        'Reach out through our online appointment request form, telephone, or a partner referral. An intake coordinator will listen to your initial goals and answer questions about care formats.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Coverage & Eligibility Verification',
      description:
        'Our billing team verifies your Medicaid or private insurance benefits, identifies co-pays (if any), or configures sliding-scale community fee arrangements with zero surprise billing.',
      icon: CheckCircle2,
    },
    {
      step: '03',
      title: 'Digital Intake & Consent Signing',
      description:
        'Complete your HIPAA-compliant intake forms, emergency contacts, medical background, and telehealth consent conveniently through our private client portal.',
      icon: FileText,
    },
    {
      step: '04',
      title: 'Comprehensive Clinical Assessment',
      description:
        'Meet one-on-one with your assigned licensed therapist or behavioral specialist (in-office, in-home, or via video) for an in-depth, empathetic evaluation.',
      icon: Sparkles,
    },
    {
      step: '05',
      title: 'Individualized Treatment Planning',
      description:
        'Collaborate to create actionable goals, target milestones, session rhythms, and evidence-based interventions tailored directly to your life circumstances.',
      icon: Award,
    },
    {
      step: '06',
      title: 'Active Sessions & Hands-On Practice',
      description:
        'Engage in weekly or bi-weekly sessions combining cognitive restructuring, somatic regulation, communication practice, and real-world behavioral exercises.',
      icon: Calendar,
    },
    {
      step: '07',
      title: 'Quarterly Progress Reviews',
      description:
        'Together, we routinely examine symptom reduction, goal completion, and adjust modalities or frequencies as your stability and confidence strengthen.',
      icon: TrendingUp,
    },
    {
      step: '08',
      title: 'Empowered Graduation & Maintenance',
      description:
        'Celebrate your accomplishments. We transition you to a maintenance plan with community resources, booster sessions, and ongoing relapse-prevention strategies.',
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
          Transparent, Empathetic Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A] mt-1">
          Our Care Process: From First Step to Lasting Empowerment
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          Seeking behavioral health support can feel overwhelming. We demystify the entire path with a structured, respectful process designed to put you in the driver’s seat.
        </p>
      </div>

      {/* 8-Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#A9C2B2]/40 p-6 shadow-xs relative flex flex-col justify-between hover:border-[#216761]/60 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif font-bold text-2xl text-[#C6A66B]">
                    {item.step}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-[#216761]/10 text-[#216761] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-base text-[#173F3A] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#66736F] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Portal Integration Card */}
      <div className="bg-[#F8F5EE] rounded-2xl p-8 border border-[#A9C2B2]/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#173F3A]">
            Already have an intake appointment scheduled?
          </h3>
          <p className="text-xs sm:text-sm text-[#66736F] mt-1">
            Log in to complete your intake questionnaires and consent forms before your session to save time.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-lg bg-[#173F3A] text-white text-xs font-bold hover:bg-[#216761]"
          >
            Access Client Portal
          </button>
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
          >
            Schedule Intake
          </button>
        </div>
      </div>
    </div>
  );
};
