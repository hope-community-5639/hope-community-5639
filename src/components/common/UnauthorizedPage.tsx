import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn, ArrowRight, UserCheck, Home } from 'lucide-react';
import { EmergencyBanner } from './EmergencyBanner';

export const UnauthorizedPage: React.FC = () => {
  const { navigate, currentPath } = useRouter();
  const { currentUser, logout, quickSwitchRole } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-center">
      <EmergencyBanner compact />

      <div className="bg-white rounded-2xl border border-amber-200 p-10 shadow-xs space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 px-3 py-1 bg-amber-100/60 rounded-full">
          Error 403 • Restricted Access
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
          Authorized Credentials Required
        </h1>
        <p className="text-xs sm:text-sm text-[#66736F] max-w-md mx-auto leading-relaxed">
          You do not have the required permissions to access <code className="px-1.5 py-0.5 bg-[#F8F5EE] rounded text-[#216761] font-mono text-xs">{currentPath}</code>.
          {currentUser ? (
            <span> You are currently signed in as <strong>{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.role}).</span>
          ) : (
            <span> Please sign in with an authorized account to continue.</span>
          )}
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-[#216761] hover:bg-[#173F3A] text-white text-xs font-medium rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Different Account</span>
          </button>
          {currentUser && (
            <button
              onClick={() => {
                if (currentUser.role === 'client' || currentUser.role === 'parent_guardian') {
                  navigate('/portal');
                } else if (currentUser.role === 'super_admin' || currentUser.role === 'administrator') {
                  navigate('/admin');
                } else {
                  navigate('/staff');
                }
              }}
              className="px-5 py-2.5 bg-[#F8F5EE] hover:bg-[#A9C2B2]/30 text-[#173F3A] text-xs font-medium rounded-xl transition-all inline-flex items-center gap-2 border border-[#A9C2B2]/30"
            >
              <UserCheck className="w-4 h-4" />
              <span>Go to Your Authorized Portal</span>
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-[#F8F5EE] hover:bg-[#A9C2B2]/30 text-[#173F3A] text-xs font-medium rounded-xl transition-all inline-flex items-center gap-2 border border-[#A9C2B2]/30"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
