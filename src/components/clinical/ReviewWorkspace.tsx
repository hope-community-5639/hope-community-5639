import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FormalReport, SessionTranscript, TranscriptSegment } from '../../types/clinical';
import { clinicalStore } from '../../db/clinicalStore';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit3,
  Check,
  Send,
  Download,
  Shield,
  Clock,
  User,
  Printer,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface Props {
  reportId?: string;
  onApprovalComplete?: () => void;
}

export const ReviewWorkspace: React.FC<Props> = ({ reportId = 'rpt-vance-001', onApprovalComplete }) => {
  const { currentUser } = useAuth();
  const report = clinicalStore.getReportById(reportId, currentUser) || clinicalStore.getReports(currentUser)[0];

  // Left-side Audio & Transcript State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(128); // 02:08
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Sample Transcript Data
  const sampleSegments: TranscriptSegment[] = [
    {
      id: 'seg-1',
      speaker: 'Interviewer/Provider',
      timestampStart: '00:00:15',
      timestampEnd: '00:00:45',
      text: 'Good morning Eleanor. Before we begin, I want to confirm you received our recording consent notice and feel comfortable proceeding today.',
      confidence: 0.98,
      topicMappingIndex: 1,
    },
    {
      id: 'seg-2',
      speaker: 'Client',
      timestampStart: '00:00:46',
      timestampEnd: '00:01:25',
      text: 'Yes Dr. Jenkins, I consented in the portal. I prefer being called Eleanor. I have been feeling quite overwhelmed with work and life changes recently.',
      confidence: 0.96,
      topicMappingIndex: 2,
    },
    {
      id: 'seg-3',
      speaker: 'Interviewer/Provider',
      timestampStart: '00:01:28',
      timestampEnd: '00:02:05',
      text: 'Thank you Eleanor. Looking ahead, what personal goals would you most like to focus on over the coming weeks?',
      confidence: 0.97,
      topicMappingIndex: 3,
    },
    {
      id: 'seg-4',
      speaker: 'Client',
      timestampStart: '00:02:08',
      timestampEnd: '00:03:10',
      text: 'I really want to establish healthier boundaries around work hours, learn diaphragmatic breathing for moments of panic, and improve my sleep schedule from 4 hours to at least 7 hours.',
      confidence: 0.94,
      topicMappingIndex: 3,
      uncertaintyFlags: [
        {
          type: 'quantity',
          word: '4 hours to at least 7 hours',
          reason: 'Specific numeric target confirmed by client statement',
        },
      ],
    },
    {
      id: 'seg-5',
      speaker: 'Interviewer/Provider',
      timestampStart: '00:03:15',
      timestampEnd: '00:03:55',
      text: 'Those are very clear and grounded goals. What does your current sleep and evening routine look like right now?',
      confidence: 0.98,
      topicMappingIndex: 11,
    },
    {
      id: 'seg-6',
      speaker: 'Client',
      timestampStart: '00:03:57',
      timestampEnd: '00:05:02',
      text: 'I tend to keep my laptop open in bed until 1 AM answering emails. My mind races. I tried taking melatonin 3mg occasionally, but without much change.',
      confidence: 0.92,
      topicMappingIndex: 11,
      uncertaintyFlags: [
        {
          type: 'medication',
          word: 'melatonin 3mg',
          reason: 'Over-the-counter supplement voluntarily disclosed; verify dosage',
        },
      ],
    },
    {
      id: 'seg-7',
      speaker: 'Interviewer/Provider',
      timestampStart: '00:05:05',
      timestampEnd: '00:05:40',
      text: 'Understood. Who are the people in your life who offer grounding and support when things feel challenging?',
      confidence: 0.99,
      topicMappingIndex: 15,
    },
    {
      id: 'seg-8',
      speaker: 'Client',
      timestampStart: '00:05:42',
      timestampEnd: '00:06:30',
      text: 'My sister Clara is very supportive, and I also have a close friend Maya who I walk with on weekend mornings when my schedule allows.',
      confidence: 0.95,
      topicMappingIndex: 15,
    },
    {
      id: 'seg-9',
      speaker: 'Interviewer/Provider',
      timestampStart: '00:06:33',
      timestampEnd: '00:07:15',
      text: 'To ensure our universal safety protocols, do you have any current thoughts of self-harm, despair, or feeling unsafe?',
      confidence: 0.99,
      topicMappingIndex: 21,
    },
    {
      id: 'seg-10',
      speaker: 'Client',
      timestampStart: '00:07:17',
      timestampEnd: '00:07:48',
      text: 'No, I have no desire to hurt myself or anyone else. It is strictly stress and anxiety overload.',
      confidence: 0.98,
      topicMappingIndex: 21,
    },
  ];

  // Right-side Report Editing State
  const [editableReport, setEditableReport] = useState<FormalReport | undefined>(report);
  const [providerSignature, setProviderSignature] = useState(
    currentUser ? `${currentUser.firstName} ${currentUser.lastName}, LPC` : 'Dr. Sarah Jenkins, LPC'
  );
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  if (!editableReport) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <p className="text-gray-600">No formal report found or you do not have permission to view raw drafts.</p>
      </div>
    );
  }

  const handleSeek = (timestampStr: string) => {
    const parts = timestampStr.split(':');
    if (parts.length === 2) {
      const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      setCurrentTimeSec(secs);
      setIsPlaying(true);
    }
  };

  const handleApproveAndSign = () => {
    if (!currentUser || currentUser.role === 'client') {
      alert('Only verified licensed practitioners can sign and approve formal clinical reports.');
      return;
    }

    const updated: FormalReport = {
      ...editableReport,
      status: 'approved_by_provider',
      reviewedByProviderId: currentUser.id,
      reviewedByProviderName: `${currentUser.firstName} ${currentUser.lastName}`,
      providerSignature: `${providerSignature} (License #SC-LPC-84920)`,
      providerSignatureTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clinicalStore.saveReport(updated);
    setEditableReport(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
    if (onApprovalComplete) onApprovalComplete();
  };

  const handleSendClarification = () => {
    alert(`Clarification question dispatched to client via secure portal: "${clarificationQuestion}"`);
    setShowClarificationModal(false);
    setClarificationQuestion('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-white rounded-xl border border-[#E3DCC9] shadow-sm overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-[#216761] text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#184e49]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold font-serif text-base tracking-tight">
              Clinical Review Workspace: {editableReport.reportReference}
            </span>
            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[11px] font-semibold">
              Client: {editableReport.clientName}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              editableReport.status === 'approved_by_provider' ? 'bg-emerald-400 text-[#202826]' : 'bg-amber-300 text-[#202826]'
            }`}>
              {editableReport.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-white/80 mt-0.5">
            Session Date: {editableReport.sessionDate} • Evaluator: {editableReport.providerName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {saveSuccessMsg && (
            <span className="text-xs font-bold text-emerald-200 flex items-center mr-2 animate-pulse">
              <Check className="w-4 h-4 mr-1" /> Approved & Signed
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowClarificationModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Request Clarification
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleApproveAndSign}
            className="flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-[#216761] hover:bg-[#F8F5EE] shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
            <span>Sign & Approve Report</span>
          </button>
        </div>
      </div>

      {/* Main Side-by-Side Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 overflow-hidden">
        {/* LEFT COLUMN: Secure Audio Player & Verbatim Transcript */}
        <div className="flex flex-col h-full bg-[#FAF9F5] overflow-hidden">
          {/* Audio Player Controller */}
          <div className="p-4 bg-white border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-[#216761] text-white flex items-center justify-center hover:bg-[#184e49] transition-all shadow-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-[#202826]">Session Master Audio (SHA-256 Verified)</p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {Math.floor(currentTimeSec / 60).toString().padStart(2, '0')}:{(currentTimeSec % 60).toString().padStart(2, '0')} / 07:48
                  </p>
                </div>
              </div>

              {/* Playback Speeds */}
              <div className="flex items-center space-x-1">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      playbackSpeed === spd ? 'bg-[#216761] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Scrubber Bar */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={468}
                value={currentTimeSec}
                onChange={(e) => setCurrentTimeSec(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#216761]"
              />
            </div>
          </div>

          {/* Transcript Search */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search speaker transcript..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#216761] focus:outline-none"
              />
            </div>
          </div>

          {/* Verbatim Transcript Segments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {sampleSegments
              .filter((s) => s.text.toLowerCase().includes(transcriptSearch.toLowerCase()))
              .map((seg) => {
                const isClient = seg.speaker === 'Client';
                return (
                  <div
                    key={seg.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isClient ? 'bg-white border-gray-200' : 'bg-emerald-50/40 border-emerald-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isClient ? 'text-gray-900' : 'text-[#216761]'}`}>
                          {seg.speaker}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSeek(seg.timestampStart)}
                          className="font-mono text-[10px] text-gray-500 hover:text-[#216761] hover:underline flex items-center"
                          title="Click to jump audio scrubber"
                        >
                          <Clock className="w-3 h-3 mr-0.5 inline" />
                          {seg.timestampStart}
                        </button>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400">
                        {Math.round(seg.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <p className="text-gray-800 leading-relaxed text-xs">{seg.text}</p>

                    {/* Uncertainty Flags */}
                    {seg.uncertaintyFlags && seg.uncertaintyFlags.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                        {seg.uncertaintyFlags.map((u, i) => (
                          <span
                            key={i}
                            className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-medium flex items-center"
                            title={u.reason}
                          >
                            <AlertCircle className="w-3 h-3 mr-1 text-amber-700" />
                            Flag: {u.word} ({u.type})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* RIGHT COLUMN: AI-Assisted Formal Report */}
        <div className="flex flex-col h-full bg-white overflow-y-auto p-6 space-y-6">
          {/* Branded Clinical Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold font-serif text-[#202826]">
                  Hope Community Support • Clinical Assessment
                </h1>
                <p className="text-xs text-gray-500">Hands On Personal Empowerment — Established 2008</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-gray-800">{editableReport.reportReference}</p>
                <p className="text-gray-500">Date: {editableReport.sessionDate}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                1. Executive Summary
              </h2>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                AI Clinical Synthesis
              </span>
            </div>
            <textarea
              value={editableReport.executiveSummary}
              onChange={(e) => setEditableReport({ ...editableReport, executiveSummary: e.target.value })}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg text-xs leading-relaxed focus:ring-1 focus:ring-[#216761]"
            />
          </div>

          {/* Client-Reported Goals */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                2. Client-Reported Goals & Objectives
              </h2>
              <button
                type="button"
                onClick={() => handleSeek('00:02:08')}
                className="text-[10px] font-mono text-[#216761] hover:underline"
              >
                Ref: [00:02:08]
              </button>
            </div>
            <ul className="list-disc list-inside text-xs text-gray-800 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {editableReport.clientReportedGoals.map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Clinician Observations */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                3. Clinician Observations & Mental Status
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Licensed Professional Assessment
              </span>
            </div>
            <textarea
              value={editableReport.providerObservations}
              onChange={(e) => setEditableReport({ ...editableReport, providerObservations: e.target.value })}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg text-xs leading-relaxed focus:ring-1 focus:ring-[#216761]"
            />
          </div>

          {/* Safety & Safeguarding Statement */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold mb-1">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Universal Safety & Risk Assessment</span>
            </div>
            <p className="text-emerald-800">{editableReport.safetyOrReferralConsiderations}</p>
          </div>

          {/* Items Requiring Confirmation */}
          {editableReport.itemsRequiringConfirmation && editableReport.itemsRequiringConfirmation.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
              <p className="font-bold text-amber-900 mb-1">Items Requiring Client Confirmation:</p>
              <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                {editableReport.itemsRequiringConfirmation.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Agreed Next Steps */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              4. Agreed Next Steps & Action Plan
            </h2>
            <div className="space-y-1.5 text-xs text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {editableReport.agreedNextSteps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#216761] flex-shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Professional Signature Block */}
          <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-[#FAF9F5] space-y-3">
            <div className="flex items-center space-x-2 text-[#216761] font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Mandatory Professional Sign-Off & Attestation</span>
            </div>
            <p className="text-[11px] text-gray-600">
              I attest that I have reviewed the recorded session audio, verified the extracted statements for accuracy, and approved this clinical record under my professional license.
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                Licensed Practitioner Signature
              </label>
              <input
                type="text"
                value={providerSignature}
                onChange={(e) => setProviderSignature(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs font-serif italic text-gray-900 bg-white"
              />
            </div>
            {editableReport.providerSignatureTimestamp && (
              <p className="text-[10px] text-gray-500 font-mono">
                Signed on: {new Date(editableReport.providerSignatureTimestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Clarification Request Modal */}
      {showClarificationModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Request Client Clarification</h3>
            <p className="text-xs text-gray-600 mb-3">
              Send a secure question to Eleanor Vance to confirm specific statements before report finalization.
            </p>
            <textarea
              value={clarificationQuestion}
              onChange={(e) => setClarificationQuestion(e.target.value)}
              placeholder="e.g. Can you confirm the dosage and frequency of your over-the-counter melatonin?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowClarificationModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendClarification}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#216761] hover:bg-[#184e49] rounded-md"
              >
                Send via Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
