import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Smartphone,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Laptop,
  Users,
  Lock,
} from 'lucide-react';
import { User } from '../../../types';

interface AccountViewProps {
  currentUser: User | null;
  onSignOut: () => void;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({ currentUser, onSignOut }) => {
  const [mfaEnabled, setMfaEnabled] = useState(currentUser?.mfaEnabled ?? true);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-01',
      device: 'MacBook Pro (macOS 15.2)',
      browser: 'Google Chrome 128.0',
      ipAddress: '71.184.29.112',
      location: 'Rock Hill, SC, United States',
      lastActive: 'Active Now',
      isCurrent: true,
    },
    {
      id: 'sess-02',
      device: 'iPhone 15 Pro (iOS 18.1)',
      browser: 'Mobile Safari',
      ipAddress: '174.247.92.18',
      location: 'Charlotte, NC, United States',
      lastActive: '3 hours ago',
      isCurrent: false,
    },
  ]);
  const [revokedAll, setRevokedAll] = useState(false);

  const handleRevokeOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setRevokedAll(true);
    setTimeout(() => setRevokedAll(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Identity & Security Safeguards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Account Settings & Security
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Manage multi-factor authentication, active devices, and authorized legal representatives. Your session is protected by cryptographic audit logging.
            </p>
          </div>

          <button
            onClick={onSignOut}
            className="px-5 py-2.5 rounded-lg bg-[#B3392F]/10 border border-[#B3392F]/30 text-[#B3392F] text-xs font-bold hover:bg-[#B3392F]/20 transition-colors flex items-center gap-2 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Portal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-[#173F3A] flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#216761]" />
              <span>Client Profile</span>
            </h3>
            <span className="text-xs font-mono text-[#5F6F6B] bg-[#F8F5EE] px-2 py-0.5 rounded border border-[#D9E1DC]">
              ID: {currentUser?.id || 'client-001'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#D9E1DC] flex justify-between">
              <span className="text-[#5F6F6B]">Legal Name:</span>
              <strong className="text-[#17312E]">{currentUser?.firstName} {currentUser?.lastName}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#D9E1DC] flex justify-between">
              <span className="text-[#5F6F6B]">Primary Email:</span>
              <strong className="text-[#17312E] font-mono">{currentUser?.email}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#D9E1DC] flex justify-between">
              <span className="text-[#5F6F6B]">Authorized Role:</span>
              <span className="font-bold text-[#216761] uppercase tracking-wider">
                {currentUser?.role === 'parent_guardian' ? 'Parent / Legal Guardian' : 'Primary Adult Client'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#D9E1DC] flex justify-between">
              <span className="text-[#5F6F6B]">Account Created:</span>
              <span className="text-[#17312E]">{currentUser?.createdAt || '2026-08-01'}</span>
            </div>
          </div>
        </div>

        {/* Security & MFA Card */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-[#173F3A] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#216761]" />
              <span>Authentication & MFA</span>
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Protected
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#173F3A]">Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-[#5F6F6B]">Time-based one-time password (TOTP) or SMS passcode</div>
              </div>

              <button
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  mfaEnabled ? 'bg-[#216761]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[#D9E1DC] bg-white flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#173F3A]">Password Last Updated</div>
                <div className="text-[11px] text-[#5F6F6B]">Strong 14-character alphanumeric password set</div>
              </div>

              <button
                onClick={() => {
                  setPasswordUpdated(true);
                  setTimeout(() => setPasswordUpdated(false), 3000);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] text-xs font-semibold text-[#17312E] hover:bg-[#EFEAE0]"
              >
                {passwordUpdated ? 'Email Sent!' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions & Authorized Devices */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#173F3A] flex items-center gap-2">
              <Laptop className="w-5 h-5 text-[#216761]" />
              <span>Active Devices & Login Sessions</span>
            </h3>
            <p className="text-xs text-[#5F6F6B] mt-0.5">
              Review browsers and devices authorized to access your confidential client portal.
            </p>
          </div>

          <button
            onClick={handleRevokeOtherSessions}
            className="px-4 py-2 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] text-xs font-semibold text-[#B3392F] hover:bg-red-50 transition-colors"
          >
            Sign Out Other Sessions
          </button>
        </div>

        {revokedAll && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All other active sessions have been safely terminated.</span>
          </div>
        )}

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-4 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-lg bg-white border border-[#D9E1DC] text-[#216761]">
                  {sess.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#173F3A]">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-[#216761] text-white text-[10px] font-bold">
                        This Device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5F6F6B] mt-0.5">
                    {sess.browser} • {sess.location} • <span className="font-mono">{sess.ipAddress}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-medium text-[#5F6F6B]">
                {sess.lastActive}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
