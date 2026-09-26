import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { PlusCircle, Target } from 'lucide-react';

interface ContributeGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
}

export const ContributeGoalModal: React.FC<ContributeGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { contributeToGoal } = useFinance();
  const [amount, setAmount] = useState('');

  if (!goal) return null;

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const newProjectedAmount = goal.currentAmount + parsedAmount;
  const percentAfter = Math.min(100, Math.round((newProjectedAmount / goal.targetAmount) * 100));

  const handleQuickAdd = (value: number) => {
    setAmount(String(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    contributeToGoal(goal.id, parsedAmount);
    setAmount('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Aportar na Meta: ${goal.title}`}
      subtitle={`Meta de ${formatCurrency(goal.targetAmount)} (Saldo atual: ${formatCurrency(goal.currentAmount)})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Valor do Aporte (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Quick Increment Buttons */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
            Valores Rápidos
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[100, 200, 500, 1000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200/60 font-mono-num"
              >
                +{formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Projected Progress Preview */}
        {parsedAmount > 0 && (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between items-center text-emerald-900 font-semibold">
              <span>Novo Saldo Guardado:</span>
              <span className="font-mono-num text-sm">{formatCurrency(newProjectedAmount)}</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${percentAfter}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 pt-0.5">
              <span>Progresso resultante</span>
              <span className="font-mono-num font-bold">{percentAfter}%</span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} />
            Confirmar Aporte
          </button>
        </div>
      </form>
    </Modal>
  );
};
