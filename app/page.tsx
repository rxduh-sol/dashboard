"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, CheckCircle2, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import WeatherWidget from './WeatherWidget'; 
import MusicSidebar from './MusicSidebar';
import { BackgroundAmbience } from './BackgroundAmbience';
import { SidebarNav } from './SidebarNav';
import { WeatherModal, TaskDetailModal } from './TaskModals';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'home' | 'school'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date()); 
  const [viewDate, setViewDate] = useState<Date | null>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [schoolTasks, setSchoolTasks] = useState<any[]>([]);
  const [generalTasks, setGeneralTasks] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // New flag to kill the loading screen

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const [sRes, gRes] = await Promise.all([
          fetch('/School.json'), 
          fetch('/general.json')
        ]);
        
        if (sRes.ok) {
          const sData = await sRes.json();
          setSchoolTasks(Array.isArray(sData) ? sData : []);
        }
        if (gRes.ok) {
          const gData = await gRes.json();
          setGeneralTasks(Array.isArray(gData) ? gData : []);
        }
        setIsLoaded(true); // Data attempt finished
      } catch (e) { 
        console.error("Fetch error:", e);
        setIsLoaded(true); 
      }
    };

    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const syncTimer = setInterval(loadTasks, 1000); // Aggressive 1s sync

    loadTasks(); 

    return () => {
      clearInterval(clockTimer);
      clearInterval(syncTimer);
    };
  }, []); // Keep this empty and REFRESH your browser to clear the error

  const toggleTaskStatus = (id: string) => {
    const updater = (tasks: any[]) => tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t);
    setSchoolTasks(updater); setGeneralTasks(updater);
  };

  const groupedTasks = useMemo(() => {
    let tasks = activeTab === 'school' ? schoolTasks : generalTasks;
    
    if (searchQuery.trim()) {
      tasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    const filtered = viewDate ? tasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      const comparisonDate = new Date(viewDate);
      comparisonDate.setHours(0, 0, 0, 0);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= comparisonDate;
    }) : tasks;
    
    const groups: Record<string, any[]> = {};
    filtered.sort((a,b) => a.dueDate.localeCompare(b.dueDate)).forEach(task => {
      const label = new Date(task.dueDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(task);
    });
    return groups;
  }, [activeTab, schoolTasks, generalTasks, viewDate, searchQuery]);

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
                <p className="text-[10px] font-black text-zinc-900 opacity-40 uppercase tracking-[0.2em] italic">Productivity mode active</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live Sync Active" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <div className="glass px-6 h-[64px] rounded-[24px] flex items-center gap-3 border border-black/5 min-w-[300px] bg-white/20 backdrop-blur-md shadow-sm">
              <Search size={22} className="text-zinc-900" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="bg-transparent border-none outline-none text-base w-full font-bold text-zinc-900 placeholder:text-zinc-400" 
              />
            </div>
            <WeatherWidget onClick={() => setIsWeatherOpen(true)} />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 flex-grow overflow-hidden pb-4">
          <div className="col-span-8 flex flex-col h-full overflow-hidden">
            <div className="flex-grow glass rounded-[48px] p-10 flex flex-col border border-white/60 bg-white/10 backdrop-blur-2xl shadow-sm overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                  <div className="bg-black/5 p-2 rounded-[24px] flex gap-2">
                    {['home', 'school'].map((tab) => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab as any)} 
                        className={`px-12 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === tab ? 'text-white bg-zinc-900 shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {(viewDate || searchQuery) && (
                    <button 
                      onClick={() => {setViewDate(null); setSearchQuery('');}} 
                      className="p-3 bg-black/5 text-zinc-900 rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
               </div>
               
               <div className="flex-grow overflow-y-auto pr-4 no-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeTab + (viewDate?.toISOString() || '') + searchQuery} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full"
                    >
                      {/* logic fixed: only show loader if we haven't even finished the first fetch */}
                      {!isLoaded ? (
                         <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                           <Loader2 className="animate-spin mb-4" size={40} strokeWidth={3} />
                           <p className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-900">Scanning for tasks...</p>
                         </div>
                      ) : Object.keys(groupedTasks).length > 0 ? (
                        Object.entries(groupedTasks).map(([label, tasks]) => (
                          <div key={label} className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                              <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
                              <div className="h-[1px] w-full bg-black/5" />
                            </div>
                            <div className="space-y-4">
                              {tasks.map((t: any) => (
                                <div key={t.id} onClick={() => setSelectedTask(t)} className="group flex items-center justify-between p-6 rounded-3xl border border-white/40 bg-white/30 hover:bg-white/60 cursor-pointer backdrop-blur-sm shadow-sm transition-all">
                                  <div className="flex flex-col">
                                    <span className={`font-black text-xl tracking-tight transition-all ${t.status === 'completed' ? 'text-zinc-400 line-through opacity-50' : 'text-zinc-900'}`}>
                                      {t.title}
                                    </span>
                                    <span className={`text-xs font-black uppercase mt-1 transition-all ${t.status === 'completed' ? 'text-zinc-300 line-through opacity-50' : 'opacity-40'}`}>
                                      {t.dueTime}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleTaskStatus(t.id); }} 
                                    className={`p-4 rounded-2xl transition-all bg-transparent ${t.status === 'completed' ? 'text-zinc-900 scale-110' : 'text-zinc-300 hover:text-zinc-900 hover:scale-110'}`}
                                  >
                                    <CheckCircle2 size={24} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-900">No tasks found for this view</p>
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
                         <button 
                           key={d} 
                           onClick={() => setViewDate(dateObj)} 
                           className={`text-xs font-black flex items-center justify-center h-8 w-8 mx-auto rounded-xl transition-all ${isToday ? 'bg-zinc-900 text-white shadow-md' : viewDate?.toDateString() === dateObj.toDateString() ? 'bg-white text-zinc-900 shadow-sm border border-black/5' : 'text-zinc-900 hover:bg-white/50'}`}
                         >
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
    </main>
  );
}