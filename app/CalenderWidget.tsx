"use client";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarWidget = ({ calendarDate, setCalendarDate, viewDate, setViewDate }: any) => {
  const monthName = calendarDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = calendarDate.getFullYear();
  const startingOffset = (new Date(year, calendarDate.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, calendarDate.getMonth() + 1, 0).getDate();

  return (
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
  );
};