import React, { useState } from 'react';
import { useAuth, validatePassword } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { Shield, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

interface AuthPagesProps {
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode }) => {
  const { login, register, forgotPassword, resetPassword, verifyEmail, isMfaRequired, verifyMfa, currentUser } = useAuth();
  const { navigate, queryParams } = useRouter();

  const redirectUrl = queryParams.get('redirect') || (currentUser?.role === 'super_admin' || currentUser?.role === 'administrator' ? '/admin' : currentUser?.role === 'client' ? '/portal' : '/staff');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Live password validation check
  const passwordCheck = validatePassword(password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      if (!isMfaRequired) {
        navigate(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const valid = verifyMfa(mfaCode);
    if (valid) {
      navigate(redirectUrl);
    } else {
      setError('Invalid security verification code. Try entering 123456 or your 6-digit TOTP code.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!passwordCheck.isValid) {
      setError(passwordCheck.errors[0]);
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, firstName, lastName, 'client', phone);
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const token = queryParams.get('token') || 'demo_token';
    setSubmitting(true);
    try {
      const res = await resetPassword(token, password);
      setSuccessMsg(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    const token = queryParams.get('token') || 'verify_token';
    setSubmitting(true);
    try {
      const res = await verifyEmail(token);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Email verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <EmergencyBanner compact />

      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-[#216761]/10 text-[#216761] flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#173F3A]">
            {mode === 'login' && (isMfaRequired ? 'Multi-Factor Verification' : 'Client & Staff Sign In')}
            {mode === 'register' && 'Create Client Account'}
            {mode === 'forgot-password' && 'Reset Your Password'}
            {mode === 'reset-password' && 'Set New Password'}
            {mode === 'verify-email' && 'Email Verification'}
          </h1>
          <p className="text-xs text-[#66736F]">
            {mode === 'login' && !isMfaRequired && 'Access appointments, clinical records, and confidential messaging.'}
            {mode === 'login' && isMfaRequired && 'Enter the 6-digit security code sent to your registered device.'}
            {mode === 'register' && 'Register securely to complete online intake and book sessions.'}
            {mode === 'forgot-password' && 'Enter your registered email address to receive reset instructions.'}
            {mode === 'reset-password' && 'Enter a strong, secure password for your account.'}
            {mode === 'verify-email' && 'Confirming your authorized email address.'}
          </p>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MFA Challenge Screen */}
        {mode === 'login' && isMfaRequired && (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                6-Digit Security Passcode
              </label>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-[#A9C2B2]/50 rounded-xl text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-[#216761] focus:border-transparent outline-none"
                required
                autoFocus
              />
              <p className="text-[11px] text-[#66736F] mt-1 text-center">
                Demo code: <strong>123456</strong> or any 6-digit number
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#216761] hover:bg-[#173F3A] text-white font-medium text-xs rounded-xl transition-all shadow-xs"
            >
              Verify & Complete Sign In
            </button>
          </form>
        )}

        {/* Regular Login Form */}
        {mode === 'login' && !isMfaRequired && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#66736F] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#173F3A]">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[11px] text-[#216761] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#66736F] absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#66736F] hover:text-[#173F3A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#216761] hover:bg-[#173F3A] text-white font-medium text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#66736F]">Don’t have an account yet? </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-xs font-bold text-[#216761] hover:underline"
              >
                Register here
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-2 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-2 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(803) 555-0100"
                className="w-full px-3 py-2 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters with upper, lower, digit, symbol"
                  className="w-full px-3 py-2 pr-10 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#66736F] hover:text-[#173F3A]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#216761] hover:bg-[#173F3A] text-white font-medium text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitting ? 'Creating account...' : 'Create Account & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#66736F]">Already registered? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-[#216761] hover:underline"
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#216761] hover:bg-[#173F3A] text-white font-medium text-xs rounded-xl transition-all shadow-xs"
            >
              <span>{submitting ? 'Sending instructions...' : 'Send Password Reset Link'}</span>
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs text-[#216761] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Form */}
        {mode === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars with uppercase, number & symbol"
                className="w-full px-3 py-2.5 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2.5 border border-[#A9C2B2]/50 rounded-xl text-xs focus:ring-2 focus:ring-[#216761] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#216761] hover:bg-[#173F3A] text-white font-medium text-xs rounded-xl transition-all shadow-xs"
            >
              <span>{submitting ? 'Updating...' : 'Set New Password'}</span>
            </button>
          </form>
        )}

        {/* Verify Email Screen */}
        {mode === 'verify-email' && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-[#216761] mx-auto" />
            <p className="text-xs text-[#66736F]">
              Click the button below to confirm and verify your registration email.
            </p>
            <button
              onClick={handleVerifyEmail}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#216761] hover:bg-[#173F3A] text-white font-medium text-xs rounded-xl transition-all shadow-xs"
            >
              {submitting ? 'Verifying...' : 'Verify Email Address'}
            </button>
            <div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs text-[#216761] hover:underline"
              >
                Proceed to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
