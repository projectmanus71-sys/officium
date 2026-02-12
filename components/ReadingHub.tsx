
import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Edit2, Trash2, Book, ChevronUp, ChevronDown, Sparkles, RefreshCw, ImageOff, Filter } from 'lucide-react';
import { ReadingItem, NexusTheme } from '../types';
import { searchBookCover } from '../services/geminiService';

interface ReadingHubProps {
  books: ReadingItem[];
  readingGoal: number;
  onAddBook: (book: ReadingItem) => void;
  onUpdateBook: (book: ReadingItem) => void;
  onRemoveBook: (id: string) => void;
  onUpdateGoal: (goal: number) => void;
  currentTheme: NexusTheme;
}

type StatusFilter = 'todos' | 'lendo' | 'fila' | 'concluído';

const ReadingHub: React.FC<ReadingHubProps> = ({ books, readingGoal, onAddBook, onUpdateBook, onRemoveBook, onUpdateGoal, currentTheme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<ReadingItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [loadingIA, setLoadingIA] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [status, setStatus] = useState<'lendo' | 'fila' | 'concluído'>('fila');
  const [coverUrl, setCoverUrl] = useState('');

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            b.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, searchQuery, statusFilter]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const completedThisMonth = books.filter(b => {
      if (b.status !== 'concluído' || !b.completedDate) return false;
      const d = new Date(b.completedDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return {
      completedCount: completedThisMonth.length,
      percentage: Math.min((completedThisMonth.length / readingGoal) * 100, 100)
    };
  }, [books, readingGoal]);

  const fetchCover = async () => {
    if (!title) return;
    setLoadingIA(true);
    try {
      const data = await searchBookCover(title, author);
      if (data) {
        if (data.image_url) setCoverUrl(data.image_url);
        if (data.author_name && !author) setAuthor(data.author_name);
        if (data.total_pages && totalPages === 0) setTotalPages(data.total_pages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIA(false);
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setCurrentPage(0);
    setTotalPages(0);
    setStatus('fila');
    setCoverUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (book: ReadingItem) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setCurrentPage(book.currentPage || 0);
    setTotalPages(book.totalPages || 0);
    setStatus(book.status);
    setCoverUrl(book.coverUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todayISO = new Date().toLocaleDateString('sv-SE');
    
    // Auto-calculate progress
    let calculatedProgress = 0;
    if (status === 'concluído') {
      calculatedProgress = 100;
    } else if (totalPages > 0) {
      calculatedProgress = Math.min(Math.round((currentPage / totalPages) * 100), 100);
    }

    const bookData: ReadingItem = {
      id: editingBook ? editingBook.id : Math.random().toString(36).substr(2, 9),
      title,
      author: author || 'Autor Desconhecido',
      currentPage: status === 'concluído' ? totalPages : currentPage,
      totalPages: totalPages || 0,
      progress: calculatedProgress,
      status,
      coverUrl: coverUrl || '',
      completedDate: status === 'concluído' ? (editingBook?.completedDate || todayISO) : undefined
    };

    if (editingBook) {
      onUpdateBook(bookData);
    } else {
      onAddBook(bookData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja remover este livro da sua biblioteca permanente?')) {
      onRemoveBook(id);
    }
  };

  const BookCover = ({ book }: { book: ReadingItem }) => {
    if (book.coverUrl) {
      return (
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl font-black text-violet-500/40 mb-2">{book.title.charAt(0)}</span>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter line-clamp-2">{book.title}</p>
          <div className="h-px w-6 bg-zinc-800 mx-auto my-1" />
          <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate max-w-[100px]">{book.author}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white light-mode:text-slate-900">Biblioteca</h2>
          <p className="text-zinc-500 text-sm mt-1">Sintonização de conhecimento e expansão cognitiva.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar título..." 
              className="bg-white/5 border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:border-violet-500/30 text-sm transition-all w-64 text-white"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-violet-600/20 hover:scale-105"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Category Filter - Optional function requested */}
        <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          {(['todos', 'lendo', 'fila', 'concluído'] as StatusFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setStatusFilter(cat)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === cat 
                ? 'bg-white text-black shadow-lg' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-zinc-600">
          <Filter size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{filteredBooks.length} Obras Filtradas</span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ritmo de Absorção</span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-white light-mode:text-slate-900">{monthlyStats.completedCount}</h3>
                <span className="text-zinc-600 font-black text-xl">/</span>
                <span className="text-zinc-500 font-bold text-xl">{readingGoal}</span>
                <span className="text-zinc-600 text-[10px] font-black ml-2 uppercase tracking-widest">Obras Lidas</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-violet-400 tabular-nums">{Math.round(monthlyStats.percentage)}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-violet-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${monthlyStats.percentage}%` }} 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6 md:pl-8 md:border-l border-white/5">
            <div className="px-2">
               <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600 block mb-1">Meta</span>
               <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/5">
                 <span className="text-xl font-black text-white light-mode:text-slate-900 tabular-nums">{readingGoal}</span>
                 <div className="flex flex-col gap-1">
                    <button onClick={() => onUpdateGoal(readingGoal + 1)} className="p-0.5 hover:text-white text-zinc-500 transition-colors"><ChevronUp size={14} /></button>
                    <button onClick={() => onUpdateGoal(Math.max(1, readingGoal - 1))} className="p-0.5 hover:text-white text-zinc-500 transition-colors"><ChevronDown size={14} /></button>
                 </div>
               </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredBooks.map((book) => (
          <div 
            key={book.id} 
            className="group relative h-full flex flex-col perspective-1000"
          >
            {/* Parallax Shadow Effect Wrapper */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden group border-white/5 hover:border-violet-500/40 transition-all duration-500 flex flex-col h-full transform-gpu group-hover:-translate-y-3 group-hover:rotate-x-2 group-hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.3)]">
              <div className="relative h-72 overflow-hidden bg-zinc-900">
                <BookCover book={book} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-4 right-4 flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                   <button 
                    onClick={() => openEditModal(book)}
                    className="bg-black/80 backdrop-blur-xl p-3 rounded-2xl text-white border border-white/10 hover:bg-violet-600 transition-all shadow-xl"
                  >
                    <Edit2 size={16} />
                  </button>
                   <button 
                    onClick={() => handleDelete(book.id)}
                    className="bg-black/80 backdrop-blur-xl p-3 rounded-2xl text-red-400 border border-white/10 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className={`absolute bottom-4 left-4 backdrop-blur-xl px-4 py-1.5 rounded-xl text-[10px] font-black border border-white/10 uppercase tracking-widest shadow-lg ${
                  book.status === 'concluído' ? 'bg-violet-500 text-white' : 
                  book.status === 'lendo' ? 'bg-white text-black' : 'bg-black/60 text-white'
                }`}>
                  {book.status}
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="text-xl font-black text-white light-mode:text-slate-900 line-clamp-2 tracking-tight leading-tight group-hover:text-violet-400 transition-colors">{book.title}</h4>
                  <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] mt-2">{book.author}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                      {book.status === 'lendo' && book.totalPages ? `Pág. ${book.currentPage} / ${book.totalPages}` : 'Conclusão'}
                    </span>
                    <span className="text-sm font-black text-white tabular-nums">{book.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredBooks.length === 0 && (
          <div className="lg:col-span-4 py-40 flex flex-col items-center justify-center text-center glass-card border-dashed border-2 border-white/5 rounded-[3rem]">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-zinc-800 mb-8 border border-white/5">
              <Book size={48} />
            </div>
            <h3 className="text-white font-black text-2xl tracking-tight">Biblioteca Vazia</h3>
            <p className="text-zinc-600 text-sm mt-2 max-w-xs">Aguardando a próxima sintonização de conhecimento ou ajuste de filtros.</p>
            <button onClick={() => setStatusFilter('todos')} className="mt-8 px-8 py-4 bg-white/5 border border-white/10 text-violet-400 font-black text-xs uppercase tracking-[0.3em] hover:text-white hover:bg-violet-600 transition-all rounded-2xl">Limpar Filtros</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-200 border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter">
                  {editingBook ? 'Ajustar Obra' : 'Nova Iniciação'}
                </h3>
                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1 block">Gestão de Conhecimento Nexus</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-2">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Título</label>
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: O Império do Efêmero" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-violet-500/50 transition-all text-white font-bold"
                  />
                  <button 
                    type="button"
                    onClick={fetchCover}
                    disabled={!title || loadingIA}
                    className="px-5 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                    title="Buscar com Nexus Intelligence"
                  >
                    {loadingIA ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Autor</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Escritor ou Pensador" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-violet-500/50 transition-all text-white font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Imagem da Capa (URL)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://imagem-da-capa.jpg" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500/50 transition-all text-white text-xs"
                  />
                  {coverUrl && (
                    <button 
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all"
                      title="Deixar sem capa (Minimalista)"
                    >
                      <ImageOff size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Página Atual</label>
                  <input 
                    type="number" 
                    min="0"
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    disabled={status === 'concluído'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500/50 transition-all text-white font-bold disabled:opacity-30"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Total de Páginas</label>
                  <input 
                    type="number" 
                    min="1"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500/50 transition-all text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Status de Absorção</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['fila', 'lendo', 'concluído'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        status === s 
                        ? 'bg-violet-600 text-white border-violet-500 shadow-xl' 
                        : 'bg-white/5 text-zinc-500 border-white/5'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-white text-black font-black py-6 rounded-2xl transition-all shadow-2xl hover:bg-zinc-200 uppercase tracking-[0.2em] text-xs">
                {editingBook ? 'Salvar Protocolo' : 'Finalizar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingHub;
