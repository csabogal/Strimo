
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';

const AddMember: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '4.00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el miembro
    alert(`Miembro ${formData.name} añadido con éxito.`);
    navigate(`/subscription-detail/${subscriptionId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0d141b]">
      <TopNav title="Strimo" showLinks={false} />
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-[600px] bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden transition-all">
          <div className="p-8 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-white dark:bg-slate-900/50">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nuevo Miembro</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Invita a alguien a compartir tu suscripción</p>
            </div>
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nombre Completo</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                  <input 
                    required
                    id="name"
                    type="text" 
                    placeholder="ej. Juan Pérez"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                  <input 
                    required
                    id="email"
                    type="email" 
                    placeholder="juan@ejemplo.com"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">WhatsApp (para recordatorios)</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">chat_bubble</span>
                  <input 
                    id="phone"
                    type="tel" 
                    placeholder="+34 600 000 000"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Cuota Mensual ($)</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">payments</span>
                  <input 
                    required
                    id="amount"
                    type="number" 
                    step="0.01"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 italic">* Esta cuota se usará para generar los recordatorios automáticos de IA.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-black rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                Confirmar y Añadir
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">person_add</span>
              </button>
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-full h-12 bg-transparent text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddMember;
