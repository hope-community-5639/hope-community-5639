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
  const { currentUser, isClient, isStaff, isAdmin } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>('individual-counseling');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [legalPage, setLegalPage] = useState<'privacy' | 'hipaa' | 'terms' | 'accessibility' | 'nondiscrimination'>('privacy');

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
          } else if (role === 'staff_provider' || role === 'staff_intake') {
            setCurrentView('staff_portal');
          } else if (role === 'admin') {
            setCurrentView('admin_portal');
          } else {
            setCurrentView('home');
          }
        }}
      />

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
            onNavigate={handleNavigate}
            onOpenBooking={() => setIsBookingOpen(true)}
            onSelectService={handleServiceSelect}
          />
        )}

        {currentView === 'about' && <AboutPage onNavigate={handleNavigate} />}

        {(currentView === 'services' || currentView === 'services_overview') && (
          <ServicesOverviewPage
            onSelectService={handleServiceSelect}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'service_detail' && (
          <ServiceDetailPage
            serviceSlug={selectedServiceSlug}
            onNavigate={handleNavigate}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'process' && (
          <ProcessPage
            onNavigate={handleNavigate}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'team' && (
          <TeamPage
            onNavigate={handleNavigate}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'locations' && (
          <LocationsPage
            onNavigate={handleNavigate}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'resources' && (
          <ResourcesPage
            onNavigate={handleNavigate}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentView === 'careers' && (
          <CareersPage onNavigate={handleNavigate} />
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
      <Footer onNavigate={handleNavigate} />
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
