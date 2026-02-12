
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Circle, 
  CheckCircle2, 
  Plus, 
  X, 
  LayoutGrid, 
  CalendarDays, 
  Layers,
  Trash2,
  Clock,
  Edit2,
  Bell,
  RefreshCw
} from 'lucide-react';
import { Task, NexusTheme } from '../types';

interface WeeklyPlannerProps {
  tasks: Task[];
  onToggle: (taskId: string, date?: string) => void;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  currentTheme: NexusTheme;
}

type PlannerView = 'day' | 'week' | 'month';

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ tasks, onToggle, onAddTask, onUpdateTask, onDeleteTask, currentTheme }) => {
  const [view, setView] = useState<PlannerView>('week');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'baixa' | 'média' | 'alta'>('média');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState('');
  const [newTaskFrequency, setNewTaskFrequency] = useState<number | undefined>(undefined);

  const toISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayISO = useMemo(() => toISO(new Date()), []);

  const openAddModal = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskPriority('média');
    setNewTaskDate(toISO(currentDate));
    setNewTaskReminder('');
    setNewTaskFrequency(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskPriority(task.priority);
    setNewTaskDate(task.date);
    setNewTaskReminder(task.reminderTime || '');
    setNewTaskFrequency(task.frequency);
    setIsModalOpen(true);
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const monthDays = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];
    const startDay = start.getDay();
    const leadingEmptyDays = startDay === 0 ? 6 : startDay - 1;
    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    for (let i = leadingEmptyDays - 1; i >= 0; i--) {
      days.push(new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i));
    }
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i));
    }
    return days;
  }, [currentDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskData: Task = {
      id: editingTask ? editingTask.id : Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      date: newTaskDate,
      reminderTime: newTaskReminder || undefined,
      completed: editingTask ? editingTask.completed : false,
      completedDays: editingTask ? editingTask.completedDays : [],
      frequency: newTaskFrequency,
      priority: newTaskPriority,
      notified: editingTask && newTaskReminder === editingTask.reminderTime ? editingTask.notified : false
    };

    if (editingTask) {
      onUpdateTask(taskData);
    } else {
      onAddTask(taskData);
    }

    setIsModalOpen(false);
  };

  const getDayTasks = (dateISO: string) => {
    return tasks.filter(t => {
      if (t.frequency !== undefined) {
        // Tarefas recorrentes aparecem todos os dias ou de acordo com a lógica
        // Aqui simplificamos: se é recorrente, aparece no planejador diário para check-in
        return true; 
      }
      return t.date === dateISO;
    });
  };

  const renderDayView = () => {
    const currentISO = toISO(currentDate);
    const dayTasks = getDayTasks(currentISO);
    const isToday = currentISO === todayISO;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-[2rem] border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${isToday ? 'bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-indigo-100' : 'text-zinc-500'}`}>
                {currentDate.toLocaleDateString('pt-BR', { month: 'short' })}
              </span>
              <span className={`text-2xl font-black ${isToday ? 'text-white' : 'text-zinc-200'}`}>
                {currentDate.getDate()}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white capitalize">
                {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
              </h3>
              <p className="text-zinc-500 text-sm font-medium">
                {dayTasks.length} {dayTasks.length === 1 ? 'Tarefa programada' : 'Tarefas programadas'}
              </p>
            </div>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Adicionar Agora
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {dayTasks.length > 0 ? (
            dayTasks.map(task => (
             <TaskItem 
               key={task.id} 
               task={task} 
               date={currentISO}
               onToggle={onToggle} 
               onEdit={() => openEditModal(task)} 
               onDelete={() => onDeleteTask(task.id)} 
             />
            ))
          ) : (
            <div className="text-center py-24 glass-card rounded-[2rem] border-dashed border-2 border-white/5 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-zinc-400 font-bold">Cronograma Vazio</p>
                <p className="text-zinc-600 text-sm">Nenhum evento registrado para este período.</p>
              </div>
              <button onClick={openAddModal} className="text-indigo-400 font-bold text-sm hover:underline mt-2">
                Começar planejamento
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 animate-in fade-in duration-500">
        {weekDays.map((day, idx) => {
          const dateISO = toISO(day);
          const dayTasks = getDayTasks(dateISO);
          const isToday = dateISO === todayISO;
          const isSelected = dateISO === toISO(currentDate);

          return (
            <div 
              key={idx} 
              onClick={() => setCurrentDate(day)}
              className={`glass-card p-5 rounded-[1.5rem] flex flex-col gap-4 min-h-[350px] transition-all cursor-pointer group relative ${
                isSelected ? 'border-indigo-500/50 bg-indigo-500/[0.03] ring-1 ring-indigo-500/20 scale-[1.02] z-10' : 
                isToday ? 'bg-white/5 border-white/20' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`}>
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <p className={`text-2xl font-black ${isToday ? 'text-indigo-400' : 'text-zinc-200'}`}>
                    {day.getDate()}
                  </p>
                </div>
                {isSelected && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); openAddModal(); }}
                    className="p-1.5 bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[250px] pr-1 no-scrollbar">
                {dayTasks.length > 0 ? dayTasks.map(t => {
                  const isDone = t.frequency !== undefined 
                    ? (t.completedDays || []).includes(dateISO)
                    : t.completed;

                  return (
                    <div 
                      key={t.id} 
                      onClick={(e) => { e.stopPropagation(); onToggle(t.id, dateISO); }}
                      className={`text-[11px] p-3 rounded-xl cursor-pointer truncate transition-all border group/task relative ${
                        isDone 
                          ? 'bg-white/5 text-zinc-600 line-through border-transparent opacity-60' 
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:border-indigo-500/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'alta' ? 'bg-red-500' : t.priority === 'média' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{t.title}</span>
                          <div className="flex items-center gap-2">
                            {t.reminderTime && (
                              <span className="text-[8px] opacity-70 flex items-center gap-1">
                                <Bell size={8} /> {t.reminderTime}
                              </span>
                            )}
                            {t.frequency !== undefined && (
                              <span className="text-[7px] font-black uppercase bg-indigo-500/20 px-1 rounded flex items-center gap-0.5">
                                <RefreshCw size={6} /> {t.frequency}x
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity bg-inherit pl-2">
                         <button onClick={(e) => { e.stopPropagation(); openEditModal(t); }} className="p-1 hover:text-white"><Edit2 size={10} /></button>
                         <button onClick={(e) => { e.stopPropagation(); onDeleteTask(t.id); }} className="p-1 hover:text-red-400"><Trash2 size={10} /></button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-tighter">Livre</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="grid grid-cols-7 gap-3 mb-2">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-600 py-3">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {monthDays.map((day, idx) => {
            const dateISO = toISO(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const dayTasks = getDayTasks(dateISO);
            const isToday = dateISO === todayISO;
            const isSelected = dateISO === toISO(currentDate);

            return (
              <div 
                key={idx} 
                onClick={() => setCurrentDate(day)}
                className={`h-32 glass-card p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/[0.02]' : 
                  isToday ? 'border-white/20 bg-white/5' : 
                  isCurrentMonth ? 'border-white/5 hover:border-white/10' : 'opacity-20 grayscale border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                   <span className={`text-sm font-black ${isToday ? 'text-indigo-400' : isSelected ? 'text-white' : 'text-zinc-600'}`}>
                    {day.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-lg shadow-lg shadow-indigo-500/20">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 mt-auto">
                   {dayTasks.slice(0, 2).map(t => {
                      const isDone = t.frequency !== undefined ? (t.completedDays || []).includes(dateISO) : t.completed;
                      return <div key={t.id} className={`h-1 rounded-full ${isDone ? 'bg-zinc-800' : 'bg-indigo-500/60'}`} />;
                   })}
                   {dayTasks.length > 2 && <div className="text-[8px] font-black text-zinc-700 text-center">+{dayTasks.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-3 rounded-2xl border-white/5 sticky top-[5.5rem] z-30 bg-[#050505]/60 backdrop-blur-xl">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          <ViewToggle active={view === 'day'} onClick={() => setView('day')} icon={<LayoutGrid size={16} />} label="Dia" />
          <ViewToggle active={view === 'week'} onClick={() => setView('week')} icon={<Layers size={16} />} label="Semana" />
          <ViewToggle active={view === 'month'} onClick={() => setView('month')} icon={<CalendarDays size={16} />} label="Mês" />
        </div>

        <div className="flex flex-1 items-center justify-center gap-6">
           <div className="flex items-center gap-4">
             <NavBtn onClick={() => navigate(-1)} icon={<ChevronLeft size={20} />} />
             <div className="text-center min-w-[150px]">
                <h3 className="text-sm font-black text-white uppercase tracking-widest truncate">
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
             </div>
             <NavBtn onClick={() => navigate(1)} icon={<ChevronRight size={20} />} />
           </div>
           <button 
             onClick={() => setCurrentDate(new Date())} 
             className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border border-white/5 hover:text-white hover:bg-white/5 transition-all"
           >
             Hoje
           </button>
        </div>

        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-white/5 hover:scale-105 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Tarefa</span>
        </button>
      </div>

      <div className="min-h-[600px] pb-10">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </div>

      {isModalOpen && (
        <TaskModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSubmit} 
          title={newTaskTitle}
          setTitle={setNewTaskTitle}
          priority={newTaskPriority}
          setPriority={setNewTaskPriority}
          date={newTaskDate}
          setDate={setNewTaskDate}
          reminder={newTaskReminder}
          setReminder={setNewTaskReminder}
          frequency={newTaskFrequency}
          setFrequency={setNewTaskFrequency}
          isEditing={!!editingTask}
        />
      )}
    </div>
  );
};

const ViewToggle = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${
      active ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
    }`}
  >
    {icon}
    <span className="hidden xl:inline">{label}</span>
  </button>
);

const NavBtn = ({ onClick, icon }: { onClick: () => void, icon: any }) => (
  <button onClick={onClick} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
    {icon}
  </button>
);

const TaskItem: React.FC<{ task: Task, date: string, onToggle: (id: string, date?: string) => void, onEdit: () => void, onDelete: () => void }> = ({ task, date, onToggle, onEdit, onDelete }) => {
  const isDone = task.frequency !== undefined 
    ? (task.completedDays || []).includes(date)
    : task.completed;

  return (
    <div 
      className={`glass-card p-6 rounded-[1.5rem] flex items-center gap-6 transition-all group ${
        isDone ? 'opacity-40 grayscale' : 'hover:border-white/20 hover:bg-white/[0.01]'
      }`}
    >
      <button 
        onClick={() => onToggle(task.id, date)}
        className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${isDone ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 text-zinc-700 group-hover:border-white/20'}`}
      >
        {isDone ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Circle size={24} />}
      </button>
      <div className="flex-1 min-w-0" onClick={() => onToggle(task.id, date)}>
        <h5 className={`text-lg font-bold truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
          {task.title}
        </h5>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-1 rounded-md border ${
            task.priority === 'alta' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
            task.priority === 'média' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
            'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {task.priority}
          </span>
          {task.reminderTime && (
            <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
              <Bell size={12} /> {task.reminderTime}
            </span>
          )}
          {task.frequency !== undefined && (
            <span className="text-[10px] font-black text-indigo-400 flex items-center gap-1 uppercase tracking-tighter">
              <RefreshCw size={12} /> Recorrente {task.frequency}x/sem
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
         <button onClick={onEdit} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><Edit2 size={16} className="text-zinc-500" /></button>
         <button onClick={onDelete} className="p-3 bg-red-500/5 hover:bg-red-500/20 rounded-xl transition-all"><Trash2 size={16} className="text-red-500/60" /></button>
      </div>
    </div>
  );
};

const TaskModal = ({ onClose, onSubmit, title, setTitle, priority, setPriority, date, setDate, reminder, setReminder, frequency, setFrequency, isEditing }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
    <div className="glass-card w-full max-w-lg rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-200 border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter">{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Configuração de Cronograma</p>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white p-2">
          <X size={28} />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descrição</label>
          <input 
            autoFocus
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Treino de Força" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-indigo-500 transition-all text-white text-lg font-medium"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Data Base</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all text-white text-sm"
              />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lembrete (Notificação)</label>
              <input 
                type="time" 
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all text-white text-sm"
              />
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recorrência Semanal</label>
            <button 
              type="button" 
              onClick={() => setFrequency(frequency === undefined ? 7 : undefined)}
              className="text-[9px] font-black text-indigo-500 uppercase tracking-widest"
            >
              {frequency === undefined ? 'Ativar Repetição' : 'Desativar'}
            </button>
          </div>
          
          {frequency !== undefined && (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
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
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prioridade</label>
          <div className="flex gap-2">
            {(['baixa', 'média', 'alta'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                  priority === p ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-zinc-600 border-white/5 hover:border-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-indigo-500/40 uppercase tracking-[0.2em] text-xs">
          {isEditing ? 'Salvar Alterações' : 'Confirmar Registro'}
        </button>
      </form>
    </div>
  </div>
);

export default WeeklyPlanner;
