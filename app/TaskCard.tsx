"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function TaskItem({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => setDone(!done)}
      className={`glass p-6 rounded-3xl flex items-center gap-4 cursor-pointer transition-all ${done ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${done ? 'bg-zinc-800 border-zinc-800' : 'border-zinc-300'}`}>
        {done && <CheckCircle2 size={18} className="text-white" />}
      </div>
      <span className={`text-lg font-medium ${done ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
        {text}
      </span>
    </motion.div>
  );
}