import { TransactionType } from '../types/finance';

export interface CategorySuggestionResult {
  category: string;
  reason?: string;
}

export async function suggestCategoryWithGemini(
  description: string,
  type: TransactionType = 'EXPENSE'
): Promise<CategorySuggestionResult | null> {
  const trimmed = description.trim();
  if (!trimmed || trimmed.length < 2) {
    return null;
  }

  try {
    const response = await fetch('/api/suggest-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: trimmed,
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('Gemini category suggestion request failed:', errData);
      return null;
    }

    const data = await response.json();
    if (data?.category) {
      return {
        category: data.category,
        reason: data.reason,
      };
    }
    return null;
  } catch (err) {
    console.warn('Network error calling /api/suggest-category:', err);
    return null;
  }
}

export interface FinancialInsightsResult {
  status: string;
  summary: string;
  tips: {
    title: string;
    tip: string;
    type: 'ECONOMIA' | 'INVESTIMENTO' | 'ALERTA' | string;
  }[];
  goalAdvice: string;
}

export async function fetchFinancialInsights(payload: {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  topCategories: { category: string; amount: number }[];
  goalsSummary: { title: string; current: number; target: number; deadline: string }[];
  month: string;
}): Promise<FinancialInsightsResult | null> {
  try {
    const response = await fetch('/api/financial-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn('Error fetching financial insights:', err);
    return null;
  }
}

