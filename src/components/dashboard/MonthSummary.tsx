import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getMonthLabel } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';

export const MonthSummary: React.FC = () => {
  const { monthlyStats, hideValues, selectedMonth } = useFinance();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Resumo de {getMonthLabel(selectedMonth)}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Income Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-200 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Receitas</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold font-mono-num text-emerald-600">
              {formatCurrency(monthlyStats.totalIncome, hideValues)}
            </div>
            <span className="text-[11px] text-slate-400">Entradas acumuladas</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-200 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Despesas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-colors flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold font-mono-num text-rose-600">
              {formatCurrency(monthlyStats.totalExpense, hideValues)}
            </div>
            <span className="text-[11px] text-slate-400">Saídas e cartões</span>
          </div>
        </div>
      </div>
    </div>
  );
};
