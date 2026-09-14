import React, { useState } from 'react';
import {
  HelpCircle,
  LifeBuoy,
  PhoneCall,
  MessageSquare,
  Shield,
  Send,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SupportViewProps {
  onOpenCrisisModal: () => void;
  onOpenAccessibility: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  onOpenCrisisModal,
  onOpenAccessibility,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'technical' | 'scheduling' | 'billing' | 'accessibility'>('technical');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How do I join a scheduled telehealth session?',
      a: 'Navigate to "Telehealth Room" or click "Join Telehealth Room" from your appointment card 10 minutes prior to your session time. You will enter a secure, encrypted virtual waiting room where your clinician will admit you. Ensure your camera and microphone permissions are enabled in your browser.',
    },
    {
      q: 'Are my session recordings or clinical notes visible to other clients?',
      a: 'Strictly no. Hope Community Support enforces zero-cross-client database isolation and HIPAA-aligned access controls. Only your designated licensed clinical team and authorized supervisory personnel can view clinical charts. Raw recordings are disabled by default and require separate affirmative consent per session.',
    },
    {
      q: 'How do I request an official amendment to my intake records?',
      a: 'Under 45 CFR § 164.526, you have the right to request an amendment to your health records. Navigate to "Consent and Privacy" > "Privacy Requests" to submit a formal correction request. Your clinician and privacy officer will review and respond within 30 days.',
    },
    {
      q: 'What is the policy for canceling or rescheduling appointments?',
      a: 'We require 24 hours advance notice for cancellations to allow clinicians to offer the time slot to individuals in acute need. You can cancel or request rescheduling directly from the "Appointments" tab in this portal.',
    },
    {
      q: 'Is technical assistance available for low-bandwidth or assistive technology?',
      a: 'Yes. Our portal is built to WCAG 2.2 AA standards and supports screen readers, high contrast, text resizing, and keyboard-only navigation. You can adjust accessibility preferences using the Accessibility button below or submit a technical ticket for specialist assistance.',
    },
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Help Center & Technical Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Client Support & Assistance
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              We are dedicated to providing responsive, dignified support for portal operations, device setup, and care coordination.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenCrisisModal}
              className="px-4 py-2.5 rounded-lg bg-[#B3392F]/10 border border-[#B3392F]/30 text-[#B3392F] text-xs font-bold hover:bg-[#B3392F]/20 transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>24/7 Crisis Help (988)</span>
            </button>
            <button
              onClick={onOpenAccessibility}
              className="px-4 py-2.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] text-[#173F3A] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-[#216761]" />
              <span>Accessibility Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: FAQs + Ticket Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Frequently Asked Questions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#173F3A] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#216761]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-[#D9E1DC] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-serif font-semibold text-[#173F3A] text-sm sm:text-base hover:bg-[#F8F5EE]/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#216761] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#5F6F6B] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5F6F6B] leading-relaxed border-t border-[#D9E1DC]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Technical Support Request */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs space-y-4 self-start">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#216761]/10 text-[#216761]">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#173F3A]">Technical Assistance</h3>
          </div>

          <p className="text-xs text-[#5F6F6B] leading-relaxed">
            Need help with video telehealth, document uploads, or portal navigation? Submit a ticket to our clinical systems support desk.
          </p>

          {ticketSubmitted && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ticket submitted successfully. Our support desk responds within 2 business hours.</span>
            </div>
          )}

          <form onSubmit={handleTicketSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                Category:
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9E1DC] bg-white focus:border-[#216761] outline-none"
              >
                <option value="technical">Telehealth & Audio/Video Tech</option>
                <option value="scheduling">Appointment Rescheduling</option>
                <option value="billing">Billing & Insurance Query</option>
                <option value="accessibility">Accessibility & Screen Reader Assistance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                Subject:
              </label>
              <input
                type="text"
                required
                placeholder="Brief summary of the issue"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9E1DC] focus:border-[#216761] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-1">
                Details:
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your question or technical difficulty in detail..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9E1DC] focus:border-[#216761] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 text-[#C6A66B]" />
              <span>Submit Support Ticket</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
