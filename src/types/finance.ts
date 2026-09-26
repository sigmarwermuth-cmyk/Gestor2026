export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export type TransactionStatus = 'PAID' | 'PENDING';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH' | 'OTHER';

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: 'EXPENSE' | 'INCOME';
}

export interface InstallmentInfo {
  current: number;
  total: number;
  parentId: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  destinationAccountId?: string; // For transfers
  creditCardId?: string; // If paid with credit card
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  installments?: InstallmentInfo;
  notes?: string;
  createdAt: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color: string;
  institution: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  accountId: string; // Linked account to pay the invoice
  color: string;
  lastDigits: string;
  brand: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  color: string;
  iconName: string;
  notes?: string;
  createdAt: number;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // percentage
}
