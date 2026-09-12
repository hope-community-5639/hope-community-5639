import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../db/store';
import {
  Appointment,
  IntakeSubmission,
  ServiceRequest,
  Conversation,
  SecureMessage,
  ClientDocument,
  CarePlan,
  NotificationItem,
} from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Home,
  Building,
  FileText,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  Send,
  X,
  Shield,
  Phone,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { CalendarExport } from '../common/CalendarExport';
import { EmergencyBanner } from '../common/EmergencyBanner';
import { ClientIntakeForm } from './ClientIntakeForm';
import {
  fetchClientAppointments,
  fetchClientServiceRequests,
  fetchUserNotifications,
  fetchClientDocuments,
  saveFirebaseServiceRequest,
  updateFirebaseAppointmentStatus,
  uploadClientDocumentFile,
} from '../../lib/firebaseService';

interface ClientDashboardProps {
  onOpenBooking: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onOpenBooking }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'intake' | 'requests' | 'messages' | 'documents' | 'care_plan'>('overview');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [intakes, setIntakes] = useState<IntakeSubmission[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Cancellation modal state
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Service request modal state
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('In-Home Behavioral Consultation');
  const [requestUrgency, setRequestUrgency] = useState<'routine' | 'urgent_non_emergency' | 'flexible'>('routine');
  const [requestDescription, setRequestDescription] = useState('');

  // Document upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<ClientDocument['category']>('insurance_card');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const loadData = () => {
    if (!currentUser) return;
    setAppointments(dbStore.getAppointments(currentUser));
    setIntakes(dbStore.getIntakes(currentUser));
    setServiceRequests(dbStore.getServiceRequests(currentUser));
    const convs = dbStore.getConversations(currentUser);
    setConversations(convs);
    if (convs.length > 0 && !selectedConversationId) {
      setSelectedConversationId(convs[0].id);
    }
    setDocuments(dbStore.getDocuments(currentUser));
    setCarePlans(dbStore.getCarePlans(currentUser));
    setNotifications(dbStore.getNotifications(currentUser.id));

    // Also sync directly from Cloud Firestore for client-isolated records
    fetchClientAppointments(currentUser.id).then((fsApts) => {
      if (fsApts && fsApts.length > 0) {
        setAppointments((prev) => {
          const map = new Map<string, Appointment>();
          prev.forEach((a) => map.set(a.id, a));
          fsApts.forEach((a) => map.set(a.id, a));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});

    fetchClientServiceRequests(currentUser.id).then((fsReqs) => {
      if (fsReqs && fsReqs.length > 0) {
        setServiceRequests((prev) => {
          const map = new Map<string, ServiceRequest>();
          prev.forEach((r) => map.set(r.id, r));
          fsReqs.forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});

    fetchClientDocuments(currentUser.id).then((fsDocs) => {
      if (fsDocs && fsDocs.length > 0) {
        setDocuments((prev) => {
          const map = new Map<string, ClientDocument>();
          prev.forEach((d) => map.set(d.id, d));
          fsDocs.forEach((d) => map.set(d.id, d));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});

    fetchUserNotifications(currentUser.id).then((fsNotes) => {
      if (fsNotes && fsNotes.length > 0) {
        setNotifications((prev) => {
          const map = new Map<string, NotificationItem>();
          prev.forEach((n) => map.set(n.id, n));
          fsNotes.forEach((n) => map.set(n.id, n));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbStore.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (selectedConversationId && currentUser) {
      setMessages(dbStore.getMessages(selectedConversationId, currentUser));
      dbStore.markMessagesAsRead(selectedConversationId, currentUser);
    }
  }, [selectedConversationId, currentUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedConversationId || !currentUser) return;
    dbStore.sendMessage(selectedConversationId, newMessageText, currentUser);
    setNewMessageText('');
    loadData();
  };

  const handleCancelAppointment = () => {
    if (!cancelModalApt || !currentUser) return;
    dbStore.updateAppointmentStatus(cancelModalApt.id, 'client_canceled', cancelReason || 'Client canceled via portal', currentUser);
    updateFirebaseAppointmentStatus(cancelModalApt.id, 'client_canceled', cancelReason || 'Client canceled via portal').catch(() => {});
    setCancelModalApt(null);
    setCancelReason('');
    loadData();
  };

  const handleCreateServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const newReq = dbStore.createServiceRequest(
      {
        clientId: currentUser.id,
        clientName: `${currentUser.firstName} ${currentUser.lastName}`,
        serviceType: requestType,
        preferredDelivery: 'office',
        urgency: requestUrgency,
        details: requestDescription,
        preferredTimes: ['Morning', 'Afternoon'],
      },
      currentUser
    );
    saveFirebaseServiceRequest(newReq).catch(() => {});
    setShowNewRequestModal(false);
    setRequestDescription('');
    loadData();
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !uploadTitle) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      if (uploadFile) {
        const uploadedDoc = await uploadClientDocumentFile(
          currentUser.id,
          uploadFile,
          uploadCategory,
          uploadTitle,
          currentUser
        );
        dbStore.uploadDocument(uploadedDoc, currentUser);
      } else {
        dbStore.uploadDocument(
          {
            clientId: currentUser.id,
            uploaderId: currentUser.id,
            uploaderName: `${currentUser.firstName} ${currentUser.lastName}`,
            uploaderRole: currentUser.role,
            title: uploadTitle,
            fileName: `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
            fileSize: '184 KB',
            fileType: 'application/pdf',
            category: uploadCategory,
            isSharedWithClient: true,
            scanStatus: 'passed',
            isQuarantined: false,
          },
          currentUser
        );
      }

      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      setUploadError(null);
      loadData();
    } catch (uploadErr: any) {
      console.error('Document upload failure:', uploadErr);
      setUploadError(uploadErr?.message || 'Document upload failed. Please verify file format and size.');
    } finally {
      setIsUploading(false);
    }
  };

  const nextAppointment = appointments
    .filter((a) => !['client_canceled', 'staff_canceled', 'completed'].includes(a.status))
    .sort((a, b) => (a.date > b.date ? 1 : -1))[0];

  const clientIntake = intakes[0];
  const activeCarePlan = carePlans[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <EmergencyBanner compact />

      {/* Header Profile Banner */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#216761]/10 text-[#216761]">
              {currentUser?.role === 'parent_guardian' ? 'Parent / Legal Guardian Portal' : 'Client Wellness Portal'}
            </span>
            <span className="text-xs text-[#66736F] font-mono">ID: {currentUser?.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
            Welcome back, {currentUser?.firstName} {currentUser?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-[#66736F] mt-1">
            Care Coordinator: <strong>Dr. Sarah Jenkins (LPC)</strong> • Clinic: Downtown Rock Hill Suite 200
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBooking}
            className="px-4 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#C6A66B]" />
            Request Appointment
          </button>
          <button
            onClick={() => setActiveTab('intake')}
            className="px-4 py-2.5 rounded-lg bg-[#F8F5EE] border border-[#216761]/40 text-[#173F3A] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#216761]" />
            {clientIntake?.status === 'approved' ? 'View Intake Record' : 'Complete Intake'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#A9C2B2]/40 flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Dashboard Overview' },
          { id: 'appointments', label: `Appointments (${appointments.length})` },
          { id: 'intake', label: `Intake & Consents ${clientIntake?.status === 'approved' ? '✓' : '(!)'}` },
          { id: 'requests', label: `Service Requests (${serviceRequests.length})` },
          { id: 'messages', label: `Secure Messages (${messages.length})` },
          { id: 'documents', label: `Documents (${documents.length})` },
          { id: 'care_plan', label: 'My Care Plan' },
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

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Next Upcoming Appointment Highlight */}
          {nextAppointment ? (
            <div className="bg-[#173F3A] text-white rounded-2xl p-6 sm:p-8 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#216761] text-[#C6A66B] text-xs font-bold">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Next Scheduled Session</span>
                </div>
                <StatusBadge status={nextAppointment.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-serif font-bold text-2xl text-white">
                    {nextAppointment.serviceName}
                  </h3>
                  <p className="text-xs text-[#A9C2B2] mt-1">
                    Provider: <strong>{nextAppointment.providerName}</strong>
                  </p>
                  <p className="text-xs text-[#A9C2B2]">
                    Format: <span className="capitalize font-semibold text-white">{nextAppointment.deliveryMethod}</span> ({nextAppointment.durationMinutes} min)
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[#A9C2B2] block">Appointment Date & Time:</span>
                  <div className="text-lg font-serif font-bold text-[#C6A66B]">
                    {nextAppointment.date} at {nextAppointment.timeSlot}
                  </div>
                  {nextAppointment.deliveryMethod === 'office' && (
                    <span className="text-[11px] text-[#A9C2B2] block">
                      331 E Main Street Suite 200, Rock Hill, SC
                    </span>
                  )}
                  {nextAppointment.deliveryMethod === 'telehealth' && nextAppointment.telehealthLink && (
                    <a
                      href={nextAppointment.telehealthLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6A66B] text-[#173F3A] font-bold text-xs hover:bg-[#d8b87d]"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Telehealth Room
                    </a>
                  )}
                </div>

                <div className="flex flex-col justify-between items-start md:items-end gap-3">
                  <CalendarExport appointment={nextAppointment} />
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setCancelModalApt(nextAppointment)}
                      className="text-rose-300 hover:text-rose-100 hover:underline"
                    >
                      Cancel / Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#F8F5EE] border border-[#A9C2B2]/40 rounded-2xl p-6 text-center space-y-3">
              <CalendarIcon className="w-10 h-10 text-[#216761] mx-auto" />
              <h3 className="font-serif font-bold text-lg text-[#173F3A]">
                No Upcoming Appointments Scheduled
              </h3>
              <p className="text-xs text-[#66736F] max-w-md mx-auto">
                Maintain consistency in your care journey by requesting your next therapy or counseling session.
              </p>
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A]"
              >
                Schedule Session Now
              </button>
            </div>
          )}

          {/* 3 Quick Hub Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Intake & Consent Status */}
            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#173F3A]">Intake & Consent Paperwork</span>
                  <StatusBadge status={clientIntake?.status || 'pending_review'} />
                </div>
                <p className="text-xs text-[#66736F] leading-relaxed mb-4">
                  {clientIntake?.status === 'approved'
                    ? 'All clinical questionnaires and legal consent disclosures are fully executed and approved.'
                    : 'Please complete or verify your electronic intake paperwork prior to your next clinical evaluation.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('intake')}
                className="text-xs font-bold text-[#216761] hover:underline inline-flex items-center gap-1"
              >
                {clientIntake?.status === 'approved' ? 'Review Submission →' : 'Complete Form Now →'}
              </button>
            </div>

            {/* Card 2: Care Plan Tracker */}
            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#173F3A]">Individualized Care Plan</span>
                  <span className="text-xs font-semibold text-[#216761]">{activeCarePlan?.goals.length || 0} Goals</span>
                </div>
                <p className="text-xs text-[#66736F] leading-relaxed mb-4">
                  Focus: <strong>{activeCarePlan?.goals[0]?.title || 'Anxiety & Emotion Regulation'}</strong>. Reviewed quarterly by your licensed clinician.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('care_plan')}
                className="text-xs font-bold text-[#216761] hover:underline inline-flex items-center gap-1"
              >
                View Goals & Milestones →
              </button>
            </div>

            {/* Card 3: Secure Messaging */}
            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#173F3A]">Secure Provider Chat</span>
                  <span className="text-xs text-[#66736F] font-mono">Encrypted</span>
                </div>
                <p className="text-xs text-[#66736F] leading-relaxed mb-4">
                  Direct, confidential messaging with Dr. Sarah Jenkins and intake staff. Non-emergency replies within 24 hours.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className="text-xs font-bold text-[#216761] hover:underline inline-flex items-center gap-1"
              >
                Open Message Center →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Appointment History & Schedule
              </h3>
              <p className="text-xs text-[#66736F] mt-0.5">
                View, export to your digital calendar, or request rescheduling.
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C6A66B]" />
              New Appointment
            </button>
          </div>

          <div className="divide-y divide-[#F1ECE1]">
            {appointments.map((apt) => (
              <div key={apt.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#173F3A]">
                      {apt.serviceName}
                    </span>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#66736F]">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#216761]" />
                      {apt.date} at {apt.timeSlot}
                    </span>
                    <span className="capitalize flex items-center gap-1">
                      {apt.deliveryMethod === 'telehealth' ? <Video className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                      {apt.deliveryMethod} ({apt.durationMinutes} min)
                    </span>
                    <span>Provider: {apt.providerName}</span>
                  </div>
                  {apt.notes && (
                    <p className="text-xs text-[#66736F] italic">Notes: "{apt.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <CalendarExport appointment={apt} />
                  {!['client_canceled', 'staff_canceled', 'completed'].includes(apt.status) && (
                    <button
                      onClick={() => setCancelModalApt(apt)}
                      className="text-xs text-rose-700 hover:text-rose-900 font-semibold px-2 py-1 rounded hover:bg-rose-50"
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

      {/* Tab 3: INTAKE & CONSENT */}
      {activeTab === 'intake' && (
        <ClientIntakeForm
          existingIntake={clientIntake}
          onCompleted={() => {
            loadData();
            setActiveTab('overview');
          }}
        />
      )}

      {/* Tab 4: SERVICE REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Specialized Service & Community Requests
              </h3>
              <p className="text-xs text-[#66736F] mt-0.5">
                Submit requests for in-home care, school consultation, transportation assistance, or specialized therapy.
              </p>
            </div>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="px-4 py-2 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C6A66B]" />
              New Service Request
            </button>
          </div>

          <div className="space-y-4">
            {serviceRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-xl border border-[#A9C2B2]/40 bg-[#F8F5EE]/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#173F3A]">
                      {req.serviceType}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <span className="text-[11px] text-[#66736F] font-mono">
                    Submitted: {req.createdAt.split('T')[0]}
                  </span>
                </div>

                <p className="text-xs text-[#202826] leading-relaxed">
                  {req.description}
                </p>

                {req.responseNotes && (
                  <div className="p-3 bg-white rounded-lg border border-[#A9C2B2]/30 text-xs text-[#173F3A]">
                    <span className="font-bold block text-[11px] text-[#216761]">
                      Staff Reviewer Note ({req.assignedStaffName || 'Intake Department'}):
                    </span>
                    {req.responseNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: SECURE MESSAGING */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          {/* Conversation List */}
          <div className="border-r border-[#F1ECE1] p-4 bg-[#F8F5EE]/50">
            <span className="text-xs font-bold text-[#173F3A] block mb-3 uppercase tracking-wider">
              Care Team Conversations
            </span>
            <div className="space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConversationId(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedConversationId === c.id
                      ? 'bg-white border-[#216761] shadow-xs'
                      : 'border-transparent hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs text-[#173F3A]">{c.staffName}</strong>
                    <span className="text-[10px] text-[#66736F]">{c.lastMessageAt.split('T')[0]}</span>
                  </div>
                  <p className="text-[11px] text-[#66736F] truncate">{c.lastMessage}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Conversation Feed */}
          <div className="md:col-span-2 flex flex-col justify-between h-full bg-white">
            <div className="p-4 border-b border-[#F1ECE1] flex items-center justify-between bg-[#F8F5EE]/30">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#173F3A]">
                  Direct Clinical Messaging
                </h4>
                <p className="text-[11px] text-[#66736F]">
                  Encrypted • Non-emergency communications with your provider
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#216761] font-semibold">
                <Shield className="w-3.5 h-3.5" />
                HIPAA Secure
              </span>
            </div>

            {/* Messages body */}
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
                      {m.attachmentName && (
                        <div className="mt-2 pt-2 border-t border-white/20 text-[10px] flex items-center gap-1 font-mono">
                          <Download className="w-3 h-3" />
                          <span>{m.attachmentName} ({m.attachmentSize})</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#66736F] mt-1 font-mono">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#F1ECE1] flex items-center gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your secure message..."
                className="flex-1 px-3 py-2 text-xs bg-[#F8F5EE]/60 rounded-lg border border-[#A9C2B2]/50 focus:outline-none focus:ring-2 focus:ring-[#216761]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 6: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Client Documents & Medical Releases
              </h3>
              <p className="text-xs text-[#66736F] mt-0.5">
                Secure electronic records, signed consents, and uploaded insurance cards.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-[#216761] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4 text-[#C6A66B]" />
              Upload Document
            </button>
          </div>

          <div className="divide-y divide-[#F1ECE1]">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#216761]/10 text-[#216761] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#173F3A]">
                      {doc.title}
                    </h4>
                    <span className="text-xs text-[#66736F]">
                      {doc.fileName} • {doc.fileSize} • Uploaded {doc.uploadedAt.split('T')[0]} by {doc.uploaderName}
                    </span>
                  </div>
                </div>

                <a
                  href={`#download-${doc.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.alert(`Downloading securely: ${doc.fileName}`);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#A9C2B2]/60 text-xs font-semibold text-[#173F3A] hover:bg-[#F8F5EE] flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#216761]" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: CARE PLAN */}
      {activeTab === 'care_plan' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1ECE1] pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#216761]">
              Clinical Pathway
            </span>
            <h3 className="font-serif font-bold text-xl text-[#173F3A] mt-1">
              Individualized Care Plan & Goals
            </h3>
            <p className="text-xs text-[#66736F] mt-0.5">
              Target Problem: <strong>{activeCarePlan?.targetProblem || 'Depressive Symptoms & Behavioral Agitation'}</strong> • Last Updated: {activeCarePlan?.updatedAt.split('T')[0]}
            </p>
          </div>

          <div className="space-y-6">
            {activeCarePlan?.goals.map((goal, idx) => (
              <div key={goal.id} className="p-5 rounded-xl border border-[#A9C2B2]/40 bg-[#F8F5EE]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-[#173F3A]">
                    Goal {idx + 1}: {goal.title}
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#216761]/15 text-[#173F3A] capitalize">
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#66736F] leading-relaxed">
                  {goal.description}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#173F3A] block mb-2">Milestones:</span>
                  <div className="space-y-2">
                    {goal.milestones.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-2 text-xs text-[#202826]">
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#216761] shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-gray-400 shrink-0" />
                        )}
                        <span className={m.completed ? 'line-through text-gray-500' : ''}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#173F3A]">
              Cancel or Request Reschedule
            </h3>
            <p className="text-xs text-[#66736F]">
              Are you sure you wish to cancel your session on <strong>{cancelModalApt.date} at {cancelModalApt.timeSlot}</strong>?
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Schedule conflict, illness, etc."
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 text-xs font-medium text-[#66736F]"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="px-4 py-2 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Service Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1ECE1] pb-2">
              <h3 className="font-serif font-bold text-lg text-[#173F3A]">
                Submit a Special Service Request
              </h3>
              <button onClick={() => setShowNewRequestModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateServiceRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Service Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60"
                >
                  <option value="In-Home Behavioral Consultation">In-Home Behavioral Consultation</option>
                  <option value="School Behavioral Liaison Support">School Behavioral Liaison Support</option>
                  <option value="Transportation / Logistics Assistance">Transportation / Logistics Assistance</option>
                  <option value="Crisis Stabilization Check-in">Crisis Stabilization Check-in</option>
                  <option value="Specialized EMDR Trauma Evaluation">Specialized EMDR Trauma Evaluation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Urgency Level
                </label>
                <select
                  value={requestUrgency}
                  onChange={(e) => setRequestUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60"
                >
                  <option value="routine">Routine (Standard Scheduling)</option>
                  <option value="urgent_non_emergency">Urgent Non-Emergency (1-2 business days)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Details & Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  placeholder="Describe the context, specific needs, or timeframe..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 text-xs text-[#66736F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1ECE1] pb-2">
              <h3 className="font-serif font-bold text-lg text-[#173F3A]">
                Upload Client Record
              </h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <span className="font-bold">Upload Rejected: </span>
                {uploadError}
              </div>
            )}
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. SC Medicaid Card Copy"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#A9C2B2]/60"
                >
                  <option value="insurance_card">Insurance Card / Medicaid Verification</option>
                  <option value="medical_record">External Medical / Psychiatric History</option>
                  <option value="court_document">Court / DSS Legal Documentation</option>
                  <option value="other">Other Supportive Record</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                  Select File (PDF, PNG, JPG, DOCX — Max 10MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                  onChange={(e) => {
                    setUploadError(null);
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                      if (!uploadTitle) setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#216761] file:text-white hover:file:bg-[#173F3A]"
                />
                <p className="text-[10px] text-[#66736F] mt-1">
                  Automated MIME-type & malware scan enforced. Executables strictly rejected.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadError(null);
                  }}
                  className="px-4 py-2 text-xs text-[#66736F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] disabled:opacity-50"
                >
                  {isUploading ? 'Validating & Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
