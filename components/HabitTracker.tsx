
import React, { useState, useMemo } from 'react';
import { 
  Plus, Check, Flame, X, Target, Edit2, Trash2, 
  LayoutGrid, ListChecks, ChevronLeft, ChevronRight, Hash, CalendarRange
} from 'lucide-react';
import { Habit, NexusTheme, UserProfile } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  onToggle: (habitId: string, date?: string) => void;
  onAddHabit: (habit: Habit) => void;
  onUpdateHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  currentTheme: NexusTheme;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

type ViewMode = 'grid' | 'checklist';

const HabitTracker: React.FC<HabitTrackerProps> = ({ 
  habits, 
  onToggle, 
  onAddHabit, 
  onUpdateHabit, 
  onDeleteHabit, 
  currentTheme,
  user,
  onUpdateUser
}) => {
  const isLight = document.body.classList.contains('light-mode');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  const [newName, setNewName] = useState('');
  const [category, setCategory] = useState('Saúde');
  const [frequency, setFrequency] = useState(7);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const today = useMemo(() => new Date().toLocaleDateString('sv-SE'), []);
  
  const defaultCategories = ['Saúde', 'Foco', 'Corpo', 'Mente'];
  const allCategories = useMemo(() => {
    const combined = [...defaultCategories, ...(user.customCategories || [])];
    return Array.from(new Set(combined));
  }, [user.customCategories]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('sv-SE'),
        label: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
        dayNum: d.getDate()
      };
    });
  }, []);

  // Calcula consistência semanal (quantos dias concluídos nos últimos 7 dias vs frequência)
  const getWeeklyProgress = (habit: Habit) => {
    const last7ISO = last7Days.map(d => d.date);
    const completedThisWeek = habit.completedDays.filter(d => last7ISO.includes(d)).length;
    return {
      completed: completedThisWeek,
      target: habit.frequency,
      percentage: Math.min((completedThisWeek / habit.frequency) * 100, 100)
    };
  };

  const openAddModal = () => {
    setEditingHabit(null);
    setNewName('');
    setCategory('Saúde');
    setFrequency(7);
    setIsAddingNewCategory(false);
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setNewName(habit.name);
    setCategory(habit.category);
    setFrequency(habit.frequency || 7);
    setIsAddingNewCategory(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let finalCategory = category;
    if (isAddingNewCategory && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
      const updatedCategories = [...(user.customCategories || []), finalCategory];
      onUpdateUser({ ...user, customCategories: updatedCategories });
    }

    if (editingHabit) {
      onUpdateHabit({
        ...editingHabit,
        name: newName,
        category: finalCategory,
        frequency: frequency
      });
    } else {
      onAddHabit({
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        category: finalCategory,
        completedDays: [],
        frequency: frequency,
        color: currentTheme.primary
      });
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este hábito? Todo o histórico de consistência será perdido.')) {
      onDeleteHabit(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight light-mode:text-slate-900">Hábitos</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Sintonização de Consistência</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 light-mode:bg-slate-100 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('checklist')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'checklist' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <ListChecks size={18} />
            </button>
          </div>
          
          <button 
            onClick={openAddModal}
            className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const isDone = habit.completedDays.includes(today);
            const progress = getWeeklyProgress(habit);
            return (
              <div key={habit.id} className="glass-card p-6 rounded-[2rem] border-white/5 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col justify-between gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 px-2 py-0.5 rounded-md bg-white/5 text-zinc-500 inline-block">
                      {habit.category}
                    </span>
                    <h4 className="text-lg font-black truncate light-mode:text-slate-900 mt-1">{habit.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <CalendarRange size={12} className="text-zinc-600" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        {progress.completed}/{progress.target} dias nesta semana
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onToggle(habit.id)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isDone 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'bg-white/5 text-zinc-700 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isDone ? <Check size={28} strokeWidth={3} /> : <Plus size={28} strokeWidth={2} />}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000" 
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1.5">
                        <Flame size={14} className={habit.completedDays.length > 0 ? "text-orange-500" : "text-zinc-800"} />
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{habit.completedDays.length} Dias Total</span>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(habit)} className="p-1.5 text-zinc-600 hover:text-white transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(habit.id)} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocolo</th>
                  {last7Days.map(day => (
                    <th key={day.date} className="p-4 text-center">
                      <div className={`flex flex-col items-center gap-1 ${day.date === today ? 'text-indigo-400' : 'text-zinc-600'}`}>
                        <span className="text-[9px] font-black uppercase">{day.label}</span>
                        <span className="text-xs font-bold">{day.dayNum}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-6 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Meta</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => (
                  <tr key={habit.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6 min-w-[200px]">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">{habit.category}</span>
                        <span className="text-sm font-bold text-white light-mode:text-slate-900 group-hover:text-indigo-400 transition-colors">{habit.name}</span>
                      </div>
                    </td>
                    {last7Days.map(day => {
                      const isDone = habit.completedDays.includes(day.date);
                      return (
                        <td key={day.date} className="p-2 text-center">
                          <button 
                            onClick={() => onToggle(habit.id, day.date)}
                            className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center transition-all ${
                              isDone 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'bg-white/5 text-zinc-800 border border-white/5 hover:border-white/20'
                            }`}
                          >
                            {isDone ? <Check size={18} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-6 text-center">
                       <span className="text-xs font-black text-white px-2 py-1 bg-white/5 rounded-lg">{habit.frequency}x</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {habits.length === 0 && (
        <div className="py-20 text-center glass-card border-dashed border-2 border-white/5 rounded-[2.5rem]">
           <Target size={40} className="mx-auto text-zinc-800 mb-4" />
           <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">Inicie um novo protocolo</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 relative animate-in zoom-in-95 duration-200 border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter">{editingHabit ? 'Editar Protocolo' : 'Novo Hábito'}</h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Configuração Nexus</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-2">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Descrição</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Meditação Profunda" 
                  className="w-full rounded-2xl px-6 py-5 bg-white/5 border border-white/10 outline-none focus:border-indigo-500 text-white font-bold text-lg transition-all" 
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Categoria</label>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                    className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    {isAddingNewCategory ? 'Voltar' : '+ Criar Nova'}
                  </button>
                </div>
                
                {isAddingNewCategory ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="Nome da categoria..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          category === cat 
                          ? 'bg-white text-black border-white shadow-md' 
                          : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Recorrência Semanal</label>
                  <span className="text-xl font-black text-white tabular-nums">{frequency}x</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFrequency(num)}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black transition-all border ${
                        frequency === num
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                        : 'bg-white/5 text-zinc-600 border-white/5'
                      }`}
                    >
                      {num === 7 ? 'Diário' : `${num}x`}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 mt-4"
              >
                {editingHabit ? 'Atualizar Protocolo' : 'Ativar Hábito'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
