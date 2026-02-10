import React, { useState, useEffect } from 'react';
import { useServices } from '../hooks/useServices';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../utils/cloudinary';
import LandingPage from './LandingPage';

type AdminTab = 'products' | 'offers' | 'packages' | 'landings' | 'media' | 'analytics' | 'widgets';

const ImageUploader: React.FC<{ value: string; onChange: (url: string) => void; label?: string; onOpenLibrary?: () => void }> = ({ value, onChange, label, onOpenLibrary }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await (window as any).uploadImageToLibrary(file);
            onChange(url);
        } catch (err: any) {
            alert('Error al subir imagen: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500">{label || 'Imagen'}</label>
                {onOpenLibrary && (
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className="text-emerald-600 font-black text-[10px] uppercase hover:underline"
                    >
                        Biblioteca 🖼️
                    </button>
                )}
            </div>
            <div className="flex gap-4 items-center">
                <div className="relative group w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0">
                    {value ? (
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-300 text-2xl">🖼️</span>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        </div>
                    )}
                </div>
                <div className="flex-grow space-y-2">
                    <input
                        type="text"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full bg-slate-50 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none transition-all text-[10px] font-mono"
                        placeholder="URL de la imagen..."
                    />
                    <label className="inline-block cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                        <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}>
                            {isUploading ? 'Subiendo...' : '📂 Subir Archivo'}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

const ResponsiveAlignmentToggle: React.FC<{
    value: any;
    onChange: (val: any) => void;
    label?: string;
}> = ({ value, onChange, label }) => {
    const options = [
        { id: 'left', icon: '⬅️' },
        { id: 'center', icon: '↔️' },
        { id: 'right', icon: '➡️' }
    ];

    const getVal = (device: 'mobile' | 'desktop') => {
        if (typeof value === 'object') return value[device] || 'left';
        return value || 'left';
    };

    const setVal = (device: 'mobile' | 'desktop', id: string) => {
        const current = typeof value === 'object' ? value : { mobile: value || 'left', desktop: value || 'left' };
        onChange({ ...current, [device]: id });
    };

    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>}
            <div className="flex items-center gap-3">
                {/* Mobile */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <span className="text-[10px] self-center mx-1.5">📱</span>
                    {options.map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setVal('mobile', opt.id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${getVal('mobile') === opt.id ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <span className="text-xs">{opt.icon}</span>
                        </button>
                    ))}
                </div>
                {/* Desktop */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <span className="text-[10px] self-center mx-1.5">💻</span>
                    {options.map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setVal('desktop', opt.id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${getVal('desktop') === opt.id ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <span className="text-xs">{opt.icon}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const { treatments, loading, refetch } = useServices();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>('products');
    const [editingService, setEditingService] = useState<any>(null);
    const [editingBundle, setEditingBundle] = useState<any>(null);
    const [bundles, setBundles] = useState<any[]>([]);
    const [editingLanding, setEditingLanding] = useState<any>(null);
    const [landings, setLandings] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
    const [media, setMedia] = useState<any[]>([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [onMediaSelect, setOnMediaSelect] = useState<(url: string) => void>(() => () => { });
    const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
    const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
    const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

    useEffect(() => {
        const savedSession = localStorage.getItem('promedid_admin_session');
        if (savedSession === 'active') {
            setIsLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            refetch();
            fetchBundles();
            fetchLandings();
            fetchMedia();
        }
    }, [isLoggedIn]);

    // Expose upload function for ImageUploader
    (window as any).uploadImageToLibrary = async (file: File) => {
        const url = await uploadImage(file);
        // Register in media table
        const { error } = await supabase.from('media').insert({
            url,
            type: 'image',
            public_id: `manual_${Date.now()}`,
            name: file.name
        });
        if (!error) fetchMedia();
        return url;
    };

    const fetchMedia = async () => {
        const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
        if (!error && data) setMedia(data);
    };

    const handleDeleteMedia = async (id: string, publicId: string) => {
        const confirmDelete = confirm(
            "⚠️ ¿ESTÁS SEGURO?\n\nEsta acción eliminará el archivo PERMANENTEMENTE de tu biblioteca de Promedid y de los servidores de Cloudinary."
        );

        if (!confirmDelete) return;

        try {
            // 1. Delete from Cloudinary Directly (Frontend)
            const cloudName = "dlkky5xuo";
            const apiKey = "729758187275154";
            const apiSecret = "0OPoy3ZA3E2QYiQ9HSZNlRQjNnc";
            const timestamp = Math.round(new Date().getTime() / 1000).toString();

            // Generate Signature using Crypto-js (added to index.html)
            const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
            const signature = (window as any).CryptoJS.SHA1(stringToSign).toString();

            const formData = new FormData();
            formData.set('public_id', publicId);
            formData.set('timestamp', timestamp);
            formData.set('api_key', apiKey);
            formData.set('signature', signature);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                method: 'POST',
                body: formData
            });

            const cloudResult = await response.json();

            if (cloudResult.result !== 'ok' && cloudResult.result !== 'not found') {
                console.warn('Cloudinary Sync Warning:', cloudResult);
            }

            // 2. Delete from supabase
            const { error } = await supabase.from('media').delete().eq('id', id);
            if (!error) {
                fetchMedia();
            } else {
                throw error;
            }
        } catch (err: any) {
            alert('Error en la eliminación: ' + err.message);
            console.error(err);
        }
    };

    const fetchLandings = async () => {
        const { data, error } = await supabase.from('landings').select('*').order('created_at', { ascending: false });
        if (!error && data) setLandings(data);
    };

    const fetchBundles = async () => {
        const { data, error } = await supabase.from('bundles').select('*').order('created_at', { ascending: false });
        if (!error && data) setBundles(data);
    };

    const fetchAnalytics = async () => {
        setIsFetchingAnalytics(true);
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);
        if (!error && data) setAnalyticsEvents(data);
        setIsFetchingAnalytics(false);
    };

    useEffect(() => {
        if (activeTab === 'analytics') fetchAnalytics();
    }, [activeTab]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'Promedid2026*') {
            setIsLoggedIn(true);
            if (rememberMe) {
                localStorage.setItem('promedid_admin_session', 'active');
            }
            setError('');
        } else {
            setError('Contraseña incorrecta');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setPassword('');
        localStorage.removeItem('promedid_admin_session');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Determine if it's a new service or an update
            const { id, benefits, ...serviceData } = editingService;

            // 1. Save main service data
            const { error: serviceError } = await supabase
                .from('treatments')
                .upsert({
                    id,
                    ...serviceData,
                    image_url: serviceData.imageUrl // Map camelCase to snake_case
                });

            if (serviceError) throw serviceError;

            // 2. Handle benefits (Delete and Re-insert)
            if (benefits && Array.isArray(benefits)) {
                await supabase.from('treatment_benefits').delete().eq('treatment_id', id);

                const benefitsToInsert = benefits
                    .filter(b => b && b.trim() !== '')
                    .map(b => ({ treatment_id: id, benefit: b }));

                if (benefitsToInsert.length > 0) {
                    const { error: benefitsError } = await supabase
                        .from('treatment_benefits')
                        .insert(benefitsToInsert);
                    if (benefitsError) throw benefitsError;
                }
            }

            alert('Guardado correctamente en Supabase. Recargue para ver los cambios.');
            setEditingService(null);
        } catch (err: any) {
            alert('Error al guardar: ' + (err.message || 'Error de conexión'));
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este servicio? Esta acción no se puede deshacer.')) return;

        try {
            const { error } = await supabase.from('treatments').delete().eq('id', id);
            if (error) throw error;
            alert('Servicio eliminado correctamente.');
            window.location.reload(); // Refresh to show changes
        } catch (err: any) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    const handleMassDelete = async () => {
        if (!confirm(`¿Está seguro de eliminar ${selectedIds.length} servicios seleccionados?`)) return;

        try {
            const { error } = await supabase.from('treatments').delete().in('id', selectedIds);
            if (error) throw error;
            alert(`${selectedIds.length} servicios eliminados correctamente.`);
            setSelectedIds([]);
            window.location.reload();
        } catch (err: any) {
            alert('Error en eliminación masiva: ' + err.message);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const parsePrice = (priceStr: string): number => {
        if (!priceStr) return 0;
        const numeric = priceStr.replace(/[^0-9]/g, '');
        return parseInt(numeric) || 0;
    };

    const formatPrice = (val: number): string => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    const handleSaveBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('bundles').upsert({
                id: editingBundle.id.toString().startsWith('nuevo') ? undefined : editingBundle.id,
                title: editingBundle.title,
                description: editingBundle.description,
                original_total: editingBundle.original_total,
                bundle_price: editingBundle.bundle_price,
                items: editingBundle.items,
                expiry_date: editingBundle.expiry_date || null
            });

            if (error) throw error;
            alert('Paquete guardado correctamente');
            setEditingBundle(null);
            fetchBundles();
        } catch (err: any) {
            alert('Error al guardar paquete: ' + err.message);
        }
    };

    const handleSaveLanding = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('landings').upsert({
                id: editingLanding.id.toString().startsWith('nuevo') ? undefined : editingLanding.id,
                slug: editingLanding.slug,
                title: editingLanding.title,
                description: editingLanding.description,
                config: editingLanding.config,
                is_active: editingLanding.is_active
            });

            if (error) throw error;
            alert('Landing page guardada correctamente');
            setEditingLanding(null);
            fetchLandings();
        } catch (err: any) {
            alert('Error al guardar landing: ' + err.message);
        }
    };

    const handleDeleteLanding = async (id: string) => {
        if (!confirm('¿Eliminar esta landing page?')) return;
        const { error } = await supabase.from('landings').delete().eq('id', id);
        if (!error) fetchLandings();
    };

    const handleDeleteBundle = async (id: string) => {
        if (!confirm('¿Eliminar este paquete?')) return;
        const { error } = await supabase.from('bundles').delete().eq('id', id);
        if (!error) fetchBundles();
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-full-lg shadow-2xl w-full max-w-md animate-scale-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">P</div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin PROMEDID</h1>
                        <p className="text-slate-500 text-sm font-medium">Panel de Gestión Centralizada</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 ml-1">CONTRASEÑA MAESTRA</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none rounded-2xl transition-all font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-1">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="rememberMe" className="text-xs font-bold text-slate-500 cursor-pointer">Recordarme en este equipo</label>
                        </div>
                        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                        <button className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                            Acceder al Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const SidebarItem = ({ id, label, icon }: { id: AdminTab, label: string, icon: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600-20'
                : 'text-slate-500 hover:bg-slate-100'
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="text-sm">{label}</span>
            {activeTab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 flex-shrink-0 relative z-20">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">P</div>
                    <div>
                        <h2 className="font-bold text-slate-900 leading-none">PROMEDID</h2>
                        <p className="text-tiny text-emerald-600 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-grow space-y-2">
                    <SidebarItem id="products" label="Productos / Servicios" icon="📦" />
                    <SidebarItem id="offers" label="Ofertas Flash" icon="⚡" />
                    <SidebarItem id="packages" label="Paquetes / Bundles" icon="🎁" />
                    <SidebarItem id="landings" label="Páginas de Venta" icon="🚀" />
                    <SidebarItem id="media" label="Biblioteca" icon="🖼️" />
                    <SidebarItem id="analytics" label="Estadísticas" icon="📊" />
                    <SidebarItem id="widgets" label="Widgets" icon="🛠️" />
                </nav>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-auto"
                >
                    <span className="text-xl">🚪</span>
                    <span className="text-sm">Cerrar Sesión</span>
                </button>

                <div className="pt-6 border-t border-slate-100">
                    <button
                        onClick={() => window.location.hash = ''}
                        className="w-full flex items-center gap-3 px-6 py-4 text-slate-400 hover:text-red-500 font-bold transition-all text-sm"
                    >
                        <span>🚪</span> Salir del Panel
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-grow overflow-y-auto h-screen bg-slate-50-50">
                <header className="bg-white-80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {activeTab === 'products' && 'Gestión de Productos'}
                            {activeTab === 'offers' && 'Ofertas y Descuentos'}
                            {activeTab === 'packages' && 'Paquetes de Valoración'}
                            {activeTab === 'landings' && 'Embudos de Venta (Landings)'}
                            {activeTab === 'media' && 'Biblioteca de Medios'}
                            {activeTab === 'widgets' && 'Configuración de Widgets'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{activeTab} management system</p>
                    </div>

                    {activeTab === 'products' && (
                        <button
                            onClick={() => setEditingService({ id: 'nuevo-' + Date.now(), title: '', category: 'Sueroterapia', benefits: [] })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600-20 transition-all flex items-center gap-2"
                        >
                            <span>+</span> Nuevo Producto
                        </button>
                    )}
                </header>

                <div className="p-8 pb-32">
                    {activeTab === 'products' && (
                        <div className="grid gap-4 animate-fade-in">
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                treatments.map((t) => (
                                    <div key={t.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all flex items-center justify-between group ${selectedIds.includes(t.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-300'}`}>
                                        <div className="flex items-center gap-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(t.id)}
                                                onChange={() => toggleSelection(t.id)}
                                                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                <img src={t.imageUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{t.title}</h3>
                                                <div className="flex gap-3 text-tiny mt-1">
                                                    <span className="text-emerald-600 font-bold uppercase">{t.category}</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-slate-900 font-bold">{t.price}</span>
                                                    {t.discount && <span className="bg-amber-100 text-amber-700 px-2 rounded-full font-bold">SALE -{t.discount}</span>}
                                                    {t.packagePrice && <span className="text-slate-400 font-medium">📦 {t.packagePrice}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingService(t)}
                                                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="px-4 py-2 bg-white text-red-500 border border-red-100 text-xs font-bold rounded-lg hover:bg-red-50 transition-all"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Mass Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 z-50 animate-bounce-in">
                            <span className="font-bold text-sm">{selectedIds.length} ítems seleccionados</span>
                            <div className="w-px h-6 bg-slate-700"></div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="text-xs font-bold hover:text-emerald-400 transition-colors"
                                >
                                    Deseleccionar
                                </button>
                                <button
                                    onClick={handleMassDelete}
                                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Eliminar en masa
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'offers' && (
                        <div className="animate-fade-in py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">Próximamente: Panel de Campañas y Descuentos Temporales</p>
                        </div>
                    )}

                    {activeTab === 'packages' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900">Paquetes Disponibles ({bundles.length})</h3>
                                <button
                                    onClick={() => setEditingBundle({ id: 'nuevo-' + Date.now(), title: '', description: '', original_total: '$0', bundle_price: '', items: [], expiry_date: '' })}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                                >
                                    + Crear Nuevo Paquete
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bundles.map(b => (
                                    <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">🎁</div>
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${b.expiry_date ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {b.expiry_date ? `Vence: ${new Date(b.expiry_date).toLocaleDateString()}` : 'Indefinido'}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-lg mb-1">{b.title}</h4>

                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {b.items?.map((item: any) => {
                                                    const prod = treatments.find(p => p.id === item.id);
                                                    return (
                                                        <span key={item.id} className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-bold">
                                                            {item.quantity}x {prod?.title || 'Servicio'}
                                                        </span>
                                                    );
                                                })}
                                            </div>

                                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{b.description}</p>

                                            <div className="space-y-2 mt-4">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-400">Suma Normal</span>
                                                    <span className="text-slate-400 line-through">{b.original_total}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-900 uppercase">Oferta</span>
                                                    <span className="text-xl font-black text-emerald-600">{b.bundle_price}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-8 pt-4 border-t border-slate-50">
                                            <button onClick={() => setEditingBundle(b)} className="flex-1 py-3 text-xs font-bold bg-slate-900 text-white rounded-xl">Editar</button>
                                            <button onClick={() => handleDeleteBundle(b.id)} className="px-3 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {bundles.length === 0 && (
                                <div className="py-20 text-center bg-white rounded-4xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium italic">No hay paquetes configurados actualmente</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'landings' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900">Embudos Activos ({landings.length})</h3>
                                    {/* Campaign Shortcuts */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campañas:</p>
                                        <button
                                            onClick={() => window.open(window.location.origin + window.location.pathname + '#landing/landing-ventas-campanha', '_blank')}
                                            className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                                        >
                                            🚀 Alternativa Salud (Live)
                                        </button>
                                        <button
                                            onClick={() => {
                                                const campaign = landings.find((l: any) => l.slug === 'landing-ventas-campanha');
                                                if (campaign) setEditingLanding(campaign);
                                                else alert('Campaña no encontrada en la base de datos. Asegúrate de haber corrido el SQL.');
                                            }}
                                            className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
                                        >
                                            🛠️ Editar Campaña
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditingLanding({
                                        id: 'nuevo-' + Date.now(),
                                        slug: 'oferta-especial-' + Math.floor(Math.random() * 1000),
                                        title: '',
                                        description: '',
                                        is_active: true,
                                        config: {
                                            hero: { title: '', subtitle: '', imageUrl: '' },
                                            pas: { problem1: '', problem2: '', problem3: '' },
                                            benefits: ['', '', ''],
                                            solutions: [
                                                { title: '', text: '', image: '' }
                                            ],
                                            socialProof: {
                                                testimonials: [{ name: '', text: '' }],
                                                logos: ['', '']
                                            },
                                            cta: { type: 'service', id: '', urgencyText: '⚠️ Últimos cupos disponibles' }
                                        }
                                    })}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20"
                                >
                                    + Crear Nuevo Embudo
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {landings.map(l => (
                                    <div key={l.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">🚀</div>
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${l.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {l.is_active ? 'En Línea' : 'Borrador'}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-lg mb-1">{l.title || 'Landing sin título'}</h4>
                                            <p className="text-emerald-600 text-xs font-mono font-bold mb-4">#landing/{l.slug}</p>

                                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{l.description}</p>
                                        </div>

                                        <div className="flex gap-2 mt-8 pt-4 border-t border-slate-50">
                                            <button
                                                onClick={() => setEditingLanding(l)}
                                                className="flex-1 py-3 text-xs font-bold bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                                            >
                                                Editar Diseño
                                            </button>
                                            <button
                                                onClick={() => window.open(`/#landing/${l.slug}`, '_blank')}
                                                className="px-4 py-3 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLanding(l.id)}
                                                className="px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {landings.length === 0 && (
                                <div className="py-20 text-center bg-white rounded-4xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium italic">No has creado ningún embudo de venta todavía</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'widgets' && (
                        <div className="animate-fade-in py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">Próximamente: Personalización de Botón de WhatsApp y Popups</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Unified Edit Modal */}
            {editingService && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900-60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingService(null)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-full-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Editar Detalle</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configuración técnica</p>
                            </div>
                            <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-900">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">ID Único (no editable)</label>
                                    <input type="text" readOnly value={editingService.id} className="w-full bg-slate-50 p-4 rounded-2xl text-slate-400 border-none outline-none font-mono text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingService.title}
                                        onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Categoría</label>
                                    <select
                                        value={editingService.category}
                                        onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none"
                                    >
                                        <option>Diagnóstico</option>
                                        <option>Sueroterapia</option>
                                        <option>Terapias</option>
                                        <option>Estética</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Precio Público</label>
                                    <input
                                        type="text"
                                        value={editingService.price}
                                        onChange={e => setEditingService({ ...editingService, price: e.target.value })}
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                        placeholder="ej: $190.000"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Precio Paquete (ej: x4 o x8)</label>
                                    <input
                                        type="text"
                                        value={editingService.packagePrice || ''}
                                        onChange={e => setEditingService({ ...editingService, packagePrice: e.target.value })}
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                        placeholder="ej: Paquete x4: $680.000"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Descuento (ej: 20%)</label>
                                    <input
                                        type="text"
                                        value={editingService.discount || ''}
                                        onChange={e => setEditingService({ ...editingService, discount: e.target.value })}
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-emerald-600 font-bold"
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Etiqueta de Búsqueda</label>
                                    <input
                                        type="text"
                                        value={editingService.tag}
                                        onChange={e => setEditingService({ ...editingService, tag: e.target.value })}
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                        placeholder="ej: Cardiovascular"
                                    />
                                </div>
                            </div>

                            <ImageUploader
                                label="Imagen del Servicio (Vista previa)"
                                value={editingService.imageUrl}
                                onChange={url => setEditingService({ ...editingService, imageUrl: url })}
                            />

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">Descripción Breve</label>
                                <textarea
                                    rows={3}
                                    value={editingService.description}
                                    onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                    className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingService(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-600-20 transition-all active:scale-[0.98]"
                                >
                                    Actualizar DB
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleDelete(editingService.id);
                                        setEditingService(null);
                                    }}
                                    className="flex-1 py-4 bg-white text-red-500 border-2 border-red-50 rounded-2xl font-bold hover:bg-red-50 transition-all"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Bundle Builder Modal */}
            {editingBundle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingBundle(null)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="flex justify-between items-start mb-8 border-b pb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Constructor de Paquetes Oferta</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Seleccione servicios y configure el descuento</p>
                            </div>
                            <button onClick={() => setEditingBundle(null)} className="text-slate-400 hover:text-slate-900 text-2xl">✕</button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Left: Selection */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase">1. Seleccionar Servicios y Cantidades</h3>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {treatments.map(t => {
                                        const item = editingBundle.items.find((i: any) => i.id === t.id);
                                        const isSelected = !!item;

                                        const updateStats = (newItems: any[]) => {
                                            const total = newItems.reduce((sum: number, it: any) => {
                                                const prod = treatments.find(p => p.id === it.id);
                                                return sum + (parsePrice(prod?.price || '0') * it.quantity);
                                            }, 0);
                                            setEditingBundle({ ...editingBundle, items: newItems, original_total: formatPrice(total) });
                                        };

                                        return (
                                            <div key={t.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        const newItems = isSelected
                                                            ? editingBundle.items.filter((i: any) => i.id !== t.id)
                                                            : [...editingBundle.items, { id: t.id, quantity: 1 }];
                                                        updateStats(newItems);
                                                    }}
                                                />
                                                <div className="flex-grow">
                                                    <p className="font-bold text-sm text-slate-900">{t.title}</p>
                                                    <p className="text-xs text-slate-500">{t.price}</p>
                                                </div>

                                                {isSelected && (
                                                    <div className="flex items-center gap-2 bg-white rounded-xl border border-emerald-100 p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newItems = editingBundle.items.map((i: any) =>
                                                                    i.id === t.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
                                                                );
                                                                updateStats(newItems);
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 font-bold"
                                                        >-</button>
                                                        <span className="w-6 text-center text-sm font-black text-emerald-600">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newItems = editingBundle.items.map((i: any) =>
                                                                    i.id === t.id ? { ...i, quantity: i.quantity + 1 } : i
                                                                );
                                                                updateStats(newItems);
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-emerald-600 font-bold"
                                                        >+</button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Details & Summary */}
                            <form onSubmit={handleSaveBundle} className="space-y-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase">2. Configurar Oferta</h3>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 ml-1">Título del Paquete</label>
                                        <input
                                            required
                                            className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                            value={editingBundle.title}
                                            onChange={e => setEditingBundle({ ...editingBundle, title: e.target.value })}
                                            placeholder="ej: Combo Bienestar Integral"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 p-4 bg-slate-900 rounded-2xl text-white">
                                            <label className="text-[10px] font-black uppercase text-emerald-400">Suma Individual</label>
                                            <p className="text-xl font-black">{editingBundle.original_total}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500">Precio de Oferta</label>
                                            <input
                                                required
                                                className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-emerald-500 focus:bg-white outline-none transition-all font-black text-emerald-600 text-lg"
                                                value={editingBundle.bundle_price}
                                                onChange={e => setEditingBundle({ ...editingBundle, bundle_price: e.target.value })}
                                                placeholder="ej: $450.000"
                                            />
                                        </div>
                                    </div>

                                    {/* Calculator Stats */}
                                    {parsePrice(editingBundle.bundle_price) > 0 && parsePrice(editingBundle.original_total) > 0 && (
                                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-center justify-between animate-fade-in">
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ahorro Estimado</p>
                                                <p className="text-lg font-black text-emerald-900">
                                                    {formatPrice(parsePrice(editingBundle.original_total) - parsePrice(editingBundle.bundle_price))}
                                                </p>
                                            </div>
                                            <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-xl shadow-lg shadow-emerald-600/20">
                                                -{Math.round(((parsePrice(editingBundle.original_total) - parsePrice(editingBundle.bundle_price)) / parsePrice(editingBundle.original_total)) * 100)}%
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 ml-1">Fecha de Expiración (Opcional)</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                            value={editingBundle.expiry_date ? editingBundle.expiry_date.split('T')[0] : ''}
                                            onChange={e => setEditingBundle({ ...editingBundle, expiry_date: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 ml-1 uppercase">Dejar vacío para tiempo indeterminado</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 ml-1">Descripción corta</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none"
                                            value={editingBundle.description}
                                            onChange={e => setEditingBundle({ ...editingBundle, description: e.target.value })}
                                            placeholder="Describa qué incluye este paquete..."
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-emerald-600/30 transition-all active:scale-[0.98] mt-4">
                                    {editingBundle.id.startsWith('nuevo') ? 'Crear Paquete Oferta' : 'Guardar Cambios'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Landing Builder Modal */}
            {editingLanding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingLanding(null)}></div>
                    <div className="relative bg-[#F8FAFC] w-full max-w-[98vw] h-[95vh] rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-scale-in">
                        {/* Left: Editor Panel */}
                        <div className="md:w-1/2 h-full flex flex-col bg-white border-r">
                            <div className="p-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Diseñador Visual</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Modificando: {editingLanding.title || 'Nueva Landing'}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
                                        {[
                                            { id: 'mobile', icon: '📱', label: 'Móvil' },
                                            { id: 'tablet', icon: 'tablet', label: 'Tablet' }, // tablet is not an emoji, using 📱 for mobile and 💻 for desktop
                                            { id: 'desktop', icon: '💻', label: 'Escritorio' }
                                        ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setPreviewMode(mode.id as any)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${previewMode === mode.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <span>{mode.id === 'tablet' ? '📟' : mode.icon}</span>
                                                <span className="hidden lg:inline">{mode.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setEditingLanding(null)} className="px-6 py-3 bg-slate-100 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">Cancelar</button>
                                    <button onClick={handleSaveLanding} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10">Guardar Cambios</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-12">
                                {/* Visibility Controls */}
                                <section className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 px-2">👁️ Gestión de Secciones</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'hero', label: 'Impacto (Hero)' },
                                            { id: 'pas', label: 'Estructura PAS' },
                                            { id: 'solutions', label: 'Soluciones' },
                                            { id: 'socialProof', label: 'Prueba Social' },
                                            { id: 'cta', label: 'Formulario & CTA' },
                                            { id: 'footer', label: 'Footer Técnico' },
                                            { id: 'whatsapp', label: 'WhatsApp' },
                                        ].map(sec => (
                                            <button
                                                key={sec.id}
                                                type="button"
                                                onClick={() => setEditingLanding({
                                                    ...editingLanding,
                                                    config: {
                                                        ...editingLanding.config,
                                                        visibility: {
                                                            ...(editingLanding.config.visibility || {}),
                                                            [sec.id]: !(editingLanding.config.visibility?.[sec.id] ?? true)
                                                        }
                                                    }
                                                })}
                                                className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${editingLanding.config.visibility?.[sec.id] !== false
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-400 border-transparent grayscale'
                                                    }`}
                                            >
                                                {sec.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Common Settings */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest bg-emerald-50 text-emerald-600 p-2 rounded-lg inline-block">1. Ajustes Básicos y WhatsApp</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Título de la Oferta</label>
                                            <input
                                                className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold"
                                                value={editingLanding.title}
                                                onChange={e => setEditingLanding({ ...editingLanding, title: e.target.value })}
                                                placeholder="ej: Desintoxicación Iónica Pro"
                                            />
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Grandor Título:</span>
                                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                    <span className="text-[10px]">📱</span>
                                                    <input
                                                        type="text"
                                                        className="w-10 text-[9px] outline-none font-mono"
                                                        placeholder="2.25rem"
                                                        value={typeof editingLanding.config?.styles?.heroTitleSize === 'object' ? editingLanding.config.styles.heroTitleSize.mobile || '' : ''}
                                                        onChange={e => {
                                                            const current = typeof editingLanding.config?.styles?.heroTitleSize === 'object' ? editingLanding.config.styles.heroTitleSize : {};
                                                            setEditingLanding({
                                                                ...editingLanding,
                                                                config: {
                                                                    ...editingLanding.config,
                                                                    styles: {
                                                                        ...(editingLanding.config?.styles || {}),
                                                                        heroTitleSize: { ...current, mobile: e.target.value }
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                    <span className="text-[10px]">💻</span>
                                                    <input
                                                        type="text"
                                                        className="w-10 text-[9px] outline-none font-mono"
                                                        placeholder="4.5rem"
                                                        value={typeof editingLanding.config?.styles?.heroTitleSize === 'object' ? editingLanding.config.styles.heroTitleSize.desktop || '' : (typeof editingLanding.config?.styles?.heroTitleSize === 'string' ? editingLanding.config.styles.heroTitleSize : '')}
                                                        onChange={e => {
                                                            const current = typeof editingLanding.config?.styles?.heroTitleSize === 'object' ? editingLanding.config.styles.heroTitleSize : { desktop: typeof editingLanding.config?.styles?.heroTitleSize === 'string' ? editingLanding.config.styles.heroTitleSize : '' };
                                                            setEditingLanding({
                                                                ...editingLanding,
                                                                config: {
                                                                    ...editingLanding.config,
                                                                    styles: {
                                                                        ...(editingLanding.config?.styles || {}),
                                                                        heroTitleSize: { ...current, desktop: e.target.value }
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Slug (URL)</label>
                                            <input
                                                className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-mono text-xs"
                                                value={editingLanding.slug}
                                                onChange={e => setEditingLanding({ ...editingLanding, slug: e.target.value })}
                                                placeholder="ej: detox-ionica"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">WhatsApp Number</label>
                                            <input
                                                className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-xs"
                                                value={editingLanding.config.whatsapp_number || ''}
                                                onChange={e => setEditingLanding({
                                                    ...editingLanding,
                                                    config: { ...editingLanding.config, whatsapp_number: e.target.value }
                                                })}
                                                placeholder="573112345678"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">WhatsApp Lead Tracking Message</label>
                                            <input
                                                className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-xs"
                                                value={editingLanding.config.whatsapp_message || ''}
                                                onChange={e => setEditingLanding({
                                                    ...editingLanding,
                                                    config: { ...editingLanding.config, whatsapp_message: e.target.value }
                                                })}
                                                placeholder="Hola, vengo de la landing..."
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Hero Editor */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest bg-blue-50 text-blue-600 p-2 rounded-lg inline-block">2. Sección Hero (Impacto)</h3>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 ml-1">Subtítulo Hero</label>
                                        <textarea
                                            rows={2}
                                            className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none text-xs"
                                            value={editingLanding.config.hero.subtitle}
                                            onChange={e => setEditingLanding({
                                                ...editingLanding,
                                                config: { ...editingLanding.config, hero: { ...editingLanding.config.hero, subtitle: e.target.value } }
                                            })}
                                            placeholder="Breve texto que refuerce el título..."
                                        />
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Grandor Subtítulo:</span>
                                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                <span className="text-[10px]">📱</span>
                                                <input type="text" className="w-10 text-[9px] outline-none font-mono" placeholder="1.2rem" value={editingLanding.config?.styles?.heroSubtitleSize?.mobile || ''} onChange={e => setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, styles: { ...(editingLanding.config?.styles || {}), heroSubtitleSize: { ...(editingLanding.config?.styles?.heroSubtitleSize || {}), mobile: e.target.value } } } })} />
                                            </div>
                                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                <span className="text-[10px]">💻</span>
                                                <input type="text" className="w-10 text-[9px] outline-none font-mono" placeholder="1.5rem" value={editingLanding.config?.styles?.heroSubtitleSize?.desktop || ''} onChange={e => setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, styles: { ...(editingLanding.config?.styles || {}), heroSubtitleSize: { ...(editingLanding.config?.styles?.heroSubtitleSize || {}), desktop: e.target.value } } } })} />
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 flex items-center gap-4">
                                            <ResponsiveAlignmentToggle
                                                label="Alineación Hero"
                                                value={editingLanding.config?.styles?.heroAlignment}
                                                onChange={val => setEditingLanding({
                                                    ...editingLanding,
                                                    config: {
                                                        ...editingLanding.config,
                                                        styles: {
                                                            ...(editingLanding.config?.styles || {}),
                                                            heroAlignment: val
                                                        }
                                                    }
                                                })}
                                            />
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Botón Hero:</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                        <span className="text-[10px]">📱</span>
                                                        <input type="text" className="w-10 text-[9px] outline-none font-mono" placeholder="1.1rem" value={editingLanding.config?.styles?.heroButtonSize?.mobile || ''} onChange={e => setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, styles: { ...(editingLanding.config?.styles || {}), heroButtonSize: { ...(editingLanding.config?.styles?.heroButtonSize || {}), mobile: e.target.value } } } })} />
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                        <span className="text-[10px]">💻</span>
                                                        <input type="text" className="w-10 text-[9px] outline-none font-mono" placeholder="1.1rem" value={editingLanding.config?.styles?.heroButtonSize?.desktop || ''} onChange={e => setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, styles: { ...(editingLanding.config?.styles || {}), heroButtonSize: { ...(editingLanding.config?.styles?.heroButtonSize || {}), desktop: e.target.value } } } })} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ImageUploader
                                        label="Imagen de Fondo Hero"
                                        value={editingLanding.config.hero.imageUrl}
                                        onOpenLibrary={() => {
                                            setOnMediaSelect(() => (url: string) => {
                                                setEditingLanding((prev: any) => ({
                                                    ...prev,
                                                    config: { ...prev.config, hero: { ...prev.config.hero, imageUrl: url } }
                                                }));
                                            });
                                            setIsMediaModalOpen(true);
                                        }}
                                        onChange={url => setEditingLanding({
                                            ...editingLanding,
                                            config: { ...editingLanding.config, hero: { ...editingLanding.config.hero, imageUrl: url } }
                                        })}
                                    />
                                </section>

                                {/* PAS PAS PAS */}
                                <section className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest bg-red-50 text-red-600 p-2 rounded-lg inline-block">3. Estructura PAS (Agitación)</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Títulos:</span>
                                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                <span className="text-[10px]">📱</span>
                                                <input
                                                    type="text"
                                                    className="w-10 text-[9px] outline-none font-mono"
                                                    placeholder="1.8rem"
                                                    value={typeof editingLanding.config?.styles?.pasTitleSize === 'object' ? editingLanding.config.styles.pasTitleSize.mobile || '' : ''}
                                                    onChange={e => {
                                                        const current = typeof editingLanding.config?.styles?.pasTitleSize === 'object' ? editingLanding.config.styles.pasTitleSize : {};
                                                        setEditingLanding({
                                                            ...editingLanding,
                                                            config: {
                                                                ...editingLanding.config,
                                                                styles: {
                                                                    ...(editingLanding.config?.styles || {}),
                                                                    pasTitleSize: { ...current, mobile: e.target.value }
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                <span className="text-[10px]">💻</span>
                                                <input
                                                    type="text"
                                                    className="w-10 text-[9px] outline-none font-mono"
                                                    placeholder="3rem"
                                                    value={typeof editingLanding.config?.styles?.pasTitleSize === 'object' ? editingLanding.config.styles.pasTitleSize.desktop || '' : (typeof editingLanding.config?.styles?.pasTitleSize === 'string' ? editingLanding.config.styles.pasTitleSize : '')}
                                                    onChange={e => {
                                                        const current = typeof editingLanding.config?.styles?.pasTitleSize === 'object' ? editingLanding.config.styles.pasTitleSize : { desktop: typeof editingLanding.config?.styles?.pasTitleSize === 'string' ? editingLanding.config.styles.pasTitleSize : '' };
                                                        setEditingLanding({
                                                            ...editingLanding,
                                                            config: {
                                                                ...editingLanding.config,
                                                                styles: {
                                                                    ...(editingLanding.config?.styles || {}),
                                                                    pasTitleSize: { ...current, desktop: e.target.value }
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-1 pb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Grandor de los problemas:</span>
                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                            <span className="text-[10px]">📱</span>
                                            <input
                                                type="text"
                                                className="w-10 text-[9px] outline-none font-mono"
                                                placeholder="1.1rem"
                                                value={typeof editingLanding.config?.styles?.pasProblemSize === 'object' ? editingLanding.config.styles.pasProblemSize.mobile || '' : ''}
                                                onChange={e => {
                                                    const current = typeof editingLanding.config?.styles?.pasProblemSize === 'object' ? editingLanding.config.styles.pasProblemSize : {};
                                                    setEditingLanding({
                                                        ...editingLanding,
                                                        config: {
                                                            ...editingLanding.config,
                                                            styles: {
                                                                ...(editingLanding.config?.styles || {}),
                                                                pasProblemSize: { ...current, mobile: e.target.value }
                                                            }
                                                        }
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                            <span className="text-[10px]">💻</span>
                                            <input
                                                type="text"
                                                className="w-10 text-[9px] outline-none font-mono"
                                                placeholder="1.1rem"
                                                value={typeof editingLanding.config?.styles?.pasProblemSize === 'object' ? editingLanding.config.styles.pasProblemSize.desktop || '' : (typeof editingLanding.config?.styles?.pasProblemSize === 'string' ? editingLanding.config.styles.pasProblemSize : '')}
                                                onChange={e => {
                                                    const current = typeof editingLanding.config?.styles?.pasProblemSize === 'object' ? editingLanding.config.styles.pasProblemSize : { desktop: typeof editingLanding.config?.styles?.pasProblemSize === 'string' ? editingLanding.config.styles.pasProblemSize : '' };
                                                    setEditingLanding({
                                                        ...editingLanding,
                                                        config: {
                                                            ...editingLanding.config,
                                                            styles: {
                                                                ...(editingLanding.config?.styles || {}),
                                                                pasProblemSize: { ...current, desktop: e.target.value }
                                                            }
                                                        }
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="ml-auto">
                                            <ResponsiveAlignmentToggle
                                                value={editingLanding.config?.styles?.pasAlignment}
                                                onChange={val => setEditingLanding({
                                                    ...editingLanding,
                                                    config: {
                                                        ...editingLanding.config,
                                                        styles: {
                                                            ...(editingLanding.config?.styles || {}),
                                                            pasAlignment: val
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => {
                                            const problem = (editingLanding.config.pas || {})[`problem${i}`] || '';
                                            const text = typeof problem === 'object' ? problem.text : (typeof problem === 'string' ? problem : '');
                                            const image = typeof problem === 'object' ? problem.image : '';

                                            return (
                                                <div key={i} className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación {i}</label>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Problema/Dolor</label>
                                                            <textarea
                                                                rows={2}
                                                                className="w-full bg-white p-3 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all text-xs resize-none"
                                                                value={text}
                                                                onChange={e => setEditingLanding({
                                                                    ...editingLanding,
                                                                    config: {
                                                                        ...editingLanding.config,
                                                                        pas: {
                                                                            ...(editingLanding.config.pas || {}),
                                                                            [`problem${i}`]: { text: e.target.value, image }
                                                                        }
                                                                    }
                                                                })}
                                                                placeholder="ej: ¿Te sientes cansado todo el día?"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-center ml-1">
                                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Imagen (Opcional)</label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOnMediaSelect(() => (url: string) => {
                                                                            setEditingLanding((prev: any) => ({
                                                                                ...prev,
                                                                                config: {
                                                                                    ...prev.config,
                                                                                    pas: {
                                                                                        ...(prev.config.pas || {}),
                                                                                        [`problem${i}`]: { text, image: url }
                                                                                    }
                                                                                }
                                                                            }));
                                                                        });
                                                                        setIsMediaModalOpen(true);
                                                                    }}
                                                                    className="text-emerald-600 font-black text-[9px] uppercase hover:underline"
                                                                >Seleccionar 🖼️</button>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {image && (
                                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                                                        <img src={image} className="w-full h-full object-cover" />
                                                                    </div>
                                                                )}
                                                                <input
                                                                    className="flex-1 bg-white p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all text-[10px] font-mono"
                                                                    value={image}
                                                                    onChange={e => setEditingLanding({
                                                                        ...editingLanding,
                                                                        config: {
                                                                            ...editingLanding.config,
                                                                            pas: {
                                                                                ...(editingLanding.config.pas || {}),
                                                                                [`problem${i}`]: { text, image: e.target.value }
                                                                            }
                                                                        }
                                                                    })}
                                                                    placeholder="URL de la imagen"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Solutions Editor */}
                                <section className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest bg-purple-50 text-purple-600 p-2 rounded-lg inline-block">4. Soluciones Alternas</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Títulos:</span>
                                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                <span className="text-[10px]">📱</span>
                                                <input
                                                    type="text"
                                                    className="w-10 text-[9px] outline-none font-mono"
                                                    placeholder="1.8rem"
                                                    value={typeof editingLanding.config?.styles?.solutionTitleSize === 'object' ? editingLanding.config.styles.solutionTitleSize.mobile || '' : ''}
                                                    onChange={e => {
                                                        const current = typeof editingLanding.config?.styles?.solutionTitleSize === 'object' ? editingLanding.config.styles.solutionTitleSize : {};
                                                        setEditingLanding({
                                                            ...editingLanding,
                                                            config: {
                                                                ...editingLanding.config,
                                                                styles: {
                                                                    ...(editingLanding.config?.styles || {}),
                                                                    solutionTitleSize: { ...current, mobile: e.target.value }
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                <span className="text-[10px]">💻</span>
                                                <input
                                                    type="text"
                                                    className="w-10 text-[9px] outline-none font-mono"
                                                    placeholder="3rem"
                                                    value={typeof editingLanding.config?.styles?.solutionTitleSize === 'object' ? editingLanding.config.styles.solutionTitleSize.desktop || '' : (typeof editingLanding.config?.styles?.solutionTitleSize === 'string' ? editingLanding.config.styles.solutionTitleSize : '')}
                                                    onChange={e => {
                                                        const current = typeof editingLanding.config?.styles?.solutionTitleSize === 'object' ? editingLanding.config.styles.solutionTitleSize : { desktop: typeof editingLanding.config?.styles?.solutionTitleSize === 'string' ? editingLanding.config.styles.solutionTitleSize : '' };
                                                        setEditingLanding({
                                                            ...editingLanding,
                                                            config: {
                                                                ...editingLanding.config,
                                                                styles: {
                                                                    ...(editingLanding.config?.styles || {}),
                                                                    solutionTitleSize: { ...current, desktop: e.target.value }
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-1 pb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Grandor de descripción:</span>
                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                            <span className="text-[10px]">📱</span>
                                            <input
                                                type="text"
                                                className="w-10 text-[9px] outline-none font-mono"
                                                placeholder="1.1rem"
                                                value={typeof editingLanding.config?.styles?.solutionTextSize === 'object' ? editingLanding.config.styles.solutionTextSize.mobile || '' : ''}
                                                onChange={e => {
                                                    const current = typeof editingLanding.config?.styles?.solutionTextSize === 'object' ? editingLanding.config.styles.solutionTextSize : {};
                                                    setEditingLanding({
                                                        ...editingLanding,
                                                        config: {
                                                            ...editingLanding.config,
                                                            styles: {
                                                                ...(editingLanding.config?.styles || {}),
                                                                solutionTextSize: { ...current, mobile: e.target.value }
                                                            }
                                                        }
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                            <span className="text-[10px]">💻</span>
                                            <input
                                                type="text"
                                                className="w-10 text-[9px] outline-none font-mono"
                                                placeholder="1.1rem"
                                                value={typeof editingLanding.config?.styles?.solutionTextSize === 'object' ? editingLanding.config.styles.solutionTextSize.desktop || '' : (typeof editingLanding.config?.styles?.solutionTextSize === 'string' ? editingLanding.config.styles.solutionTextSize : '')}
                                                onChange={e => {
                                                    const current = typeof editingLanding.config?.styles?.solutionTextSize === 'object' ? editingLanding.config.styles.solutionTextSize : { desktop: typeof editingLanding.config?.styles?.solutionTextSize === 'string' ? editingLanding.config.styles.solutionTextSize : '' };
                                                    setEditingLanding({
                                                        ...editingLanding,
                                                        config: {
                                                            ...editingLanding.config,
                                                            styles: {
                                                                ...(editingLanding.config?.styles || {}),
                                                                solutionTextSize: { ...current, desktop: e.target.value }
                                                            }
                                                        }
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="ml-auto">
                                            <ResponsiveAlignmentToggle
                                                value={editingLanding.config?.styles?.solutionAlignment}
                                                onChange={val => setEditingLanding({
                                                    ...editingLanding,
                                                    config: {
                                                        ...editingLanding.config,
                                                        styles: {
                                                            ...(editingLanding.config?.styles || {}),
                                                            solutionAlignment: val
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {(editingLanding.config.solutions || []).map((s: any, i: number) => (
                                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Bloque {i + 1}</span>
                                                    <button type="button" onClick={() => {
                                                        const newSols = [...editingLanding.config.solutions];
                                                        newSols.splice(i, 1);
                                                        setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, solutions: newSols } });
                                                    }} className="text-red-500 text-xs font-bold">Quitar</button>
                                                </div>
                                                <input
                                                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs font-bold"
                                                    value={s.title}
                                                    onChange={e => {
                                                        const newSols = [...editingLanding.config.solutions];
                                                        newSols[i] = { ...s, title: e.target.value };
                                                        setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, solutions: newSols } });
                                                    }}
                                                    placeholder="Título de la solución"
                                                />
                                                <textarea
                                                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs h-16 resize-none"
                                                    value={s.text}
                                                    onChange={e => {
                                                        const newSols = [...editingLanding.config.solutions];
                                                        newSols[i] = { ...s, text: e.target.value };
                                                        setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, solutions: newSols } });
                                                    }}
                                                    placeholder="Descripción detallada..."
                                                />
                                                <ImageUploader
                                                    label="Imagen Solución"
                                                    value={s.image}
                                                    onChange={url => {
                                                        const newSols = [...editingLanding.config.solutions];
                                                        newSols[i] = { ...s, image: url };
                                                        setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, solutions: newSols } });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setEditingLanding({
                                                ...editingLanding,
                                                config: {
                                                    ...editingLanding.config,
                                                    solutions: [...(editingLanding.config.solutions || []), { title: '', text: '', image: '' }]
                                                }
                                            })}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:bg-slate-50"
                                        >+ Añadir Bloque de Solución</button>
                                    </div>
                                </section>

                                {/* Social Proof */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest bg-slate-50 p-2 rounded-lg inline-block">5. Prueba Social y Logos</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400">Testimonios (Mejor 3)</label>
                                            {(editingLanding.config.socialProof?.testimonials || []).map((t: any, i: number) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        className="flex-1 bg-slate-50 p-2 rounded-lg border border-transparent focus:border-slate-300 outline-none text-xs"
                                                        value={t.name}
                                                        onChange={e => {
                                                            const newTest = [...(editingLanding.config.socialProof?.testimonials || [])];
                                                            newTest[i] = { ...t, name: e.target.value };
                                                            setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, socialProof: { ...(editingLanding.config.socialProof || {}), testimonials: newTest } } });
                                                        }}
                                                        placeholder="Nombre"
                                                    />
                                                    <input
                                                        className="flex-[2] bg-slate-50 p-2 rounded-lg border border-transparent focus:border-slate-300 outline-none text-xs"
                                                        value={t.text}
                                                        onChange={e => {
                                                            const newTest = [...(editingLanding.config.socialProof?.testimonials || [])];
                                                            newTest[i] = { ...t, text: e.target.value };
                                                            setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, socialProof: { ...(editingLanding.config.socialProof || {}), testimonials: newTest } } });
                                                        }}
                                                        placeholder="Testimonio corto"
                                                    />
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setEditingLanding({
                                                ...editingLanding,
                                                config: { ...editingLanding.config, socialProof: { ...(editingLanding.config.socialProof || {}), testimonials: [...(editingLanding.config.socialProof?.testimonials || []), { name: '', text: '' }] } }
                                            })} className="text-[10px] font-bold text-slate-400">+ Añadir Testimonio</button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400">URLs de Logos Aliados</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(editingLanding.config.socialProof?.logos || ['', '']).map((l: string, i: number) => (
                                                    <input
                                                        key={i}
                                                        className="w-full bg-slate-50 p-2 rounded-lg border border-transparent focus:border-slate-300 outline-none text-[10px] font-mono"
                                                        value={l}
                                                        onChange={e => {
                                                            const newLogos = [...editingLanding.config.socialProof.logos];
                                                            newLogos[i] = e.target.value;
                                                            setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, socialProof: { ...editingLanding.config.socialProof, logos: newLogos } } });
                                                        }}
                                                        placeholder="URL Logo"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* CTA / Hard Sell */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest bg-emerald-50 text-emerald-600 p-2 rounded-lg inline-block">6. Oferta y Urgencia (Hard Sell)</h3>
                                    <div className="space-y-4 p-5 bg-slate-900 rounded-3xl text-white">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-emerald-400 ml-1">Producto Estrella</label>
                                            <select
                                                className="w-full bg-slate-800 p-4 rounded-2xl border-none outline-none text-sm font-bold"
                                                value={editingLanding.config.cta.id}
                                                onChange={e => setEditingLanding({
                                                    ...editingLanding,
                                                    config: { ...editingLanding.config, cta: { ...editingLanding.config.cta, id: e.target.value } }
                                                })}
                                            >
                                                <option value="">Seleccione servicio o paquete...</option>
                                                <optgroup label="Servicios">
                                                    {treatments.map(t => <option key={t.id} value={t.id}>{t.title} ({t.price})</option>)}
                                                </optgroup>
                                                <optgroup label="Paquetes">
                                                    {bundles.map(b => <option key={b.id} value={b.id}>{b.title} ({b.bundle_price})</option>)}
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-emerald-400 ml-1">Texto de Urgencia</label>
                                            <input
                                                className="w-full bg-slate-800 p-4 rounded-2xl border-none outline-none text-xs"
                                                value={editingLanding.config.cta.urgencyText || ''}
                                                onChange={e => setEditingLanding({
                                                    ...editingLanding,
                                                    config: { ...editingLanding.config, cta: { ...editingLanding.config.cta, urgencyText: e.target.value } }
                                                })}
                                                placeholder="ej: ⚠️ Cupos limitados para este mes"
                                            />
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] font-black text-emerald-500/50 uppercase">Tallas Título:</span>
                                                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                                                    <span className="text-[10px]">📱</span>
                                                    <input
                                                        type="text"
                                                        className="w-10 text-[9px] outline-none font-mono bg-transparent text-emerald-400"
                                                        placeholder="2.2rem"
                                                        value={typeof editingLanding.config?.styles?.ctaTitleSize === 'object' ? editingLanding.config.styles.ctaTitleSize.mobile || '' : ''}
                                                        onChange={e => {
                                                            const current = typeof editingLanding.config?.styles?.ctaTitleSize === 'object' ? editingLanding.config.styles.ctaTitleSize : {};
                                                            setEditingLanding({
                                                                ...editingLanding,
                                                                config: {
                                                                    ...editingLanding.config,
                                                                    styles: {
                                                                        ...(editingLanding.config?.styles || {}),
                                                                        ctaTitleSize: { ...current, mobile: e.target.value }
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                                                    <span className="text-[10px]">💻</span>
                                                    <input
                                                        type="text"
                                                        className="w-10 text-[9px] outline-none font-mono bg-transparent text-emerald-400"
                                                        placeholder="3.7rem"
                                                        value={typeof editingLanding.config?.styles?.ctaTitleSize === 'object' ? editingLanding.config.styles.ctaTitleSize.desktop || '' : (typeof editingLanding.config?.styles?.ctaTitleSize === 'string' ? editingLanding.config.styles.ctaTitleSize : '')}
                                                        onChange={e => {
                                                            const current = typeof editingLanding.config?.styles?.ctaTitleSize === 'object' ? editingLanding.config.styles.ctaTitleSize : { desktop: typeof editingLanding.config?.styles?.ctaTitleSize === 'string' ? editingLanding.config.styles.ctaTitleSize : '' };
                                                            setEditingLanding({
                                                                ...editingLanding,
                                                                config: {
                                                                    ...editingLanding.config,
                                                                    styles: {
                                                                        ...(editingLanding.config?.styles || {}),
                                                                        ctaTitleSize: { ...current, desktop: e.target.value }
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-black text-emerald-500/50 uppercase ml-2">Urgencia:</span>
                                                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                                                    <span className="text-[10px]">📱</span>
                                                    <input
                                                        type="text"
                                                        className="w-10 text-[9px] outline-none font-mono bg-transparent text-emerald-400"
                                                        placeholder="1.2rem"
                                                        value={typeof editingLanding.config?.styles?.ctaTextSize === 'object' ? editingLanding.config.styles.ctaTextSize.mobile || '' : ''}
                                                        onChange={e => {
                                                            const current = typeof editingLanding.config?.styles?.ctaTextSize === 'object' ? editingLanding.config.styles.ctaTextSize : {};
                                                            setEditingLanding({
                                                                ...editingLanding,
                                                                config: {
                                                                    ...editingLanding.config,
                                                                    styles: {
                                                                        ...(editingLanding.config?.styles || {}),
                                                                        ctaTextSize: { ...current, mobile: e.target.value }
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                                                    <span className="text-[10px]">💻</span>
                                                    <input
                                                        type="text"
                                                        className="w-10 text-[9px] outline-none font-mono bg-transparent text-emerald-400"
                                                        placeholder="1.2rem"
                                                        value={typeof editingLanding.config?.styles?.ctaTextSize === 'object' ? editingLanding.config.styles.ctaTextSize.desktop || '' : (typeof editingLanding.config?.styles?.ctaTextSize === 'string' ? editingLanding.config.styles.ctaTextSize : '')}
                                                        onChange={e => {
                                                            const current = typeof editingLanding.config?.styles?.ctaTextSize === 'object' ? editingLanding.config.styles.ctaTextSize : { desktop: typeof editingLanding.config?.styles?.ctaTextSize === 'string' ? editingLanding.config.styles.ctaTextSize : '' };
                                                            setEditingLanding({
                                                                ...editingLanding,
                                                                config: {
                                                                    ...editingLanding.config,
                                                                    styles: {
                                                                        ...(editingLanding.config?.styles || {}),
                                                                        ctaTextSize: { ...current, desktop: e.target.value }
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5 ml-4">
                                                    <span className="text-[9px] font-black text-emerald-500/50 uppercase ml-1">Botón CTA:</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                                                            <span className="text-[10px]">📱</span>
                                                            <input type="text" className="w-10 text-[9px] outline-none font-mono bg-transparent text-emerald-400" placeholder="1.1rem" value={editingLanding.config?.styles?.ctaButtonSize?.mobile || ''} onChange={e => setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, styles: { ...(editingLanding.config?.styles || {}), ctaButtonSize: { ...(editingLanding.config?.styles?.ctaButtonSize || {}), mobile: e.target.value } } } })} />
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                                                            <span className="text-[10px]">💻</span>
                                                            <input type="text" className="w-10 text-[9px] outline-none font-mono bg-transparent text-emerald-400" placeholder="1.1rem" value={editingLanding.config?.styles?.ctaButtonSize?.desktop || ''} onChange={e => setEditingLanding({ ...editingLanding, config: { ...editingLanding.config, styles: { ...(editingLanding.config?.styles || {}), ctaButtonSize: { ...(editingLanding.config?.styles?.ctaButtonSize || {}), desktop: e.target.value } } } })} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-auto self-end">
                                                    <ResponsiveAlignmentToggle
                                                        value={editingLanding.config?.styles?.ctaAlignment}
                                                        onChange={val => setEditingLanding({
                                                            ...editingLanding,
                                                            config: {
                                                                ...editingLanding.config,
                                                                styles: {
                                                                    ...(editingLanding.config?.styles || {}),
                                                                    ctaAlignment: val
                                                                }
                                                            }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Right: Live Preview Panel */}
                        <div className="md:w-1/2 h-full bg-slate-200 overflow-hidden hide-scrollbar flex flex-col items-center">
                            <div className="w-full bg-slate-900 text-white p-3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span>Vista Previa: {previewMode === 'mobile' ? 'Móvil (375px)' : previewMode === 'tablet' ? 'Tablet (768px)' : 'Escritorio (Full)'}</span>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                </div>
                            </div>
                            <div className={`flex-1 overflow-y-auto bg-white border-8 border-slate-900/10 my-4 rounded-[2rem] shadow-inner transition-all duration-500 scrollbar-hide ${previewMode === 'mobile' ? 'w-[375px]' : previewMode === 'tablet' ? 'w-[768px]' : 'w-full m-0 rounded-none border-0'
                                }`}>
                                <div className={previewMode !== 'desktop' ? 'scale-[1] origin-top' : ''}>
                                    <LandingPage
                                        previewData={editingLanding}
                                        isMobilePreview={previewMode === 'mobile'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Biblioteca Tab */}
            {activeTab === 'media' && (
                <div className="animate-fade-in p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setMediaFilter('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mediaFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                            >Todo</button>
                            <button
                                onClick={() => setMediaFilter('image')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mediaFilter === 'image' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                            >Imágenes</button>
                            <button
                                onClick={() => setMediaFilter('video')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mediaFilter === 'video' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                            >Videos</button>
                        </div>
                        <button
                            onClick={() => {
                                if (!(window as any).cloudinary) {
                                    alert('El widget de subida aún se está cargando o falló. Por favor recarga la página.');
                                    return;
                                }
                                (window as any).cloudinary.openUploadWidget(
                                    { cloudName: 'dlkky5xuo', uploadPreset: 'promedid_preset', sources: ['local', 'url'] },
                                    async (error: any, result: any) => {
                                        if (!error && result && result.event === "success") {
                                            const { data, error: dbError } = await supabase.from('media').insert({
                                                url: result.info.secure_url,
                                                type: result.info.resource_type,
                                                public_id: result.info.public_id,
                                                name: result.info.original_filename || 'Nuevo Archivo'
                                            }).select();
                                            if (!dbError) fetchMedia();
                                        }
                                    }
                                );
                            }}
                            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all"
                        >
                            + Subir a la Biblioteca
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {media
                            .filter(m => mediaFilter === 'all' || m.type === mediaFilter)
                            .map(m => (
                                <div key={m.id} className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                                    <div className="aspect-square relative flex items-center justify-center bg-slate-50">
                                        {m.type === 'image' ? (
                                            <img src={m.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl">🎬</span>
                                        )}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/60 text-white text-[8px] font-black rounded-lg uppercase backdrop-blur-md">
                                            {m.type}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMedia(m.id, m.public_id)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                        >✕</button>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[10px] font-bold text-slate-600 truncate">{m.name || 'Sin nombre'}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="animate-fade-in p-8 space-y-8">
                    <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Rendimiento de Campañas</h2>
                            <p className="text-slate-500 text-sm font-medium">Métricas integrales de visitas y conversiones</p>
                        </div>
                        <button
                            onClick={fetchAnalytics}
                            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group"
                        >
                            <span className={`inline-block group-hover:rotate-180 transition-transform duration-500 ${isFetchingAnalytics ? 'animate-spin' : ''}`}>🔄</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Object.entries(analyticsEvents.reduce((acc: any, event: any) => {
                            const key = event.landing_id;
                            if (!acc[key]) acc[key] = { views: 0, whatsapp: 0, leads: 0, sessions: new Set(), title: key };
                            if (event.event_type === 'view') acc[key].views++;
                            if (event.event_type === 'click' && event.event_name === 'WhatsApp') acc[key].whatsapp++;
                            if (event.event_type === 'click' && event.event_name === 'Lead Generated') acc[key].leads++;
                            acc[key].sessions.add(event.session_id);
                            return acc;
                        }, {})).map(([slug, stats]: [string, any]) => (
                            <div key={slug} className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-6 hover:shadow-xl transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">🚀</div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Página</p>
                                        <h3 className="font-black text-slate-900 truncate max-w-[150px]">{slug}</h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Visitas</p>
                                        <p className="text-2xl font-black text-slate-900">{stats.views}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase">WhatsApp</p>
                                        <p className="text-2xl font-black text-emerald-600">{stats.whatsapp}</p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase">Leads (Form)</p>
                                        <p className="text-2xl font-black text-indigo-600">{stats.leads}</p>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-amber-600 uppercase">CTR</p>
                                        <p className="text-2xl font-black text-amber-600">
                                            {stats.views > 0 ? (((stats.whatsapp + stats.leads) / stats.views) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                                    <span>Sesiones Únicas: {stats.sessions.size}</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">En Vivo</span>
                                </div>
                            </div>
                        ))}

                        {analyticsEvents.length === 0 && !isFetchingAnalytics && (
                            <div className="col-span-full py-20 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
                                <span className="text-4xl mb-4 block">📈</span>
                                <h3 className="font-bold text-slate-900">No hay datos aún</h3>
                                <p className="text-slate-500 text-sm">Las estadísticas aparecerán cuando los pacientes visiten tus páginas.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Global Media Selection Modal */}
            {isMediaModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Seleccionar Medio</h3>
                                <p className="text-xs text-slate-500 mt-1">Biblioteca de Cloudinary</p>
                            </div>
                            <button
                                onClick={() => setIsMediaModalOpen(false)}
                                className="w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all"
                            >✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {media.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            onMediaSelect(m.url);
                                            setIsMediaModalOpen(false);
                                        }}
                                        className="group relative bg-slate-50 rounded-3xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all text-left"
                                    >
                                        <div className="aspect-square relative flex items-center justify-center">
                                            {m.type === 'image' ? (
                                                <img src={m.url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl">🎬</span>
                                            )}
                                        </div>
                                        <div className="p-3 bg-white">
                                            <p className="text-[10px] font-bold text-slate-600 truncate">{m.name || 'Sin nombre'}</p>
                                        </div>
                                    </button>
                                ))}
                                {/* Botón para subir nuevo directamente desde el modal */}
                                <button
                                    onClick={() => {
                                        if (!(window as any).cloudinary) {
                                            alert('El widget de subida aún se está cargando. Por favor espera un momento.');
                                            return;
                                        }
                                        (window as any).cloudinary.openUploadWidget(
                                            { cloudName: 'dlkky5xuo', uploadPreset: 'promedid_preset', sources: ['local', 'url'] },
                                            async (error: any, result: any) => {
                                                if (!error && result && result.event === "success") {
                                                    const { data, error: dbError } = await supabase.from('media').insert({
                                                        url: result.info.secure_url,
                                                        type: result.info.resource_type,
                                                        public_id: result.info.public_id,
                                                        name: result.info.original_filename || 'Nuevo Archivo'
                                                    }).select();
                                                    if (!dbError) {
                                                        fetchMedia();
                                                        onMediaSelect(result.info.secure_url);
                                                        setIsMediaModalOpen(false);
                                                    }
                                                }
                                            }
                                        );
                                    }}
                                    className="aspect-square border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Subir Nuevo</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
