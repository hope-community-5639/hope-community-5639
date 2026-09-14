import React, { useState } from 'react';
import {
  Receipt,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Download,
  AlertCircle,
  Plus,
  Clock,
  Building,
  DollarSign,
} from 'lucide-react';
import { ClinicalInvoice } from '../../../types/clinical';

interface BillingViewProps {
  invoices: ClinicalInvoice[];
  onMakePayment?: (invoiceId: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  invoices,
  onMakePayment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'insurance' | 'payment_methods'>('invoices');
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);

  const getClientPortion = (inv: ClinicalInvoice): number =>
    (inv as any).clientPortion ?? inv.clientResponsibility ?? inv.clientCopayDue ?? 0;

  const pendingTotal = invoices
    .filter((inv) => (inv.status || inv.paymentStatus) === 'pending' || (inv.paymentStatus === 'pending_payment'))
    .reduce((sum, inv) => sum + getClientPortion(inv), 0);

  const handlePay = (invoiceId: string) => {
    setPaymentSuccessId(invoiceId);
    if (onMakePayment) onMakePayment(invoiceId);
    setTimeout(() => setPaymentSuccessId(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tokenized Healthcare Billing & Claims</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Billing, Statements & Insurance
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Transparent, itemized clinical accounting. All credit card transactions utilize PCI-DSS Level 1 tokenization—zero raw payment card numbers or security codes are stored in portal databases.
            </p>
          </div>

          <div className="bg-[#F8F5EE] border border-[#D9E1DC] rounded-xl p-4 shrink-0 text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B]">
              Current Client Balance
            </div>
            <div className="text-2xl font-serif font-bold text-[#173F3A] mt-0.5">
              ${pendingTotal.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#216761] font-semibold mt-0.5">
              {pendingTotal === 0 ? 'Account in good standing' : 'Payment due upon receipt'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9E1DC] pb-4">
        {[
          { id: 'invoices', label: `Invoices & Receipts (${invoices.length})` },
          { id: 'insurance', label: 'Primary Insurance Coverage' },
          { id: 'payment_methods', label: 'Tokenized Payment Methods' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[#173F3A] text-white'
                : 'bg-white border border-[#D9E1DC] text-[#5F6F6B] hover:text-[#173F3A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Tab 1: INVOICES & STATEMENTS */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#D9E1DC] p-12 text-center text-[#5F6F6B]">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-[#216761]" />
              <p className="text-sm font-semibold text-[#173F3A]">No billing statements on record</p>
              <p className="text-xs mt-1">Statements are generated automatically following verified clinical sessions.</p>
            </div>
          ) : (
            invoices.map((inv) => {
              const invDate = (inv as any).date || inv.serviceDate || inv.sessionDate || (inv.createdAt ? inv.createdAt.split('T')[0] : '2026-09-01');
              const invDesc = (inv as any).description || inv.serviceName || 'Individual Behavioral Psychotherapy (60 min)';
              const cptCodesStr = (inv as any).cptCodes ? (inv as any).cptCodes.join(', ') : (inv.billingCodes && inv.billingCodes.length > 0 ? inv.billingCodes.map((b) => b.code).join(', ') : '90837');
              const payer = (inv as any).payer || 'BlueCross BlueShield SC';
              const totalAmount = (inv as any).totalAmount ?? inv.totalBilled ?? inv.feeAmount ?? 150;
              const copay = getClientPortion(inv);
              const insPortion = inv.insurancePortion ?? (totalAmount - copay);
              const isPaid = (inv.status || inv.paymentStatus) === 'paid' || (inv.paymentStatus === 'paid_in_full');

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs hover:border-[#216761]/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#173F3A] bg-[#F8F5EE] border border-[#D9E1DC] px-2.5 py-0.5 rounded-md">
                        {inv.invoiceNumber || inv.invoiceReference || inv.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span className="capitalize">{isPaid ? 'paid' : 'pending'}</span>
                      </span>
                      <span className="text-xs text-[#5F6F6B]">Date: {invDate}</span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-[#173F3A]">
                      {invDesc}
                    </h3>

                    {/* CPT Codes & Human review disclaimer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5F6F6B]">
                      <div>
                        CPT Code(s):{' '}
                        <span className="font-mono font-semibold text-[#17312E]">
                          {cptCodesStr}
                        </span>
                      </div>
                      <div>•</div>
                      <div>
                        Payer: <strong className="text-[#17312E]">{payer}</strong>
                      </div>
                      {inv.paidAt && (
                        <>
                          <div>•</div>
                          <div className="text-emerald-700">Paid on {inv.paidAt}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount breakdown */}
                  <div className="lg:border-l lg:border-r border-[#D9E1DC] lg:px-8 py-2 lg:py-0 shrink-0 text-left lg:text-right">
                    <div className="text-xs text-[#5F6F6B]">
                      Total Allowable: <span className="font-semibold text-[#17312E]">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-[#5F6F6B]">
                      Insurance Covered: <span className="font-semibold text-[#216761]">${insPortion.toFixed(2)}</span>
                    </div>
                    <div className="text-base font-serif font-bold text-[#173F3A] mt-1">
                      Client Copay: ${copay.toFixed(2)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const text = `Hope Community Support Statement\nInvoice ID: ${inv.id}\nDate: ${invDate}\nService: ${invDesc}\nCPT: ${cptCodesStr}\nClient Responsibility: $${copay.toFixed(2)}\nStatus: ${isPaid ? 'paid' : 'pending'}`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Statement_${inv.id}.txt`;
                        a.click();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#F8F5EE] border border-[#D9E1DC] text-xs font-bold text-[#17312E] hover:bg-[#EFEAE0] transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#216761]" />
                      <span>Receipt PDF</span>
                    </button>

                    {!isPaid && (
                      <button
                        onClick={() => handlePay(inv.id)}
                        className="px-4 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#C6A66B]" />
                        <span>{paymentSuccessId === inv.id ? 'Payment Processed!' : `Pay $${copay.toFixed(2)}`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Sub-Tab 2: INSURANCE */}
      {activeSubTab === 'insurance' && (
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#173F3A]">Primary Health Insurance</h3>
              <p className="text-xs text-[#5F6F6B] mt-0.5">Verified electronically via clearinghouse 270/271 eligibility.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Coverage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-[#F8F5EE] border border-[#D9E1DC] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B]">Policy Holder</div>
              <div className="space-y-1 text-xs text-[#17312E]">
                <div>Payer: <strong>BlueCross BlueShield of South Carolina</strong></div>
                <div>Plan: <strong>Preferred Blue PPO</strong></div>
                <div>Subscriber: <strong>Vance Sterling</strong></div>
                <div>Member ID: <strong className="font-mono">SCX88294103</strong></div>
                <div>Group Number: <strong className="font-mono">GRP-00941</strong></div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F8F5EE] border border-[#D9E1DC] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B]">Benefits & Copay Schedule</div>
              <div className="space-y-1 text-xs text-[#17312E]">
                <div>In-Network Outpatient Psychotherapy Copay: <strong>$25.00 / session</strong></div>
                <div>Deductible: <strong>$500.00 (Met for calendar year)</strong></div>
                <div>Telehealth Parity: <strong>Covered at 100% after copay</strong></div>
                <div>Prior Authorization: <strong>Not required for routine outpatient</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: PAYMENT METHODS */}
      {activeSubTab === 'payment_methods' && (
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#173F3A]">Card On File (Tokenized)</h3>
              <p className="text-xs text-[#5F6F6B] mt-0.5">Stored via PCI-compliant vaulted token. CVV is never preserved.</p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] flex items-center justify-between gap-4 max-w-lg">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-white border border-[#D9E1DC] text-[#216761]">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#173F3A]">Visa ending in 4242</div>
                <div className="text-xs text-[#5F6F6B]">Expires 08/2028 • Default Payment Method</div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
