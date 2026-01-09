
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    { name: 'Netflix', color: '#E50914', logo: 'N', icon: 'movie' },
    { name: 'Spotify', color: '#1DB954', logo: 'S', icon: 'music_note' },
    { name: 'Disney+', color: '#113CCF', logo: 'D', icon: 'auto_awesome' },
    { name: 'Prime Video', color: '#00A8E1', logo: 'P', icon: 'smart_display' },
    { name: 'Youtube Premium', color: '#FF0000', logo: 'Y', icon: 'video_library' },
    { name: 'Apple Music', color: '#FC3C44', logo: 'A', icon: 'library_music' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav title="Strimo" showLinks={false} />
      <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-[800px] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Añadir Nueva Suscripción</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecciona un servicio para empezar a dividir gastos</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center justify-center size-9 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex flex-col flex-1 p-6 gap-6">
            <div className="relative group">
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Encuentra tu servicio</label>
              <div className="flex w-full items-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all h-12 px-4 gap-3">
                <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                <input className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 text-base" placeholder="Buscar servicios..." type="text" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {services.map((service, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate('/dashboard')}
                  className="group relative flex flex-col items-center gap-3 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                >
                  <div 
                    className="size-14 rounded-full shadow-md flex items-center justify-center overflow-hidden text-white font-black text-2xl"
                    style={{ backgroundColor: service.color }}
                  >
                    {service.logo}
                  </div>
                  <p className="text-slate-900 dark:text-white text-sm font-semibold">{service.name}</p>
                </div>
              ))}
              <div className="group relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">add_circle</span>
                  <p className="text-slate-400 group-hover:text-primary text-sm font-semibold">Servicio Personalizado</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Volver</button>
            <button onClick={() => navigate('/dashboard')} className="group flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/30">
              Siguiente Paso
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddSubscription;
