
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Droplets, Moon, Zap, DownloadCloud, BookOpen, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { HealthStats, View, ReadingItem, NexusTheme, UserProfile, Habit, Task, DaySnapshot } from '../types';

interface DashboardProps {
  stats: HealthStats;
  books: ReadingItem[];
  setView: (view: View) => void;
  currentTheme: NexusTheme;
  user: UserProfile;
  habits: Habit[];
  tasks: Task[];
  canInstall?: boolean;
  onInstall?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  books, 
  setView, 
  currentTheme: t, 
  user, 
  canInstall, 
  onInstall 
}) => {
  const isLight = document.body.classList.contains('light-mode');
  
  const currentReadings = useMemo(() => books.filter(b => b.status === 'lendo').slice(0, 2), [books]);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  }, []);

  // Processamento de dados reais do histórico para o gráfico
  const chartData = useMemo(() => {
    const history = stats.history || [];
    // Pega os últimos 7 registros ou cria placeholders se vazio
    const last7 = history.slice(-7);
    
    if (last7.length === 0) {
      // Estado inicial caso não haja histórico
      const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
      return days.map(name => ({ name, energy: 0, sleep: 0 }));
    }

    return last7.map((entry: DaySnapshot) => {
      const date = new Date(entry.date + 'T12:00:00');
      return {
        name: date.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
        energy: entry.energy,
        sleep: entry.sleep,
        fullDate: entry.date
      };
    });
  }, [stats.history]);

  const MiniStat = ({ icon, label, value, unit, hexColor, view }: any) => (
    <div 
      onClick={() => setView(view)}
      className="glass-card p-3 md:p-4 rounded-3xl flex flex-col items-center justify-center gap-2 flex-1 active:scale-95 transition-transform border-b-2 cursor-pointer hover:bg-white/[0.02]"
      style={{ borderBottomColor: `${hexColor}40` }}
    >
      <div className="p-2 rounded-xl" style={{ backgroundColor: `${hexColor}15`, color: hexColor }}>
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
      <div className="text-center">
        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter text-zinc-500 mb-0.5">{label}</p>
        <div className="flex items-baseline gap-0.5 justify-center">
          <span className="text-xl md:text-2xl font-black tabular-nums light-mode:text-slate-900">{value}</span>
          <span className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-slideUp">
      {/* PWA Install Prompt */}
      {canInstall && (
        <div className="glass-card p-5 rounded-[2rem] border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <DownloadCloud size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white light-mode:text-slate-900 uppercase tracking-tight">Baixar Officium</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Acesso instantâneo offline</p>
              </div>
           </div>
           <button 
            onClick={onInstall}
            className="px-5 py-2.5 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-90 transition-all"
           >
             Instalar
           </button>
        </div>
      )}

      <div className="flex items-end justify-between px-1">
        <div className="space-y-1.5">
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter light-mode:text-slate-900 leading-none">
            {greeting}, <span className="text-indigo-500">{user.name.split(' ')[0]}</span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Sincronização Ativa • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <button 
          onClick={() => setView('progress')}
          className="p-3 bg-white/5 light-mode:bg-slate-100 rounded-2xl text-zinc-500 hover:text-white transition-all hidden md:block"
          title="Ver Histórico Completo"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar py-2">
        <MiniStat icon={<Droplets />} label="Água" value={stats.water.toFixed(1)} unit="L" hexColor={t.metrics.water} view="hydration" />
        <MiniStat icon={<Moon />} label="Sono" value={stats.sleep.toFixed(1)} unit="h" hexColor={t.metrics.sleep} view="sleep" />
        <MiniStat icon={<Zap />} label="Energia" value={stats.energy} unit="/10" hexColor={t.metrics.energy} view="sleep" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Gráfico de Performance Real */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-[2.5rem] overflow-hidden group cursor-pointer" onClick={() => setView('progress')}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-black tracking-tight light-mode:text-slate-900 flex items-center gap-2">
                Vitalidade <TrendingUp size={16} className="text-indigo-500" />
              </h3>
              <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest mt-1">Oscilação dos Últimos 7 Dias</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.primary }} />
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Energia</span>
               </div>
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sono</span>
               </div>
            </div>
          </div>

          <div className="h-52 md:h-64 w-full -ml-4">
            {chartData.every(d => d.energy === 0) ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-zinc-700 space-y-2">
                <Calendar size={32} opacity={0.2} />
                <p className="text-[10px] font-black uppercase tracking-widest">Aguardando dados históricos...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={t.primary} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={t.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: isLight ? '#94a3b8' : '#52525b', fontSize: 10, fontWeight: 800}} 
                  />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isLight ? '#fff' : '#121212', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                    cursor={{ stroke: t.primary, strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="#818cf8" 
                    fill="url(#sleepGrad)" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    animationDuration={1000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="energy" 
                    stroke={t.primary} 
                    fill="url(#energyGrad)" 
                    strokeWidth={4} 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-black tracking-tight light-mode:text-slate-900">Biblioteca</h3>
              <BookOpen size={18} className="text-zinc-500" />
            </div>
            
            <div className="space-y-5">
              {currentReadings.length > 0 ? currentReadings.map(book => (
                <div key={book.id} className="flex gap-4 items-center group active:opacity-70 transition-opacity cursor-pointer" onClick={() => setView('reading')}>
                  <div className="w-10 h-14 overflow-hidden rounded-xl shadow-lg flex-shrink-0">
                    <img src={book.coverUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[10px] md:text-xs truncate uppercase tracking-tight light-mode:text-slate-900">{book.title}</p>
                    <div className="flex justify-between items-end mt-1.5">
                       <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{book.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 light-mode:bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${book.progress}%` }} />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl">
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Sem leituras ativas</p>
                </div>
              )}
            </div>
          </div>
          
          <button onClick={() => setView('reading')} className="w-full py-3.5 bg-white/5 light-mode:bg-slate-50 border border-white/5 light-mode:border-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all">
            Abrir Biblioteca
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
