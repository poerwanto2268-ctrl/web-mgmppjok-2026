import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  RefreshCw,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminActivityLog } from '../../types';
import { getAdminLogs } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

export const AdminActivityLogs: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('Semua');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAdminLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const modules = Array.from(new Set(logs.map((l) => l.module).filter(Boolean)));

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.adminEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = moduleFilter === 'Semua' || log.module === moduleFilter;
    return matchSearch && matchModule;
  });

  const exportLogsToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Waktu', 'Administrator', 'Email', 'Role', 'Modul', 'Tindakan', 'Keterangan Rinci'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString('id-ID')}"`,
      `"${l.adminName.replace(/"/g, '""')}"`,
      `"${(l.adminEmail || '').replace(/"/g, '""')}"`,
      `"${l.adminRole}"`,
      `"${l.module.replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Log_Aktivitas_Admin_MGMP_PJOK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Log Aktivitas Administrator</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit jejak riwayat pengelolaan, perubahan wewenang, verifikasi, dan konfigurasi sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Muat Ulang Log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportLogsToCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari admin, tindakan, modul, atau keterangan aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="Semua">Semua Modul Aplikasi</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Tindakan</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Memuat log aktivitas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ditemukan log aktivitas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(log.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="font-bold text-slate-800">{log.adminName}</div>
                        <div className="text-[10px] text-purple-700 font-semibold">{log.adminRole}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
