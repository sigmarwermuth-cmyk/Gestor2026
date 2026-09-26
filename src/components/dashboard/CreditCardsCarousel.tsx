import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard as CardIcon, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { PayInvoiceModal } from '../modals/PayInvoiceModal';
import { CreditCardModal } from '../modals/CreditCardModal';
import { CreditCard } from '../../types/finance';

export const CreditCardsCarousel: React.FC = () => {
  const { creditCards, getCreditCardInvoice, hideValues, setActiveTab } = useFinance();

  const [selectedCardForPayment, setSelectedCardForPayment] = useState<CreditCard | null>(null);
  const [invoiceForPayment, setInvoiceForPayment] = useState(0);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const handleOpenPayment = (card: CreditCard, invoice: number) => {
    setSelectedCardForPayment(card);
    setInvoiceForPayment(invoice);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <CardIcon size={14} className="text-slate-600" />
          Cartões de Crédito
        </h3>
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
        >
          Gerenciar
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
        {creditCards.map(card => {
          const invoice = getCreditCardInvoice(card.id);
          const available = Math.max(0, card.limit - invoice);
          const percentUsed = Math.min(100, Math.round((invoice / card.limit) * 100));

          return (
            <div
              key={card.id}
              className="w-72 shrink-0 snap-start p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: card.color }}
                    />
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                      {card.name}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-num ml-5">
                    •••• {card.lastDigits}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Vence dia {card.dueDay}
                </span>
              </div>

              {/* Invoice & Available */}
              <div className="my-3 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Fatura Atual</span>
                  <span className="text-base font-bold font-mono-num text-slate-900">
                    {formatCurrency(invoice, hideValues)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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

                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Limite disp: {formatCurrency(available, hideValues)}</span>
                  <span className="font-mono-num">{percentUsed}%</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Fecha dia {card.closingDay}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenPayment(card, invoice)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                >
                  Pagar Fatura
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Card Quick Button */}
        <button
          type="button"
          onClick={() => setIsAddCardOpen(true)}
          className="w-40 shrink-0 snap-start p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-700 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 transition-colors">
            <Plus size={18} />
          </div>
          <span className="text-xs font-semibold">Novo Cartão</span>
        </button>
      </div>

      {/* Modals */}
      <PayInvoiceModal
        isOpen={!!selectedCardForPayment}
        onClose={() => setSelectedCardForPayment(null)}
        card={selectedCardForPayment}
        invoiceAmount={invoiceForPayment}
      />

      <CreditCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
      />
    </div>
  );
};
