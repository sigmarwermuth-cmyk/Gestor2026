import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, formatDateBr } from '../../utils/formatters';
import { createSingleTransactionReminderText, sendWhatsAppMessage } from '../../utils/whatsapp';
import { CheckCircle2, Clock, ChevronRight, MoreVertical, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { Transaction } from '../../types/finance';
import { TransactionModal } from '../modals/TransactionModal';

export const RecentTransactions: React.FC = () => {
  const { transactions, accounts, creditCards, hideValues, toggleTransactionStatus, deleteTransaction, setActiveTab } = useFinance();

  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Take top 6 recent
  const recent = transactions.slice(0, 6);

  const getAccountOrCardName = (t: Transaction) => {
    if (t.creditCardId) {
      const card = creditCards.find(c => c.id === t.creditCardId);
      return card ? `${card.name} (••${card.lastDigits})` : 'Cartão';
    }
    const acc = accounts.find(a => a.id === t.accountId);
    return acc ? acc.name : 'Conta';
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Últimas Transações
        </h3>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
        >
          Ver todas ({transactions.length})
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {recent.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Nenhuma transação registrada.
          </div>
        ) : (
          recent.map(t => {
            const isIncome = t.type === 'INCOME';
            const isTransfer = t.type === 'TRANSFER';
            const isPaid = t.status === 'PAID';

            return (
              <div
                key={t.id}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors relative group"
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <CategoryIcon
                    categoryName={t.category}
                    type={t.type}
                    isCreditCard={!!t.creditCardId}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {t.description}
                      </span>
                      {t.installments && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-mono-num shrink-0">
                          {t.installments.current}/{t.installments.total}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span>{formatDateBr(t.date)}</span>
                      <span>·</span>
                      <span className="truncate">{getAccountOrCardName(t)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Value, Status Toggle & Action menu */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono-num ${
                        isIncome
                          ? 'text-emerald-600'
                          : isTransfer
                          ? 'text-slate-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatCurrency(t.amount, hideValues)}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTransactionStatus(t.id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                        isPaid
                          ? 'text-emerald-600 hover:text-emerald-700'
                          : 'text-amber-600 hover:text-amber-700'
                      }`}
                      title={isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Efetuado</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>Pendente</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Menu Options Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Opções"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === t.id && (
                      <div className="absolute right-0 top-9 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            const account = accounts.find(a => a.id === t.accountId);
                            const card = t.creditCardId ? creditCards.find(c => c.id === t.creditCardId) : undefined;
                            const text = createSingleTransactionReminderText(t, card ? `Cartão ${card.name}` : account?.name);
                            sendWhatsAppMessage(text);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors font-medium"
                        >
                          <MessageCircle size={13} className="text-emerald-600" />
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionToEdit(t);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                          <Edit2 size={13} className="text-slate-500" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteTransaction(t.id);
                            setActiveMenuId(null);
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
              </div>
            );
          })
        )}
      </div>

      <TransactionModal
        isOpen={!!transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
        transactionToEdit={transactionToEdit}
      />
    </div>
  );
};
