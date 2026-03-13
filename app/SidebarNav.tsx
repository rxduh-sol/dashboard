"use client";
import { Home, Book, Settings } from 'lucide-react';

export const SidebarNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: 'home' | 'school') => void }) => (
  <nav className="relative z-20 w-24 h-full flex flex-col items-center py-8 gap-8 border-r border-black/5 bg-white/20 backdrop-blur-3xl">
    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 shadow-xl text-white font-serif font-bold text-xl">M</div>
    <div className="flex flex-col gap-6">
      <button onClick={() => onTabChange('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}><Home size={24} /></button>
      <button onClick={() => onTabChange('school')} className={`p-4 rounded-2xl transition-all ${activeTab === 'school' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}><Book size={24} /></button>
      <button className="p-4 text-zinc-400 mt-auto hover:text-zinc-900 transition-colors"><Settings size={24} /></button>
    </div>
  </nav>
);