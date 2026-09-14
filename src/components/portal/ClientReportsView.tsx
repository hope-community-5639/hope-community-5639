import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clinicalStore } from '../../db/clinicalStore';
import { FormalReport } from '../../types/clinical';
import {
  FileText,
  CheckCircle2,
  Download,
  Printer,
  Shield,
  Calendar,
  User,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const ClientReportsView: React.FC = () => {
  const { currentUser } = useAuth();
  const reports = clinicalStore.getReports(currentUser);
  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports[0]?.id || 'rpt-vance-001'
  );
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);

  const selectedReport: FormalReport | undefined =
    reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleConfirmReport = () => {
    if (!selectedReport) return;
    const updated: FormalReport = {
      ...selectedReport,
      clientConfirmed: true,
      clientConfirmedAt: new Date().toISOString(),
      status: 'client_confirmed',
      updatedAt: new Date().toISOString(),
    };
    clinicalStore.saveReport(updated);
    setConfirmationSuccess(true);
    setTimeout(() => setConfirmationSuccess(false), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-[#FAF7F0] border border-[#A9C2B2]/60 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#216761] flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-[#173F3A] block">Formal Clinical Documentation</span>
          <span className="text-[#66736F]">
            Reports displayed here have undergone mandatory human review, verification, and electronic signature by your licensed behavioral health provider. You can review your goals, confirmed insights, and download records for your personal files.
          </span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-[#66736F] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#173F3A]">No Approved Reports Available Yet</h3>
          <p className="text-xs text-[#66736F] max-w-md mx-auto">
            Your clinical team generates reports following formal session interviews. Once your clinician finishes their review and signs the report, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Report List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#173F3A] px-1">
              Your Clinical Records ({reports.length})
            </h3>
            <div className="space-y-2">
              {reports.map((rpt) => (
                <button
                  key={rpt.id}
                  onClick={() => setSelectedReportId(rpt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedReport?.id === rpt.id
                      ? 'bg-white border-[#216761] shadow-xs ring-1 ring-[#216761]/30'
                      : 'bg-[#F8F5EE]/60 border-[#A9C2B2]/40 hover:bg-white text-[#66736F]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#216761] font-bold">
                      {rpt.reportReference}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      Approved
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-xs text-[#173F3A]">
                    Clinical Interview & Assessment
                  </h4>
                  <p className="text-[11px] text-[#66736F] mt-1">
                    Date: {rpt.sessionDate} • {rpt.sessionModality.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-[#216761] font-medium mt-1">
                    Signed by {rpt.providerName}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Report Document View */}
          {selectedReport && (
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#A9C2B2]/50 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Document Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1ECE1] pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold bg-[#216761]/10 text-[#216761] px-2.5 py-0.5 rounded-full">
                      {selectedReport.reportReference}
                    </span>
                    <span className="text-xs text-[#66736F]">Version {selectedReport.version}.0</span>
                  </div>
                  <h2 className="font-serif font-bold text-2xl text-[#173F3A]">
                    Formal Clinical Interview & Care Summary
                  </h2>
                  <p className="text-xs text-[#66736F] mt-1">
                    Organization: Hope Community Support — Hands On Personal Empowerment
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg border border-[#A9C2B2]/60 text-xs font-semibold text-[#173F3A] hover:bg-[#F8F5EE] flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Patient & Clinician Metadata Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#F8F5EE] rounded-xl text-xs border border-[#A9C2B2]/30">
                <div>
                  <span className="text-[#66736F] block text-[11px]">Client Name</span>
                  <span className="font-bold text-[#173F3A]">{selectedReport.clientName}</span>
                </div>
                <div>
                  <span className="text-[#66736F] block text-[11px]">Date of Evaluation</span>
                  <span className="font-bold text-[#173F3A]">{selectedReport.sessionDate}</span>
                </div>
                <div>
                  <span className="text-[#66736F] block text-[11px]">Licensed Provider</span>
                  <span className="font-bold text-[#173F3A]">{selectedReport.providerName}</span>
                </div>
                <div>
                  <span className="text-[#66736F] block text-[11px]">Credentials & License</span>
                  <span className="font-bold text-[#216761]">{selectedReport.providerCredentials}</span>
                </div>
              </div>

              {/* Section: Executive Summary */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-base text-[#173F3A] border-b border-[#F1ECE1] pb-1">
                  1. Executive Clinical Summary
                </h3>
                <p className="text-xs text-[#202826] leading-relaxed">
                  {selectedReport.executiveSummary}
                </p>
              </div>

              {/* Section: Client-Reported Goals */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-base text-[#173F3A] border-b border-[#F1ECE1] pb-1">
                  2. Client-Reported Goals & Focus Areas
                </h3>
                <ul className="space-y-1.5 text-xs text-[#202826]">
                  {selectedReport.clientReportedGoals.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#216761] flex-shrink-0 mt-0.5" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section: Strengths and Resources */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-base text-[#173F3A] border-b border-[#F1ECE1] pb-1">
                  3. Identified Strengths & Support Systems
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.strengthsAndSupportResources.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#216761]/10 text-[#173F3A] text-xs font-semibold"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section: Agreed Next Steps */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-base text-[#173F3A] border-b border-[#F1ECE1] pb-1">
                  4. Agreed Next Steps & Weekly Objectives
                </h3>
                <div className="space-y-2 text-xs">
                  {selectedReport.agreedNextSteps.map((step, idx) => (
                    <div key={idx} className="p-3 bg-[#FAF7F0] rounded-lg border border-[#C6A66B]/40 flex items-start gap-2.5">
                      <span className="font-bold text-[#216761]">{idx + 1}.</span>
                      <span className="text-[#173F3A] font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Provider Signature & Audit Stamp */}
              <div className="p-5 bg-[#FAF7F0] border border-[#C6A66B]/60 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#216761] font-bold">
                  <Award className="w-4 h-4 text-[#C6A66B]" />
                  <span>Licensed Provider Review & Electronic Signature Verification</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#66736F] block text-[11px]">Provider Signature Stamp</span>
                    <span className="font-serif italic font-bold text-base text-[#173F3A]">
                      {selectedReport.providerSignature || selectedReport.providerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#66736F] block text-[11px]">Signature Timestamp</span>
                    <span className="font-mono text-xs text-[#173F3A]">
                      {selectedReport.providerSignatureTimestamp || selectedReport.updatedAt}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#66736F] leading-tight pt-1">
                  {selectedReport.disclaimer}
                </p>
              </div>

              {/* Client Confirmation Action Banner */}
              <div className="p-4 bg-white border border-[#A9C2B2]/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="font-bold text-[#173F3A] block">Client Review & Confirmation</span>
                  <span className="text-[#66736F]">
                    {selectedReport.clientConfirmed
                      ? `You confirmed review of this report on ${selectedReport.clientConfirmedAt?.split('T')[0]}.`
                      : 'Please acknowledge that you have reviewed your report and agreed goals.'}
                  </span>
                </div>

                {selectedReport.clientConfirmed ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt Confirmed</span>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmReport}
                    className="px-4 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] flex items-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#C6A66B]" />
                    <span>Confirm I Have Read My Report</span>
                  </button>
                )}
              </div>

              {confirmationSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your acknowledgment has been recorded with a secure timestamp.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
