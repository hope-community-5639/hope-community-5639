import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { Home, Search, Calendar, Phone, ArrowLeft } from 'lucide-react';
import { EmergencyBanner } from './EmergencyBanner';

export const NotFoundPage: React.FC = () => {
  const { navigate, currentPath } = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-center">
      <EmergencyBanner compact />

      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-10 shadow-xs space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B] px-3 py-1 bg-[#C6A66B]/10 rounded-full">
          Error 404 • Page Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A]">
          We Couldn’t Find That Page
        </h1>
        <p className="text-sm text-[#66736F] max-w-md mx-auto leading-relaxed">
          The requested address <code className="px-1.5 py-0.5 bg-[#F8F5EE] rounded text-[#216761] font-mono text-xs">{currentPath}</code> does not exist or may have been moved.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-[#216761] hover:bg-[#173F3A] text-white text-xs font-medium rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
          <button
            onClick={() => navigate('/services')}
            className="px-5 py-2.5 bg-[#F8F5EE] hover:bg-[#A9C2B2]/30 text-[#173F3A] text-xs font-medium rounded-xl transition-all inline-flex items-center gap-2 border border-[#A9C2B2]/30"
          >
            <Search className="w-4 h-4" />
            <span>Browse Clinical Services</span>
          </button>
          <button
            onClick={() => navigate('/request-appointment')}
            className="px-5 py-2.5 bg-[#F8F5EE] hover:bg-[#A9C2B2]/30 text-[#173F3A] text-xs font-medium rounded-xl transition-all inline-flex items-center gap-2 border border-[#A9C2B2]/30"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>

        <div className="pt-6 border-t border-[#F1ECE1] flex flex-wrap items-center justify-center gap-6 text-xs text-[#66736F]">
          <span>Need immediate assistance? Call <strong>(803) 701-9332</strong></span>
          <span>•</span>
          <button
            onClick={() => navigate('/emergency-resources')}
            className="text-red-700 hover:underline font-bold inline-flex items-center gap-1"
          >
            <span>24/7 Crisis Lifelines</span>
          </button>
        </div>
      </div>
    </div>
  );
};
