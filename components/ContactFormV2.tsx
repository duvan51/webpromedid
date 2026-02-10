import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ContactFormV2Props {
    source?: string;
    buttonStyle?: React.CSSProperties;
    onSuccess?: () => void;
}

const ContactFormV2: React.FC<ContactFormV2Props> = ({ source = 'Landing Page', buttonStyle, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); // Solo números
        if (val.length <= 12) { // Límite razonable para WhatsApp incl. prefijo
            setFormData({ ...formData, phone: '+' + val });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const { error } = await supabase
                .from('leads') // Assuming there's a leads table or similar
                .insert([{
                    ...formData,
                    source,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            // Track conversion
            try {
                const sid = sessionStorage.getItem('promedid_sid') || 'unknown';
                await supabase.from('analytics_events').insert({
                    landing_id: window.location.hash.split('/')[1] || source,
                    event_type: 'click',
                    event_name: 'Lead Generated',
                    session_id: sid,
                    metadata: { source, email: formData.email }
                });
            } catch (trackErr) {
                console.warn('Analytics capture failed:', trackErr);
            }

            setStatus('success');
            setFormData({ name: '', phone: '', email: '', message: '' });
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error submitting form:', err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-emerald-50 p-8 rounded-3xl text-center border-2 border-emerald-100 animate-scale-in">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">¡Solicitud Enviada!</h3>
                <p className="text-slate-600 font-medium italic">En breve un especialista se pondrá en contacto contigo.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input
                    required
                    type="text"
                    className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej: Juan Pérez"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input
                        required
                        type="tel"
                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="+57..."
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                        required
                        type="email"
                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@correo.com"
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje (Opcional)</label>
                <textarea
                    rows={3}
                    className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="¿Alguna duda o inquietud?"
                />
            </div>
            <button
                disabled={status === 'loading'}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                style={buttonStyle}
            >
                {status === 'loading' ? 'Enviando...' : '🚀 Solicitar Valoración Gratuita'}
            </button>
            {status === 'error' && (
                <p className="text-red-500 text-xs text-center font-bold">Hubo un error. Inténtalo de nuevo o contáctanos por WhatsApp.</p>
            )}
        </form>
    );
};

export default ContactFormV2;
