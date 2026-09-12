import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { ServicesOverviewPage } from './components/public/ServicesOverviewPage';
import { ServiceDetailPage } from './components/public/ServiceDetailPage';
import { ProcessPage } from './components/public/ProcessPage';
import { TeamPage } from './components/public/TeamPage';
import { LocationsPage } from './components/public/LocationsPage';
import { ResourcesPage } from './components/public/ResourcesPage';
import { CareersPage } from './components/public/CareersPage';
import { ContactPage } from './components/public/ContactPage';
import { ReferralPartnerPage } from './components/public/ReferralPartnerPage';
import { LegalPages } from './components/public/LegalPages';
import { ClientDashboard } from './components/portal/ClientDashboard';
import { StaffPortal } from './components/staff/StaffPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AppointmentBookingModal } from './components/scheduling/AppointmentBookingModal';
import { AuthModal } from './components/auth/AuthModal';

const MainAppContent: React.FC = () => {
  const { currentUser, isClient, isStaff, isAdmin, isLoading, isFirebaseReady, authError, clearAuthError } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>('individual-counseling');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [legalPage, setLegalPage] = useState<'privacy' | 'hipaa' | 'terms' | 'accessibility' | 'nondiscrimination'>('privacy');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EE] text-[#173F3A]">
        <div className="w-10 h-10 rounded-full border-3 border-[#216761]/20 border-t-[#216761] animate-spin mb-4" />
        <p className="font-serif text-lg text-[#173F3A] font-semibold tracking-tight">Hope Community Support</p>
        <p className="text-xs text-[#66736F] mt-1">Initializing secure session...</p>
      </div>
    );
  }

  const handleNavigate = (view: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view.startsWith('service_detail:')) {
      const slug = view.split(':')[1];
      setSelectedServiceSlug(slug);
      setCurrentView('service_detail');
      return;
    }

    if (view.startsWith('legal:')) {
      const page = view.split(':')[1] as any;
      setLegalPage(page);
      setCurrentView('legal');
      return;
    }

    // Portal redirects if unauthenticated
    if (view === 'client_portal' && !currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if ((view === 'staff_portal' || view === 'admin_portal') && !currentUser) {
      setIsAuthOpen(true);
      return;
    }

    setCurrentView(view);
  };

  const handleServiceSelect = (slug: string) => {
    setSelectedServiceSlug(slug);
    setCurrentView('service_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EE] text-[#202826]">
      {/* Interactive Role Switcher Header for Demo Inspection */}
      <RoleSwitcherBar
        onSwitchRole={(role) => {
          if (role === 'client' || role === 'parent_guardian') {
            setCurrentView('client_portal');
          } else if (role === 'provider' || role === 'intake_coordinator' || role === 'supervisor' || role === 'scheduler' || role === 'billing_staff') {
            setCurrentView('staff_portal');
          } else if (role === 'administrator' || role === 'super_admin') {
            setCurrentView('admin_portal');
          } else {
            setCurrentView('home');
          }
        }}
      />

      {/* Non-blocking Authentication Alert Banner */}
      {authError && (
        <div className="bg-[#B3392F]/10 border-b border-[#B3392F]/20 px-4 py-2 text-xs text-[#B3392F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Notice:</span>
            <span>{authError}</span>
          </div>
          <button
            onClick={clearAuthError}
            className="text-xs underline hover:text-[#8C2C24] font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header & Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Primary Page Canvas */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={(v) => {
              if (v.startsWith('service:')) {
                handleServiceSelect(v.replace('service:', ''));
              } else {
                handleNavigate(v);
              }
            }}
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {(currentView === 'services' || currentView === 'services_overview') && (
          <ServicesOverviewPage
            onSelectService={handleServiceSelect}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'service_detail' && (
          <ServiceDetailPage
            category={(selectedServiceSlug as any) || 'therapy'}
            onBack={() => handleNavigate('services_overview')}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'process' && (
          <ProcessPage
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'team' && (
          <TeamPage
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'locations' && (
          <LocationsPage
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'resources' && (
          <ResourcesPage />
        )}

        {currentView === 'careers' && (
          <CareersPage />
        )}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'referrals' && <ReferralPartnerPage />}

        {currentView === 'legal' && (
          <LegalPages page={legalPage} onNavigate={handleNavigate} />
        )}

        {/* Portals */}
        {currentView === 'client_portal' && (
          <ClientDashboard onOpenBooking={() => setIsBookingOpen(true)} />
        )}

        {currentView === 'staff_portal' && <StaffPortal />}

        {currentView === 'admin_portal' && <AdminPortal />}
      </main>

      {/* Modals */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          if (isAdmin) setCurrentView('admin_portal');
          else if (isStaff) setCurrentView('staff_portal');
          else setCurrentView('client_portal');
        }}
      />

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenBooking={() => setIsBookingOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
