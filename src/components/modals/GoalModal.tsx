import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import {
  Target,
  ShieldCheck,
  Plane,
  Home,
  Car,
  Laptop,
  Heart,
  GraduationCap,
  Sparkles,
  Coins,
  LucideIcon,
  Calculator
} from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: FinancialGoal | null;
}

const GOAL_ICONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'Target', label: 'Alvo Geral', icon: Target },
  { name: 'ShieldCheck', label: 'Reserva', icon: ShieldCheck },
  { name: 'Plane', label: 'Viagem', icon: Plane },
  { name: 'Home', label: 'Imóvel / Casa', icon: Home },
  { name: 'Car', label: 'Veículo', icon: Car },
  { name: 'Laptop', label: 'Tecnologia', icon: Laptop },
  { name: 'Heart', label: 'Saúde / Família', icon: Heart },
  { name: 'GraduationCap', label: 'Educação', icon: GraduationCap },
  { name: 'Coins', label: 'Patrimônio', icon: Coins },
  { name: 'Sparkles', label: 'Sonhos', icon: Sparkles },
];

const GOAL_COLORS = [
  '#10B981', // Emerald
  '#0EA5E9', // Sky Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#EF4444', // Red
  '#1E293B', // Slate
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, editGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [iconName, setIconName] = useState('Target');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmount(String(goalToEdit.targetAmount));
      setCurrentAmount(String(goalToEdit.currentAmount));
      setDeadline(goalToEdit.deadline);
      setColor(goalToEdit.color);
      setIconName(goalToEdit.iconName);
      setNotes(goalToEdit.notes || '');
    } else {
      setTitle('');
      setTargetAmount('10000');
      setCurrentAmount('0');
      // Default deadline: 1 year from now
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      setDeadline(oneYearLater.toISOString().slice(0, 10));
      setColor(GOAL_COLORS[0]);
      setIconName('Target');
      setNotes('');
    }
  }, [isOpen, goalToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTarget = parseFloat(targetAmount.replace(',', '.')) || 0;
    const parsedCurrent = parseFloat(currentAmount.replace(',', '.')) || 0;

    if (parsedTarget <= 0) return;

    if (goalToEdit) {
      editGoal(goalToEdit.id, {
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline,
        color,
        iconName,
        notes: notes.trim(),
      });
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline,
        color,
        iconName,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
      subtitle={goalToEdit ? 'Atualize seu objetivo e prazo' : 'Defina um valor alvo, valor atual e data limite para seu objetivo'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Title */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Título da Meta
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Reserva de Emergência, Viagem Europa, Carro Novo..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Amounts (Target & Current) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Valor Alvo (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="10000,00"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Valor Guardado (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Deadline (Prazo) */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Data Limite (Prazo)
          </label>
          <input
            type="date"
            required
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dynamic Monthly Savings Simulator */}
        {(() => {
          const parsedTarget = parseFloat(targetAmount.replace(',', '.')) || 0;
          const parsedCurrent = parseFloat(currentAmount.replace(',', '.')) || 0;
          const remainingToSave = Math.max(0, parsedTarget - parsedCurrent);

          let months = 1;
          if (deadline) {
            const [y, m, d] = deadline.split('-').map(Number);
            const targetDate = new Date(y, m - 1, d);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const diffTime = targetDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            months = Math.max(1, Math.round(diffDays / 30.4));
          }

          const monthlyNeed = remainingToSave / months;

          if (parsedTarget > 0 && remainingToSave <= 0) {
            return (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600 shrink-0" />
                <span>Parabéns! O valor guardado já atinge ou supera o alvo desta meta.</span>
              </div>
            );
          }

          if (parsedTarget > 0) {
            return (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Calculator size={14} className="text-emerald-600" />
                  <span>Plano de Aportes Recomendado:</span>
                </div>
                <p className="text-slate-600">
                  Para atingir o alvo de <strong>{formatCurrency(parsedTarget)}</strong> no prazo estimado ({months} {months === 1 ? 'mês' : 'meses'}), guarde cerca de:
                </p>
                <div className="pt-0.5 text-emerald-700 font-bold font-mono-num text-sm">
                  {formatCurrency(monthlyNeed)} / mês
                </div>
              </div>
            );
          }

          return null;
        })()}

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Ícone do Objetivo
          </label>
          <div className="grid grid-cols-5 gap-2">
            {GOAL_ICONS.map(item => {
              const Icon = item.icon;
              const isSelected = iconName === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIconName(item.name)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xs font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                  title={item.label}
                >
                  <Icon size={18} />
                  <span className="text-[9px] truncate max-w-full">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Cor de Identificação
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {GOAL_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  color === c ? 'scale-115 border-slate-900 shadow-sm' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Estratégia / Observações (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Aportar R$ 500 todo dia 5 no Tesouro Selic..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99]"
          >
            {goalToEdit ? 'Salvar Alterações da Meta' : 'Criar Meta Financeira'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
