import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  FileCheck,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface PrivacyRequest {
  id: string;
  type: 'access_copy' | 'amendment' | 'accounting_of_disclosures' | 'restriction';
  typeLabel: string;
  status: 'submitted' | 'under_review' | 'fulfilled' | 'denied';
  submittedDate: string;
  completionTargetDate: string;
  details: string;
  trackingNumber: string;
}

export const ClientPrivacyRequestsView: React.FC = () => {
  const { currentUser } = useAuth();

  const [requests, setRequests] = useState<PrivacyRequest[]>([
    {
      id: 'pr-2026-01',
      type: 'access_copy',
      typeLabel: 'HIPAA Right of Access (Designated Record Set)',
      status: 'fulfilled',
      submittedDate: '2026-03-10',
      completionTargetDate: '2026-04-09',
      details: 'Electronic copy of completed clinical assessment and initial care plan in PDF format.',
      trackingNumber: 'HCS-HIPAA-2026-0914',
    },
  ]);

  const [requestType, setRequestType] = useState<PrivacyRequest['type']>('access_copy');
  const [requestDetails, setRequestDetails] = useState('');
  const [formatPreference, setFormatPreference] = useState('secure_portal_pdf');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDetails.trim()) return;

    const labelMap: Record<PrivacyRequest['type'], string> = {
      access_copy: 'HIPAA Right of Access (Designated Record Set)',
      amendment: 'Request for Amendment / Correction of Health Information',
      accounting_of_disclosures: 'Accounting of Disclosures (Past 6 Years)',
      restriction: 'Request for Restriction of Information Disclosures',
    };

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30); // 30-day statutory HIPAA timeline

    const newReq: PrivacyRequest = {
      id: `pr-${Date.now()}`,
      type: requestType,
      typeLabel: labelMap[requestType],
      status: 'submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      completionTargetDate: targetDate.toISOString().split('T')[0],
      details: requestDetails,
      trackingNumber: `HCS-HIPAA-${Date.now().toString().slice(-6)}`,
    };

    setRequests([newReq, ...requests]);
    setShowSubmitModal(false);
    setRequestDetails('');
    setSuccessNotice(
      `Your privacy request (${newReq.trackingNumber}) has been securely logged. Under federal law, Hope Community Support will respond within 30 days.`
    );
    setTimeout(() => setSuccessNotice(null), 8000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#216761]/10 text-[#216761]">
              HIPAA Rights & Protections
            </span>
            <span className="text-xs text-[#66736F]">45 CFR § 164.524 / 164.526 / 164.528</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#173F3A]">
            Privacy & Health Information Requests
          </h2>
          <p className="text-xs text-[#66736F] mt-1 max-w-2xl">
            You hold individual statutory rights under the HIPAA Privacy Rule to inspect, obtain copies, request amendments, or demand an accounting of disclosures of your Protected Health Information (PHI).
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center gap-2 shadow-xs"
        >
          <FileCheck className="w-4 h-4 text-[#C6A66B]" />
          Submit Privacy Request
        </button>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Existing Requests List */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#173F3A]">
          Your Privacy & Disclosure Requests ({requests.length})
        </h3>

        <div className="divide-y divide-[#F1ECE1]">
          {requests.map((req) => (
            <div key={req.id} className="py-4 first:pt-0 last:pb-0 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-[#216761] mr-2">
                    {req.trackingNumber}
                  </span>
                  <span className="font-serif font-bold text-sm text-[#173F3A]">
                    {req.typeLabel}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    req.status === 'fulfilled'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'under_review'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {req.status === 'fulfilled'
                    ? '✓ Completed & Fulfilled'
                    : req.status === 'under_review'
                    ? 'Clinical Privacy Officer Review'
                    : 'Submitted (30-day clock active)'}
                </span>
              </div>

              <p className="text-[#202826] bg-[#F8F5EE] p-3 rounded-lg border border-[#A9C2B2]/30">
                {req.details}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-[#66736F] pt-1">
                <span>Submitted: {req.submittedDate}</span>
                <span>Statutory Deadline: {req.completionTargetDate}</span>
                <span>Privacy Officer: Compliance Division, Rock Hill, SC</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="border-b border-[#F1ECE1] pb-3">
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Submit Formal HIPAA Privacy Request
              </h3>
              <p className="text-xs text-[#66736F] mt-1">
                This request is routed directly to the Hope Community Support Privacy and Compliance Officer.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  Type of Privacy Request *
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 font-medium text-xs"
                >
                  <option value="access_copy">
                    Right of Access — Request Copy of Clinical & Billing Records
                  </option>
                  <option value="amendment">
                    Right to Amend — Request Correction of Disputed Record Item
                  </option>
                  <option value="accounting_of_disclosures">
                    Right to an Accounting of Disclosures
                  </option>
                  <option value="restriction">
                    Right to Request Restrictions on Treatment Disclosures
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  Delivery Format
                </label>
                <select
                  value={formatPreference}
                  onChange={(e) => setFormatPreference(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 font-medium text-xs"
                >
                  <option value="secure_portal_pdf">Secure Electronic Download (Client Portal PDF)</option>
                  <option value="encrypted_email">Password-Protected Encrypted Email</option>
                  <option value="certified_mail">Certified Paper Mail to Mailing Address</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  Specific Records or Description of Request *
                </label>
                <textarea
                  required
                  rows={4}
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                  placeholder="Identify dates of service, specific clinical reports, provider names, or exact statements you wish to amend..."
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                />
              </div>

              <div className="p-3 bg-[#FAF7F0] border border-[#C6A66B]/50 rounded-lg text-[11px] text-[#66736F]">
                Hope Community Support will fulfill access requests within 30 calendar days as required by 45 CFR § 164.524. No fee is charged for electronic portal copies.
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#F1ECE1]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg text-[#66736F] hover:bg-[#F8F5EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#216761] text-white font-bold hover:bg-[#173F3A]"
                >
                  Submit Formal Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
