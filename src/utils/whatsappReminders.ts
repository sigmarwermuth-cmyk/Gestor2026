import { Transaction } from '../types/finance';
import { formatCurrency, formatDateBr, getDeadlineRemainingText } from './formatters';

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  // If Brazilian number without country code (10 or 11 digits), prepend 55
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) {
    digits = `55${digits}`;
  }
  return digits;
}

export function formatWhatsAppBillReminder(
  t: Transaction,
  accountName = 'FinanFlow'
): string {
  const isIncome = t.type === 'INCOME';
  const typeLabel = isIncome ? '🟢 CONTA A RECEBER' : '🔴 CONTA A PAGAR';
  const deadlineStatus = getDeadlineRemainingText(t.date);

  return [
    `🔔 *LEMBRETE FINANCEIRO - FINANFLOW* 🔔`,
    ``,
    `📌 *Tipo:* ${typeLabel}`,
    `📝 *Descrição:* ${t.description}`,
    `💰 *Valor:* ${formatCurrency(t.amount)}`,
    `📅 *Vencimento:* ${formatDateBr(t.date)} (${deadlineStatus || 'Pendente'})`,
    `🏷️ *Categoria:* ${t.category}`,
    `🏦 *Conta:* ${accountName}`,
    t.notes ? `💬 *Obs:* ${t.notes}` : '',
    ``,
    `_Lembrete gerado pelo aplicativo FinanFlow._`
  ].filter(Boolean).join('\n');
}

export function formatWhatsAppDigest(
  billsToPay: Transaction[],
  billsToReceive: Transaction[]
): string {
  const totalPay = billsToPay.reduce((acc, t) => acc + t.amount, 0);
  const totalReceive = billsToReceive.reduce((acc, t) => acc + t.amount, 0);
  const projectedBalance = totalReceive - totalPay;

  const lines = [
    `📋 *RESUMO DE CONTAS PENDENTES - FINANFLOW* 📋`,
    `Data do envio: ${new Date().toLocaleDateString('pt-BR')}`,
    ``,
  ];

  if (billsToPay.length > 0) {
    lines.push(`🔴 *CONTAS A PAGAR (${billsToPay.length}):*`);
    billsToPay.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.description} - ${formatCurrency(t.amount)} (Vence: ${formatDateBr(t.date)})`);
    });
    lines.push(`*Total a Pagar:* ${formatCurrency(totalPay)}`);
    lines.push(``);
  }

  if (billsToReceive.length > 0) {
    lines.push(`🟢 *CONTAS A RECEBER (${billsToReceive.length}):*`);
    billsToReceive.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.description} - ${formatCurrency(t.amount)} (Previsão: ${formatDateBr(t.date)})`);
    });
    lines.push(`*Total a Receber:* ${formatCurrency(totalReceive)}`);
    lines.push(``);
  }

  lines.push(`⚖️ *Balanço Previsto:* ${projectedBalance >= 0 ? '+' : ''}${formatCurrency(projectedBalance)}`);
  lines.push(``);
  lines.push(`_Acesse o FinanFlow para liquidar os lançamentos._`);

  return lines.join('\n');
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const clean = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (clean) {
    return `https://api.whatsapp.com/send?phone=${clean}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
