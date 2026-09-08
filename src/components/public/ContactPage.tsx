import React, { useState } from 'react';
import { MapPin, Phone, Mail, Printer, Clock, Send, CheckCircle2, Shield } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import { dbStore } from '../../db/store';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    preferredContact: 'phone',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Log contact inquiry into audit / security log
    dbStore.logAction(
      null,
      'PUBLIC_CONTACT_INQUIRY',
      'contact_messages',
      `inquiry_${Date.now()}`,
      `Inquiry from ${form.name} (${form.email}) regarding ${form.subject}`
    );
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
          We Are Here to Listen
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A] mt-1">
          Contact Hope Community Support
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          Reach out directly to our Rock Hill office. Whether inquiring about services, coverage, or partnerships, our compassionate intake staff is ready to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information & Office Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs space-y-6">
            <h3 className="font-serif font-bold text-xl text-[#173F3A] border-b border-[#F1ECE1] pb-3">
              Office & Communications Directory
            </h3>

            <div className="space-y-4 text-xs text-[#202826]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#216761]/10 text-[#216761] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-sm text-[#173F3A]">Main Physical Clinic</strong>
                  <span className="text-[#66736F] leading-relaxed">
                    331 E Main Street Downtown, Suite 200
                    <br />
                    Rock Hill, SC 29730
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#216761]/10 text-[#216761] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-sm text-[#173F3A]">Telephone</strong>
                  <a href="tel:8037019332" className="text-[#216761] hover:underline font-bold text-sm">
                    (803) 701-9332
                  </a>
                  <span className="block text-[11px] text-[#66736F]">Intake triage & administrative questions</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#216761]/10 text-[#216761] flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-sm text-[#173F3A]">Confidential Healthcare Fax</strong>
                  <span className="font-mono text-sm text-[#173F3A]">980-217-8340</span>
                  <span className="block text-[11px] text-[#66736F]">Direct line for doctor and court records</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#216761]/10 text-[#216761] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-sm text-[#173F3A]">General Inquiries Email</strong>
                  <a href="mailto:hopecommunitysc@gmail.com" className="text-[#216761] hover:underline font-medium">
                    hopecommunitysc@gmail.com
                  </a>
                  <span className="block text-[11px] text-[#66736F]">For non-emergency communications</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#216761]/10 text-[#216761] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-sm text-[#173F3A]">Clinic Operating Hours</strong>
                  <span className="text-[#66736F] leading-relaxed block">
                    Monday – Thursday: 8:30 AM – 6:00 PM
                    <br />
                    Friday: 9:00 AM – 4:00 PM
                    <br />
                    Saturday: By Appointment Only
                    <br />
                    Sunday: Closed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Inquiries Form */}
        <div className="bg-[#F8F5EE] rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs">
          <h3 className="font-serif font-bold text-xl text-[#173F3A] mb-1">
            Send an Online Message
          </h3>
          <p className="text-xs text-[#66736F] mb-6">
            Please do not submit sensitive personal health records (PHI) through this public form. Existing clients should use the secure Client Portal.
          </p>

          {submitted ? (
            <div className="p-6 bg-white border border-[#216761] rounded-xl text-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-[#216761] mx-auto mb-2" />
              <h4 className="font-serif font-bold text-base text-[#173F3A]">Message Delivered</h4>
              <p className="text-xs text-[#66736F] mt-1 leading-relaxed">
                Thank you, {form.name}. Your inquiry has been routed to our intake department. A team member will respond within 1 business day via {form.preferredContact}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-bold text-[#216761] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="First and Last Name"
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
                    placeholder="(803) 555-0100"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Insurance & Coverage">Insurance & Medicaid Coverage</option>
                    <option value="In-Home Services">In-Home Services Availability</option>
                    <option value="Billing Question">Billing Question</option>
                    <option value="Community Partnership">Community Partnership / Outreach</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Preferred Contact Method
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="phone"
                      checked={form.preferredContact === 'phone'}
                      onChange={() => setForm({ ...form, preferredContact: 'phone' })}
                    />
                    Phone Call
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="email"
                      checked={form.preferredContact === 'email'}
                      onChange={() => setForm({ ...form, preferredContact: 'email' })}
                    />
                    Email
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Message or Question *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors inline-flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
