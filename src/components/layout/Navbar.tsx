import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Calendar,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  Settings,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, serviceCategory?: string) => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenBooking,
  onOpenAuth,
}) => {
  const { currentUser, logout, isStaff, isAdmin } = useAuth();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for click-outside detection
  const moreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Scroll listener for subtle header elevation shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Click outside and Escape key listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreDropdownOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (view: string, category?: string) => {
    onNavigate(view, category);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  const getPortalView = () => {
    if (isAdmin) return 'admin_portal';
    if (isStaff) return 'staff_portal';
    return 'client_portal';
  };

  const getPortalName = () => {
    if (isAdmin) return 'Admin Portal';
    if (isStaff) return 'Staff Portal';
    return 'Client Dashboard';
  };

  const primaryNavLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services_overview', label: 'Services' },
    { id: 'process', label: 'Our Process' },
    { id: 'contact', label: 'Contact' },
  ];

  const secondaryNavLinks = [
    { id: 'team', label: 'Our Team', desc: 'Licensed therapists & clinical leaders' },
    { id: 'locations', label: 'Locations', desc: 'Rock Hill, Columbia, Greenville & Telehealth' },
    { id: 'resources', label: 'Resources', desc: 'Crisis lines, worksheets & FAQs' },
    { id: 'careers', label: 'Careers', desc: 'Clinical roles & supervision opportunities' },
    { id: 'referrals', label: 'Referral Partners', desc: 'Physician, school & DSS direct referral' },
  ];

  const isPrimaryActive = (id: string) => {
    if (id === 'services_overview') {
      return currentView === 'services_overview' || currentView === 'service_detail';
    }
    return currentView === id;
  };

  const isSecondaryActive = secondaryNavLinks.some((item) => item.id === currentView);

  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-40 bg-[#FFFFFF]/98 backdrop-blur-md border-b border-[#A9C2B2]/30 transition-shadow duration-200 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 xl:px-10">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* SECTION 1: LOGO & BRAND IDENTITY */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3.5 cursor-pointer min-w-fit shrink-0 select-none group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNav('home');
              }
            }}
            aria-label="Hope Community Support Home"
          >
            {/* Logo Mark (44px-48px consistent, aspect ratio preserved) */}
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#173F3A] flex items-center justify-center text-[#C6A66B] shadow-xs group-hover:bg-[#216761] transition-colors shrink-0"
              aria-hidden="true"
            >
              <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            {/* Brand Typography */}
            <div className="flex flex-col whitespace-nowrap">
              <div className="flex items-baseline gap-2 leading-none">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#173F3A] tracking-tight">
                  HOPE
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#216761] tracking-wider uppercase">
                  Community Support
                </span>
              </div>
              {/* Tagline: Visible on 1280px+ (Large desktop), hidden on medium to avoid crowding */}
              <p className="hidden xl:block text-[11px] text-[#66736F] leading-tight pt-1 font-normal">
                Hands On Personal Empowerment <span className="text-[#C6A66B] font-bold mx-1">•</span>{' '}
                <span className="italic font-serif">Est. 2008</span>
              </p>
            </div>
          </div>

          {/* SECTION 2: PRIMARY NAVIGATION (Desktop 1024px+) */}
          <nav
            className="hidden lg:flex items-center gap-5 xl:gap-6"
            aria-label="Primary Site Navigation"
          >
            {primaryNavLinks.map((item) => {
              const active = isPrimaryActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`text-[14.5px] whitespace-nowrap px-3 py-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-[#216761] focus-visible:outline-none ${
                    active
                      ? 'text-[#173F3A] font-bold bg-[#F8F5EE] shadow-2xs'
                      : 'text-[#202826] font-medium hover:text-[#216761] hover:bg-[#F8F5EE]/70'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
                aria-label="More navigation links"
                className={`text-[14.5px] whitespace-nowrap px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#216761] focus-visible:outline-none ${
                  isSecondaryActive || moreDropdownOpen
                    ? 'text-[#173F3A] font-bold bg-[#F8F5EE]'
                    : 'text-[#202826] font-medium hover:text-[#216761] hover:bg-[#F8F5EE]/70'
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#66736F] transition-transform duration-200 ${
                    moreDropdownOpen ? 'rotate-180 text-[#216761]' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Accessible Dropdown Card */}
              {moreDropdownOpen && (
                <div
                  className="absolute top-full right-0 w-72 bg-white rounded-xl shadow-xl border border-[#A9C2B2]/30 py-2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-1.5 border-b border-[#F1ECE1] mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736F]">
                      Organization & Community
                    </span>
                  </div>

                  {secondaryNavLinks.map((item) => {
                    const active = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav(item.id)}
                        className={`w-full text-left px-4 py-2.5 transition-colors flex flex-col focus-visible:bg-[#F8F5EE] focus-visible:outline-none ${
                          active
                            ? 'bg-[#F8F5EE] text-[#173F3A] font-semibold'
                            : 'text-[#202826] hover:bg-[#F8F5EE] hover:text-[#216761]'
                        }`}
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-[11px] text-[#66736F] font-normal leading-tight">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* SECTION 3: ACTION BUTTONS (Desktop 1024px+) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Primary Action: Schedule Appointment (Consistent ~46px height) */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="h-[46px] inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-[#216761] hover:bg-[#173F3A] text-white text-[13.5px] font-semibold shadow-xs transition-all transform hover:-translate-y-0.5 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#216761] focus-visible:outline-none"
            >
              <Calendar className="w-4 h-4 text-[#C6A66B] shrink-0" aria-hidden="true" />
              <span>Schedule Appointment</span>
            </button>

            {/* Secondary Action: Logged In User Profile Dropdown OR Client Portal Login */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User account and profile menu"
                  className="h-[46px] inline-flex items-center gap-2 px-3.5 rounded-xl bg-[#F8F5EE] border border-[#216761]/30 hover:bg-[#EFEAE0] text-[#173F3A] transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#216761] focus-visible:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#216761] text-[#F8F5EE] flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.firstName.charAt(0)}
                    {currentUser.lastName.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-none text-[#173F3A]">
                      {currentUser.firstName} {currentUser.lastName.charAt(0)}.
                    </span>
                    <span className="text-[10px] text-[#216761] font-medium leading-tight">
                      {getPortalName()}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#66736F] transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180 text-[#216761]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Compact User Profile Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute top-full right-0 w-64 bg-white rounded-xl shadow-xl border border-[#A9C2B2]/30 py-2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[#202826]"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* User Identity Header */}
                    <div className="px-4 py-2.5 border-b border-[#F1ECE1]">
                      <p className="text-xs font-bold text-[#173F3A] truncate">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-[11px] text-[#66736F] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-[#F8F5EE] text-[#216761] text-[10px] font-bold uppercase tracking-wider">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Dashboard Navigation */}
                    <div className="py-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav(getPortalView())}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-[#173F3A] hover:bg-[#F8F5EE] flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#216761]" />
                        <span>Go to {getPortalName()}</span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav(getPortalView())}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-[#202826] hover:bg-[#F8F5EE] flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#66736F]" />
                        <span>Profile & Contact Info</span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav(getPortalView())}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-[#202826] hover:bg-[#F8F5EE] flex items-center gap-2.5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#66736F]" />
                        <span>Account Settings</span>
                      </button>
                    </div>

                    {/* Integrated Sign Out inside Profile Dropdown */}
                    <div className="pt-1 mt-1 border-t border-[#F1ECE1]">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          handleNav('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="h-[46px] inline-flex items-center justify-center gap-2 px-4 rounded-xl border border-[#216761] text-[#216761] hover:bg-[#216761] hover:text-white text-[13.5px] font-semibold transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#216761] focus-visible:outline-none"
              >
                <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Client Portal</span>
              </button>
            )}
          </div>

          {/* TABLET & MOBILE CONTROLS (<1024px) */}
          <div className="lg:hidden flex items-center gap-2.5">
            {/* Compact Schedule Button on tablet / large mobile (>= 480px) */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg bg-[#216761] text-white text-xs font-semibold shadow-2xs hover:bg-[#173F3A] transition-colors focus-visible:ring-2 focus-visible:ring-[#216761] focus-visible:outline-none"
              aria-label="Schedule Appointment"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C6A66B]" aria-hidden="true" />
              <span>Schedule</span>
            </button>

            {/* Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              aria-expanded={mobileMenuOpen}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[#173F3A] border border-[#A9C2B2]/40 hover:bg-[#F8F5EE] transition-colors focus-visible:ring-2 focus-visible:ring-[#216761] focus-visible:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY & PANEL */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#F1ECE1] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#173F3A] flex items-center justify-center text-[#C6A66B]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif font-bold text-base text-[#173F3A]">HOPE</span>
                  <span className="text-[10px] block font-bold text-[#216761] uppercase tracking-wider">
                    Community Support
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#66736F] hover:bg-[#F8F5EE] hover:text-[#173F3A] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Action Buttons inside Drawer */}
            <div className="p-5 border-b border-[#F1ECE1] bg-[#F8F5EE]/40 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onOpenBooking();
                  setMobileMenuOpen(false);
                }}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#216761] hover:bg-[#173F3A] text-white text-sm font-semibold shadow-xs transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#C6A66B]" />
                <span>Schedule Appointment</span>
              </button>

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => handleNav(getPortalView())}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#173F3A] text-white text-sm font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#C6A66B]" />
                  <span>Go to {getPortalName()}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-[#216761] text-[#216761] hover:bg-[#216761] hover:text-white text-sm font-semibold transition-colors bg-white"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Client Portal Login</span>
                </button>
              )}
            </div>

            {/* Scrollable Navigation Links List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Primary Links */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736F] block mb-2 px-3">
                  Main Navigation
                </span>
                <div className="space-y-1">
                  {primaryNavLinks.map((link) => {
                    const active = isPrimaryActive(link.id);
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => handleNav(link.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                          active
                            ? 'bg-[#F8F5EE] text-[#173F3A] font-bold'
                            : 'text-[#202826] hover:bg-[#F8F5EE] hover:text-[#216761]'
                        }`}
                      >
                        <span>{link.label}</span>
                        {active && <ArrowRight className="w-4 h-4 text-[#216761]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary / "More" Links */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736F] block mb-2 px-3">
                  Organization & Resources
                </span>
                <div className="space-y-1">
                  {secondaryNavLinks.map((link) => {
                    const active = currentView === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => handleNav(link.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-colors flex flex-col ${
                          active
                            ? 'bg-[#F8F5EE] text-[#173F3A] font-bold'
                            : 'text-[#202826] hover:bg-[#F8F5EE] hover:text-[#216761]'
                        }`}
                      >
                        <span className="font-medium">{link.label}</span>
                        <span className="text-xs text-[#66736F] font-normal">{link.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer: Authenticated User Info & Sign Out */}
            {currentUser && (
              <div className="p-5 border-t border-[#F1ECE1] bg-[#F8F5EE]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#173F3A] truncate">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-[11px] text-[#66736F] truncate">{currentUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      handleNav('home');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
