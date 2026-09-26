/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { SecurityProvider } from './context/SecurityContext';
import { LockScreen } from './components/security/LockScreen';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { Header } from './components/common/Header';
import { AndroidFrame } from './components/common/AndroidFrame';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AccountsView } from './components/accounts/AccountsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { ReportsView } from './components/reports/ReportsView';

function MainContent() {
  const { activeTab } = useFinance();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />
      <main className="flex-1">
        <AndroidFrame>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'accounts' && <AccountsView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'reports' && <ReportsView />}
        </AndroidFrame>
      </main>
      <LockScreen />
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <FinanceProvider>
        <MainContent />
      </FinanceProvider>
    </SecurityProvider>
  );
}
