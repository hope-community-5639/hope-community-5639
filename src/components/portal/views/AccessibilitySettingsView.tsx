import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Eye,
  Type,
  Sun,
  Shield,
  RotateCcw,
} from 'lucide-react';

interface AccessibilitySettingsViewProps {
  onBackToOverview?: () => void;
}

export const AccessibilitySettingsView: React.FC<AccessibilitySettingsViewProps> = ({
  onBackToOverview,
}) => {
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'extra_large'>('standard');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    localStorage.setItem(
      'hope_accessibility_preferences',
      JSON.stringify({ fontSize, highContrast, reducedMotion })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>WCAG 2.2 AA Conformance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
              Accessibility & Display Preferences
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F6B] max-w-2xl leading-relaxed">
              Tailor the client portal display to your sensory, cognitive, and visual preferences. Settings are preserved locally for this browser session.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors shadow-xs shrink-0"
          >
            {saved ? 'Preferences Saved!' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Font Scaling */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
              <Type className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-base text-[#173F3A]">Text Sizing</h3>
          </div>

          <p className="text-xs text-[#5F6F6B]">
            Adjust relative scale for readable typography across all portal views.
          </p>

          <div className="space-y-2 pt-2">
            {[
              { id: 'standard', label: 'Standard (16px base)' },
              { id: 'large', label: 'Large (18px base)' },
              { id: 'extra_large', label: 'Extra Large (20px base)' },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2.5 p-3 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] cursor-pointer hover:bg-[#EFEAE0] transition-colors text-xs font-semibold text-[#17312E]"
              >
                <input
                  type="radio"
                  name="fontSize"
                  checked={fontSize === opt.id}
                  onChange={() => setFontSize(opt.id as any)}
                  className="accent-[#216761]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
              <Sun className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-base text-[#173F3A]">High Contrast</h3>
          </div>

          <p className="text-xs text-[#5F6F6B]">
            Enforce maximum luminance contrast ratios (≥7:1) for optimal text sharpness.
          </p>

          <div className="pt-4">
            <label className="flex items-center justify-between p-3.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] cursor-pointer">
              <span className="text-xs font-bold text-[#17312E]">Enable Enhanced Contrast</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-4 h-4 accent-[#216761]"
              />
            </label>
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
              <Eye className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-base text-[#173F3A]">Reduced Motion</h3>
          </div>

          <p className="text-xs text-[#5F6F6B]">
            Suppress non-essential micro-animations and smooth layout transitions.
          </p>

          <div className="pt-4">
            <label className="flex items-center justify-between p-3.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] cursor-pointer">
              <span className="text-xs font-bold text-[#17312E]">Minimize Motion FX</span>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-4 h-4 accent-[#216761]"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
