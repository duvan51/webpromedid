
import React from 'react';
import { ELITE_SERVICES } from '../constants/services';

interface ServicesProps {
  onServiceSelect: (id: string) => void;
  onShowAll: () => void;
}

const Services: React.FC<ServicesProps> = ({ onServiceSelect, onShowAll }) => {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Nuestros Pilares</h2>
        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Servicios de Élite para su Salud</h3>
        <p className="text-lg text-slate-600">
          En PROMEDID combinamos ciencia y naturaleza para ofrecerle resultados tangibles en su proceso de curación.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {ELITE_SERVICES.slice(0, 3).map((service) => (
          <div
            key={service.id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            onClick={() => onServiceSelect(service.id)}
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={service.imageUrl}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100 backdrop-blur-sm shadow-lg text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-8">
              <p className="text-sm font-bold text-emerald-600 mb-2 uppercase tracking-wide">{service.subtitle}</p>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h4>
              <p className="text-slate-500 mb-8 leading-relaxed line-clamp-3">
                {service.heroDescription}
              </p>
              <button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceSelect(service.id);
                }}
              >
                Ver Detalles y Beneficios
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onShowAll}
          className="inline-flex items-center gap-2 bg-white text-emerald-700 border-2 border-emerald-100 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-100/20 group"
        >
          Ver Todos los Servicios
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Services;
