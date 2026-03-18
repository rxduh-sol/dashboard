"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { X, AlignLeft, Calendar, Clock } from 'lucide-react';

interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newDesc: string;
  setNewDesc: (v: string) => void;
  newDate: string;
  setNewDate: (v: string) => void;
  newTime: string;
  setNewTime: (v: string) => void;
  newType: 'home' | 'school';
  setNewType: (v: 'home' | 'school') => void;
}

export const CreateTaskModal = ({
  onClose, onSubmit, newTitle, setNewTitle, newDesc, setNewDesc, 
  newDate, setNewDate, newTime, setNewTime, newType, setNewType 
}: CreateTaskModalProps) => (
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
        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <X size={24} className="text-zinc-900" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
            {(['home', 'school'] as const).map((type) => (
              <button type="button" key={type} onClick={() => setNewType(type)} className={`flex-1 py-3 rounded-[14px] text-xs font-black transition-all ${newType === type ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400'}`}>
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
);