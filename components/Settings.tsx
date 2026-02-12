
import React, { useState, useRef } from 'react';
import { 
  User, Trash2, Palette, Database, Moon, Sun, Check, Camera, LogOut, 
  DownloadCloud, Smartphone
} from 'lucide-react';
import { NexusTheme, UserProfile } from '../types';

interface SettingsProps {
  themes: NexusTheme[];
  themeIndex: number;
  setThemeIndex: (idx: number) => void;
  isLightMode: boolean;
  setIsLightMode: (val: boolean) => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  themes, 
  themeIndex, 
  setThemeIndex, 
  isLightMode, 
  setIsLightMode,
  user,
  onUpdateUser,
  canInstall,
  onInstall
}) => {
  const isLight = document.body.classList.contains('light-mode');
  const [editName, setEditName] = useState(user.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetData = () => {
    if (confirm('Deseja deletar permanentemente seus dados do Officium? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    if (confirm('Deseja encerrar sua sessão atual?')) {
      localStorage.removeItem('officium_user');
      window.location.reload();
    }
  };

  const saveName = () => {
    onUpdateUser({ ...user, name: editName });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-4xl font-black tracking-tighter uppercase light-mode:text-slate-900">Configurações</h2>
          <p className="text-zinc-500 text-sm font-medium">Sintonize sua experiência no ecossistema.</p>
        </div>

        <div className="md:col-span-2 space-y-8 pb-20">
          {/* Identity Section */}
          <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 light-mode:bg-slate-100 rounded-2xl text-indigo-400">
                  <User size={20} />
                </div>
                <h3 className="font-black text-xl light-mode:text-slate-900">Identidade do Usuário</h3>
              </div>
              <button onClick={handleLogout} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-all">
                <LogOut size={16} className="inline mr-2" /> Encerrar Sessão
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-10">
               <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-white/5 border-4 border-white/5 shadow-2xl relative">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-4xl font-black text-white">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-4 bg-white text-black rounded-2xl shadow-xl hover:scale-110 transition-all border border-black/5"
                    title="Upload de Imagem"
                  >
                    <Camera size={20} />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </button>
               </div>

               <div className="w-full space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Frequência de Identificação (Nome)</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-indigo-500/50 transition-all text-white font-bold"
                      />
                      <button 
                        onClick={saveName}
                        className="p-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                      >
                        <Check size={24} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Device Section */}
          <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/5 light-mode:bg-slate-100 rounded-2xl text-indigo-400">
                <Smartphone size={20} />
              </div>
              <h3 className="font-black text-xl light-mode:text-slate-900">Aplicativo</h3>
            </div>
            
            <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] space-y-4">
              <p className="text-xs font-medium text-zinc-400">Para acesso instantâneo e modo offline aprimorado, instale o Officium em sua tela inicial.</p>
              <button 
                onClick={onInstall}
                disabled={!canInstall}
                className="w-full py-4 bg-indigo-600 disabled:opacity-30 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                <DownloadCloud size={16} /> Instalar Officium
              </button>
            </div>
          </section>

          {/* Theme Section */}
          <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 light-mode:bg-slate-100 rounded-2xl text-indigo-400">
                <Palette size={20} />
              </div>
              <h3 className="font-black text-xl light-mode:text-slate-900">Aparência</h3>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 bg-white/5 light-mode:bg-slate-100 p-1.5 rounded-2xl border border-white/5">
                <button onClick={() => setIsLightMode(false)} className={`flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${!isLightMode ? 'bg-white text-black shadow-lg' : 'text-zinc-500'}`}><Moon size={16} /> Escuro</button>
                <button onClick={() => setIsLightMode(true)} className={`flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${isLightMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}><Sun size={16} /> Claro</button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Sintonização Cromática</label>
                <div className="flex gap-4">
                  {themes.map((t, i) => (
                    <button 
                      key={t.id} 
                      onClick={() => setThemeIndex(i)}
                      className={`w-12 h-12 rounded-2xl transition-all border-2 flex items-center justify-center ${themeIndex === i ? 'scale-110 shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: t.primary, borderColor: themeIndex === i ? 'white' : 'transparent' }}
                    >
                      {themeIndex === i && <Check size={20} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* System Section */}
          <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 light-mode:bg-slate-100 rounded-2xl text-red-400">
                <Database size={20} />
              </div>
              <h3 className="font-black text-xl light-mode:text-slate-900">Periculosidade</h3>
            </div>
            <button onClick={resetData} className="w-full p-6 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-center justify-between hover:bg-red-500/10 transition-all">
              <div className="text-left">
                <p className="text-xs font-black text-red-500 uppercase tracking-widest">Apagar Protocolos</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Limpar todos os dados locais permanentemente</p>
              </div>
              <Trash2 size={20} className="text-red-500" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
