
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { Member, PaymentStatus } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const members: Member[] = [
    {
      id: 'm1',
      name: 'Maria García',
      initials: 'MG',
      email: 'maria@ejemplo.com',
      lastPayment: 'hace 40 días',
      amountDue: 12.50,
      status: PaymentStatus.OVERDUE,
      subscriptionId: 's1',
      subscriptionName: 'Spotify Familiar'
    },
    {
      id: 'm2',
      name: 'Carlos Rodríguez',
      initials: 'CR',
      email: 'carlos@ejemplo.com',
      lastPayment: 'hace 28 días',
      amountDue: 15.00,
      status: PaymentStatus.PENDING,
      subscriptionId: 's2',
      subscriptionName: 'Netflix Premium'
    },
    {
      id: 'm3',
      name: 'Elena Sanz',
      initials: 'ES',
      email: 'elena@ejemplo.com',
      lastPayment: 'ayer',
      amountDue: 0.00,
      status: PaymentStatus.PAID,
      subscriptionId: 's1',
      subscriptionName: 'Spotify Familiar'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0d141b]">
      <TopNav />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span>Dashboard de Octubre</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Hola, Administrador</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Aquí tienes el resumen de tus suscripciones compartidas.</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/add-subscription')}
            className="flex items-center justify-center gap-2 h-12 px-8 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_box</span>
            Añadir Suscripción
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gasto Total Mensual</span>
            <div className="text-4xl font-black text-slate-900 dark:text-white mt-2">$240.50</div>
            <div className="text-sm text-slate-400 mt-2">Repartido entre 6 personas</div>
          </div>
          <div className="p-6 bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recaudado hasta hoy</span>
            <div className="text-4xl font-black text-green-600 mt-2">$180.00</div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-green-500 h-full w-[75%] rounded-full"></div>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm border-l-4 border-l-red-500">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pendiente de cobro</span>
            <div className="text-4xl font-black text-red-600 mt-2">$60.50</div>
            <div className="text-sm text-red-500 font-medium mt-2">2 pagos atrasados detectados</div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <h3 className="text-lg font-bold">Estado de los Miembros</h3>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><span className="material-symbols-outlined">filter_list</span></button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><span className="material-symbols-outlined">search</span></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/30">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Miembro</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Servicio</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">{m.initials}</div>
                        <div>
                          <div className="font-bold text-sm">{m.name}</div>
                          <div className="text-xs text-slate-400">{m.lastPayment}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium">{m.subscriptionName}</span>
                    </td>
                    <td className="px-6 py-5 font-black text-sm">${m.amountDue.toFixed(2)}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        m.status === PaymentStatus.OVERDUE ? 'bg-red-100 text-red-600 border border-red-200' :
                        m.status === PaymentStatus.PENDING ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                        'bg-green-100 text-green-600 border border-green-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        type="button"
                        onClick={() => navigate(`/send-reminder/${m.id}`)}
                        className="text-primary hover:text-primary-dark font-bold text-xs underline underline-offset-4"
                      >
                        {m.status === PaymentStatus.OVERDUE ? 'Cobrar ahora' : 'Ver detalle'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
