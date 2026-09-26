import { CategoryInfo, Transaction, Account, CreditCard } from '../types/finance';

export const CATEGORIES: CategoryInfo[] = [
  // Expenses
  { id: 'cat-alimentacao', name: 'Alimentação', iconName: 'Utensils', color: '#F97316', type: 'EXPENSE' },
  { id: 'cat-transporte', name: 'Transporte', iconName: 'Car', color: '#0EA5E9', type: 'EXPENSE' },
  { id: 'cat-moradia', name: 'Moradia', iconName: 'Home', color: '#8B5CF6', type: 'EXPENSE' },
  { id: 'cat-saude', name: 'Saúde', iconName: 'Activity', color: '#EF4444', type: 'EXPENSE' },
  { id: 'cat-lazer', name: 'Lazer & Viagem', iconName: 'Sparkles', color: '#EC4899', type: 'EXPENSE' },
  { id: 'cat-educacao', name: 'Educação', iconName: 'GraduationCap', color: '#3B82F6', type: 'EXPENSE' },
  { id: 'cat-compras', name: 'Compras & Shopping', iconName: 'ShoppingBag', color: '#F59E0B', type: 'EXPENSE' },
  { id: 'cat-assinaturas', name: 'Assinaturas & Serviços', iconName: 'Tv', color: '#6366F1', type: 'EXPENSE' },
  { id: 'cat-contas', name: 'Contas & Boletos', iconName: 'FileText', color: '#64748B', type: 'EXPENSE' },
  { id: 'cat-outros-despesa', name: 'Outras Despesas', iconName: 'MoreHorizontal', color: '#94A3B8', type: 'EXPENSE' },

  // Incomes
  { id: 'cat-salario', name: 'Salário & Remuneração', iconName: 'Briefcase', color: '#10B981', type: 'INCOME' },
  { id: 'cat-freelance', name: 'Freelance & Bicos', iconName: 'Laptop', color: '#059669', type: 'INCOME' },
  { id: 'cat-investimentos', name: 'Rendimentos & Dividendos', iconName: 'TrendingUp', color: '#14B8A6', type: 'INCOME' },
  { id: 'cat-reembolso', name: 'Reembolso / Outros', iconName: 'RotateCcw', color: '#065F46', type: 'INCOME' },
];

export function getCategoryInfo(name: string): CategoryInfo {
  const found = CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  return {
    id: 'cat-default',
    name,
    iconName: 'DollarSign',
    color: '#64748B',
    type: 'EXPENSE'
  };
}

export function formatCurrency(value: number, hideValues = false): string {
  if (hideValues) {
    return 'R$ ****';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateBr(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] || month} ${year}`;
}

export function getMonthShortName(yearMonth: string): string {
  const [, month] = yearMonth.split('-');
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const idx = parseInt(month, 10) - 1;
  return monthNames[idx] || month;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getDeadlineRemainingText(deadlineStr: string): string {
  if (!deadlineStr) return '';
  const [y, m, d] = deadlineStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Prazo encerrado';
  if (diffDays === 0) return 'Vence hoje';
  if (diffDays === 1) return 'Vence amanhã';
  if (diffDays < 30) return `${diffDays} dias restantes`;
  
  const months = Math.round(diffDays / 30.4);
  if (months === 1) return '1 mês restante';
  if (months < 12) return `${months} meses restantes`;
  
  const years = (diffDays / 365.25).toFixed(1);
  return `${years.replace('.', ',')} anos restantes`;
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  accounts: Account[],
  cards: CreditCard[]
) {
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));
  const cardMap = new Map(cards.map(c => [c.id, c.name]));

  const headers = [
    'ID',
    'Data',
    'Descrição',
    'Tipo',
    'Categoria',
    'Valor (R$)',
    'Status',
    'Conta de Origem',
    'Conta / Cartão',
    'Parcela',
    'Observações'
  ];

  const rows = transactions.map(t => {
    let accountName = accountMap.get(t.accountId) || 'N/A';
    let target = t.creditCardId ? cardMap.get(t.creditCardId) || 'Cartão' : (t.destinationAccountId ? accountMap.get(t.destinationAccountId) || 'Destino' : '-');
    let parcelInfo = t.installments ? `${t.installments.current}/${t.installments.total}` : '1x (À vista)';
    let typeName = t.type === 'INCOME' ? 'Receita' : t.type === 'EXPENSE' ? 'Despesa' : 'Transferência';
    let statusName = t.status === 'PAID' ? 'Pago/Efetuado' : 'Pendente';

    return [
      t.id,
      formatDateBr(t.date),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      typeName,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2).replace('.', ','),
      statusName,
      `"${accountName}"`,
      `"${target}"`,
      parcelInfo,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ];
  });

  // UTF-8 BOM to ensure proper accent rendering in Excel
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinanFlow_Extrato_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
