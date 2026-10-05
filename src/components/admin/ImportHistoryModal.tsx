import React, { useState, useEffect } from 'react';
import {
  History,
  FileSpreadsheet,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { ImportLog } from '../../types';
import { getImportLogs } from '../../services/dataService';
import { Modal } from '../common/Modal';

interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getImportLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load import logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📋 Riwayat Import Data Anggota"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Catatan log audit aktivitas import data anggota massal dari file Excel maupun Google Spreadsheet.
          </p>
          <button
            type="button"
            onClick={loadLogs}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Memuat riwayat log import...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Riwayat Import</p>
            <p className="text-xs text-slate-500">
              Riwayat akan otomatis tercatat setiap kali pengurus melakukan import data Excel atau Google Spreadsheet.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Petugas</th>
                  <th className="py-2.5 px-3">Sumber Data</th>
                  <th className="py-2.5 px-3 text-center">Dibaca</th>
                  <th className="py-2.5 px-3 text-center">Berhasil</th>
                  <th className="py-2.5 px-3 text-center">Diperbarui</th>
                  <th className="py-2.5 px-3 text-center">Dilewati</th>
                  <th className="py-2.5 px-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{log.adminName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          {log.sourceType === 'Upload Excel' ? (
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <LinkIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <span className="truncate max-w-[160px]">{log.sourceName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{log.sourceType}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        {log.totalRead}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                        +{log.successCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                        {log.updatedCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-600">
                        {log.rejectedCount}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[200px]" title={log.details}>
                        {log.details || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
