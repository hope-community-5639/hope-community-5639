import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';

interface LegalPagesProps {
  page: 'privacy' | 'hipaa' | 'terms' | 'accessibility' | 'nondiscrimination';
  onNavigate: (view: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <EmergencyBanner compact />

      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 sm:p-12 shadow-xs space-y-6">
        {page === 'privacy' && (
          <article className="space-y-4 text-xs sm:text-sm text-[#202826] leading-relaxed">
            <div className="border-b border-[#F1ECE1] pb-4">
              <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">Legal & Data Protection</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">Privacy Policy</h1>
              <p className="text-xs text-[#66736F] mt-1">Last Updated: January 2025 • Hope Community Support</p>
            </div>
            <p>
              Hope Community Support (H.O.P.E., established 2008) is deeply dedicated to maintaining your personal and digital privacy. This Privacy Policy describes how we collect, handle, and protect your information when utilizing our website, client portal, and appointment scheduling tools.
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">1. Information We Collect</h3>
            <p>
              We collect information you explicitly provide: demographic details, email addresses, phone numbers, contact preferences, and when applicable, digital intake records, consent signatures, and communication messages.
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">2. How We Safeguard Information</h3>
            <p>
              We utilize healthcare-grade transport layer encryption (TLS 1.3), AES-256 encrypted storage for records at rest, role-based authorization protocols, and automated session timeouts to prevent unauthorized access.
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">3. Zero Selling of Personal Data</h3>
            <p>
              Hope Community Support will never sell, rent, or trade your personal information, contact information, or health data to third-party marketers or data aggregators.
            </p>
          </article>
        )}

        {page === 'hipaa' && (
          <article className="space-y-4 text-xs sm:text-sm text-[#202826] leading-relaxed">
            <div className="border-b border-[#F1ECE1] pb-4">
              <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">Federal Healthcare Compliance</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">HIPAA Notice of Privacy Practices</h1>
              <p className="text-xs text-[#66736F] mt-1">Effective Date: Established 2008 • Reviewed Annually</p>
            </div>
            <div className="p-4 bg-[#F8F5EE] border-l-4 border-[#216761] rounded-r-lg font-medium text-xs text-[#173F3A]">
              THIS NOTICE DESCRIBES HOW MEDICAL AND BEHAVIORAL HEALTH INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW CAREFULLY.
            </div>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">Our Legal Duty</h3>
            <p>
              Under the Health Insurance Portability and Accountability Act of 1996 (HIPAA), Hope Community Support is required by law to maintain the privacy of Protected Health Information (PHI) and to provide you with notice of our legal duties and privacy practices with respect to PHI.
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">Permitted Uses & Disclosures</h3>
            <p>
              We use your health information for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#66736F]">
              <li><strong>Treatment:</strong> Providing, coordinating, or managing behavioral health therapy, counseling, and intervention among your care team.</li>
              <li><strong>Payment:</strong> Billing and collecting payment from your health plan, Medicaid, or other insurance programs.</li>
              <li><strong>Health Care Operations:</strong> Quality evaluation, clinical supervision, internal audits, licensing, and compliance monitoring.</li>
            </ul>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">Your Privacy Rights</h3>
            <p>
              You have the right to inspect and copy your clinical record, request confidential communications, request amendments, request an accounting of disclosures, and obtain a paper copy of this notice.
            </p>
            <p className="text-xs text-[#66736F] pt-2">
              For privacy questions or concerns, contact our HIPAA Privacy Officer at <strong>(803) 701-9332</strong> or email <strong>hopecommunitysc@gmail.com</strong>.
            </p>
          </article>
        )}

        {page === 'terms' && (
          <article className="space-y-4 text-xs sm:text-sm text-[#202826] leading-relaxed">
            <div className="border-b border-[#F1ECE1] pb-4">
              <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">Terms & Conditions</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">Terms of Use</h1>
              <p className="text-xs text-[#66736F] mt-1">Hope Community Support • Hands On Personal Empowerment</p>
            </div>
            <p>
              By accessing the Hope Community Support web platform and client portal, you agree to comply with and be bound by the following terms of use.
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">1. Emergency Disclaimers</h3>
            <p>
              This website and its associated communication portals are not intended for medical emergencies. If you are experiencing a mental health emergency, thoughts of self-harm, or severe distress, immediately call <strong>911</strong> or call/text <strong>988</strong>.
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">2. Portal Account Security</h3>
            <p>
              Clients are responsible for keeping portal login credentials secure and confidential. Do not share your password. If you suspect unauthorized access, notify administration immediately.
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">3. Cancellation & Attendance Policy</h3>
            <p>
              Cancellations require a minimum of 24 hours advance notice to permit scheduling other community members. Repeated unexcused missed appointments may result in re-evaluation of treatment plan scheduling.
            </p>
          </article>
        )}

        {page === 'accessibility' && (
          <article className="space-y-4 text-xs sm:text-sm text-[#202826] leading-relaxed">
            <div className="border-b border-[#F1ECE1] pb-4">
              <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">Inclusion & Standards</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">Accessibility Statement</h1>
              <p className="text-xs text-[#66736F] mt-1">WCAG 2.1 AA Compliance Standard</p>
            </div>
            <p>
              Hope Community Support is dedicated to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards (WCAG 2.1 Level AA conformance).
            </p>
            <h3 className="font-serif font-bold text-base text-[#173F3A] pt-2">Features & Adaptations</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#66736F]">
              <li>High-contrast visual design meeting 4.5:1 text-to-background contrast ratios.</li>
              <li>Semantic HTML5 landmarks and ARIA attributes for screen reader accessibility.</li>
              <li>Full keyboard navigation across modals, forms, and scheduling calendars.</li>
              <li>Physical accessibility: ADA ramp and elevator access at our Rock Hill clinic.</li>
            </ul>
          </article>
        )}

        {page === 'nondiscrimination' && (
          <article className="space-y-4 text-xs sm:text-sm text-[#202826] leading-relaxed">
            <div className="border-b border-[#F1ECE1] pb-4">
              <span className="text-xs font-bold text-[#216761] uppercase tracking-widest">Civil Rights & Equal Access</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A] mt-1">Nondiscrimination Notice</h1>
              <p className="text-xs text-[#66736F] mt-1">Title VI of the Civil Rights Act & Section 1557 of the ACA</p>
            </div>
            <p>
              Hope Community Support complies with applicable Federal civil rights laws and does not discriminate on the basis of race, color, national origin, age, disability, religion, sex, sexual orientation, or gender identity.
            </p>
            <p>
              Hope Community Support does not exclude people or treat them differently because of race, color, national origin, age, disability, or sex. We provide free language assistance services to individuals whose primary language is not English, including qualified bilingual staff and interpreter services.
            </p>
          </article>
        )}

        <div className="pt-6 border-t border-[#F1ECE1] flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-bold text-[#216761] hover:underline"
          >
            ← Back to Homepage
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="text-xs font-bold text-[#173F3A] hover:underline"
          >
            Contact Privacy Compliance →
          </button>
        </div>
      </div>
    </div>
  );
};
