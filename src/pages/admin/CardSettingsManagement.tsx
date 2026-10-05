import React, { useState, useRef } from 'react';
import {
  Settings,
  Save,
  Upload,
  Trash2,
  RefreshCw,
  Image,
  CheckCircle2,
  AlertCircle,
  FileSignature,
  CreditCard,
  Eye,
  Info,
} from 'lucide-react';
import { Member, MemberCardSettings, OrganizationSetting } from '../../types';
import { updateMemberCardSettings, DEFAULT_KETUA_SIGNATURE_SVG } from '../../services/dataService';
import { MemberCardPreview } from '../../components/card/MemberCardPreview';

interface CardSettingsManagementProps {
  cardSettings: MemberCardSettings;
  orgSettings: OrganizationSetting;
  sampleMember?: Member;
  onRefresh: () => Promise<void>;
}

export const CardSettingsManagement: React.FC<CardSettingsManagementProps> = ({
  cardSettings,
  orgSettings,
  sampleMember,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<MemberCardSettings>({
    leaderName: cardSettings.leaderName || 'Sutarman',
    leaderTitle: cardSettings.leaderTitle || 'S.Pd., M.Pd.',
    leaderPosition: cardSettings.leaderPosition || 'Ketua MGMP PJOK SMP Kabupaten Purbalingga',
    signatureUrl: cardSettings.signatureUrl || DEFAULT_KETUA_SIGNATURE_SVG,
    logoUrl: cardSettings.logoUrl || '',
    secondaryLogoUrl: cardSettings.secondaryLogoUrl || '',
    period: cardSettings.period || orgSettings.period || '2024 - 2027',
    validUntil: cardSettings.validUntil || 'Selama Menjadi Anggota Aktif',
    cardNote: cardSettings.cardNote || 
      '1. Kartu ini merupakan tanda pengenal resmi anggota MGMP PJOK SMP Kabupaten Purbalingga.\n2. Berlaku selama pemegang kartu berstatus anggota aktif.\n3. Pindai QR Code untuk memverifikasi keabsahan kartu secara digital.\n4. Apabila kartu ini ditemukan, harap dikembalikan ke Sekretariat MGMP PJOK SMP Kab. Purbalingga.',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewSide, setPreviewSide] = useState<'both' | 'front' | 'back'>('both');

  const signatureInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Mock sample member for live preview
  const previewMemberData: Member = sampleMember || {
    id: 'MGMP-PBG-001',
    memberNumber: 'MGMP-PBG-001',
    fullName: 'Sutarman',
    title: 'S.Pd., M.Pd.',
    nip: '19740512 200212 1 004',
    nuptk: '3445752654200033',
    gender: 'Laki-laki',
    schoolName: 'SMP Negeri 1 Purbalingga',
    subdistrict: 'Purbalingga',
    phone: '0813-2744-8901',
    email: 'sutarman811@guru.smp.belajar.id',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif',
    joinedDate: '2015-01-10',
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/png') && !file.type.includes('image/jpeg')) {
      alert('Mohon unggah file format PNG atau JPG. Disarankan PNG transparan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          signatureUrl: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          logoUrl: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setFormData((prev) => ({ ...prev, signatureUrl: '' }));
  };

  const handleResetDefaultSignature = () => {
    setFormData((prev) => ({ ...prev, signatureUrl: DEFAULT_KETUA_SIGNATURE_SVG }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateMemberCardSettings(formData);
      await onRefresh();
      setSuccessMsg('Pengaturan Kartu Anggota & Tanda Tangan Ketua berhasil disimpan ke database!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error('Failed to save card settings:', error);
      alert('Gagal menyimpan pengaturan kartu. Pastikan koneksi Firestore aktif.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Settings className="w-3.5 h-3.5" />
              <span>Konfigurasi Kartu & Pengesahan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sport">
              Pengaturan Kartu Anggota
            </h1>
            <p className="text-sm text-blue-200/90 max-w-xl">
              Atur identitas Ketua MGMP, tanda tangan digital resmi, masa berlaku, dan catatan ketentuan pada Kartu Tanda Anggota (KTA). Perubahan data akan langsung tersinkronisasi ke seluruh kartu anggota.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Card Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Settings */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-blue-600" />
                <span>Identitas Ketua MGMP & Pejabat Pengesah</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data pejabat yang tercetak pada sisi belakang kartu anggota sebagai penanggung jawab resmi organisasi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Ketua MGMP *</label>
                <input
                  type="text"
                  required
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  placeholder="Mis. Sutarman"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Gelar Ketua *</label>
                <input
                  type="text"
                  required
                  value={formData.leaderTitle}
                  onChange={(e) => setFormData({ ...formData, leaderTitle: e.target.value })}
                  placeholder="Mis. S.Pd., M.Pd."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jabatan Pengesah *</label>
                <input
                  type="text"
                  required
                  value={formData.leaderPosition}
                  onChange={(e) => setFormData({ ...formData, leaderPosition: e.target.value })}
                  placeholder="Ketua MGMP PJOK SMP Kabupaten Purbalingga"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Signature Upload & Management */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileSignature className="w-4 h-4 text-blue-600" />
                  <span>Gambar Tanda Tangan Ketua MGMP</span>
                </label>
                <span className="text-[11px] text-slate-400">Format PNG Transparan / JPG</span>
              </div>

              {/* Signature Preview Box */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-44 h-16 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center overflow-hidden shadow-2xs">
                  {formData.signatureUrl ? (
                    <img
                      src={formData.signatureUrl}
                      alt="Tanda Tangan"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">Belum ada tanda tangan</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={signatureInputRef}
                    onChange={handleSignatureUpload}
                    accept="image/png,image/jpeg"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Gambar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaultSignature}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    title="Gunakan Contoh Tanda Tangan Default"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Default</span>
                  </button>

                  {formData.signatureUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Period and Validity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Periode Kepengurusan *</label>
                <input
                  type="text"
                  required
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="2024 - 2027"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Masa Berlaku Kartu *</label>
                <input
                  type="text"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  placeholder="Selama Menjadi Anggota Aktif"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Card Note / Ketentuan Kartu */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Teks Ketentuan / Keterangan Kartu (Sisi Belakang)
              </label>
              <textarea
                rows={4}
                value={formData.cardNote}
                onChange={(e) => setFormData({ ...formData, cardNote: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                placeholder="Tuliskan ketentuan resmi keanggotaan..."
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Kartu'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview on Right */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Live Preview Kartu</span>
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewSide('both')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    previewSide === 'both' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Dua Sisi
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide('front')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    previewSide === 'front' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Depan
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide('back')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    previewSide === 'back' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Belakang
                </button>
              </div>
            </div>

            <div className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200">
              <MemberCardPreview
                member={previewMemberData}
                cardSettings={formData}
                orgSettings={orgSettings}
                side={previewSide}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Pratinjau langsung diperbarui saat Anda mengubah data formulir di samping. Pastikan menekan tombol <strong>Simpan Pengaturan Kartu</strong> agar data tersimpan di Cloud Firestore.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
