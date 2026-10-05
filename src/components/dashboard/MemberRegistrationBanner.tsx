import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  HelpCircle,
  Settings,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Save,
  Check,
  ClipboardList,
} from 'lucide-react';
import { MemberRegistrationConfig } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

interface MemberRegistrationBannerProps {
  regConfig: MemberRegistrationConfig;
  onSaveConfig: (updated: Partial<MemberRegistrationConfig>) => Promise<void>;
  onNavigateToSettings?: () => void;
}

export const MemberRegistrationBanner: React.FC<MemberRegistrationBannerProps> = ({
  regConfig,
  onSaveConfig,
  onNavigateToSettings,
}) => {
  const { canManageSettings, canManageMembers } = useAuth();
  const isAdminOrOfficer = canManageSettings || canManageMembers;

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [formUrlInput, setFormUrlInput] = useState(regConfig.googleFormUrl || '');
  const [spreadsheetUrlInput, setSpreadsheetUrlInput] = useState(regConfig.spreadsheetUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const hasFormUrl = Boolean(regConfig.googleFormUrl && regConfig.googleFormUrl.trim().length > 0);

  const handleOpenConfigModal = () => {
    setFormUrlInput(regConfig.googleFormUrl || '');
    setSpreadsheetUrlInput(regConfig.spreadsheetUrl || '');
    setSaveError('');
    setSaveSuccess(false);
    setIsConfigOpen(true);
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const cleanUrl = formUrlInput.trim();
      if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        setSaveError('URL harus diawali dengan https:// atau http://');
        setIsSaving(false);
        return;
      }

      await onSaveConfig({
        googleFormUrl: cleanUrl,
        spreadsheetUrl: spreadsheetUrlInput.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin / Pengurus MGMP',
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsConfigOpen(false);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save registration config:', err);
      setSaveError(err.message || 'Gagal menyimpan konfigurasi tautan formulir.');
    } finally {
      setIsSaving(false);
    }
  };

  // If there is NO form URL and user is a regular member, hide the card
  if (!hasFormUrl && !isAdminOrOfficer) {
    return null;
  }

  // STATE A: URL NOT CONFIGURED YET (ADMIN VIEW)
  if (!hasFormUrl) {
    return (
      <>
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-5 sm:p-6 text-amber-950 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/70 border border-amber-300 text-amber-900 text-[11px] font-bold tracking-wide uppercase">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Pendataan Anggota MGMP</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>⚠️ Tautan formulir belum dikonfigurasi.</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                Tautan Google Formulir Pendataan Anggota belum diatur oleh admin. Anggota belum dapat mengisi formulir mandiri sebelum tautan formulir resmi dikonfigurasi.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenConfigModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Settings className="w-4 h-4" />
                <span>Atur Tautan Formulir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Pengaturan Tautan Google Formulir */}
        {renderConfigModal()}
      </>
    );
  }

  // Helper renderer for Config Modal
  function renderConfigModal() {
    return (
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Pengaturan Tautan Google Formulir Pendataan"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveUrl} className="space-y-5">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-blue-950">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Integrasi Google Formulir & Dashboard</span>
            </p>
            <p>
              Tautan yang disimpan di sini akan otomatis digunakan pada tombol <strong>Isi Formulir Pendataan Anggota</strong> di Dashboard tanpa perlu mengubah kode program.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tautan Google Formulir Pendataan Anggota <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://forms.gle/... atau https://docs.google.com/forms/d/e/.../viewform"
                value={formUrlInput}
                onChange={(e) => setFormUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-500">
              Contoh: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">https://forms.gle/xyz123abc</code>
            </p>
          </div>

          {/* Preview Tautan Saat Ini */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Tautan Formulir Saat Ini:</span>
              {formUrlInput && (
                <a
                  href={formUrlInput}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>🔗 Buka Formulir</span>
                </a>
              )}
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-mono text-[11px] truncate">
              {formUrlInput || <span className="text-slate-400 italic">Belum ada tautan yang dimasukkan</span>}
            </div>
          </div>

          {/* Optional: Spreadsheet Result Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tautan Google Spreadsheet Tanggapan (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              value={spreadsheetUrlInput}
              onChange={(e) => setSpreadsheetUrlInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Digunakan saat admin mengimpor data respon formulir secara massal di menu <strong>Manajemen Anggota</strong>.
            </p>
          </div>

          {saveError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Tautan berhasil disimpan dan langsung aktif di Dashboard!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>💾 Simpan Tautan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  // STATE B: URL CONFIGURED & READY FOR ACTION
  return (
    <>
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-lg border border-blue-400/20 relative overflow-hidden">
        {/* Subtle decorative athletic background lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left Description Area */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-bold tracking-wide uppercase">
              <ClipboardList className="w-3.5 h-3.5 text-sky-400" />
              <span>📋 Pendataan Anggota MGMP</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Pendataan Anggota MGMP PJOK
              </h2>
              <p className="text-xs sm:text-sm font-medium text-blue-100/90 leading-relaxed">
                “Silakan isi formulir pendataan anggota untuk melengkapi atau memperbarui data keanggotaan MGMP.”
              </p>
            </div>

            {/* Small note & flow pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-blue-200/80">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Formulir aktif</span>
              </span>
              <span>•</span>
              <span className="text-slate-300 italic">Formulir akan terbuka di tab baru.</span>
              <span>•</span>
              <span className="hidden sm:inline text-sky-300">
                Alur: Form ➔ Verifikasi Admin ➔ Cetak Kartu Mandiri
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Primary Button */}
            <a
              href={regConfig.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-center group"
            >
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>📝 Isi Formulir Pendataan Anggota</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Secondary Button: Petunjuk Pengisian */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
            >
              <HelpCircle className="w-4 h-4 text-sky-300" />
              <span>ℹ️ Petunjuk Pengisian</span>
            </button>

            {/* Admin Quick Settings Button */}
            {isAdminOrOfficer && (
              <button
                type="button"
                onClick={handleOpenConfigModal}
                title="Ubah Tautan Google Formulir"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span className="sm:hidden text-xs font-semibold ml-2">Ubah Tautan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Petunjuk Pengisian */}
      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="Petunjuk Pengisian Formulir Pendataan Anggota"
        maxWidth="max-w-xl"
      >
        <div className="space-y-5 text-slate-700">
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs">
            <p className="font-bold">Panduan Resmi Pendataan Anggota MGMP PJOK SMP Kabupaten Purbalingga</p>
            <p className="mt-0.5 text-sky-800">
              Ikuti langkah-langkah di bawah ini untuk memastikan data keanggotaan Anda terdata dengan benar di sistem resmi:
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Klik tombol Isi Formulir</p>
                <p className="text-slate-600 text-xs">
                  Klik tombol <strong>"📝 Isi Formulir Pendataan Anggota"</strong>. Halaman Google Formulir akan terbuka secara otomatis pada tab browser baru.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Isi data dengan benar dan lengkap</p>
                <p className="text-slate-600 text-xs">
                  Isikan data diri guru PJOK sesuai dokumen resmi (Nama Lengkap beserta gelar, NIP jika ASN, NUPTK, NIK, asal SMP, dan kontak aktif).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Periksa kembali data sebelum mengirim</p>
                <p className="text-slate-600 text-xs">
                  Pastikan penulisan nama, gelar, dan nomor identitas tidak terdapat kesalahan ketik agar kartu anggota tercetak dengan akurat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Klik Kirim / Submit</p>
                <p className="text-slate-600 text-xs">
                  Kirimkan tanggapan formulir hingga muncul pesan konfirmasi bahwa jawaban Anda telah berhasil direkam oleh Google Formulir.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                5
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Pembaruan data jika diperlukan</p>
                <p className="text-slate-600 text-xs">
                  Jika sewaktu-waktu terdapat mutasi sekolah, kenaikan pangkat, atau perubahan nomor kontak, Anda dapat mengisi kembali formulir sesuai arahan pengurus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                6
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-emerald-900">Aktivasi Profil & Cetak Kartu Anggota Mandiri</p>
                <p className="text-emerald-800 text-xs">
                  Setelah data diverifikasi oleh pengurus MGMP, akun Anda otomatis aktif. Anda dapat membuka menu <strong>"Profil Saya"</strong> untuk mengunggah foto profil mandiri dan langsung mencetak <strong>"Kartu Anggota Saya"</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
            >
              Tutup
            </button>
            <a
              href={regConfig.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsGuideOpen(false)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Buka Formulir Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Pengaturan Tautan Google Formulir */}
      {renderConfigModal()}
    </>
  );
};
