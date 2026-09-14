import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  Award,
  Video,
  ExternalLink,
} from 'lucide-react';

interface CareTeamMember {
  id: string;
  name: string;
  designation: string;
  role: string;
  specialties: string[];
  licenseNumber: string;
  jurisdiction: string;
  approvedContact: string;
  officeHours: string;
  nextScheduled: string;
  bio: string;
}

interface CareTeamViewProps {
  onMessageMember: (memberName: string) => void;
  onRequestAppointment: () => void;
}

const CARE_TEAM: CareTeamMember[] = [
  {
    id: 'prov-jenkins',
    name: 'Dr. Sarah Jenkins',
    designation: 'Ph.D., LPC, NCC',
    role: 'Primary Clinician & Care Coordinator',
    specialties: ['Adult Cognitive Behavioral Therapy (CBT)', 'Executive Stress & Burnout', 'Trauma-Informed Counseling'],
    licenseNumber: 'SC-LPC-008241',
    jurisdiction: 'South Carolina LLR Board of Examiners',
    approvedContact: 'Secure Portal Messaging & Scheduled Telehealth',
    officeHours: 'Monday – Thursday, 8:30 AM – 4:30 PM EST',
    nextScheduled: 'Upcoming Thursday at 10:00 AM EST',
    bio: 'Licensed Professional Counselor with over 14 years of clinical experience serving executives, individuals, and families navigating complex life transitions and acute stress.',
  },
  {
    id: 'prov-sterling',
    name: 'Marcus Sterling',
    designation: 'MS, BCaBA',
    role: 'Behavioral Intervention Specialist',
    specialties: ['Applied Behavioral Strategies', 'Structured Habit Architecture', 'Youth & Family Mentoring'],
    licenseNumber: 'SC-BCABA-00319',
    jurisdiction: 'Behavior Analyst Certification Board',
    approvedContact: 'Secure Portal Messaging',
    officeHours: 'Tuesday – Friday, 9:00 AM – 5:00 PM EST',
    nextScheduled: 'Next Friday at 2:00 PM EST',
    bio: 'Specialist in functional behavioral assessment, somatic grounding routines, and evidence-informed habit architecture for structured personal empowerment.',
  },
  {
    id: 'prov-vance',
    name: 'Dr. Elena Vance',
    designation: 'MD, Child & Adolescent Psychiatrist',
    role: 'Consulting Psychiatric Specialist',
    specialties: ['Integrative Psychiatric Evaluation', 'Neurobiology of Trauma', 'Pharmacotherapy Consultation'],
    licenseNumber: 'SC-MD-049811',
    jurisdiction: 'South Carolina Board of Medical Examiners',
    approvedContact: 'Care Coordinator Referral & Consultation',
    officeHours: 'Wednesdays by Consultation Appointment',
    nextScheduled: 'Periodic Medical Review (Scheduled as Indicated)',
    bio: 'Consulting Board-Certified Psychiatrist providing clinical diagnostic oversight, biopsychosocial assessment reviews, and medication consultation support.',
  },
];

export const CareTeamView: React.FC<CareTeamViewProps> = ({
  onMessageMember,
  onRequestAppointment,
}) => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Multidisciplinary Care Team</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              My Dedicated Clinical Team
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Your care is coordinated under licensed healthcare providers with verified primary-source credentials, state board licensure, and strict confidentiality protections.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRequestAppointment}
              className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors shadow-xs flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#C6A66B]" />
              <span>Schedule Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Care Team Grid */}
      <div className="grid grid-cols-1 gap-6">
        {CARE_TEAM.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs hover:border-[#216761]/30 transition-all flex flex-col lg:flex-row items-start justify-between gap-8"
          >
            {/* Member Details */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#173F3A]">
                      {member.name}
                    </h2>
                    <span className="text-xs font-mono font-semibold text-[#5F6F6B] bg-[#F8F5EE] px-2 py-0.5 rounded-md border border-[#D9E1DC]">
                      {member.designation}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#216761] mt-0.5">
                    {member.role}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Licensure Active & Verified</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#17312E] leading-relaxed">
                {member.bio}
              </p>

              {/* Specialties */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B] mb-2">
                  Clinical Focus Areas
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-[#F8F5EE] border border-[#D9E1DC] text-[#17312E]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Administrative Verification Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#5F6F6B]">
                <div>
                  <span className="font-semibold text-[#17312E]">License / Credential:</span>{' '}
                  <span className="font-mono">{member.licenseNumber}</span> ({member.jurisdiction})
                </div>
                <div>
                  <span className="font-semibold text-[#17312E]">Approved Office Hours:</span>{' '}
                  <span>{member.officeHours}</span>
                </div>
              </div>
            </div>

            {/* Interaction Card Sidebar */}
            <div className="w-full lg:w-72 rounded-xl bg-[#F8F5EE] border border-[#D9E1DC] p-5 space-y-4 shrink-0">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                  Next Scheduled Interaction
                </div>
                <div className="text-xs font-bold text-[#173F3A] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#216761]" />
                  <span>{member.nextScheduled}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D9E1DC] space-y-2">
                <button
                  onClick={() => onMessageMember(member.name)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <MessageSquare className="w-4 h-4 text-[#C6A66B]" />
                  <span>Message {member.name.split(' ')[1]}</span>
                </button>

                <div className="text-[11px] text-center text-[#5F6F6B]">
                  Encrypted In-App Transmission Only
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
