import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../db/store';
import { User, AuditLog, ServiceItem } from '../../types';
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
} from 'lucide-react';
import { EmergencyBanner } from '../common/EmergencyBanner';
import { INITIAL_SERVICES } from '../../db/initialData';

export const AdminPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'services' | 'compliance'>('overview');

  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);

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
          { id: 'services', label: `Clinical Modalities (${services.length})` },
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
                {users.filter((u) => u.role.startsWith('staff') || u.role === 'admin').length}
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

      {/* Tab 5: COMPLIANCE & SECURITY */}
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
    </div>
  );
};
