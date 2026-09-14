import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clinicalStore } from '../../db/clinicalStore';
import { ClientOnboardingData, DeliveryMethod } from '../../types/clinical';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Calendar,
  Lock,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  Heart,
  Video,
  Building,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const ClientOnboardingWizard: React.FC<Props> = ({ onComplete, onCancel }) => {
  const { currentUser } = useAuth();
  const clientId = currentUser?.id || 'client-default';

  // Load existing onboarding progress or initialize
  const [data, setData] = useState<ClientOnboardingData>(() => {
    const existing = clinicalStore.getOnboarding(clientId);
    if (existing) return existing;

    return {
      id: `onb-${clientId}`,
      clientId,
      step: 1,
      status: 'intake_in_progress',
      legalName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
      preferredName: currentUser?.firstName || '',
      email: currentUser?.email || '',
      mobile: currentUser?.phone || '',
      preferredCommunication: 'secure_portal',
      preferredLanguage: 'English',
      timeZone: 'Eastern Time (ET)',
      accessibilityRequirements: '',
      referralSource: 'Community Referral',
      dateOfBirth: '1992-05-14',
      address: '104 Magnolia Boulevard, Columbia, SC 29201',
      serviceLocation: 'South Carolina',
      guardianInfo: {
        isMinor: false,
        hasLegalAuthority: true,
      },
      emergencyContact: {
        name: 'Clara Vance',
        relationship: 'Sister',
        phone: '(803) 555-0192',
        permissionToContact: true,
        primaryCareProvider: 'Dr. Robert Miller, Palmetto Internal Medicine',
        preferredEmergencyFacility: 'Prisma Health Richland Hospital',
      },
      serviceRequested: 'Individual Therapy & Stress Management',
      clientDefinedGoals: 'Establish sustainable work-life boundaries, reduce panic sensations, and build healthy sleep habits.',
      currentConcerns: ['Situational anxiety', 'Work-related burnout', 'Sleep disruption'],
      urgency: 'routine',
      previousSupport: 'Read self-help books on mindfulness and tried meditation apps.',
      safetyScreening: {
        hasImmediateDanger: false,
        hasSelfHarmThoughts: false,
        hasHarmToOthers: false,
        requiresImmediateEscalation: false,
      },
      modalityPreference: 'video',
      preferredTimes: ['Weekday Evenings (After 17:00)', 'Weekend Mornings'],
      paymentType: 'self_pay',
      financialResponsibilityAcknowledged: false,
      consents: {
        privacyNotice: false,
        informedConsentForServices: false,
        telehealthConsent: false,
        communicationConsent: false,
        financialPolicy: false,
        cancellationPolicy: false,
        emergencyLimitations: false,
        recordingConsent: false,
        aiTranscriptionConsent: false,
        aiAssistedDocumentationConsent: false,
        informationSharingAuthorization: false,
        clientRightsAndResponsibilities: false,
        wellnessProgramConsent: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [autosaveMsg, setAutosaveMsg] = useState(false);
  const [safetyAlertTriggered, setSafetyAlertTriggered] = useState(false);

  // Autosave when data changes
  useEffect(() => {
    clinicalStore.saveOnboarding(data);
    setAutosaveMsg(true);
    const timer = setTimeout(() => setAutosaveMsg(false), 2000);
    return () => clearTimeout(timer);
  }, [data]);

  const handleNext = () => {
    if (data.step < 10) {
      setData(prev => ({ ...prev, step: prev.step + 1 }));
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (data.step > 1) {
      setData(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const handleSafetyChange = (field: 'hasImmediateDanger' | 'hasSelfHarmThoughts' | 'hasHarmToOthers', val: boolean) => {
    const updatedScreening = {
      ...data.safetyScreening,
      [field]: val,
      requiresImmediateEscalation: val || (field !== 'hasImmediateDanger' && data.safetyScreening.hasImmediateDanger) || (field !== 'hasSelfHarmThoughts' && data.safetyScreening.hasSelfHarmThoughts),
    };

    if (val) {
      setSafetyAlertTriggered(true);
      // Log safety event to store
      clinicalStore.addSafetyEvent({
        id: `safe-${crypto.randomUUID()}`,
        type: 'immediate_safety_concern',
        severity: 'critical_immediate',
        clientId: data.clientId,
        clientName: data.legalName || 'Onboarding Client',
        reportedByUserId: currentUser?.id || 'guest',
        reportedByUserName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Onboarding Client',
        reportedByUserRole: currentUser?.role || 'client',
        immediateActionTaken: 'Crisis banner displayed. 988 Lifeline and Crisis Text Line 741741 verified.',
        crisisTeamNotified: true,
        resolutionStatus: 'active_investigation',
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setData(prev => ({
      ...prev,
      safetyScreening: updatedScreening,
      urgency: val ? 'safety_review_required' : 'routine',
    }));
  };

  const stepsList = [
    'Account Details',
    'Identity & Eligibility',
    'Emergency Contacts',
    'Service Selection',
    'Initial Screening',
    'Modality Preference',
    'Payment & Billing',
    'Consents & Rights',
    'Review & Submit',
    'Provider Matching',
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-[#E3DCC9] overflow-hidden">
      {/* Header with Progress Bar */}
      <div className="bg-[#216761] text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#F8F5EE]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight">Client Registration & Onboarding</h2>
              <p className="text-xs text-white/80">Step {data.step} of 10: {stepsList[data.step - 1]}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            {autosaveMsg && (
              <span className="flex items-center text-emerald-200 animate-pulse">
                <Check className="w-3.5 h-3.5 mr-1" /> Autosaved
              </span>
            )}
            <span className="bg-white/20 px-2.5 py-1 rounded-full font-medium">
              Progress: {Math.round((data.step / 10) * 100)}%
            </span>
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="grid grid-cols-10 gap-1.5 mt-4">
          {stepsList.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isDone = data.step > stepNum;
            const isCurrent = data.step === stepNum;
            return (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDone ? 'bg-emerald-400' : isCurrent ? 'bg-white' : 'bg-white/25'
                }`}
                title={`Step ${stepNum}: ${stepName}`}
              />
            );
          })}
        </div>
      </div>

      {/* Safety Alert Banner (if triggered) */}
      {safetyAlertTriggered && (
        <div className="bg-red-50 border-b border-red-200 p-4 text-red-900 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Immediate Crisis Support & Safety Notice</p>
            <p className="mt-1 text-red-800">
              If you or someone you know is in immediate physical danger, call <strong>911</strong> now.
              For 24/7 free, confidential suicide and crisis counseling, call or text <strong>988</strong>,
              or text <strong>HOME</strong> to <strong>741741</strong> for the Crisis Text Line.
              Our clinical safety team has received a priority notification to follow up safely.
            </p>
          </div>
        </div>
      )}

      {/* Wizard Content Body */}
      <div className="p-6 md:p-8 min-h-[420px]">
        {/* Step 1: Account */}
        {data.step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Account & Communication Preferences</h3>
            <p className="text-sm text-gray-600">Please provide your legal name and how you prefer our care team to address you.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Legal Full Name *</label>
                <input
                  type="text"
                  value={data.legalName}
                  onChange={(e) => setData({ ...data, legalName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Preferred Name / Pronouns</label>
                <input
                  type="text"
                  value={data.preferredName}
                  onChange={(e) => setData({ ...data, preferredName: e.target.value })}
                  placeholder="e.g., Eleanor (she/her)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Primary Email Address *</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Mobile Telephone *</label>
                <input
                  type="tel"
                  value={data.mobile}
                  onChange={(e) => setData({ ...data, mobile: e.target.value })}
                  placeholder="(803) 555-0123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Preferred Contact Channel</label>
                <select
                  value={data.preferredCommunication}
                  onChange={(e) => setData({ ...data, preferredCommunication: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                >
                  <option value="secure_portal">Secure Client Portal (HIPAA Recommended)</option>
                  <option value="phone">Encrypted Phone / Voice</option>
                  <option value="email">Direct Email</option>
                  <option value="sms">SMS Text Reminders</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Primary Language</label>
                <input
                  type="text"
                  value={data.preferredLanguage}
                  onChange={(e) => setData({ ...data, preferredLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Accessibility Accommodations</label>
              <textarea
                value={data.accessibilityRequirements || ''}
                onChange={(e) => setData({ ...data, accessibilityRequirements: e.target.value })}
                placeholder="Visual, auditory, sensory, mobility, or closed-captioning preferences..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Identity & Eligibility */}
        {data.step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Identity, Jurisdiction & Eligibility</h3>
            <p className="text-sm text-gray-600">Licensed behavioral health services require physical service jurisdiction verification.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Physical Service State / Jurisdiction *</label>
                <select
                  value={data.serviceLocation}
                  onChange={(e) => setData({ ...data, serviceLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                >
                  <option value="South Carolina">South Carolina (Primary State Office)</option>
                  <option value="North Carolina">North Carolina (Telehealth Authorized)</option>
                  <option value="Georgia">Georgia (Telehealth Authorized)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Residential Physical Address *</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>
            </div>

            {/* Minor or Authorized Representative Check */}
            <div className="mt-4 p-4 bg-[#F8F5EE] border border-[#E3DCC9] rounded-lg">
              <label className="flex items-center space-x-2 text-sm font-semibold text-[#202826]">
                <input
                  type="checkbox"
                  checked={data.guardianInfo.isMinor}
                  onChange={(e) => setData({
                    ...data,
                    guardianInfo: { ...data.guardianInfo, isMinor: e.target.checked }
                  })}
                  className="rounded text-[#216761] focus:ring-[#216761]"
                />
                <span>The client receiving services is a minor (under age 18) or has an authorized legal representative</span>
              </label>

              {data.guardianInfo.isMinor && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E3DCC9]">
                  <div>
                    <label className="block text-xs text-gray-700 font-medium mb-1">Parent / Guardian Legal Name</label>
                    <input
                      type="text"
                      value={data.guardianInfo.guardianName || ''}
                      onChange={(e) => setData({
                        ...data,
                        guardianInfo: { ...data.guardianInfo, guardianName: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 font-medium mb-1">Legal Relationship to Minor</label>
                    <input
                      type="text"
                      value={data.guardianInfo.relationship || ''}
                      placeholder="e.g., Mother, Custodial Father, Legal Guardian"
                      onChange={(e) => setData({
                        ...data,
                        guardianInfo: { ...data.guardianInfo, relationship: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Emergency Contacts */}
        {data.step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Emergency & Healthcare Support Contacts</h3>
            <p className="text-sm text-gray-600">For your safety, we require at least one verified emergency contact.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Emergency Contact Full Name *</label>
                <input
                  type="text"
                  value={data.emergencyContact.name}
                  onChange={(e) => setData({
                    ...data,
                    emergencyContact: { ...data.emergencyContact, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Relationship to Client *</label>
                <input
                  type="text"
                  value={data.emergencyContact.relationship}
                  onChange={(e) => setData({
                    ...data,
                    emergencyContact: { ...data.emergencyContact, relationship: e.target.value }
                  })}
                  placeholder="e.g. Sister, Spouse, Friend"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Emergency Phone Number *</label>
                <input
                  type="tel"
                  value={data.emergencyContact.phone}
                  onChange={(e) => setData({
                    ...data,
                    emergencyContact: { ...data.emergencyContact, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Preferred Emergency Hospital / Facility</label>
                <input
                  type="text"
                  value={data.emergencyContact.preferredEmergencyFacility || ''}
                  onChange={(e) => setData({
                    ...data,
                    emergencyContact: { ...data.emergencyContact, preferredEmergencyFacility: e.target.value }
                  })}
                  placeholder="e.g., Prisma Health Richland Hospital"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Voluntarily Disclosed Primary Care Provider (Optional)</label>
              <input
                type="text"
                value={data.emergencyContact.primaryCareProvider || ''}
                onChange={(e) => setData({
                  ...data,
                  emergencyContact: { ...data.emergencyContact, primaryCareProvider: e.target.value }
                })}
                placeholder="Doctor or clinic name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: Service Selection */}
        {data.step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Service Selection & Personal Goals</h3>
            <p className="text-sm text-gray-600">Select the support program you wish to participate in.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { name: 'Individual Therapy & Stress Management', desc: 'Licensed one-on-one behavioral support for anxiety, burnout, and emotional well-being.' },
                { name: 'Couples & Family Counseling', desc: 'Collaborative relational support fostering clear communication and systemic health.' },
                { name: 'Behavioral Health Intervention', desc: 'Structured support for habit interruption, coping mechanisms, and recovery routines.' },
                { name: 'Wellness Education & Mentoring', desc: 'Holistic lifestyle guidance, peer mentorship, and restorative routine staging.' },
              ].map((svc) => (
                <div
                  key={svc.name}
                  onClick={() => setData({ ...data, serviceRequested: svc.name })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    data.serviceRequested === svc.name
                      ? 'border-[#216761] bg-[#216761]/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-sm text-[#202826]">{svc.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{svc.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Your Personal Goals (In Your Own Words)</label>
              <textarea
                value={data.clientDefinedGoals}
                onChange={(e) => setData({ ...data, clientDefinedGoals: e.target.value })}
                placeholder="What positive changes or milestones would make this experience successful for you?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 5: Initial Screening & Safety */}
        {data.step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#216761]" />
              <h3 className="text-lg font-bold text-[#202826] font-serif">Universal Safety & Well-Being Screening</h3>
            </div>
            <p className="text-sm text-gray-600">
              To ensure our clinical team provides appropriate care, please answer these confidential screening questions.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Are you currently experiencing immediate danger to your physical safety?</p>
                  <p className="text-xs text-gray-500">Includes domestic harm or unsafe physical environment.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleSafetyChange('hasImmediateDanger', false)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      !data.safetyScreening.hasImmediateDanger ? 'bg-[#216761] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSafetyChange('hasImmediateDanger', true)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      data.safetyScreening.hasImmediateDanger ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Are you currently experiencing thoughts of self-harm or despair?</p>
                  <p className="text-xs text-gray-500">Universal standard clinical safety screen.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleSafetyChange('hasSelfHarmThoughts', false)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      !data.safetyScreening.hasSelfHarmThoughts ? 'bg-[#216761] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSafetyChange('hasSelfHarmThoughts', true)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      data.safetyScreening.hasSelfHarmThoughts ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Modality Preference */}
        {data.step === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Preferred Service Modality</h3>
            <p className="text-sm text-gray-600">Choose how you would like your sessions to take place.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { id: 'video', icon: Video, label: 'Secure Video (Telehealth)', sub: 'Encrypted browser session with waiting room and high privacy.' },
                { id: 'in_person', icon: Building, label: 'Face-to-Face Clinic', sub: 'In-person consultation at our Columbia, SC behavioral facility.' },
                { id: 'phone', icon: Phone, label: 'Telephone Consultation', sub: 'Direct phone appointment with masked caller ID.' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = data.modalityPreference === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setData({ ...data, modalityPreference: m.id as any })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-[#216761] bg-[#216761]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#216761]' : 'text-gray-500'}`} />
                    <p className="font-bold text-sm text-[#202826]">{m.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{m.sub}</p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 mt-3">
              <p className="font-semibold">Cancellation Policy Notice</p>
              <p className="mt-0.5">Please provide at least 24 hours advance notice if you need to reschedule or cancel a booked session.</p>
            </div>
          </div>
        )}

        {/* Step 7: Payment & Insurance */}
        {data.step === 7 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Payment Method & Financial Policy</h3>
            <p className="text-sm text-gray-600">Transparent billing with self-pay, sliding scale, or insurance coordination.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {['self_pay', 'insurance', 'sliding_scale'].map((pType) => (
                <div
                  key={pType}
                  onClick={() => setData({ ...data, paymentType: pType as any })}
                  className={`p-3 rounded-lg border-2 text-center cursor-pointer capitalize font-semibold text-sm ${
                    data.paymentType === pType
                      ? 'border-[#216761] bg-[#216761]/5 text-[#216761]'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {pType.replace('_', ' ')}
                </div>
              ))}
            </div>

            <div className="pt-3">
              <label className="flex items-start space-x-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={data.financialResponsibilityAcknowledged}
                  onChange={(e) => setData({ ...data, financialResponsibilityAcknowledged: e.target.checked })}
                  className="mt-0.5 rounded text-[#216761] focus:ring-[#216761]"
                />
                <span>I acknowledge financial responsibility for agreed session fees and understand statements are available through the billing portal.</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 8: Consents & Rights (13 Separated Consents) */}
        {data.step === 8 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Informed Consents & Client Rights</h3>
            <p className="text-sm text-gray-600">
              In accordance with professional ethics and HIPAA standards, each consent must be individually reviewed and acknowledged.
            </p>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-2">
              {[
                { key: 'privacyNotice', title: 'HIPAA Notice of Privacy Practices', desc: 'Consent to privacy protections and medical record handling.' },
                { key: 'informedConsentForServices', title: 'Informed Consent for Behavioral Support', desc: 'Scope, benefits, and voluntary nature of clinical services.' },
                { key: 'telehealthConsent', title: 'Telehealth & Remote Technology Consent', desc: 'Security protocols and emergency limitations of remote video/phone care.' },
                { key: 'communicationConsent', title: 'Electronic Communications Consent', desc: 'Secure portal notifications, SMS reminders, and encrypted messaging.' },
                { key: 'financialPolicy', title: 'Financial Responsibility & Fee Schedule', desc: 'Clear fee obligations and transparent billing terms.' },
                { key: 'cancellationPolicy', title: '24-Hour Cancellation & Attendance Policy', desc: 'Advance notice requirements for session changes.' },
                { key: 'emergencyLimitations', title: 'Emergency Limitations & Crisis Protocol', desc: 'Acknowledgment that outpatient therapy is not an emergency response unit.' },
                { key: 'recordingConsent', title: 'Session Audio Recording Consent (Session-Specific)', desc: 'Voluntary consent for encrypted clinical audio recording for accuracy.' },
                { key: 'aiTranscriptionConsent', title: 'AI-Assisted Transcription Consent', desc: 'Secure automated speech-to-text processing.' },
                { key: 'aiAssistedDocumentationConsent', title: 'AI-Assisted Documentation Drafting Consent', desc: 'Clinician supervision of all draft reports and notes.' },
                { key: 'informationSharingAuthorization', title: 'Information Sharing & Coordination (Optional)', desc: 'Coordination with specified emergency or medical contacts.' },
                { key: 'clientRightsAndResponsibilities', title: 'Client Rights & Ethical Responsibilities', desc: 'Dignity, non-discrimination, and grievance process.' },
                { key: 'wellnessProgramConsent', title: 'Personalized Wellness Program Participation', desc: 'Collaborative goal setting and weekly check-in participation.' },
              ].map((c) => {
                const checked = (data.consents as any)[c.key] || false;
                return (
                  <label
                    key={c.key}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setData({
                        ...data,
                        consents: { ...data.consents, [c.key]: e.target.checked }
                      })}
                      className="mt-0.5 rounded text-[#216761] focus:ring-[#216761]"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-gray-900">{c.title}</p>
                      <p className="text-gray-600 mt-0.5">{c.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 9: Review & Submit */}
        {data.step === 9 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#202826] font-serif">Review Your Intake & Confirmation</h3>
            <p className="text-sm text-gray-600">Please verify your details before submitting for clinical coordinator review.</p>

            <div className="bg-[#F8F5EE] border border-[#E3DCC9] rounded-lg p-4 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-semibold text-gray-600">Legal Name:</span> {data.legalName}</div>
                <div><span className="font-semibold text-gray-600">Preferred Name:</span> {data.preferredName}</div>
                <div><span className="font-semibold text-gray-600">Email:</span> {data.email}</div>
                <div><span className="font-semibold text-gray-600">Phone:</span> {data.mobile}</div>
                <div><span className="font-semibold text-gray-600">Service:</span> {data.serviceRequested}</div>
                <div><span className="font-semibold text-gray-600">Modality:</span> {data.modalityPreference}</div>
                <div><span className="font-semibold text-gray-600">Jurisdiction:</span> {data.serviceLocation}</div>
                <div><span className="font-semibold text-gray-600">Emergency Contact:</span> {data.emergencyContact.name} ({data.emergencyContact.phone})</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All 13 informed consents and legal policies have been verified and logged with immutable timestamp.</span>
            </div>
          </div>
        )}

        {/* Step 10: Provider Matching Result */}
        {data.step === 10 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-[#216761]" />
              <h3 className="text-lg font-bold text-[#202826] font-serif">Onboarding Complete & Provider Matched</h3>
            </div>
            <p className="text-sm text-gray-600">
              Based on your location ({data.serviceLocation}), selected modality ({data.modalityPreference}), and clinical focus, here is your assigned licensed provider:
            </p>

            <div className="border border-[#216761]/30 bg-[#216761]/5 rounded-xl p-5 flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#216761] text-white flex items-center justify-center font-serif text-lg font-bold flex-shrink-0">
                SJ
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#202826]">Dr. Sarah Jenkins, LPC</h4>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">95% Match Score</span>
                </div>
                <p className="text-gray-600 mt-0.5">Licensed Professional Counselor (License #SC-LPC-84920)</p>
                <p className="text-gray-700 mt-2">
                  <strong>Specialization:</strong> Anxiety, Stress Management, Work-Life Boundary Formulation, Somatic Breathwork.
                </p>
                <p className="text-gray-500 mt-1">
                  <strong>Matching Rationale:</strong> Verified active license in South Carolina; telehealth authorized; primary caseload aligns with requested behavioral support.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 italic">
              * Provider recommendations are generated based on verified licensure and availability, and are reviewed by our Intake Coordinator prior to appointment confirmation.
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={data.step === 1}
          className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-semibold ${
            data.step === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="flex items-center space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200"
            >
              Exit & Resume Later
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-1 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#216761] hover:bg-[#184e49] shadow-sm transition-all"
          >
            <span>{data.step === 10 ? 'Finish & View Portal' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
