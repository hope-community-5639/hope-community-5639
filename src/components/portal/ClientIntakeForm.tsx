import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../db/store';
import { IntakeSubmission } from '../../types';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Shield,
  Download,
  Send,
  UserCheck,
  PenTool,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface ClientIntakeFormProps {
  existingIntake?: IntakeSubmission;
  onCompleted: () => void;
}

export const ClientIntakeForm: React.FC<ClientIntakeFormProps> = ({
  existingIntake,
  onCompleted,
}) => {
  const { currentUser } = useAuth();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    dateOfBirth: existingIntake?.dateOfBirth || '1992-06-14',
    phone: existingIntake?.phone || currentUser?.phone || '(803) 555-0142',
    address: existingIntake?.address || '412 Calhoun St, Rock Hill, SC 29730',
    emergencyContactName: existingIntake?.emergencyContact?.name || 'Jonathan Vance',
    emergencyContactPhone: existingIntake?.emergencyContact?.phone || '(803) 555-0188',
    emergencyContactRelation: existingIntake?.emergencyContact?.relationship || 'Spouse',
    preferredLanguage: existingIntake?.preferredLanguage || 'English',
    serviceRequested: existingIntake?.serviceRequested || 'Clinical Therapy',
    preferredDelivery: existingIntake?.preferredDelivery || 'office',
    insuranceType: existingIntake?.insuranceType || 'private',
    insuranceProvider: existingIntake?.insuranceProvider || 'SC Medicaid - Healthy Connections',
    insurancePolicyNumber: existingIntake?.policyNumber || 'SC-MED-849204',
    primaryCarePhysician: 'Dr. Robert Davis, Piedmont Family Practice',
    pcpPhone: '(803) 327-1000',
    primaryConcern: existingIntake?.primaryConcerns?.[0] || 'Persistent anxiety, workplace burnout, and difficulty sleeping.',
    symptomSeverity: existingIntake?.symptomSeverity || 'moderate',
    previousTherapyHistory: existingIntake?.priorCareDetails || 'Attended college counseling center in 2018 for brief situational stress.',
    currentMedications: existingIntake?.currentMedications || 'None currently prescribed.',
    symptomsChecklist: existingIntake?.primaryConcerns || ['Anxiety / Worry', 'Sleep Disturbance', 'Fatigue / Low Energy'],
    crisisSafetyHistory: 'No history of self-harm or suicidal ideation. Denies current suicidal or homicidal ideation.',
    // Consents
    consentToTreatment: existingIntake?.consentTreatmentSigned ?? true,
    consentToTelehealth: existingIntake?.consentTelehealthSigned ?? true,
    hipaaAcknowledgment: existingIntake?.hipaaAcknowledged ?? true,
    consentToSharePCP: true,
    financialResponsibility: true,
    electronicSignature: `${currentUser?.firstName || 'Eleanor'} ${currentUser?.lastName || 'Vance'}`,
  });

  const symptomOptions = [
    'Anxiety / Worry',
    'Depression / Sadness',
    'Sleep Disturbance',
    'Fatigue / Low Energy',
    'Trauma / Flashbacks',
    'Anger / Irritability',
    'Relationship Conflict',
    'Grief / Bereavement',
    'Substance / Addiction Concerns',
    'Eating / Appetite Changes',
  ];

  const toggleSymptom = (sym: string) => {
    setFormData((prev) => {
      const exists = prev.symptomsChecklist.includes(sym);
      return {
        ...prev,
        symptomsChecklist: exists
          ? prev.symptomsChecklist.filter((s: string) => s !== sym)
          : [...prev.symptomsChecklist, sym],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    dbStore.submitIntake(
      {
        clientId: currentUser.id,
        clientName: `${currentUser.firstName} ${currentUser.lastName}`,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelation,
          phone: formData.emergencyContactPhone,
        },
        preferredLanguage: formData.preferredLanguage,
        serviceRequested: formData.serviceRequested,
        preferredDelivery: formData.preferredDelivery as any,
        insuranceType: formData.insuranceType as any,
        insuranceProvider: formData.insuranceProvider,
        policyNumber: formData.insurancePolicyNumber,
        primaryConcerns: formData.symptomsChecklist,
        symptomSeverity: formData.symptomSeverity as any,
        currentMedications: formData.currentMedications,
        priorMentalHealthCare: !!formData.previousTherapyHistory,
        priorCareDetails: formData.previousTherapyHistory,
        consentTreatmentSigned: formData.consentToTreatment,
        consentTelehealthSigned: formData.consentToTelehealth,
        hipaaAcknowledged: formData.hipaaAcknowledgment,
        signatureDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60"><text x="10" y="40" font-family="cursive" font-size="24" fill="%23173F3A">${encodeURIComponent(formData.electronicSignature)}</text></svg>`,
        signatureDate: new Date().toISOString(),
      },
      currentUser
    );

    setSubmittedSuccess(true);
    setTimeout(() => {
      onCompleted();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-10 shadow-xs space-y-8">
      {/* Form Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#216761]">
            Clinical Paperwork & Regulatory Consents
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#173F3A] mt-1">
            Comprehensive Client Intake & Consent Package
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            Required prior to initial assessment • Stored securely under HIPAA standards
          </p>
        </div>

        {existingIntake && (
          <div className="flex items-center gap-3">
            <StatusBadge status={existingIntake.status} />
            <button
              type="button"
              onClick={() => window.alert('Generated PDF with official electronic timestamp and signature.')}
              className="px-3 py-1.5 rounded-lg border border-[#A9C2B2]/60 text-xs font-semibold text-[#173F3A] hover:bg-[#F8F5EE] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#216761]" />
              Export Signed PDF
            </button>
          </div>
        )}
      </div>

      {existingIntake?.status === 'approved' && (
        <div className="p-4 bg-[#216761]/10 border border-[#216761]/30 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#216761] shrink-0 mt-0.5" />
          <div className="text-xs text-[#173F3A] leading-relaxed">
            <strong>Approved Intake On File:</strong> Reviewed and countersigned by clinical staff on {existingIntake.reviewedAt?.split('T')[0]}. Notes: <em>"{existingIntake.staffReviewerNotes || 'Complete and verified'}"</em>. You may review your answers below.
          </div>
        </div>
      )}

      {submittedSuccess ? (
        <div className="p-8 bg-[#216761]/15 border border-[#216761] rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#216761] mx-auto" />
          <h3 className="font-serif font-bold text-xl text-[#173F3A]">
            Intake Successfully Submitted & Signed!
          </h3>
          <p className="text-xs text-[#66736F] max-w-md mx-auto">
            Your clinical intake questionnaire and electronic consents have been securely filed in your medical chart.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Demographics & Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#173F3A] flex items-center gap-2 border-b border-[#F1ECE1] pb-2">
              <UserCheck className="w-4 h-4 text-[#216761]" />
              1. Demographics & Emergency Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Relationship to Contact
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Primary Care Physician (PCP)
                </label>
                <input
                  type="text"
                  value={formData.primaryCarePhysician}
                  onChange={(e) => setFormData({ ...formData, primaryCarePhysician: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  PCP Office Phone
                </label>
                <input
                  type="tel"
                  value={formData.pcpPhone}
                  onChange={(e) => setFormData({ ...formData, pcpPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Symptoms & History */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#173F3A] flex items-center gap-2 border-b border-[#F1ECE1] pb-2">
              <Shield className="w-4 h-4 text-[#216761]" />
              2. Clinical Symptoms & Behavioral History
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-2">
                Check Current or Recent Symptoms:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {symptomOptions.map((sym) => {
                  const checked = formData.symptomsChecklist.includes(sym);
                  return (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 ${
                        checked
                          ? 'bg-[#216761]/15 border-[#216761] text-[#173F3A] font-bold'
                          : 'border-[#A9C2B2]/40 text-[#66736F] hover:bg-[#F8F5EE]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${checked ? 'bg-[#216761] text-white' : 'border-gray-400'}`}>
                        {checked && '✓'}
                      </span>
                      <span>{sym}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Primary Reason for Seeking Support *
              </label>
              <textarea
                required
                rows={3}
                value={formData.primaryConcern}
                onChange={(e) => setFormData({ ...formData, primaryConcern: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Previous Therapy or Psychiatric History
                </label>
                <textarea
                  rows={2}
                  value={formData.previousTherapyHistory}
                  onChange={(e) => setFormData({ ...formData, previousTherapyHistory: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Current Medications & Dosages
                </label>
                <textarea
                  rows={2}
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Safety, Crisis & Self-Harm Screening *
              </label>
              <textarea
                required
                rows={2}
                value={formData.crisisSafetyHistory}
                onChange={(e) => setFormData({ ...formData, crisisSafetyHistory: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE]/50 rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Legal Disclosures & Consents */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#173F3A] flex items-center gap-2 border-b border-[#F1ECE1] pb-2">
              <FileCheck className="w-4 h-4 text-[#216761]" />
              3. Legal Disclosures & Mandatory Consents
            </h3>

            <div className="space-y-3 text-xs text-[#202826]">
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#A9C2B2]/40 bg-[#F8F5EE]/30 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentToTreatment}
                  onChange={(e) => setFormData({ ...formData, consentToTreatment: e.target.checked })}
                  className="mt-0.5 rounded text-[#216761] focus:ring-[#216761]"
                />
                <div>
                  <strong className="block text-[#173F3A]">Consent to Behavioral Health Evaluation & Treatment</strong>
                  <span className="text-[#66736F]">
                    I hereby authorize Hope Community Support and its credentialed clinicians to provide diagnostic assessment, therapy, behavioral intervention, counseling, and related supportive care.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#A9C2B2]/40 bg-[#F8F5EE]/30 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentToTelehealth}
                  onChange={(e) => setFormData({ ...formData, consentToTelehealth: e.target.checked })}
                  className="mt-0.5 rounded text-[#216761] focus:ring-[#216761]"
                />
                <div>
                  <strong className="block text-[#173F3A]">Informed Consent for Telehealth Services</strong>
                  <span className="text-[#66736F]">
                    I understand that telehealth sessions occur via encrypted interactive audio/video connections, and I retain the right to withhold or withdraw consent at any time.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#A9C2B2]/40 bg-[#F8F5EE]/30 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.hipaaAcknowledgment}
                  onChange={(e) => setFormData({ ...formData, hipaaAcknowledgment: e.target.checked })}
                  className="mt-0.5 rounded text-[#216761] focus:ring-[#216761]"
                />
                <div>
                  <strong className="block text-[#173F3A]">Acknowledgment of HIPAA Notice of Privacy Practices</strong>
                  <span className="text-[#66736F]">
                    I acknowledge that I have received, reviewed, or had the opportunity to inspect the Hope Community Support Notice of Privacy Practices explaining how my PHI is used and protected.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#A9C2B2]/40 bg-[#F8F5EE]/30 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.financialResponsibility}
                  onChange={(e) => setFormData({ ...formData, financialResponsibility: e.target.checked })}
                  className="mt-0.5 rounded text-[#216761] focus:ring-[#216761]"
                />
                <div>
                  <strong className="block text-[#173F3A]">Financial Agreement & 24-Hour Cancellation Policy</strong>
                  <span className="text-[#66736F]">
                    I agree to assign applicable insurance / Medicaid benefits to Hope Community Support and acknowledge that 24 hours advance notice is required for cancellations.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Electronic Signature */}
          <div className="p-5 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/50 space-y-4">
            <h4 className="font-serif font-bold text-sm text-[#173F3A] flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#216761]" />
              Electronic Signature Execution
            </h4>
            <p className="text-xs text-[#66736F]">
              By typing your legal name below, you certify that all information provided is accurate and that you legally consent to the agreements set forth above.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Legal Signer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.electronicSignature}
                  onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                  placeholder="First and Last Legal Name"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:outline-none font-serif italic text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Date of Execution
                </label>
                <input
                  type="text"
                  disabled
                  value={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  className="w-full px-3 py-2 text-xs bg-gray-100 rounded-lg border border-gray-300 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] transition-colors flex items-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4 text-[#C6A66B]" />
              Submit Completed Intake & Consents
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
