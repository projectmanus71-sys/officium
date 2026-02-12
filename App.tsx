
import React, { useState, useEffect, useCallback } from 'react';
import { View, Habit, HealthStats, Task, ReadingItem, NexusTheme, UserProfile, DaySnapshot } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HabitTracker from './components/HabitTracker';
import Hydration from './components/Hydration';
import SleepEnergy from './components/SleepEnergy';
import ReadingHub from './components/ReadingHub';
import WeeklyPlanner from './components/WeeklyPlanner';
import Settings from './components/Settings';
import ProgressDashboard from './components/ProgressDashboard';
import Login from './components/Login';
import Logo from './components/Logo';
import AIAssistant from './components/AIAssistant';
import { Search, LayoutDashboard, CheckSquare, Calendar, BarChart3, Settings as SettingsIcon, CloudOff, Bell, BrainCircuit } from 'lucide-react';
import { requestNotificationPermission, sendNotification } from './services/notificationService';

const themes: NexusTheme[] = [
  { 
    id: 'cyber-indigo', 
    name: 'Cyber Indigo',
    primary: '#6366f1', 
    secondary: '#818cf8',
    accent: '#a855f7',
    muted: 'rgba(99, 102, 241, 0.1)',
    metrics: { water: '#6366f1', sleep: '#818cf8', energy: '#a855f7' }
  },
  { 
    id: 'emerald-zen', 
    name: 'Emerald Zen',
    primary: '#10b981', 
    secondary: '#34d399',
    accent: '#059669',
    muted: 'rgba(16, 185, 129, 0.1)',
    metrics: { water: '#10b981', sleep: '#34d399', energy: '#059669' }
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('officium_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<View>('dashboard');
  const [themeIndex, setThemeIndex] = useState(() => Number(localStorage.getItem('officium_theme_index') || 0));
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('officium_light_mode') === 'true');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [habits, setHabits] = useState<Habit[]>(() => JSON.parse(localStorage.getItem('officium_habits') || '[]'));
  
  const [stats, setStats] = useState<HealthStats>(() => {
    const saved = localStorage.getItem('officium_stats');
    if (saved) return JSON.parse(saved);
    return {
      water: 0,
      sleep: 0,
      energy: 5,
      caffeine: 0,
      socialBattery: 'carregada',
      bedTime: '23:00',
      wakeTime: '07:00',
      history: []
    };
  });

  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('officium_tasks') || '[]'));
  const [books, setBooks] = useState<ReadingItem[]>(() => JSON.parse(localStorage.getItem('officium_books') || '[]'));
  const [readingGoal, setReadingGoal] = useState(() => Number(localStorage.getItem('officium_reading_goal') || 4));

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  useEffect(() => {
    if (!user) return;
    const today = new Date().toLocaleDateString('sv-SE');
    const habitsCompletedToday = habits.filter(h => h.completedDays.includes(today)).length;
    
    setStats(prev => {
      const history = [...(prev.history || [])];
      const todayIdx = history.findIndex(h => h.date === today);
      
      const currentSnapshot: DaySnapshot = { 
        date: today, 
        water: prev.water,
        energy: prev.energy, 
        sleep: prev.sleep,
        caffeine: prev.caffeine,
        habitsCompleted: habitsCompletedToday,
        totalHabits: habits.length
      };
      
      let newHistory = history;
      if (todayIdx > -1) {
        newHistory[todayIdx] = currentSnapshot;
      } else {
        newHistory.push(currentSnapshot);
      }
      
      const updatedStats = { ...prev, history: newHistory.slice(-730) };
      localStorage.setItem('officium_stats', JSON.stringify(updatedStats));
      return updatedStats;
    });
  }, [stats.water, stats.energy, stats.sleep, stats.caffeine, habits, user]);

  useEffect(() => {
    if (user) localStorage.setItem('officium_user', JSON.stringify(user));
    localStorage.setItem('officium_theme_index', themeIndex.toString());
    localStorage.setItem('officium_light_mode', isLightMode.toString());
    localStorage.setItem('officium_habits', JSON.stringify(habits));
    localStorage.setItem('officium_tasks', JSON.stringify(tasks));
    localStorage.setItem('officium_books', JSON.stringify(books));
    localStorage.setItem('officium_reading_goal', readingGoal.toString());

    if (isLightMode) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [user, themeIndex, isLightMode, habits, tasks, books, readingGoal]);

  const updateStats = useCallback((updates: Partial<HealthStats>) => {
    setStats(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem('officium_stats', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const toggleHabit = (id: string, specificDate?: string) => {
    const dateToToggle = specificDate || new Date().toLocaleDateString('sv-SE');
    setHabits(prev => prev.map(h => h.id === id ? {
      ...h,
      completedDays: h.completedDays.includes(dateToToggle) 
        ? h.completedDays.filter(d => d !== dateToToggle) 
        : [...h.completedDays, dateToToggle]
    } : h));
  };

  const toggleTask = (id: string, date?: string) => {
    const targetDate = date || new Date().toLocaleDateString('sv-SE');
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.frequency !== undefined) {
        const completedDays = t.completedDays || [];
        return {
          ...t,
          completedDays: completedDays.includes(targetDate)
            ? completedDays.filter(d => d !== targetDate)
            : [...completedDays, targetDate]
        };
      }
      return { ...t, completed: !t.completed };
    }));
  };

  if (!user) return <Login onLogin={setUser} isLightMode={isLightMode} />;

  const currentTheme = themes[themeIndex] || themes[0];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 ${isLightMode ? 'bg-slate-50' : 'bg-[#050505]'}`}>
      <Sidebar currentView={view} setView={setView} currentTheme={currentTheme} user={user} />

      <main className="flex-1 w-full max-w-full overflow-hidden relative pb-32 md:pb-10 md:ml-64">
        <header className="px-5 py-4 sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 md:border-none md:bg-transparent flex items-center justify-between pt-safe">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-3">
              <Logo size={28} color={currentTheme.primary} glow={false} />
              <h1 className="text-lg font-black tracking-tighter">OFFICIUM</h1>
            </div>
            {!isOnline && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[8px] font-black uppercase tracking-widest animate-pulse">
                <CloudOff size={10} /> Offline
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setView('nexus')}
              className={`p-3 rounded-2xl transition-all ${view === 'nexus' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 border border-white/5'}`}
             >
                <BrainCircuit size={18} />
             </button>
             <button onClick={() => setView('settings')} className="flex items-center gap-2 p-1 rounded-xl border border-white/5 active:scale-90 transition-transform">
              {user.avatar ? (
                <img src={user.avatar} className="w-8 h-8 rounded-xl object-cover" alt={user.name} />
              ) : (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 text-[10px] font-bold text-white">{user.name[0]}</div>
              )}
            </button>
          </div>
        </header>

        <div className="px-4 py-6 md:p-10 max-w-6xl mx-auto">
          <div className="animate-fadeIn">
            {view === 'dashboard' && <Dashboard stats={stats} books={books} setView={setView} currentTheme={currentTheme} user={user} habits={habits} tasks={tasks} canInstall={!!deferredPrompt} onInstall={handleInstallApp} />}
            {view === 'habits' && <HabitTracker habits={habits} onToggle={toggleHabit} onAddHabit={h => setHabits(p => [...p, h])} onUpdateHabit={h => setHabits(p => p.map(i => i.id === h.id ? h : i))} onDeleteHabit={id => setHabits(p => p.filter(i => i.id !== id))} currentTheme={currentTheme} user={user} onUpdateUser={setUser} />}
            {view === 'planner' && <WeeklyPlanner tasks={tasks} onToggle={toggleTask} onAddTask={t => setTasks(p => [...p, t])} onUpdateTask={t => setTasks(p => p.map(i => i.id === t.id ? t : i))} onDeleteTask={id => setTasks(p => p.filter(i => i.id !== id))} currentTheme={currentTheme} />}
            {view === 'progress' && <ProgressDashboard habits={habits} stats={stats} tasks={tasks} books={books} currentTheme={currentTheme} />}
            {view === 'settings' && <Settings themes={themes} themeIndex={themeIndex} setThemeIndex={setThemeIndex} isLightMode={isLightMode} setIsLightMode={setIsLightMode} user={user} onUpdateUser={setUser} canInstall={!!deferredPrompt} onInstall={handleInstallApp} />}
            {view === 'hydration' && <Hydration water={stats.water} updateWater={v => updateStats({water: v})} currentTheme={currentTheme} user={user} stats={stats} />}
            {view === 'sleep' && <SleepEnergy sleep={stats.sleep} energy={stats.energy} caffeine={stats.caffeine} socialBattery={stats.socialBattery} bedTime={stats.bedTime || '23:00'} wakeTime={stats.wakeTime || '07:00'} updateSleep={v => updateStats({sleep: v})} updateEnergy={v => updateStats({energy: v})} updateCaffeine={v => updateStats({caffeine: v})} updateSocialBattery={v => updateStats({socialBattery: v})} updateTimes={(b, w) => updateStats({bedTime: b, wakeTime: w})} currentTheme={currentTheme} user={user} />}
            {view === 'reading' && <ReadingHub books={books} readingGoal={readingGoal} onAddBook={b => setBooks(p => [...p, b])} onUpdateBook={b => setBooks(p => p.map(i => i.id === b.id ? b : i))} onRemoveBook={id => setBooks(p => p.filter(i => i.id !== id))} onUpdateGoal={setReadingGoal} currentTheme={currentTheme} />}
            {view === 'nexus' && <AIAssistant stats={stats} habits={habits} tasks={tasks} user={user} />}
          </div>
        </div>
      </main>

      <nav className={`md:hidden fixed bottom-6 left-6 right-6 h-20 rounded-[2.5rem] z-50 flex items-center justify-around px-4 backdrop-blur-3xl border transition-all duration-300 mb-safe ${isLightMode ? 'bg-white/90 border-slate-200 shadow-2xl' : 'bg-black/80 border-white/10 shadow-2xl'}`}>
        <MobileTab active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={24} />} theme={currentTheme} />
        <MobileTab active={view === 'habits'} onClick={() => setView('habits')} icon={<CheckSquare size={24} />} theme={currentTheme} />
        <MobileTab active={view === 'planner'} onClick={() => setView('planner')} icon={<Calendar size={24} />} theme={currentTheme} />
        <MobileTab active={view === 'progress'} onClick={() => setView('progress')} icon={<BarChart3 size={24} />} theme={currentTheme} />
        <MobileTab active={view === 'settings'} onClick={() => setView('settings')} icon={<SettingsIcon size={24} />} theme={currentTheme} />
      </nav>
    </div>
  );
};

const MobileTab = ({ active, onClick, icon, theme }: any) => (
  <button 
    onClick={onClick}
    className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 active:scale-75 ${active ? 'scale-110' : 'text-zinc-500 opacity-60'}`}
    style={active ? { color: theme.primary, backgroundColor: `${theme.primary}15` } : {}}
  >
    {icon}
    {active && <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-current" />}
  </button>
);

export default App;
