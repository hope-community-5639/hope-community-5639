import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../db/store';
import {
  Appointment,
  IntakeSubmission,
  ServiceRequest,
  CarePlan,
  Conversation,
  SecureMessage,
  User,
  ReferralItem,
  WaitlistEntry,
} from '../../types';
import {
  Calendar,
  Clock,
  Video,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Users,
  Search,
  Filter,
  Send,
  Plus,
  Shield,
  Building,
  Building2,
  ClipboardList,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { EmergencyBanner } from '../common/EmergencyBanner';

export const StaffPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'intakes' | 'requests' | 'care_plans' | 'messages' | 'referrals' | 'waitlist'>('schedule');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [intakes, setIntakes] = useState<IntakeSubmission[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<ReferralItem | null>(null);
  const [referralNotes, setReferralNotes] = useState('');

  // Selected intake modal
  const [selectedIntake, setSelectedIntake] = useState<IntakeSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Selected service request
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [reqResponseNotes, setReqResponseNotes] = useState('');

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    if (!currentUser) return;
    setAppointments(dbStore.getAppointments(currentUser));
    setIntakes(dbStore.getIntakes(currentUser));
    setServiceRequests(dbStore.getServiceRequests(currentUser));
    setCarePlans(dbStore.getCarePlans(currentUser));
    try {
      setReferrals(dbStore.getReferrals(currentUser));
    } catch {
      setReferrals([]);
    }
    setWaitlist(dbStore.getWaitlist(currentUser));
    const convs = dbStore.getConversations(currentUser);
    setConversations(convs);
    if (convs.length > 0 && !selectedConvId) {
      setSelectedConvId(convs[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dbStore.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (selectedConvId && currentUser) {
      setMessages(dbStore.getMessages(selectedConvId, currentUser));
      dbStore.markMessagesAsRead(selectedConvId, currentUser);
    }
  }, [selectedConvId, currentUser]);

  const handleUpdateAptStatus = (id: string, status: any) => {
    if (!currentUser) return;
    dbStore.updateAppointmentStatus(id, status, `Updated by ${currentUser.firstName} ${currentUser.lastName}`, currentUser);
    loadData();
  };

  const handleApproveIntake = (status: 'approved' | 'additional_info_needed') => {
    if (!selectedIntake || !currentUser) return;
    dbStore.reviewIntake(selectedIntake.id, status, reviewNotes || 'Approved by clinical staff.', currentUser);
    setSelectedIntake(null);
    setReviewNotes('');
    loadData();
  };

  const handleUpdateServiceRequest = (status: any) => {
    if (!selectedRequest || !currentUser) return;
    dbStore.updateServiceRequestStatus(selectedRequest.id, status, reqResponseNotes || 'Reviewed by care coordination.', currentUser);
    setSelectedRequest(null);
    setReqResponseNotes('');
    loadData();
  };

  const handleSendStaffMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId || !currentUser) return;
    dbStore.sendMessage(selectedConvId, replyText, currentUser);
    setReplyText('');
    loadData();
  };

  const handleUpdateReferralStatus = (id: string, status: ReferralItem['status'], notes?: string) => {
    if (!currentUser) return;
    dbStore.updateReferralStatus(id, status, notes, currentUser);
    setSelectedReferral(null);
    setReferralNotes('');
    loadData();
  };

  const handleUpdateWaitlistStatus = (id: string, status: WaitlistEntry['status']) => {
    if (!currentUser) return;
    dbStore.updateWaitlistStatus(id, status, currentUser);
    loadData();
  };

  const pendingIntakesCount = intakes.filter((i) => i.status === 'pending_review').length;
  const pendingRequestsCount = serviceRequests.filter((r) => ['submitted', 'in_review'].includes(r.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <EmergencyBanner compact />

      {/* Staff Header */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#173F3A] text-[#C6A66B]">
              Clinical Provider & Staff Portal
            </span>
            <span className="text-xs text-[#216761] font-mono">Role: {currentUser?.role.replace('_', ' ').toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
            Provider Dashboard: {currentUser?.firstName} {currentUser?.lastName}
          </h1>
          <p className="text-xs text-[#66736F] mt-1">
            Hope Community Support • HIPAA Secure Practice Management
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="p-3 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/40 text-center">
            <span className="block font-serif font-bold text-lg text-[#173F3A]">
              {appointments.filter((a) => a.status === 'confirmed' || a.status === 'requested').length}
            </span>
            <span className="text-[10px] text-[#66736F]">Active Appts</span>
          </div>
          <div className="p-3 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/40 text-center">
            <span className="block font-serif font-bold text-lg text-amber-700">
              {pendingIntakesCount}
            </span>
            <span className="text-[10px] text-[#66736F]">Pending Intakes</span>
          </div>
          <div className="p-3 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/40 text-center">
            <span className="block font-serif font-bold text-lg text-sky-700">
              {pendingRequestsCount}
            </span>
            <span className="text-[10px] text-[#66736F]">Requests</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#A9C2B2]/40 flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { id: 'schedule', label: `Clinical Schedule (${appointments.length})` },
          { id: 'intakes', label: `Intake Queue (${pendingIntakesCount} pending)` },
          { id: 'referrals', label: `Partner Referrals (${referrals.length})` },
          { id: 'waitlist', label: `Service Waitlist (${waitlist.length})` },
          { id: 'requests', label: `Service Requests (${pendingRequestsCount} new)` },
          { id: 'care_plans', label: `Care Plans (${carePlans.length})` },
          { id: 'messages', label: `Client Messages (${conversations.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'bg-white text-[#216761] border-[#216761] font-bold shadow-xs'
                : 'text-[#66736F] border-transparent hover:text-[#173F3A] hover:bg-[#F8F5EE]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: CLINICAL SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Upcoming Sessions & Schedule
              </h3>
              <p className="text-xs text-[#66736F]">
                Confirm, launch telehealth rooms, or update session statuses.
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client or service..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-[#F1ECE1]">
            {appointments
              .filter((a) =>
                a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((apt) => (
                <div key={apt.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="font-serif font-bold text-base text-[#173F3A]">
                        {apt.clientName}
                      </strong>
                      <span className="text-xs text-[#66736F]">• {apt.serviceName}</span>
                      <StatusBadge status={apt.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#66736F]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#216761]" />
                        {apt.date} at {apt.timeSlot} ({apt.durationMinutes} min)
                      </span>
                      <span className="capitalize font-medium">Format: {apt.deliveryMethod}</span>
                      <span>Contact: {apt.clientPhone || apt.clientEmail}</span>
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-[#66736F] italic">Client Note: "{apt.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {apt.deliveryMethod === 'telehealth' && apt.telehealthLink && (
                      <a
                        href={apt.telehealthLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-semibold hover:bg-[#173F3A] flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5 text-[#C6A66B]" />
                        Launch Room
                      </a>
                    )}
                    {apt.status === 'requested' && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt.id, 'confirmed')}
                        className="px-3 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-semibold hover:bg-[#173F3A]"
                      >
                        Confirm Slot
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt.id, 'completed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                      >
                        Mark Completed
                      </button>
                    )}
                    {!['client_canceled', 'staff_canceled', 'completed'].includes(apt.status) && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt.id, 'staff_canceled')}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-medium hover:bg-rose-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 2: INTAKE QUEUE */}
      {activeTab === 'intakes' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1ECE1] pb-4">
            <h3 className="font-serif font-bold text-xl text-[#173F3A]">
              Client Intake & Consent Review Queue
            </h3>
            <p className="text-xs text-[#66736F]">
              Review clinical questionnaires, verify insurance/Medicaid data, and countersign consents.
            </p>
          </div>

          <div className="divide-y divide-[#F1ECE1]">
            {intakes.map((intake) => (
              <div key={intake.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="font-serif font-bold text-base text-[#173F3A]">
                      {intake.clientName}
                    </strong>
                    <StatusBadge status={intake.status} />
                  </div>
                  <div className="text-xs text-[#66736F] space-y-0.5">
                    <p>Submitted: {intake.submittedAt.split('T')[0]} • Electronic Signature: <em>{intake.signature}</em></p>
                    <p>Primary Concern: "{intake.data.primaryConcern}"</p>
                    <p>Insurance: {intake.data.insuranceProvider} ({intake.data.insurancePolicyNumber})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedIntake(intake);
                      setReviewNotes(intake.staffReviewerNotes || '');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                  >
                    Review & Countersign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: SERVICE REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1ECE1] pb-4">
            <h3 className="font-serif font-bold text-xl text-[#173F3A]">
              Service & Community Assistance Requests
            </h3>
            <p className="text-xs text-[#66736F]">
              Triage requests for in-home care, crisis stabilization, and school liaison support.
            </p>
          </div>

          <div className="space-y-4">
            {serviceRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-xl border border-[#A9C2B2]/40 bg-[#F8F5EE]/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="font-serif font-bold text-base text-[#173F3A]">
                      {req.clientName} — {req.serviceType}
                    </strong>
                    <StatusBadge status={req.status} />
                  </div>
                  <span className="text-xs text-[#66736F] font-mono">
                    {req.createdAt.split('T')[0]}
                  </span>
                </div>

                <p className="text-xs text-[#202826] leading-relaxed">
                  {req.description}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-[#A9C2B2]/30">
                  <span className="text-[11px] text-[#66736F]">
                    Urgency: <strong className="capitalize text-[#173F3A]">{req.urgency}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setReqResponseNotes(req.responseNotes || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                  >
                    Respond & Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: CARE PLANS */}
      {activeTab === 'care_plans' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1ECE1] pb-4">
            <h3 className="font-serif font-bold text-xl text-[#173F3A]">
              Clinical Care Plans & Goals
            </h3>
            <p className="text-xs text-[#66736F]">
              Individualized treatment roadmaps and quarterly goal evaluation.
            </p>
          </div>

          <div className="space-y-6">
            {carePlans.map((plan) => (
              <div key={plan.id} className="p-6 rounded-xl border border-[#A9C2B2]/40 bg-[#F8F5EE]/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1ECE1] pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[#173F3A]">
                      {plan.clientName}
                    </h4>
                    <span className="text-xs text-[#66736F]">
                      Target Focus: <strong>{plan.targetProblem}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#216761]">
                    Next Review: {plan.nextReviewDate}
                  </span>
                </div>

                <div className="space-y-3">
                  {plan.goals.map((g, gIdx) => (
                    <div key={g.id} className="p-3 bg-white rounded-lg border border-[#A9C2B2]/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-[#173F3A]">Goal {gIdx + 1}: {g.title}</strong>
                        <span className="capitalize font-semibold text-[#216761]">{g.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-[#66736F] mb-2">{g.description}</p>
                      <div className="space-y-1">
                        {g.milestones.map((m, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-2 text-[11px] text-[#202826]">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${m.completed ? 'bg-[#216761] text-white' : 'border border-gray-400'}`}>
                              {m.completed ? '✓' : ''}
                            </span>
                            <span className={m.completed ? 'line-through text-gray-400' : ''}>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          <div className="border-r border-[#F1ECE1] p-4 bg-[#F8F5EE]/50">
            <span className="text-xs font-bold text-[#173F3A] block mb-3 uppercase tracking-wider">
              Assigned Client Threads
            </span>
            <div className="space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedConvId === c.id
                      ? 'bg-white border-[#216761] shadow-xs'
                      : 'border-transparent hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs text-[#173F3A]">{c.clientName}</strong>
                    <span className="text-[10px] text-[#66736F]">{c.lastMessageAt.split('T')[0]}</span>
                  </div>
                  <p className="text-[11px] text-[#66736F] truncate">{c.lastMessage}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col justify-between h-full bg-white">
            <div className="p-4 border-b border-[#F1ECE1] flex items-center justify-between bg-[#F8F5EE]/30">
              <h4 className="font-serif font-bold text-sm text-[#173F3A]">
                Secure Clinical Message Thread
              </h4>
              <span className="text-[11px] text-[#216761] font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                HIPAA Encrypted
              </span>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
              {messages.map((m) => {
                const isMine = m.senderId === currentUser?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-[#216761] text-white rounded-br-none'
                          : 'bg-[#F8F5EE] text-[#173F3A] rounded-bl-none border border-[#A9C2B2]/30'
                      }`}
                    >
                      <span className="block text-[10px] opacity-75 font-semibold mb-1">
                        {m.senderName} ({m.senderRole.replace('_', ' ')})
                      </span>
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[10px] text-[#66736F] mt-1 font-mono">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendStaffMessage} className="p-4 border-t border-[#F1ECE1] flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type response to client..."
                className="flex-1 px-3 py-2 text-xs bg-[#F8F5EE]/60 rounded-lg border border-[#A9C2B2]/50 focus:outline-none focus:ring-2 focus:ring-[#216761]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: PARTNER REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#173F3A]">
                Healthcare & Organization Referrals ({referrals.length})
              </h2>
              <p className="text-xs text-[#66736F]">
                Inbound referrals submitted by primary care physicians, pediatricians, schools, DSS, and justice partners.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736F]" />
                <input
                  type="text"
                  placeholder="Search client or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F5EE] border border-[#A9C2B2]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-12 bg-[#F8F5EE]/50 rounded-xl border border-dashed border-[#A9C2B2]/60">
              <Building2 className="w-10 h-10 mx-auto text-[#A9C2B2] mb-3" />
              <h3 className="font-serif font-bold text-[#173F3A] text-sm">No referrals in queue</h3>
              <p className="text-xs text-[#66736F] max-w-sm mx-auto mt-1">
                New submissions from the public referral portal will appear here immediately for intake review and scheduling.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#A9C2B2]/30 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-[#173F3A] border-b border-[#A9C2B2]/40">
                  <tr>
                    <th className="p-3 font-semibold">Client Name</th>
                    <th className="p-3 font-semibold">Referring Organization</th>
                    <th className="p-3 font-semibold">Service Requested</th>
                    <th className="p-3 font-semibold">Urgency</th>
                    <th className="p-3 font-semibold">Date Received</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A9C2B2]/20">
                  {referrals
                    .filter(
                      (r) =>
                        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.referringOrg.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8F5EE]/40 transition-colors">
                        <td className="p-3 font-medium text-[#173F3A]">
                          <div>{item.clientName}</div>
                          <div className="text-[11px] text-[#66736F]">DOB: {item.clientDob || 'N/A'} • {item.clientPhone}</div>
                        </td>
                        <td className="p-3 text-[#202826]">
                          <div>{item.referringOrg}</div>
                          <div className="text-[11px] text-[#66736F]">{item.referringContact} • {item.referringPhone}</div>
                        </td>
                        <td className="p-3 text-[#202826] font-medium">{item.serviceRequested}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              item.urgency === 'immediate'
                                ? 'bg-rose-100 text-rose-800'
                                : item.urgency === 'urgent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#216761]/10 text-[#216761]'
                            }`}
                          >
                            {item.urgency}
                          </span>
                        </td>
                        <td className="p-3 text-[#66736F] whitespace-nowrap">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReferral(item);
                              setReferralNotes(item.intakeNotes || '');
                            }}
                            className="px-3 py-1 bg-[#216761] text-white text-xs font-semibold rounded hover:bg-[#173F3A]"
                          >
                            Review & Triage
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: SERVICE WAITLIST */}
      {activeTab === 'waitlist' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#173F3A]">
                Service Waitlist ({waitlist.filter((w) => w.status === 'waiting').length} waiting)
              </h2>
              <p className="text-xs text-[#66736F]">
                Clients waiting for specialized provider match or schedule availability.
              </p>
            </div>
          </div>

          {waitlist.length === 0 ? (
            <div className="text-center py-12 bg-[#F8F5EE]/50 rounded-xl border border-dashed border-[#A9C2B2]/60">
              <ClipboardList className="w-10 h-10 mx-auto text-[#A9C2B2] mb-3" />
              <h3 className="font-serif font-bold text-[#173F3A] text-sm">No clients on waitlist</h3>
              <p className="text-xs text-[#66736F] max-w-sm mx-auto mt-1">
                When specific therapy or intervention slots are at capacity, clients can be queued here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#A9C2B2]/30 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-[#173F3A] border-b border-[#A9C2B2]/40">
                  <tr>
                    <th className="p-3 font-semibold">Client Name</th>
                    <th className="p-3 font-semibold">Contact Info</th>
                    <th className="p-3 font-semibold">Desired Service</th>
                    <th className="p-3 font-semibold">Preferred Delivery</th>
                    <th className="p-3 font-semibold">Date Added</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A9C2B2]/20">
                  {waitlist.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8F5EE]/40 transition-colors">
                      <td className="p-3 font-medium text-[#173F3A]">{item.clientName}</td>
                      <td className="p-3 text-[#202826]">
                        <div>{item.clientEmail}</div>
                        <div className="text-[11px] text-[#66736F]">{item.clientPhone}</div>
                      </td>
                      <td className="p-3 text-[#202826] font-medium">{item.serviceDesired}</td>
                      <td className="p-3 text-[#66736F] capitalize">{item.preferredDelivery}</td>
                      <td className="p-3 text-[#66736F] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'scheduled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'contacted'
                              ? 'bg-sky-100 text-sky-800'
                              : item.status === 'waiting'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateWaitlistStatus(item.id, 'slot_offered')}
                              className="px-2.5 py-1 bg-sky-700 text-white rounded text-[11px] font-medium hover:bg-sky-800"
                            >
                              Offer Slot
                            </button>
                          )}
                          {(item.status === 'waiting' || item.status === 'slot_offered') && (
                            <button
                              type="button"
                              onClick={() => handleUpdateWaitlistStatus(item.id, 'scheduled')}
                              className="px-2.5 py-1 bg-[#216761] text-white rounded text-[11px] font-bold hover:bg-[#173F3A]"
                            >
                              Mark Scheduled
                            </button>
                          )}
                          {item.status !== 'removed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateWaitlistStatus(item.id, 'removed')}
                              className="px-2 py-1 text-[#66736F] hover:text-rose-700 text-[11px]"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Partner Referral Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-lg text-[#173F3A] border-b border-[#F1ECE1] pb-2">
              Partner Referral: {selectedReferral.clientName}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8F5EE] p-4 rounded-lg">
              <div>
                <p className="font-semibold text-[#173F3A] mb-1">Client Information</p>
                <p><strong>Name:</strong> {selectedReferral.clientName}</p>
                <p><strong>DOB:</strong> {selectedReferral.clientDob || 'Not provided'}</p>
                <p><strong>Phone:</strong> {selectedReferral.clientPhone}</p>
                <p><strong>Email:</strong> {selectedReferral.clientEmail}</p>
                <p><strong>Insurance:</strong> {selectedReferral.insuranceInfo || 'None / Self-pay'}</p>
              </div>
              <div>
                <p className="font-semibold text-[#173F3A] mb-1">Referring Source</p>
                <p><strong>Organization:</strong> {selectedReferral.referringOrg}</p>
                <p><strong>Contact Person:</strong> {selectedReferral.referringContact}</p>
                <p><strong>Phone:</strong> {selectedReferral.referringPhone}</p>
                <p><strong>Email:</strong> {selectedReferral.referringEmail}</p>
                <p><strong>Urgency:</strong> <span className="uppercase font-bold text-amber-800">{selectedReferral.urgency}</span></p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <p><strong>Reason for Referral / Clinical Presentation:</strong></p>
              <div className="bg-[#F8F5EE] p-3 rounded text-[#202826] border border-[#A9C2B2]/30">
                {selectedReferral.reasonForReferral}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Internal Intake & Care Coordination Notes
              </label>
              <textarea
                rows={3}
                value={referralNotes}
                onChange={(e) => setReferralNotes(e.target.value)}
                placeholder="Document contact attempts, assigned clinician, or scheduling status..."
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1ECE1]">
              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="text-xs text-[#66736F]"
              >
                Close
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateReferralStatus(selectedReferral.id, 'benefits_verification', referralNotes)}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 text-xs font-semibold hover:bg-amber-100"
                >
                  Verify Benefits
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateReferralStatus(selectedReferral.id, 'outreach_scheduled', referralNotes)}
                  className="px-3 py-1.5 rounded-lg border border-sky-300 text-sky-800 bg-sky-50 text-xs font-semibold hover:bg-sky-100"
                >
                  Schedule Outreach
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateReferralStatus(selectedReferral.id, 'declined', referralNotes)}
                  className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 bg-rose-50 text-xs font-semibold hover:bg-rose-100"
                >
                  Decline / Refer Out
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateReferralStatus(selectedReferral.id, 'accepted', referralNotes)}
                  className="px-4 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                >
                  Accept & Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Intake Modal */}
      {selectedIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-lg text-[#173F3A] border-b border-[#F1ECE1] pb-2">
              Clinical Review of Intake: {selectedIntake.clientName}
            </h3>

            <div className="space-y-3 text-xs text-[#202826] bg-[#F8F5EE] p-4 rounded-lg">
              <p><strong>DOB:</strong> {selectedIntake.data.dateOfBirth}</p>
              <p><strong>Emergency Contact:</strong> {selectedIntake.data.emergencyContactName} ({selectedIntake.data.emergencyContactPhone})</p>
              <p><strong>Insurance:</strong> {selectedIntake.data.insuranceProvider} - #{selectedIntake.data.insurancePolicyNumber}</p>
              <p><strong>PCP:</strong> {selectedIntake.data.primaryCarePhysician}</p>
              <p><strong>Primary Concern:</strong> {selectedIntake.data.primaryConcern}</p>
              <p><strong>History:</strong> {selectedIntake.data.previousTherapyHistory}</p>
              <p><strong>Medications:</strong> {selectedIntake.data.currentMedications}</p>
              <p><strong>Safety Screening:</strong> {selectedIntake.data.crisisSafetyHistory}</p>
              <p><strong>Electronic Signature:</strong> {selectedIntake.signature} (Executed: {selectedIntake.signedAt})</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Staff Reviewer Clinical Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document verification, clinical suitability, or additional items needed..."
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1ECE1]">
              <button
                type="button"
                onClick={() => setSelectedIntake(null)}
                className="text-xs text-[#66736F]"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApproveIntake('additional_info_needed')}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 bg-amber-50 text-xs font-semibold"
                >
                  Request More Info
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveIntake('approved')}
                  className="px-4 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                >
                  Approve & Countersign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Service Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#173F3A]">
              Update Service Request: {selectedRequest.serviceType}
            </h3>
            <p className="text-xs text-[#66736F]">
              Client: <strong>{selectedRequest.clientName}</strong>
            </p>
            <p className="text-xs bg-[#F8F5EE] p-3 rounded border border-[#A9C2B2]/30">
              "{selectedRequest.description}"
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Response Note to Client
              </label>
              <textarea
                rows={3}
                value={reqResponseNotes}
                onChange={(e) => setReqResponseNotes(e.target.value)}
                placeholder="Explain the scheduled evaluation, provider assignment, or next steps..."
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-xs text-[#66736F]"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateServiceRequest('scheduled')}
                  className="px-3 py-1.5 rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800"
                >
                  Mark Scheduled
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateServiceRequest('completed')}
                  className="px-3 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                >
                  Mark Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
