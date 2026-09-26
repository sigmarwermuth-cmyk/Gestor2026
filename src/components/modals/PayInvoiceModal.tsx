import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface PayInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
  invoiceAmount: number;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({
  isOpen,
  onClose,
  card,
  invoiceAmount,
}) => {
  const { accounts, payCreditCardInvoice, getAccountBalance } = useFinance();

  const [accountId, setAccountId] = useState(card?.accountId || accounts[0]?.id || '');
  const [amount, setAmount] = useState(String(invoiceAmount > 0 ? invoiceAmount : ''));

  if (!card) return null;

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const currentBalance = getAccountBalance(accountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    payCreditCardInvoice(card.id, parsedAmount, accountId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pagar Fatura - ${card.name}`}
      subtitle={`Fatura atual de ${formatCurrency(invoiceAmount)} (Vence dia ${card.dueDay})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Valor do Pagamento (R$)
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
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(invoiceAmount))}
            className="text-xs text-emerald-600 font-medium hover:underline mt-1 inline-block"
          >
            Pagar valor total ({formatCurrency(invoiceAmount)})
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">
              Debitar da Conta
            </label>
            <span className="text-[11px] text-slate-500 font-mono-num">
              Saldo: {formatCurrency(currentBalance)}
            </span>
          </div>
          <select
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.institution})
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <p>
            • Ao confirmar, será gerada uma despesa na categoria <strong>Contas & Boletos</strong> debitada da conta selecionada.
          </p>
          <p>• O limite do cartão será restabelecido imediatamente.</p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99]"
          >
            Confirmar Pagamento de Fatura
          </button>
        </div>
      </form>
    </Modal>
  );
};
