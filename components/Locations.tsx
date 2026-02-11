
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Location {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
  slots_total: number;
  slots_booked: number;
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('active', true)
      .order('city', { ascending: true });

    if (!error && data) {
      setLocations(data);
      if (data.length > 0) {
        setActiveTab(data[0].city);
      }
    }
    setLoading(false);
  };

  const filteredLocations = locations.filter(loc => loc.city === activeTab);
  const cities = Array.from(new Set(locations.map(l => l.city)));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between ${activeTab === city
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
                {filteredLocations.map(loc => {
                  const availableSlots = loc.slots_total - loc.slots_booked;
                  const isLowAvailability = (availableSlots / loc.slots_total) < 0.3;

                  return (
                    <div key={loc.id} className="p-8 rounded-3xl border-2 border-slate-50 hover:border-emerald-100 transition-colors group relative overflow-hidden">
                      {/* Alerta de Cupos */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isLowAvailability ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                        {availableSlots} Cupos Libres
                      </div>

                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h5 className="text-xl font-bold text-slate-900 mb-2">{loc.name}</h5>
                      <p className="text-slate-500 mb-4">{loc.address}</p>
                      <p className="text-emerald-600 font-bold mb-4">{loc.phone}</p>

                      <div className="flex items-center gap-2 mt-auto">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isLowAvailability ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${(loc.slots_booked / loc.slots_total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Agendando...</span>
                      </div>

                      <button className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all">
                        Ver en el mapa
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative rounded-[2rem] overflow-hidden h-48 md:h-64 shadow-inner mt-auto">
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
