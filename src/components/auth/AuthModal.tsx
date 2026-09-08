import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { INITIAL_USERS } from '../../db/initialData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, verifyMfa, isMfaRequired } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'mfa'>('login');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const ok = await login(email);
        if (ok) {
          if (isMfaRequired) {
            setMode('mfa');
          } else {
            onClose();
            if (onSuccess) onSuccess();
          }
        }
      } else if (mode === 'register') {
        await register(email, firstName, lastName, role, phone);
        onClose();
        if (onSuccess) onSuccess();
      } else if (mode === 'mfa') {
        const valid = verifyMfa(mfaCode);
        if (valid) {
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setError('Invalid multi-factor authentication code. Use 123456 for demo.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (userEmail: string) => {
    setEmail(userEmail);
    setMode('login');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'mfa'
          ? 'Two-Factor Authentication'
          : mode === 'register'
          ? 'Client Registration'
          : 'Hope Community Support Portal'
      }
      subtitle={
        mode === 'mfa'
          ? 'Enter your 6-digit security code'
          : 'Encrypted, HIPAA-compliant access'
      }
      maxWidth="md"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'mfa' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/40 text-center space-y-2">
              <KeyRound className="w-8 h-8 text-[#216761] mx-auto" />
              <h4 className="font-serif font-bold text-sm text-[#173F3A]">Security Verification</h4>
              <p className="text-xs text-[#66736F]">
                Staff and provider roles require multi-factor verification. Enter the 6-digit code sent to your authenticated device.
              </p>
              <div className="text-[11px] font-mono text-[#216761] bg-white py-1 px-2 rounded inline-block">
                Demo passcode: <strong>123456</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                6-Digit Security Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-lg tracking-widest font-mono px-3 py-2 bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] transition-colors"
            >
              Verify & Enter Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(803) 555-0100"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                    Account Type
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  >
                    <option value="client">Client (Personal Support)</option>
                    <option value="parent_guardian">Parent / Legal Guardian</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#66736F] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#66736F] absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  defaultValue="HopeCommunity2008!"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60 focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{mode === 'register' ? 'Create Client Account' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C6A66B]" />
            </button>

            <div className="text-center pt-2">
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-[#216761] hover:underline"
                >
                  Need an account? Register as a new client
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-[#216761] hover:underline"
                >
                  Already registered? Sign in here
                </button>
              )}
            </div>
          </form>
        )}

        {/* Demo Fast-Switch Shortcuts */}
        <div className="border-t border-[#F1ECE1] pt-4">
          <span className="text-[11px] font-bold text-[#66736F] uppercase tracking-wider block mb-2">
            Demo Persona Quick Logins:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {INITIAL_USERS.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickFill(u.email)}
                className="p-2 rounded border border-[#A9C2B2]/50 hover:bg-[#F8F5EE] text-left transition-colors"
              >
                <strong className="block text-[11px] text-[#173F3A] truncate">
                  {u.firstName} {u.lastName}
                </strong>
                <span className="text-[10px] text-[#66736F] block capitalize">
                  {u.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
