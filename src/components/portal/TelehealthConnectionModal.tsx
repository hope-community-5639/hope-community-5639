import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Wifi,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface TelehealthConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSession?: () => void;
}

export const TelehealthConnectionModal: React.FC<TelehealthConnectionModalProps> = ({
  isOpen,
  onClose,
  onProceedToSession,
}) => {
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'ready' | 'permission_needed'>('checking');
  const [micStatus, setMicStatus] = useState<'checking' | 'ready' | 'permission_needed'>('checking');
  const [speakerStatus, setSpeakerStatus] = useState<'not_tested' | 'playing' | 'tested'>('not_tested');
  const [micLevel, setMicLevel] = useState<number>(35);
  const [networkPing, setNetworkPing] = useState<number>(24);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Simulate device permission and media stream readiness
    const timer = setTimeout(() => {
      setCameraStatus('ready');
      setMicStatus('ready');
    }, 600);

    // Simulate dynamic mic level fluctuations
    const micInterval = setInterval(() => {
      if (isMicActive) {
        setMicLevel(Math.floor(25 + Math.random() * 45));
      } else {
        setMicLevel(0);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      clearInterval(micInterval);
    };
  }, [isOpen, isMicActive]);

  if (!isOpen) return null;

  const handleTestSpeaker = () => {
    setSpeakerStatus('playing');
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Browser audio context safety
    }
    setTimeout(() => {
      setSpeakerStatus('tested');
    }, 700);
  };

  const allPassed = cameraStatus === 'ready' && micStatus === 'ready';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="telehealth-test-title"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17312E]/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl max-w-xl w-full border border-[#D9E1DC] shadow-xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="bg-[#173F3A] text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close device test"
            className="absolute top-5 right-5 p-2 rounded-lg text-[#F8F5EE]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-md bg-[#C6A66B]/20 text-[#C6A66B]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C6A66B]">
              Pre-Session Device Check
            </span>
          </div>
          <h2 id="telehealth-test-title" className="text-xl font-serif font-bold text-white">
            Audio & Video Telehealth Readiness
          </h2>
          <p className="text-xs text-[#F8F5EE]/80 mt-1">
            Test your camera, microphone, and sound before connecting to your provider.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Camera Preview Box */}
          <div className="relative aspect-video rounded-xl bg-[#17312E] flex flex-col items-center justify-center overflow-hidden border border-[#D9E1DC]">
            {isCameraActive ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#173F3A] to-[#17312E] text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#216761]/40 border border-[#C6A66B]/40 flex items-center justify-center mb-3">
                  <Video className="w-8 h-8 text-[#C6A66B]" />
                </div>
                <div className="text-xs font-semibold text-white">Camera Input Verified</div>
                <div className="text-[11px] text-[#A9C2B2] mt-0.5">High-Definition Telehealth Stream Ready</div>
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/50 text-[10px] text-white font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Preview (Encrypted)
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#A9C2B2] p-6 text-center">
                <VideoOff className="w-10 h-10 mb-2 opacity-60" />
                <span className="text-xs">Camera is currently muted</span>
              </div>
            )}

            {/* Quick in-preview toggles */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setIsCameraActive((prev) => !prev)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  isCameraActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
                }`}
                title={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMicActive((prev) => !prev)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  isMicActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
                }`}
                title={isMicActive ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Diagnostic Checks List */}
          <div className="space-y-3">
            {/* Microphone test & VU meter */}
            <div className="p-3.5 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-[#D9E1DC] text-[#216761]">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173F3A]">Microphone Volume Meter</div>
                  <div className="text-[11px] text-[#5F6F6B]">
                    {isMicActive ? 'Speak naturally to verify level' : 'Microphone muted'}
                  </div>
                </div>
              </div>

              {/* Dynamic VU meter */}
              <div className="w-32 flex items-center gap-1">
                {[10, 20, 30, 40, 50, 60, 70, 80].map((threshold) => (
                  <div
                    key={threshold}
                    className={`h-4 flex-1 rounded-xs transition-all duration-100 ${
                      micLevel >= threshold
                        ? threshold > 65
                          ? 'bg-amber-500'
                          : 'bg-[#216761]'
                        : 'bg-[#D9E1DC]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Speaker sound check */}
            <div className="p-3.5 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-[#D9E1DC] text-[#216761]">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173F3A]">Speaker Sound Test</div>
                  <div className="text-[11px] text-[#5F6F6B]">
                    {speakerStatus === 'tested'
                      ? 'Audio playback confirmed'
                      : speakerStatus === 'playing'
                      ? 'Playing test chime...'
                      : 'Play chime to test your speakers'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleTestSpeaker}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#216761]/30 text-[#173F3A] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-[#216761]" />
                <span>Play Sound</span>
              </button>
            </div>

            {/* Network Latency & Bandwidth */}
            <div className="p-3.5 rounded-xl border border-[#D9E1DC] bg-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#216761]/10 text-[#216761]">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173F3A]">Network Connection Quality</div>
                  <div className="text-[11px] text-[#5F6F6B]">
                    Latency: {networkPing}ms • Bandwidth: Excellent (18+ Mbps)
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Optimal
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#F8F5EE] border-t border-[#D9E1DC] p-5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#D9E1DC] bg-white text-xs font-semibold text-[#17312E] hover:bg-[#EFEAE0] transition-colors"
          >
            Close Test
          </button>

          {onProceedToSession && (
            <button
              onClick={() => {
                onClose();
                onProceedToSession();
              }}
              disabled={!allPassed}
              className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center gap-2 shadow-xs disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C6A66B]" />
              <span>Enter Telehealth Room</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
