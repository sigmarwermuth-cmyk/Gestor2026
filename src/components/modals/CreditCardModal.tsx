import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard } from '../../types/finance';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: CreditCard | null;
}

const CARD_COLORS = [
  '#820AD1', // Nubank Purple
  '#1E293B', // Black / Titanium
  '#0F766E', // Teal
  '#1D4ED8', // Royal Blue
  '#BE185D', // Magenta
  '#B45309', // Gold / Bronze
];

export const CreditCardModal: React.FC<CreditCardModalProps> = ({
  isOpen,
  onClose,
  cardToEdit,
}) => {
  const { accounts, addCreditCard, editCreditCard } = useFinance();

  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('25');
  const [dueDay, setDueDay] = useState('5');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [lastDigits, setLastDigits] = useState('');
  const [brand, setBrand] = useState('Mastercard');
  const [color, setColor] = useState(CARD_COLORS[0]);

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name);
      setLimit(String(cardToEdit.limit));
      setClosingDay(String(cardToEdit.closingDay));
      setDueDay(String(cardToEdit.dueDay));
      setAccountId(cardToEdit.accountId);
      setLastDigits(cardToEdit.lastDigits);
      setBrand(cardToEdit.brand);
      setColor(cardToEdit.color);
    } else {
      setName('');
      setLimit('5000');
      setClosingDay('25');
      setDueDay('5');
      setAccountId(accounts[0]?.id || '');
      setLastDigits('1234');
      setBrand('Mastercard');
      setColor(CARD_COLORS[0]);
    }
  }, [isOpen, cardToEdit, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedLimit = parseFloat(limit.replace(',', '.')) || 0;
    const parsedClosing = parseInt(closingDay, 10) || 1;
    const parsedDue = parseInt(dueDay, 10) || 10;

    if (cardToEdit) {
      editCreditCard(cardToEdit.id, {
        name: name.trim(),
        limit: parsedLimit,
        closingDay: parsedClosing,
        dueDay: parsedDue,
        accountId,
        lastDigits: lastDigits.slice(-4) || '0000',
        brand,
        color,
      });
    } else {
      addCreditCard({
        name: name.trim(),
        limit: parsedLimit,
        closingDay: parsedClosing,
        dueDay: parsedDue,
        accountId,
        lastDigits: lastDigits.slice(-4) || '0000',
        brand,
        color,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cardToEdit ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
      subtitle={cardToEdit ? 'Atualize limites e datas do cartão' : 'Controle limites, faturas e vencimentos'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nome do Cartão
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Nubank Ultravioleta, Inter Black..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Limite Total (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="5000,00"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Últimos 4 Dígitos
            </label>
            <input
              type="text"
              maxLength={4}
              placeholder="Ex: 8492"
              value={lastDigits}
              onChange={e => setLastDigits(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Dia do Fechamento
            </label>
            <input
              type="number"
              min={1}
              max={31}
              required
              value={closingDay}
              onChange={e => setClosingDay(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Dia do Vencimento
            </label>
            <input
              type="number"
              min={1}
              max={31}
              required
              value={dueDay}
              onChange={e => setDueDay(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Conta Vinculada para Pagamento
          </label>
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

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Cor do Cartão
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {CARD_COLORS.map(c => (
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

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99]"
          >
            {cardToEdit ? 'Salvar Cartão' : 'Cadastrar Cartão'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
