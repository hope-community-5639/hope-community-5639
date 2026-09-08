import React from 'react';
import { PhoneCall, AlertCircle, ShieldAlert } from 'lucide-react';

interface EmergencyBannerProps {
  compact?: boolean;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <aside
        id="emergency-notice-compact"
        aria-label="Emergency Crisis Support Notice"
        className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 xl:px-10 mt-7 sm:mt-8 mb-6"
      >
        <div className="bg-[#173F3A] text-[#F8F5EE] border-l-4 border-[#C6A66B] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-[#216761]/40 rounded-lg text-[#C6A66B] shrink-0" aria-hidden="true">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#F8F5EE]">
              <span className="font-bold text-[#C6A66B] mr-1.5 uppercase tracking-wide text-[11px] sm:text-xs">
                Crisis Support Notice:
              </span>
              In life-threatening emergency, call <strong className="text-white underline">911</strong>. For 24/7 free, confidential mental health crisis counseling, call or text{' '}
              <strong className="text-[#C6A66B] font-bold">988</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            <a
              href="tel:988"
              className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3.5 py-2 rounded-lg bg-[#C6A66B] text-[#173F3A] font-bold text-xs hover:bg-[#d8b87d] transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none whitespace-nowrap shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Call / Text 988</span>
            </a>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      id="emergency-notice-card"
      aria-label="Non-Emergency Notice and 24/7 Crisis Assistance"
      className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 xl:px-10 mt-7 sm:mt-8 mb-8 sm:mb-10"
    >
      <div className="bg-[#173F3A] text-[#F8F5EE] border-l-4 border-[#C6A66B] rounded-xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-5">
          {/* Clear Icon Column */}
          <div
            className="p-3 bg-[#216761]/40 rounded-xl text-[#C6A66B] shrink-0 self-start mt-0.5"
            aria-hidden="true"
          >
            <AlertCircle className="w-6 h-6" />
          </div>

          {/* Flexible Content Column */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#216761] text-[#C6A66B] text-[11px] font-bold uppercase tracking-wider">
                Immediate Assistance
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight font-serif">
                Non-Emergency Notice & 24/7 Crisis Hotline
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#A9C2B2] leading-relaxed max-w-4xl">
              Hope Community Support portals, electronic scheduling, and secure messaging are reviewed during standard business hours and are <strong>not designed for acute medical or psychiatric emergencies</strong>. If you or a loved one is in immediate physical danger or experiencing severe distress, please call <strong className="text-white underline">911</strong> or visit the nearest emergency department immediately.
            </p>

            {/* Wrapping Phone Action Buttons (Full width on mobile, inline on desktop) */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <a
                href="tel:988"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C6A66B] hover:bg-[#d8b87d] text-[#173F3A] font-bold text-xs sm:text-sm transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4 shrink-0 text-[#173F3A]" aria-hidden="true" />
                <span>Call or Text 988 (Suicide & Crisis Lifeline)</span>
              </a>

              <a
                href="tel:8037019332"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#216761] hover:bg-[#2b7e77] text-white font-semibold text-xs sm:text-sm border border-[#A9C2B2]/30 transition-colors focus-visible:ring-2 focus-visible:ring-[#C6A66B] focus-visible:outline-none whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4 shrink-0 text-[#C6A66B]" aria-hidden="true" />
                <span>Main Clinic: (803) 701-9332</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
