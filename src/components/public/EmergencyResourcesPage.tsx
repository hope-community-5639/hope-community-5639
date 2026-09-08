import React from 'react';
import { Phone, ShieldAlert, Heart, LifeBuoy, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export const EmergencyResourcesPage: React.FC = () => {
  const { navigate } = useRouter();

  const lifelines = [
    {
      name: '988 Suicide & Crisis Lifeline',
      number: '988',
      tel: '988',
      desc: 'Free, confidential support available 24/7 for anyone experiencing mental health-related distress, emotional crisis, or thoughts of suicide.',
      badge: 'National 24/7',
      primary: true,
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      tel: 'sms:741741?body=HOME',
      desc: 'Connect with a crisis counselor 24/7 over free, confidential text message across the United States.',
      badge: 'Free Text 24/7',
    },
    {
      name: 'SC DMH Mobile Crisis Team',
      number: '833-364-2274 (833-DMH-CCRI)',
      tel: '18333642274',
      desc: 'South Carolina Department of Mental Health 24/7 community crisis response for immediate on-site or tele-triage intervention.',
      badge: 'South Carolina Statewide',
    },
    {
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-SAFE (7233)',
      tel: '18007997233',
      desc: 'Highly confidential support, safety planning, and emergency refuge resources available 24 hours a day, 365 days a year.',
      badge: 'Confidential 24/7',
    },
    {
      name: 'The Trevor Project (LGBTQ Youth)',
      number: '1-866-488-7386',
      tel: '18664887386',
      desc: '24/7 suicide prevention and crisis intervention services for LGBTQ young people under 25.',
      badge: 'Youth Lifeline',
    },
    {
      name: 'Veterans Crisis Line',
      number: 'Dial 988, then press 1',
      tel: '988',
      desc: 'Confidential crisis support for military service members, veterans, and their loved ones.',
      badge: 'Veterans & Family',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Red Alert Banner */}
      <div className="bg-red-600 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-200">Immediate Danger & Emergency</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">In an Immediate Life Threat, Call 911</h1>
          </div>
        </div>
        <p className="text-sm text-red-100 leading-relaxed max-w-3xl">
          Hope Community Support provides outpatient therapy and scheduled behavioral assistance. We are not an emergency triage facility and our digital portal is not monitored continuously. If you or someone you know is in immediate life-threatening danger, call 911 or proceed to the nearest hospital emergency department immediately.
        </p>
      </div>

      {/* Lifelines Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#173F3A]">
              Free, Confidential 24/7 Crisis Lifelines
            </h2>
            <p className="text-xs sm:text-sm text-[#66736F] mt-1">
              Trained compassionate crisis counselors are standing by right now to support you through whatever you are experiencing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifelines.map((l, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                l.primary
                  ? 'bg-[#173F3A] text-white border-[#216761] shadow-sm'
                  : 'bg-white border-[#A9C2B2]/40 text-[#202826] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    l.primary ? 'bg-[#C6A66B] text-[#173F3A]' : 'bg-[#216761]/10 text-[#216761]'
                  }`}
                >
                  {l.badge}
                </span>
              </div>
              <h3 className={`font-serif font-bold text-lg ${l.primary ? 'text-white' : 'text-[#173F3A]'}`}>
                {l.name}
              </h3>
              <p className={`text-xs mt-2 leading-relaxed ${l.primary ? 'text-[#A9C2B2]' : 'text-[#66736F]'}`}>
                {l.desc}
              </p>
              <div className="mt-4 pt-3 border-t border-[#A9C2B2]/20 flex items-center justify-between">
                <span className={`text-sm font-bold ${l.primary ? 'text-[#C6A66B]' : 'text-[#216761]'}`}>
                  {l.number}
                </span>
                <a
                  href={`tel:${l.tel}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                    l.primary
                      ? 'bg-[#C6A66B] hover:bg-[#b09055] text-[#173F3A]'
                      : 'bg-[#216761] hover:bg-[#173F3A] text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Safety Steps */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-serif font-bold text-xl text-[#173F3A] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#216761]" />
          <span>Steps for a Personal Crisis Safety Plan</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/30 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#216761] text-white text-xs font-bold flex items-center justify-center">1</span>
            <h4 className="font-semibold text-sm text-[#173F3A]">Recognize Warning Signs</h4>
            <p className="text-xs text-[#66736F]">Notice changes in sleep, overwhelming panic, irritability, or feelings of intense hopelessness.</p>
          </div>
          <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/30 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#216761] text-white text-xs font-bold flex items-center justify-center">2</span>
            <h4 className="font-semibold text-sm text-[#173F3A]">Use Calming Strategies</h4>
            <p className="text-xs text-[#66736F]">Box breathing (4s in, 4s hold, 4s out, 4s hold), listening to grounding audio, or stepping into a quiet space.</p>
          </div>
          <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/30 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#216761] text-white text-xs font-bold flex items-center justify-center">3</span>
            <h4 className="font-semibold text-sm text-[#173F3A]">Reach Out to Someone</h4>
            <p className="text-xs text-[#66736F]">Connect with a trusted friend, family member, licensed therapist, or call/text 988 for immediate caring support.</p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#F1ECE1]">
          <span className="text-xs text-[#66736F]">
            Want to begin ongoing outpatient clinical care with our team?
          </span>
          <button
            onClick={() => navigate('/request-appointment')}
            className="px-5 py-2.5 bg-[#216761] hover:bg-[#173F3A] text-white text-xs font-medium rounded-xl transition-all inline-flex items-center gap-2"
          >
            <span>Schedule Outpatient Intake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
