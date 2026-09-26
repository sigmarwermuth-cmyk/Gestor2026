import { Account, CreditCard, Transaction, Budget, FinancialGoal } from '../types/finance';

export interface FinanFlowBackup {
  version: number;
  exportedAt: string;
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
}

export function exportBackupData(data: {
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
}) {
  const backup: FinanFlowBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    accounts: data.accounts,
    creditCards: data.creditCards,
    transactions: data.transactions,
    budgets: data.budgets,
    goals: data.goals,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `GestorFinanceiro_Backup_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function parseBackupFile(file: File): Promise<FinanFlowBackup> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!Array.isArray(data.accounts) || !Array.isArray(data.transactions)) {
    throw new Error('Formato de arquivo de backup inválido.');
  }

  return {
    version: data.version || 1,
    exportedAt: data.exportedAt || new Date().toISOString(),
    accounts: data.accounts || [],
    creditCards: data.creditCards || [],
    transactions: data.transactions || [],
    budgets: data.budgets || [],
    goals: data.goals || [],
  };
}
