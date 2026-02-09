
import React from 'react';

const ContactForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = form.querySelector('input[placeholder="Juan Pérez"]') as HTMLInputElement;
    const phoneInput = form.querySelector('input[placeholder="+57 300 123 4567"]') as HTMLInputElement;
    const citySelect = form.querySelector('#contact-city') as HTMLSelectElement;
    const reasonTextArea = form.querySelector('textarea') as HTMLTextAreaElement;

    const name = nameInput?.value || '';
    const phone = phoneInput?.value || '';
    const city = citySelect?.value || 'Bogotá';
    const reason = reasonTextArea?.value || '';

    const message = `Hola, mi nombre es ${name}, mi teléfono es ${phone}. Estoy interesado en la sede de ${city}. Motivo: ${reason}`;
    const url = `https://wa.me/573000000000?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Hablemos de su Salud</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Agende su primera cita de renovación</h3>
            <p className="text-lg text-slate-600 max-w-lg">
              Complete el formulario y uno de nuestros asesores especializados se contactará con usted para agendar su valoración médica integral.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <div>
                <h5 className="font-bold text-slate-900">Atención Telefónica</h5>
                <p className="text-slate-500">Lunes a Sábado: 7:00 AM - 7:00 PM</p>
                <p className="text-emerald-600 font-bold">+57 01 8000 PROMEDID</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h5 className="font-bold text-slate-900">Correo Electrónico</h5>
                <p className="text-slate-500">Para dudas generales y convenios</p>
                <p className="text-emerald-600 font-bold">contacto@promedid.com.co</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-50">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Teléfono / WhatsApp</label>
                <input
                  required
                  type="tel"
                  placeholder="+57 300 123 4567"
                  className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Sede de Interés</label>
              <select className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all appearance-none" id="contact-city">
                <option>Bogotá</option>
                <option>Villavicencio</option>
                <option>Pereira</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Motivo de consulta</label>
              <textarea
                rows={4}
                placeholder="Cuéntenos brevemente qué síntomas presenta o qué tratamiento le interesa..."
                className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all"
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              Enviar Solicitud de Agendamiento
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-tighter">
              Al enviar este formulario acepta nuestra política de tratamiento de datos personales de acuerdo con la Ley 1581 de 2012.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
