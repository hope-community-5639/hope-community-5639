import React, { useState, useEffect } from 'react';
import {
  Phone,
  AlertTriangle,
  Heart,
  Shield,
  PhoneCall,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisSupportModal: React.FC<CrisisSupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'grounding'>('resources');
  const [groundingStep, setGroundingStep] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groundingExercise = [
    { count: 5, sense: 'SEE', prompt: 'Look around your space and identify 5 things you can visually observe right now.', color: 'text-[#173F3A] bg-[#216761]/10' },
    { count: 4, sense: 'FEEL', prompt: 'Notice 4 tactile sensations (e.g. feet grounding on floor, texture of clothing, chair support).', color: 'text-[#216761] bg-[#216761]/10' },
    { count: 3, sense: 'HEAR', prompt: 'Listen attentively and name 3 distinct sounds in your current environment.', color: 'text-[#173F3A] bg-[#C6A66B]/20' },
    { count: 2, sense: 'SMELL', prompt: 'Notice 2 scents in the air, or recall two comforting, calming fragrances.', color: 'text-[#216761] bg-[#216761]/10' },
    { count: 1, sense: 'TASTE', prompt: 'Notice 1 taste in your mouth, or take a slow sip of cool water and sense the temperature.', color: 'text-[#C6A66B] bg-[#173F3A]/10' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17312E]/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full border border-[#D9E1DC] shadow-xl overflow-hidden z-10 my-8">
        {/* Header with deep evergreen banner */}
        <div className="bg-[#173F3A] text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close crisis support"
            className="absolute top-5 right-5 p-2 rounded-lg text-[#F8F5EE]/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-lg bg-[#C6A66B]/20 text-[#C6A66B]">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C6A66B]">
              24/7 Confidential Crisis Resources
            </span>
          </div>
          <h2 id="crisis-modal-title" className="text-2xl font-serif font-bold text-white">
            Immediate Support & Safety Assistance
          </h2>
          <p className="text-xs sm:text-sm text-[#F8F5EE]/80 mt-1 max-w-lg leading-relaxed">
            Support is available at any hour. If you or someone you care for is experiencing emotional distress, thoughts of self-harm, or severe crisis, you are not alone.
          </p>

          {/* Quick tab switcher */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'resources'
                  ? 'bg-white text-[#173F3A]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Direct Lifelines & Hotlines
            </button>
            <button
              onClick={() => setActiveTab('grounding')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'grounding'
                  ? 'bg-white text-[#173F3A]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Sensory Grounding Exercise (5-4-3-2-1)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {/* Acute Emergency Callout */}
              <div className="p-4 rounded-xl bg-[#B3392F]/10 border border-[#B3392F]/20 flex items-start gap-3.5">
                <AlertTriangle className="w-5 h-5 text-[#B3392F] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[#17312E] leading-relaxed">
                  <strong className="text-[#B3392F] font-bold block mb-0.5">Life-Threatening Emergency</strong>
                  If there is immediate danger to life or safety, please dial <strong className="font-bold underline text-[#B3392F]">911</strong> immediately or proceed to the nearest hospital emergency department.
                </div>
              </div>

              {/* 988 Suicide & Crisis Lifeline */}
              <div className="p-4 sm:p-5 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] hover:border-[#216761]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-[#173F3A]">988 Suicide & Crisis Lifeline</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-md bg-[#216761]/10 text-[#216761]">
                      National 24/7
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6F6B] leading-relaxed">
                    Free, confidential emotional support and intervention for individuals in crisis or their loved ones.
                  </p>
                  <p className="text-xs font-medium text-[#17312E]">Available in English, Spanish & 240+ languages via translation.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <a
                    href="tel:988"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#216761] text-white font-bold text-xs hover:bg-[#173F3A] transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-[#C6A66B]" />
                    <span>Call 988</span>
                  </a>
                  <a
                    href="sms:988"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-[#216761]/30 text-[#173F3A] font-bold text-xs hover:bg-[#EFEAE0] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#216761]" />
                    <span>Text 988</span>
                  </a>
                </div>
              </div>

              {/* Crisis Text Line */}
              <div className="p-4 sm:p-5 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] hover:border-[#216761]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-[#173F3A]">Crisis Text Line</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-md bg-[#C6A66B]/20 text-[#173F3A]">
                      Text HOME to 741741
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6F6B] leading-relaxed">
                    Connect via text with a trained crisis counselor 24/7 across the United States.
                  </p>
                </div>
                <a
                  href="sms:741741?body=HOME"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#173F3A] text-white font-bold text-xs hover:bg-[#216761] transition-colors shrink-0"
                >
                  <MessageSquare className="w-4 h-4 text-[#C6A66B]" />
                  <span>Text HOME to 741741</span>
                </a>
              </div>

              {/* South Carolina Mobile Crisis */}
              <div className="p-4 sm:p-5 rounded-xl border border-[#D9E1DC] bg-white hover:border-[#216761]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-[#173F3A]">SC Mobile Crisis Response</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-md bg-[#216761]/10 text-[#216761]">
                      Local Dispatch
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6F6B] leading-relaxed">
                    South Carolina Department of Mental Health 24/7 statewide mobile crisis triage and in-person dispatch.
                  </p>
                  <p className="text-xs font-mono text-[#17312E]">1-833-364-2274 (833-DMH-3642)</p>
                </div>
                <a
                  href="tel:18333642274"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#216761] text-white font-bold text-xs hover:bg-[#173F3A] transition-colors shrink-0"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Mobile Crisis</span>
                </a>
              </div>

              {/* Veterans Crisis Line */}
              <div className="p-4 rounded-xl border border-[#D9E1DC] bg-white flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#173F3A]">Veterans Crisis Line</div>
                  <div className="text-xs text-[#5F6F6B]">Dial 988 then press 1, or text 838255.</div>
                </div>
                <a
                  href="tel:988"
                  className="text-xs font-bold text-[#216761] hover:underline"
                >
                  Call 988 (Press 1)
                </a>
              </div>
            </div>
          )}

          {activeTab === 'grounding' && (
            <div className="space-y-6">
              <div className="bg-[#F8F5EE] border border-[#D9E1DC] rounded-xl p-5 text-xs text-[#5F6F6B] leading-relaxed">
                The <strong>5-4-3-2-1 Sensory Grounding Technique</strong> is an evidence-informed clinical exercise designed to gently calm acute physiological distress, panic, and anxiety by reconnecting awareness to your immediate physical surroundings.
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-1.5">
                {groundingExercise.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGroundingStep(idx)}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      idx === groundingStep
                        ? 'bg-[#216761]'
                        : idx < groundingStep
                        ? 'bg-[#C6A66B]'
                        : 'bg-[#D9E1DC]'
                    }`}
                    aria-label={`Step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Current Step Card */}
              <div className="border border-[#D9E1DC] rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${groundingExercise[groundingStep].color}`}>
                    Step {groundingStep + 1} of 5 • Sense of {groundingExercise[groundingStep].sense}
                  </span>
                  <span className="text-xs text-[#5F6F6B]">Take a slow, gentle breath</span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-[#173F3A]">
                    {groundingExercise[groundingStep].count}
                  </span>
                  <p className="text-base sm:text-lg text-[#17312E] font-medium leading-relaxed">
                    {groundingExercise[groundingStep].prompt}
                  </p>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGroundingStep((prev) => Math.max(0, prev - 1))}
                  disabled={groundingStep === 0}
                  className="px-4 py-2 rounded-lg border border-[#D9E1DC] text-xs font-semibold text-[#173F3A] hover:bg-[#F8F5EE] disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <div className="text-xs text-[#5F6F6B]">
                  {groundingStep === 4 ? 'Completed' : `${5 - groundingStep} steps remaining`}
                </div>
                {groundingStep < 4 ? (
                  <button
                    onClick={() => setGroundingStep((prev) => Math.min(4, prev + 1))}
                    className="px-5 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors"
                  >
                    Next Sense
                  </button>
                ) : (
                  <button
                    onClick={() => setGroundingStep(0)}
                    className="px-5 py-2 rounded-lg bg-[#C6A66B] text-[#173F3A] text-xs font-bold hover:bg-[#d8b87d] transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#173F3A]" />
                    <span>Repeat Exercise</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F8F5EE] border-t border-[#D9E1DC] px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-[#5F6F6B]">
            Hope Community Support Crisis Safeguarding Protocol
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#D9E1DC] text-[#17312E] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
