import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { BottomNav } from './BottomNav';
import { Wifi, Signal, Battery, RefreshCw, Smartphone } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const { deviceMode, setDeviceMode } = useFinance();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (deviceMode === 'desktop') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {children}
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-2">
      {/* Device frame container */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800/80 flex flex-col">
        {/* Outer phone bezel reflection */}
        <div className="absolute inset-0 rounded-[44px] pointer-events-none border-[3px] border-slate-700/40" />

        {/* Inner Screen */}
        <div className="relative w-full h-full bg-slate-100 rounded-[34px] overflow-hidden flex flex-col">
          {/* Android Status Bar */}
          <div className="h-10 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between text-xs font-semibold text-slate-800 shrink-0 z-30 select-none">
            <span className="font-mono-num">{time || '12:30'}</span>

            {/* Front camera punch hole */}
            <div className="w-3.5 h-3.5 bg-slate-950 rounded-full ring-2 ring-slate-200/50" />

            <div className="flex items-center gap-1.5 text-slate-600">
              <Signal size={12} />
              <Wifi size={13} />
              <div className="flex items-center gap-0.5">
                <Battery size={15} />
              </div>
            </div>
          </div>

          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {children}
          </div>

          {/* Pinned Android Bottom Navigation */}
          <div className="shrink-0 bg-white border-t border-slate-200/80">
            <BottomNav />
            {/* Android Navigation Gesture Pill */}
            <div className="h-4 bg-white flex items-center justify-center pb-1">
              <div className="w-28 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Helper text below mockup */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setDeviceMode('desktop')}
          className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
        >
          Alternar para modo tela cheia (Desktop)
        </button>
      </div>
    </div>
  );
};
