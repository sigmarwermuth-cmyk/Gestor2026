import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  fetchFinancialInsights,
  FinancialInsightsResult,
} from '../../services/aiCategoryService';
import {
  Sparkles,
  Loader2,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getMonthLabel } from '../../utils/formatters';

export const AiAdvisorCard: React.FC = () => {
  const {
    monthlyStats,
    transactions,
    goals,
    selectedMonth,
  } = useFinance();

  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<FinancialInsightsResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute top categories for the request
  const handleGenerateInsights = async () => {
    setIsLoading(true);

    const monthExpenses = transactions.filter(
      t => t.date.startsWith(selectedMonth) && t.type === 'EXPENSE'
    );
    const catMap = new Map<string, number>();
    for (const t of monthExpenses) {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    }
    const topCategories = Array.from(catMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    const goalsSummary = goals.map(g => ({
      title: g.title,
      current: g.currentAmount,
      target: g.targetAmount,
      deadline: g.deadline,
    }));

    try {
      const data = await fetchFinancialInsights({
        income: monthlyStats.totalIncome,
        expense: monthlyStats.totalExpense,
        balance: monthlyStats.netBalance,
        savingsRate: monthlyStats.savingsRate,
        topCategories,
        goalsSummary,
        month: getMonthLabel(selectedMonth),
      });

      if (data) {
        setInsights(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getTipIcon = (type: string) => {
    switch (type) {
      case 'INVESTIMENTO':
        return <TrendingUp size={15} className="text-emerald-600 shrink-0 mt-0.5" />;
      case 'ALERTA':
        return <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />;
      default:
        return <Lightbulb size={15} className="text-indigo-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/10 via-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              Diagnóstico Inteligente Gemini
            </h3>
            <p className="text-[11px] text-slate-400">
              Análise personalizada de receitas, despesas e metas
            </p>
          </div>
        </div>

        {insights ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleGenerateInsights}
              disabled={isLoading}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-50"
              title="Atualizar análise"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerateInsights}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Gerar Diagnóstico</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Insights Content */}
      {insights && isExpanded && (
        <div className="pt-2 space-y-3 animate-in fade-in duration-300">
          {/* Status badge & Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Saúde Financeira
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle size={12} />
                {insights.status}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {insights.summary}
            </p>
          </div>

          {/* Actionable Tips */}
          {insights.tips && insights.tips.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Recomendações Práticas
              </span>
              <div className="space-y-1.5">
                {insights.tips.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-slate-200/70 rounded-xl flex items-start gap-2.5 text-xs hover:border-slate-300 transition-colors"
                  >
                    {getTipIcon(item.type)}
                    <div className="space-y-0.5 min-w-0">
                      <strong className="text-slate-900 block font-semibold truncate">
                        {item.title}
                      </strong>
                      <p className="text-slate-600 leading-snug">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Advice */}
          {insights.goalAdvice && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl text-xs text-indigo-950 space-y-0.5">
              <strong className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Sparkles size={13} className="text-indigo-600" />
                Foco nas Metas:
              </strong>
              <p className="leading-relaxed text-indigo-900/90">{insights.goalAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
