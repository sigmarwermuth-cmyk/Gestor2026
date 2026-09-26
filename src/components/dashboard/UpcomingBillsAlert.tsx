import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDateBr } from '../../utils/formatters';
import {
  createSingleTransactionReminderText,
  createDigestReminderText,
  sendWhatsAppMessage,
} from '../../utils/whatsapp';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  MessageCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Bell
} from 'lucide-react';
import { RemindersModal } from '../modals/RemindersModal';

export const UpcomingBillsAlert: React.FC = () => {
  const {
    transactions,
    accounts,
    creditCards,
    selectedMonth,
    toggleTransactionStatus,
    getCreditCardInvoice,
    hideValues,
    setActiveTab,
  } = useFinance();

  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  // Find pending transactions for the selected month
  const pendingTransactions = transactions.filter(
    t => t.date.startsWith(selectedMonth) && t.status === 'PENDING'
  );

  const pendingExpenses = pendingTransactions.filter(t => t.type === 'EXPENSE');
  const pendingIncomes = pendingTransactions.filter(t => t.type === 'INCOME');

  // Find cards with upcoming due date
  const now = new Date();
  const currentDay = now.getDate();
  const upcomingCards = creditCards
    .map(card => {
      const invoiceAmount = getCreditCardInvoice(card.id, selectedMonth);
      const diff = card.dueDay - currentDay;
      return {
        card,
        invoiceAmount,
        diff,
        isUpcoming: diff >= 0 && diff <= 7,
      };
    })
    .filter(item => item.invoiceAmount > 0 && item.isUpcoming);

  if (pendingTransactions.length === 0 && upcomingCards.length === 0) {
    return null;
  }

  const handleSendWhatsApp = (t: typeof pendingTransactions[0]) => {
    const account = accounts.find(a => a.id === t.accountId);
    const card = t.creditCardId ? creditCards.find(c => c.id === t.creditCardId) : undefined;
    const accountName = card ? `Cartão ${card.name}` : account?.name;
    const text = createSingleTransactionReminderText(t, accountName);
    sendWhatsAppMessage(text);
  };

  const handleSendAllWhatsApp = () => {
    const cardsToInclude = upcomingCards.map(c => ({
      card: c.card,
      invoiceAmount: c.invoiceAmount,
    }));
    const text = createDigestReminderText(pendingExpenses, pendingIncomes, cardsToInclude);
    sendWhatsAppMessage(text);
  };

  return (
    <>
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-2xl shadow-2xs space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bell size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-950 tracking-tight block">
                Lembretes & Contas Próximas
              </span>
              <span className="text-[10px] text-amber-800">
                {pendingExpenses.length} a pagar · {pendingIncomes.length} a receber
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp Digest Action */}
            <button
              type="button"
              onClick={handleSendAllWhatsApp}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs active:scale-95"
              title="Enviar resumo completo das contas no WhatsApp"
            >
              <MessageCircle size={13} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Open Full Hub */}
            <button
              type="button"
              onClick={() => setIsRemindersModalOpen(true)}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-0.5"
            >
              <span>Ver Todas</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Highlighted items preview */}
        <div className="space-y-1.5 pt-0.5">
          {pendingTransactions.slice(0, 3).map(t => {
            const isExpense = t.type === 'EXPENSE';
            const [y, m, d] = t.date.split('-').map(Number);
            const targetDate = new Date(y, m - 1, d);
            const nowDate = new Date();
            nowDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
            const isTomorrow = diffDays === 1;

            return (
              <div
                key={t.id}
                className={`flex items-center justify-between bg-white/95 p-2.5 rounded-xl border text-xs shadow-2xs ${
                  isTomorrow ? 'border-orange-300 ring-1 ring-orange-200/50' : 'border-amber-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div className={`p-1 rounded-md shrink-0 ${isExpense ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isExpense ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-800 truncate block">
                        {t.description}
                      </span>
                      {isTomorrow && (
                        <span className="px-1.5 py-0.2 bg-orange-100 text-orange-900 border border-orange-200 rounded text-[9px] font-extrabold shrink-0">
                          VENCE AMANHÃ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isExpense ? 'Vence:' : 'Previsão:'} {formatDateBr(t.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-bold font-mono-num ${
                      isExpense ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(t.amount, hideValues)}
                  </span>

                  {/* Individual WhatsApp button */}
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(t)}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                    title="Enviar lembrete desta conta no WhatsApp"
                    aria-label="Enviar lembrete no WhatsApp"
                  >
                    <MessageCircle size={13} />
                  </button>

                  {/* Mark as paid/received */}
                  <button
                    type="button"
                    onClick={() => toggleTransactionStatus(t.id)}
                    className={`px-2 py-1 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs ${
                      isExpense ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                    title={isExpense ? 'Marcar como pago' : 'Marcar como recebido'}
                  >
                    <CheckCircle2 size={11} />
                    <span>{isExpense ? 'Pagar' : 'Receber'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Cards warning */}
          {upcomingCards.slice(0, 1).map(({ card, invoiceAmount }) => (
            <div
              key={card.id}
              className="flex items-center justify-between bg-white/95 p-2.5 rounded-xl border border-amber-200/70 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <CreditCard size={14} className="text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 truncate block">
                    Fatura {card.name} ({formatCurrency(invoiceAmount, hideValues)})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Vence dia {card.dueDay} deste mês
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const text = `🔔 *Lembrete FinanFlow: Fatura de Cartão*\n\n💳 *Cartão:* ${card.name} (Final ${card.lastDigits})\n💰 *Fatura:* ${formatCurrency(invoiceAmount)}\n📅 *Vencimento:* Dia ${card.dueDay}\n\n_Gerado via FinanFlow_`;
                    sendWhatsAppMessage(text);
                  }}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                  title="Enviar lembrete da fatura no WhatsApp"
                >
                  <MessageCircle size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('accounts')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-0.5 shadow-2xs"
                >
                  <span>Pagar</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
      />
    </>
  );
};
