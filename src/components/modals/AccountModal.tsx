import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types/finance';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
}

const COLOR_OPTIONS = [
  '#820AD1', // Nubank
  '#EC7000', // Itaú
  '#FF7A00', // Inter
  '#CC092F', // Bradesco
  '#003399', // Caixa
  '#10B981', // Emerald / Dinheiro
  '#0EA5E9', // Sky Blue
  '#6366F1', // Indigo
  '#1E293B', // Dark Slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { addAccount, editAccount } = useFinance();

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setInstitution(accountToEdit.institution);
      setType(accountToEdit.type);
      setInitialBalance(String(accountToEdit.initialBalance));
      setColor(accountToEdit.color);
    } else {
      setName('');
      setInstitution('');
      setType('CHECKING');
      setInitialBalance('0');
      setColor(COLOR_OPTIONS[0]);
    }
  }, [isOpen, accountToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedBalance = parseFloat(initialBalance.replace(',', '.')) || 0;

    if (accountToEdit) {
      editAccount(accountToEdit.id, {
        name: name.trim(),
        institution: institution.trim() || name.trim(),
        type,
        initialBalance: parsedBalance,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        institution: institution.trim() || name.trim(),
        type,
        initialBalance: parsedBalance,
        color,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? 'Editar Conta' : 'Nova Conta Bancária'}
      subtitle={accountToEdit ? 'Atualize as informações da conta' : 'Cadastre uma conta corrente, investimento ou carteira'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nome da Conta
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Nubank Principal, Itaú Salário, Carteira..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Instituição Financeira / Banco
          </label>
          <input
            type="text"
            placeholder="Ex: Nubank, Itaú, Banco Inter, Santander..."
            value={institution}
            onChange={e => setInstitution(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tipo de Conta
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value="CHECKING">Conta Corrente</option>
              <option value="SAVINGS">Poupança</option>
              <option value="INVESTMENT">Investimentos</option>
              <option value="CASH">Dinheiro em Mãos</option>
              <option value="OTHER">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Saldo Inicial (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={e => setInitialBalance(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Cor de Identificação
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_OPTIONS.map(c => (
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
            {accountToEdit ? 'Salvar Conta' : 'Cadastrar Conta'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
