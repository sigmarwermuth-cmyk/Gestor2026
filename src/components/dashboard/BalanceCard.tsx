import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Eye, EyeOff, ShieldCheck, Wallet } from 'lucide-react';

export const BalanceCard: React.FC = () => {
  const { consolidatedBalance, hideValues, toggleHideValues, monthlyStats } = useFinance();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-indigo-900/40">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Subtle grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-xs">
              <Wallet size={16} />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-indigo-200/90 uppercase block">
                Patrimônio & Saldo Consolidado
              </span>
              <span className="text-[10px] text-slate-400">
                Total disponível em todas as contas
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleHideValues}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all backdrop-blur-xs"
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            aria-label="Alternar visibilidade de valores"
          >
            {hideValues ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Central Balance */}
        <div className="py-1">
          <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono-num text-white flex items-baseline gap-2">
            <span>{formatCurrency(consolidatedBalance, hideValues)}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
              <ShieldCheck size={12} />
              <span>Sincronizado</span>
            </div>
            <span className="text-slate-400 text-[11px]">4 contas bancárias ativas</span>
          </div>
        </div>

        {/* Bottom micro stats */}
        <div className="pt-3.5 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Economia do Mês
            </span>
            <span className={`font-extrabold font-mono-num text-sm ${monthlyStats.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {monthlyStats.netBalance >= 0 ? '+' : ''}{formatCurrency(monthlyStats.netBalance, hideValues)}
            </span>
          </div>

          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Taxa de Poupança
            </span>
            <span className="font-extrabold text-indigo-300 font-mono-num text-sm">
              {hideValues ? '••%' : `${monthlyStats.savingsRate.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
