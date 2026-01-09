
import { Link, useLocation } from 'react-router-dom';

interface TopNavProps {
  title?: string;
  showLinks?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ title = "Strimo", showLinks = true }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-50">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">pie_chart</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </span>
          </Link>
        </div>

        {showLinks && (
          <div className="hidden md:flex flex-1 justify-center gap-8">
            <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <Link 
                to="/dashboard" 
                className={`px-4 py-1.5 font-bold shadow-sm rounded-md text-sm transition-all ${isActive('/dashboard') ? 'bg-white dark:bg-slate-700 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Panel
              </Link>
              <Link 
                to="/settings" 
                className={`px-4 py-1.5 font-medium hover:text-slate-900 dark:hover:text-white text-sm transition-all ${isActive('/settings') ? 'bg-white dark:bg-slate-700 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Ajustes
              </Link>
            </nav>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-border-light dark:border-border-dark">
            <Link to="/settings">
              <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all">
                <img 
                  alt="Avatar de usuario" 
                  className="w-full h-full object-cover" 
                  src="https://picsum.photos/seed/admin/200/200" 
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
