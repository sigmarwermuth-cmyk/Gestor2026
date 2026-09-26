import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, CheckCircle2, X } from 'lucide-react';
import { Logo } from './Logo';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGenericGuide, setShowGenericGuide] = useState(false);

  // If already running as installed standalone PWA, suppress
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowGenericGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleAction}
          className={`h-9 px-2.5 sm:px-3 rounded-xl border border-indigo-200/90 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 hover:text-indigo-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${className}`}
          title="Instalar Gestor Financeiro no seu dispositivo (PWA)"
          aria-label="Instalar Aplicativo PWA"
        >
          <Download size={14} className="text-indigo-600 animate-bounce" />
          <span className="hidden sm:inline text-[11px] whitespace-nowrap font-extrabold">
            Instalar App
          </span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300 shadow-inner">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Instale o Gestor Financeiro
              </h4>
              <p className="text-xs text-indigo-200/80">
                Acesse direto da sua tela de início, rápido e offline.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAction}
            className="py-2 px-4 bg-white hover:bg-indigo-50 text-indigo-950 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95 relative z-10"
          >
            <Download size={15} />
            <span>Instalar Agora</span>
          </button>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Instalar no iPhone / iPad
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Siga estes 2 passos simples no Safari para adicionar à tela de início:
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <span className="font-bold text-slate-800">Toque no botão Compartilhar</span>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    Toque no ícone <Share size={12} className="text-indigo-600" /> na barra inferior do Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <span className="font-bold text-slate-800">Adicionar à Tela de Início</span>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    Role a lista para baixo e selecione <PlusSquare size={12} className="text-indigo-600" /> <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Generic Browser Installation Guide Modal */}
      {showGenericGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setShowGenericGuide(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Instalação do Aplicativo (PWA)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                O Gestor Financeiro pode ser instalado no seu computador, Android ou iPhone:
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>No Google Chrome/Edge: Clique no ícone de instalar na barra de endereço.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>No Android: Abra o menu (⋮) e toque em "Instalar aplicativo".</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGenericGuide(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
