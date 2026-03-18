import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Zap } from 'lucide-react';

// Hardcoded your Pi IP
const API_BASE = "http://192.168.0.10:8000";

const RoutineCard = () => {
    const [habits, setHabits] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [loading, setLoading] = useState(true);

    const fetchRoutine = async () => {
        try {
            const res = await fetch(`${API_BASE}/routine`);
            const data = await res.json();
            setHabits(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch routine:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutine();
        const interval = setInterval(fetchRoutine, 300000);
        return () => clearInterval(interval);
    }, []);

    // Removed the ': number' type here for JSX compatibility
    const toggleHabit = async (order) => {
        try {
            // Optimistic UI update
            setHabits(prev => prev.map(h => 
                h.order === order ? { ...h, done: !h.done } : h
            ));

            const res = await fetch(`${API_BASE}/routine/toggle/${order}`, {
                method: 'POST',
            });
            
            if (!res.ok) throw new Error("Server update failed");
        } catch (err) {
            console.error("Toggle failed, reverting:", err);
            fetchRoutine(); 
        }
    };

    const sortedHabits = [
        ...habits.filter(h => !h.done).sort((a, b) => a.order - b.order),
        ...habits.filter(h => h.done).sort((a, b) => a.order - b.order)
    ];

    const completedCount = habits.filter(h => h.done).length;
    const totalCount = habits.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (loading) return <div className="p-10 text-white/20 animate-pulse text-center font-mono">INITIALIZING ROUTINE...</div>;

    return (
        <div className="w-full bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
            <div 
                className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                            <h3 className="text-zinc-400 uppercase tracking-[0.2em] text-[10px] font-bold font-mono">DAILY MOMENTUM</h3>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tight">
                            {Math.round(progress)}<span className="text-lg text-white/40 ml-1">%</span>
                        </p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                        {isExpanded ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
                    </div>
                </div>
                
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-[2px]">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        className="h-full bg-gradient-to-r from-zinc-400 via-white to-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    />
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-6 space-y-2"
                    >
                        {sortedHabits.map((habit) => (
                            <motion.div
                                layout
                                key={`${habit.day}-${habit.order}`}
                                onClick={() => toggleHabit(habit.order)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group ${
                                    habit.done 
                                    ? 'bg-black/20 opacity-40 scale-[0.97]' 
                                    : 'bg-white/10 hover:bg-white/15 border border-white/5 shadow-lg'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">
                                        {habit.icon}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-bold ${habit.done ? 'line-through text-zinc-500' : 'text-white'}`}>
                                            {habit.label}
                                        </p>
                                        {habit.duration && !habit.done && (
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
                                                ⏱ {habit.duration}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-center">
                                    {habit.done ? (
                                        <CheckCircle2 size={22} className="text-white" />
                                    ) : (
                                        <Circle size={22} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoutineCard;