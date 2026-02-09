
import React, { useState } from 'react';

const locations = [
  { id: 'bogota-norte', city: 'Bogotá', name: 'Sede Norte', address: 'Calle 127 #15-31', phone: '+57 (601) 345 6789' },
  { id: 'bogota-sur', city: 'Bogotá', name: 'Sede Salitre', address: 'Av. Esperanza #68-45', phone: '+57 (601) 789 0123' },
  { id: 'medellin', city: 'Medellín', name: 'Sede El Poblado', address: 'Carrera 43A #1-50', phone: '+57 (604) 234 5678' },
  { id: 'cali', city: 'Cali', name: 'Sede Pance', address: 'Calle 18 #122-10', phone: '+57 (602) 456 7890' },
  { id: 'barranquilla', city: 'Barranquilla', name: 'Sede El Prado', address: 'Carrera 54 #72-101', phone: '+57 (605) 567 8901' },
  { id: 'pereira', city: 'Pereira', name: 'Sede Circunvalar', address: 'Av. Circunvalar #12-32', phone: '+57 (606) 678 9012' }
];

const Locations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Bogotá');
  const filteredLocations = locations.filter(loc => loc.city === activeTab);
  const cities = Array.from(new Set(locations.map(l => l.city)));

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center mb-16">
        <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Presencia Nacional</h2>
        <h3 className="text-4xl font-bold text-slate-900">Nuestras Sedes en Colombia</h3>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-12 min-h-[600px]">
        {/* Navigation */}
        <div className="lg:col-span-4 bg-emerald-50 p-8 border-r border-slate-100">
          <h4 className="text-xl font-bold text-emerald-900 mb-8">Seleccione su ciudad</h4>
          <div className="space-y-3">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setActiveTab(city)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between ${
                  activeTab === city 
                  ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-200/50 translate-x-2' 
                  : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                {city}
                {activeTab === city && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-emerald-100/50 rounded-2xl border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800 leading-relaxed">
              Estamos expandiéndonos continuamente para llevar salud integral a más rincones de Colombia.
            </p>
          </div>
        </div>

        {/* Details and Visual */}
        <div className="lg:col-span-8 p-8 md:p-12">
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {filteredLocations.map(loc => (
                  <div key={loc.id} className="p-8 rounded-3xl border-2 border-slate-50 hover:border-emerald-100 transition-colors group">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h5 className="text-xl font-bold text-slate-900 mb-2">{loc.name}</h5>
                    <p className="text-slate-500 mb-4">{loc.address}</p>
                    <p className="text-emerald-600 font-bold">{loc.phone}</p>
                    <button className="mt-6 text-sm font-bold text-emerald-600 border-b-2 border-emerald-100 hover:border-emerald-600 transition-all pb-1">
                      Ver en el mapa
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative rounded-[2rem] overflow-hidden h-48 md:h-64 shadow-inner">
               <img src={`https://picsum.photos/seed/${activeTab}/1200/400`} alt="City view" className="w-full h-full object-cover grayscale opacity-50 contrast-125" />
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-4xl md:text-6xl font-black text-white/40 uppercase tracking-widest select-none">{activeTab}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
