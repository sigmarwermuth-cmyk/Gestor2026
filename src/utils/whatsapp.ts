import { Transaction, CreditCard } from '../types/finance';
import { formatCurrency, formatDateBr } from './formatters';

export function getCleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Creates formatted WhatsApp message for a single transaction reminder
 */
export function createSingleTransactionReminderText(
  transaction: Transaction,
  accountName?: string
): string {
  const isExpense = transaction.type === 'EXPENSE';
  const icon = isExpense ? '🔴' : '🟢';
  const actionType = isExpense ? 'Conta a Pagar' : 'Conta a Receber';
  
  // Calculate days remaining
  const [y, m, d] = transaction.date.split('-').map(Number);
  const dueDate = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let urgency = '';
  if (diffDays < 0) {
    urgency = `⚠️ *ATENÇÃO: Vencida há ${Math.abs(diffDays)} dia(s)!*`;
  } else if (diffDays === 0) {
    urgency = '🚨 *VENCE HOJE!*';
  } else if (diffDays === 1) {
    urgency = '⏰ *Vence amanhã!*';
  } else {
    urgency = `🗓️ *Vence em ${diffDays} dias*`;
  }

  return `🔔 *Lembrete Gestor Financeiro: ${actionType}*

${urgency}
📌 *Descrição:* ${transaction.description}
💰 *Valor:* ${formatCurrency(transaction.amount)}
🏷️ *Categoria:* ${transaction.category}
📅 *Data de Vencimento:* ${formatDateBr(transaction.date)}${
    accountName ? `\n🏦 *Conta/Método:* ${accountName}` : ''
  }${transaction.notes ? `\n📝 *Observação:* ${transaction.notes}` : ''}

_Gerado automaticamente via Gestor Financeiro_`;
}

/**
 * Creates a complete digest of all pending bills to pay and receive
 */
export function createDigestReminderText(
  pendingExpenses: Transaction[],
  pendingIncomes: Transaction[],
  upcomingCards: { card: CreditCard; invoiceAmount: number }[] = []
): string {
  const now = new Date();
  const todayStr = formatDateBr(now.toISOString().slice(0, 10));

  const totalExpense = pendingExpenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = pendingIncomes.reduce((acc, t) => acc + t.amount, 0);

  let msg = `🔔 *Gestor Financeiro - Resumo de Contas & Lembretes*\n📅 *Data:* ${todayStr}\n\n`;

  // 1. Contas a Pagar
  if (pendingExpenses.length > 0) {
    msg += `🔴 *CONTAS A PAGAR (${pendingExpenses.length} pendência${pendingExpenses.length > 1 ? 's' : ''} - Total: ${formatCurrency(totalExpense)}):*\n`;
    pendingExpenses.forEach(t => {
      const [y, m, d] = t.date.split('-').map(Number);
      const dueDate = new Date(y, m - 1, d);
      const nowDate = new Date();
      nowDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let statusIcon = '▫️';
      if (diffDays < 0) statusIcon = '🚨 [VENCIDA]';
      else if (diffDays === 0) statusIcon = '⏰ [HOJE]';
      else if (diffDays <= 3) statusIcon = '⚠️ [EM BREVE]';

      msg += `${statusIcon} • *${t.description}* - ${formatCurrency(t.amount)} (Venc: ${formatDateBr(t.date)})\n`;
    });
    msg += `\n`;
  } else {
    msg += `✅ *Contas a Pagar:* Nenhuma conta pendente para este período.\n\n`;
  }

  // 2. Contas a Receber
  if (pendingIncomes.length > 0) {
    msg += `🟢 *CONTAS A RECEBER (${pendingIncomes.length} previsão${pendingIncomes.length > 1 ? 'ões' : ''} - Total: ${formatCurrency(totalIncome)}):*\n`;
    pendingIncomes.forEach(t => {
      msg += `▫️ • *${t.description}* - ${formatCurrency(t.amount)} (Previsão: ${formatDateBr(t.date)})\n`;
    });
    msg += `\n`;
  }

  // 3. Faturas de Cartão de Crédito
  if (upcomingCards.length > 0) {
    msg += `💳 *FATURAS DE CARTÃO A VENCER:*\n`;
    upcomingCards.forEach(({ card, invoiceAmount }) => {
      msg += `▫️ • *${card.name}* - Fatura: ${formatCurrency(invoiceAmount)} (Vence dia ${card.dueDay})\n`;
    });
    msg += `\n`;
  }

  // Resumo líquido
  const net = totalIncome - totalExpense;
  msg += `📊 *Balanço Previsto:* ${net >= 0 ? '+' : ''}${formatCurrency(net)}\n`;
  msg += `\n_Acompanhe seu fluxo de caixa no Gestor Financeiro._`;

  return msg;
}

/**
 * Dispatches WhatsApp Web / App intent with pre-filled message
 */
export function sendWhatsAppMessage(text: string, phone?: string) {
  const cleanPhone = getCleanPhoneNumber(phone);
  let url = '';
  if (cleanPhone) {
    url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  // Using a simulated click on an anchor element to avoid popup blockers in sandboxes
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
