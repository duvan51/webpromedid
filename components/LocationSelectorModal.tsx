
import React from 'react';
import { LOCATIONS, Location, getWhatsAppLeadUrl } from '../utils/whatsapp';

interface LocationSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceTitle?: string;
}

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose, serviceTitle }) => {
    if (!isOpen) return null;

    const handleSelect = (location: Location) => {
        const url = getWhatsAppLeadUrl({ serviceTitle, location });
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>
            <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-scale-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Seleccione su Sede</h2>
                    <p className="text-slate-500 text-sm mt-2">Elija la ciudad más cercana para agendar su cita</p>
                </div>

                <div className="space-y-3">
                    {LOCATIONS.map((location) => (
                        <button
                            key={location}
                            onClick={() => handleSelect(location)}
                            className="w-full py-4 px-6 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-2xl font-bold text-slate-700 transition-all flex items-center justify-between group"
                        >
                            {location}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default LocationSelectorModal;
