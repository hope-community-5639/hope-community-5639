import React from 'react';
import { Video, ShieldCheck, Wifi, Laptop, Lock, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import { useRouter } from '../../context/RouterContext';

export const TelehealthPage: React.FC = () => {
  const { navigate } = useRouter();

  const steps = [
    {
      step: '1',
      title: 'Schedule Your Virtual Visit',
      desc: 'Book a video session online through the client portal or call our intake coordination team at (803) 701-9332.',
    },
    {
      step: '2',
      title: 'Receive Secure Access Link',
      desc: 'You will receive an automated appointment confirmation and an encrypted, HIPAA-compliant session link via email and portal notifications.',
    },
    {
      step: '3',
      title: 'Join in One Click',
      desc: 'At your scheduled session time, click the join link from your smartphone, tablet, or laptop. No app downloads or special software needed.',
    },
    {
      step: '4',
      title: 'Confidential Care from Anywhere',
      desc: 'Engage with your licensed clinician in real time from the privacy, safety, and comfort of your home or private space.',
    },
  ];

  const requirements = [
    {
      icon: Laptop,
      title: 'Supported Devices',
      desc: 'Any smartphone (iOS / Android), tablet, or desktop computer with an active webcam and microphone.',
    },
    {
      icon: Wifi,
      title: 'Internet Connection',
      desc: 'Standard broadband, Wi-Fi, or cellular 4G/5G connection with at least 1.5 Mbps upload/download speed.',
    },
    {
      icon: ShieldCheck,
      title: 'Modern Web Browser',
      desc: 'Google Chrome, Apple Safari, Mozilla Firefox, or Microsoft Edge (latest versions).',
    },
    {
      icon: Lock,
      title: 'Private Space',
      desc: 'A quiet, secure room free from distractions where you feel comfortable speaking openly and candidly.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761]/10 text-[#216761] text-xs font-semibold">
          <Video className="w-3.5 h-3.5" />
          <span>HIPAA-Compliant Encrypted Telehealth</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A]">
          Virtual Care & Online Telehealth
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] leading-relaxed">
          Access exceptional clinical therapy, counseling, and behavioral consultation across South Carolina from the comfort and privacy of your home.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/request-appointment')}
            className="px-6 py-3 bg-[#216761] hover:bg-[#173F3A] text-white font-medium text-sm rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
          >
            <span>Request a Telehealth Visit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/portal')}
            className="px-6 py-3 bg-[#F1ECE1] hover:bg-[#A9C2B2]/30 text-[#173F3A] font-medium text-sm rounded-xl transition-all"
          >
            <span>Client Portal Login</span>
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-serif font-bold text-[#173F3A] text-center">
          How Your Telehealth Session Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          {steps.map((s) => (
            <div key={s.step} className="p-4 rounded-xl bg-[#F8F5EE] border border-[#A9C2B2]/30 relative">
              <div className="w-8 h-8 rounded-full bg-[#216761] text-white font-bold flex items-center justify-center text-sm mb-3">
                {s.step}
              </div>
              <h3 className="font-semibold text-sm text-[#173F3A]">{s.title}</h3>
              <p className="text-xs text-[#66736F] mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology & Privacy Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-[#216761]">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-lg font-serif font-bold text-[#173F3A]">HIPAA & Privacy Guarantee</h3>
          </div>
          <p className="text-xs text-[#66736F] leading-relaxed">
            Our virtual appointments run over peer-to-peer encrypted channels using WebRTC technology with TLS 1.3 encryption. Sessions are never recorded, logged, or shared without explicit written consent.
          </p>
          <ul className="space-y-2 text-xs text-[#202826]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#216761]" />
              <span>Full compliance with federal HIPAA & HITECH privacy standards</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#216761]" />
              <span>Dedicated Business Associate Agreements (BAAs) with all video infrastructure partners</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#216761]" />
              <span>Strict identity verification before clinical engagement</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-[#216761]">
            <Clock className="w-6 h-6" />
            <h3 className="text-lg font-serif font-bold text-[#173F3A]">Technical Readiness</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requirements.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="p-3 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/20">
                  <div className="flex items-center gap-2 text-[#216761] mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-xs text-[#173F3A]">{r.title}</span>
                  </div>
                  <p className="text-[11px] text-[#66736F] leading-tight">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
