import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Shield,
  AlertTriangle,
  Clock,
  Captions,
  CheckCircle2,
  Lock,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface Props {
  appointmentId?: string;
  providerName?: string;
  serviceName?: string;
  onEndSession?: () => void;
}

export const ClientVideoSessionView: React.FC<Props> = ({
  appointmentId = 'apt-001',
  providerName = 'Dr. Sarah Jenkins, LPC',
  serviceName = 'Individual Therapy & Stress Management',
  onEndSession,
}) => {
  const { currentUser } = useAuth();

  // Call status
  const [callState, setCallState] = useState<'pre_call_check' | 'waiting_room' | 'in_session' | 'ended'>('pre_call_check');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [recordingConsentGiven, setRecordingConsentGiven] = useState(true);
  const [emergencyLocation, setEmergencyLocation] = useState('104 Magnolia Blvd, Columbia, SC 29201');
  const [locationConfirmed, setLocationConfirmed] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Audio level preview
  const [audioLevel, setAudioLevel] = useState(65);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Timer when in session
  useEffect(() => {
    let interval: any;
    if (callState === 'in_session') {
      interval = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleJoinCall = () => {
    if (!locationConfirmed) {
      alert('Please confirm your current physical address for safety regulations before entering.');
      return;
    }
    setCallState('waiting_room');
    // Simulate provider admitting after 2 seconds
    setTimeout(() => {
      setCallState('in_session');
    }, 2500);
  };

  const handleLeaveCall = () => {
    setCallState('ended');
    if (onEndSession) onEndSession();
  };

  return (
    <div className="space-y-6">
      {/* Emergency Physical Location Confirmation (Telehealth Standard) */}
      <div className="bg-[#FAF7F0] border border-[#C6A66B]/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#216761] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#173F3A] block">Telehealth Safety & Physical Location Requirement</span>
            <span className="text-[#66736F]">
              Healthcare licensing requires documenting your physical location during video sessions in case of medical crisis.
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-semibold text-[#173F3A]">Current Physical Address:</span>
              <input
                type="text"
                value={emergencyLocation}
                onChange={(e) => setEmergencyLocation(e.target.value)}
                className="px-2 py-0.5 border border-[#A9C2B2] rounded text-xs bg-white w-72"
              />
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-[#173F3A] cursor-pointer">
          <input
            type="checkbox"
            checked={locationConfirmed}
            onChange={(e) => setLocationConfirmed(e.target.checked)}
            className="rounded border-[#A9C2B2] text-[#216761] focus:ring-[#216761]"
          />
          <span>I verify this is my current physical location</span>
        </label>
      </div>

      {/* Pre-Call Setup Stage */}
      {callState === 'pre_call_check' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl text-[#173F3A]">
              Secure Telehealth Consultation
            </h2>
            <p className="text-xs text-[#66736F]">
              Provider: <strong>{providerName}</strong> • {serviceName}
            </p>
          </div>

          {/* Video Preview Box */}
          <div className="relative aspect-video bg-[#173F3A] rounded-xl overflow-hidden flex items-center justify-center border-2 border-[#216761]/20">
            {cameraEnabled ? (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#173F3A] to-[#216761] flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-serif text-2xl font-bold">
                  {currentUser?.firstName?.[0] || 'C'}{currentUser?.lastName?.[0] || ''}
                </div>
                <p className="text-xs font-medium mt-3">Camera Active (Preview)</p>
                <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  HD 1080p • 30fps
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-[#A9C2B2] gap-2">
                <VideoOff className="w-12 h-12" />
                <span className="text-xs">Camera is disabled</span>
              </div>
            )}

            {/* Mic Meter Preview */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md flex items-center gap-2 text-white text-[11px]">
              {micEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
              <span>Mic: {micEnabled ? 'Working' : 'Muted'}</span>
              {micEnabled && (
                <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${audioLevel}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Audio/Video Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className={`p-3 rounded-full transition-all ${
                cameraEnabled ? 'bg-[#F8F5EE] text-[#173F3A] hover:bg-[#EFEAE0]' : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
              title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={`p-3 rounded-full transition-all ${
                micEnabled ? 'bg-[#F8F5EE] text-[#173F3A] hover:bg-[#EFEAE0]' : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
              title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Session Recording Informed Consent Check */}
          <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#173F3A]">Session Audio Recording Consent</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                recordingConsentGiven ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {recordingConsentGiven ? 'Consent Granted' : 'Opted Out / Unrecorded'}
              </span>
            </div>
            <p className="text-[#66736F] leading-relaxed">
              Recording allows AI transcription assistance to create high-accuracy care reports. All recordings are encrypted client-side and sealed. You may revoke or refuse consent without penalty.
            </p>
            <label className="flex items-center gap-2 font-semibold text-[#173F3A] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={recordingConsentGiven}
                onChange={(e) => setRecordingConsentGiven(e.target.checked)}
                className="rounded text-[#216761] focus:ring-[#216761]"
              />
              <span>I consent to secure session audio recording for clinical documentation</span>
            </label>
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoinCall}
            className="w-full py-3.5 rounded-xl bg-[#216761] text-white font-bold text-sm hover:bg-[#173F3A] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4 text-[#C6A66B]" />
            Join Secure Telehealth Room
          </button>
        </div>
      )}

      {/* Waiting Room Stage */}
      {callState === 'waiting_room' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 sm:p-12 shadow-xs max-w-xl mx-auto text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#216761]/10 text-[#216761] flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-2xl text-[#173F3A]">
              Waiting for Dr. Sarah Jenkins
            </h3>
            <p className="text-xs text-[#66736F]">
              Your provider will admit you into the private consultation room momentarily.
            </p>
          </div>
          <div className="p-3 bg-[#F8F5EE] rounded-lg text-xs text-[#173F3A] max-w-md mx-auto">
            <span className="font-semibold">Protected Health Information (PHI) Notice:</span> This video session is end-to-end encrypted and HIPAA-compliant.
          </div>
          <button
            onClick={() => setCallState('pre_call_check')}
            className="text-xs text-[#66736F] hover:underline"
          >
            Cancel and return to check
          </button>
        </div>
      )}

      {/* Active Video Session Stage */}
      {callState === 'in_session' && (
        <div className="bg-[#173F3A] rounded-2xl overflow-hidden shadow-xl text-white space-y-0">
          {/* Header Bar */}
          <div className="px-6 py-3 bg-black/40 backdrop-blur-xs flex items-center justify-between border-b border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wide">CONFIDENTIAL CLINICAL SESSION</span>
              <span className="text-white/60 font-mono">[{formatTime(sessionSeconds)}]</span>
            </div>

            <div className="flex items-center gap-3">
              {recordingConsentGiven ? (
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  REC • Consented
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-white/10 text-white/70 text-[11px]">
                  Unrecorded
                </span>
              )}
              <span className="text-white/60 font-mono">Room: HCS-V-84920</span>
            </div>
          </div>

          {/* Video Grid */}
          <div className="relative aspect-video max-h-[560px] w-full bg-[#112825] grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
            {/* Provider Remote Stream */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1b433e] to-[#0c2522] border border-white/10 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#216761] border-2 border-[#C6A66B] flex items-center justify-center font-serif text-3xl font-bold text-white shadow-lg">
                SJ
              </div>
              <div className="mt-3 text-center">
                <p className="font-serif font-bold text-sm text-white">Dr. Sarah Jenkins, LPC</p>
                <p className="text-[11px] text-[#A9C2B2]">Hope Community Support — Lead Clinician</p>
              </div>

              {/* Provider Audio Indicator */}
              <div className="absolute top-3 right-3 bg-black/40 px-2 py-1 rounded text-[10px] text-emerald-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                <span>Connected</span>
              </div>

              <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-[11px] font-medium text-white">
                Dr. Sarah Jenkins (Provider)
              </div>
            </div>

            {/* Client Local Stream */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#173F3A] to-[#122e2b] border border-white/10 flex flex-col items-center justify-center">
              {cameraEnabled ? (
                <div className="w-20 h-20 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-serif text-2xl font-bold text-white">
                  {currentUser?.firstName?.[0] || 'C'}
                </div>
              ) : (
                <div className="text-white/60 text-xs flex flex-col items-center gap-1">
                  <VideoOff className="w-8 h-8" />
                  <span>Camera Muted</span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-[11px] font-medium text-white">
                {currentUser?.firstName} {currentUser?.lastName} (You)
              </div>
              <div className="absolute bottom-3 right-3 bg-black/50 px-2 py-1 rounded text-[10px] text-white/80">
                {micEnabled ? 'Mic Active' : 'Mic Muted'}
              </div>
            </div>

            {/* Optional Live Captions Overlay */}
            {captionsEnabled && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs text-white max-w-xl text-center border border-white/20">
                <span className="text-[#C6A66B] font-semibold">Dr. Sarah Jenkins: </span>
                "Welcome Eleanor, thank you for joining on time. How has your week felt since we last spoke?"
              </div>
            )}
          </div>

          {/* Bottom Call Controls */}
          <div className="px-6 py-4 bg-black/60 backdrop-blur-md flex items-center justify-between border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  captionsEnabled ? 'bg-[#C6A66B] text-[#173F3A]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Captions className="w-4 h-4" />
                <span>Captions</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-3 rounded-full transition-all ${
                  cameraEnabled ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-rose-500 text-white'
                }`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-3 rounded-full transition-all ${
                  micEnabled ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-rose-500 text-white'
                }`}
                title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={handleLeaveCall}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Session</span>
              </button>
            </div>

            <div className="text-right text-[11px] text-white/70">
              <p>HIPAA Tier 4 Protected</p>
              <p className="text-[10px] text-white/50">SC Dept of LLR Regulated</p>
            </div>
          </div>
        </div>
      )}

      {/* Session Concluded State */}
      {callState === 'ended' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-8 sm:p-10 shadow-xs max-w-lg mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-[#173F3A]">
            Session Completed
          </h3>
          <p className="text-xs text-[#66736F] leading-relaxed">
            Your telehealth consultation with Dr. Sarah Jenkins has concluded.
            Session duration: <strong>{formatTime(sessionSeconds)}</strong>.
            Your formal clinical report and personalized wellness program updates will appear in your portal once approved.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setCallState('pre_call_check')}
              className="px-4 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
            >
              Return to Session Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
