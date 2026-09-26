import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../utils/formatters';
import { Budget } from '../../types/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
}) => {
  const { budgets, addBudget, editBudget } = useFinance();

  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const expenseCategories = CATEGORIES.filter(c => c.type === 'EXPENSE');

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setMonthlyLimit(String(budgetToEdit.monthlyLimit));
    } else {
      // Find first category not already budgeted
      const existingCats = budgets.map(b => b.category);
      const available = expenseCategories.find(c => !existingCats.includes(c.name));
      setCategory(available ? available.name : expenseCategories[0]?.name || '');
      setMonthlyLimit('1000');
    }
  }, [isOpen, budgetToEdit, budgets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(monthlyLimit.replace(',', '.')) || 0;
    if (parsedLimit <= 0) return;

    if (budgetToEdit) {
      editBudget(budgetToEdit.id, parsedLimit);
    } else {
      addBudget({
        category,
        monthlyLimit: parsedLimit,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Editar Meta de Orçamento' : 'Novo Orçamento Mensal'}
      subtitle="Defina o limite máximo de gastos para esta categoria no mês"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Categoria de Despesa
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={!!budgetToEdit}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60"
          >
            {expenseCategories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Teto de Gastos Mensal (R$)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
              R$
            </div>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="1000,00"
              value={monthlyLimit}
              onChange={e => setMonthlyLimit(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99]"
          >
            {budgetToEdit ? 'Salvar Limite' : 'Criar Orçamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
