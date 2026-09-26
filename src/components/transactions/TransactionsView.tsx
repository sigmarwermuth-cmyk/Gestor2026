import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MonthSelector } from '../common/MonthSelector';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, formatDateBr, exportTransactionsToCsv, CATEGORIES } from '../../utils/formatters';
import { createSingleTransactionReminderText, sendWhatsAppMessage } from '../../utils/whatsapp';
import { Transaction, TransactionType } from '../../types/finance';
import {
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  ArrowUpDown,
  X,
  MessageCircle
} from 'lucide-react';
import { TransactionModal } from '../modals/TransactionModal';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    accounts,
    creditCards,
    selectedMonth,
    setSelectedMonth,
    hideValues,
    toggleTransactionStatus,
    deleteTransaction,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'PENDING'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DATE_DESC');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter and sort transactions
  const filtered = useMemo(() => {
    let list = transactions.filter(t => {
      // Month match
      const monthMatch = t.date.startsWith(selectedMonth);
      if (!monthMatch) return false;

      // Filter type
      if (filterType === 'EXPENSE' && t.type !== 'EXPENSE') return false;
      if (filterType === 'INCOME' && t.type !== 'INCOME') return false;
      if (filterType === 'TRANSFER' && t.type !== 'TRANSFER') return false;
      if (filterType === 'PENDING' && t.status !== 'PENDING') return false;

      // Filter category
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(query);
        const catMatch = t.category.toLowerCase().includes(query);
        const notesMatch = t.notes?.toLowerCase().includes(query);
        if (!descMatch && !catMatch && !notesMatch) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'DATE_DESC') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
      if (sortBy === 'DATE_ASC') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
      if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
      if (sortBy === 'AMOUNT_ASC') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [transactions, selectedMonth, filterType, selectedCategory, searchTerm, sortBy]);

  // Totals for filtered view
  const monthTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (!t.date.startsWith(selectedMonth)) continue;
      if (t.type === 'INCOME') income += t.amount;
      if (t.type === 'EXPENSE') expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [transactions, selectedMonth]);

  const getAccountOrCardName = (t: Transaction) => {
    if (t.creditCardId) {
      const card = creditCards.find(c => c.id === t.creditCardId);
      return card ? card.name : 'Cartão';
    }
    const acc = accounts.find(a => a.id === t.accountId);
    return acc ? acc.name : 'Conta';
  };

  const handleExport = () => {
    exportTransactionsToCsv(filtered, accounts, creditCards);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Month selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <MonthSelector
          selectedMonth={selectedMonth}
          onChange={setSelectedMonth}
          className="w-full sm:w-auto"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 sm:flex-none px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            title="Exportar para Excel / CSV"
          >
            <Download size={15} />
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={16} />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Month Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block">Receitas</span>
          <span className="text-xs sm:text-sm font-bold font-mono-num text-emerald-600">
            {formatCurrency(monthTotals.income, hideValues)}
          </span>
        </div>
        <div className="border-x border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 block">Despesas</span>
          <span className="text-xs sm:text-sm font-bold font-mono-num text-rose-600">
            {formatCurrency(monthTotals.expense, hideValues)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block">Saldo Líquido</span>
          <span
            className={`text-xs sm:text-sm font-bold font-mono-num ${
              monthTotals.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(monthTotals.balance, hideValues)}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por descrição, categoria..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas ({filtered.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('EXPENSE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              filterType === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowDownCircle size={13} />
            Despesas
          </button>
          <button
            type="button"
            onClick={() => setFilterType('INCOME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              filterType === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowUpCircle size={13} />
            Receitas
          </button>
          <button
            type="button"
            onClick={() => setFilterType('TRANSFER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              filterType === 'TRANSFER'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowRightLeft size={13} />
            Transferências
          </button>
          <button
            type="button"
            onClick={() => setFilterType('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              filterType === 'PENDING'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock size={13} />
            Pendentes
          </button>
        </div>

        {/* Secondary Category & Sorting Controls */}
        <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-[140px]">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs font-medium"
            >
              <option value="ALL">Todas as Categorias</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs font-medium"
            >
              <option value="DATE_DESC">Data (Mais recentes)</option>
              <option value="DATE_ASC">Data (Mais antigas)</option>
              <option value="AMOUNT_DESC">Valor (Maior p/ menor)</option>
              <option value="AMOUNT_ASC">Valor (Menor p/ maior)</option>
            </select>
          </div>

          {(selectedCategory !== 'ALL' || filterType !== 'ALL' || searchTerm.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setFilterType('ALL');
                setSearchTerm('');
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors shrink-0"
              title="Limpar filtros"
            >
              <X size={13} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Filter size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Nenhum lançamento encontrado</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere os filtros ou adicione uma nova transação neste mês.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus size={15} />
              Adicionar Lançamento
            </button>
          </div>
        ) : (
          filtered.map(t => {
            const isIncome = t.type === 'INCOME';
            const isTransfer = t.type === 'TRANSFER';
            const isPaid = t.status === 'PAID';

            return (
              <div
                key={t.id}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
              >
                {/* Left */}
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
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span className="text-slate-600 font-medium">{t.category}</span>
                      <span>·</span>
                      <span>{formatDateBr(t.date)}</span>
                      <span>·</span>
                      <span className="truncate">{getAccountOrCardName(t)}</span>
                    </div>
                    {t.notes && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 italic">
                        {t.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold font-mono-num ${
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

                  {/* Actions Dropdown */}
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
                          Lembrete WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTransaction(t);
                            setActiveMenuId(null);
                            setIsModalOpen(true);
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
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
