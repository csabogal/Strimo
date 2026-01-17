import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, MonitorPlay, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <Link to={to} className="relative group">
            <div
                className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                    isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
            >
                <Icon size={20} className={clsx(isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                <span className="font-medium">{label}</span>
            </div>
        </Link>
    )
}

const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <Link to={to} className="flex flex-col items-center gap-1 py-2 px-3 min-w-[64px]">
            <div
                className={clsx(
                    'p-2 rounded-xl transition-all duration-200',
                    isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-400'
                )}
            >
                <Icon size={20} />
            </div>
            <span className={clsx(
                'text-xs font-medium transition-colors',
                isActive ? 'text-white' : 'text-slate-500'
            )}>
                {label}
            </span>
        </Link>
    )
}

export const Layout = () => {
    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0f172a]/50 backdrop-blur-xl p-6 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="flex items-center gap-3 px-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="font-bold text-white text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Strimo
                        </span>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem to="/members" icon={Users} label="Miembros" />
                        <SidebarItem to="/platforms" icon={MonitorPlay} label="Plataformas" />
                    </nav>
                </div>

                <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5">
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
                <div className="flex justify-around items-center">
                    <MobileNavItem to="/" icon={LayoutDashboard} label="Inicio" />
                    <MobileNavItem to="/members" icon={Users} label="Miembros" />
                    <MobileNavItem to="/platforms" icon={MonitorPlay} label="Plataformas" />
                </div>
            </nav>

            {/* Background Effects - Fixed to stay while scrolling */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-20 md:pb-0">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative z-10 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    )
}
