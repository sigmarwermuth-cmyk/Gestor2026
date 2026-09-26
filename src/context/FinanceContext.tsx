import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Account,
  CreditCard,
  Budget,
  FinancialGoal,
  Transaction,
  MonthlyStats,
  TransactionType,
  TransactionStatus,
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CREDIT_CARDS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  generateInitialTransactions,
} from '../data/initialData';
import { getCurrentYearMonth } from '../utils/formatters';

interface FinanceContextType {
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  hideValues: boolean;
  setHideValues: (hide: boolean) => void;
  toggleHideValues: () => void;
  deviceMode: 'mobile' | 'desktop';
  setDeviceMode: (mode: 'mobile' | 'desktop') => void;
  activeTab: 'dashboard' | 'transactions' | 'accounts' | 'budgets' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'accounts' | 'budgets' | 'reports') => void;
  
  // Computations
  getAccountBalance: (accountId: string) => number;
  consolidatedBalance: number;
  monthlyStats: MonthlyStats;
  getCreditCardInvoice: (cardId: string, month?: string) => number;
  getBudgetSpending: (category: string, month?: string) => number;
  
  // Operations
  addTransaction: (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    accountId: string;
    destinationAccountId?: string;
    creditCardId?: string;
    date: string;
    status: TransactionStatus;
    notes?: string;
    totalInstallments?: number;
  }) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;
  
  addAccount: (account: Omit<Account, 'id'>) => void;
  editAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  editCreditCard: (id: string, updates: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  payCreditCardInvoice: (cardId: string, amount: number, accountId: string) => void;
  
  addTransfer: (fromAccountId: string, toAccountId: string, amount: number, date: string, notes?: string) => void;
  
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  editBudget: (id: string, limit: number) => void;
  deleteBudget: (id: string) => void;

  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  editGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  
  restoreBackup: (backup: any) => void;
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: 'finanflow_accounts_v1',
  CARDS: 'finanflow_cards_v1',
  TRANSACTIONS: 'finanflow_transactions_v1',
  BUDGETS: 'finanflow_budgets_v1',
  GOALS: 'finanflow_goals_v1',
  HIDE_VALUES: 'finanflow_hide_values_v1',
  DEVICE_MODE: 'finanflow_device_mode_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentYearMonth());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'accounts' | 'budgets' | 'reports'>('dashboard');

  const [hideValues, setHideValues] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HIDE_VALUES);
    return saved ? JSON.parse(saved) : false;
  });

  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEVICE_MODE);
    if (saved === 'mobile' || saved === 'desktop') return saved;
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ACCOUNTS;
  });

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CREDIT_CARDS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateInitialTransactions();
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_GOALS;
  });

  // Local storage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(creditCards));
  }, [creditCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIDE_VALUES, JSON.stringify(hideValues));
  }, [hideValues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICE_MODE, deviceMode);
  }, [deviceMode]);

  const toggleHideValues = () => setHideValues(prev => !prev);

  // Computations
  const getAccountBalance = (accountId: string): number => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return 0;
    let balance = acc.initialBalance;

    for (const t of transactions) {
      if (t.status !== 'PAID') continue;

      // Income directly to account
      if (t.type === 'INCOME' && t.accountId === accountId) {
        balance += t.amount;
      }
      // Expense paid with debit/account directly (not credit card)
      else if (t.type === 'EXPENSE' && t.accountId === accountId && !t.creditCardId) {
        balance -= t.amount;
      }
      // Transfer out
      else if (t.type === 'TRANSFER' && t.accountId === accountId) {
        balance -= t.amount;
      }
      // Transfer in
      else if (t.type === 'TRANSFER' && t.destinationAccountId === accountId) {
        balance += t.amount;
      }
    }

    return balance;
  };

  const consolidatedBalance = useMemo(() => {
    return accounts.reduce((acc, account) => acc + getAccountBalance(account.id), 0);
  }, [accounts, transactions]);

  const getCreditCardInvoice = (cardId: string, month = selectedMonth): number => {
    return transactions
      .filter(t => t.creditCardId === cardId && t.date.startsWith(month) && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBudgetSpending = (category: string, month = selectedMonth): number => {
    return transactions
      .filter(t => t.category === category && t.date.startsWith(month) && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const monthlyStats: MonthlyStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (!t.date.startsWith(selectedMonth)) continue;
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
      }
    }

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
    };
  }, [transactions, selectedMonth]);

  // Operations
  const addTransaction = (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    accountId: string;
    destinationAccountId?: string;
    creditCardId?: string;
    date: string;
    status: TransactionStatus;
    notes?: string;
    totalInstallments?: number;
  }) => {
    const totalInstallments = data.totalInstallments && data.totalInstallments > 1 ? data.totalInstallments : 1;

    if (totalInstallments === 1) {
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        accountId: data.accountId,
        destinationAccountId: data.destinationAccountId,
        creditCardId: data.creditCardId,
        date: data.date,
        status: data.status,
        notes: data.notes,
        createdAt: Date.now(),
      };
      setTransactions(prev => [newTx, ...prev]);
    } else {
      // Create multiple installments
      const installmentAmount = Number((data.amount / totalInstallments).toFixed(2));
      const parentId = `inst-group-${Date.now()}`;
      const [yearStr, monthStr, dayStr] = data.date.split('-');
      const baseYear = parseInt(yearStr, 10);
      const baseMonth = parseInt(monthStr, 10) - 1; // 0-based
      const baseDay = parseInt(dayStr, 10);

      const newTxs: Transaction[] = [];

      for (let i = 1; i <= totalInstallments; i++) {
        // Calculate date for each month
        const targetDate = new Date(baseYear, baseMonth + (i - 1), baseDay);
        // Avoid day overflow (e.g. 31st in 30-day month)
        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(Math.min(baseDay, 28)).padStart(2, '0');
        const formattedDate = `${y}-${m}-${d}`;

        newTxs.push({
          id: `tx-${parentId}-${i}`,
          description: `${data.description}`,
          amount: installmentAmount,
          type: data.type,
          category: data.category,
          accountId: data.accountId,
          destinationAccountId: data.destinationAccountId,
          creditCardId: data.creditCardId,
          date: formattedDate,
          status: i === 1 ? data.status : 'PENDING',
          installments: {
            current: i,
            total: totalInstallments,
            parentId,
          },
          notes: data.notes,
          createdAt: Date.now(),
        });
      }

      setTransactions(prev => [...newTxs, ...prev]);
    }
  };

  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const toggleTransactionStatus = (id: string) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            status: t.status === 'PAID' ? 'PENDING' : 'PAID',
          };
        }
        return t;
      })
    );
  };

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const editAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addCreditCard = (cardData: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...cardData,
      id: `card-${Date.now()}`,
    };
    setCreditCards(prev => [...prev, newCard]);
  };

  const editCreditCard = (id: string, updates: Partial<CreditCard>) => {
    setCreditCards(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
  };

  const payCreditCardInvoice = (cardId: string, amount: number, accountId: string) => {
    const card = creditCards.find(c => c.id === cardId);
    if (!card) return;

    const newTx: Transaction = {
      id: `tx-paycard-${Date.now()}`,
      description: `Pagamento Fatura ${card.name}`,
      amount,
      type: 'EXPENSE',
      category: 'Contas & Boletos',
      accountId,
      date: new Date().toISOString().slice(0, 10),
      status: 'PAID',
      notes: `Quitação de fatura do cartão final ${card.lastDigits}`,
      createdAt: Date.now(),
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  const addTransfer = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    notes?: string
  ) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    const newTx: Transaction = {
      id: `tx-trf-${Date.now()}`,
      description: `Transferência: ${fromAcc?.name || 'Origem'} ➔ ${toAcc?.name || 'Destino'}`,
      amount,
      type: 'TRANSFER',
      category: 'Outras Despesas',
      accountId: fromAccountId,
      destinationAccountId: toAccountId,
      date,
      status: 'PAID',
      notes,
      createdAt: Date.now(),
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `bgt-${Date.now()}`,
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const editBudget = (id: string, limit: number) => {
    setBudgets(prev => prev.map(b => (b.id === id ? { ...b, monthlyLimit: limit } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addGoal = (goalData: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: Date.now(),
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const editGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === id) {
          return {
            ...g,
            currentAmount: Math.max(0, g.currentAmount + amount),
          };
        }
        return g;
      })
    );
  };

  const restoreBackup = (backup: any) => {
    if (backup.accounts && Array.isArray(backup.accounts)) {
      setAccounts(backup.accounts);
    }
    if (backup.creditCards && Array.isArray(backup.creditCards)) {
      setCreditCards(backup.creditCards);
    }
    if (backup.transactions && Array.isArray(backup.transactions)) {
      setTransactions(backup.transactions);
    }
    if (backup.budgets && Array.isArray(backup.budgets)) {
      setBudgets(backup.budgets);
    }
    if (backup.goals && Array.isArray(backup.goals)) {
      setGoals(backup.goals);
    }
  };

  const resetData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setCreditCards(INITIAL_CREDIT_CARDS);
    setTransactions(generateInitialTransactions());
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        creditCards,
        transactions,
        budgets,
        goals,
        selectedMonth,
        setSelectedMonth,
        hideValues,
        setHideValues,
        toggleHideValues,
        deviceMode,
        setDeviceMode,
        activeTab,
        setActiveTab,
        getAccountBalance,
        consolidatedBalance,
        monthlyStats,
        getCreditCardInvoice,
        getBudgetSpending,
        addTransaction,
        editTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        addAccount,
        editAccount,
        deleteAccount,
        addCreditCard,
        editCreditCard,
        deleteCreditCard,
        payCreditCardInvoice,
        addTransfer,
        addBudget,
        editBudget,
        deleteBudget,
        addGoal,
        editGoal,
        deleteGoal,
        contributeToGoal,
        restoreBackup,
        resetData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
