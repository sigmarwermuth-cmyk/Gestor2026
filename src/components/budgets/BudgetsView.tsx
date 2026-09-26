import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MonthSelector } from '../common/MonthSelector';
import { CategoryIcon } from '../common/CategoryIcon';
import { GoalIcon } from '../common/GoalIcon';
import {
  formatCurrency,
  getMonthLabel,
  formatDateBr,
  getDeadlineRemainingText,
} from '../../utils/formatters';
import { Budget, FinancialGoal } from '../../types/finance';
import { BudgetModal } from '../modals/BudgetModal';
import { GoalModal } from '../modals/GoalModal';
import { ContributeGoalModal } from '../modals/ContributeGoalModal';
import {
  Plus,
  Target,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  PiggyBank,
  Calendar,
  Sparkles,
  PlusCircle,
  MoreVertical,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    goals,
    getBudgetSpending,
    selectedMonth,
    setSelectedMonth,
    hideValues,
    deleteBudget,
    deleteGoal,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'GOALS' | 'BUDGETS'>('GOALS');

  // Budget states
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Goal states
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForContribute, setGoalForContribute] = useState<FinancialGoal | null>(null);
  const [activeGoalMenuId, setActiveGoalMenuId] = useState<string | null>(null);

  // 1. Calculations for Monthly Budgets
  let totalLimit = 0;
  let totalSpent = 0;

  const budgetStats = budgets.map(b => {
    const spent = getBudgetSpending(b.category, selectedMonth);
    const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const remaining = b.monthlyLimit - spent;
    totalLimit += b.monthlyLimit;
    totalSpent += spent;

    let statusType: 'SAFE' | 'WARNING' | 'EXCEEDED' = 'SAFE';
    if (percent >= 100) {
      statusType = 'EXCEEDED';
    } else if (percent >= 80) {
      statusType = 'WARNING';
    }

    return {
      budget: b,
      spent,
      percent,
      remaining,
      statusType,
    };
  });

  const overallBudgetPercent = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;

  // 2. Calculations for Financial Goals
  const totalGoalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalGoalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallGoalPercent = totalGoalTarget > 0 ? Math.min(100, Math.round((totalGoalSaved / totalGoalTarget) * 100)) : 0;
  const completedGoalsCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-4">
      {/* Top Segmented Navigation Switcher: Metas vs Orçamentos */}
      <div className="flex items-center justify-between p-1 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('GOALS')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'GOALS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target size={16} className={activeSubTab === 'GOALS' ? 'text-emerald-400' : 'text-slate-500'} />
          <span>Metas Financeiras</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-md font-mono-num ${
              activeSubTab === 'GOALS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {goals.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('BUDGETS')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'BUDGETS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PiggyBank size={16} className={activeSubTab === 'BUDGETS' ? 'text-indigo-400' : 'text-slate-500'} />
          <span>Tetos de Gastos</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-md font-mono-num ${
              activeSubTab === 'BUDGETS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {budgets.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. VIEW: METAS FINANCEIRAS (FINANCIAL GOALS)                   */}
      {/* ============================================================== */}
      {activeSubTab === 'GOALS' && (
        <div className="space-y-4">
          {/* Header Action Row */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Objetivos & Metas de Longo Prazo
              </h3>
              <p className="text-xs text-slate-400">
                Defina valores alvo e prazos para acompanhar seu progresso
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setGoalToEdit(null);
                setIsGoalModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={16} />
              Nova Meta
            </button>
          </div>

          {/* Consolidated Goals Overview Banner */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[11px] text-slate-300 uppercase tracking-wider block font-semibold">
                  Patrimônio Alocado em Metas
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono-num mt-0.5 text-white">
                  {formatCurrency(totalGoalSaved, hideValues)}
                </div>
                <span className="text-xs text-slate-400">
                  de {formatCurrency(totalGoalTarget, hideValues)} planejados no total
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-300 block">Progresso Global</span>
                <span className="text-xl font-bold font-mono-num text-emerald-400">
                  {overallGoalPercent}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {completedGoalsCount} de {goals.length} atingidas
                </span>
              </div>
            </div>

            {/* Global Goal Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallGoalPercent}%` }}
              />
            </div>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {goals.map(goal => {
              const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const roundedPercent = Math.min(100, Math.round(percent));
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const deadlineText = getDeadlineRemainingText(goal.deadline);

              return (
                <div
                  key={goal.id}
                  className={`p-4 bg-white rounded-2xl border shadow-xs transition-all flex flex-col justify-between space-y-3 relative group hover:border-slate-300 ${
                    isCompleted ? 'border-emerald-300 bg-emerald-50/15' : 'border-slate-200/80'
                  }`}
                >
                  {/* Top card info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <GoalIcon iconName={goal.iconName} color={goal.color} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {goal.title}
                          </h4>
                          {isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                              <Sparkles size={10} />
                              Concluída!
                            </span>
                          )}
                        </div>
                        {goal.notes && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {goal.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveGoalMenuId(activeGoalMenuId === goal.id ? null : goal.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                        aria-label="Opções da meta"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {activeGoalMenuId === goal.id && (
                        <div className="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => {
                              setGoalToEdit(goal);
                              setActiveGoalMenuId(null);
                              setIsGoalModalOpen(true);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 size={13} className="text-slate-500" />
                            Editar Meta
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteGoal(goal.id);
                              setActiveGoalMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={13} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar & Amounts */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500 font-medium">Acumulado:</span>
                      <div className="text-right">
                        <span className="font-mono-num font-bold text-slate-900 text-sm">
                          {formatCurrency(goal.currentAmount, hideValues)}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">
                          / {formatCurrency(goal.targetAmount, hideValues)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${roundedPercent}%`,
                          backgroundColor: goal.color || '#10B981',
                        }}
                      />
                    </div>

                    {/* Percentage & Remaining */}
                    <div className="flex justify-between items-center text-[11px] pt-0.5">
                      <span className="font-mono-num font-bold text-slate-700">
                        {roundedPercent}% alcançado
                      </span>
                      <span className={isCompleted ? 'text-emerald-600 font-semibold' : 'text-slate-500 font-mono-num'}>
                        {isCompleted ? 'Objetivo 100% atingido!' : `Faltam ${formatCurrency(remaining, hideValues)}`}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Deadline info & Quick Contribute Action */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span>Prazo: <strong>{formatDateBr(goal.deadline)}</strong></span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">{deadlineText}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGoalForContribute(goal)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <PlusCircle size={13} />
                      Aportar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. VIEW: ORÇAMENTOS MENSAIS (TETOS DE GASTOS)                  */}
      {/* ============================================================== */}
      {activeSubTab === 'BUDGETS' && (
        <div className="space-y-4">
          {/* Month selector & action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <MonthSelector
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
              className="w-full sm:w-auto"
            />

            <button
              type="button"
              onClick={() => {
                setBudgetToEdit(null);
                setIsBudgetModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={16} />
              Novo Teto de Gasto
            </button>
          </div>

          {/* Overall Budget Header Card */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Orçamento Geral em {getMonthLabel(selectedMonth)}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {formatCurrency(totalSpent, hideValues)} consumidos de {formatCurrency(totalLimit, hideValues)}
                  </p>
                </div>
              </div>
              <span className="text-base font-extrabold font-mono-num text-slate-900">
                {overallBudgetPercent}%
              </span>
            </div>

            {/* Global Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallBudgetPercent >= 100
                    ? 'bg-rose-500'
                    : overallBudgetPercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, overallBudgetPercent)}%` }}
              />
            </div>

            {/* Subtitle breakdown */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                {totalLimit - totalSpent >= 0 ? 'Restante para gastar:' : 'Ultrapassado em:'}
                <strong className={`ml-1 font-mono-num ${totalLimit - totalSpent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(Math.abs(totalLimit - totalSpent), hideValues)}
                </strong>
              </span>
              <span className="text-slate-400">{budgets.length} categorias orçadas</span>
            </div>
          </div>

          {/* Status Legend (Rule colors explained) */}
          <div className="flex items-center gap-4 px-2 py-1 text-[11px] text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Sob controle (&lt; 80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Alerta (80% - 99%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Estourado (&ge; 100%)</span>
            </div>
          </div>

          {/* Budgets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {budgetStats.map(({ budget, spent, percent, remaining, statusType }) => {
              const isOver = statusType === 'EXCEEDED';
              const isWarn = statusType === 'WARNING';

              return (
                <div
                  key={budget.id}
                  className={`p-4 bg-white rounded-2xl border shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                    isOver
                      ? 'border-rose-200 hover:border-rose-300'
                      : isWarn
                      ? 'border-amber-200 hover:border-amber-300'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon categoryName={budget.category} size="md" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {budget.category}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs">
                          {isOver ? (
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Limite estourado!
                            </span>
                          ) : isWarn ? (
                            <span className="text-amber-600 font-semibold flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Atenção aos gastos
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle size={12} />
                              Dentro da meta
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setBudgetToEdit(budget);
                          setIsBudgetModalOpen(true);
                        }}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                        title="Editar Teto"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBudget(budget.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                        title="Excluir Teto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500">
                        Gasto: <strong className="font-mono-num text-slate-900">{formatCurrency(spent, hideValues)}</strong>
                      </span>
                      <span className="font-mono-num font-bold text-slate-700">
                        {Math.round(percent)}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-rose-500'
                            : isWarn
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Teto: {formatCurrency(budget.monthlyLimit, hideValues)}</span>
                      <span className={remaining >= 0 ? 'text-emerald-600' : 'text-rose-600 font-semibold'}>
                        {remaining >= 0 ? `Restam ${formatCurrency(remaining, hideValues)}` : `Excedeu ${formatCurrency(Math.abs(remaining), hideValues)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setBudgetToEdit(null);
        }}
        budgetToEdit={budgetToEdit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      <ContributeGoalModal
        isOpen={!!goalForContribute}
        onClose={() => setGoalForContribute(null)}
        goal={goalForContribute}
      />
    </div>
  );
};
