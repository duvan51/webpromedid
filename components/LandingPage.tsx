import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ContactFormV2 from './ContactFormV2';

interface LandingPageProps {
    slug?: string;
    previewData?: any;
}

const LandingPage: React.FC<LandingPageProps> = ({ slug, previewData }) => {
    const [landing, setLanding] = useState<any>(null);
    const [ctaItem, setCtaItem] = useState<any>(null);
    const [loading, setLoading] = useState(!previewData);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (previewData) {
            setLanding(previewData);
            setLoading(false);
            return;
        }

        const fetchLanding = async () => {
            if (!slug) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('landings')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (!error && data) {
                // Initialize default config if fields are missing
                const config = {
                    hero: { subtitle: '', imageUrl: '', ...data.config?.hero },
                    pas: {
                        problem1: '¿Sientes que tu energía no es la misma de antes?',
                        problem2: '¿El estrés diario afecta tu rendimiento y descanso?',
                        problem3: '¿Buscas una solución efectiva y profesional?',
                        ...data.config?.pas
                    },
                    benefits: data.config?.benefits || [],
                    solutions: data.config?.solutions || [
                        { title: 'Tecnología de Vanguardia', text: 'Usamos equipos de última generación para diagnósticos precisos.', image: 'https://images.unsplash.com/photo-1576091160550-217359f49a4c?auto=format&fit=crop&q=80&w=800' },
                        { title: 'Atención Personalizada', text: 'Cada paciente es único. Diseñamos planes a tu medida.', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800' }
                    ],
                    socialProof: {
                        testimonials: [
                            { name: 'Andrea M.', text: 'Excelente atención, los resultados se notan desde la primera sesión.' },
                            { name: 'Ricardo G.', text: 'El equipo médico es muy profesional y las instalaciones son impecables.' }
                        ],
                        logos: [
                            'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_de_la_Organizaci%C3%B3n_Mundial_de_la_Salud.svg',
                            'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' // Placeholder logos
                        ],
                        ...data.config?.socialProof
                    },
                    cta: { id: '', urgencyText: '⚠️ Quedan pocos cupos para esta semana', ...data.config?.cta },
                    visibility: {
                        hero: true,
                        pas: true,
                        solutions: true,
                        socialProof: true,
                        cta: true,
                        footer: true,
                        whatsapp: true,
                        ...data.config?.visibility
                    }
                };

                const enrichedLanding = { ...data, config };
                setLanding(enrichedLanding);

                // Fetch CTA Item
                if (config.cta.id) {
                    const isBundle = config.cta.id.toString().length > 10;
                    const table = isBundle ? 'bundles' : 'treatments';
                    const { data: itemData } = await supabase
                        .from(table)
                        .select('*')
                        .eq('id', config.cta.id)
                        .single();
                    setCtaItem(itemData);
                }
            }
            setLoading(false);
        };

        fetchLanding();
    }, [slug, previewData]);

    const handleWhatsApp = () => {
        const number = landing.config?.whatsapp_number || '573112345678';
        const defaultMessage = `Hola! Vengo de la página ${landing?.title}. Quiero reservar mi cita.`;
        const message = landing.config?.whatsapp_message || defaultMessage;
        window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!landing) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
                <p className="text-slate-500 mb-8">Oferta no disponible.</p>
                <a href="/" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl">Volver al inicio</a>
            </div>
        );
    }

    const visibility = landing.config?.visibility || {
        hero: true, pas: true, solutions: true, socialProof: true, cta: true, footer: true, whatsapp: true
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* 1. Header Fijo */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">P</div>
                        <span className="font-black text-slate-900 tracking-tighter text-xl">PROMEDID</span>
                    </div>
                    <button
                        onClick={handleWhatsApp}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-black text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                        RESERVA AHORA
                    </button>
                </div>
            </header>

            {/* 2. Hero Section (60/40) */}
            {visibility.hero && (
                <section className="pt-24 pb-12 md:pt-48 md:pb-32 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
                            <div className="md:w-3/5 space-y-8 animate-fade-in-right">
                                <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    ✨ Medicina Integral Avanzada
                                </span>
                                <h1
                                    className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] md:leading-[1.05] tracking-tight"
                                    style={{
                                        fontSize: landing.config?.styles?.heroTitleSize || undefined,
                                        lineHeight: landing.config?.styles?.heroTitleSize ? '1.2' : undefined
                                    }}
                                >
                                    {landing.title}
                                </h1>
                                <p
                                    className="text-xl text-slate-500 leading-relaxed max-w-2xl"
                                    style={{ fontSize: landing.config?.styles?.heroSubtitleSize || undefined }}
                                >
                                    {landing.config?.hero?.subtitle}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button onClick={handleWhatsApp} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10">
                                        ¡Quiero mi Valoración!
                                    </button>
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">+1,500 personas atendidas</span>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-2/5 w-full animate-fade-in-left">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                                    <img
                                        src={landing.config?.hero?.imageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000'}
                                        className="relative rounded-[2.5rem] shadow-2xl border-4 md:border-8 border-white object-cover aspect-[4/5] w-full"
                                        alt="Hero"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Sección PAS (Agitación) */}
            {visibility.pas && (
                <section className="py-16 md:py-24 bg-white border-y border-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                            <h2
                                className="text-3xl md:text-5xl font-black text-slate-900"
                                style={{ fontSize: landing.config?.styles?.pasTitleSize || undefined }}
                            >
                                ¿Te sientes identificado con esto?
                            </h2>
                            <p className="text-slate-500 font-medium">Muchos de nuestros pacientes llegaban así antes de PROMEDID</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                landing.config?.pas?.problem1,
                                landing.config?.pas?.problem2,
                                landing.config?.pas?.problem3
                            ].map((p, i) => p && (
                                <div key={i} className="group p-10 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-slate-200 transition-all hover:bg-white hover:shadow-2xl">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:bg-red-50 group-hover:scale-110 transition-all">⚠️</div>
                                    <p
                                        className="text-lg font-bold text-slate-800 leading-snug"
                                        style={{ fontSize: landing.config?.styles?.pasProblemSize || undefined }}
                                    >
                                        {p}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Cuerpo de Beneficios (Alternancia) */}
            {visibility.solutions && landing.config?.solutions && (
                <section className="py-16 md:py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-6 space-y-32">
                        {landing.config.solutions.map((s: any, i: number) => (
                            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 lg:gap-24`}>
                                <div className="md:w-1/2 space-y-6">
                                    <div className="w-12 h-1.5 bg-emerald-500 rounded-full"></div>
                                    <h3
                                        className="text-3xl md:text-5xl font-black text-slate-900 leading-tight"
                                        style={{ fontSize: landing.config?.styles?.solutionTitleSize || undefined }}
                                    >
                                        {s.title}
                                    </h3>
                                    <p
                                        className="text-lg text-slate-500 leading-relaxed"
                                        style={{ fontSize: landing.config?.styles?.solutionTextSize || undefined }}
                                    >
                                        {s.text}
                                    </p>
                                    <ul className="space-y-3 pt-4">
                                        {['Especialistas Certificados', 'Tecnología no invasiva', 'Resultados garantizados'].map((t, idx) => (
                                            <li key={idx} className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                                                <span className="text-emerald-500">✓</span> {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="md:w-1/2 w-full">
                                    {s.image && (
                                        <img src={s.image} className="rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl w-full aspect-video object-cover" alt={s.title} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 5. Módulo de Prueba Social */}
            {visibility.socialProof && landing.config?.socialProof && (
                <section className="py-16 md:py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Lo que dicen nuestros pacientes</h2>
                            <div className="flex justify-center gap-1 text-amber-400 text-xl">★★★★★</div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                            {(landing.config.socialProof.testimonials || []).map((t: any, i: number) => (
                                <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm italic text-slate-600 relative">
                                    <div className="text-5xl text-slate-100 absolute top-6 right-8 font-serif leading-none">“</div>
                                    <p className="relative z-10 mb-6 font-medium leading-relaxed">"{t.text}"</p>
                                    <p className="not-italic font-black text-slate-900 text-sm">— {t.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-10 border-t border-slate-200">
                            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Nuestras Alianzas Médicas</p>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
                                {(landing.config.socialProof.logos || []).map((logo: string, i: number) => logo && (
                                    <img key={i} src={logo} className="h-8 md:h-12 w-auto" alt="Partner" />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. Sección de Cierre (Hard Sell) */}
            {visibility.cta && (
                <section id="cta-section" className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)] pointer-events-none"></div>
                    <div className="container mx-auto px-6 text-center max-w-4xl relative z-10 space-y-10">
                        <div className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-full inline-block font-black text-xs tracking-widest uppercase">
                            {landing.config?.cta?.urgencyText}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black leading-tight">¿Listo para transformar tu bienestar?</h2>
                        <p className="text-slate-400 text-xl font-medium">Solicita tu valoración inicial hoy y comienza tu camino a una vida más saludable.</p>

                        <div className="grid md:grid-cols-2 gap-12 text-left bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-white/5 backdrop-blur-sm">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black">Tu camino inicia aquí</h3>
                                <p className="text-slate-400 font-medium">Completa tus datos y un especialista te contactará en menos de 24 horas hábiles.</p>
                                <div className="flex flex-col gap-4 text-sm font-bold opacity-70">
                                    <span>✓ Consulta 100% personalizada</span>
                                    <span>✓ Sin compromiso de permanencia</span>
                                    <span>✓ Protocolos médicos certificados</span>
                                </div>
                            </div>
                            <ContactFormV2 source={landing.title} />
                        </div>
                    </div>
                </section>
            )}

            {/* 7. Footer Técnico */}
            {visibility.footer && (
                <footer className="bg-white pt-16 md:pt-24 pb-12 border-t border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-4 gap-12 mb-20">
                            <div className="space-y-6 col-span-1 md:col-span-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">P</div>
                                    <span className="font-black text-slate-900 tracking-tighter">PROMEDID</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">Medicina Integral Avanzada al servicio de tu bienestar. Ubicados en el corazón de la ciudad.</p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Ubicación</h4>
                                <div className="text-sm text-slate-500 font-medium space-y-2">
                                    <p>Edificio ICONO, Piso 4</p>
                                    <p>Consultorio 402 - 403</p>
                                    <p>Cúcuta, Norte de Santander</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Contacto</h4>
                                <div className="text-sm text-slate-500 font-medium space-y-2">
                                    <p>+57 311 234 5678</p>
                                    <p>contacto@promedid.com</p>
                                    <p>Lun - Sáb: 8:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Legales</h4>
                                <div className="text-sm text-slate-500 font-medium space-y-2">
                                    <p className="hover:text-emerald-600 cursor-pointer">Términos y Condiciones</p>
                                    <p className="hover:text-emerald-600 cursor-pointer">Protección de Datos</p>
                                    <p className="hover:text-emerald-600 cursor-pointer">Protocolos COVID-19</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-12 border-t border-slate-50 text-center space-y-4">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">© 2026 PROMEDID MEDICINA INTEGRAL SAS - VIGILADO MINSALUD</p>
                        </div>
                    </div>
                </footer>
            )}

            {/* 8. WhatsApp Flotante */}
            {visibility.whatsapp && (
                <button
                    onClick={handleWhatsApp}
                    className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white w-16 h-16 rounded-full shadow-[0_20px_50px_rgba(37,211,102,0.3)] flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all group"
                >
                    <div className="absolute -top-12 right-0 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                        ¡Hablemos por WhatsApp! 👋
                    </div>
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.52.9 3.397 1.378 5.307 1.379 5.454 0 9.893-4.439 9.893-9.892 0-2.614-1.033-5.074-2.907-6.948-1.874-1.874-4.324-2.905-6.94-2.905-5.45 0-9.89 4.439-9.89 9.89 0 2.023.533 3.96 1.543 5.672l-1.011 3.705 3.82-1.002z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default LandingPage;
