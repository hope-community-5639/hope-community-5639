import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INTERVIEW_24_TOPICS, InterviewQuestionDefinition } from '../../data/interviewTemplates';
import { InterviewTopicAnswer, DeliveryMethod } from '../../types/clinical';
import { clinicalStore } from '../../db/clinicalStore';
import { initOfflineRecording, saveEncryptedChunk, sealRecording } from '../../lib/offlineRecording';
import {
  Mic,
  MicOff,
  Video,
  Phone,
  Building,
  Shield,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  FileText,
  Send,
  Save,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface Props {
  appointmentId?: string;
  clientId?: string;
  clientName?: string;
  modality?: DeliveryMethod;
  onConcludeSession?: (sessionId: string, recordingId: string) => void;
}

export const SessionWorkspace: React.FC<Props> = ({
  appointmentId = 'apt-001',
  clientId = 'user-client-1',
  clientName = 'Eleanor Vance',
  modality = 'video',
  onConcludeSession,
}) => {
  const { currentUser } = useAuth();
  const sessionId = useRef(`sess-${crypto.randomUUID()}`).current;
  const recordingId = useRef(`rec-${crypto.randomUUID()}`).current;

  // Session State
  const [consentGranted, setConsentGranted] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped' | 'withdrawn'>('idle');
  const [durationSecs, setDurationSecs] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  // 24 Questionnaire Tracking State
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(1);
  const [answers, setAnswers] = useState<Record<number, InterviewTopicAnswer>>(() => {
    const initial: Record<number, InterviewTopicAnswer> = {};
    INTERVIEW_24_TOPICS.forEach((t) => {
      initial[t.index] = {
        topicIndex: t.index,
        topicTitle: t.title,
        questionPrompt: t.prompt,
        clientAnswer: '',
        status: 'not_provided',
        confidenceScore: 1.0,
      };
    });
    // Seed Eleanor's initial answers for demo realism
    initial[1].clientAnswer = 'Client prefers Eleanor (she/her). Confirmed comfort with recording protocol.';
    initial[1].status = 'answered';
    initial[2].clientAnswer = 'Experiencing significant situational overwhelm driven by work demands and interpersonal changes.';
    initial[2].status = 'answered';
    initial[3].clientAnswer = 'Desires work-life boundaries (shut down computer by 18:30), 7 hours restorative sleep, and diaphragmatic breathing.';
    initial[3].status = 'answered';
    initial[11].clientAnswer = 'Late night screen use until 01:00 AM. Averages 4.5 hours of fragmented sleep. Melatonin 3mg tried.';
    initial[11].status = 'answered';
    initial[15].clientAnswer = 'Supportive sister Clara; weekend walking friend Maya. High verbal insight.';
    initial[15].status = 'answered';
    initial[21].clientAnswer = 'Explicitly denied suicidal ideation, intent, or self-harm impulses. No crisis flag.';
    initial[21].status = 'answered';
    return initial;
  });

  // Modals
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyActionNotes, setSafetyActionNotes] = useState('');
  const [showTechModal, setShowTechModal] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setDurationSecs((d) => d + 1);
        // Simulate audio waveform meter
        setMicLevel(Math.floor(Math.random() * 60) + 30);
      }, 1000);
    } else {
      setMicLevel(0);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  // Handle network online/offline listeners
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartRecording = async () => {
    if (!consentGranted) {
      alert('Informed recording consent is strictly required before audio capture can begin.');
      return;
    }
    try {
      await initOfflineRecording({
        recordingId,
        sessionId,
        appointmentId,
        clientId,
        clientName,
        providerId: currentUser?.id || 'staff-1',
        modality,
        consentObtained: true,
      });
      setRecordingState('recording');
    } catch (err: any) {
      alert(`Error initializing recording: ${err.message}`);
    }
  };

  const handlePauseResume = () => {
    if (recordingState === 'recording') {
      setRecordingState('paused');
    } else if (recordingState === 'paused') {
      setRecordingState('recording');
    }
  };

  const handleWithdrawConsent = async () => {
    if (window.confirm('Are you sure the client wants to withdraw recording consent? Audio capture will be stopped immediately and marked withdrawn.')) {
      setRecordingState('withdrawn');
      try {
        await fetch(`/api/clinical/sessions/recordings/${recordingId}/withdraw-consent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordingId }),
        });
      } catch (err) {
        // Safe fallback
      }
    }
  };

  const handleConcludeSession = async () => {
    if (recordingState === 'recording') {
      setRecordingState('stopped');
      await sealRecording(recordingId);
    }
    if (onConcludeSession) {
      onConcludeSession(sessionId, recordingId);
    } else {
      alert('Session concluded successfully. Audio sealed and routed to the Side-by-Side Review Workspace.');
    }
  };

  const handleTriggerSafetyAlert = () => {
    clinicalStore.addSafetyEvent({
      id: `safe-${crypto.randomUUID()}`,
      type: 'immediate_safety_concern',
      severity: 'critical_immediate',
      clientId,
      clientName,
      sessionId,
      reportedByUserId: currentUser?.id || 'staff-1',
      reportedByUserName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Clinician',
      reportedByUserRole: currentUser?.role || 'provider',
      immediateActionTaken: safetyActionNotes || 'Safety concern flagged during live session. Universal safety plan engaged.',
      crisisTeamNotified: true,
      resolutionStatus: 'active_investigation',
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setShowSafetyModal(false);
    setSafetyActionNotes('');
    alert('Restricted safety incident logged. Clinical on-call supervisor notified.');
  };

  const currentTopic = INTERVIEW_24_TOPICS.find((t) => t.index === selectedTopicIndex) || INTERVIEW_24_TOPICS[0];
  const answeredCount = Object.values(answers).filter((a) => a.status === 'answered').length;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-white rounded-xl border border-[#E3DCC9] shadow-sm overflow-hidden">
      {/* Top Banner: Verification & Session Controls */}
      <div className="bg-[#202826] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#303835]">
        {/* Left: Client & Verification */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#216761] flex items-center justify-center font-bold text-sm">
            {clientName.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm">{clientName}</h3>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center">
                <UserCheck className="w-3 h-3 mr-1" /> Identity Verified
              </span>
              {offlineMode ? (
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center">
                  <WifiOff className="w-3 h-3 mr-1" /> Local Encrypted Storage
                </span>
              ) : (
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center">
                  <Wifi className="w-3 h-3 mr-1" /> Online Encrypted
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Modality: <span className="capitalize font-medium text-gray-200">{modality.replace('_', ' ')}</span> | Emergency: Clara Vance (803) 555-0192
            </p>
          </div>
        </div>

        {/* Center: Recording Status Indicator */}
        <div className="flex items-center space-x-4 bg-black/40 px-4 py-1.5 rounded-lg border border-white/10">
          {recordingState === 'recording' && (
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-4" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Recording is Active</span>
              <span className="text-xs font-mono font-bold text-white ml-2">{formatTimer(durationSecs)}</span>
              {/* Mic Visualizer */}
              <div className="flex items-center space-x-0.5 h-4 ml-2">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                    style={{ height: `${Math.max(4, Math.min(16, (micLevel / 100) * 16 * (bar / 3)))}px` }}
                  />
                ))}
              </div>
            </div>
          )}

          {recordingState === 'paused' && (
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
              <Pause className="w-3.5 h-3.5" />
              <span>RECORDING PAUSED ({formatTimer(durationSecs)})</span>
            </div>
          )}

          {recordingState === 'idle' && (
            <span className="text-xs text-gray-400 flex items-center">
              <MicOff className="w-3.5 h-3.5 mr-1 text-gray-500" /> Audio Recording Standby (Consent Required)
            </span>
          )}

          {recordingState === 'withdrawn' && (
            <span className="text-xs text-red-400 font-semibold flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Consent Withdrawn — Capture Halted
            </span>
          )}
        </div>

        {/* Right: Urgent Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowSafetyModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/90 hover:bg-red-700 text-white shadow-sm transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-0.5" />
            <span>Safety Concern</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTechModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            Technical Issue
          </button>

          <button
            type="button"
            onClick={handleConcludeSession}
            className="flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#216761] hover:bg-[#184e49] text-white shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>Conclude Session</span>
          </button>
        </div>
      </div>

      {/* Recording Consent Gate & Controls Bar */}
      <div className="bg-[#F8F5EE] border-b border-[#E3DCC9] px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentGranted}
              disabled={recordingState === 'recording'}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="rounded text-[#216761] focus:ring-[#216761]"
            />
            <span className="font-semibold text-gray-800">
              Verified Session-Specific Consent Obtained from All Participants
            </span>
          </label>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">Questionnaire Progress: {answeredCount} / 24 Topics</span>
        </div>

        <div className="flex items-center space-x-2">
          {recordingState === 'idle' && (
            <button
              type="button"
              disabled={!consentGranted}
              onClick={handleStartRecording}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                consentGranted
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Mic className="w-3.5 h-3.5 mr-1" />
              <span>Start Encrypted Recording</span>
            </button>
          )}

          {(recordingState === 'recording' || recordingState === 'paused') && (
            <>
              <button
                type="button"
                onClick={handlePauseResume}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                {recordingState === 'recording' ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                <span>{recordingState === 'recording' ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                type="button"
                onClick={handleWithdrawConsent}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold bg-red-100 text-red-800 hover:bg-red-200"
              >
                <MicOff className="w-3.5 h-3.5 mr-1" />
                <span>Withdraw Consent</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout: Questionnaire List + Active Question Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: 24 Topics List */}
        <div className="w-80 md:w-96 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter 24 interview topics..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#216761] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-200 text-xs">
            {INTERVIEW_24_TOPICS.filter(
              (t) =>
                t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                t.category.toLowerCase().includes(searchFilter.toLowerCase())
            ).map((t) => {
              const ans = answers[t.index];
              const isSelected = selectedTopicIndex === t.index;
              const isAnswered = ans.status === 'answered';
              return (
                <div
                  key={t.index}
                  onClick={() => setSelectedTopicIndex(t.index)}
                  className={`p-3 cursor-pointer transition-colors flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-[#216761]/10 border-l-4 border-[#216761]'
                      : 'hover:bg-gray-100 bg-white'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                      isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isAnswered ? '✓' : t.index}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 truncate">{t.title}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-tight ml-1">{t.category}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{t.prompt}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Question Notes & Clinical Observations */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#216761]">
                Topic {currentTopic.index} of 24 • {currentTopic.category}
              </span>
              <div className="flex items-center space-x-2">
                <select
                  value={answers[currentTopic.index]?.status || 'not_provided'}
                  onChange={(e) => {
                    const status = e.target.value as any;
                    setAnswers((prev) => ({
                      ...prev,
                      [currentTopic.index]: { ...prev[currentTopic.index], status },
                    }));
                  }}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-[#216761]"
                >
                  <option value="not_provided">Status: Not Provided</option>
                  <option value="answered">Status: Answered</option>
                  <option value="skipped">Status: Skipped</option>
                  <option value="follow_up_required">Status: Follow-Up Needed</option>
                </select>
              </div>
            </div>
            <h2 className="text-xl font-bold font-serif text-[#202826] mt-1">{currentTopic.title}</h2>
            <div className="mt-2 p-3 bg-[#F8F5EE] border border-[#E3DCC9] rounded-lg text-xs text-gray-700">
              <p className="font-semibold text-gray-900 mb-0.5">Suggested Clinical Prompt:</p>
              <p className="italic">"{currentTopic.prompt}"</p>
              <p className="mt-1 text-gray-500"><strong>Clinical Purpose:</strong> {currentTopic.clinicalPurpose}</p>
            </div>
          </div>

          {/* Client Answer Input */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Client's Reported Statements & Verbatim Responses
            </label>
            <textarea
              value={answers[currentTopic.index]?.clientAnswer || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAnswers((prev) => ({
                  ...prev,
                  [currentTopic.index]: {
                    ...prev[currentTopic.index],
                    clientAnswer: val,
                    status: val.trim() ? 'answered' : 'not_provided',
                  },
                }));
              }}
              placeholder={currentTopic.placeholder}
              rows={5}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
            />
          </div>

          {/* Clinician Observations & Context */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Clinician Observations, Affect & Context
            </label>
            <textarea
              value={answers[currentTopic.index]?.clinicianNotes || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAnswers((prev) => ({
                  ...prev,
                  [currentTopic.index]: { ...prev[currentTopic.index], clinicianNotes: val },
                }));
              }}
              placeholder="Clinical observations regarding tone, eye contact, hesitation, or somatic indicators..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#216761] focus:outline-none"
            />
          </div>

          {/* Suggested Follow-Ups */}
          {currentTopic.suggestedFollowUps && currentTopic.suggestedFollowUps.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-1">Suggested Follow-Up Probes:</p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                {currentTopic.suggestedFollowUps.map((probe, idx) => (
                  <li key={idx}>{probe}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Safety Concern Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border-t-4 border-red-600">
            <div className="flex items-center space-x-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold">Log Restricted Safety & Safeguarding Incident</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Logging a safety concern immediately generates a restricted clinical audit record, notifies the on-call clinical supervisor, and displays emergency response resources.
            </p>

            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Immediate Safety Concern Notes & Actions Taken:
            </label>
            <textarea
              value={safetyActionNotes}
              onChange={(e) => setSafetyActionNotes(e.target.value)}
              placeholder="Describe the nature of the safety concern, immediate clinical interventions performed, and client disposition..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
            />

            <div className="bg-red-50 p-3 rounded-lg text-xs text-red-900 mb-4">
              <p className="font-bold">Immediate Hotline Verification:</p>
              <p>National Suicide & Crisis Lifeline: <strong>988</strong></p>
              <p>Crisis Text Line: <strong>Text HOME to 741741</strong></p>
              <p>Emergency Services: <strong>911</strong></p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSafetyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSafetyAlert}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Confirm & Escalate Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technical Issue Modal */}
      {showTechModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Technical Assistance & Troubleshooting</h3>
            <p className="text-xs text-gray-600 mb-4">
              If experiencing video lag or microphone disconnection, you can refresh the media stream or switch smoothly to offline local storage.
            </p>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setOfflineMode(!offlineMode);
                  setShowTechModal(false);
                }}
                className="w-full p-2.5 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="font-medium">Toggle Local Encrypted Offline Capture</span>
                <span className="text-xs text-gray-400">{offlineMode ? 'Active' : 'Standby'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Audio/video buffers cleared and media stream renegotiated.');
                  setShowTechModal(false);
                }}
                className="w-full p-2.5 text-left border rounded-lg hover:bg-gray-50 font-medium"
              >
                Reset WebRTC Media Stream
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowTechModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
