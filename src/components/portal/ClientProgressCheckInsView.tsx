import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clinicalStore } from '../../db/clinicalStore';
import { ProgressCheckIn } from '../../types/clinical';
import {
  TrendingUp,
  Smile,
  Zap,
  Activity,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRight,
  Shield,
  MessageSquare,
} from 'lucide-react';

export const ClientProgressCheckInsView: React.FC = () => {
  const { currentUser } = useAuth();
  const programs = clinicalStore.getWellnessPrograms(currentUser);
  const activeProgram = programs[0];
  const programId = activeProgram?.id || 'wp-vance-001';

  const [checkIns, setCheckIns] = useState<ProgressCheckIn[]>(() =>
    clinicalStore.getCheckIns(programId)
  );

  const [showNewCheckInModal, setShowNewCheckInModal] = useState(false);
  const [moodRating, setMoodRating] = useState<number>(4);
  const [energyRating, setEnergyRating] = useState<number>(3);
  const [stressRating, setStressRating] = useState<number>(2);
  const [activitiesCount, setActivitiesCount] = useState<number>(3);
  const [barriers, setBarriers] = useState('');
  const [comments, setComments] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const refreshCheckIns = () => {
    setCheckIns(clinicalStore.getCheckIns(programId));
  };

  useEffect(() => {
    refreshCheckIns();
    const unsub = clinicalStore.subscribe(refreshCheckIns);
    return () => unsub();
  }, [programId]);

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newCheckIn: ProgressCheckIn = {
      id: `chk-${Date.now()}`,
      programId,
      clientId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      moodRating,
      energyRating,
      stressRating,
      activitiesCompletedCount: activitiesCount,
      barriersEncountered: barriers || undefined,
      clientComments: comments || undefined,
      recordedBy: 'client',
      createdAt: new Date().toISOString(),
    };

    clinicalStore.addCheckIn(newCheckIn);
    setShowNewCheckInModal(false);
    setBarriers('');
    setComments('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#216761]/10 text-[#216761]">
              Weekly Accountability
            </span>
            <span className="text-xs text-[#66736F]">Reviewed by Dr. Sarah Jenkins</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#173F3A]">
            My Weekly Progress Check-ins
          </h2>
          <p className="text-xs text-[#66736F] mt-1 max-w-2xl">
            Taking 2 minutes each week to note your mood, energy, and goal adherence helps your clinician tailor upcoming sessions to what matters most.
          </p>
        </div>

        <button
          onClick={() => setShowNewCheckInModal(true)}
          className="px-5 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C6A66B]" />
          Log This Week's Check-in
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your progress check-in was recorded and shared with your provider.</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66736F]">
            <span>Average Mood Rating</span>
            <Smile className="w-4 h-4 text-[#216761]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#173F3A] mt-2">
            {checkIns.length > 0
              ? (checkIns.reduce((acc, c) => acc + c.moodRating, 0) / checkIns.length).toFixed(1)
              : '4.0'}{' '}
            <span className="text-xs font-sans text-[#66736F]">/ 5.0</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Positive Trend</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66736F]">
            <span>Average Stress Level</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#173F3A] mt-2">
            {checkIns.length > 0
              ? (checkIns.reduce((acc, c) => acc + c.stressRating, 0) / checkIns.length).toFixed(1)
              : '2.0'}{' '}
            <span className="text-xs font-sans text-[#66736F]">/ 5.0</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Low-to-Moderate (Improving)</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66736F]">
            <span>Check-in Submissions</span>
            <TrendingUp className="w-4 h-4 text-[#216761]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#173F3A] mt-2">
            {checkIns.length} Logged
          </div>
          <span className="text-[11px] text-[#216761] font-semibold">Consistent Engagement</span>
        </div>
      </div>

      {/* Check-ins History List */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#173F3A]">
          Check-in History ({checkIns.length})
        </h3>

        {checkIns.length === 0 ? (
          <p className="text-xs text-[#66736F]">No check-ins recorded yet. Click above to log your first entry!</p>
        ) : (
          <div className="divide-y divide-[#F1ECE1]">
            {checkIns.map((ci) => (
              <div key={ci.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#216761]" />
                    <span className="font-serif font-bold text-sm text-[#173F3A]">
                      {ci.date}
                    </span>
                    <span className="text-[10px] bg-[#216761]/10 text-[#216761] px-2 py-0.5 rounded-full font-semibold">
                      Client Portal Entry
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span>
                      Mood: <strong>{ci.moodRating}/5</strong>
                    </span>
                    <span>
                      Energy: <strong>{ci.energyRating}/5</strong>
                    </span>
                    <span>
                      Stress: <strong>{ci.stressRating}/5</strong>
                    </span>
                    <span>
                      Activities Completed: <strong>{ci.activitiesCompletedCount}</strong>
                    </span>
                  </div>
                </div>

                {ci.clientComments && (
                  <p className="text-xs text-[#202826] bg-[#F8F5EE] p-3 rounded-lg border border-[#A9C2B2]/30">
                    <span className="font-semibold text-[#173F3A]">Your Notes: </span>
                    {ci.clientComments}
                  </p>
                )}

                {ci.barriersEncountered && (
                  <p className="text-xs text-[#66736F] italic">
                    <span className="font-semibold text-amber-700">Obstacle noted: </span>
                    {ci.barriersEncountered}
                  </p>
                )}

                {ci.providerNotes && (
                  <div className="p-3 bg-[#FAF7F0] border border-[#C6A66B]/60 rounded-lg text-xs text-[#173F3A] flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-[#C6A66B] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Provider Feedback (Dr. Sarah Jenkins):</span>
                      <span>{ci.providerNotes}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Check-in Modal */}
      {showNewCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#F1ECE1] pb-3">
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Weekly Progress Check-in
              </h3>
              <p className="text-xs text-[#66736F] mt-1">
                Reflect on your past week and log how you are feeling.
              </p>
            </div>

            <form onSubmit={handleSubmitCheckIn} className="space-y-4 text-xs">
              {/* Mood Scale */}
              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  How would you rate your overall mood this week? ({moodRating} / 5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={moodRating}
                    onChange={(e) => setMoodRating(Number(e.target.value))}
                    className="flex-1 accent-[#216761]"
                  />
                  <span className="font-bold text-[#216761] w-12 text-right">
                    {moodRating === 5 ? 'Excellent' : moodRating === 4 ? 'Good' : moodRating === 3 ? 'Neutral' : moodRating === 2 ? 'Low' : 'Challenging'}
                  </span>
                </div>
              </div>

              {/* Energy Scale */}
              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  How was your energy and sleep recovery? ({energyRating} / 5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyRating}
                    onChange={(e) => setEnergyRating(Number(e.target.value))}
                    className="flex-1 accent-[#216761]"
                  />
                  <span className="font-bold text-[#216761] w-12 text-right">
                    {energyRating === 5 ? 'High' : energyRating >= 3 ? 'Moderate' : 'Fatigued'}
                  </span>
                </div>
              </div>

              {/* Stress Scale */}
              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  How intense was your stress or anxiety? ({stressRating} / 5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={stressRating}
                    onChange={(e) => setStressRating(Number(e.target.value))}
                    className="flex-1 accent-amber-600"
                  />
                  <span className="font-bold text-amber-700 w-12 text-right">
                    {stressRating === 1 ? 'Very Low' : stressRating === 2 ? 'Manageable' : stressRating === 3 ? 'Moderate' : stressRating === 4 ? 'High' : 'Severe'}
                  </span>
                </div>
              </div>

              {/* Activities Count */}
              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  How many planned wellness routines did you practice?
                </label>
                <select
                  value={activitiesCount}
                  onChange={(e) => setActivitiesCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                >
                  <option value={0}>0 routines</option>
                  <option value={1}>1 routine</option>
                  <option value={2}>2 routines</option>
                  <option value={3}>3 routines (Target met)</option>
                  <option value={4}>4+ routines</option>
                </select>
              </div>

              {/* Barriers */}
              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  Did you run into any barriers or setbacks? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={barriers}
                  onChange={(e) => setBarriers(e.target.value)}
                  placeholder="e.g., Work deadline interfered with 18:30 laptop shutdown..."
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                />
              </div>

              {/* Client reflections */}
              <div>
                <label className="font-bold text-[#173F3A] block mb-1">
                  What would you like Dr. Sarah Jenkins to know before our next session?
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share any breakthroughs, questions, or topics you want to prioritize..."
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F1ECE1]">
                <button
                  type="button"
                  onClick={() => setShowNewCheckInModal(false)}
                  className="px-4 py-2 rounded-lg text-[#66736F] hover:bg-[#F8F5EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#216761] text-white font-bold hover:bg-[#173F3A] shadow-xs"
                >
                  Submit Weekly Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
