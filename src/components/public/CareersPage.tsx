import React, { useState } from 'react';
import { Briefcase, CheckCircle2, Heart, Award, Send } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

export const CareersPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: 'Licensed Professional Counselor (LPC/LMFT)',
    licenseNumber: '',
    coverNote: '',
  });

  const positions = [
    {
      title: 'Licensed Professional Counselor (LPC / LMFT / LISW-CP)',
      type: 'Full-Time & Part-Time Opportunities',
      location: 'Rock Hill Clinic, SC & Telehealth',
      description: 'Deliver individual, couple, and family therapy to diverse client populations. Competitive compensation, CEU stipends, flexible schedule, and clinical supervision provided.',
    },
    {
      title: 'Behavioral Intervention Specialist (QMHP)',
      type: 'Full-Time',
      location: 'York & Chester Counties (In-Home & Community)',
      description: 'Provide hands-on behavioral mentoring, social skill development, and crisis de-escalation for adolescents and families in residential and school-supported settings.',
    },
    {
      title: 'Bilingual Intake & Client Coordinator',
      type: 'Full-Time',
      location: 'Rock Hill Office',
      description: 'Greet clients, manage phone triage, verify Medicaid and commercial insurance eligibility, schedule assessments, and facilitate welcoming client intake.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
          Join Our Mission of Empowerment
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A] mt-1">
          Careers at Hope Community Support
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          Help the community thrive. We cultivate a supportive, trauma-informed workplace that values clinical autonomy, work-life balance, and continuous professional development.
        </p>
      </div>

      {/* Open Positions */}
      <div className="space-y-6">
        <h2 className="font-serif font-bold text-2xl text-[#173F3A]">
          Current Open Opportunities
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {positions.map((pos, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#A9C2B2]/40 p-6 shadow-xs hover:border-[#216761]/60 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-serif font-bold text-lg text-[#173F3A]">
                  {pos.title}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#216761]/10 text-[#216761]">
                  {pos.type}
                </span>
              </div>
              <span className="text-xs text-[#C6A66B] font-medium block mb-3">
                {pos.location}
              </span>
              <p className="text-xs text-[#66736F] leading-relaxed mb-4">
                {pos.description}
              </p>
              <button
                onClick={() => {
                  setForm({ ...form, position: pos.title });
                  document.getElementById('career-apply-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-bold text-[#216761] hover:underline"
              >
                Apply for this position below ↓
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div id="career-apply-form" className="bg-[#F8F5EE] rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs">
        <h3 className="font-serif font-bold text-xl text-[#173F3A] mb-2">
          Submit Your Career Inquiry
        </h3>
        <p className="text-xs text-[#66736F] mb-6">
          Complete the form below to connect directly with our clinical leadership team.
        </p>

        {submitted ? (
          <div className="p-6 bg-[#216761]/15 border border-[#216761] rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-[#216761] mx-auto mb-2" />
            <h4 className="font-serif font-bold text-base text-[#173F3A]">Inquiry Received</h4>
            <p className="text-xs text-[#66736F] mt-1">
              Thank you for your interest in Hope Community Support. Our hiring manager will review your submission and reach out within 2 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Jane Doe, LPC"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane.doe@example.com"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(803) 555-0199"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Position of Interest *
                </label>
                <input
                  type="text"
                  required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                South Carolina License or Credential # (if applicable)
              </label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                placeholder="SC LPC #12345 or NPI"
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Summary of Experience & Why You'd Like to Join HCS
              </label>
              <textarea
                rows={4}
                value={form.coverNote}
                onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                placeholder="Share your clinical background, population interests, and availability..."
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Career Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
