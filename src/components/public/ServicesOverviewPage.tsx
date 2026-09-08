import React, { useState } from 'react';
import { INITIAL_SERVICES } from '../../db/initialData';
import { ServiceItem, ServiceCategory } from '../../types';
import {
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Video,
  Home,
  Building,
} from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

interface ServicesOverviewPageProps {
  onSelectService: (category: ServiceCategory) => void;
  onOpenBooking: (serviceName?: string) => void;
}

export const ServicesOverviewPage: React.FC<ServicesOverviewPageProps> = ({
  onSelectService,
  onOpenBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Services (11)' },
    { id: 'therapy', label: 'Clinical Therapy' },
    { id: 'intervention', label: 'Behavioral Intervention' },
    { id: 'counseling', label: 'Counseling' },
    { id: 'training', label: 'Skill Building & Training' },
    { id: 'mentoring', label: 'Youth & Adult Mentoring' },
    { id: 'telehealth', label: 'Telehealth' },
    { id: 'in_home', label: 'In-Home Care' },
  ];

  const filteredServices = selectedCategory === 'all'
    ? INITIAL_SERVICES
    : INITIAL_SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <EmergencyBanner compact />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">
          Evidence-Based Behavioral Health
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#173F3A] mt-1">
          Our Comprehensive Services
        </h1>
        <p className="text-sm sm:text-base text-[#66736F] mt-3 leading-relaxed">
          Hope Community Support provides a full spectrum of therapeutic care, behavioral interventions, psychoeducation, and community mentoring tailored to your distinct journey.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[#173F3A] text-white shadow-xs'
                : 'bg-white border border-[#A9C2B2]/50 text-[#202826] hover:bg-[#F8F5EE]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border border-[#A9C2B2]/40 shadow-xs hover:border-[#216761]/60 hover:shadow-md transition-all flex flex-col justify-between p-6"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#216761]/10 text-[#173F3A]">
                  {service.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1 text-xs text-[#66736F]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{service.durationMinutes} min</span>
                </div>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#173F3A] mb-2">
                {service.name}
              </h3>
              <p className="text-xs text-[#66736F] leading-relaxed mb-4">
                {service.shortDescription}
              </p>

              {/* Formats Supported */}
              <div className="flex items-center gap-2 mb-4 text-[11px] text-[#216761] font-medium">
                <span className="text-[#66736F]">Formats:</span>
                {service.availableFormats.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-[#F8F5EE] px-2 py-0.5 rounded text-xs capitalize">
                    {f === 'telehealth' && <Video className="w-3 h-3" />}
                    {f === 'in_home' && <Home className="w-3 h-3" />}
                    {f === 'office' && <Building className="w-3 h-3" />}
                    {f.replace('_', ' ')}
                  </span>
                ))}
              </div>

              {/* Target Concerns */}
              <div className="pt-3 border-t border-[#F1ECE1]">
                <span className="text-[11px] font-semibold text-[#173F3A] block mb-1">Addressed Concerns:</span>
                <ul className="text-xs text-[#202826]/75 space-y-1">
                  {service.commonConcerns.slice(0, 3).map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6A66B] shrink-0" />
                      <span className="truncate">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F1ECE1] flex items-center justify-between">
              <button
                onClick={() => onSelectService(service.category)}
                className="text-xs font-bold text-[#216761] hover:text-[#173F3A] flex items-center gap-1"
              >
                Learn More →
              </button>
              <button
                onClick={() => onOpenBooking(service.name)}
                className="px-3 py-1.5 rounded-md bg-[#216761] text-white text-xs font-semibold hover:bg-[#173F3A] transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#173F3A] rounded-xl p-8 text-white text-center max-w-3xl mx-auto shadow-md">
        <h3 className="font-serif font-bold text-xl mb-2">Unsure which service is right for you?</h3>
        <p className="text-xs sm:text-sm text-[#A9C2B2] mb-6 leading-relaxed">
          Our intake coordinators offer free, confidential consultations to help determine the optimal therapeutic or supportive match for you or your loved one.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => onOpenBooking()}
            className="px-5 py-2.5 rounded-lg bg-[#C6A66B] text-[#173F3A] font-bold text-xs hover:bg-[#d8b87d]"
          >
            Request Intake Consultation
          </button>
          <a
            href="tel:8037019332"
            className="px-5 py-2.5 rounded-lg bg-[#216761] text-white font-medium text-xs hover:bg-[#2a7a73]"
          >
            Call Us at (803) 701-9332
          </a>
        </div>
      </div>
    </div>
  );
};
