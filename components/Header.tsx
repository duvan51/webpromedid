
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onHomeClick: () => void;
  onServicesClick: () => void;
  onTreatmentsClick: () => void;
  onBookingClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onServicesClick, onTreatmentsClick, onBookingClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#home', action: onHomeClick },
    { name: 'Servicios', href: '#servicios', action: onServicesClick },
    { name: 'Tratamientos', href: '#tratamientos', action: onTreatmentsClick },
    { name: 'Por qué PROMEDID', href: '#confianza' },
    { name: 'Sedes', href: '#sedes' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">P</div>
          <span className="text-2xl font-bold tracking-tight text-emerald-900">PROMEDID</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                if (link.name === 'Inicio' || link.name === 'Servicios' || link.name === 'Tratamientos') {
                  e.preventDefault();
                  link.action?.();
                }
              }}
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <button
          onClick={onBookingClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          Agenda Cita
        </button>
      </div>
    </header>
  );
};

export default Header;
