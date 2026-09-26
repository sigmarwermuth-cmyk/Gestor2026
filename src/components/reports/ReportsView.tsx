import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MonthSelector } from '../common/MonthSelector';
import {
  formatCurrency,
  getMonthLabel,
  getMonthShortName,
  getCategoryInfo,
  exportTransactionsToCsv,
} from '../../utils/formatters';
import { Download, PieChart, BarChart3, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    accounts,
    creditCards,
    selectedMonth,
    setSelectedMonth,
    hideValues,
  } = useFinance();

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. Category breakdown for selected month
  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter(
      t => t.date.startsWith(selectedMonth) && t.type === 'EXPENSE'
    );
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, number>();
    for (const t of expenses) {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }

    const items = Array.from(map.entries())
      .map(([category, amount]) => {
        const info = getCategoryInfo(category);
        const percent = total > 0 ? (amount / total) * 100 : 0;
        return {
          category,
          amount,
          percent,
          color: info.color,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { total, items };
  }, [transactions, selectedMonth]);

  // 2. 6-Month history computation
  const sixMonthsData = useMemo(() => {
    const [yStr, mStr] = selectedMonth.split('-');
    const currentYear = parseInt(yStr, 10);
    const currentMonth = parseInt(mStr, 10); // 1-12

    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${y}-${m}`);
    }

    return months.map(ym => {
      let income = 0;
      let expense = 0;

      for (const t of transactions) {
        if (!t.date.startsWith(ym)) continue;
        if (t.type === 'INCOME') income += t.amount;
        if (t.type === 'EXPENSE') expense += t.amount;
      }

      return {
        yearMonth: ym,
        label: getMonthShortName(ym),
        income,
        expense,
        net: income - expense,
      };
    });
  }, [transactions, selectedMonth]);

  // Maximum value for scaling 6-month bar chart
  const maxMonthValue = useMemo(() => {
    let max = 1000;
    for (const m of sixMonthsData) {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    }
    return max * 1.15; // with headroom
  }, [sixMonthsData]);

  // Overall 6 months metrics
  const sixMonthSummary = useMemo(() => {
    const totalIncome = sixMonthsData.reduce((acc, m) => acc + m.income, 0);
    const totalExpense = sixMonthsData.reduce((acc, m) => acc + m.expense, 0);
    const avgIncome = totalIncome / 6;
    const avgExpense = totalExpense / 6;
    const avgSavingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      avgIncome,
      avgExpense,
      avgSavingsRate: Math.max(0, avgSavingsRate),
    };
  }, [sixMonthsData]);

  const handleExport = () => {
    const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
    exportTransactionsToCsv(monthTx.length > 0 ? monthTx : transactions, accounts, creditCards);
  };

  // SVG Donut Path Calculator
  const renderDonutSegments = () => {
    const { total, items } = categoryBreakdown;
    if (total === 0 || items.length === 0) {
      return (
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="28"
        />
      );
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return items.map((item, idx) => {
      const strokeDash = (item.percent / 100) * circumference;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += strokeDash;

      const isHovered = hoveredCategory === item.category;

      return (
        <circle
          key={item.category}
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={item.color}
          strokeWidth={isHovered ? 34 : 28}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredCategory(item.category)}
          onMouseLeave={() => setHoveredCategory(null)}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Month Selector & Export Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <MonthSelector
          selectedMonth={selectedMonth}
          onChange={setSelectedMonth}
          className="w-full sm:w-auto"
        />

        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
        >
          <Download size={15} />
          Exportar Relatório CSV
        </button>
      </div>

      {/* 1. Donut Chart: Gastos por Categoria */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PieChart size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Despesas por Categoria
              </h3>
              <p className="text-xs text-slate-400">
                Distribuição no mês de {getMonthLabel(selectedMonth)}
              </p>
            </div>
          </div>
          <span className="text-base font-bold font-mono-num text-rose-600">
            {formatCurrency(categoryBreakdown.total, hideValues)}
          </span>
        </div>

        {categoryBreakdown.items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma despesa registrada neste mês.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
            {/* Donut Chart SVG */}
            <div className="relative flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="w-52 h-52 -rotate-90 transform"
              >
                {renderDonutSegments()}
              </svg>

              {/* Center text in donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {hoveredCategory ? (
                  <>
                    <span className="text-xs font-semibold text-slate-500 truncate max-w-[120px]">
                      {hoveredCategory}
                    </span>
                    <span className="text-sm font-bold font-mono-num text-slate-900 mt-0.5">
                      {formatCurrency(
                        categoryBreakdown.items.find(i => i.category === hoveredCategory)?.amount || 0,
                        hideValues
                      )}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold font-mono-num">
                      {(categoryBreakdown.items.find(i => i.category === hoveredCategory)?.percent || 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Total</span>
                    <span className="text-sm font-extrabold font-mono-num text-slate-900">
                      {formatCurrency(categoryBreakdown.total, hideValues)}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {categoryBreakdown.items.length} categorias
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Category breakdown Legend List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {categoryBreakdown.items.map(item => {
                const isHovered = hoveredCategory === item.category;

                return (
                  <div
                    key={item.category}
                    onMouseEnter={() => setHoveredCategory(item.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isHovered
                        ? 'bg-slate-50 border-slate-300 shadow-2xs'
                        : 'bg-white border-transparent hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono-num text-slate-500">
                        {item.percent.toFixed(1)}%
                      </span>
                      <span className="text-xs font-bold font-mono-num text-slate-900">
                        {formatCurrency(item.amount, hideValues)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. 6-Month Comparison Bar Chart */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Evolução Financeira (Últimos 6 Meses)
              </h3>
              <p className="text-xs text-slate-400">
                Comparativo de Receitas vs Despesas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Receitas</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Despesas</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart in pure CSS/SVG */}
        <div className="pt-4 pb-2">
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 px-2 sm:px-4">
            {sixMonthsData.map(item => {
              const incomeHeight = Math.max(4, Math.round((item.income / maxMonthValue) * 100));
              const expenseHeight = Math.max(4, Math.round((item.expense / maxMonthValue) * 100));
              const isSelected = item.yearMonth === selectedMonth;

              return (
                <div
                  key={item.yearMonth}
                  onClick={() => setSelectedMonth(item.yearMonth)}
                  className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer p-1 rounded-t-xl transition-all ${
                    isSelected ? 'bg-slate-100/70' : 'hover:bg-slate-50'
                  }`}
                  title={`${item.label}: Receitas ${formatCurrency(item.income)} | Despesas ${formatCurrency(item.expense)}`}
                >
                  {/* Bars Container */}
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-2">
                    {/* Income Bar */}
                    <div
                      className="w-1/2 sm:w-5 max-w-[20px] bg-emerald-500 group-hover:bg-emerald-600 rounded-t-md transition-all relative flex justify-center"
                      style={{ height: `${incomeHeight}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-20 font-mono-num">
                        +{formatCurrency(item.income, hideValues)}
                      </div>
                    </div>

                    {/* Expense Bar */}
                    <div
                      className="w-1/2 sm:w-5 max-w-[20px] bg-rose-500 group-hover:bg-rose-600 rounded-t-md transition-all relative flex justify-center"
                      style={{ height: `${expenseHeight}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-20 font-mono-num">
                        -{formatCurrency(item.expense, hideValues)}
                      </div>
                    </div>
                  </div>

                  {/* Label Month */}
                  <span
                    className={`text-[11px] font-semibold mt-1 tracking-tight capitalize ${
                      isSelected ? 'text-emerald-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6-Month Summary Highlights */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Média de Receitas</span>
            <span className="text-xs sm:text-sm font-bold font-mono-num text-emerald-600">
              {formatCurrency(sixMonthSummary.avgIncome, hideValues)}/mês
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Média de Gastos</span>
            <span className="text-xs sm:text-sm font-bold font-mono-num text-rose-600">
              {formatCurrency(sixMonthSummary.avgExpense, hideValues)}/mês
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Média de Poupança</span>
            <span className="text-xs sm:text-sm font-bold font-mono-num text-slate-800">
              {hideValues ? '••%' : `${sixMonthSummary.avgSavingsRate.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
