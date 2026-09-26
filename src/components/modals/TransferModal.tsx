import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, getAccountBalance, addTransfer } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const fromBalance = getAccountBalance(fromAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      setError('A conta de origem e destino devem ser diferentes.');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    addTransfer(fromAccountId, toAccountId, parsedAmount, date, notes.trim());
    setError('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferência entre Contas"
      subtitle="Movimente saldo entre suas carteiras e contas bancárias"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Valor a Transferir (R$)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
              R$
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              value={amount}
              onChange={e => {
                setAmount(e.target.value);
                setError('');
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* From and To Accounts */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Conta de Origem (Sai o dinheiro)
              </label>
              <span className="text-[11px] text-slate-500 font-mono-num">
                Saldo: {formatCurrency(fromBalance)}
              </span>
            </div>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center -my-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-2xs">
              <ArrowRightLeft size={14} className="rotate-90" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Conta de Destino (Entra o dinheiro)
            </label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                  {acc.name} ({acc.institution}) {acc.id === fromAccountId ? '(Conta de Origem)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Data da Transferência
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Observação (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Aporte investimentos, ressarcimento..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            Confirmar Transferência
          </button>
        </div>
      </form>
    </Modal>
  );
};
