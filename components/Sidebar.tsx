
import React from 'react';
import { 
  CheckSquare, 
  LogOut, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Droplets, 
  Moon, 
  BookOpen, 
  Calendar,
  BarChart3
} from 'lucide-react';
import { View, NexusTheme, UserProfile } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  currentTheme: NexusTheme;
  user: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentTheme, user }) => {
  const isLight = document.body.classList.contains('light-mode');
  
  const menuItems = [
    { id: 'dashboard' as View, label: 'Início', icon: <LayoutDashboard size={20} /> },
    { id: 'habits' as View, label: 'Hábitos', icon: <CheckSquare size={20} /> },
    { id: 'planner' as View, label: 'Planejador', icon: <Calendar size={20} /> },
    { id: 'hydration' as View, label: 'Hidratação', icon: <Droplets size={20} /> },
    { id: 'sleep' as View, label: 'Sono & Energia', icon: <Moon size={20} /> },
    { id: 'reading' as View, label: 'Biblioteca', icon: <BookOpen size={20} /> },
    { id: 'progress' as View, label: 'Evolução', icon: <BarChart3 size={20} /> },
  ];

  const handleLogout = () => {
    if (confirm('Deseja encerrar sua sessão no Officium?')) {
      localStorage.removeItem('officium_user');
      window.location.reload();
    }
  };

  return (
    <div className="w-64 h-full border-r bg-[#0a0a0a] flex flex-col p-6 fixed left-0 top-0 z-50 transition-all duration-300 border-white/5 light-mode:border-slate-200 light-mode:bg-white hidden md:flex">
      <div className="mb-12 flex items-center gap-4">
        <Logo size={42} color={currentTheme.primary} />
        <h1 className="text-xl font-black tracking-tight text-white light-mode:text-slate-900">OFFICIUM</h1>
      </div>

      <nav className="flex-1 space-y-2 no-scrollbar overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border ${
                isActive 
                ? 'bg-white/10 text-white border-white/10 shadow-lg' 
                : 'text-zinc-500 hover:text-white border-transparent hover:bg-white/5 light-mode:text-slate-500 light-mode:hover:text-slate-900'
              }`}
              style={isActive ? { 
                backgroundColor: isLight ? `${currentTheme.primary}10` : 'rgba(255,255,255,0.08)',
                color: isLight ? currentTheme.primary : 'white',
                borderColor: isLight ? `${currentTheme.primary}20` : 'rgba(255,255,255,0.1)'
              } : {}}
            >
              <span style={isActive ? { color: isLight ? currentTheme.primary : 'white' } : {}}>{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-white/5 light-mode:border-slate-100">
        <div className="flex items-center gap-4 px-2">
           {user.avatar ? (
             <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
           ) : (
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xs text-zinc-500">
               {user.name.charAt(0)}
             </div>
           )}
           <div className="min-w-0">
              <p className="text-[10px] font-black text-white light-mode:text-slate-900 truncate uppercase tracking-widest">{user.name}</p>
              <p className="text-[8px] text-zinc-600 font-bold uppercase truncate">Protocolo Ativo</p>
           </div>
        </div>

        <div className="space-y-1">
          <button 
            onClick={() => setView('settings')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border ${
              currentView === 'settings' 
              ? 'bg-white/10 text-white border-white/10 shadow-lg' 
              : 'text-zinc-500 hover:text-white border-transparent hover:bg-white/5 light-mode:text-slate-500 light-mode:hover:text-slate-900'
            }`}
            style={currentView === 'settings' ? { 
              backgroundColor: isLight ? `${currentTheme.primary}10` : 'rgba(255,255,255,0.08)',
              color: isLight ? currentTheme.primary : 'white'
            } : {}}
          >
            <SettingsIcon size={20} />
            <span className="font-semibold text-sm">Configurações</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors light-mode:text-slate-400 light-mode:hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="font-semibold text-sm">Encerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
