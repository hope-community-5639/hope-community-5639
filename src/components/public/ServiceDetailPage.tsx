import React from 'react';
import { INITIAL_SERVICES } from '../../db/initialData';
import { ServiceCategory } from '../../types';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  Video,
  Home,
  Building,
  Calendar,
  ArrowLeft,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

interface ServiceDetailPageProps {
  category: ServiceCategory;
  onBack: () => void;
  onOpenBooking: (serviceName?: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  category,
  onBack,
  onOpenBooking,
}) => {
  const service = INITIAL_SERVICES.find((s) => s.category === category) || INITIAL_SERVICES[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <EmergencyBanner compact />

      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#216761] hover:text-[#173F3A]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Services
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded bg-[#216761]/10 text-[#216761]">
            {service.category.replace('_', ' ')}
          </span>
          <div className="flex items-center gap-2 text-xs text-[#66736F]">
            <Clock className="w-4 h-4 text-[#216761]" />
            <span>Standard Session Duration: <strong>{service.durationMinutes} minutes</strong></span>
          </div>
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#173F3A]">
          {service.name}
        </h1>
        <p className="text-base text-[#66736F] mt-3 leading-relaxed">
          {service.fullDescription}
        </p>

        {/* Formats badge */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[#66736F] font-semibold">Available Delivery Formats:</span>
          {service.availableFormats.map((fmt, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EE] border border-[#A9C2B2]/50 text-[#173F3A] font-medium capitalize"
            >
              {fmt === 'telehealth' && <Video className="w-3.5 h-3.5 text-[#216761]" />}
              {fmt === 'in_home' && <Home className="w-3.5 h-3.5 text-[#216761]" />}
              {fmt === 'office' && <Building className="w-3.5 h-3.5 text-[#216761]" />}
              {fmt.replace('_', ' ')}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => onOpenBooking(service.name)}
            className="px-6 py-3 rounded-lg bg-[#216761] hover:bg-[#173F3A] text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#C6A66B]" />
            Request an Appointment for {service.name}
          </button>
        </div>
      </div>

      {/* 2-Column Clinical Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Targeted Concerns */}
        <div className="bg-[#F8F5EE] rounded-xl p-6 border border-[#A9C2B2]/40">
          <h3 className="font-serif font-bold text-lg text-[#173F3A] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#216761]" />
            Common Concerns Addressed
          </h3>
          <p className="text-xs text-[#66736F] mb-4">
            This service is specifically calibrated to provide relief, clarity, and constructive skills for:
          </p>
          <ul className="space-y-2">
            {service.commonConcerns.map((concern, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#202826]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6A66B] mt-1.5 shrink-0" />
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What to Expect */}
        <div className="bg-[#F8F5EE] rounded-xl p-6 border border-[#A9C2B2]/40">
          <h3 className="font-serif font-bold text-lg text-[#173F3A] mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#216761]" />
            What to Expect During Sessions
          </h3>
          <p className="text-xs text-[#66736F] mb-4">
            A transparent overview of how our certified providers conduct your care:
          </p>
          <ul className="space-y-3 text-xs text-[#202826]">
            <li className="flex items-start gap-2">
              <strong className="text-[#173F3A] shrink-0">1. Safe Rapport:</strong>
              <span>A judgment-free space to unpack emotional history at your self-directed pace.</span>
            </li>
            <li className="flex items-start gap-2">
              <strong className="text-[#173F3A] shrink-0">2. Active Strategies:</strong>
              <span>Concrete, hands-on coping mechanisms you can test during everyday life.</span>
            </li>
            <li className="flex items-start gap-2">
              <strong className="text-[#173F3A] shrink-0">3. Collaborative Review:</strong>
              <span>Periodic reassessment of treatment plan milestones to measure tangible progress.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Insurance & Self-Pay Information */}
      <div className="bg-white rounded-xl p-6 border border-[#A9C2B2]/40 shadow-xs">
        <h4 className="font-serif font-bold text-base text-[#173F3A] mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#216761]" />
          Insurance Coverage & Payment Options
        </h4>
        <p className="text-xs text-[#66736F] leading-relaxed">
          Hope Community Support participates with SC Medicaid (Healthy Connections, First Choice by Select Health, Absolute Total Care, Molina Healthcare, BlueChoice HealthPlan) and major commercial insurance carriers. We also offer sliding-scale fees and flexible payment plans to ensure cost is never a barrier to quality care.
        </p>
      </div>
    </div>
  );
};
