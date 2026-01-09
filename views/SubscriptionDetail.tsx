
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { PaymentStatus } from '../types';

const SubscriptionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Datos mock para la suscripción específica
  const subscription = {
    id: id || 's1',
    name: 'Netflix Premium',
    totalCost: 15.99,
    renewalDate: '24 Oct, 2023',
    status: 'Activo',
    icon: 'movie',
    color: '#E50914',
    members: [
      { id: 'm1', name: 'Maria G.', status: PaymentStatus.OVERDUE, amount: 4.00, initials: 'MG' },
      { id: 'm2', name: 'Carlos R.', status: PaymentStatus.PENDING, amount: 4.00, initials: 'CR' },
      { id: 'm3', name: 'Elena S.', status: PaymentStatus.PAID, amount: 4.00, initials: 'ES' },
      { id: 'm4', name: 'Admin (Tú)', status: PaymentStatus.PAID, amount: 3.99, initials: 'AD' },
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/dashboard" className="text-slate-500 hover:text-primary dark:text-slate-400 font-medium transition-colors">Panel</Link>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-semibold">{subscription.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: subscription.color }}></div>
              <div className="flex flex-col items-center text-center mt-4">
                <div 
                  className="size-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
                  style={{ backgroundColor: subscription.color }}
                >
                  <span className="material-symbols-outlined text-3xl">{subscription.icon}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{subscription.name}</h1>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {subscription.status}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total Mensual</span>
                  <span className="font-bold text-slate-900 dark:text-white text-lg">${subscription.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Próxima Renovación</span>
                  <span className="font-bold text-slate-900 dark:text-white">{subscription.renewalDate}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Costo por Miembro</span>
                  <span className="font-bold text-primary">${(subscription.totalCost / subscription.members.length).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Editar
                </button>
                <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                  Pausar
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Miembros Activos</h2>
                <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Añadir Miembro
                </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Miembro</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contribución</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {subscription.members.map((member) => (
                    <tr key={member.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {member.initials}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">${member.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                          member.status === PaymentStatus.OVERDUE ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' :
                          member.status === PaymentStatus.PENDING ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            {member.status !== PaymentStatus.PAID && (
                                <button 
                                    onClick={() => navigate(`/send-reminder/${member.id}`)}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    title="Recordar miembro"
                                >
                                    <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                                </button>
                            )}
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                <span className="material-symbols-outlined text-primary">info</span>
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Consejo del Admin</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Tienes 1 pago atrasado en esta suscripción. Enviar un recordatorio amable suele resolver los retrasos en menos de 24 horas.</p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionDetail;
