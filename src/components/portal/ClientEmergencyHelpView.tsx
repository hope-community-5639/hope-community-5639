import React, { useState } from 'react';
import {
  Phone,
  AlertTriangle,
  Heart,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ClientEmergencyHelpView: React.FC = () => {
  const [groundingStep, setGroundingStep] = useState<number>(0);

  const groundingExercise = [
    { count: 5, sense: 'SEE', prompt: 'Look around you and name 5 things you can see right now.', color: 'text-emerald-700 bg-emerald-50' },
    { count: 4, sense: 'FEEL', prompt: 'Notice 4 things you can physically feel (e.g. feet on floor, texture of clothing, chair support).', color: 'text-teal-700 bg-teal-50' },
    { count: 3, sense: 'HEAR', prompt: 'Listen carefully and identify 3 distinct sounds in your environment.', color: 'text-cyan-700 bg-cyan-50' },
    { count: 2, sense: 'SMELL', prompt: 'Notice 2 things you can smell, or 2 scents you enjoy and find soothing.', color: 'text-indigo-700 bg-indigo-50' },
    { count: 1, sense: 'TASTE', prompt: 'Notice 1 taste in your mouth, or take a sip of cool water and feel the temperature.', color: 'text-amber-700 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Acute Emergency Banner */}
      <div className="bg-red-700 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-300 animate-pulse flex-shrink-0" />
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Emergency & Crisis Support
            </h2>
            <p className="text-xs text-red-100 mt-0.5">
              Available 24 hours a day, 7 days a week, 365 days a year. Free, confidential, and immediate.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {/* Lifeline 988 */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                National Suicide & Crisis Lifeline
              </span>
              <span className="font-serif font-bold text-2xl text-white block mt-1">988</span>
              <p className="text-xs text-red-100 mt-1">
                Call or text 988 anytime to reach trained, compassionate crisis counselors.
              </p>
            </div>
            <a
              href="tel:988"
              className="mt-3 px-4 py-2 bg-white text-red-700 rounded-lg text-xs font-bold text-center hover:bg-red-50 flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Call or Text 988 Now
            </a>
          </div>

          {/* 911 Direct */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                Immediate Physical Danger
              </span>
              <span className="font-serif font-bold text-2xl text-white block mt-1">911</span>
              <p className="text-xs text-red-100 mt-1">
                For life-threatening emergencies, physical safety threats, or medical crises.
              </p>
            </div>
            <a
              href="tel:911"
              className="mt-3 px-4 py-2 bg-white text-red-700 rounded-lg text-xs font-bold text-center hover:bg-red-50 flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Call 911 Emergency
            </a>
          </div>

          {/* Crisis Text Line */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                Crisis Text Line (24/7 Text)
              </span>
              <span className="font-serif font-bold text-xl text-white block mt-1">
                Text HOME to 741741
              </span>
              <p className="text-xs text-red-100 mt-1">
                Free, confidential crisis support via SMS on any cell phone carrier.
              </p>
            </div>
            <a
              href="sms:741741?body=HOME"
              className="mt-3 px-4 py-2 bg-white text-red-700 rounded-lg text-xs font-bold text-center hover:bg-red-50 flex items-center justify-center gap-1.5"
            >
              Start Text Conversation
            </a>
          </div>
        </div>
      </div>

      {/* Regional South Carolina & North Carolina Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Emergency Rooms */}
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#173F3A]">
            <MapPin className="w-5 h-5 text-[#216761]" />
            <h3 className="font-serif font-bold text-lg">
              Local Hospital Emergency Departments
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/30 space-y-1">
              <span className="font-bold text-[#173F3A] block text-sm">
                Piedmont Medical Center — Emergency Department
              </span>
              <p className="text-[#66736F]">222 S Herlong Avenue, Rock Hill, SC 29732</p>
              <p className="text-[#216761] font-semibold">Phone: (803) 329-1234 • Open 24/7</p>
            </div>

            <div className="p-3.5 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/30 space-y-1">
              <span className="font-bold text-[#173F3A] block text-sm">
                Prisma Health Richland Hospital — Emergency
              </span>
              <p className="text-[#66736F]">5 Richland Medical Park Drive, Columbia, SC 29203</p>
              <p className="text-[#216761] font-semibold">Phone: (803) 434-7000 • Open 24/7</p>
            </div>

            <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#C6A66B]/50 space-y-1">
              <span className="font-bold text-[#173F3A] block text-sm">
                SC Department of Mental Health Community Crisis Line (CCRI)
              </span>
              <p className="text-[#66736F]">
                Dispatches local mobile crisis teams throughout York, Richland, and surrounding counties.
              </p>
              <p className="text-[#216761] font-bold">Toll-Free: (833) 364-2274 • 24/7 Dispatch</p>
            </div>
          </div>
        </div>

        {/* Sensory Grounding Tool (5-4-3-2-1) */}
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#173F3A]">
              <Sparkles className="w-5 h-5 text-[#C6A66B]" />
              <h3 className="font-serif font-bold text-lg">
                5-4-3-2-1 Sensory Grounding Tool
              </h3>
            </div>
            <span className="text-xs text-[#66736F]">Somatic Anxiety Relief</span>
          </div>

          <p className="text-xs text-[#66736F] leading-relaxed">
            When experiencing intense panic or emotional overwhelm, grounding your senses brings your autonomic nervous system back into regulation.
          </p>

          <div className="space-y-2">
            {groundingExercise.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setGroundingStep(idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  groundingStep === idx
                    ? `${step.color} border-current ring-1 ring-current shadow-xs`
                    : 'bg-[#F8F5EE]/60 border-transparent hover:bg-[#F8F5EE]'
                }`}
              >
                <span className="font-serif font-bold text-lg w-6 text-center">
                  {step.count}
                </span>
                <div className="text-xs flex-1">
                  <span className="font-bold block uppercase tracking-wider text-[10px]">
                    {step.sense}
                  </span>
                  <span className="font-medium">{step.prompt}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setGroundingStep((s) => (s + 1) % groundingExercise.length)}
            className="w-full py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors"
          >
            Next Grounding Step ({groundingStep + 1} of 5)
          </button>
        </div>
      </div>
    </div>
  );
};
