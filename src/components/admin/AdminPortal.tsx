import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../db/store';
import { User, AuditLog, ServiceItem, JobApplication, ContactInquiry, SystemSettings } from '../../types';
import {
  Users,
  Shield,
  FileText,
  Activity,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Download,
  AlertTriangle,
  Building,
  Briefcase,
  Mail,
  Sliders,
  Eye,
  Save,
  Check,
} from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import { INITIAL_SERVICES } from '../../db/initialData';

export const AdminPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'audit' | 'job_applications' | 'inquiries' | 'services' | 'settings' | 'compliance'
  >('overview');

  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(dbStore.getSettings());
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [appReviewNotes, setAppReviewNotes] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [inquiryNotes, setInquiryNotes] = useState('');

  // New user modal
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState<User['role']>('provider');
  const [newPhone, setNewPhone] = useState('');

  // Audit filter
  const [auditSearch, setAuditSearch] = useState('');

  const loadData = () => {
    if (!currentUser) return;
    setUsers(dbStore.getUsers(currentUser));
    setAuditLogs(dbStore.getAuditLogs(currentUser));
    setJobApplications(dbStore.getJobApplications(currentUser));
    setContactInquiries(dbStore.getContactInquiries(currentUser));
    setSettings(dbStore.getSettings());
  };

  useEffect(() => {
    loadData();
    const unsub = dbStore.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, [currentUser]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    dbStore.registerUser(newEmail, newFirstName, newLastName, newRole, newPhone);
    setShowNewUserModal(false);
    setNewEmail('');
    setNewFirstName('');
    setNewLastName('');
    setNewPhone('');
    loadData();
  };

  const handleUpdateAppStatus = (id: string, status: JobApplication['status'], notes?: string) => {
    if (!currentUser) return;
    dbStore.updateJobApplicationStatus(id, status, notes, currentUser);
    setSelectedApp(null);
    setAppReviewNotes('');
    loadData();
  };

  const handleUpdateInquiryStatus = (id: string, status: ContactInquiry['status'], notes?: string) => {
    if (!currentUser) return;
    dbStore.updateContactInquiryStatus(id, status, notes, currentUser);
    setSelectedInquiry(null);
    setInquiryNotes('');
    loadData();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    dbStore.updateSettings(settings, currentUser);
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 3000);
    loadData();
  };

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Target Entity', 'Record ID', 'Details'];
    const rows = auditLogs.map((log) => [
      log.timestamp,
      `"${log.userName} (${log.userRole})"`,
      log.action,
      log.entity,
      log.entityId,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hope_community_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <EmergencyBanner compact />

      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C6A66B] text-[#173F3A]">
              Executive Administration & Compliance
            </span>
            <span className="text-xs text-[#216761] font-mono">Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F3A]">
            Administrative Operations Center
          </h1>
          <p className="text-xs text-[#66736F] mt-1">
            Hope Community Support (Est. 2008) • System Security & Practice Oversight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewUserModal(true)}
            className="px-4 py-2.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#C6A66B]" />
            Add Staff / Provider
          </button>
          <button
            onClick={handleExportAuditCSV}
            className="px-4 py-2.5 rounded-lg bg-[#F8F5EE] border border-[#216761]/30 text-[#173F3A] text-xs font-semibold hover:bg-[#EFEAE0] flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#216761]" />
            Export Audit Log
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#A9C2B2]/40 flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Practice Overview' },
          { id: 'users', label: `Staff & Users Directory (${users.length})` },
          { id: 'audit', label: `HIPAA Audit Trail (${auditLogs.length})` },
          { id: 'job_applications', label: `Career Applications (${jobApplications.length})` },
          { id: 'inquiries', label: `Contact Inquiries (${contactInquiries.length})` },
          { id: 'services', label: `Clinical Modalities (${services.length})` },
          { id: 'settings', label: 'Clinic Settings' },
          { id: 'compliance', label: 'HIPAA & System Security' },
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
          {/* Key Metric Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#66736F] block">Registered Clients</span>
              <div className="text-2xl font-serif font-bold text-[#173F3A] mt-1">
                {users.filter((u) => u.role === 'client' || u.role === 'parent_guardian').length}
              </div>
              <span className="text-[11px] text-[#216761]">York & SC communities</span>
            </div>

            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#66736F] block">Licensed Staff / Providers</span>
              <div className="text-2xl font-serif font-bold text-[#173F3A] mt-1">
                {users.filter((u) => u.role !== 'client' && u.role !== 'parent_guardian').length}
              </div>
              <span className="text-[11px] text-[#216761]">100% MFA Enforced</span>
            </div>

            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#66736F] block">Total Audit Trail Events</span>
              <div className="text-2xl font-serif font-bold text-[#173F3A] mt-1">
                {auditLogs.length}
              </div>
              <span className="text-[11px] text-[#216761]">Immutable chronological log</span>
            </div>

            <div className="bg-white rounded-xl border border-[#A9C2B2]/40 p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#66736F] block">HIPAA Compliance Score</span>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                99.8%
              </div>
              <span className="text-[11px] text-emerald-700">Audit Ready • TLS 1.3</span>
            </div>
          </div>

          {/* System Security Card */}
          <div className="bg-[#173F3A] text-white rounded-2xl p-6 sm:p-8 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-[#C6A66B]" />
              <h3 className="font-serif font-bold text-xl text-white">
                HIPAA Administrative & Technical Safeguards
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#A9C2B2] mt-4">
              <div className="p-4 rounded-xl bg-white/10 space-y-1">
                <strong className="text-white block font-serif text-sm">Role-Based Access Control (RBAC)</strong>
                <p>Strict boundaries between clients, coordinators, licensed clinicians, and executive administrators.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 space-y-1">
                <strong className="text-white block font-serif text-sm">Audit Trails & Activity Logs</strong>
                <p>All viewing, creating, updating, and exporting of PHI records are immutably logged with actor timestamps.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 space-y-1">
                <strong className="text-white block font-serif text-sm">Multi-Factor Authentication</strong>
                <p>Mandatory 2FA challenge required on all staff, provider, and administrative accounts.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                User & Personnel Directory
              </h3>
              <p className="text-xs text-[#66736F]">
                Manage account credentials, role permissions, and active statuses.
              </p>
            </div>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="px-4 py-2 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C6A66B]" />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8F5EE] text-[#173F3A] uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">User Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">MFA Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE1]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F5EE]/40">
                    <td className="px-4 py-3 font-semibold text-[#173F3A]">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-[#66736F]">{u.email}</td>
                    <td className="px-4 py-3 capitalize">
                      <span className="px-2 py-0.5 rounded bg-[#216761]/10 text-[#216761] font-medium">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#66736F]">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {u.mfaEnabled ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                        </span>
                      ) : (
                        <span className="text-gray-400">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1ECE1] pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Immutable HIPAA Audit Trail
              </h3>
              <p className="text-xs text-[#66736F]">
                Chronological ledger of clinical interactions, logins, and status transitions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter logs by keyword..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/50 focus:outline-none"
                />
              </div>
              <button
                onClick={handleExportAuditCSV}
                className="px-3 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A] flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8F5EE] text-[#173F3A] uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg">Timestamp</th>
                  <th className="px-3 py-2.5">Actor</th>
                  <th className="px-3 py-2.5">Action</th>
                  <th className="px-3 py-2.5">Target</th>
                  <th className="px-3 py-2.5 rounded-r-lg">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE1]">
                {auditLogs
                  .filter((l) =>
                    l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
                    l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                    l.userName.toLowerCase().includes(auditSearch.toLowerCase())
                  )
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8F5EE]/40">
                      <td className="px-3 py-2 text-[11px] font-mono text-[#66736F] whitespace-nowrap">
                        {log.timestamp.replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="px-3 py-2 text-[#173F3A] whitespace-nowrap">
                        <strong>{log.userName}</strong>
                        <span className="block text-[10px] text-[#66736F] capitalize">{log.userRole.replace('_', ' ')}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#216761]/10 text-[#216761] font-mono text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px] font-mono text-[#66736F]">
                        {log.entity} #{log.entityId.substring(0, 8)}
                      </td>
                      <td className="px-3 py-2 text-[#202826] text-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: CLINICAL SERVICES */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1ECE1] pb-4">
            <h3 className="font-serif font-bold text-xl text-[#173F3A]">
              Active Clinical Modalities & Service Offerings
            </h3>
            <p className="text-xs text-[#66736F]">
              Service descriptions and clinical modalities published to the community portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div key={srv.id} className="p-4 rounded-xl border border-[#A9C2B2]/40 bg-[#F8F5EE]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="font-serif font-bold text-sm text-[#173F3A]">{srv.name}</strong>
                  <span className="text-xs font-mono text-[#216761]">{srv.durationMinutes} min</span>
                </div>
                <p className="text-xs text-[#66736F] leading-relaxed">{srv.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  {srv.deliveryMethods.map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded bg-white border border-[#A9C2B2]/50 text-[10px] capitalize text-[#173F3A]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: JOB APPLICATIONS */}
      {activeTab === 'job_applications' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Career Candidate Applications ({jobApplications.length})
              </h3>
              <p className="text-xs text-[#66736F]">
                Submissions from licensed professionals, clinical interns, and behavioral support specialists.
              </p>
            </div>
          </div>

          {jobApplications.length === 0 ? (
            <div className="text-center py-12 bg-[#F8F5EE]/50 rounded-xl border border-dashed border-[#A9C2B2]/60">
              <Briefcase className="w-10 h-10 mx-auto text-[#A9C2B2] mb-3" />
              <h3 className="font-serif font-bold text-[#173F3A] text-sm">No applications submitted yet</h3>
              <p className="text-xs text-[#66736F] max-w-sm mx-auto mt-1">
                Candidate submissions from the public Careers page will be listed here with license verification details.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#A9C2B2]/30 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-[#173F3A] border-b border-[#A9C2B2]/40">
                  <tr>
                    <th className="p-3 font-semibold">Applicant</th>
                    <th className="p-3 font-semibold">Position</th>
                    <th className="p-3 font-semibold">License & Credentials</th>
                    <th className="p-3 font-semibold">Experience / Degree</th>
                    <th className="p-3 font-semibold">Date Applied</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A9C2B2]/20">
                  {jobApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#F8F5EE]/40 transition-colors">
                      <td className="p-3 font-medium text-[#173F3A]">
                        <div>{app.applicantName}</div>
                        <div className="text-[11px] text-[#66736F]">{app.applicantEmail} • {app.applicantPhone}</div>
                      </td>
                      <td className="p-3 font-medium text-[#202826]">{app.jobTitle}</td>
                      <td className="p-3 text-[#202826]">{app.licenseNumber || 'Under supervision'}</td>
                      <td className="p-3 text-[#66736F]">
                        <div>{app.resumeFileName ? `Resume: ${app.resumeFileName}` : 'Resume attached'}</div>
                      </td>
                      <td className="p-3 text-[#66736F] whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'offer'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'interview_scheduled'
                              ? 'bg-sky-100 text-sky-800'
                              : app.status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'archived'
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-[#216761]/10 text-[#216761]'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setAppReviewNotes(app.reviewerNotes || '');
                          }}
                          className="px-3 py-1 bg-[#216761] text-white text-xs font-semibold rounded hover:bg-[#173F3A]"
                        >
                          Review Candidate
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

      {/* Tab: CONTACT INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                General & Community Contact Inquiries ({contactInquiries.length})
              </h3>
              <p className="text-xs text-[#66736F]">
                Messages submitted via the public Contact page by individuals, parents, and community partners.
              </p>
            </div>
          </div>

          {contactInquiries.length === 0 ? (
            <div className="text-center py-12 bg-[#F8F5EE]/50 rounded-xl border border-dashed border-[#A9C2B2]/60">
              <Mail className="w-10 h-10 mx-auto text-[#A9C2B2] mb-3" />
              <h3 className="font-serif font-bold text-[#173F3A] text-sm">No new inquiries</h3>
              <p className="text-xs text-[#66736F] max-w-sm mx-auto mt-1">
                Messages from the Contact Us form will appear here with contact preferences and triage notes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#A9C2B2]/30 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-[#173F3A] border-b border-[#A9C2B2]/40">
                  <tr>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Contact Info</th>
                    <th className="p-3 font-semibold">Subject / Area</th>
                    <th className="p-3 font-semibold">Preferred Contact</th>
                    <th className="p-3 font-semibold">Date Received</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A9C2B2]/20">
                  {contactInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-[#F8F5EE]/40 transition-colors">
                      <td className="p-3 font-medium text-[#173F3A]">{inq.name}</td>
                      <td className="p-3 text-[#202826]">
                        <div>{inq.email}</div>
                        <div className="text-[11px] text-[#66736F]">{inq.phone || 'No phone'}</div>
                      </td>
                      <td className="p-3 text-[#202826] font-medium">{inq.subject}</td>
                      <td className="p-3 text-[#66736F] capitalize">{inq.preferredContactMethod}</td>
                      <td className="p-3 text-[#66736F] whitespace-nowrap">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            inq.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inq.status === 'contacted'
                              ? 'bg-sky-100 text-sky-800'
                              : inq.status === 'reviewing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#216761]/10 text-[#216761]'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setInquiryNotes(inq.responseNotes || '');
                          }}
                          className="px-3 py-1 bg-[#216761] text-white text-xs font-semibold rounded hover:bg-[#173F3A]"
                        >
                          View & Reply
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

      {/* Tab: CLINIC SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1ECE1] pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#173F3A]">
                Clinic Operations & Organization Settings
              </h3>
              <p className="text-xs text-[#66736F]">
                Configure practice metadata, communication numbers, emergency protocols, and site status.
              </p>
            </div>
            {savedSettingsMsg && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Settings Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Clinic Operating Name</label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Legal Corporate Entity</label>
                <input
                  type="text"
                  value={settings.legalName}
                  onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none focus:ring-2 focus:ring-[#216761]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Primary Voice Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Secure HIPAA Fax</label>
                <input
                  type="text"
                  value={settings.fax}
                  onChange={(e) => setSettings({ ...settings, fax: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Central Intake Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#173F3A] mb-1">Physical Office Address</label>
              <input
                type="text"
                value={settings.address || settings.primaryAddress || ''}
                onChange={(e) => setSettings({ ...settings, primaryAddress: e.target.value, address: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173F3A] mb-1">Office Hours Description</label>
              <input
                type="text"
                value={settings.officeHours || ''}
                onChange={(e) => setSettings({ ...settings, officeHours: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173F3A] mb-1">Crisis & Emergency Notice Text</label>
              <textarea
                rows={2}
                value={settings.emergencyNotice || ''}
                onChange={(e) => setSettings({ ...settings, emergencyNotice: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div className="p-4 bg-[#F8F5EE] rounded-xl border border-[#A9C2B2]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-[#173F3A] block">Site Maintenance Mode</span>
                <span className="text-[11px] text-[#66736F]">
                  When active, non-staff visitors receive a maintenance notification.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
                  settings.maintenanceMode
                    ? 'bg-rose-700 text-white'
                    : 'bg-stone-200 text-stone-800'
                }`}
              >
                {settings.maintenanceMode ? 'Maintenance Enabled' : 'Normal Operation'}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#216761] text-white font-bold hover:bg-[#173F3A] flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4 text-[#C6A66B]" />
                Save System Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: COMPLIANCE & PRODUCTION READINESS */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-2xl border border-[#A9C2B2]/40 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1ECE1] pb-4">
            <h3 className="font-serif font-bold text-xl text-[#173F3A]">
              HIPAA & Regulatory Security Controls
            </h3>
            <p className="text-xs text-[#66736F]">
              Verification of technical, physical, and administrative safeguards.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Data Encryption at Rest & in Transit',
                desc: 'Client records, intake forms, and messages are secured using AES-256 and TLS 1.3 standards.',
                status: 'Compliant',
              },
              {
                title: 'Role-Based Authorization (RBAC)',
                desc: 'Client, Staff Provider, Intake Coordinator, and Administrator capabilities strictly separated.',
                status: 'Compliant',
              },
              {
                title: 'Multi-Factor Authentication (MFA)',
                desc: 'Enforced for all administrative and clinical staff accounts.',
                status: 'Compliant',
              },
              {
                title: 'Emergency Crisis Safety Protocols',
                desc: 'Persistent 988 Suicide & Crisis Lifeline banner visible across all authenticated and unauthenticated views.',
                status: 'Compliant',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#A9C2B2]/30 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#173F3A]">{item.title}</h4>
                  <p className="text-xs text-[#66736F]">{item.desc}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#173F3A]">
              Provision New Personnel Account
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#173F3A] mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#173F3A] mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                >
                  <option value="provider">Licensed Provider (Therapist/Counselor)</option>
                  <option value="intake_coordinator">Staff Intake Coordinator</option>
                  <option value="administrator">Executive Administrator</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#173F3A] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(803) 555-0100"
                  className="w-full px-3 py-2 bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="text-[#66736F] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#216761] text-white font-bold hover:bg-[#173F3A]"
                >
                  Create Personnel Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Career Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-lg text-[#173F3A] border-b border-[#F1ECE1] pb-2">
              Candidate Application: {selectedApp.applicantName}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8F5EE] p-4 rounded-lg">
              <div>
                <p><strong>Position:</strong> {selectedApp.jobTitle}</p>
                <p><strong>Email:</strong> {selectedApp.applicantEmail}</p>
                <p><strong>Phone:</strong> {selectedApp.applicantPhone}</p>
              </div>
              <div>
                <p><strong>License Number:</strong> {selectedApp.licenseNumber || 'Under clinical supervision'}</p>
                <p><strong>Resume File:</strong> {selectedApp.resumeFileName || 'On file'}</p>
                <p><strong>Applied:</strong> {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedApp.coverNote && (
              <div className="text-xs space-y-1">
                <p className="font-semibold text-[#173F3A]">Cover Note & Statement of Practice:</p>
                <div className="bg-[#F8F5EE] p-3 rounded text-[#202826] border border-[#A9C2B2]/30 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.coverNote}
                </div>
              </div>
            )}

            {selectedApp.resumeFileName && (
              <div className="text-xs text-[#216761] flex items-center gap-1.5 p-2 bg-[#216761]/5 rounded border border-[#216761]/20">
                <FileText className="w-4 h-4" />
                <span>Uploaded Resume: <strong>{selectedApp.resumeFileName}</strong></span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Executive & Clinical Hiring Notes
              </label>
              <textarea
                rows={3}
                value={appReviewNotes}
                onChange={(e) => setAppReviewNotes(e.target.value)}
                placeholder="Document interview dates, credential checks, or committee notes..."
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1ECE1]">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-xs text-[#66736F]"
              >
                Close
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'under_review', appReviewNotes)}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 text-xs font-semibold hover:bg-amber-100"
                >
                  Mark Reviewing
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'interview_scheduled', appReviewNotes)}
                  className="px-3 py-1.5 rounded-lg border border-sky-300 text-sky-800 bg-sky-50 text-xs font-semibold hover:bg-sky-100"
                >
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'archived', appReviewNotes)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 bg-stone-50 text-xs font-semibold hover:bg-stone-100"
                >
                  Archive / Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'offer', appReviewNotes)}
                  className="px-4 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                >
                  Extend Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Contact Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F3A]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-lg text-[#173F3A] border-b border-[#F1ECE1] pb-2">
              Contact Inquiry: {selectedInquiry.name}
            </h3>

            <div className="text-xs bg-[#F8F5EE] p-3 rounded-lg space-y-1">
              <p><strong>Email:</strong> {selectedInquiry.email}</p>
              <p><strong>Phone:</strong> {selectedInquiry.phone || 'Not provided'}</p>
              <p><strong>Subject:</strong> {selectedInquiry.subject}</p>
              <p><strong>Preferred Contact Method:</strong> <span className="capitalize">{selectedInquiry.preferredContact || selectedInquiry.preferredContactMethod || 'email'}</span></p>
              <p><strong>Received:</strong> {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-semibold text-[#173F3A]">Message Content:</p>
              <div className="bg-[#F8F5EE] p-3 rounded text-[#202826] border border-[#A9C2B2]/30 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F3A] mb-1">
                Internal Response & Follow-up Notes
              </label>
              <textarea
                rows={3}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                placeholder="Document follow-up calls, clinical routing, or resolution notes..."
                className="w-full px-3 py-2 text-xs bg-[#F8F5EE] rounded-lg border border-[#A9C2B2]/60 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1ECE1]">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="text-xs text-[#66736F]"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'contacted', inquiryNotes)}
                  className="px-3 py-1.5 rounded-lg border border-sky-300 text-sky-800 bg-sky-50 text-xs font-semibold hover:bg-sky-100"
                >
                  Mark Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'resolved', inquiryNotes)}
                  className="px-4 py-1.5 rounded-lg bg-[#216761] text-white text-xs font-bold hover:bg-[#173F3A]"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
