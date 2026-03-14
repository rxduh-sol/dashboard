"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, CheckCircle2, ChevronLeft, ChevronRight, Loader2, X, AlertCircle, Database, Plus, Calendar, Clock, AlignLeft } from 'lucide-react';
import WeatherWidget from './WeatherWidget'; 
import MusicSidebar from './MusicSidebar';
import { BackgroundAmbience } from './BackgroundAmbience';
import { SidebarNav } from './SidebarNav';
import { WeatherModal, TaskDetailModal } from './TaskModals';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'home' | 'school'>('home');
  const [filterTab, setFilterTab] = useState<'due' | 'completed'>('due');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date()); 
  const [viewDate, setViewDate] = useState<Date | null>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false); 
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [schoolTasks, setSchoolTasks] = useState<any[]>([]);
  const [generalTasks, setGeneralTasks] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); 

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState(''); 
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('23:59');
  const [newType, setNewType] = useState<'home' | 'school'>('home');

  const API_BASE = "http://192.168.0.177:8000";

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(`${API_BASE}/tasks`);
        if (response.ok) {
          const data = await response.json();
          setSchoolTasks(data.filter((t: any) => t.id.startsWith('school') || t.tab_type === 'school'));
          setGeneralTasks(data.filter((t: any) => t.id.startsWith('general') || t.tab_type === 'home'));
          setIsLoaded(true);
        }
      } catch (e) { 
        console.error("Homelab Connection Error:", e);
      }
    };
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadTasks(); 
    return () => clearInterval(clockTimer);
  }, []);

  const toggleTaskStatus = async (id: string) => {
    const updater = (tasks: any[]) => tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t
    );
    if (activeTab === 'school') setSchoolTasks(updater);
    else setGeneralTasks(updater);

    try {
      await fetch(`${API_BASE}/tasks/toggle/${id}`, { method: 'POST' });
    } catch (e) {
      console.error("Failed to sync toggle:", e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const taskObj = {
      title: newTitle,
      details: newDesc,
      dueDate: newDate,
      dueTime: newTime,
      tab_type: newType,
      status: 'todo'
    };

    try {
      const res = await fetch(`${API_BASE}/tasks/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskObj)
      });
      if (res.ok) {
        const { task } = await res.json();
        if (newType === 'school') setSchoolTasks([...schoolTasks, task]);
        else setGeneralTasks([...generalTasks, task]);
        setNewTitle('');
        setNewDesc('');
        setIsCreateOpen(false);
      }
    } catch (e) {
      console.error("Creation failed", e);
    }
  };

  const groupedTasks = useMemo(() => {
    let tasks = activeTab === 'school' ? schoolTasks : generalTasks;
    tasks = tasks.filter(t => filterTab === 'completed' ? t.status === 'completed' : t.status !== 'completed');
    if (searchQuery.trim()) tasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const filtered = viewDate ? tasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      const comparisonDate = new Date(viewDate);
      comparisonDate.setHours(0, 0, 0, 0);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === comparisonDate.getTime();
    }) : tasks;
    
    const groups: Record<string, any[]> = {};
    filtered.sort((a,b) => a.dueDate.localeCompare(b.dueDate)).forEach(task => {
      const label = new Date(task.dueDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(task);
    });
    return groups;
  }, [activeTab, filterTab, schoolTasks, generalTasks, viewDate, searchQuery]);

  const monthName = calendarDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = calendarDate.getFullYear();
  const startingOffset = (new Date(year, calendarDate.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, calendarDate.getMonth() + 1, 0).getDate();

  return (
    <main className="h-screen w-screen relative font-sans overflow-hidden bg-white flex text-left">
      <BackgroundAmbience />
      
      <AnimatePresence>
        {isWeatherOpen && <WeatherModal onClose={() => setIsWeatherOpen(false)} />}
        {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
        
        {isCreateOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass rounded-[40px] p-10 border border-white/60 bg-white/40 backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900">New Task</h2>
                <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={24} className="text-zinc-900" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-2">Task Title</label>
                  <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What needs to be done?" className="w-full bg-white/50 border border-black/5 p-4 rounded-2xl outline-none font-bold text-zinc-900 focus:border-zinc-900 transition-all shadow-sm placeholder:text-zinc-400" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-2">Description</label>
                  <div className="relative">
                    <AlignLeft size={16} className="absolute left-4 top-4 text-zinc-900" />
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Add details..." className="w-full bg-white/50 border border-black/5 p-4 pl-12 rounded-2xl outline-none font-bold text-zinc-900 focus:border-zinc-900 transition-all shadow-sm placeholder:text-zinc-400 resize-none h-24" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-2">Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-4 text-zinc-900" />
                      <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full bg-white/50 border border-black/5 p-4 pl-12 rounded-2xl outline-none font-bold text-zinc-900 focus:border-zinc-900 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-2">Time</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-4 text-zinc-900" />
                      <input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="23:59" className="w-full bg-white/50 border border-black/5 p-4 pl-12 rounded-2xl outline-none font-bold text-zinc-900 focus:border-zinc-900 transition-all shadow-sm placeholder:text-zinc-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-2">Category</label>
                  <div className="flex gap-2 p-1.5 bg-black/5 rounded-2xl border border-black/5">
                    {['home', 'school'].map((type) => (
                      <button type="button" key={type} onClick={() => setNewType(type as any)} className={`flex-1 py-3 rounded-[14px] text-xs font-black transition-all ${newType === type ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400'}`}>
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-zinc-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-zinc-900/20 hover:scale-[1.02] transition-all active:scale-95">
                  Create
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarNav activeTab={activeTab} onTabChange={(tab) => {setActiveTab(tab); setViewDate(null);}} />

      <div className="flex-grow relative z-10 p-10 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-start mb-10 px-2">
          <div>
            <h1 className="text-8xl font-black tracking-tighter text-zinc-900 font-serif leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <div className="mt-4">
              <p className="text-xl font-bold text-zinc-900">Welcome back, Manhiru 👋</p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black text-zinc-900 opacity-40 uppercase tracking-[0.2em] italic">Homelab Node: 192.168.0.177</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <div className="glass px-6 h-[64px] rounded-[24px] flex items-center gap-3 border border-black/5 min-w-[300px] bg-white/20 backdrop-blur-md shadow-sm">
              <Search size={22} className="text-zinc-900" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-base w-full font-bold text-zinc-900 placeholder:text-zinc-400" />
            </div>
            <WeatherWidget onClick={() => setIsWeatherOpen(true)} />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 flex-grow overflow-hidden pb-4">
          <div className="col-span-8 flex flex-col h-full overflow-hidden">
            <div className="flex-grow glass rounded-[48px] p-10 flex flex-col border border-white/60 bg-white/10 backdrop-blur-2xl shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-black/5 p-2 rounded-[24px] flex gap-2">
                      {['home', 'school'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-12 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === tab ? 'text-white bg-zinc-900 shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}>
                          {tab.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-black/5 p-2 rounded-[24px] flex gap-2">
                    {['due', 'completed'].map((fTab) => (
                      <button key={fTab} onClick={() => setFilterTab(fTab as any)} className={`px-8 py-3 rounded-[18px] text-[10px] font-black transition-all ${filterTab === fTab ? 'text-white bg-zinc-900 shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}>
                        {fTab.toUpperCase()}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="flex-grow overflow-y-auto pr-4 no-scrollbar">
                  <AnimatePresence mode="popLayout">
                    <motion.div key={activeTab + filterTab + (viewDate?.toISOString() || '') + searchQuery} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                      {!isLoaded ? (
                         <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                           <Loader2 className="animate-spin mb-4" size={40} strokeWidth={3} />
                           <p className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-900">Syncing with Node 177...</p>
                         </div>
                      ) : Object.keys(groupedTasks).length > 0 ? (
                        Object.entries(groupedTasks).map(([label, tasks]) => (
                          <div key={label} className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                              <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
                              <div className="h-[1px] w-full bg-black/5" />
                            </div>
                            <div className="space-y-4">
                              <AnimatePresence mode="popLayout">
                                {tasks.map((t: any) => {
                                  // IMPROVED OVERDUE LOGIC:
                                  // Combines dueDate ("2026-03-14") and dueTime ("23:59") into one timestamp
                                  const taskDueDateTime = new Date(`${t.dueDate}T${t.dueTime}:00`);
                                  const isOverdue = taskDueDateTime < currentTime && t.status !== 'completed';
                                  
                                  return (
                                    <motion.div layout key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 100, filter: "blur(10px)" }} transition={{ duration: 0.4, ease: [0.32, 0, 0.67, 0] }} onClick={() => setSelectedTask(t)} className={`group flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer backdrop-blur-sm shadow-sm ${isOverdue ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10' : 'border-white/40 bg-white/30 hover:bg-white/60'}`}>
                                      <div className="flex flex-col relative">
                                        <div className="flex items-center gap-3">
                                          <span className={`font-black text-xl tracking-tight transition-all duration-500 ${t.status === 'completed' ? 'text-zinc-400 opacity-50' : 'text-zinc-900'}`}>
                                            {t.title}
                                            {t.status === 'completed' && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute top-1/2 left-0 h-[2px] bg-zinc-400" />}
                                          </span>
                                          {isOverdue && (
                                            <div className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-tighter bg-red-500/10 px-2 py-0.5 rounded-lg">
                                              <AlertCircle size={10} /> Overdue
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 transition-all">
                                          <span className={`text-xs font-black uppercase ${t.status === 'completed' ? 'text-zinc-300 opacity-50' : 'text-zinc-900 opacity-40'}`}>
                                            {t.dueTime}
                                          </span>
                                          {t.details && <span className="text-[10px] font-medium text-zinc-400 truncate max-w-[200px]">/ {t.details}</span>}
                                        </div>
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); toggleTaskStatus(t.id); }} className={`p-4 rounded-2xl transition-all duration-300 bg-transparent ${t.status === 'completed' ? 'text-zinc-900 scale-150 shadow-black/5 drop-shadow-lg' : 'text-zinc-300 hover:text-zinc-900 hover:scale-110'}`}>
                                        <CheckCircle2 size={28} />
                                      </button>
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center">
                          <Database size={40} className="mb-4 mx-auto" strokeWidth={1} />
                          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-900">End of queue. No {filterTab} tasks found.</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col h-full overflow-hidden">
            <div className="glass rounded-[48px] p-8 flex flex-col justify-start gap-4 border border-white/40 bg-white/10 backdrop-blur-2xl shadow-sm h-full overflow-hidden">
               <div className="flex flex-col shrink-0">
                 <div className="flex justify-between items-center mb-4 text-zinc-900">
                    <div className="flex flex-col"><h4 className="font-black text-xl tracking-tighter">{monthName}</h4><span className="text-[10px] font-black text-zinc-400 uppercase">{year}</span></div>
                    <div className="flex gap-1">
                      <button onClick={() => setCalendarDate(new Date(year, calendarDate.getMonth()-1, 1))} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><ChevronLeft size={18} /></button>
                      <button onClick={() => setCalendarDate(new Date(year, calendarDate.getMonth()+1, 1))} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><ChevronRight size={18} /></button>
                    </div>
                 </div>
                 <div className="bg-black/5 rounded-[32px] p-4 border border-white/20">
                   <div className="grid grid-cols-7 gap-y-1 text-center">
                     {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d} className="text-[9px] font-black text-zinc-900 opacity-20 uppercase mb-1">{d}</div>)}
                     {Array.from({ length: startingOffset }).map((_, i) => <div key={`e-${i}`} />)}
                     {Array.from({ length: daysInMonth }, (_, i) => {
                       const d = i + 1;
                       const dateObj = new Date(year, calendarDate.getMonth(), d);
                       const isToday = d === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth();
                       return (
                         <button key={d} onClick={() => setViewDate(dateObj)} className={`text-xs font-black flex items-center justify-center h-8 w-8 mx-auto rounded-xl transition-all ${isToday ? 'bg-zinc-900 text-white shadow-md' : viewDate?.toDateString() === dateObj.toDateString() ? 'bg-white text-zinc-900 shadow-sm border border-black/5' : 'text-zinc-900 hover:bg-white/50'}`}>
                           {d}
                         </button>
                       );
                     })}
                   </div>
                 </div>
               </div>
               <div className="flex-grow pt-2 flex flex-col">
                 <MusicSidebar />
               </div>
            </div>
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-10 right-10 z-[90] w-20 h-20 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-zinc-900/40 border-4 border-white"
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>
    </main>
  );
}