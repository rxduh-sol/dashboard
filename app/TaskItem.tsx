"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const TaskItem = ({ t, currentTime, onToggle, onClick }: any) => {
  const taskDueDateTime = new Date(`${t.dueDate}T${t.dueTime}:00`);
  const isOverdue = taskDueDateTime < currentTime && t.status !== 'completed';

  return (
    <motion.div 
      layout key={t.id} 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, x: 100, filter: "blur(10px)" }} 
      transition={{ duration: 0.4, ease: [0.32, 0, 0.67, 0] }} 
      onClick={() => onClick(t)} 
      className={`group flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer backdrop-blur-sm shadow-sm ${isOverdue ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10' : 'border-white/40 bg-white/30 hover:bg-white/60'}`}
    >
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
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(t.id); }} 
        className={`p-4 rounded-2xl transition-all duration-300 bg-transparent ${t.status === 'completed' ? 'text-zinc-900 scale-150 shadow-black/5 drop-shadow-lg' : 'text-zinc-300 hover:text-zinc-900 hover:scale-110'}`}
      >
        <CheckCircle2 size={28} />
      </button>
    </motion.div>
  );
};