import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSecurity } from '../../context/SecurityContext';
import {
  Shield,
  Fingerprint,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Zap
} from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    securityConfig,
    updateSecurityConfig,
    changePin,
    lockApp,
    unlockWithBiometrics,
  } = useSecurity();

  // Change PIN states
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Biometrics test state
  const [bioTestSuccess, setBioTestSuccess] = useState(false);

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);

    if (newPin.length < 4) {
      setPinFeedback({ type: 'error', msg: 'O novo PIN deve conter no mínimo 4 dígitos.' });
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinFeedback({ type: 'error', msg: 'O novo PIN e a confirmação não coincidem.' });
      return;
    }

    const success = changePin(currentPin, newPin);
    if (success) {
      setPinFeedback({ type: 'success', msg: 'PIN alterado com sucesso!' });
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
      setTimeout(() => {
        setIsChangingPin(false);
        setPinFeedback(null);
      }, 1500);
    } else {
      setPinFeedback({ type: 'error', msg: 'PIN atual incorreto.' });
    }
  };

  const handleTestBiometrics = async () => {
    setBioTestSuccess(false);
    const success = await unlockWithBiometrics();
    if (success) {
      setBioTestSuccess(true);
      setTimeout(() => setBioTestSuccess(false), 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Segurança & Biometria"
      subtitle="Configure o bloqueio por senha e biometria para proteção dos seus dados"
    >
      <div className="space-y-4">
        {/* Main Enable/Disable Security Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              securityConfig.isEnabled ? 'bg-emerald-600 shadow-xs' : 'bg-slate-400'
            }`}>
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Bloqueio do Aplicativo
              </h4>
              <p className="text-xs text-slate-500">
                Exigir PIN ou Biometria ao abrir o Gestor Financeiro
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securityConfig.isEnabled}
              onChange={e => updateSecurityConfig({ isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {securityConfig.isEnabled && (
          <>
            {/* Biometrics Toggle & Test */}
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Fingerprint size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Desbloqueio por Biometria
                    </h4>
                    <span className="text-[11px] text-slate-500 block">
                      Touch ID, Face ID ou impressão digital
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityConfig.useBiometrics}
                    onChange={e => updateSecurityConfig({ useBiometrics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {securityConfig.useBiometrics && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Testar sensor de biometria agora:
                  </span>
                  <button
                    type="button"
                    onClick={handleTestBiometrics}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {bioTestSuccess ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span className="text-emerald-700">Reconhecido!</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint size={13} />
                        <span>Testar Biometria</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* PIN Settings Card */}
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      PIN de 4 Dígitos
                    </h4>
                    <span className="text-[11px] text-slate-500 block">
                      PIN atual configurado
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(prev => !prev);
                    setPinFeedback(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  {isChangingPin ? 'Cancelar' : 'Alterar PIN'}
                </button>
              </div>

              {/* Change PIN Form Drawer */}
              {isChangingPin && (
                <form onSubmit={handleSaveNewPin} className="pt-2 border-t border-slate-100 space-y-2.5 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      PIN Atual (Padrão: 1234)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="••••"
                      value={currentPin}
                      onChange={e => setCurrentPin(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Novo PIN (4 dígitos)
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="••••"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Confirmar Novo PIN
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="••••"
                        value={confirmNewPin}
                        onChange={e => setConfirmNewPin(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {pinFeedback && (
                    <div className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      pinFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {pinFeedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                      <span>{pinFeedback.msg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                  >
                    Salvar Novo PIN
                  </button>
                </form>
              )}
            </div>

            {/* Quick Lock Action Button */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  lockApp();
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <Lock size={15} />
                <span>Bloquear Aplicativo Agora</span>
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
