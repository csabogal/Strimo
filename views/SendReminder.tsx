
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { generateReminderMessage } from '../services/geminiService';

const SendReminder: React.FC = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('whatsapp');

  // Datos mock del miembro
  const member = {
    name: 'Maria G.',
    amountDue: 10.00,
    subscriptionName: 'Spotify Familiar'
  };

  useEffect(() => {
    const fetchAIResponse = async () => {
      setLoading(true);
      const msg = await generateReminderMessage(member.name, member.amountDue, member.subscriptionName);
      setMessage(msg);
      setLoading(false);
    };

    fetchAIResponse();
  }, []);

  const handleSend = () => {
    alert(`Enviando vía ${channel}: ${message}`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav showLinks={false} />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <button 
            onClick={() => navigate(-1)} 
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors dark:text-slate-400"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver
          </button>

          <div className="mb-8 rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Enviar Recordatorio</h1>
              <p className="text-slate-500 dark:text-slate-400">Recordando a {member.name} sobre {member.subscriptionName} (${member.amountDue.toFixed(2)})</p>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Canal de Entrega</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <label 
                  onClick={() => setChannel('whatsapp')}
                  className={`group relative flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-4 transition-all ${
                    channel === 'whatsapp' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="mb-1 rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <span className="material-symbols-outlined">chat</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">WhatsApp</span>
                </label>
                <label 
                  onClick={() => setChannel('email')}
                  className={`group relative flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-4 transition-all ${
                    channel === 'email' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="mb-1 rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">Correo</span>
                </label>
              </div>
            </section>

            <section className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Vista Previa del Mensaje
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">IA GENERADO</span>
                </h3>
                <button 
                  onClick={() => generateReminderMessage(member.name, member.amountDue, member.subscriptionName).then(setMessage)}
                  className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Regenerar
                </button>
              </div>
              <div className="relative">
                {loading ? (
                    <div className="w-full h-32 rounded-lg bg-slate-50 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                        <span className="text-slate-400 text-sm">Pensando...</span>
                    </div>
                ) : (
                    <textarea 
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 text-sm focus:border-primary focus:ring-primary shadow-sm" 
                        rows={4}
                        spellCheck="false" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                )}
              </div>
            </section>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              disabled={loading}
              onClick={handleSend} 
              className="flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#20bd5a] transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              Enviar Recordatorio
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SendReminder;
