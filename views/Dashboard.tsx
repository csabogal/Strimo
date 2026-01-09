
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { Member, PaymentStatus } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const members: Member[] = [
    {
      id: 'm1',
      name: 'Maria G.',
      initials: 'MG',
      email: 'maria@example.com',
      lastPayment: 'hace 40 días',
      amountDue: 10.00,
      status: PaymentStatus.OVERDUE,
      subscriptionId: 's1',
      subscriptionName: 'Spotify Familiar'
    },
    {
      id: 'm2',
      name: 'Carlos R.',
      initials: 'CR',
      email: 'carlos@example.com',
      lastPayment: 'hace 28 días',
      amountDue: 15.00,
      status: PaymentStatus.PENDING,
      subscriptionId: 's2',
      subscriptionName: 'Netflix Premium'
    },
    {
      id: 'm3',
      name: 'Elena S.',
      initials: 'ES',
      email: 'elena@example.com',
      lastPayment: 'hace 2 días',
      amountDue: 0.00,
      status: PaymentStatus.PAID,
      subscriptionId: 's1',
      subscriptionName: 'Spotify Familiar'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Octubre 2023</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Resumen Mensual</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg">Bienvenido de nuevo, Administrador. Así va el estado de tus suscripciones compartidas.</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/add-subscription')}
            className="group flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Nueva Suscripción</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col gap-1 p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-primary">
                <span className="material-symbols-outlined text-[20px]">attach_money</span>
              </div>
              <span className="text-sm font-medium">Costo Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">$200.00</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">8 suscripciones activas</p>
          </div>

          <div className="flex flex-col gap-1 p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-[20px]">savings</span>
                </div>
                <span className="text-sm font-medium">Recaudado</span>
              </div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">60%</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">$120.00</p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-green-500 h-full rounded-full w-[60%]"></div>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
              <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-md text-red-600 dark:text-red-400">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <span className="text-sm font-medium">Atrasados</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-tight">2</p>
              <span className="text-sm text-slate-400">miembros</span>
            </div>
            <p className="text-xs text-red-500/80 mt-1 font-medium">Requiere atención</p>
          </div>

          <div className="flex flex-col justify-between p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado de Pagos</span>
            </div>
            <div className="flex items-end justify-between h-16 gap-2 mt-2 px-2">
              <div className="flex flex-col items-center gap-1 w-full group cursor-help">
                <div className="w-full bg-green-500 rounded-t-sm h-[60%] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pagado</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-full group cursor-help">
                <div className="w-full bg-amber-400 rounded-t-sm h-[25%] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pend.</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-full group cursor-help">
                <div className="w-full bg-red-500 rounded-t-sm h-[15%] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atras.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detalles de Miembros</h3>
            <button 
                type="button"
                onClick={() => navigate('/add-subscription')}
                className="text-sm font-semibold text-primary hover:underline"
            >
                + Ver Suscripciones
            </button>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[25%]">Miembro</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Suscripción</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">Monto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {members.map((member) => (
                    <tr 
                      key={member.id}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/member-detail/${member.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            member.status === PaymentStatus.OVERDUE ? 'bg-red-100 text-red-600' : 
                            member.status === PaymentStatus.PENDING ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {member.initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                            <p className="text-xs text-slate-500">Último pago: {member.lastPayment}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">category</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{member.subscriptionName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">${member.amountDue.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          member.status === PaymentStatus.OVERDUE ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                          member.status === PaymentStatus.PENDING ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                          'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        }`}>
                          <span className={`size-1.5 rounded-full ${
                            member.status === PaymentStatus.OVERDUE ? 'bg-red-600' :
                            member.status === PaymentStatus.PENDING ? 'bg-amber-600' : 'bg-green-600'
                          }`}></span>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/send-reminder/${member.id}`);
                          }} 
                          className={`inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-bold transition-colors border ${
                            member.status === PaymentStatus.OVERDUE ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 border-red-200' : 
                            'bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 border-slate-200'
                          }`}
                        >
                          {member.status === PaymentStatus.OVERDUE ? 'Recordar' : 'Notificar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
