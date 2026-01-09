
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const MemberDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Datos mock
  const member = {
    id,
    name: 'Maria G.',
    email: 'maria@ejemplo.com',
    outstanding: 45.50,
    subscriptions: ['Spotify Familiar', 'Disney+']
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="px-4 sm:px-6 lg:px-40 flex flex-1 justify-center py-8">
        <div className="flex flex-col max-w-[1200px] flex-1">
          <nav className="flex flex-wrap gap-2 px-4 mb-6 items-center text-sm">
            <Link to="/dashboard" className="text-slate-500 hover:text-primary dark:text-slate-400 font-medium transition-colors">Panel</Link>
            <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
            <span className="text-slate-900 dark:text-white font-semibold">{member.name}</span>
          </nav>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <img 
                      className="size-24 rounded-full border-4 border-slate-50 dark:border-slate-700 object-cover" 
                      src={`https://picsum.photos/seed/${id}/200/200`} 
                      alt={member.name} 
                    />
                    <div className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1.5 border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-white text-[16px] leading-none">priority_high</span>
                    </div>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{member.email}</p>
                  
                  <div className="w-full bg-slate-50 dark:bg-slate-700/30 rounded-lg p-5 mb-6 border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Total Pendiente</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">${member.outstanding.toFixed(2)}</p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/send-reminder/${id}`)}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                    Enviar Recordatorio
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex gap-8">
                  <button className="border-b-2 border-primary py-4 px-1 text-sm font-semibold text-primary">Suscripciones Activas</button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors">Historial</button>
                </nav>
              </div>
              
              <div className="space-y-4">
                {member.subscriptions.map((sub, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">category</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{sub}</p>
                        <p className="text-xs text-slate-500">Compartido desde Ago 2023</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">$10.00/mes</p>
                        <span className="text-xs text-red-500 font-semibold uppercase tracking-wider">Pendiente</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
