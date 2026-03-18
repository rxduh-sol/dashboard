"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Database, Plus, CheckCircle2, Circle, Zap, ChevronDown, Search, Cloud } from 'lucide-react';

// Sub-components
import MusicSidebar from './MusicSidebar';
import { BackgroundAmbience } from './BackgroundAmbience';
import { SidebarNav } from './SidebarNav';
import { WeatherModal, TaskDetailModal } from './TaskModals';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskItem } from './TaskItem';
import { DashboardHeader } from './DashboardHeader';
import { CalendarWidget } from './CalenderWidget';

// --- TYPES ---
interface Habit {
  order: number;
  label: string;
  icon: string;
  done: boolean;
  day: string;
  duration?: string;
}

interface Task {
  id: string;
  title: string;
  details: string;
  dueDate: string;
  dueTime: string;
  tab_type: string;
  status: 'todo' | 'completed';
}

export default function Page({ initialTasks = [] }: { initialTasks?: Task[] }) {
  const [activeTab, setActiveTab] = useState<'home' | 'school'>('home');
  const [filterTab, setFilterTab] = useState<'due' | 'completed'>('due');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date()); 
  const [viewDate, setViewDate] = useState<Date | null>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Routine & Connection States
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showRoutineDropdown, setShowRoutineDropdown] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  
  const [schoolTasks, setSchoolTasks] = useState<Task[]>(initialTasks.filter((t: Task) => t.id.startsWith('school') || t.tab_type === 'school'));
  const [generalTasks, setGeneralTasks] = useState<Task[]>(initialTasks.filter((t: any) => t.id.startsWith('general') || t.tab_type === 'home'));
  const [isLoaded, setIsLoaded] = useState(initialTasks.length > 0); 

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState(''); 
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('23:59');
  const [newType, setNewType] = useState<'home' | 'school'>('home');

  const API_BASE = "http://192.168.0.10:8000";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [taskRes, routineRes] = await Promise.all([
          fetch(`${API_BASE}/tasks`),
          fetch(`${API_BASE}/routine`)
        ]);
        
        if (taskRes.ok) {
          const data = await taskRes.json();
          setSchoolTasks(data.filter((t: Task) => t.id.startsWith('school') || t.tab_type === 'school'));
          setGeneralTasks(data.filter((t: Task) => t.id.startsWith('general') || t.tab_type === 'home'));
          setIsLoaded(true);
          setIsServerOnline(true);
        }
        
        if (routineRes.ok) {
          const rData = await routineRes.json();
          setHabits(rData);
        }
      } catch (e) { 
        console.error("Homelab Connection Error:", e);
        setIsServerOnline(false);
        if (initialTasks.length > 0) setIsLoaded(true);
      }
    };

    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadData(); 
    return () => clearInterval(clockTimer);
  }, [initialTasks, API_BASE]);

  const toggleTaskStatus = async (id: string) => {
    const updater = (tasks: Task[]) => tasks.map(t => t.id === id ? { ...t, status: (t.status === 'completed' ? 'todo' : 'completed') as 'todo' | 'completed' } : t);
    if (activeTab === 'school') setSchoolTasks(updater);
    else setGeneralTasks(updater);
    try { await fetch(`${API_BASE}/tasks/toggle/${id}`, { method: 'POST' }); } catch (e) { console.error(e); }
  };

  const toggleHabit = async (order: number) => {
    try {
      setHabits(prev => prev.map(h => h.order === order ? { ...h, done: !h.done } : h));
      await fetch(`${API_BASE}/routine/toggle/${order}`, { method: 'POST' });
    } catch (e) { console.error(e); }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    const taskObj = { title: newTitle, details: newDesc, dueDate: newDate, dueTime: newTime, tab_type: newType, status: 'todo' };
    try {
      const res = await fetch(`${API_BASE}/tasks/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskObj) });
      if (res.ok) {
        const { task } = await res.json();
        if (newType === 'school') setSchoolTasks([...schoolTasks, task]);
        else setGeneralTasks([...generalTasks, task]);
        setNewTitle(''); setNewDesc(''); setIsCreateOpen(false);
      }
    } catch (e) { console.error(e); }
  };

  const groupedTasks = useMemo(() => {
    let tasks = activeTab === 'school' ? schoolTasks : generalTasks;
    tasks = tasks.filter(t => filterTab === 'completed' ? t.status === 'completed' : t.status !== 'completed');
    if (searchQuery.trim()) tasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const filtered = viewDate ? tasks.filter(t => new Date(t.dueDate).toDateString() === viewDate.toDateString()) : tasks;
    const groups: Record<string, Task[]> = {};
    filtered.sort((a,b) => a.dueDate.localeCompare(b.dueDate)).forEach(task => {
      const label = new Date(task.dueDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(task);
    });
    return groups;
  }, [activeTab, filterTab, schoolTasks, generalTasks, viewDate, searchQuery]);

  const routineProgress = habits.length > 0 ? (habits.filter(h => h.done).length / habits.length) * 100 : 0;
  const currentHabit = habits.filter(h => !h.done).sort((a, b) => a.order - b.order)[0] || { label: "Complete", icon: "✨" };
  const sortedHabits = [...habits.filter(h => !h.done).sort((a, b) => a.order - b.order), ...habits.filter(h => h.done).sort((a, b) => a.order - b.order)];

  const trafficColor = routineProgress <= 30 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : routineProgress <= 70 ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]';

  return (
    <main className="h-screen w-screen relative font-sans overflow-hidden bg-white flex text-left">
      <BackgroundAmbience />
      <AnimatePresence>
        {isWeatherOpen && <WeatherModal onClose={() => setIsWeatherOpen(false)} />}
        {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
        {isCreateOpen && (
          <CreateTaskModal 
            onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateTask}
            newTitle={newTitle} setNewTitle={setNewTitle} newDesc={newDesc} setNewDesc={setNewDesc}
            newDate={newDate} setNewDate={setNewDate} newTime={newTime} setNewTime={setNewTime}
            newType={newType} setNewType={setNewType}
          />
        )}
      </AnimatePresence>

      <SidebarNav activeTab={activeTab} onTabChange={(tab: any) => {setActiveTab(tab); setViewDate(null);}} />

      <div className="flex-grow relative z-10 p-10 flex flex-col h-full overflow-hidden">
        
        {/* HEADER AREA */}
        <div className="flex items-start justify-between mb-10 w-full gap-4">
          <div className="flex flex-col gap-0 min-w-[350px]">
            <h1 className="text-[90px] font-bold text-zinc-900 tracking-tighter leading-[0.85] font-serif" style={{ fontFamily: 'Newsreader, Charter, Georgia, serif' }}>
                {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </h1>
            
            <div className="flex items-center gap-2 mt-4">
                <p className="text-2xl font-bold text-zinc-800">Welcome back, Manhiru 👋</p>
            </div>

            <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    HOMELAB NODE: 192.168.0.10
                </p>
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isServerOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />
            </div>
          </div>

          {/* RIGHT SIDE TOOLS - OPTIMIZED TEXT SIZES & SEARCH LENGTH */}
          <div className="flex items-center gap-4 h-[84px] flex-grow justify-end">
            {/* Daily Routine Widget */}
            <div className="relative h-full">
                <motion.div 
                    onClick={() => setShowRoutineDropdown(!showRoutineDropdown)}
                    whileHover={{ scale: 1.02 }}
                    className="h-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] px-8 flex items-center gap-6 shadow-xl cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-900 p-3 rounded-xl shadow-lg">
                            <Zap size={18} className="text-white fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Daily Routine</span>
                            <span className="text-[14px] font-black text-zinc-900 uppercase truncate w-32">{currentHabit.icon} {currentHabit.label}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-black/5 pl-6">
                        <div className="w-2 h-10 bg-black/5 rounded-full overflow-hidden flex flex-col justify-end">
                            <motion.div animate={{ height: `${routineProgress}%` }} className={`w-full rounded-full transition-colors duration-500 ${trafficColor}`} />
                        </div>
                        <span className="text-[12px] font-black text-zinc-900">{Math.round(routineProgress)}%</span>
                    </div>
                </motion.div>
                <AnimatePresence>
                    {showRoutineDropdown && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-[110%] right-0 z-[100] w-[350px] bg-white/95 backdrop-blur-3xl border border-white shadow-2xl rounded-[32px] p-5 max-h-[400px] overflow-y-auto no-scrollbar">
                            <div className="space-y-1.5">
                                {sortedHabits.map((habit) => (
                                    <div key={habit.order} onClick={(e) => { e.stopPropagation(); toggleHabit(habit.order); }} className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${habit.done ? 'bg-black/[0.02] opacity-30' : 'bg-black/5 hover:bg-black/10'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{habit.icon}</span>
                                            <span className={`text-[12px] font-black uppercase tracking-tight ${habit.done ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>{habit.label}</span>
                                        </div>
                                        {habit.done ? <CheckCircle2 size={18} className="text-zinc-900" /> : <Circle size={18} className="text-black/10" />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search Box - Reduced length to prevent weather overlap */}
            <div className="h-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] px-6 flex items-center gap-4 shadow-xl w-[200px]">
                <Search size={18} className="text-zinc-400" />
                <input 
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH..."
                    className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest text-zinc-900 placeholder:text-zinc-300 w-full"
                />
            </div>

            {/* Weather Button - Increased text size for visibility */}
            <motion.button onClick={() => setIsWeatherOpen(true)} whileHover={{ scale: 1.05 }} className="h-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] px-10 flex items-center gap-5 shadow-xl">
                <Cloud size={24} className="text-zinc-900" />
                <div className="flex flex-col items-start text-zinc-900">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-40">Colchester</span>
                    <span className="text-[16px] font-black">12°C</span>
                </div>
            </motion.button>
          </div>
        </div>

        {/* TASK GRID AREA */}
        <div className="grid grid-cols-12 gap-8 flex-grow overflow-hidden pb-4">
          <div className="col-span-8 flex flex-col h-full overflow-hidden">
            <div className="flex-grow glass rounded-[48px] p-10 flex flex-col border border-white/60 bg-white/10 backdrop-blur-2xl shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div className="bg-black/5 p-2 rounded-[24px] flex gap-2">
                    {['home', 'school'].map((tab) => (
                      <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-12 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === tab ? 'text-white bg-zinc-900 shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}>{tab.toUpperCase()}</button>
                    ))}
                  </div>
                  <div className="bg-black/5 p-2 rounded-[24px] flex gap-2">
                    {['due', 'completed'].map((fTab) => (
                      <button key={fTab} onClick={() => setFilterTab(fTab as any)} className={`px-8 py-3 rounded-[18px] text-[10px] font-black transition-all ${filterTab === fTab ? 'text-white bg-zinc-900 shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}>{fTab.toUpperCase()}</button>
                    ))}
                  </div>
               </div>
               
               <div className="flex-grow overflow-y-auto pr-4 no-scrollbar">
                  <AnimatePresence mode="popLayout">
                    <motion.div key={activeTab + filterTab + (viewDate?.toISOString() || '') + searchQuery} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                      {!isLoaded ? (
                         <div className="h-full flex flex-col items-center justify-center py-20 opacity-30 text-center">
                           <Loader2 className="animate-spin mb-4 mx-auto" size={40} strokeWidth={3} /><p className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-900">Syncing...</p>
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
                                {tasks.map((t: Task) => (
                                  <TaskItem key={t.id} t={t} currentTime={currentTime} onToggle={toggleTaskStatus} onClick={setSelectedTask} />
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center">
                          <Database size={40} className="mb-4 mx-auto" strokeWidth={1} />
                          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-900">End of queue.</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col h-full overflow-hidden">
            <div className="glass rounded-[48px] p-8 flex flex-col justify-start gap-4 border border-white/40 bg-white/10 backdrop-blur-2xl shadow-sm h-full overflow-hidden">
               <CalendarWidget calendarDate={calendarDate} setCalendarDate={setCalendarDate} viewDate={viewDate} setViewDate={setViewDate} />
               <div className="flex-grow pt-2 flex flex-col">
                 <MusicSidebar />
               </div>
            </div>
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-10 right-10 z-[90] w-20 h-20 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-zinc-900/40 border-4 border-white"
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>
    </main>
  );
}