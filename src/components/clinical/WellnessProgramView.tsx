import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WellnessProgram, ProgressCheckIn } from '../../types/clinical';
import { clinicalStore } from '../../db/clinicalStore';
import {
  Heart,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  Smile,
  Zap,
  Shield,
  Plus,
  ArrowRight,
  Wind,
  Award,
} from 'lucide-react';

interface Props {
  programId?: string;
}

export const WellnessProgramView: React.FC<Props> = ({ programId = 'wp-vance-001' }) => {
  const { currentUser } = useAuth();
  const programs = clinicalStore.getWellnessPrograms(currentUser);
  const [program, setProgram] = useState<WellnessProgram | undefined>(
    programs.find((p) => p.id === programId) || programs[0]
  );
  const [checkIns, setCheckIns] = useState<ProgressCheckIn[]>(
    program ? clinicalStore.getCheckIns(program.id) : []
  );

  // Breathing pacer state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [breathCountdown, setBreathCountdown] = useState(4);

  // Check-In Form State
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [moodRating, setMoodRating] = useState(4);
  const [energyRating, setEnergyRating] = useState(3);
  const [stressRating, setStressRating] = useState(2);
  const [activitiesCount, setActivitiesCount] = useState(3);
  const [barriers, setBarriers] = useState('');
  const [clientComment, setClientComment] = useState('');

  // Update check-ins when program updates
  useEffect(() => {
    if (program) {
      setCheckIns(clinicalStore.getCheckIns(program.id));
    }
  }, [program]);

  // Breathing exercise timer
  useEffect(() => {
    let timer: any;
    if (isBreathing) {
      timer = setInterval(() => {
        setBreathCountdown((prev) => {
          if (prev <= 1) {
            if (breathPhase.startsWith('Inhale')) {
              setBreathPhase('Hold (7s)');
              return 7;
            } else if (breathPhase.startsWith('Hold')) {
              setBreathPhase('Exhale (8s)');
              return 8;
            } else {
              setBreathPhase('Inhale (4s)');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathing, breathPhase]);

  if (!program) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <p className="text-gray-600">No active wellness program found for this profile.</p>
      </div>
    );
  }

  const handleToggleActivity = (actId: string) => {
    const updatedActivities = program.plannedActivities.map((act) =>
      act.id === actId ? { ...act, completedThisWeek: !act.completedThisWeek } : act
    );
    const updated = { ...program, plannedActivities: updatedActivities, updatedAt: new Date().toISOString() };
    clinicalStore.saveWellnessProgram(updated);
    setProgram(updated);
  };

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const newCheckIn: ProgressCheckIn = {
      id: `chk-${crypto.randomUUID()}`,
      programId: program.id,
      clientId: program.clientId,
      date: new Date().toISOString().split('T')[0],
      moodRating,
      energyRating,
      stressRating,
      activitiesCompletedCount: activitiesCount,
      barriersEncountered: barriers,
      clientComments: clientComment,
      recordedBy: currentUser?.role === 'client' ? 'client' : 'provider',
      createdAt: new Date().toISOString(),
    };

    clinicalStore.addCheckIn(newCheckIn);
    setCheckIns(clinicalStore.getCheckIns(program.id));
    setShowCheckInForm(false);
    setBarriers('');
    setClientComment('');
    alert('Weekly progress check-in submitted successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#E3DCC9] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-xl font-bold font-serif text-[#202826]">
              Personalized Wellness Program: {program.clientName}
            </h1>
            <span className="bg-[#216761]/10 text-[#216761] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {program.programReference}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Supervised by <strong>{program.providerName}</strong> • Derived from Clinical Assessment Report
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowCheckInForm(true)}
            className="flex items-center space-x-1 px-4 py-2 text-xs font-bold bg-[#216761] text-white rounded-lg hover:bg-[#184e49] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Weekly Progress Check-In</span>
          </button>
        </div>
      </div>

      {/* Grid: Goals & Breathing Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SMART Goals & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Focus Areas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center">
              <Target className="w-4 h-4 text-[#216761] mr-2" />
              Priority Behavioral Focus Areas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {program.priorityAreas.map((area, idx) => (
                <div key={idx} className="p-3 bg-[#F8F5EE] border border-[#E3DCC9] rounded-lg text-xs font-semibold text-[#202826]">
                  {area}
                </div>
              ))}
            </div>
          </div>

          {/* SMART Goals with Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center">
              <Activity className="w-4 h-4 text-[#216761] mr-2" />
              Collaborative SMART Goals & Target Milestones
            </h2>

            <div className="space-y-4">
              {program.goals.map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-lg space-y-2 bg-gray-50/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{goal.goal}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <strong>Target:</strong> {goal.target}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#216761] bg-[#216761]/10 px-2.5 py-0.5 rounded-full">
                      {goal.progressPercentage}% Met
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#216761] h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Baseline: {goal.baseline}</span>
                    <span>Frequency: {goal.frequency}</span>
                    <span>Review: {goal.reviewDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planned Routine Activities (Interactive Check-Off) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-[#216761] mr-2" />
              Planned Weekly Activities & Routine Anchors
            </h2>

            <div className="space-y-2.5">
              {program.plannedActivities.map((act) => (
                <label
                  key={act.id}
                  onClick={() => handleToggleActivity(act.id)}
                  className={`flex items-start space-x-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    act.completedThisWeek
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={act.completedThisWeek}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-[#216761] focus:ring-[#216761]"
                  />
                  <div className="text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${act.completedThisWeek ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {act.title}
                      </span>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {act.frequency}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{act.instructions}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Diaphragmatic Breathwork Pacer & Progress History */}
        <div className="space-y-6">
          {/* Interactive 4-7-8 Breathing Pacer */}
          <div className="bg-[#216761] text-white rounded-xl p-6 shadow-sm text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Wind className="w-5 h-5 text-emerald-300" />
              <h3 className="font-serif font-bold text-base">Diaphragmatic Breathwork</h3>
            </div>
            <p className="text-xs text-white/80 mb-6">
              Clinical 4-7-8 Somatic Vagus Nerve Pacer for rapid panic de-escalation.
            </p>

            {/* Breathing Animated Orb */}
            <div className="relative flex items-center justify-center h-44 mb-6">
              <div
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 border-white/30 transition-all duration-1000 ${
                  isBreathing
                    ? breathPhase.startsWith('Inhale')
                      ? 'scale-125 bg-emerald-500/50'
                      : breathPhase.startsWith('Hold')
                      ? 'scale-125 bg-amber-500/50'
                      : 'scale-90 bg-teal-600/50'
                    : 'bg-white/10'
                }`}
              >
                <span className="text-2xl font-bold font-mono">{isBreathing ? breathCountdown : '4-7-8'}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                  {isBreathing ? breathPhase : 'Ready'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBreathing(!isBreathing)}
              className="px-6 py-2 rounded-full text-xs font-bold bg-white text-[#216761] hover:bg-[#F8F5EE] shadow-sm transition-all"
            >
              {isBreathing ? 'Pause Breathing Cycle' : 'Start 4-7-8 Session'}
            </button>
          </div>

          {/* Past Weekly Check-Ins */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Weekly Progress Check-In History
            </h3>

            {checkIns.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No check-ins recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {checkIns.map((chk) => (
                  <div key={chk.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-800">
                      <span>Check-In: {chk.date}</span>
                      <span className="text-emerald-700">Mood: {chk.moodRating}/5</span>
                    </div>
                    <div className="flex space-x-3 text-[11px] text-gray-600">
                      <span>Energy: {chk.energyRating}/5</span>
                      <span>Stress: {chk.stressRating}/5</span>
                      <span>Activities: {chk.activitiesCompletedCount} completed</span>
                    </div>
                    {chk.clientComments && (
                      <p className="text-gray-700 italic pt-1">"{chk.clientComments}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Check-In Modal Form */}
      {showCheckInForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-serif">Submit Weekly Progress Check-In</h3>
            <p className="text-xs text-gray-600">
              Your self-reported ratings and observations help Dr. Jenkins adjust your care plan.
            </p>

            <form onSubmit={handleSubmitCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Overall Mood (1: Low — 5: Great): {moodRating}/5</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={moodRating}
                  onChange={(e) => setMoodRating(parseInt(e.target.value, 10))}
                  className="w-full accent-[#216761]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Energy Level (1: Exhausted — 5: High): {energyRating}/5</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={energyRating}
                  onChange={(e) => setEnergyRating(parseInt(e.target.value, 10))}
                  className="w-full accent-[#216761]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Stress Level (1: Calm — 5: Overwhelmed): {stressRating}/5</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={stressRating}
                  onChange={(e) => setStressRating(parseInt(e.target.value, 10))}
                  className="w-full accent-[#216761]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Activities Completed This Week (Count)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={activitiesCount}
                  onChange={(e) => setActivitiesCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Barriers or Obstacles Encountered</label>
                <textarea
                  value={barriers}
                  onChange={(e) => setBarriers(e.target.value)}
                  placeholder="e.g., Demanding overtime work, evening interruptions..."
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Client Comments or Notes</label>
                <textarea
                  value={clientComment}
                  onChange={(e) => setClientComment(e.target.value)}
                  placeholder="Any reflections or questions for your next session..."
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckInForm(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold text-white bg-[#216761] hover:bg-[#184e49]"
                >
                  Submit Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
