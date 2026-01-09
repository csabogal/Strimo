
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full bg-white dark:bg-[#1a2632] border-b border-[#e7edf3] dark:border-[#2a3b4d] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <span className="material-symbols-outlined text-3xl">pie_chart</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0d141b] dark:text-white">Strimo</h1>
          </div>
          <div>
            <button 
              type="button"
              className="text-sm font-medium text-[#4c739a] hover:text-primary transition-colors"
            >
              Centro de Ayuda
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-[640px] flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-primary font-bold text-sm uppercase tracking-wider mb-1">Paso 1 de 3</p>
                <h2 className="text-[#0d141b] dark:text-white text-lg font-semibold">Crea tu cuenta</h2>
              </div>
              <span className="text-[#4c739a] text-sm font-medium hidden sm:block">Siguiente: Preferencias</span>
            </div>
            <div className="h-2 w-full bg-[#cfdbe7] dark:bg-[#2a3b4d] rounded-full overflow-hidden flex">
              <div className="h-full bg-primary w-1/3 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-[#e7edf3] dark:border-[#2a3b4d] overflow-hidden">
            <div className="pt-8 pb-4 px-8 text-center">
              <h1 className="text-[#0d141b] dark:text-white text-3xl font-bold tracking-tight mb-2">Bienvenido a Strimo</h1>
              <p className="text-[#4c739a] text-base font-normal max-w-md mx-auto">Configuremos tu perfil de administrador para que puedas empezar a dividir gastos sin fricciones sociales.</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#0d141b] dark:text-white text-sm font-semibold" htmlFor="fullname">Nombre Completo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">person</span>
                  <input 
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#cfdbe7] dark:border-[#4b5563] bg-background-light dark:bg-[#101922] text-[#0d141b] dark:text-white placeholder:text-[#9ca3af] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                    id="fullname" 
                    placeholder="ej. Alex Morgan" 
                    type="text" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#0d141b] dark:text-white text-sm font-semibold" htmlFor="email">Correo Electrónico</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">mail</span>
                  <input 
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#cfdbe7] dark:border-[#4b5563] bg-background-light dark:bg-[#101922] text-[#0d141b] dark:text-white placeholder:text-[#9ca3af] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                    id="email" 
                    placeholder="alex@ejemplo.com" 
                    type="email" 
                  />
                </div>
              </div>
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard')} 
                  className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  Crear Cuenta y Continuar
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
