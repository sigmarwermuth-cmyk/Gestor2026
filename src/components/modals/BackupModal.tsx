import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { exportBackupData, parseBackupFile } from '../../utils/backup';
import { Download, Upload, ShieldCheck, CheckCircle2, AlertTriangle, FileJson } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { accounts, creditCards, transactions, budgets, goals, restoreBackup } = useFinance();

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportBackupData({
        accounts,
        creditCards,
        transactions,
        budgets,
        goals,
      });
      setMessage({
        text: 'Backup exportado com sucesso! Arquivo JSON salvo no seu dispositivo.',
        type: 'success',
      });
    } catch (e: any) {
      setMessage({
        text: `Erro ao exportar backup: ${e.message}`,
        type: 'error',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseBackupFile(file);
      if (
        window.confirm(
          `Confirma a restauração do backup com ${parsed.transactions.length} transações, ${parsed.accounts.length} contas e ${parsed.goals.length} metas? Seus dados atuais serão substituídos.`
        )
      ) {
        restoreBackup(parsed);
        setMessage({
          text: `Backup restaurado com sucesso! (${parsed.transactions.length} transações importadas)`,
          type: 'success',
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setMessage({
        text: `Falha ao importar backup: ${err.message || 'Arquivo inválido.'}`,
        type: 'error',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Backup e Segurança dos Dados"
      subtitle="Exporte ou importe todos os seus registros financeiros em formato JSON"
    >
      <div className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-2">
                <Download size={16} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Exportar Backup</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Baixe um arquivo JSON com todas as suas contas, transações, faturas e metas.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Download size={14} />
              Baixar Arquivo JSON
            </button>
          </div>

          {/* Import card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                <Upload size={16} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Restaurar Backup</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Carregue um arquivo JSON salvo anteriormente para restaurar seus dados.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-input"
              />
              <label
                htmlFor="backup-file-input"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Upload size={14} />
                Selecionar Arquivo
              </label>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <p>
            Seus dados ficam salvos localmente no seu navegador e podem ser exportados sempre que desejar mudar de computador ou celular.
          </p>
        </div>
      </div>
    </Modal>
  );
};
