import React, { useState } from 'react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import {
  PhoneCall,
  FileDown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What insurance and payment plans does Hope Community Support accept?',
      a: 'We accept South Carolina Medicaid (Healthy Connections, First Choice by Select Health, Absolute Total Care, Molina Healthcare, BlueChoice HealthPlan) and major commercial insurance carriers. For uninsured clients, we offer an income-based sliding-scale fee schedule to keep care affordable.',
    },
    {
      q: 'What is the difference between Clinical Therapy and Behavioral Intervention?',
      a: 'Clinical Therapy focuses on diagnosing and treating emotional, psychological, and trauma-related conditions through therapeutic modalities like CBT and EMDR. Behavioral Intervention focuses on actionable habit formation, coping skills, positive communication, and emotional regulation in everyday environments like home and school.',
    },
    {
      q: 'How does in-home support work and who qualifies?',
      a: 'In-home behavioral support is available for youth and adults across York, Chester, and Lancaster counties where traveling to our clinic presents significant hardship, or when observing and practicing skills in the natural living environment yields superior clinical outcomes.',
    },
    {
      q: 'What should I expect during my very first appointment?',
      a: 'Your first session is a gentle, thorough diagnostic assessment. You will meet with your licensed therapist to discuss your history, personal challenges, and hopes for the future. You are never pressured to disclose anything before you feel ready.',
    },
    {
      q: 'What are the technical requirements for secure Telehealth sessions?',
      a: 'All you need is an internet connection and any smartphone, tablet, or computer equipped with a webcam and microphone. Our telehealth portal runs smoothly in modern browsers (Chrome, Safari, Firefox, Edge) without requiring app downloads.',
    },
    {
      q: 'What is your appointment cancellation policy?',
      a: 'We request at least 24 hours advance notice for cancellations or rescheduling. This allows us to offer the open appointment time to another community member who may be waiting for care.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
          Community Support & Education
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A] mt-1">
          Resources, Crisis Contacts & FAQs
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          Knowledge and quick assistance are essential to empowerment. Explore crisis contact lifelines, downloadable forms, and answers to common client questions.
        </p>
      </div>

      {/* Crisis Lifeline Grid */}
      <div className="bg-[#173F3A] rounded-2xl p-8 text-white shadow-md">
        <h3 className="font-serif font-bold text-xl mb-2 text-[#C6A66B]">
          24/7 National & Local Crisis Lifelines
        </h3>
        <p className="text-xs text-[#A9C2B2] mb-6">
          If you or someone you care about is experiencing severe distress, suicidal ideation, or an acute mental health emergency:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#102D29] p-4 rounded-xl border border-[#216761]">
            <h4 className="font-bold text-sm text-white">988 Suicide & Crisis</h4>
            <p className="text-[11px] text-[#A9C2B2] mt-1">Call or text 988 anytime. Free, confidential, 24/7 support.</p>
            <a href="tel:988" className="mt-3 inline-block px-3 py-1 bg-[#C6A66B] text-[#173F3A] font-bold rounded text-xs">
              Call 988
            </a>
          </div>

          <div className="bg-[#102D29] p-4 rounded-xl border border-[#216761]">
            <h4 className="font-bold text-sm text-white">Crisis Text Line</h4>
            <p className="text-[11px] text-[#A9C2B2] mt-1">Text HOME to 741741 to connect with a crisis counselor.</p>
            <a href="sms:741741" className="mt-3 inline-block px-3 py-1 bg-[#216761] text-white font-bold rounded text-xs">
              Text 741741
            </a>
          </div>

          <div className="bg-[#102D29] p-4 rounded-xl border border-[#216761]">
            <h4 className="font-bold text-sm text-white">Veterans Crisis Line</h4>
            <p className="text-[11px] text-[#A9C2B2] mt-1">Dial 988 and press 1, or text 838255 for dedicated veterans care.</p>
            <a href="tel:988" className="mt-3 inline-block px-3 py-1 bg-[#216761] text-white font-bold rounded text-xs">
              Dial 988 (Ext 1)
            </a>
          </div>

          <div className="bg-[#102D29] p-4 rounded-xl border border-[#216761]">
            <h4 className="font-bold text-sm text-white">The Trevor Project</h4>
            <p className="text-[11px] text-[#A9C2B2] mt-1">Crisis intervention for LGBTQ+ young people: 1-866-488-7386.</p>
            <a href="tel:8664887386" className="mt-3 inline-block px-3 py-1 bg-[#216761] text-white font-bold rounded text-xs">
              Call TrevorLifeline
            </a>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs">
        <h3 className="font-serif font-bold text-2xl text-[#173F3A] mb-6 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#216761]" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-[#F1ECE1] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left px-5 py-4 bg-[#F8F5EE]/50 hover:bg-[#F8F5EE] flex items-center justify-between gap-4 font-serif font-bold text-sm text-[#173F3A]"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#216761] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#66736F] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 py-4 text-xs sm:text-sm text-[#66736F] leading-relaxed bg-white border-t border-[#F1ECE1]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
