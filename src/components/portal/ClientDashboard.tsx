import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../db/store';
import { clinicalStore } from '../../db/clinicalStore';
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
  fetchClientAppointments,
  fetchClientServiceRequests,
  fetchUserNotifications,
  fetchClientDocuments,
  saveFirebaseServiceRequest,
  updateFirebaseAppointmentStatus,
  uploadClientDocumentFile,
} from '../../lib/firebaseService';

// Layout & Modals
import { ClientPortalLayout } from './ClientPortalLayout';
import { CrisisSupportModal } from './CrisisSupportModal';
import { TelehealthConnectionModal } from './TelehealthConnectionModal';
import { AppointmentBookingModal } from '../scheduling/AppointmentBookingModal';
import { ClientOnboardingWizard } from '../clinical/ClientOnboardingWizard';

// Subviews
import { ClientOverviewView } from './views/ClientOverviewView';
import { CareTeamView } from './views/CareTeamView';
import { CarePlanView } from './views/CarePlanView';
import { AppointmentsView } from './views/AppointmentsView';
import { RequiredFormsView } from './views/RequiredFormsView';
import { DocumentsView } from './views/DocumentsView';
import { BillingView } from './views/BillingView';
import { SecureMessagingView } from './views/SecureMessagingView';
import { SupportView } from './views/SupportView';
import { AccountView } from './views/AccountView';
import { AccessibilitySettingsView } from './views/AccessibilitySettingsView';

// Existing clinical subviews
import { WellnessProgramView } from '../clinical/WellnessProgramView';
import { ClientVideoSessionView } from './ClientVideoSessionView';
import { ClientReportsView } from './ClientReportsView';
import { ClientConsentsView } from './ClientConsentsView';
import { ClientProgressCheckInsView } from './ClientProgressCheckInsView';
import { ClientPrivacyRequestsView } from './ClientPrivacyRequestsView';
import { ClientEmergencyHelpView } from './ClientEmergencyHelpView';

interface ClientDashboardProps {
  onOpenBooking: () => void;
  onNavigateHome?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onOpenBooking,
  onNavigateHome,
}) => {
  const { currentUser, logout } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modal States
  const [showCrisisModal, setShowCrisisModal] = useState<boolean>(false);
  const [showConnectionModal, setShowConnectionModal] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);

  // Data Store States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [intakes, setIntakes] = useState<IntakeSubmission[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [clientInvoices, setClientInvoices] = useState(() => clinicalStore.getInvoices(currentUser));

  // Async Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load Data
  const loadData = () => {
    if (!currentUser) return;
    try {
      setAppointments(dbStore.getAppointments(currentUser) || []);
      setIntakes(dbStore.getIntakes(currentUser) || []);
      setServiceRequests(dbStore.getServiceRequests(currentUser) || []);
      const convs = dbStore.getConversations(currentUser) || [];
      setConversations(convs);
      if (convs && convs.length > 0) {
        setSelectedConversationId((prev) => {
          if (prev && convs.some((c) => c && c.id === prev)) return prev;
          return convs[0].id;
        });
      }
      setDocuments(dbStore.getDocuments(currentUser) || []);
      setCarePlans(dbStore.getCarePlans(currentUser) || []);
      setNotifications(dbStore.getNotifications(currentUser.id) || []);
      setClientInvoices(clinicalStore.getInvoices(currentUser) || []);
    } catch (err) {
      console.warn('Error loading dashboard local data:', err);
    }

    // Direct Firestore Sync for isolated records
    fetchClientAppointments(currentUser.id).then((fsApts) => {
      if (fsApts && Array.isArray(fsApts) && fsApts.length > 0) {
        setAppointments((prev) => {
          const map = new Map<string, Appointment>();
          (prev || []).forEach((a) => a && map.set(a.id, a));
          fsApts.forEach((a) => a && map.set(a.id, a));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});

    fetchClientServiceRequests(currentUser.id).then((fsReqs) => {
      if (fsReqs && Array.isArray(fsReqs) && fsReqs.length > 0) {
        setServiceRequests((prev) => {
          const map = new Map<string, ServiceRequest>();
          (prev || []).forEach((r) => r && map.set(r.id, r));
          fsReqs.forEach((r) => r && map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});

    fetchClientDocuments(currentUser.id).then((fsDocs) => {
      if (fsDocs && Array.isArray(fsDocs) && fsDocs.length > 0) {
        setDocuments((prev) => {
          const map = new Map<string, ClientDocument>();
          (prev || []).forEach((d) => d && map.set(d.id, d));
          fsDocs.forEach((d) => d && map.set(d.id, d));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});

    fetchUserNotifications(currentUser.id).then((fsNotes) => {
      if (fsNotes && Array.isArray(fsNotes) && fsNotes.length > 0) {
        setNotifications((prev) => {
          const map = new Map<string, NotificationItem>();
          (prev || []).forEach((n) => n && map.set(n.id, n));
          fsNotes.forEach((n) => n && map.set(n.id, n));
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

  // Load Messages for selected thread
  useEffect(() => {
    if (selectedConversationId && currentUser) {
      try {
        const msgs = dbStore.getMessages(selectedConversationId, currentUser) || [];
        setMessages(msgs);
        dbStore.markMessagesAsRead(selectedConversationId, currentUser);
      } catch (err) {
        console.warn('Error fetching messages:', err);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, currentUser]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !selectedConversationId || !currentUser) return;
    dbStore.sendMessage(selectedConversationId, text, currentUser);
    loadData();
  };

  const handleCancelAppointment = (apt: Appointment, reason: string) => {
    if (!currentUser) return;
    dbStore.updateAppointmentStatus(apt.id, 'client_canceled', reason, currentUser);
    updateFirebaseAppointmentStatus(apt.id, 'client_canceled', reason).catch(() => {});
    loadData();
  };

  const handleUploadDocument = async (
    title: string,
    category: ClientDocument['category'],
    file: File | null
  ) => {
    if (!currentUser) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      if (file) {
        const uploadedDoc = await uploadClientDocumentFile(
          currentUser.id,
          file,
          category,
          title,
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
            title,
            fileName: `${title.replace(/\s+/g, '_')}.pdf`,
            fileSize: '184 KB',
            fileType: 'application/pdf',
            category,
            isSharedWithClient: true,
            scanStatus: 'passed',
            isQuarantined: false,
          },
          currentUser
        );
      }
      loadData();
    } catch (err: any) {
      setUploadError(err?.message || 'Upload rejected. Please verify file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearNotifications = () => {
    if (!currentUser) return;
    dbStore.clearAllNotifications(currentUser.id);
    setNotifications([]);
  };

  const nextAppointment = (appointments || [])
    .filter((a) => a && !['client_canceled', 'staff_canceled', 'completed'].includes(a.status))
    .sort((a, b) => ((a.date || '') > (b.date || '') ? 1 : -1))[0];

  const clientIntake = (intakes || [])[0];
  const activeCarePlan = (carePlans || [])[0];

  const unreadMessagesCount = conversations.reduce((sum, c) => sum + (c.unreadCountClient || 0), 0);

  return (
    <ClientPortalLayout
      activeTab={activeTab}
      onNavigate={setActiveTab}
      currentUser={currentUser}
      unreadMessagesCount={unreadMessagesCount}
      notifications={notifications}
      onClearNotifications={handleClearNotifications}
      onOpenCrisisModal={() => setShowCrisisModal(true)}
      onOpenConnectionTest={() => setShowConnectionModal(true)}
      onSignOut={() => {
        logout();
        if (onNavigateHome) onNavigateHome();
      }}
      onExitToPublic={onNavigateHome}
    >
      {/* Tab: OVERVIEW */}
      {activeTab === 'overview' && (
        <ClientOverviewView
          currentUser={currentUser}
          nextAppointment={nextAppointment}
          intake={clientIntake}
          carePlan={activeCarePlan}
          documents={documents}
          invoices={clientInvoices}
          unreadMessagesCount={unreadMessagesCount}
          onNavigateTab={setActiveTab}
          onRequestBooking={onOpenBooking}
          onOpenConnectionTest={() => setShowConnectionModal(true)}
          onJoinTelehealth={(apt) => setActiveTab('video_session')}
        />
      )}

      {/* Tab: CARE TEAM */}
      {activeTab === 'care_team' && (
        <CareTeamView
          onMessageMember={() => setActiveTab('messages')}
          onRequestAppointment={onOpenBooking}
        />
      )}

      {/* Tab: CARE PLAN */}
      {activeTab === 'care_plan' && (
        <CarePlanView
          carePlan={activeCarePlan}
          onOpenBooking={onOpenBooking}
          onRequestAmendment={() => setActiveTab('consents')}
        />
      )}

      {/* Tab: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <AppointmentsView
          appointments={appointments}
          onRequestBooking={onOpenBooking}
          onJoinTelehealth={(apt) => setActiveTab('video_session')}
          onOpenConnectionTest={() => setShowConnectionModal(true)}
          onCancelAppointment={handleCancelAppointment}
          onRescheduleRequest={() => onOpenBooking()}
        />
      )}

      {/* Tab: REQUIRED FORMS */}
      {activeTab === 'forms' && (
        <RequiredFormsView
          intake={clientIntake}
          onOpenWizard={() => setShowWizardModal(true)}
        />
      )}

      {/* Tab: DOCUMENTS */}
      {activeTab === 'documents' && (
        <DocumentsView
          documents={documents}
          onUploadDocument={handleUploadDocument}
          isUploading={isUploading}
          uploadError={uploadError}
        />
      )}

      {/* Tab: BILLING */}
      {activeTab === 'billing' && (
        <BillingView
          invoices={clientInvoices}
          onMakePayment={(invId) => {
            // Re-fetch or mark paid locally
            setClientInvoices((prev) =>
              prev.map((i) => (i.id === invId ? { ...i, status: 'paid', paidAt: '2026-09-14' } : i))
            );
          }}
        />
      )}

      {/* Tab: SECURE MESSAGES */}
      {activeTab === 'messages' && (
        <SecureMessagingView
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
          onOpenCrisisModal={() => setShowCrisisModal(true)}
        />
      )}

      {/* Tab: WELLNESS PROGRAM */}
      {activeTab === 'wellness' && (
        <WellnessProgramView />
      )}

      {/* Tab: PROGRESS CHECK-INS */}
      {activeTab === 'checkins' && (
        <ClientProgressCheckInsView />
      )}

      {/* Tab: CLINICAL REPORTS */}
      {activeTab === 'reports' && (
        <ClientReportsView />
      )}

      {/* Tab: CONSENT & PRIVACY */}
      {activeTab === 'consents' && (
        <ClientConsentsView />
      )}

      {/* Tab: HIPAA PRIVACY REQUESTS */}
      {activeTab === 'privacy' && (
        <ClientPrivacyRequestsView />
      )}

      {/* Tab: 24/7 CRISIS RESOURCES */}
      {activeTab === 'emergency_help' && (
        <ClientEmergencyHelpView />
      )}

      {/* Tab: TELEHEALTH ROOM */}
      {activeTab === 'video_session' && (
        <ClientVideoSessionView />
      )}

      {/* Tab: CLIENT SUPPORT & TICKETING */}
      {activeTab === 'support' && (
        <SupportView
          onOpenCrisisModal={() => setShowCrisisModal(true)}
          onOpenAccessibility={() => setActiveTab('accessibility')}
        />
      )}

      {/* Tab: ACCOUNT & SECURITY */}
      {activeTab === 'account' && (
        <AccountView
          currentUser={currentUser}
          onSignOut={() => {
            logout();
            if (onNavigateHome) onNavigateHome();
          }}
        />
      )}

      {/* Tab: ACCESSIBILITY PREFERENCES */}
      {activeTab === 'accessibility' && (
        <AccessibilitySettingsView onBackToOverview={() => setActiveTab('overview')} />
      )}

      {/* Tab: ONBOARDING WIZARD */}
      {activeTab === 'onboarding' && (
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-xs">
          <ClientOnboardingWizard
            onCancel={() => setActiveTab('overview')}
            onComplete={() => {
              loadData();
              setActiveTab('overview');
            }}
          />
        </div>
      )}

      {/* Global Portal Modals */}
      <CrisisSupportModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      <TelehealthConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />

      {showWizardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17312E]/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl p-6 shadow-2xl my-8">
            <ClientOnboardingWizard
              onCancel={() => setShowWizardModal(false)}
              onComplete={() => {
                setShowWizardModal(false);
                loadData();
              }}
            />
          </div>
        </div>
      )}
    </ClientPortalLayout>
  );
};
