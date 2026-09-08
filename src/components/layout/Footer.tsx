import React from 'react';
import { HeartHandshake, Phone, Mail, MapPin, Printer, Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, category?: string) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <footer className="bg-[#173F3A] text-[#F8F5EE] border-t border-[#216761]/40">
      {/* Top Pre-footer CTA */}
      <div className="border-b border-[#216761]/50 py-10 bg-[#102D29]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
              Ready to Begin Your Care Journey?
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Compassionate Support for Every Stage of Life
            </h3>
            <p className="text-sm text-[#A9C2B2] mt-1 max-w-xl">
              Hope Community Support offers office, in-home, and telehealth appointments across South Carolina.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              type="button"
              className="px-5 py-3 rounded-lg bg-[#C6A66B] hover:bg-[#d8b87d] text-[#173F3A] font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              Request an Appointment
            </button>
            <a
              href="tel:8037019332"
              className="px-4 py-3 rounded-lg bg-[#216761] hover:bg-[#2a7a73] text-white font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#C6A66B]" />
              (803) 701-9332
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About HCS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#216761] flex items-center justify-center text-[#C6A66B]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg text-white">Hope Community Support</span>
            </div>
            <p className="text-xs text-[#A9C2B2] leading-relaxed mb-4">
              <strong>H.O.P.E.</strong> stands for <em>Hands On Personal Empowerment</em>. Established in 2008, we are dedicated to providing quality behavioral-health care, counseling, intervention, training, and mentoring to clients of all ages.
            </p>
            <div className="text-xs text-[#C6A66B] font-serif italic">
              Helping the Community Thrive • Est. 2008
            </div>
          </div>

          {/* Col 2: Core Services */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#216761] pb-1">
              Core Services
            </h4>
            <ul className="space-y-2 text-xs text-[#A9C2B2]">
              <li>
                <button onClick={() => onNavigate('service_detail', 'therapy')} className="hover:text-white transition-colors">
                  Clinical Therapy (CBT & EMDR)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_detail', 'intervention')} className="hover:text-white transition-colors">
                  Behavioral Intervention Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_detail', 'counseling')} className="hover:text-white transition-colors">
                  Individual, Couples & Family Counseling
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_detail', 'training')} className="hover:text-white transition-colors">
                  Skill Building & Psychoeducation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_detail', 'mentoring')} className="hover:text-white transition-colors">
                  Community & Youth Mentoring
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_detail', 'telehealth')} className="hover:text-white transition-colors">
                  HIPAA-Compliant Telehealth Care
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_detail', 'in_home')} className="hover:text-white transition-colors">
                  In-Home Supportive Care
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Areas of Support & Organization */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#216761] pb-1">
              Areas of Support
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-[#A9C2B2]">
              <span>• Grief & Loss</span>
              <span>• Depression</span>
              <span>• Anxiety Care</span>
              <span>• Relationships</span>
              <span>• Addictions</span>
              <span>• Eating Disorders</span>
              <span>• Stress Relief</span>
              <span>• Parenting</span>
              <span>• Career Growth</span>
              <span>• Life Transitions</span>
            </div>
            <div className="mt-4 pt-3 border-t border-[#216761]/40">
              <button
                onClick={() => onNavigate('referrals')}
                className="text-xs text-[#C6A66B] hover:underline font-medium flex items-center gap-1"
              >
                <span>Healthcare Provider & Organization Referrals</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Col 4: Verified Contact & Location */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#216761] pb-1">
              Contact & Location
            </h4>
            <div className="space-y-3 text-xs text-[#A9C2B2]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C6A66B] shrink-0 mt-0.5" />
                <span>331 E Main Street Downtown, Suite 200, Rock Hill, SC 29730</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <a href="tel:8037019332" className="hover:text-white">803-701-9332</a>
              </div>
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>Fax: 980-217-8340</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <a href="mailto:hopecommunitysc@gmail.com" className="hover:text-white">hopecommunitysc@gmail.com</a>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-[#A9C2B2] bg-[#216761]/30 px-2 py-1 rounded">
                  <Shield className="w-3 h-3 text-[#C6A66B]" />
                  Office Hours: Mon–Thu 8:30am–6:00pm, Fri 9am–4pm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency & Disclaimer Bar */}
        <div className="mt-8 pt-6 border-t border-[#216761]/50 text-xs text-[#A9C2B2] leading-relaxed">
          <p>
            <strong className="text-white">Disclaimer:</strong> The information provided on this website is for educational and informational purposes only and does not constitute professional clinical evaluation, medical advice, or psychiatric diagnosis. In a life-threatening crisis, dial <strong>911</strong> or call/text <strong>988</strong>.
          </p>
        </div>

        {/* Bottom Legal Links & Copyright */}
        <div className="mt-6 pt-6 border-t border-[#216761]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#66736F] gap-4">
          <div>
            © 2008 – {new Date().getFullYear()} Hope Community Support. All rights reserved. Hands On Personal Empowerment.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#A9C2B2]">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('hipaa')} className="hover:text-white">
              HIPAA Notice
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-white">
              Terms of Use
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('accessibility')} className="hover:text-white">
              Accessibility
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('nondiscrimination')} className="hover:text-white">
              Nondiscrimination
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
