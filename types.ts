
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  customCategories?: string[];
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  completedDays: string[]; // Datas ISO (YYYY-MM-DD)
  frequency: number; // Vezes por semana (1-7)
  color: string;
  streak?: number;
}

export interface DaySnapshot {
  date: string; // YYYY-MM-DD
  water: number;
  sleep: number;
  energy: number;
  caffeine: number;
  habitsCompleted: number;
  totalHabits: number;
  cognitiveLoad?: number;
}

export interface HealthStats {
  water: number;
  sleep: number;
  energy: number;
  caffeine: number;
  socialBattery: 'vazia' | 'baixa' | 'carregada';
  bedTime?: string; // HH:mm
  wakeTime?: string; // HH:mm
  history: DaySnapshot[];
}

export interface Task {
  id: string;
  title: string;
  date: string;
  reminderTime?: string; // Formato HH:mm
  completed: boolean; // Para tarefas únicas
  completedDays?: string[]; // Para tarefas recorrentes (ISO YYYY-MM-DD)
  frequency?: number; // Vezes por semana (1-7), undefined = tarefa única
  priority: 'baixa' | 'média' | 'alta';
  notified?: boolean;
}

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  progress: number;
  currentPage?: number;
  totalPages?: number;
  status: 'lendo' | 'fila' | 'concluído';
  coverUrl: string;
  completedDate?: string;
}

export interface NexusTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  metrics: {
    water: string;
    sleep: string;
    energy: string;
  };
}

export type View = 'dashboard' | 'habits' | 'hydration' | 'sleep' | 'reading' | 'planner' | 'settings' | 'progress' | 'nexus';
export type TimeScale = 'semana' | 'mês' | 'ano';
