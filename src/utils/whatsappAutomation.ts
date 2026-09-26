import { Transaction, CreditCard, Account } from '../types/finance';
import { formatCurrency, formatDateBr } from './formatters';
import {
  createSingleTransactionReminderText,
  createDigestReminderText,
  sendWhatsAppMessage,
  getCleanPhoneNumber,
} from './whatsapp';

export interface WhatsAppAutomationConfig {
  enabled: boolean;
  phone: string;
  daysBefore: number; // 1 (1 dia antes)
  notifyHour: string; // "09:00"
  autoNotifyBrowser: boolean;
  gatewayWebhookUrl?: string; // Optional custom endpoint
  lastCheckDate?: string; // YYYY-MM-DD
}

export interface WhatsAppDispatchLog {
  id: string;
  transactionId?: string;
  description: string;
  amount: number;
  dueDate: string;
  type: 'EXPENSE' | 'INCOME' | 'CARD_INVOICE' | 'DIGEST';
  dispatchedAt: string; // ISO string
  status: 'SENT' | 'TRIGGERED' | 'DISPATCHED';
  targetPhone?: string;
}

const STORAGE_KEYS = {
  CONFIG: 'finanflow_whatsapp_auto_config_v1',
  LOGS: 'finanflow_whatsapp_auto_logs_v1',
  NOTIFIED_TODAY: 'finanflow_whatsapp_notified_today_v1',
};

export const DEFAULT_AUTOMATION_CONFIG: WhatsAppAutomationConfig = {
  enabled: true,
  phone: '',
  daysBefore: 1, // 1 dia antes
  notifyHour: '08:30',
  autoNotifyBrowser: true,
};

export function getAutomationConfig(): WhatsAppAutomationConfig {
  const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (saved) {
    try {
      return { ...DEFAULT_AUTOMATION_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_AUTOMATION_CONFIG;
}

export function saveAutomationConfig(config: WhatsAppAutomationConfig) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function getDispatchLogs(): WhatsAppDispatchLog[] {
  const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function addDispatchLog(log: Omit<WhatsAppDispatchLog, 'id' | 'dispatchedAt'>) {
  const newLog: WhatsAppDispatchLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    dispatchedAt: new Date().toISOString(),
  };
  const logs = [newLog, ...getDispatchLogs()].slice(0, 50); // Keep last 50
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  return newLog;
}

/**
 * Checks which pending transactions are due in exactly `daysBefore` (default: 1 day before)
 */
export function getUpcomingDueItems(
  transactions: Transaction[],
  creditCards: CreditCard[],
  accounts: Account[],
  daysBefore = 1
) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const dueTomorrowTransactions = transactions.filter(t => {
    if (t.status !== 'PENDING') return false;
    const [y, m, d] = t.date.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays === daysBefore;
  });

  // Check credit cards due tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + daysBefore);
  const tomorrowDay = tomorrow.getDate();

  const dueTomorrowCards = creditCards.filter(card => card.dueDay === tomorrowDay);

  return {
    transactions: dueTomorrowTransactions,
    cards: dueTomorrowCards,
    totalCount: dueTomorrowTransactions.length + dueTomorrowCards.length,
  };
}

/**
 * Sends automated WhatsApp notification for an item due tomorrow
 */
export async function dispatchAutomatedWhatsAppReminder(
  item: Transaction,
  accountName?: string,
  targetPhone?: string
): Promise<boolean> {
  const text = createSingleTransactionReminderText(item, accountName);

  // Send via WhatsApp
  sendWhatsAppMessage(text, targetPhone);

  // Register in local audit logs
  addDispatchLog({
    transactionId: item.id,
    description: item.description,
    amount: item.amount,
    dueDate: item.date,
    type: item.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    status: 'SENT',
    targetPhone,
  });

  return true;
}

/**
 * Request Browser Notification permission if enabled
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  }
  return false;
}

/**
 * Triggers native browser push/desktop notification with WhatsApp click action
 */
export function triggerDesktopReminderNotification(
  title: string,
  body: string,
  onClickAction?: () => void
) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'gestor-financeiro-reminder',
      });
      if (onClickAction) {
        notif.onclick = () => {
          window.focus();
          onClickAction();
        };
      }
    } catch (e) {
      console.warn('Could not trigger Notification:', e);
    }
  }
}
