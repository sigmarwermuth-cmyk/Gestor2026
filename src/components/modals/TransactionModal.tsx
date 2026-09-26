import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, TransactionStatus } from '../../types/finance';
import { CATEGORIES, formatCurrency } from '../../utils/formatters';
import { suggestCategoryWithGemini } from '../../services/aiCategoryService';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Layers,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
  defaultType = 'EXPENSE',
}) => {
  const { accounts, creditCards, addTransaction, editTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ACCOUNT' | 'CARD'>('ACCOUNT');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('PAID');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [notes, setNotes] = useState('');

  // AI Category Suggestion States
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [aiSuggestionInfo, setAiSuggestionInfo] = useState<{ category: string; reason?: string } | null>(null);
  const [userManuallyPickedCategory, setUserManuallyPickedCategory] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset or fill on open/change
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      if (transactionToEdit.creditCardId) {
        setPaymentMethod('CARD');
        setSelectedCardId(transactionToEdit.creditCardId);
      } else {
        setPaymentMethod('ACCOUNT');
        setSelectedAccountId(transactionToEdit.accountId);
      }
      setDate(transactionToEdit.date);
      setStatus(transactionToEdit.status);
      setInstallmentsCount(transactionToEdit.installments?.total || 1);
      setNotes(transactionToEdit.notes || '');
      setUserManuallyPickedCategory(true);
      setAiSuggestionInfo(null);
    } else {
      setType(defaultType);
      setDescription('');
      setAmount('');
      const defaultCats = CATEGORIES.filter(c => c.type === defaultType);
      setCategory(defaultCats[0]?.name || '');
      setPaymentMethod('ACCOUNT');
      setSelectedAccountId(accounts[0]?.id || '');
      setSelectedCardId(creditCards[0]?.id || '');
      setDate(new Date().toISOString().slice(0, 10));
      setStatus('PAID');
      setInstallmentsCount(1);
      setNotes('');
      setUserManuallyPickedCategory(false);
      setAiSuggestionInfo(null);
    }
  }, [isOpen, transactionToEdit, defaultType, accounts, creditCards]);

  // When type changes, ensure valid category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCats = CATEGORIES.filter(c => c.type === newType);
    if (!validCats.some(c => c.name === category)) {
      setCategory(validCats[0]?.name || '');
    }
    if (newType === 'INCOME') {
      setPaymentMethod('ACCOUNT');
    }
    setAiSuggestionInfo(null);
  };

  // Trigger Gemini AI Category Suggestion
  const triggerAiSuggestion = async (textToAnalyze: string, isAuto = false) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 3) return;

    setIsSuggestingCategory(true);
    try {
      const result = await suggestCategoryWithGemini(textToAnalyze, type);
      if (result && result.category) {
        setCategory(result.category);
        setAiSuggestionInfo(result);
      }
    } catch (err) {
      console.warn('Could not suggest category:', err);
    } finally {
      setIsSuggestingCategory(false);
    }
  };

  // Automatic Debounced AI Suggestion on Description change
  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);

    // If editing or user already picked category manually, don't override automatically unless clicked
    if (transactionToEdit || userManuallyPickedCategory) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newDesc.trim().length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        triggerAiSuggestion(newDesc, true);
      }, 750);
    }
  };

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const installmentValue = installmentsCount > 1 ? parsedAmount / installmentsCount : parsedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || parsedAmount <= 0) return;

    if (transactionToEdit) {
      editTransaction(transactionToEdit.id, {
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        accountId: paymentMethod === 'CARD' ? (creditCards.find(c => c.id === selectedCardId)?.accountId || selectedAccountId) : selectedAccountId,
        creditCardId: paymentMethod === 'CARD' ? selectedCardId : undefined,
        date,
        status,
        notes: notes.trim(),
      });
    } else {
      addTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        accountId: paymentMethod === 'CARD' ? (creditCards.find(c => c.id === selectedCardId)?.accountId || selectedAccountId) : selectedAccountId,
        creditCardId: paymentMethod === 'CARD' ? selectedCardId : undefined,
        date,
        status,
        notes: notes.trim(),
        totalInstallments: installmentsCount,
      });
    }

    onClose();
  };

  const availableCategories = CATEGORIES.filter(c => c.type === type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
      subtitle={transactionToEdit ? 'Atualize as informações da transação' : 'Cadastre uma receita ou despesa'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        {!transactionToEdit && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle size={15} />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle size={15} />
              Receita
            </button>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Valor (R$)
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
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Description with AI Assistant hint */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700">
              Descrição
            </label>
            {description.trim().length >= 3 && (
              <button
                type="button"
                onClick={() => triggerAiSuggestion(description)}
                disabled={isSuggestingCategory}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors disabled:opacity-50"
                title="Classificar categoria automaticamente com o Gemini"
              >
                {isSuggestingCategory ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-emerald-600" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="text-emerald-600" />
                    <span>Sugerir Categoria com IA</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            type="text"
            required
            placeholder="Ex: Supermercado Pão de Açúcar, Uber, Netflix, Salário..."
            value={description}
            onChange={e => handleDescriptionChange(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Picker with AI feedback badge */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700">
              Categoria
            </label>
            {aiSuggestionInfo && (
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/50">
                <Sparkles size={10} className="text-emerald-600" />
                Sugerido por IA
              </span>
            )}
          </div>

          <select
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setUserManuallyPickedCategory(true);
            }}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          >
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* AI Reason hint if available */}
          {aiSuggestionInfo?.reason && (
            <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
              <span className="text-emerald-600 font-semibold shrink-0">IA:</span>
              <span className="italic">{aiSuggestionInfo.reason}</span>
            </p>
          )}
        </div>

        {/* Payment Account or Credit Card (Only for expense) */}
        {type === 'EXPENSE' && creditCards.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethod('ACCOUNT')}
                className={`py-1.5 rounded-lg transition-all ${
                  paymentMethod === 'ACCOUNT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Conta / PIX / Débito
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-1.5 rounded-lg transition-all ${
                  paymentMethod === 'CARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Cartão de Crédito
              </button>
            </div>
          </div>
        )}

        {/* Account / Card Selectors */}
        {paymentMethod === 'ACCOUNT' || type === 'INCOME' ? (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {type === 'INCOME' ? 'Depositar na Conta' : 'Debitar da Conta'}
            </label>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cartão de Crédito
            </label>
            <select
              value={selectedCardId}
              onChange={e => setSelectedCardId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              {creditCards.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Final {c.lastDigits})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date and Status in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Data
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TransactionStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value="PAID">Pago / Concluído</option>
              <option value="PENDING">Pendente / Agendado</option>
            </select>
          </div>
        </div>

        {/* Installments (Parcelamento) - Only when adding new expense */}
        {!transactionToEdit && type === 'EXPENSE' && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-slate-500" />
                Parcelamento
              </label>
              {installmentsCount > 1 && (
                <span className="text-xs font-semibold text-emerald-600 font-mono-num">
                  {installmentsCount}x de {formatCurrency(installmentValue)}
                </span>
              )}
            </div>
            <select
              value={installmentsCount}
              onChange={e => setInstallmentsCount(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value={1}>1x (À vista - R$ {parsedAmount.toFixed(2)})</option>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(num => (
                <option key={num} value={num}>
                  {num}x de R$ {(parsedAmount > 0 ? parsedAmount / num : 0).toFixed(2)} / mês
                </option>
              ))}
            </select>
            {installmentsCount > 1 && (
              <p className="text-[11px] text-slate-500 mt-1">
                O FinanFlow agendará automaticamente as {installmentsCount} parcelas nos meses subsequentes.
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Observações (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Nota fiscal, detalhes adicionais..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {transactionToEdit ? 'Salvar Alterações' : 'Confirmar Lançamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
