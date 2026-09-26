import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 text-white border border-amber-500/40 p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
      <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-bold text-white block">
          Modo Offline Ativo
        </span>
        <span className="text-[10px] text-slate-300 block">
          Você está navegando com os dados salvos em cache local.
        </span>
      </div>
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
    </div>
  );
};
