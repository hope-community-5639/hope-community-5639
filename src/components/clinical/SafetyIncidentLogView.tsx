import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clinicalStore } from '../../db/clinicalStore';
import { SafetyEvent } from '../../types/clinical';
import {
  AlertTriangle,
  Shield,
  CheckCircle2,
  Clock,
  Phone,
  AlertCircle,
  Search,
  Filter,
  User,
  Check,
  Building,
} from 'lucide-react';

export const SafetyIncidentLogView: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SafetyEvent | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | SafetyEvent['severity']>('all');

  const loadData = () => {
    setEvents(clinicalStore.getSafetyEvents());
  };

  useEffect(() => {
    loadData();
    const unsub = clinicalStore.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleUpdateStatus = (id: string, status: SafetyEvent['resolutionStatus']) => {
    clinicalStore.updateSafetyEvent(id, status, resolutionNotes);
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent({
        ...selectedEvent,
        resolutionStatus: status,
        resolutionNotes: resolutionNotes || selectedEvent.resolutionNotes,
        updatedAt: new Date().toISOString(),
      });
    }
    setResolutionNotes('');
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      (e.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
      e.reportedByUserName.toLowerCase().includes(search.toLowerCase()) ||
      e.immediateActionTaken.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Safety Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-[#173F3A] text-white p-6 rounded-2xl shadow-sm border border-red-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-red-300 font-semibold">
                Clinical Safety & Crisis Oversight
              </span>
              <span className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded-full border border-red-500/30 font-bold">
                Mandatory Safety Escalation Active
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-white mt-0.5">
              Client Risk, Safeguarding & Safety Incidents Log
            </h2>
            <p className="text-xs text-rose-100/90 mt-1 max-w-2xl">
              Real-time audit log of affirmative safety screenings, crisis disclosures, safeguarding events, and technical risk alerts. Immediate escalation protocols align with 988 Lifeline, Crisis Text Line (741741), and South Carolina Mobile Crisis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/10 text-xs">
          <div className="text-right">
            <span className="block text-[10px] text-rose-200 uppercase font-semibold">24/7 Crisis Lifeline</span>
            <span className="font-mono font-bold text-sm text-white">Call/Text 988</span>
          </div>
          <div className="h-6 w-px bg-white/20 mx-1" />
          <div className="text-right">
            <span className="block text-[10px] text-rose-200 uppercase font-semibold">Crisis Text Line</span>
            <span className="font-mono font-bold text-sm text-white">Text 741741</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#A9C2B2]/40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client or details..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/50 focus:outline-none w-64"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#66736F]" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-[#F8F5EE] border border-[#A9C2B2]/50 text-xs rounded-lg px-2 py-1.5 text-[#173F3A] focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical_immediate">Critical Immediate</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-[#66736F] font-semibold">
          Showing {filteredEvents.length} Incident Record{filteredEvents.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#A9C2B2]/40 text-xs text-[#66736F]">
              No safety events found matching criteria.
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const isCritical = evt.severity === 'critical_immediate';
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-600/30'
                      : 'border-[#A9C2B2]/30 bg-white hover:border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                        {evt.id}
                      </span>
                      <h4 className="text-sm font-bold text-[#173F3A]">
                        {evt.clientName || 'Unregistered / Intake Client'}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      isCritical ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {evt.severity.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-[#66736F] mt-1 line-clamp-2">
                    {evt.immediateActionTaken}
                  </p>

                  <div className="mt-2 text-[11px] text-[#66736F] flex items-center justify-between pt-2 border-t border-[#F1ECE1]">
                    <span>Status: <strong className="capitalize text-[#173F3A]">{evt.resolutionStatus.replace(/_/g, ' ')}</strong></span>
                    <span className="font-mono">{new Date(evt.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Incident Detail */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-6 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                      Safety Incident #{selectedEvent.id}
                    </h3>
                    <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full">
                      {selectedEvent.severity.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#66736F] mt-0.5">
                    Client: <strong>{selectedEvent.clientName || 'Intake Applicant'}</strong> • Reported By: {selectedEvent.reportedByUserName} ({selectedEvent.reportedByUserRole})
                  </p>
                </div>

                <span className="text-xs text-[#66736F] font-mono">
                  {new Date(selectedEvent.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Event Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-[#A9C2B2]/30 bg-[#F8F5EE]/50">
                  <span className="text-[11px] font-bold text-[#66736F] uppercase block">Incident Category</span>
                  <span className="text-sm font-semibold text-[#173F3A] capitalize">
                    {selectedEvent.type.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#A9C2B2]/30 bg-[#F8F5EE]/50">
                  <span className="text-[11px] font-bold text-[#66736F] uppercase block">Crisis Team Notified</span>
                  <span className="text-sm font-semibold text-[#173F3A]">
                    {selectedEvent.crisisTeamNotified ? 'Yes (Clinical Safety Team Alerted)' : 'No (Standard In-Session Protocol)'}
                  </span>
                </div>
              </div>

              {/* Immediate Action Taken */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#173F3A] mb-1.5">
                  Immediate Safety Mitigation Taken
                </h4>
                <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-950">
                  {selectedEvent.immediateActionTaken}
                </div>
              </div>

              {/* Resolution Notes */}
              {selectedEvent.resolutionNotes && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#173F3A] mb-1.5">
                    Supervisor Investigation & Resolution Notes
                  </h4>
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                    {selectedEvent.resolutionNotes}
                  </div>
                </div>
              )}

              {/* Action Resolution Form */}
              <div className="border-t border-[#F1ECE1] pt-4 space-y-3">
                <label className="block text-xs font-semibold text-[#173F3A]">
                  Safety Officer Resolution Notes
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document client safety check-in, safety plan status, emergency contact engagement, or clinical debriefing..."
                  className="w-full px-3 py-2 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-1 focus:ring-[#216761]"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEvent.id, 'resolved')}
                      className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      Mark Resolved & Mitigated
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEvent.id, 'mitigated')}
                      className="px-3 py-2 rounded-lg border border-amber-300 text-amber-900 bg-amber-50 text-xs font-semibold hover:bg-amber-100 transition-all"
                    >
                      Mark Mitigated (Follow-up Ongoing)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEvent.id, 'closed')}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 bg-gray-50 text-xs font-semibold hover:bg-gray-100 transition-all"
                  >
                    Close Incident Record
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-12 text-center text-[#66736F]">
              <Shield className="w-12 h-12 text-[#216761]/40 mx-auto mb-3" />
              <p className="font-serif font-bold text-base text-[#173F3A]">Select a Safety Event</p>
              <p className="text-xs text-[#66736F] mt-1">
                Choose an incident from the log to view details, crisis response actions, and record supervisory resolution notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
