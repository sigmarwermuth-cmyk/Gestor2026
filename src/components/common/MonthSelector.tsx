import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getMonthLabel } from '../../utils/formatters';

interface MonthSelectorProps {
  selectedMonth: string; // YYYY-MM
  onChange: (month: string) => void;
  className?: string;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onChange,
  className = '',
}) => {
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  const handlePrev = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNext = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onChange(`${y}-${m}`);
  };

  return (
    <div className={`flex items-center justify-between bg-white border border-slate-200/80 rounded-xl px-2 py-1.5 shadow-xs ${className}`}>
      <button
        type="button"
        onClick={handlePrev}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <Calendar size={15} className="text-emerald-600" />
        <span className="text-sm font-semibold text-slate-800 capitalize select-none">
          {getMonthLabel(selectedMonth)}
        </span>
        <button
          type="button"
          onClick={handleToday}
          className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md transition-colors"
        >
          Hoje
        </button>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
