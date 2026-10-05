import React, { useState } from 'react';
import {
  User,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { Member, MemberCardSettings, OrganizationSetting } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { updateMemberPhoto } from '../../services/dataService';
import { PhotoCropperModal } from '../../components/profile/PhotoCropperModal';

interface MyProfileProps {
  members: Member[];
  cardSettings: MemberCardSettings;
  orgSettings: OrganizationSetting;
  onNavigate: (view: string) => void;
  onRefresh: () => Promise<void>;
}

export const MyProfile: React.FC<MyProfileProps> = ({
  members,
  cardSettings,
  orgSettings,
  onNavigate,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Find the current logged-in member
  const currentMember =
    members.find((m) => m.id === user?.memberId || m.memberNumber === user?.memberId) ||
    members.find((m) => m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase()) ||
    members.find((m) => m.status === 'Aktif') ||
    members[0];

  const handleSavePhoto = async (photoDataUrl: string) => {
    if (!currentMember) return;
    setSaving(true);
    setErrorToast('');
    try {
      await updateMemberPhoto(currentMember.id || currentMember.memberNumber, photoDataUrl);
      await onRefresh();
      setSuccessToast('Foto profil berhasil diperbarui. Foto akan digunakan pada Kartu Anggota Anda.');
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (err) {
      console.error('Failed to update member photo:', err);
      setErrorToast('Gagal menyimpan foto profil ke database. Pastikan koneksi internet aktif.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentMember) return;
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil dan kembali menggunakan avatar default?')) {
      return;
    }

    setSaving(true);
    try {
      await updateMemberPhoto(currentMember.id || currentMember.memberNumber, '');
      await onRefresh();
      setSuccessToast('Foto profil telah dihapus. Kartu Anggota kini menggunakan avatar default.');
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (err) {
      console.error('Failed to remove photo:', err);
      setErrorToast('Gagal menghapus foto profil.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentMember) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Profil Tidak Ditemukan</h2>
        <p className="text-sm text-slate-600">
          Akun Anda belum terhubung dengan pangkalan data anggota MGMP PJOK SMP Kabupaten Purbalingga.
        </p>
      </div>
    );
  }

  const isMemberActive = currentMember.status === 'Aktif';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Profil Anggota Guru PJOK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sport">
              Profil Saya
            </h1>
            <p className="text-sm text-blue-200/90">
              Kelola foto profil mandiri untuk Kartu Tanda Anggota dan informasi keanggotaan Anda.
            </p>
          </div>

          <button
            onClick={() => onNavigate('my-card')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Lihat Kartu Anggota Saya</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3 text-emerald-950 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-sm font-bold flex-1">{successToast}</div>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorToast && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-center gap-3 text-rose-950 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-sm font-semibold">{errorToast}</div>
        </div>
      )}

      {/* SECTION: FOTO PROFIL MANDIRI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Foto Profil Mandiri</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Foto profil ini akan otomatis ditampilkan pada <strong>Kartu Anggota Saya</strong> saat dicetak atau diunduh.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            Standar CR80 Rasio 3:4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Photo Avatar Preview */}
          <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
            <div className="relative group">
              <div className="w-36 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-amber-400/80 bg-slate-950 flex items-center justify-center">
                {currentMember.photoUrl ? (
                  <img
                    src={currentMember.photoUrl}
                    alt={currentMember.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center p-3 text-center">
                    <User className="w-12 h-12 text-blue-300/80 mb-2" />
                    <span className="text-xs font-bold text-slate-300">Avatar Standar</span>
                    <span className="text-[10px] text-slate-400">MGMP PJOK</span>
                  </div>
                )}
              </div>

              {/* Status pill on photo */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-900 text-amber-300 border border-amber-400/40 shadow-xs">
                Pratinjau KTA
              </div>
            </div>

            <div className="text-xs text-slate-500 pt-1">
              {currentMember.photoUrl ? (
                <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Foto Pribadi Aktif
                </span>
              ) : (
                <span className="text-slate-400 italic">Belum ada foto pribadi</span>
              )}
            </div>
          </div>

          {/* Action Buttons and Guide */}
          <div className="md:col-span-8 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Kelola Foto Profil
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda dapat mengunggah foto resmi (format JPG, JPEG, PNG, WEBP, maks. 5 MB). Sistem menyediakan alat pembesaran (zoom) dan pergeseran posisi foto secara mandiri agar pas dengan bingkai kartu anggota.
              </p>

              {/* Buttons: Upload Foto, Ganti Foto, Hapus Foto */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCropperOpen(true)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>{currentMember.photoUrl ? 'Ganti Foto' : 'Upload Foto'}</span>
                </button>

                {currentMember.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={saving}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Hapus Foto</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('my-card')}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
                >
                  <span>Lihat di Kartu</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-900/90 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Setelah foto disimpan, buka menu <strong>Kartu Anggota Saya</strong> untuk melihat kartu dengan foto profil terbaru dan mencetak atau mengunduh PDF.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: DATA ANGGOTA (TERHUBUNG KE DATABASE) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Informasi Keanggotaan Terdaftar</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data resmi yang tersimpan di sistem MGMP PJOK SMP Kabupaten Purbalingga.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isMemberActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {currentMember.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-xs">Nama Lengkap & Gelar</span>
            <span className="font-bold text-slate-900 text-base">
              {currentMember.fullName}
              {currentMember.title ? `, ${currentMember.title}` : ''}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Nomor Anggota (NIA)</span>
            <span className="font-mono font-bold text-blue-600 text-base">
              {currentMember.memberNumber}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">NIP / NUPTK</span>
            <span className="font-medium text-slate-800">
              {currentMember.nip || currentMember.nuptk || '-'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Jenis Kelamin</span>
            <span className="font-medium text-slate-800">{currentMember.gender}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Asal Sekolah / Unit Kerja</span>
            <span className="font-semibold text-slate-900">{currentMember.schoolName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Wilayah Pembinaan</span>
            <span className="font-medium text-slate-800">
              Kecamatan {currentMember.subdistrict}, Purbalingga
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Email Belajar / Dinas</span>
            <span className="font-medium text-slate-800">{currentMember.email || '-'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-xs">Nomor Telepon / WhatsApp</span>
            <span className="font-medium text-slate-800">{currentMember.phone || '-'}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <div>
            Perubahan data administratif (nama, sekolah, NIP) dilakukan oleh Administrator atau Pengurus MGMP.
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            ID: {currentMember.id || currentMember.memberNumber}
          </span>
        </div>
      </div>

      {/* Photo Cropper / Adjuster Modal */}
      {isCropperOpen && (
        <PhotoCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onSave={handleSavePhoto}
          initialImage={currentMember.photoUrl}
          memberName={currentMember.fullName}
        />
      )}
    </div>
  );
};
