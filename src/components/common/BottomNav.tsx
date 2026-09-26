import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Home, ReceiptText, Wallet, Target, BarChart3 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'transactions', label: 'Transações', icon: ReceiptText },
    { id: 'accounts', label: 'Contas', icon: Wallet },
    { id: 'budgets', label: 'Metas', icon: Target },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ] as const;

  return (
    <nav className="h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 grid grid-cols-5 items-center px-1 z-30 select-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all ${
              isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 scale-110 shadow-2xs' : ''}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
