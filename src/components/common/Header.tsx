import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useSecurity } from '../../context/SecurityContext';
import { Smartphone, Monitor, RefreshCw, Eye, EyeOff, Database, Bell, Lock, ShieldCheck, Fingerprint } from 'lucide-react';
import { BackupModal } from '../modals/BackupModal';
import { RemindersModal } from '../modals/RemindersModal';
import { SecuritySettingsModal } from '../security/SecuritySettingsModal';
import { PWAInstallButton } from './PWAInstallButton';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const {
    transactions,
    selectedMonth,
    activeTab,
    setActiveTab,
    deviceMode,
    setDeviceMode,
    hideValues,
    toggleHideValues,
    resetData,
  } = useFinance();

  const { lockApp, securityConfig } = useSecurity();

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Count pending items for badge
  const pendingCount = transactions.filter(
    t => t.date.startsWith(selectedMonth) && t.status === 'PENDING'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Início' },
    { id: 'transactions', label: 'Transações' },
    { id: 'accounts', label: 'Contas & Cartões' },
    { id: 'budgets', label: 'Orçamentos & Metas' },
    { id: 'reports', label: 'Relatórios' },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Zone 1: Logo & Brand */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center text-left transition-transform hover:opacity-95 active:scale-[0.98]"
            title="Gestor Financeiro - Início"
          >
            <Logo size="md" />
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold text-slate-600">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all relative whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary actions (Reminders, Privacy, Security Lock, Backup, Device, Reset) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reminders & WhatsApp Hub Trigger */}
            <button
              type="button"
              onClick={() => setIsRemindersModalOpen(true)}
              className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all shadow-2xs relative"
              title="Central de Lembretes e Contas (WhatsApp)"
              aria-label="Central de Lembretes"
            >
              <Bell size={16} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center font-mono-num shadow-xs animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Privacy Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleHideValues}
              className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                hideValues
                  ? 'bg-amber-500 border-amber-600 text-white shadow-xs ring-2 ring-amber-400/30 active:scale-95'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/40 active:scale-95'
              }`}
              title={
                hideValues
                  ? 'Modo de Privacidade ATIVADO: Valores monetários ocultados por asteriscos (clique para exibir)'
                  : 'Ativar Modo de Privacidade: Ocultar valores monetários em público'
              }
              aria-label="Alternar Modo de Privacidade"
            >
              {hideValues ? <EyeOff size={15} /> : <Eye size={15} />}
              <span className="hidden md:inline text-[11px] whitespace-nowrap">
                {hideValues ? 'Privacidade Ativa' : 'Privacidade'}
              </span>
            </button>

            {/* Security Settings & Lock Button */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(true)}
                className="h-8 px-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-white flex items-center gap-1 text-xs font-semibold transition-all"
                title="Configurações de Segurança e Biometria"
                aria-label="Configurações de Segurança"
              >
                <Fingerprint size={15} className={securityConfig.useBiometrics ? 'text-indigo-600' : 'text-slate-500'} />
              </button>

              {securityConfig.isEnabled && (
                <button
                  type="button"
                  onClick={lockApp}
                  className="h-8 px-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-white flex items-center gap-1 text-xs font-semibold transition-all"
                  title="Bloquear Aplicativo Agora"
                  aria-label="Bloquear Aplicativo"
                >
                  <Lock size={14} />
                </button>
              )}
            </div>

            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Backup & Restore Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs"
              title="Backup e Restauração de Dados"
              aria-label="Backup e Restauração de Dados"
            >
              <Database size={15} />
            </button>

            {/* Device Mockup Switcher */}
            <div className="hidden sm:flex items-center p-0.5 bg-slate-100 border border-slate-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Visualizar em moldura de Smartphone Android"
              >
                <Smartphone size={14} />
                Android
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Visualizar em modo tela cheia Desktop"
              >
                <Monitor size={14} />
                Desktop
              </button>
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados de exemplo do Gestor Financeiro?')) {
                  resetData();
                }
              }}
              className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs"
              title="Restaurar dados de exemplo"
              aria-label="Restaurar dados de exemplo"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </header>

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
      />

      <SecuritySettingsModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </>
  );
};



