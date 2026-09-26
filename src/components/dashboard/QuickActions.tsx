import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';
import { TransactionModal } from '../modals/TransactionModal';
import { TransferModal } from '../modals/TransferModal';
import { TransactionType } from '../../types/finance';

export const QuickActions: React.FC = () => {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('EXPENSE');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleOpenTransaction = (type: TransactionType) => {
    setModalType(type);
    setIsTxModalOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Nova Despesa */}
        <button
          type="button"
          onClick={() => handleOpenTransaction('EXPENSE')}
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-xs hover:bg-rose-50/20 active:scale-[0.98] transition-all group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/80 text-rose-600 group-hover:from-rose-500 group-hover:to-rose-600 group-hover:text-white flex items-center justify-center mb-1.5 transition-all shadow-2xs">
            <ArrowDownCircle size={22} />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">Nova Despesa</span>
          <span className="text-[10px] text-slate-400">Registrar saída</span>
        </button>

        {/* Nova Receita */}
        <button
          type="button"
          onClick={() => handleOpenTransaction('INCOME')}
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs hover:bg-emerald-50/20 active:scale-[0.98] transition-all group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 text-emerald-600 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white flex items-center justify-center mb-1.5 transition-all shadow-2xs">
            <ArrowUpCircle size={22} />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">Nova Receita</span>
          <span className="text-[10px] text-slate-400">Registrar entrada</span>
        </button>

        {/* Transferência */}
        <button
          type="button"
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs hover:bg-indigo-50/20 active:scale-[0.98] transition-all group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 text-indigo-600 group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white flex items-center justify-center mb-1.5 transition-all shadow-2xs">
            <ArrowRightLeft size={20} />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">Transferência</span>
          <span className="text-[10px] text-slate-400">Entre contas</span>
        </button>
      </div>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={modalType}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};
