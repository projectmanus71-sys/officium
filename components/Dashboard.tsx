
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Droplets, Moon, Zap, DownloadCloud, BookOpen, Sparkles, TrendingUp, Calendar, 
  BrainCircuit, Activity, ChevronRight
} from 'lucide-react';
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
  onInstall,
  habits,
  tasks
}) => {
  const isLight = document.body.classList.contains('light-mode');
  
  const currentReadings = useMemo(() => books.filter(b => b.status === 'lendo').slice(0, 2), [books]);
  const activeTasks = useMemo(() => {
    const today = new Date().toLocaleDateString('sv-SE');
    return tasks.filter(t => t.date === today && !t.completed).slice(0, 3);
  }, [tasks]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  }, []);

  const performanceScore = useMemo(() => {
    const s = stats.sleep / 8;
    const w = stats.water / 3;
    const e = stats.energy / 10;
    return Math.min(Math.round(((s + w + e) / 3) * 100), 100);
  }, [stats]);

  const chartData = useMemo(() => {
    const history = stats.history || [];
    const last7 = history.slice(-7);
    if (last7.length === 0) {
      const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
      return days.map(name => ({ name, energy: 0, sleep: 0 }));
    }
    return last7.map((entry: DaySnapshot) => {
      const date = new Date(entry.date + 'T12:00:00');
      return {
        name: date.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
        energy: entry.energy,
        sleep: entry.sleep,
      };
    });
  }, [stats.history]);

  const MiniStat = ({ icon, label, value, unit, hexColor, view }: any) => (
    <div 
      onClick={() => setView(view)}
      className="glass-card p-4 md:p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 flex-1 active:scale-95 transition-all border-b-4 cursor-pointer hover:bg-white/[0.04]"
      style={{ borderBottomColor: `${hexColor}60` }}
    >
      <div className="p-3 rounded-2xl" style={{ backgroundColor: `${hexColor}15`, color: hexColor }}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-1 justify-center">
          <span className="text-2xl md:text-3xl font-black tabular-nums light-mode:text-slate-900">{value}</span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-slideUp">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocolo Ativo</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter light-mode:text-slate-900 leading-none">
            {greeting}, <span className="text-indigo-500">{user.name.split(' ')[0]}</span>
          </h2>
          <p className="text-zinc-500 text-xs font-medium max-w-md">Nexus Intelligence detectou {performanceScore}% de potencial de performance biológica para hoje.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
            onClick={() => setView('nexus')}
            className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
           >
              <BrainCircuit size={18} />
              <span>Análise Nexus</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MiniStat icon={<Droplets />} label="Hidratação" value={stats.water.toFixed(1)} unit="L" hexColor={t.metrics.water} view="hydration" />
        <MiniStat icon={<Moon />} label="Sono" value={stats.sleep.toFixed(1)} unit="h" hexColor={t.metrics.sleep} view="sleep" />
        <div className="col-span-2 md:col-span-1">
          <MiniStat icon={<Zap />} label="Energia" value={stats.energy} unit="/10" hexColor={t.metrics.energy} view="sleep" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-[3rem] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight light-mode:text-slate-900 flex items-center gap-3">
                  Vitalidade <TrendingUp size={20} className="text-indigo-500" />
                </h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Sincronização de biometria semanal</p>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button onClick={() => setView('progress')} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">Ver Histórico</button>
              </div>
            </div>

            <div className="h-64 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={t.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={t.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 700}} />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isLight ? '#fff' : '#121212', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
                    cursor={{ stroke: t.primary, strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="energy" stroke={t.primary} fill="url(#energyGrad)" strokeWidth={4} animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-lg font-black light-mode:text-slate-900 uppercase tracking-tighter">Agenda Imediata</h4>
                   <Calendar size={18} className="text-zinc-600" />
                </div>
                <div className="space-y-3">
                   {activeTasks.length > 0 ? activeTasks.map(task => (
                     <div key={task.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => setView('planner')}>
                        <div className={`w-2 h-2 rounded-full ${task.priority === 'alta' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-indigo-500'}`} />
                        <span className="flex-1 text-sm font-bold text-zinc-300 group-hover:text-white truncate">{task.title}</span>
                        <span className="text-[10px] font-black text-zinc-600">{task.reminderTime}</span>
                     </div>
                   )) : (
                     <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-[10px] font-black text-zinc-700 uppercase">Fim da Linha de Tarefas</p>
                     </div>
                   )}
                </div>
                <button onClick={() => setView('planner')} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white border border-white/5 rounded-2xl transition-all">Abrir Planejador</button>
             </div>

             <div className="glass-card p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-black light-mode:text-slate-900 uppercase tracking-tighter">Consistência</h4>
                    <Sparkles size={18} className="text-zinc-600" />
                  </div>
                  <div className="space-y-4">
                     {habits.slice(0, 3).map(habit => {
                       const done = habit.completedDays.includes(new Date().toLocaleDateString('sv-SE'));
                       return (
                         <div key={habit.id} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-400">{habit.name}</span>
                            <div className={`w-3 h-3 rounded-full ${done ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-white/5'}`} />
                         </div>
                       );
                     })}
                  </div>
                </div>
                <button onClick={() => setView('habits')} className="w-full py-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all">Protocolos Ativos</button>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass-card p-8 rounded-[3rem] border-white/5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black light-mode:text-slate-900">Biblioteca</h3>
                <BookOpen size={20} className="text-zinc-500" />
              </div>
              
              <div className="flex-1 space-y-6">
                {currentReadings.length > 0 ? currentReadings.map(book => (
                  <div key={book.id} className="group relative" onClick={() => setView('reading')}>
                    <div className="flex gap-5 items-center cursor-pointer transition-all active:scale-95">
                      <div className="w-16 h-24 overflow-hidden rounded-2xl shadow-2xl flex-shrink-0 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                        <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs md:text-sm truncate uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors">{book.title}</p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{book.author}</p>
                        <div className="mt-4 space-y-2">
                           <div className="flex justify-between text-[9px] font-black text-zinc-600 uppercase">
                              <span>Progresso</span>
                              <span>{book.progress}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${book.progress}%` }} />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center gap-4">
                     <BookOpen size={40} className="text-zinc-800" />
                     <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Sem leituras pendentes</p>
                  </div>
                )}
              </div>

              <button onClick={() => setView('reading')} className="mt-10 w-full py-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white hover:bg-white/10 transition-all group">
                Explorar Hub
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
