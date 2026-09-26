import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Logo } from '../common/Logo';
import {
  Fingerprint,
  Lock,
  Unlock,
  Delete,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const LockScreen: React.FC = () => {
  const {
    isLocked,
    securityConfig,
    unlockWithPin,
    unlockWithBiometrics,
  } = useSecurity();

  const [pinInput, setPinInput] = useState<string>('');
  const [errorShake, setErrorShake] = useState(false);
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPinHint, setShowPinHint] = useState(false);

  // Auto-prompt biometrics once on screen load if enabled
  useEffect(() => {
    if (isLocked && securityConfig.useBiometrics) {
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  if (!isLocked) {
    return null;
  }

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      setErrorMessage(null);

      // If full 4-digit PIN is entered, attempt verification immediately
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const verifyPin = (pinToTest: string) => {
    const success = unlockWithPin(pinToTest);
    if (!success) {
      setErrorShake(true);
      setErrorMessage('PIN incorreto. Tente novamente.');
      setTimeout(() => {
        setPinInput('');
        setErrorShake(false);
      }, 600);
    } else {
      setPinInput('');
      setErrorMessage(null);
    }
  };

  const handleBiometricAuth = async () => {
    setIsScanningBiometric(true);
    setErrorMessage(null);
    const success = await unlockWithBiometrics();
    setIsScanningBiometric(false);

    if (!success) {
      setErrorMessage('Biometria não reconhecida. Use seu PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between p-6 select-none overflow-y-auto">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Section */}
      <div className="w-full max-w-sm flex items-center justify-between pt-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Acesso Seguro
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowPinHint(prev => !prev)}
          className="text-slate-400 hover:text-white text-xs flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="Ajuda com o PIN"
        >
          <HelpCircle size={15} />
          <span className="text-[11px]">Ajuda</span>
        </button>
      </div>

      {/* Center Branding & PIN Area */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center my-auto py-4 relative z-10">
        {/* Brand Logo */}
        <div className="mb-5 flex flex-col items-center text-center">
          <Logo size="lg" variant="light" />
        </div>

        {/* Lock status icon */}
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
          <Lock size={22} className="animate-pulse" />
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
          Gestor Financeiro Bloqueado
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6 text-center max-w-xs">
          Digite seu PIN de 4 dígitos ou use a biometria para acessar suas finanças.
        </p>

        {/* PIN Indicator Dots */}
        <div
          className={`flex items-center justify-center gap-4 mb-4 ${
            errorShake ? 'animate-bounce text-rose-500' : ''
          }`}
        >
          {[0, 1, 2, 3].map(idx => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 scale-110 shadow-sm ring-4 ring-indigo-500/30'
                    : 'bg-white/20 border border-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-2 animate-in fade-in">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PIN Hint Box */}
        {showPinHint && (
          <div className="mb-3 p-3 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 text-center animate-in fade-in zoom-in-95">
            <span className="font-bold block text-white mb-0.5">PIN Padrão Inicial</span>
            O PIN padrão do aplicativo é <strong className="text-amber-300 font-mono text-sm px-1.5 py-0.5 bg-white/10 rounded">1234</strong>. Você pode alterá-lo nas configurações de segurança a qualquer momento.
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-indigo-600/60 active:scale-95 text-white font-extrabold text-xl font-mono-num border border-white/10 transition-all flex items-center justify-center shadow-xs backdrop-blur-sm"
            >
              {digit}
            </button>
          ))}

          {/* Biometrics button */}
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={isScanningBiometric}
            className={`h-14 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 flex flex-col items-center justify-center transition-all ${
              isScanningBiometric ? 'animate-pulse ring-2 ring-emerald-400' : ''
            }`}
            title="Desbloquear com Biometria (Touch ID / Face ID)"
          >
            <Fingerprint size={24} className={isScanningBiometric ? 'text-emerald-300 animate-spin' : ''} />
            <span className="text-[9px] font-bold tracking-tight mt-0.5">Biometria</span>
          </button>

          {/* Zero key */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-indigo-600/60 active:scale-95 text-white font-extrabold text-xl font-mono-num border border-white/10 transition-all flex items-center justify-center shadow-xs backdrop-blur-sm"
          >
            0
          </button>

          {/* Delete key */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-rose-600/40 active:scale-95 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center justify-center shadow-xs backdrop-blur-sm"
            title="Apagar dígito"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-sm text-center pb-2 relative z-10">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Proteção por criptografia local e biometria</span>
        </div>
      </div>
    </div>
  );
};
