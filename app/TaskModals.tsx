"use client";
import { motion } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';

export const WeatherModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md" onClick={onClose}>
    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white p-6 rounded-[40px] w-[85vw] h-[85vh] shadow-2xl relative border border-white/40" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full z-10 text-zinc-900 hover:bg-zinc-200 transition-colors"><X size={24} /></button>
      <iframe src="https://weather.metoffice.gov.uk/forecast/u10xhr69n" className="w-full h-full rounded-[24px] border-none" title="Weather" />
    </motion.div>
  </motion.div>
);

export const TaskDetailModal = ({ task, onClose }: { task: any, onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-white/60 backdrop-blur-xl p-6" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white/90 rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-white/40 backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="p-8 text-left">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-black text-zinc-900 leading-tight">{task.title}</h2>
          <button onClick={onClose} className="p-3 bg-zinc-100 rounded-full hover:bg-zinc-200 text-zinc-900"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-zinc-100/50 rounded-2xl text-zinc-900">
            <Calendar size={18} /><div><span className="text-[10px] uppercase font-black opacity-30">Due Date</span><p className="font-bold text-sm">{task.dueDate}</p></div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-zinc-100/50 rounded-2xl text-zinc-900">
            <Clock size={18} /><div><span className="text-[10px] uppercase font-black opacity-30">Due Time</span><p className="font-bold text-sm">{task.dueTime}</p></div>
          </div>
        </div>
        {task.details && <p className="text-zinc-900 font-bold">{task.details}</p>}
      </div>
    </motion.div>
  </motion.div>
);