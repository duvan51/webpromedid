
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { ELITE_SERVICES } from './constants/services';
import Services from './components/Services';
import TrustSection from './components/TrustSection';
import SpecializedTreatments from './components/SpecializedTreatments';
import Locations from './components/Locations';
import ContactForm from './components/ContactForm';
import ServicesPage from './components/ServicesPage';
import ServiceLanding from './components/ServiceLanding';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import BookingModal from './components/BookingModal';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'service-detail' | 'admin' | 'landing'>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [landingSlug, setLandingSlug] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    // Detect #admin in URL
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash.startsWith('#landing/')) {
        const slug = hash.replace('#landing/', '');
        setLandingSlug(slug);
        setCurrentView('landing');
      } else if (currentView === 'admin' || currentView === 'landing') {
        if (!hash || hash === '#home') {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleServiceSelect = (id: string) => {
    setSelectedServiceId(id);
    setCurrentView('service-detail');
  };

  const handleGoToServices = () => {
    setCurrentView('services');
    setSelectedServiceId(null);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedServiceId(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {currentView !== 'admin' && currentView !== 'landing' && (
        <Header
          onHomeClick={handleBackToHome}
          onServicesClick={handleGoToServices}
          onTreatmentsClick={handleGoToServices}
          onBookingClick={() => setIsBookingOpen(true)}
        />
      )}

      <main className="flex-grow">
        {currentView === 'admin' ? (
          <AdminDashboard />
        ) : currentView === 'landing' && landingSlug ? (
          <LandingPage slug={landingSlug} />
        ) : currentView === 'service-detail' && selectedServiceId ? (
          <ServiceLanding
            serviceId={selectedServiceId}
            onBack={() => setCurrentView('services')}
          />
        ) : currentView === 'services' ? (
          <ServicesPage
            onServiceSelect={handleServiceSelect}
            onBack={handleBackToHome}
          />
        ) : (
          <>
            <section id="home">
              <Hero
                onServiceSelect={handleServiceSelect}
                onTreatmentsClick={handleGoToServices}
              />
            </section>

            <section id="servicios">
              <Services
                onServiceSelect={handleServiceSelect}
                onShowAll={handleGoToServices}
              />
            </section>

            <TrustSection />

            <section id="tratamientos">
              <SpecializedTreatments
                onServiceSelect={handleServiceSelect}
                onShowAll={handleGoToServices}
              />
            </section>

            <section id="sedes">
              <Locations />
            </section>

            <section id="contacto" className="py-24 bg-white">
              <ContactForm />
            </section>
          </>
        )}
      </main>

      {currentView !== 'admin' && currentView !== 'landing' && (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default App;
