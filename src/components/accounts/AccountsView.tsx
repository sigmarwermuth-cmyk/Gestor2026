import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Wallet,
  CreditCard as CardIcon,
  Plus,
  ArrowRightLeft,
  Edit2,
  Trash2,
  ShieldCheck,
  Building2,
  PiggyBank,
  TrendingUp,
  Coins
} from 'lucide-react';
import { AccountModal } from '../modals/AccountModal';
import { CreditCardModal } from '../modals/CreditCardModal';
import { TransferModal } from '../modals/TransferModal';
import { PayInvoiceModal } from '../modals/PayInvoiceModal';
import { Account, CreditCard, AccountType } from '../../types/finance';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    creditCards,
    getAccountBalance,
    getCreditCardInvoice,
    consolidatedBalance,
    hideValues,
    deleteAccount,
    deleteCreditCard,
  } = useFinance();

  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [cardToEdit, setCardToEdit] = useState<CreditCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [cardForPayment, setCardForPayment] = useState<CreditCard | null>(null);
  const [invoiceForPayment, setInvoiceForPayment] = useState(0);

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'CHECKING': return 'Conta Corrente';
      case 'SAVINGS': return 'Poupança';
      case 'INVESTMENT': return 'Investimentos';
      case 'CASH': return 'Dinheiro Físico';
      default: return 'Outros';
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'INVESTMENT': return <TrendingUp size={16} />;
      case 'SAVINGS': return <PiggyBank size={16} />;
      case 'CASH': return <Coins size={16} />;
      default: return <Building2 size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Patrimônio Banner */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Patrimônio Líquido em Contas
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono-num text-slate-900 mt-1">
            {formatCurrency(consolidatedBalance, hideValues)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Saldos conciliados automaticamente com todas as transações
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTransferModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowRightLeft size={15} />
            Transferência
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountToEdit(null);
              setIsAccountModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Contas Bancárias Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet size={14} className="text-slate-600" />
            Contas e Carteiras ({accounts.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accounts.map(acc => {
            const balance = getAccountBalance(acc.id);

            return (
              <div
                key={acc.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {getAccountTypeIcon(acc.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {acc.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span>{acc.institution}</span>
                      <span>·</span>
                      <span>{getAccountTypeLabel(acc.type)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Saldo Atual</span>
                    <span
                      className={`text-base font-bold font-mono-num ${
                        balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(balance, hideValues)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 pl-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountToEdit(acc);
                        setIsAccountModalOpen(true);
                      }}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                      title="Editar Conta"
                    >
                      <Edit2 size={13} />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteAccount(acc.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                        title="Excluir Conta"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cartões de Crédito Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CardIcon size={14} className="text-slate-600" />
            Cartões de Crédito ({creditCards.length})
          </h3>
          <button
            type="button"
            onClick={() => {
              setCardToEdit(null);
              setIsCardModalOpen(true);
            }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <Plus size={14} />
            Novo Cartão
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {creditCards.map(card => {
            const invoice = getCreditCardInvoice(card.id);
            const available = Math.max(0, card.limit - invoice);
            const percentUsed = Math.min(100, Math.round((invoice / card.limit) * 100));

            return (
              <div
                key={card.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: card.color }}
                    >
                      <CardIcon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {card.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>{card.brand}</span>
                        <span>·</span>
                        <span className="font-mono-num">Final {card.lastDigits}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCardToEdit(card);
                        setIsCardModalOpen(true);
                      }}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                      title="Editar Cartão"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCreditCard(card.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                      title="Excluir Cartão"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Invoice and Limit stats */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-medium">Fatura Atual:</span>
                    <span className="text-sm font-bold font-mono-num text-slate-900">
                      {formatCurrency(invoice, hideValues)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentUsed > 90
                          ? 'bg-rose-500'
                          : percentUsed > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Limite Total: {formatCurrency(card.limit, hideValues)}</span>
                    <span>Disponível: {formatCurrency(available, hideValues)}</span>
                  </div>
                </div>

                {/* Footer and pay action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-[11px] text-slate-400">
                    <span>Fecha dia {card.closingDay}</span>
                    <span className="mx-1">·</span>
                    <span className="font-semibold text-slate-700">Vence dia {card.dueDay}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCardForPayment(card);
                      setInvoiceForPayment(invoice);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
                  >
                    Pagar Fatura
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
      />

      <CreditCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        cardToEdit={cardToEdit}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <PayInvoiceModal
        isOpen={!!cardForPayment}
        onClose={() => setCardForPayment(null)}
        card={cardForPayment}
        invoiceAmount={invoiceForPayment}
      />
    </div>
  );
};
