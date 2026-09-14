import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Shield,
  HelpCircle,
  PhoneCall,
  User,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Wifi,
  ExternalLink,
  Lock,
  Sparkles,
  Heart,
  Users,
  Activity,
  FileCheck,
} from 'lucide-react';
import { User as UserType, NotificationItem } from '../../types';

interface ClientPortalLayoutProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
  currentUser: UserType | null;
  unreadMessagesCount?: number;
  notifications?: NotificationItem[];
  onClearNotifications?: () => void;
  onOpenCrisisModal: () => void;
  onOpenConnectionTest: () => void;
  onSignOut: () => void;
  onExitToPublic?: () => void;
  children: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({
  activeTab,
  onNavigate,
  currentUser,
  unreadMessagesCount = 0,
  notifications = [],
  onClearNotifications,
  onOpenCrisisModal,
  onOpenConnectionTest,
  onSignOut,
  onExitToPublic,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Close mobile drawer on route/tab change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Keyboard close for modals/drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navGroups: NavGroup[] = [
    {
      label: 'Care Overview',
      items: [
        { id: 'overview', label: 'Client Overview', icon: LayoutDashboard },
        { id: 'care_team', label: 'My Care Team', icon: Users },
        { id: 'care_plan', label: 'My Care Plan', icon: FileText },
      ],
    },
    {
      label: 'Appointments & Telehealth',
      items: [
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'video_session', label: 'Telehealth Room', icon: Video },
      ],
    },
    {
      label: 'Clinical Progress',
      items: [
        { id: 'wellness', label: 'Wellness Program', icon: Activity },
        { id: 'checkins', label: 'Progress Check-In', icon: TrendingUp },
        { id: 'reports', label: 'Approved Reports', icon: CheckCircle2 },
      ],
    },
    {
      label: 'Forms & Records',
      items: [
        { id: 'forms', label: 'Required Forms', icon: FileCheck },
        { id: 'documents', label: 'Documents & Records', icon: UploadCloud },
        { id: 'consents', label: 'Consent & Privacy', icon: Shield },
        { id: 'privacy', label: 'Privacy Requests', icon: Lock },
      ],
    },
    {
      label: 'Financial & Billing',
      items: [
        { id: 'billing', label: 'Billing & Statements', icon: Receipt },
      ],
    },
    {
      label: 'Communications',
      items: [
        {
          id: 'messages',
          label: 'Secure Messages',
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          badgeColor: 'bg-[#B3392F] text-white',
        },
      ],
    },
    {
      label: 'Support & Security',
      items: [
        { id: 'support', label: 'Help & FAQs', icon: HelpCircle },
        { id: 'account', label: 'Account & Security', icon: User },
        { id: 'accessibility', label: 'Accessibility Settings', icon: Sliders },
      ],
    },
  ];

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#17312E] flex flex-col font-sans">
      {/* 1. DEDICATED PORTAL TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D9E1DC] shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#173F3A] hover:bg-[#F8F5EE] focus:outline-none focus:ring-2 focus:ring-[#216761]"
              aria-label="Open portal navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#173F3A] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
                H
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-serif font-bold text-[#173F3A] tracking-tight">
                  Hope Community Support
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#216761] font-semibold">
                  <Lock className="w-3 h-3" />
                  <span>Confidential Client Portal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center / Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 24/7 Crisis Help Button (Always accessible) */}
            <button
              onClick={onOpenCrisisModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B3392F]/10 border border-[#B3392F]/30 text-[#B3392F] text-xs font-bold hover:bg-[#B3392F]/20 transition-colors shadow-2xs"
              title="Immediate Crisis Resources and Coping Grounding"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">24/7 Crisis Help (988)</span>
              <span className="sm:hidden">988</span>
            </button>

            {/* Test Audio/Video */}
            <button
              onClick={onOpenConnectionTest}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E1DC] bg-[#F8F5EE] text-[#17312E] text-xs font-semibold hover:bg-[#EFEAE0] transition-colors"
              title="Pre-session audio and video diagnostic check"
            >
              <Wifi className="w-3.5 h-3.5 text-[#216761]" />
              <span>Test Telehealth</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-[#5F6F6B] hover:text-[#173F3A] hover:bg-[#F8F5EE] transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B3392F]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#D9E1DC] shadow-xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F6B]">
                      Clinical Notifications ({notifications.length})
                    </span>
                    {onClearNotifications && notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-[11px] text-[#216761] hover:underline font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#5F6F6B] py-4 text-center">
                        No notifications at this time.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 rounded-lg bg-[#F8F5EE] text-xs space-y-1 border border-[#D9E1DC]"
                        >
                          <div className="font-semibold text-[#173F3A]">{n.title}</div>
                          <div className="text-[11px] text-[#5F6F6B] leading-relaxed">{n.message}</div>
                          <div className="text-[10px] text-[#5F6F6B]/80 font-mono pt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-[#D9E1DC] bg-[#F8F5EE] hover:bg-[#EFEAE0] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-[#216761] text-white text-xs font-bold flex items-center justify-center">
                  {currentUser?.firstName?.charAt(0) || 'C'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-[#173F3A] leading-none">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                  <div className="text-[10px] text-[#5F6F6B] mt-0.5 leading-none">
                    ID: {currentUser?.id || 'client-01'}
                  </div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#D9E1DC] shadow-xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-[#D9E1DC]">
                    <div className="text-xs font-bold text-[#173F3A]">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </div>
                    <div className="text-[11px] text-[#5F6F6B] truncate">{currentUser?.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('account');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#17312E] hover:bg-[#F8F5EE] rounded-lg flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#216761]" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('accessibility');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#17312E] hover:bg-[#F8F5EE] rounded-lg flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#216761]" />
                    <span>Accessibility</span>
                  </button>

                  {onExitToPublic && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onExitToPublic();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#5F6F6B] hover:bg-[#F8F5EE] rounded-lg flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Return to Public Site</span>
                    </button>
                  )}

                  <div className="pt-1 border-t border-[#D9E1DC]">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#B3392F] hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Exit Privacy Button */}
            <button
              onClick={() => {
                if (onExitToPublic) onExitToPublic();
                else window.location.href = 'https://weather.com';
              }}
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#5F6F6B] hover:text-[#B3392F] hover:bg-red-50 rounded-lg border border-transparent transition-colors"
              title="Quickly exit to hide confidential health information"
            >
              <X className="w-3.5 h-3.5" />
              <span>Quick Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY WITH SIDEBAR AND MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP COLLAPSIBLE SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col border-r border-[#D9E1DC] bg-white transition-all duration-300 select-none ${
            sidebarCollapsed ? 'w-20' : 'w-64 xl:w-72'
          }`}
        >
          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] mb-2">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                        isActive
                          ? 'bg-[#173F3A] text-white shadow-2xs'
                          : 'text-[#17312E] hover:bg-[#F8F5EE] hover:text-[#173F3A]'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C6A66B]' : 'text-[#216761]'}`} />
                      {!sidebarCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-[#216761] text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {sidebarCollapsed && item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B3392F]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#D9E1DC] bg-[#F8F5EE]/60 space-y-2">
            {!sidebarCollapsed && (
              <div className="px-2 text-[11px] text-[#5F6F6B] space-y-1">
                <div className="font-semibold text-[#17312E]">Hope Community Support</div>
                <div>Direct Line: (803) 328-8888</div>
                <div className="text-[10px] text-emerald-800 font-mono">HIPAA Safeguards Active</div>
              </div>
            )}

            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[#5F6F6B] hover:text-[#173F3A] hover:bg-[#EFEAE0] transition-colors"
              title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-[#216761]" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-[#216761]" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER OVERLAY */}
        {mobileMenuOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 lg:hidden flex"
          >
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#17312E]/60 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer */}
            <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 border-r border-[#D9E1DC]">
              <div className="p-4 border-b border-[#D9E1DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#173F3A] text-white flex items-center justify-center font-serif font-bold text-sm">
                    H
                  </div>
                  <div>
                    <div className="text-xs font-serif font-bold text-[#173F3A]">Hope Community Support</div>
                    <div className="text-[10px] text-[#216761] font-semibold">Client Portal</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#5F6F6B] hover:text-[#173F3A]"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F6B] px-3 mb-1">
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-[#173F3A] text-white'
                              : 'text-[#17312E] hover:bg-[#F8F5EE]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#C6A66B]' : 'text-[#216761]'}`} />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#B3392F] text-white">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[#D9E1DC] bg-[#F8F5EE] space-y-2">
                <button
                  onClick={onOpenCrisisModal}
                  className="w-full py-2 px-3 rounded-lg bg-[#B3392F]/10 border border-[#B3392F]/30 text-[#B3392F] text-xs font-bold flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>24/7 Crisis Help (988)</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="w-full py-2 px-3 rounded-lg bg-white border border-[#D9E1DC] text-xs font-bold text-[#17312E] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRIMARY MAIN CANVAS */}
        <main className="flex-1 overflow-y-auto bg-[#F8F5EE] focus:outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
