"use client";
import React from 'react';
import { Search } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

export const DashboardHeader = ({ currentTime, searchQuery, setSearchQuery, onWeatherOpen }: any) => (
  <header className="flex justify-between items-start mb-10 px-2">
    <div>
      <h1 className="text-8xl font-black tracking-tighter text-zinc-900 font-serif leading-none">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </h1>
      <div className="mt-4">
        <p className="text-xl font-bold text-zinc-900">Welcome back, Manhiru 👋</p>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black text-zinc-900 opacity-40 uppercase tracking-[0.2em] italic">Homelab Node: 192.168.0.10</p>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6 pt-2">
      <div className="glass px-6 h-[64px] rounded-[24px] flex items-center gap-3 border border-black/5 min-w-[300px] bg-white/20 backdrop-blur-md shadow-sm">
        <Search size={22} className="text-zinc-900" />
        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-base w-full font-bold text-zinc-900 placeholder:text-zinc-400" />
      </div>
      <WeatherWidget onClick={onWeatherOpen} />
    </div>
  </header>
);