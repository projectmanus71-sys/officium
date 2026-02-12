
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  isLightMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLightMode }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: name.toLowerCase().replace(/\s+/g, '.') + '@officium.app',
        joinedAt: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700 ${isLightMode ? 'bg-slate-50' : 'bg-[#050505]'}`}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-md w-full glass-card p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] relative z-10 border-white/5 text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Logo size={80} color="#6366f1" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter light-mode:text-slate-900">Officium</h1>
            <p className="text-zinc-500 font-medium text-sm mt-2">Sua central de performance biológica.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Identificação</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como devemos chamar você?" 
              className={`w-full border rounded-2xl px-6 py-5 outline-none transition-all font-bold text-lg ${isLightMode ? 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900' : 'bg-white/5 border-white/10 focus:border-indigo-500/50 text-white'}`}
            />
          </div>

          <button 
            type="submit"
            disabled={!name || loading}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl ${
              loading 
                ? 'opacity-50 cursor-wait bg-zinc-800' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Ecossistema
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} />
            Privacidade de Dados Local
          </div>
          <p className="text-zinc-600 text-[9px] leading-relaxed font-medium uppercase tracking-tighter">
            O Officium não utiliza servidores externos para seus dados pessoais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
