import React from 'react';
import { Award, BookOpen, Heart, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

interface TeamPageProps {
  onOpenBooking: (providerName?: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onOpenBooking }) => {
  const staffMembers = [
    {
      name: 'Dr. Sarah Jenkins',
      credentials: 'Ph.D., LPC, NCC',
      title: 'Clinical Director & Licensed Professional Counselor',
      specialties: ['Trauma & PTSD (EMDR)', 'Cognitive Behavioral Therapy (CBT)', 'Adolescent Behavioral Health', 'Depression & Grief'],
      bio: 'Dr. Jenkins has dedicated over 14 years to community-based clinical therapy in South Carolina. She specializes in trauma-informed care and adolescent resilience building, helping families rediscover calm and connection.',
      yearsExp: '14+ Years',
      education: 'Ph.D. Counselor Education & Supervision, Univ. of South Carolina',
    },
    {
      name: 'Marcus Vance',
      credentials: 'MSW, LISW-CP',
      title: 'Senior Behavioral Interventionist & Family Therapist',
      specialties: ['Couples Counseling', 'Behavioral Modification', 'Addiction & Recovery', 'Parent Coaching'],
      bio: 'Marcus brings extensive expertise in community mental health, in-home crisis mitigation, and substance recovery coaching. He is deeply committed to empowering individuals to overcome cyclical family struggles.',
      yearsExp: '12+ Years',
      education: 'Master of Social Work, Winthrop University',
    },
    {
      name: 'Maria Santos',
      credentials: 'B.S., QMHP',
      title: 'Lead Intake Coordinator & Case Manager',
      specialties: ['Bilingual Intake (English/Spanish)', 'Medicaid & Insurance Navigation', 'Community Resource Coordination', 'Crisis Triage'],
      bio: 'Maria serves as the compassionate first point of contact for clients entering Hope Community Support. She ensures intake paperwork, coverage checks, and provider matching are smooth, respectful, and swift.',
      yearsExp: '8+ Years',
      education: 'B.S. Psychology & Human Services',
    },
    {
      name: 'David Ross',
      credentials: 'MHA, CHC',
      title: 'Executive Director & HIPAA Privacy Officer',
      specialties: ['Healthcare Operations', 'HIPAA Privacy Compliance', 'Community Outreach', 'Quality Assurance'],
      bio: 'David oversees Hope Community Support’s healthcare compliance, HIPAA data privacy governance, and organizational partnerships with York County schools and healthcare networks.',
      yearsExp: '16+ Years',
      education: 'Master of Health Administration, Medical Univ. of South Carolina',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
          Compassionate, Credentialed Professionals
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A] mt-1">
          Meet Our Dedicated Clinical & Administrative Team
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          Our clinicians and coordinators combine rigorous evidence-based training with heartfelt empathy, ensuring you receive dignified, personalized behavioral health care.
        </p>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {staffMembers.map((member, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs hover:border-[#216761]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                    {member.name}
                  </h3>
                  <span className="text-xs font-semibold text-[#C6A66B] block mt-0.5">
                    {member.credentials}
                  </span>
                  <span className="text-xs text-[#216761] font-medium block mt-0.5">
                    {member.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-1 rounded bg-[#F8F5EE] border border-[#A9C2B2]/50 text-[#173F3A]">
                  {member.yearsExp}
                </span>
              </div>

              <p className="text-xs text-[#66736F] leading-relaxed mb-6">
                {member.bio}
              </p>

              {/* Specialties */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-[#173F3A] uppercase tracking-wider block mb-2">
                  Specialized Competencies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.specialties.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] bg-[#F8F5EE] border border-[#A9C2B2]/40 text-[#202826] px-2.5 py-1 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-[#66736F] pt-3 border-t border-[#F1ECE1] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#216761]" />
                <span>{member.education}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F1ECE1] flex items-center justify-between">
              <span className="text-xs text-[#216761] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Licensed in South Carolina
              </span>
              <button
                onClick={() => onOpenBooking(member.name)}
                className="px-3.5 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-semibold hover:bg-[#173F3A] transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C6A66B]" />
                Request With {member.name.split(' ')[0]}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
