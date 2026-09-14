import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClinicalInvoice } from '../../types/clinical';
import { clinicalStore } from '../../db/clinicalStore';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Download,
  CreditCard,
  Lock,
  Clock,
  UserCheck,
} from 'lucide-react';

export const BillingAuditView: React.FC = () => {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState<ClinicalInvoice[]>([
    {
      id: 'inv-2026-001',
      invoiceReference: 'HCS-INV-2026-0418',
      clientId: 'user-client-1',
      clientName: 'Eleanor Vance',
      providerId: 'user-staff-1',
      providerName: 'Dr. Sarah Jenkins, LPC',
      appointmentId: 'apt-001',
      formalReportId: 'rpt-vance-001',
      sessionDate: '2026-03-20',
      billingCodes: [
        {
          code: '90834',
          description: 'Psychotherapy, 45 minutes with client',
          standardFee: 150.0,
          rateCharged: 150.0,
          requiresHumanVerification: true,
        },
      ],
      totalBilled: 150.0,
      clientCopayDue: 0.0,
      paymentStatus: 'paid_in_full',
      paymentMethod: 'credit_card',
      humanVerifiedStatus: 'verified_approved',
      verifiedByStaffId: 'user-staff-1',
      verifiedByStaffName: 'Dr. Sarah Jenkins, LPC',
      verifiedAt: '2026-03-20T17:00:00Z',
      createdAt: '2026-03-20T16:45:00Z',
      updatedAt: '2026-03-20T17:00:00Z',
    },
    {
      id: 'inv-2026-002',
      invoiceReference: 'HCS-INV-2026-0492',
      clientId: 'user-client-1',
      clientName: 'Eleanor Vance',
      providerId: 'user-staff-1',
      providerName: 'Dr. Sarah Jenkins, LPC',
      appointmentId: 'apt-002',
      sessionDate: '2026-03-27',
      billingCodes: [
        {
          code: '90834',
          description: 'Psychotherapy, 45 minutes with client',
          standardFee: 150.0,
          rateCharged: 150.0,
          requiresHumanVerification: true,
        },
      ],
      totalBilled: 150.0,
      clientCopayDue: 0.0,
      paymentStatus: 'pending_payment',
      paymentMethod: 'credit_card',
      humanVerifiedStatus: 'pending_human_review',
      createdAt: '2026-03-27T16:00:00Z',
      updatedAt: '2026-03-27T16:00:00Z',
    },
  ]);

  const auditEvents = [
    {
      id: 'aud-01',
      timestamp: '2026-03-20 17:00:15',
      action: 'BILLING_HUMAN_VERIFICATION',
      actor: 'Dr. Sarah Jenkins, LPC',
      role: 'provider',
      client: 'Eleanor Vance',
      details: 'Verified CPT 90834 rate $150.00. Electronic claim transmission authorized.',
      hash: 'sha256-a94f82c0...',
    },
    {
      id: 'aud-02',
      timestamp: '2026-03-20 16:30:00',
      action: 'CLINICAL_REPORT_APPROVED',
      actor: 'Dr. Sarah Jenkins, LPC',
      role: 'provider',
      client: 'Eleanor Vance',
      details: 'Formal assessment HCS-RPT-2026-0814 signed under SC License #SC-LPC-84920.',
      hash: 'sha256-e41b9941...',
    },
    {
      id: 'aud-03',
      timestamp: '2026-03-20 15:45:10',
      action: 'AUDIO_ENCRYPTED_SEALED',
      actor: 'System / Offline Engine',
      role: 'system',
      client: 'Eleanor Vance',
      details: '468 seconds of audio chunks encrypted with AES-GCM and verified.',
      hash: 'sha256-11f8b3c9...',
    },
    {
      id: 'aud-04',
      timestamp: '2026-03-20 14:00:05',
      action: 'RECORDING_CONSENT_LOGGED',
      actor: 'Eleanor Vance',
      role: 'client',
      client: 'Eleanor Vance',
      details: 'Verified session-specific informed recording consent acknowledged prior to session start.',
      hash: 'sha256-9a2c10b7...',
    },
  ];

  const handleVerifyInvoice = (invId: string) => {
    if (!currentUser || currentUser.role === 'client') {
      alert('Only administrative staff and providers can conduct billing verification.');
      return;
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              humanVerifiedStatus: 'verified_approved',
              verifiedByStaffId: currentUser.id,
              verifiedByStaffName: `${currentUser.firstName} ${currentUser.lastName}`,
              verifiedAt: new Date().toISOString(),
            }
          : inv
      )
    );
    alert('Billing invoice human verification completed. Claim unlocked for processing.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E3DCC9] p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#202826]">
            Billing Statements & Compliance Verification
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Mandatory human verification required before insurance claim submission or statement finalization.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold bg-[#216761]/10 text-[#216761] px-3 py-1.5 rounded-lg">
          <Shield className="w-4 h-4 mr-1" />
          <span>HIPAA & Ethical Fee Compliance Active</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Clinical Services Statements
          </h2>
          <span className="text-xs text-gray-500">2 Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Invoice Ref</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">CPT Code</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Human Verification</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="p-3.5 font-mono font-bold text-gray-900">{inv.invoiceReference}</td>
                  <td className="p-3.5 text-gray-600">{inv.sessionDate}</td>
                  <td className="p-3.5 font-medium text-gray-900">{inv.clientName}</td>
                  <td className="p-3.5">
                    {inv.billingCodes.map((c, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-mono">
                        {c.code}
                      </span>
                    ))}
                  </td>
                  <td className="p-3.5 font-bold text-gray-900">${inv.totalBilled.toFixed(2)}</td>
                  <td className="p-3.5">
                    {inv.humanVerifiedStatus === 'verified_approved' ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center w-fit">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified by {inv.verifiedByStaffName}
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center w-fit">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Human Review
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      inv.paymentStatus === 'paid_in_full' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {inv.paymentStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {inv.humanVerifiedStatus === 'pending_human_review' && currentUser?.role !== 'client' ? (
                      <button
                        type="button"
                        onClick={() => handleVerifyInvoice(inv.id)}
                        className="px-3 py-1 rounded bg-[#216761] text-white text-[11px] font-bold hover:bg-[#184e49]"
                      >
                        Verify & Release
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Receipt downloaded for ${inv.invoiceReference}`)}
                        className="text-gray-500 hover:text-gray-900 font-medium"
                      >
                        Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Security & Compliance Audit Log */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-gray-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Immutable Clinical Compliance & Security Audit Trail
            </h2>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">Export: CSV / JSON</span>
        </div>

        <div className="divide-y divide-gray-200 text-xs">
          {auditEvents.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-500">{evt.timestamp}</span>
                  <span className="bg-[#216761]/10 text-[#216761] px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                    {evt.action}
                  </span>
                  <span className="font-semibold text-gray-800">{evt.actor} ({evt.role})</span>
                </div>
                <p className="text-gray-600">{evt.details}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {evt.hash}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
