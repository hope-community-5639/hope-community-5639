import React from 'react';
import {
  HeartHandshake,
  Calendar,
  Sparkles,
  ShieldCheck,
  Users,
  Video,
  Home as HomeIcon,
  Building,
  CheckCircle2,
  ArrowRight,
  Phone,
  FileCheck,
  Award,
} from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import { INITIAL_SERVICES } from '../../db/initialData';

// Generated assets
import heroImage from '../../assets/images/hope_hero_banner_1788892604502.jpg';
import counselingImage from '../../assets/images/counseling_support_1788892618520.jpg';
import communityImage from '../../assets/images/community_empowerment_1788892633588.jpg';

interface HomePageProps {
  onNavigate: (view: string, category?: string) => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Emergency Notice Card with 28px-40px separation from header */}
      <EmergencyBanner />

      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 xl:px-10">
        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-[#173F3A] text-white">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Warm, supportive therapy office at Hope Community Support"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#173F3A] via-[#173F3A]/90 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/60 border border-[#C6A66B]/40 text-[#C6A66B] text-xs font-semibold mb-6 tracking-wide">
              <Award className="w-3.5 h-3.5" />
              <span>Established in 2008 • Hands On Personal Empowerment</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight tracking-tight">
              Compassionate Support for Every Stage of Life
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#F8F5EE]/90 leading-relaxed font-normal">
              Hope Community Support provides personalized therapy, behavioral intervention, counseling, training, and mentoring for individuals, couples, families, and groups.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenBooking}
                type="button"
                className="px-6 py-3.5 rounded-lg bg-[#C6A66B] hover:bg-[#d8b87d] text-[#173F3A] font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Request an Appointment
              </button>
              <button
                onClick={() => onNavigate('services_overview')}
                type="button"
                className="px-6 py-3.5 rounded-lg bg-[#216761]/80 hover:bg-[#216761] text-white font-medium text-sm border border-[#A9C2B2]/40 transition-colors flex items-center gap-2"
              >
                Explore Our Services
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick stats / trust markers */}
            <div className="mt-10 pt-8 border-t border-[#A9C2B2]/20 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="block text-2xl font-serif font-bold text-[#C6A66B]">16+</span>
                <span className="text-xs text-[#A9C2B2]">Years Serving SC</span>
              </div>
              <div>
                <span className="block text-2xl font-serif font-bold text-[#C6A66B]">3 Formats</span>
                <span className="text-xs text-[#A9C2B2]">Office, In-Home & Virtual</span>
              </div>
              <div>
                <span className="block text-2xl font-serif font-bold text-[#C6A66B]">All Ages</span>
                <span className="text-xs text-[#A9C2B2]">Youth to Older Adults</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are & Meaning of HOPE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
              About Hope Community Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] leading-snug">
              Hands On Personal Empowerment
            </h2>
            <p className="text-sm text-[#202826]/80 leading-relaxed">
              Founded in 2008, Hope Community Support is composed of dedicated behavioral-health professionals committed to helping individuals, couples, families, and community groups thrive. Our mission is simple and unwavering: <strong>to provide quality care</strong>.
            </p>
            <p className="text-sm text-[#202826]/80 leading-relaxed">
              We believe true healing and lasting transformation happen when clients feel heard, respected, and actively empowered in their own journey. Our model meets you where you are—in our welcoming Rock Hill office, right in your home, or via encrypted telehealth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[#A9C2B2]/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#216761] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#173F3A]">Individualized Roadmaps</h4>
                  <p className="text-xs text-[#66736F] mt-0.5">Care tailored specifically to personal strengths and goals.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#A9C2B2]/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#216761] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#173F3A]">Safe & Confidential</h4>
                  <p className="text-xs text-[#66736F] mt-0.5">Strict privacy practices safeguarding your well-being.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="text-xs font-bold text-[#216761] hover:text-[#173F3A] inline-flex items-center gap-1.5"
              >
                Read our full history and philosophy →
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-[#A9C2B2]/30 bg-white">
              <img
                src={counselingImage}
                alt="Compassionate counseling conversation at Hope Community Support"
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-6 bg-[#F8F5EE]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#173F3A] flex items-center justify-center text-[#C6A66B] shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#173F3A]">
                      "Helping the Community Thrive"
                    </h4>
                    <p className="text-xs text-[#66736F]">
                      Serving Rock Hill, York County & South Carolina statewide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="bg-white py-16 border-y border-[#A9C2B2]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
              Comprehensive Behavioral Health
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">
              Our Core Service Offerings
            </h2>
            <p className="text-sm text-[#66736F] mt-2">
              Tailored therapeutic modalities designed to provide real, practical empowerment for every situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_SERVICES.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="bg-[#F8F5EE] rounded-xl p-6 border border-[#A9C2B2]/30 hover:border-[#216761]/50 transition-all hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#216761]/10 text-[#173F3A]">
                      {service.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#66736F] font-mono">{service.durationMinutes} min</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#173F3A] group-hover:text-[#216761] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#66736F] mt-2 leading-relaxed">
                    {service.shortDescription}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#A9C2B2]/30">
                    <span className="text-[11px] font-semibold text-[#173F3A] block mb-1">Commonly addresses:</span>
                    <ul className="text-xs text-[#202826]/75 space-y-1">
                      {service.commonConcerns.slice(0, 2).map((c, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C6A66B]" />
                          <span className="truncate">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#A9C2B2]/20 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('service_detail', service.category)}
                    className="text-xs font-bold text-[#216761] hover:text-[#173F3A] flex items-center gap-1"
                  >
                    View Details →
                  </button>
                  <button
                    onClick={onOpenBooking}
                    className="px-2.5 py-1 rounded bg-[#216761] text-white text-[11px] font-semibold hover:bg-[#173F3A]"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => onNavigate('services_overview')}
              className="px-6 py-3 rounded-lg bg-[#173F3A] text-white text-xs font-bold hover:bg-[#216761] transition-colors inline-flex items-center gap-2"
            >
              View All 11 Services & Support Modalities
              <ArrowRight className="w-4 h-4 text-[#C6A66B]" />
            </button>
          </div>
        </div>
      </section>

      {/* Flexible Delivery Options */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#173F3A] rounded-2xl p-8 sm:p-12 text-white">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              Care Where You Need It
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Three Flexible Delivery Formats
            </h2>
            <p className="text-sm text-[#A9C2B2] mt-2">
              We remove barriers to behavioral health care with tailored access options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#102D29] p-6 rounded-xl border border-[#216761]">
              <div className="w-12 h-12 rounded-lg bg-[#216761] flex items-center justify-center text-[#C6A66B] mb-4">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-white mb-2">In-Office Care</h3>
              <p className="text-xs text-[#A9C2B2] leading-relaxed mb-4">
                Our calm, private downtown Rock Hill offices provide a confidential haven for focused individual, couples, and family sessions.
              </p>
              <span className="text-xs text-[#C6A66B] font-medium">331 E Main St, Suite 200</span>
            </div>

            <div className="bg-[#102D29] p-6 rounded-xl border border-[#216761]">
              <div className="w-12 h-12 rounded-lg bg-[#216761] flex items-center justify-center text-[#C6A66B] mb-4">
                <HomeIcon className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-white mb-2">In-Home Services</h3>
              <p className="text-xs text-[#A9C2B2] leading-relaxed mb-4">
                When mobility, transportation, or emotional hurdles impede travel, our verified professionals deliver support directly to your home.
              </p>
              <span className="text-xs text-[#C6A66B] font-medium">York County & Surrounding SC</span>
            </div>

            <div className="bg-[#102D29] p-6 rounded-xl border border-[#216761]">
              <div className="w-12 h-12 rounded-lg bg-[#216761] flex items-center justify-center text-[#C6A66B] mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-white mb-2">Secure Telehealth</h3>
              <p className="text-xs text-[#A9C2B2] leading-relaxed mb-4">
                HIPAA-compliant virtual appointments accessible from any smartphone, tablet, or laptop from anywhere in South Carolina.
              </p>
              <span className="text-xs text-[#C6A66B] font-medium">One-Click Encrypted Video</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Care Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
            Structured & Supportive
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">
            Our Proven Care Process
          </h2>
          <p className="text-sm text-[#66736F] mt-2">
            Assessment → Individualized Plan → Safe Environment for Growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white p-6 rounded-xl border border-[#A9C2B2]/40 shadow-xs text-center relative">
            <div className="w-12 h-12 rounded-full bg-[#173F3A] text-[#C6A66B] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173F3A] mb-2">
              Assessment & Inquiry
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              We begin with a thorough, empathetic conversation to understand your specific challenges, history, and personal strengths.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#A9C2B2]/40 shadow-xs text-center relative">
            <div className="w-12 h-12 rounded-full bg-[#216761] text-white font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173F3A] mb-2">
              Individualized Plan
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              Together, we construct a personalized service plan with realistic goals, evidence-based coping tools, and tailored session frequencies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#A9C2B2]/40 shadow-xs text-center relative">
            <div className="w-12 h-12 rounded-full bg-[#173F3A] text-[#C6A66B] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-serif font-bold text-lg text-[#173F3A] mb-2">
              Supportive Growth
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              You receive ongoing support in a safe environment, regular progress evaluations, and coordination for continued wellness and independence.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('process')}
            className="text-xs font-bold text-[#216761] hover:underline inline-flex items-center gap-1"
          >
            Explore the complete 8-step client onboarding journey →
          </button>
        </div>
      </section>

      {/* Areas of Support Overview */}
      <section className="bg-[#F1ECE1]/60 py-16 border-y border-[#A9C2B2]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
                Areas of Focus
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">
                Support for Life's Most Complex Challenges
              </h2>
              <p className="text-sm text-[#66736F] mt-3 leading-relaxed">
                Whether navigating bereavement, enduring chronic anxiety, rebuilding fractured family ties, or seeking freedom from addictive cycles, Hope Community Support provides professional, non-judgmental guidance.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {[
                  'Grief & Bereavement',
                  'Depression Relief',
                  'Anxiety & Panic',
                  'Relationship Repair',
                  'Addiction Recovery',
                  'Eating Disorders',
                  'Stress Management',
                  'Parenting Guidance',
                  'Career Transitions',
                ].map((area, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-[#A9C2B2]/40 text-xs font-medium text-[#173F3A] flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#216761] shrink-0" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={onOpenBooking}
                  className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors"
                >
                  Schedule an Initial Session
                </button>
                <button
                  onClick={() => onNavigate('services_overview')}
                  className="text-xs font-bold text-[#173F3A] hover:underline"
                >
                  Explore Support Details →
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg border border-[#A9C2B2]/30 bg-white">
              <img
                src={communityImage}
                alt="Community connection and group wellness"
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-6 bg-white">
                <h4 className="font-serif font-bold text-sm text-[#173F3A]">
                  Client Types Served
                </h4>
                <p className="text-xs text-[#66736F] mt-1">
                  We provide specialized care for <strong>Individuals</strong>, <strong>Couples</strong>, <strong>Families</strong>, and <strong>Support Groups</strong> of all ages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Invitation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#173F3A] to-[#216761] text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              Secure Online Access
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">
              Your Personal Client Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-[#F8F5EE]/80 mt-2 leading-relaxed">
              Registered clients can manage upcoming appointments, complete intake questionnaires, electronically sign consent forms, exchange encrypted documents, and communicate securely with assigned staff.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#C6A66B] text-[#173F3A] font-bold text-xs hover:bg-[#d8b87d] transition-colors text-center"
            >
              Sign In to Client Portal
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-black/20 text-white font-medium text-xs hover:bg-black/30 transition-colors text-center"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
