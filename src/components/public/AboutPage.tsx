import React from 'react';
import { HeartHandshake, Shield, Target, Sparkles, CheckCircle2, Award, Users } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import communityImage from '../../assets/images/community_empowerment_1788892633588.jpg';

interface AboutPageProps {
  onOpenBooking: () => void;
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenBooking, onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Founded in 2008 • Over 16 Years of Dedicated Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A]">
          About Hope Community Support
        </h1>
        <p className="text-base sm:text-lg text-[#66736F] mt-3 leading-relaxed">
          <strong>H.O.P.E.</strong> stands for <em>Hands On Personal Empowerment</em>. Guided by our founding tagline, <strong>"Helping the Community Thrive,"</strong> we provide compassionate, evidence-based behavioral health care across South Carolina.
        </p>
      </div>

      {/* Meaning & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <h2 className="text-2xl font-serif font-bold text-[#173F3A]">
            The Meaning of H.O.P.E.
          </h2>
          <p className="text-sm text-[#202826]/80 leading-relaxed">
            When Hope Community Support opened its doors in 2008, the founders recognized a vital gap in traditional behavioral health delivery: therapeutic care too often remained abstract, clinic-bound, and detached from the day-to-day realities of individuals and families.
          </p>
          <div className="p-4 bg-[#F8F5EE] border-l-4 border-[#C6A66B] rounded-r-lg">
            <h4 className="font-serif font-bold text-[#173F3A] text-sm">
              Hands On Personal Empowerment
            </h4>
            <p className="text-xs text-[#66736F] mt-1 leading-relaxed">
              We do not impose cookie-cutter answers. Instead, we walk alongside clients, equipping them with actionable behavioral skills, emotional clarity, and interpersonal tools to foster self-determination and lasting healing.
            </p>
          </div>

          <h3 className="text-xl font-serif font-bold text-[#173F3A] pt-2">
            Our Mission: Quality Care Without Compromise
          </h3>
          <p className="text-sm text-[#202826]/80 leading-relaxed">
            Our mission is singular: <strong>to provide quality care</strong>. We pursue clinical excellence by employing certified, licensed practitioners who honor dignity, diversity, confidentiality, and individualized pacing.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg border border-[#A9C2B2]/30">
          <img
            src={communityImage}
            alt="Community empowerment session at Hope Community Support"
            className="w-full h-96 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-[#F8F5EE] rounded-2xl p-8 sm:p-12 border border-[#A9C2B2]/40">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
            Guiding Philosophy
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#173F3A] mt-1">
            Our Core Pillars
          </h2>
          <p className="text-xs sm:text-sm text-[#66736F] mt-2">
            These four principles inform every clinical interaction, consultation, and community initiative.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#173F3A] text-[#C6A66B] flex items-center justify-center mb-3">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#173F3A] mb-1">Compassion First</h4>
            <p className="text-xs text-[#66736F] leading-relaxed">
              Every client is met with non-judgmental acceptance, active listening, and sincere warmth from day one.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#216761] text-white flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#173F3A] mb-1">Personal Empowerment</h4>
            <p className="text-xs text-[#66736F] leading-relaxed">
              We empower clients to recognize their inherent strengths and author their own recovery goals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#173F3A] text-[#C6A66B] flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#173F3A] mb-1">Uncompromising Privacy</h4>
            <p className="text-xs text-[#66736F] leading-relaxed">
              Strict HIPAA compliance, encrypted health systems, and discreet physical and telehealth spaces.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#216761] text-white flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#173F3A] mb-1">Community Integration</h4>
            <p className="text-xs text-[#66736F] leading-relaxed">
              Seamless coordination with York County schools, physicians, pediatricians, and social agencies.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership Statement */}
      <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#173F3A] flex items-center justify-center text-[#C6A66B] text-2xl font-serif font-bold shrink-0">
            HCS
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#173F3A]">
              Clinical Leadership Commitment
            </h3>
            <p className="text-xs sm:text-sm text-[#202826]/80 leading-relaxed mt-2">
              "Over the past 16 years, our proudest accomplishment has not merely been the thousands of clinical hours logged, but the restored family dinners, the children who discovered their voice in school, and the adults who reclaimed their sense of dignity. Hope is not a passive wish—it is a hands-on daily practice."
            </p>
            <span className="block text-xs font-semibold text-[#216761] mt-3">
              — Clinical & Administrative Leadership, Hope Community Support
            </span>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center py-6">
        <button
          onClick={onOpenBooking}
          className="px-6 py-3 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] shadow-md transition-all"
        >
          Schedule an Appointment With Our Team
        </button>
      </div>
    </div>
  );
};
