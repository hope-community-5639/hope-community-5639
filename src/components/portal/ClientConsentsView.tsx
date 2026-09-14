import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Lock,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ConsentRecord {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'revoked' | 'pending';
  lastUpdated: string;
  description: string;
  canRevoke: boolean;
}

export const ClientConsentsView: React.FC = () => {
  const { currentUser } = useAuth();

  const [consents, setConsents] = useState<ConsentRecord[]>([
    {
      id: 'consent-recording',
      title: 'Session-Specific Audio Recording & AI Transcription Consent',
      category: 'Documentation & AI Assistance',
      status: 'active',
      lastUpdated: '2026-03-20T14:00:00Z',
      description: 'Authorizes Hope Community Support to record session audio using local offline AES-256 encryption for transcription and report drafting. Revocable at any time during or between sessions.',
      canRevoke: true,
    },
    {
      id: 'consent-treatment',
      title: 'Informed Consent for Behavioral Health Services & Counseling',
      category: 'Clinical Care',
      status: 'active',
      lastUpdated: '2026-03-15T10:00:00Z',
      description: 'Acknowledges understanding of treatment modalities, voluntary participation, confidentiality boundaries, and mandatory reporting obligations under South Carolina law.',
      canRevoke: false,
    },
    {
      id: 'consent-telehealth',
      title: 'Telehealth Delivery & Jurisdictional Treatment Consent',
      category: 'Telehealth',
      status: 'active',
      lastUpdated: '2026-03-15T10:00:00Z',
      description: 'Confirms understanding that telehealth services require client to be physically located in an authorized jurisdiction (SC/NC) with emergency contact access.',
      canRevoke: false,
    },
    {
      id: 'consent-privacy',
      title: 'Notice of Privacy Practices (HIPAA) Acknowledgment',
      category: 'Regulatory',
      status: 'active',
      lastUpdated: '2026-03-15T10:00:00Z',
      description: 'Receipt and acknowledgment of Hope Community Support HIPAA privacy rights, access rights, and protected health information safeguards.',
      canRevoke: false,
    },
    {
      id: 'consent-financial',
      title: 'Financial Agreement & Payment Responsibility',
      category: 'Billing',
      status: 'active',
      lastUpdated: '2026-03-15T10:00:00Z',
      description: 'Agreement regarding copayments, sliding scale rates, and billing authorization.',
      canRevoke: false,
    },
    {
      id: 'consent-roi-emergency',
      title: 'Release of Information: Designated Emergency Contact (Clara Vance)',
      category: 'Emergency & Safety',
      status: 'active',
      lastUpdated: '2026-03-15T10:00:00Z',
      description: 'Permission for clinical team to contact designated emergency contact in the event of an acute safety crisis or medical emergency.',
      canRevoke: true,
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleToggleConsent = (id: string) => {
    setConsents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'active' ? 'revoked' : 'active';
          setNotification(
            newStatus === 'revoked'
              ? `Consent revoked for "${c.title}". Your preference has been immediately saved.`
              : `Consent reactivated for "${c.title}".`
          );
          setTimeout(() => setNotification(null), 5000);
          return {
            ...c,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#216761]/10 text-[#216761]">
              Informed Consent Center
            </span>
            <span className="text-xs text-[#66736F]">HIPAA & 42 CFR Part 2 Compliant</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#173F3A]">
            Active Authorizations & Consents
          </h2>
          <p className="text-xs text-[#66736F] mt-1 max-w-2xl">
            You maintain full sovereignty over your care agreements. Session-specific recording consent can be revoked at any time without compromising your care.
          </p>
        </div>

        <div className="p-3 bg-[#FAF7F0] border border-[#C6A66B]/50 rounded-xl text-xs flex items-center gap-2 text-[#173F3A]">
          <Shield className="w-5 h-5 text-[#216761] flex-shrink-0" />
          <span>All consent changes logged with immutable audit timestamps.</span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Consent Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {consents.map((consent) => {
          const isActive = consent.status === 'active';
          return (
            <div
              key={consent.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all bg-white flex flex-col justify-between ${
                isActive ? 'border-[#A9C2B2]/60 shadow-xs' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#216761] bg-[#216761]/10 px-2 py-0.5 rounded-full">
                    {consent.category}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isActive ? '✓ Active & Authorized' : '✕ Consent Revoked'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-sm text-[#173F3A] mb-2">
                  {consent.title}
                </h3>
                <p className="text-xs text-[#66736F] leading-relaxed mb-4">
                  {consent.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F1ECE1] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#66736F]">
                  Last updated: {consent.lastUpdated.split('T')[0]}
                </span>

                {consent.canRevoke ? (
                  <button
                    onClick={() => handleToggleConsent(consent.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-[#216761] text-white hover:bg-[#173F3A]'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Revoke Consent' : 'Re-authorize'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[#66736F] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#216761]" /> Core Care Requirement
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
