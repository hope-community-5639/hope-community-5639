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
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { EmergencyBanner } from '../common/EmergencyBanner';

export const StaffPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'intakes' | 'requests' | 'care_plans' | 'messages'>('schedule');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [intakes, setIntakes] = useState<IntakeSubmission[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [replyText, setReplyText] = useState('');

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
