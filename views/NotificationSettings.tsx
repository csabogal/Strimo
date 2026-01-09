
import React, { useState } from 'react';
import TopNav from '../components/TopNav';

const NotificationSettings: React.FC = () => {
  const [reminders, setReminders] = useState(true);
  const [autoBilling, setAutoBilling] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="flex flex-1 justify-center py-8 px-4 md:px-8">
        <div className="flex flex-col max-w-4xl flex-1 gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Ajustes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Gestiona tu perfil y las preferencias de notificación de pagos.</p>
          </div>

          <section className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preferencias de Notificación</h2>
                <p className="text-sm text-slate-500">Configura cómo tú y tus miembros se mantienen informados.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-900 dark:text-white">Recordatorios Automatizados por IA</span>
                    <span className="text-sm text-slate-500">Enviar mensajes de WhatsApp generados 3 días antes de la renovación.</span>
                  </div>
                  <button 
                    onClick={() => setReminders(!reminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${reminders ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${reminders ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-900 dark:text-white">Auto-confirmar Pagos</span>
                    <span className="text-sm text-slate-500">Marcar recibos automáticamente como pagados cuando se detecten.</span>
                  </div>
                  <button 
                    onClick={() => setAutoBilling(!autoBilling)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoBilling ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoBilling ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Información del Perfil</h2>
                </div>
                <div className="p-6 flex items-center gap-6">
                    <div className="size-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative group cursor-pointer">
                        <img src="https://picsum.photos/seed/admin/200/200" alt="Administrador" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white">photo_camera</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Público</label>
                                <input type="text" className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm" defaultValue="Administrador" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                                <input type="email" className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm" defaultValue="admin@strimo.io" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-primary-dark transition-all">Guardar Cambios</button>
                </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
