/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone, Monitor, Info } from 'lucide-react';

interface PhoneContainerProps {
  children: React.ReactNode;
}

export default function PhoneContainer({ children }: PhoneContainerProps) {
  const [currentTime, setCurrentTime] = useState('09:41');
  const [isFramed, setIsFramed] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const formatted = `${String(hours).padStart(2, '0')}:${minutes}`;
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30); // update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 md:p-6 transition-colors duration-500 font-sans selection:bg-teal-200">
      
      {/* Dynamic Desktop Header controls */}
      <div className="hidden md:flex items-center justify-between w-full max-w-sm mb-4 text-slate-400 text-xs px-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Smartphone className="w-4.5 h-4.5 text-teal-400" />
          <span>Android Companion Mode</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsFramed(true)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              isFramed 
                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-sm' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Device Frame
          </button>
          <button
            onClick={() => setIsFramed(false)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              !isFramed 
                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-sm' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Full Screen
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isFramed
            ? 'max-w-md h-[880px] rounded-[52px] border-[12px] border-slate-950 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-slate-800/50 overflow-hidden flex flex-col'
            : 'max-w-2xl h-screen md:h-[880px] md:rounded-3xl border-0 md:border border-slate-800 bg-slate-950 overflow-hidden flex flex-col shadow-2xl'
        }`}
      >
        {/* Android Notch Camera - only visible in framed mode */}
        {isFramed && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-7 w-40 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800/50 shadow-inner"></div>
            <div className="w-10 h-1.5 rounded-full bg-slate-900 border border-slate-800/30"></div>
          </div>
        )}

        {/* Dynamic Top Android Status Bar */}
        <div className={`bg-slate-50 border-b border-slate-100 flex items-center justify-between text-slate-700 font-semibold text-xs tracking-tight select-none z-40 transition-all ${
          isFramed ? 'pt-7.5 pb-2 px-6 h-13' : 'pt-3 pb-2.5 px-6 h-10'
        }`}>
          <span>{currentTime}</span>
          
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
            <Wifi className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
            <div className="flex items-center gap-1 font-bold">
              <span>94%</span>
              <Battery className="w-5 h-5 text-slate-700 rotate-0" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Device Screen Frame inner container */}
        <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col relative">
          {children}
        </div>

        {/* Android Native Home Gesture Bar / Button pill */}
        <div className="bg-slate-50 border-t border-slate-100/50 h-8 flex items-center justify-center select-none z-40">
          <div className="w-32 h-1 rounded-full bg-slate-300 hover:bg-slate-400 active:bg-slate-500 transition-colors cursor-pointer"></div>
        </div>
      </div>
      
      {/* Little floating tips overlay on desktop */}
      <div className="hidden md:flex items-center gap-2 mt-4 text-slate-500 text-xs text-center max-w-sm px-4">
        <Info className="w-4 h-4 text-teal-500/70 shrink-0" />
        <p>This app supports <b>offline storage</b>. Add items, filter by stores, change categories, and snap photos.</p>
      </div>
    </div>
  );
}
