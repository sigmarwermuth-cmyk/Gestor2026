import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, CreditCard } from '../../types/finance';
import { formatCurrency, formatDateBr } from '../../utils/formatters';
import {
  createSingleTransactionReminderText,
  createDigestReminderText,
  sendWhatsAppMessage,
} from '../../utils/whatsapp';
import {
  getAutomationConfig,
  saveAutomationConfig,
  getDispatchLogs,
  addDispatchLog,
  getUpcomingDueItems,
  dispatchAutomatedWhatsAppReminder,
  requestBrowserNotificationPermission,
  WhatsAppAutomationConfig,
  WhatsAppDispatchLog,
} from '../../utils/whatsappAutomation';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard as CreditCardIcon,
  MessageCircle,
  Share2,
  Calendar,
  Settings,
  Edit2,
  Phone,
  Sparkles,
  Zap,
  History,
  ShieldCheck,
  Send
} from 'lucide-react';
import { TransactionModal } from './TransactionModal';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    transactions,
    accounts,
    creditCards,
    selectedMonth,
    toggleTransactionStatus,
    getCreditCardInvoice,
    hideValues,
  } = useFinance();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'CARDS' | 'AUTO'>('ALL');
  const [autoConfig, setAutoConfig] = useState<WhatsAppAutomationConfig>(getAutomationConfig());
  const [dispatchLogs, setDispatchLogs] = useState<WhatsAppDispatchLog[]>([]);
  const [isPhoneConfigOpen, setIsPhoneConfigOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [testSendStatus, setTestSendStatus] = useState<string | null>(null);

  // Load config and logs
  useEffect(() => {
    setAutoConfig(getAutomationConfig());
    setDispatchLogs(getDispatchLogs());
  }, [isOpen]);

  const handleUpdateAutoConfig = (updates: Partial<WhatsAppAutomationConfig>) => {
    const updated = { ...autoConfig, ...updates };
    setAutoConfig(updated);
    saveAutomationConfig(updated);
  };

  // 1. Pending Transactions for the month
  const pendingTransactions = transactions.filter(
    t => t.date.startsWith(selectedMonth) && t.status === 'PENDING'
  );

  const pendingExpenses = pendingTransactions.filter(t => t.type === 'EXPENSE');
  const pendingIncomes = pendingTransactions.filter(t => t.type === 'INCOME');

  // 2. Items due tomorrow (1 day before)
  const tomorrowDue = getUpcomingDueItems(transactions, creditCards, accounts, 1);

  // 3. Upcoming Cards
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
        isUpcoming: diff >= 0 && diff <= 10,
      };
    })
    .filter(item => item.invoiceAmount > 0);

  // 4. Totals
  const totalExpense = pendingExpenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = pendingIncomes.reduce((acc, t) => acc + t.amount, 0);
  const netProjected = totalIncome - totalExpense;

  // Send single WhatsApp reminder
  const handleSendSingleWhatsApp = (t: Transaction) => {
    const account = accounts.find(a => a.id === t.accountId);
    const card = t.creditCardId ? creditCards.find(c => c.id === t.creditCardId) : undefined;
    const accountName = card ? `Cartão ${card.name}` : account?.name;
    
    dispatchAutomatedWhatsAppReminder(t, accountName, autoConfig.phone);
    setDispatchLogs(getDispatchLogs());

    setCopiedFeedback(t.id);
    setTimeout(() => setCopiedFeedback(null), 3000);
  };

  // Dispatch all due tomorrow (1 day before)
  const handleDispatchTomorrowReminders = () => {
    if (tomorrowDue.transactions.length === 0) return;

    tomorrowDue.transactions.forEach(t => {
      const account = accounts.find(a => a.id === t.accountId);
      const card = t.creditCardId ? creditCards.find(c => c.id === t.creditCardId) : undefined;
      const accountName = card ? `Cartão ${card.name}` : account?.name;
      dispatchAutomatedWhatsAppReminder(t, accountName, autoConfig.phone);
    });

    setDispatchLogs(getDispatchLogs());
    setTestSendStatus('Lembretes de amanhã disparados com sucesso!');
    setTimeout(() => setTestSendStatus(null), 4000);
  };

  // Send complete digest
  const handleSendDigestWhatsApp = () => {
    const cardsToInclude = upcomingCards.map(c => ({
      card: c.card,
      invoiceAmount: c.invoiceAmount,
    }));
    const text = createDigestReminderText(pendingExpenses, pendingIncomes, cardsToInclude);
    sendWhatsAppMessage(text, autoConfig.phone);

    addDispatchLog({
      description: `Resumo Consolidado (${pendingExpenses.length} a pagar, ${pendingIncomes.length} a receber)`,
      amount: totalExpense,
      dueDate: new Date().toISOString().slice(0, 10),
      type: 'DIGEST',
      status: 'SENT',
      targetPhone: autoConfig.phone,
    });
    setDispatchLogs(getDispatchLogs());
  };

  // Enable Browser Push
  const handleEnableBrowserPush = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      handleUpdateAutoConfig({ autoNotifyBrowser: true });
      alert('Notificações no navegador ativadas com sucesso!');
    } else {
      alert('Permissão de notificações não foi concedida no navegador.');
    }
  };

  // Filter list
  let displayList: Transaction[] = [];
  if (activeFilter === 'ALL') {
    displayList = pendingTransactions;
  } else if (activeFilter === 'EXPENSE') {
    displayList = pendingExpenses;
  } else if (activeFilter === 'INCOME') {
    displayList = pendingIncomes;
  }

  // Sort by date ascending (soonest due dates first)
  displayList.sort((a, b) => a.date.localeCompare(b.date));

  // Compute status badge
  const getDueBadge = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dueDate = new Date(y, m - 1, d);
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Venceu há ${Math.abs(diffDays)} dia(s)`,
        style: 'bg-rose-100 text-rose-800 border-rose-200 font-semibold',
        icon: AlertTriangle,
        urgent: true,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'VENCE HOJE',
        style: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold animate-pulse',
        icon: Clock,
        urgent: true,
      };
    }
    if (diffDays === 1) {
      return {
        label: '⏰ VENCE AMANHÃ (1 dia)',
        style: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
        icon: Clock,
        urgent: true,
      };
    }
    if (diffDays <= 7) {
      return {
        label: `Vence em ${diffDays} dias`,
        style: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
        icon: Calendar,
        urgent: false,
      };
    }
    return {
      label: `Vencimento: ${formatDateBr(dateStr)}`,
      style: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Calendar,
      urgent: false,
    };
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Central de Lembretes & Automação WhatsApp"
        subtitle="Notificações automáticas 1 dia antes do vencimento e controle de contas"
      >
        <div className="space-y-4">
          {/* Summary Metric Header Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-3">
            <div className="grid grid-cols-3 gap-2 divide-x divide-white/10 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  A Pagar
                </span>
                <span className="text-sm sm:text-base font-extrabold text-rose-400 font-mono-num block mt-0.5">
                  {formatCurrency(totalExpense, hideValues)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {pendingExpenses.length} contas
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  A Receber
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono-num block mt-0.5">
                  {formatCurrency(totalIncome, hideValues)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {pendingIncomes.length} recebimentos
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Previsto
                </span>
                <span className={`text-sm sm:text-base font-extrabold font-mono-num block mt-0.5 ${netProjected >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {netProjected >= 0 ? '+' : ''}{formatCurrency(netProjected, hideValues)}
                </span>
                <span className="text-[10px] text-slate-400">
                  saldo líquido
                </span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSendDigestWhatsApp}
                className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              >
                <MessageCircle size={16} className="text-slate-950" />
                <span>Enviar Resumo no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPhoneConfigOpen(prev => !prev)}
                className="text-[11px] text-slate-300 hover:text-white flex items-center justify-center gap-1 py-1 px-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Phone size={12} />
                <span>{autoConfig.phone ? `WhatsApp: ${autoConfig.phone}` : 'Configurar Número'}</span>
              </button>
            </div>
          </div>

          {/* 1 Day Before Auto-Trigger Banner */}
          {tomorrowDue.totalCount > 0 && (
            <div className="p-3 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-orange-950">
                    {tomorrowDue.totalCount} {tomorrowDue.totalCount === 1 ? 'conta vence amanhã (1 dia antes)' : 'contas vencem amanhã (1 dia antes)'}!
                  </h4>
                  <p className="text-[11px] text-orange-800">
                    Pronta para envio do lembrete automático no WhatsApp.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDispatchTomorrowReminders}
                className="py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
              >
                <Zap size={14} />
                <span>Disparar de Amanhã</span>
              </button>
            </div>
          )}

          {testSendStatus && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>{testSendStatus}</span>
            </div>
          )}

          {/* WhatsApp Phone Quick Config Drawer */}
          {isPhoneConfigOpen && (
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Settings size={14} className="text-emerald-700" />
                  Configuração de WhatsApp & Envio Automático
                </span>
                <button
                  type="button"
                  onClick={() => setIsPhoneConfigOpen(false)}
                  className="text-emerald-700 hover:text-emerald-950 text-[11px] font-semibold"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                    Número de WhatsApp de Destino (com DDD)
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: 11999998888 ou 5511999998888"
                    value={autoConfig.phone}
                    onChange={e => handleUpdateAutoConfig({ phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-emerald-900 font-medium">
                    <span>Disparo Automático 1 dia antes</span>
                    <span className="block text-[10px] text-emerald-700">
                      Notificar automaticamente contas que vencem amanhã
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoConfig.enabled}
                    onChange={e => handleUpdateAutoConfig({ enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Segmented Filter Switcher */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`py-1.5 rounded-lg transition-all text-center ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({pendingTransactions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('EXPENSE')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeFilter === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle size={12} />
              A Pagar ({pendingExpenses.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('INCOME')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeFilter === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle size={12} />
              A Receber ({pendingIncomes.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('CARDS')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeFilter === 'CARDS'
                  ? 'bg-sky-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCardIcon size={12} />
              Faturas ({upcomingCards.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('AUTO')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeFilter === 'AUTO'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap size={12} className={activeFilter === 'AUTO' ? 'text-amber-400' : ''} />
              Automação
            </button>
          </div>

          {/* List of Pending Items */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeFilter !== 'CARDS' && activeFilter !== 'AUTO' && (
              <>
                {displayList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700">Tudo em dia!</p>
                    <p className="text-[11px] mt-0.5">Nenhuma conta pendente nesta categoria.</p>
                  </div>
                ) : (
                  displayList.map(item => {
                    const isExpense = item.type === 'EXPENSE';
                    const badge = getDueBadge(item.date);
                    const BadgeIcon = badge.icon;
                    const account = accounts.find(a => a.id === item.accountId);

                    return (
                      <div
                        key={item.id}
                        className={`p-3 bg-white rounded-2xl border shadow-2xs transition-all space-y-2 ${
                          badge.urgent ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isExpense ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                              }`}
                            >
                              {isExpense ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {item.description}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
                                <span>{item.category}</span>
                                {account && (
                                  <>
                                    <span>·</span>
                                    <span>{account.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`font-mono-num font-extrabold text-sm sm:text-base ${
                                isExpense ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {isExpense ? '- ' : '+ '}
                              {formatCurrency(item.amount, hideValues)}
                            </span>
                          </div>
                        </div>

                        {/* Status badge & action buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2 text-xs">
                          <div className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold flex items-center gap-1 ${badge.style}`}>
                            <BadgeIcon size={12} />
                            <span>{badge.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* WhatsApp button */}
                            <button
                              type="button"
                              onClick={() => handleSendSingleWhatsApp(item)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                              title="Enviar lembrete desta conta no WhatsApp"
                            >
                              <MessageCircle size={13} className="text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            {/* Mark Paid/Received */}
                            <button
                              type="button"
                              onClick={() => toggleTransactionStatus(item.id)}
                              className={`px-2.5 py-1 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-2xs ${
                                isExpense ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              <CheckCircle2 size={12} />
                              <span>{isExpense ? 'Pagar' : 'Receber'}</span>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingTransaction(item)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Credit Cards View */}
            {activeFilter === 'CARDS' && (
              <div className="space-y-2">
                {upcomingCards.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700">Faturas Zeradas</p>
                    <p className="text-[11px] mt-0.5">Nenhum cartão com saldo pendente de fatura.</p>
                  </div>
                ) : (
                  upcomingCards.map(({ card, invoiceAmount, diff }) => (
                    <div
                      key={card.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: card.color || '#0ea5e9' }}
                          >
                            <CreditCardIcon size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {card.name} (Final {card.lastDigits})
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              Vencimento: dia <strong>{card.dueDay}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono-num font-extrabold text-sm text-slate-900">
                            {formatCurrency(invoiceAmount, hideValues)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-500">
                          {diff >= 0 ? `Vence em ${diff} dias` : 'Fatura em aberto'}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const text = `🔔 *Lembrete FinanFlow: Fatura de Cartão*\n\n💳 *Cartão:* ${card.name} (Final ${card.lastDigits})\n💰 *Fatura Atual:* ${formatCurrency(invoiceAmount)}\n📅 *Vencimento:* Dia ${card.dueDay}\n\n_Gerado automaticamente via FinanFlow_`;
                            sendWhatsAppMessage(text, autoConfig.phone);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <MessageCircle size={13} className="text-emerald-600" />
                          <span>Lembrete WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Automation & Log View */}
            {activeFilter === 'AUTO' && (
              <div className="space-y-3">
                {/* Config card */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Zap size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Envio Automático 1 Dia Antes
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Dispara lembretes 24h antes do vencimento
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoConfig.enabled}
                        onChange={e => handleUpdateAutoConfig({ enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                        Número de WhatsApp Padrão
                      </span>
                      <input
                        type="tel"
                        placeholder="Ex: 11999998888"
                        value={autoConfig.phone}
                        onChange={e => handleUpdateAutoConfig({ phone: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono-num focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                        Horário Preferencial
                      </span>
                      <input
                        type="time"
                        value={autoConfig.notifyHour}
                        onChange={e => handleUpdateAutoConfig({ notifyHour: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Browser push action */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 text-[11px]">
                      Notificações no Navegador / Desktop:
                    </span>
                    <button
                      type="button"
                      onClick={handleEnableBrowserPush}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors"
                    >
                      Ativar Notificações
                    </button>
                  </div>
                </div>

                {/* Dispatch History Logs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <History size={13} className="text-slate-400" />
                      Histórico de Disparos Automáticos
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {dispatchLogs.length} registros
                    </span>
                  </div>

                  {dispatchLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                      Nenhum disparo registrado ainda.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {dispatchLogs.slice(0, 5).map(log => (
                        <div
                          key={log.id}
                          className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-xs flex items-center justify-between shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-slate-800 block truncate">
                              {log.description}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(log.dispatchedAt).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(log.dispatchedAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono-num font-bold text-slate-900 text-xs">
                              {formatCurrency(log.amount, hideValues)}
                            </span>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded flex items-center gap-0.5">
                              <CheckCircle2 size={10} />
                              Enviado
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Transaction Edit Modal */}
      {editingTransaction && (
        <TransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transactionToEdit={editingTransaction}
        />
      )}
    </>
  );
};
