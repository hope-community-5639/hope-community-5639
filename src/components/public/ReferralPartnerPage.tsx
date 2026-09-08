import React, { useState } from 'react';
import { Send, CheckCircle2, Shield, Building, FileText, Phone } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import { dbStore } from '../../db/store';

export const ReferralPartnerPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    referringOrganization: '',
    referrerName: '',
    referrerTitle: '',
    referrerPhone: '',
    referrerEmail: '',
    clientFirstName: '',
    clientLastName: '',
    clientDOB: '',
    clientPhone: '',
    clientEmail: '',
    insuranceType: 'SC Medicaid (Healthy Connections)',
    requestedService: 'Clinical Therapy (CBT/EMDR)',
    deliveryPreference: 'office',
    urgencyLevel: 'standard',
    clinicalReason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbStore.submitReferral({
      referringOrganization: form.referringOrganization,
      referrerName: form.referrerName,
      referrerTitle: form.referrerTitle,
      referrerPhone: form.referrerPhone,
      referrerEmail: form.referrerEmail,
      clientFirstName: form.clientFirstName,
      clientLastName: form.clientLastName,
      clientDOB: form.clientDOB,
      clientPhone: form.clientPhone,
      clientEmail: form.clientEmail,
      insuranceType: form.insuranceType,
      requestedService: form.requestedService,
      deliveryPreference: form.deliveryPreference as any,
      urgencyLevel: form.urgencyLevel as any,
      clinicalReason: form.clinicalReason,
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-semibold mb-3">
          <Building className="w-3.5 h-3.5" />
          <span>Physicians • Schools • DSS • Healthcare Systems</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A]">
          Professional Referral Portal
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          Submit secure client referrals directly to the Hope Community Support clinical intake triage team. We ensure prompt outreach, verification of benefits, and collaborative feedback.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs">
        {submitted ? (
          <div className="p-8 bg-[#216761]/10 border border-[#216761] rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#216761] mx-auto" />
            <h3 className="font-serif font-bold text-xl text-[#173F3A]">
              Referral Received & Logged into Triage
            </h3>
            <p className="text-xs sm:text-sm text-[#66736F] max-w-md mx-auto leading-relaxed">
              Thank you for partnering with Hope Community Support. Our intake coordinator will initiate contact with <strong>{form.clientFirstName} {form.clientLastName}</strong> within 1–2 business days. A confirmation receipt has been generated.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-[#216761] hover:underline"
              >
                Submit another partner referral
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Referrer Information */}
            <div className="border-b border-[#F1ECE1] pb-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#173F3A] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#216761]" />
                1. Referring Organization & Professional Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Referring Organization / Agency *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.referringOrganization}
                    onChange={(e) => setForm({ ...form, referringOrganization: e.target.value })}
                    placeholder="e.g., Rock Hill Pediatric Clinic / York County DSS"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Referrer Full Name & Credentials *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.referrerName}
                    onChange={(e) => setForm({ ...form, referrerName: e.target.value })}
                    placeholder="e.g., Dr. Robert Lee, MD / Sarah Miller, MSW"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.referrerPhone}
                    onChange={(e) => setForm({ ...form, referrerPhone: e.target.value })}
                    placeholder="(803) 555-0150"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Contact Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.referrerEmail}
                    onChange={(e) => setForm({ ...form, referrerEmail: e.target.value })}
                    placeholder="rlee@pediatrics.org"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Client Demographics */}
            <div className="border-b border-[#F1ECE1] pb-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#173F3A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#216761]" />
                2. Client Demographics & Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Client First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.clientFirstName}
                    onChange={(e) => setForm({ ...form, clientFirstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Client Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.clientLastName}
                    onChange={(e) => setForm({ ...form, clientLastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.clientDOB}
                    onChange={(e) => setForm({ ...form, clientDOB: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Client/Parent Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Insurance / Payer
                  </label>
                  <select
                    value={form.insuranceType}
                    onChange={(e) => setForm({ ...form, insuranceType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  >
                    <option value="SC Medicaid (Healthy Connections)">SC Medicaid (Healthy Connections)</option>
                    <option value="First Choice / Select Health">First Choice / Select Health</option>
                    <option value="Absolute Total Care">Absolute Total Care</option>
                    <option value="Molina Healthcare">Molina Healthcare</option>
                    <option value="Commercial / Private Insurance">Commercial / Private Insurance</option>
                    <option value="Self-Pay / Sliding Scale">Self-Pay / Sliding Scale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Delivery Preference
                  </label>
                  <select
                    value={form.deliveryPreference}
                    onChange={(e) => setForm({ ...form, deliveryPreference: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                  >
                    <option value="office">In-Office (Downtown Rock Hill)</option>
                    <option value="in_home">In-Home Care (York & Surrounding SC)</option>
                    <option value="telehealth">Telehealth (Statewide SC)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Reason for Referral */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Reason for Referral & Clinical Goals *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.clinicalReason}
                  onChange={(e) => setForm({ ...form, clinicalReason: e.target.value })}
                  placeholder="Summarize presenting concerns, recent stressors, family context, or school behavioral observations..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>

              <div className="p-3 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/30 text-[11px] text-[#66736F] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#216761] shrink-0" />
                <span>
                  <strong>HIPAA Transmission Notice:</strong> Submissions are logged securely into our HIPAA-compliant database with immutable audit trails. Records can also be faxed directly to <strong>980-217-8340</strong>.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-[#C6A66B]" />
              Submit Professional Referral
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
