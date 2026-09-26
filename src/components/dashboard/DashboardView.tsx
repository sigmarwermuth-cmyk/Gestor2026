import React from 'react';
import { BalanceCard } from './BalanceCard';
import { QuickActions } from './QuickActions';
import { UpcomingBillsAlert } from './UpcomingBillsAlert';
import { MonthSummary } from './MonthSummary';
import { AiAdvisorCard } from './AiAdvisorCard';
import { CreditCardsCarousel } from './CreditCardsCarousel';
import { RecentTransactions } from './RecentTransactions';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Saldo Consolidado */}
      <BalanceCard />

      {/* 2. Lembretes e Contas a Vencer */}
      <UpcomingBillsAlert />

      {/* 3. Ações Rápidas */}
      <QuickActions />

      {/* 4. Resumo do Mês */}
      <MonthSummary />

      {/* 5. Diagnóstico Inteligente Gemini */}
      <AiAdvisorCard />

      {/* 6. Carrossel de Cartões de Crédito */}
      <CreditCardsCarousel />

      {/* 7. Últimas Transações */}
      <RecentTransactions />
    </div>
  );
};

