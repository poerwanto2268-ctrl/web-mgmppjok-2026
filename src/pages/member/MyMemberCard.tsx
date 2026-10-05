import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  CreditCard,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCw,
  Sparkles,
  Info,
  ExternalLink,
  Check,
  UserCheck,
  Camera,
  Loader2,
} from 'lucide-react';
import { Member, MemberCardSettings, OrganizationSetting } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MemberCardPreview } from '../../components/card/MemberCardPreview';
import { PrintCardContainer } from '../../components/card/PrintCardContainer';
import { Modal } from '../../components/common/Modal';
import { PhotoCropperModal } from '../../components/profile/PhotoCropperModal';
import { updateMemberPhoto } from '../../services/dataService';

interface MyMemberCardProps {
  members: Member[];
  cardSettings: MemberCardSettings;
  orgSettings: OrganizationSetting;
  onRefresh?: () => Promise<void>;
}

export const MyMemberCard: React.FC<MyMemberCardProps> = ({
  members,
  cardSettings,
  orgSettings,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back' | 'flip'>('both');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printOption, setPrintOption] = useState<'front' | 'back' | 'both'>('both');
  const [printTheme, setPrintTheme] = useState<'dark' | 'light'>('dark');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Find the current logged-in member from the members list
  const currentMember =
    members.find((m) => m.id === user?.memberId || m.memberNumber === user?.memberId) ||
    members.find((m) => m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase()) ||
    members.find((m) => m.status === 'Aktif') ||
    members[0];

  const isMemberActive = currentMember?.status === 'Aktif';

  const verificationUrl = currentMember
    ? `${window.location.origin}/?verify=member&id=${encodeURIComponent(currentMember.id || currentMember.memberNumber)}`
    : '';

  const handleCopyLink = () => {
    if (!verificationUrl) return;
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = (option: 'front' | 'back' | 'both') => {
    setPrintOption(option);
    setIsPrintModalOpen(true);
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  // Generate and download exact CR80 landscape PDF (85.60 mm x 53.98 mm)
  const handleDownloadPdf = async () => {
    if (!currentMember || !isMemberActive) return;
    setIsGeneratingPdf(true);
    try {
      const frontEl = document.getElementById('pdf-render-front');
      const backEl = document.getElementById('pdf-render-back');

      if (!frontEl || !backEl) {
        alert('Komponen kartu belum siap. Silakan coba sesaat lagi.');
        return;
      }

      // Render at 3x scale for crisp 300 DPI print quality
      const frontCanvas = await html2canvas(frontEl, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });

      const backCanvas = await html2canvas(backEl, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });

      // Create landscape CR80 PDF: 85.6 mm width x 53.98 mm height
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98],
      });

      // Page 1: Sisi Depan
      const frontImg = frontCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(frontImg, 'JPEG', 0, 0, 85.6, 53.98);

      // Page 2: Sisi Belakang
      pdf.addPage([85.6, 53.98], 'landscape');
      const backImg = backCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(backImg, 'JPEG', 0, 0, 85.6, 53.98);

      // Sanitized Filename: Kartu_Anggota_[NamaAnggota]_[NomorAnggota].pdf
      const safeName = currentMember.fullName.trim().replace(/[^a-zA-Z0-9]/g, '_');
      const safeNum = currentMember.memberNumber.trim().replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `Kartu_Anggota_${safeName}_${safeNum}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Gagal mengunduh file PDF secara langsung. Anda dapat menggunakan tombol Cetak Kartu lalu pilih "Simpan sebagai PDF".');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSavePhoto = async (photoDataUrl: string) => {
    if (!currentMember) return;
    try {
      await updateMemberPhoto(currentMember.id || currentMember.memberNumber, photoDataUrl);
      if (onRefresh) {
        await onRefresh();
      }
      setToastMsg('Foto profil berhasil diperbarui. Foto akan digunakan pada Kartu Anggota Anda.');
      setTimeout(() => setToastMsg(''), 5000);
    } catch (err) {
      console.error('Failed to update photo:', err);
      alert('Gagal menyimpan foto profil ke database.');
    }
  };

  if (!currentMember) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Data Anggota Belum Ditemukan</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Akun Anda belum terhubung dengan nomor anggota resmi MGMP PJOK SMP Kabupaten Purbalingga.
          Silakan hubungi administrator atau pengurus organisasi untuk menghubungkan data Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Kartu Identitas Resmi MGMP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sport">
              Kartu Anggota Saya
            </h1>
            <p className="text-sm text-blue-200/90 max-w-xl">
              Penerbitan, pratinjau, pengunduhan PDF, dan pencetakan mandiri Kartu Tanda Anggota (KTA) MGMP PJOK SMP Kabupaten Purbalingga berstandar ID Card CR80.
            </p>
          </div>

          {/* Status pill */}
          <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 shrink-0 flex items-center gap-3 backdrop-blur-md">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                isMemberActive ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {isMemberActive ? <UserCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Status Keanggotaan</div>
              <div
                className={`text-sm font-extrabold ${
                  isMemberActive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentMember.status}
              </div>
              <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                {currentMember.memberNumber}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3 text-emerald-950 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-sm font-bold flex-1">{toastMsg}</div>
        </div>
      )}

      {/* Inactive Warning Banner if status !== 'Aktif' */}
      {!isMemberActive && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 text-rose-900">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <div className="font-bold text-rose-800">Status Keanggotaan: {currentMember.status}</div>
            <p className="text-rose-700 leading-relaxed text-xs sm:text-sm">
              Sesuai ketentuan resmi organisasi, hanya anggota berstatus <strong>Aktif</strong> yang dapat mencetak dan mengunduh Kartu Anggota resmi. Silakan hubungi Sekretariat MGMP PJOK untuk mengaktifkan status keanggotaan Anda.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 16: BUTTONS ACTION BAR (SEDERHANA, PROPOSIONAL, RESPONSIF) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Main 4 Action Buttons: Lihat Kartu, Cetak Kartu, Download PDF, Ganti Foto */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* 👁️ Lihat Kartu */}
          <button
            onClick={() => setActiveSide(activeSide === 'both' ? 'flip' : 'both')}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
            title="Ubah Mode Tampilan Kartu"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>👁️ Lihat Kartu</span>
          </button>

          {/* 🖨️ Cetak Kartu */}
          <button
            onClick={() => handlePrint('both')}
            disabled={!isMemberActive}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 cursor-pointer transition-all"
            title="Cetak Kartu Standar CR80 Mandiri"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Cetak Kartu</span>
          </button>

          {/* ⬇️ Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={!isMemberActive || isGeneratingPdf}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            title="Unduh Kartu sebagai PDF"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isGeneratingPdf ? 'Membuat PDF...' : '⬇️ Download PDF'}</span>
          </button>

          {/* 📷 Ganti Foto */}
          <button
            onClick={() => setIsCropperOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
            title="Unggah atau Ganti Foto Profil Mandiri"
          >
            <Camera className="w-4 h-4 text-amber-600" />
            <span>📷 Ganti Foto</span>
          </button>
        </div>

        {/* Share / Copy Verification Link */}
        <button
          onClick={handleCopyLink}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Link Tersalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>Salin Tautan QR</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Card Preview on Left, Verified Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Card Display */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card View Mode Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSide('both')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSide === 'both'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Dua Sisi (Lengkap)</span>
              </button>

              <button
                onClick={() => setActiveSide('front')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSide === 'front'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Sisi Depan</span>
              </button>

              <button
                onClick={() => setActiveSide('back')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSide === 'back'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Sisi Belakang</span>
              </button>

              <button
                onClick={() => setActiveSide('flip')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSide === 'flip'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip 3D</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono px-2">
              CR80 • 85,60 × 53,98 mm • Landscape
            </div>
          </div>

          {/* Interactive Card Canvas Display */}
          <div className="bg-slate-100/70 border border-slate-200/80 rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center min-h-[360px]">
            {activeSide === 'both' && (
              <div className="w-full">
                <MemberCardPreview
                  member={currentMember}
                  cardSettings={cardSettings}
                  orgSettings={orgSettings}
                  side="both"
                />
              </div>
            )}

            {activeSide === 'front' && (
              <div className="w-full max-w-lg">
                <MemberCardPreview
                  member={currentMember}
                  cardSettings={cardSettings}
                  orgSettings={orgSettings}
                  side="front"
                />
              </div>
            )}

            {activeSide === 'back' && (
              <div className="w-full max-w-lg">
                <MemberCardPreview
                  member={currentMember}
                  cardSettings={cardSettings}
                  orgSettings={orgSettings}
                  side="back"
                />
              </div>
            )}

            {activeSide === 'flip' && (
              <div className="w-full max-w-lg">
                <MemberCardPreview
                  member={currentMember}
                  cardSettings={cardSettings}
                  orgSettings={orgSettings}
                  interactiveFlip={true}
                />
                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Klik pada kartu di atas untuk membolak-balik sisi depan dan belakang</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Identity Summary & Print Instructions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card Details */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Data Kartu Anggota</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                Otomatis
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Lengkap & Gelar</span>
                <span className="font-bold text-slate-900 text-sm">
                  {currentMember.fullName}
                  {currentMember.title ? `, ${currentMember.title}` : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor Anggota (NIA)</span>
                  <span className="font-mono font-bold text-blue-600 text-xs">
                    {currentMember.memberNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Kartu</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      isMemberActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {currentMember.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Unit Kerja (Sekolah)</span>
                <span className="font-semibold text-slate-800">{currentMember.schoolName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Masa Berlaku</span>
                <span className="font-medium text-slate-700">
                  {cardSettings.validUntil || 'Selama Berstatus Anggota Aktif'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Ketua MGMP Penerbit</span>
                <span className="font-medium text-slate-700">
                  {cardSettings.leaderName}, {cardSettings.leaderTitle}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-between py-1"
              >
                <span>Uji Coba Halaman Verifikasi QR</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Printing Specifications & Instructions Box (Duplex Guide) */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-5 sm:p-6 border border-blue-100 space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-blue-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Petunjuk Cetak Standar ID Card CR80</span>
            </h4>
            <div className="text-xs text-blue-950/85 space-y-2.5 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-white/80 border border-blue-200/60 font-semibold text-blue-900 text-[11px]">
                Ukuran kartu: <strong>85,60 × 53,98 mm</strong> (CR80 ID Card).
              </div>
              <p>
                <strong>Tips Cetak:</strong> Gunakan pengaturan <strong>Actual Size / 100%</strong> pada browser printer. <em>Jangan gunakan "Fit to Page"</em> agar ukuran fisik kartu tidak berubah.
              </p>
              <p className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 text-amber-950 text-[11px]">
                <strong>Mode Cetak Dua Sisi:</strong> Untuk mencetak dua sisi, aktifkan fitur <strong>Print on Both Sides / Duplex</strong> pada pengaturan printer dengan orientasi <strong>Landscape</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HIDDEN OFSCREEN CONTAINERS FOR HIGH-RES PDF EXPORT */}
      <div className="fixed -left-[9999px] -top-[9999px] w-[500px] pointer-events-none opacity-0 no-print print:hidden">
        <div id="pdf-render-front" className="w-[500px] no-print print:hidden">
          <MemberCardPreview
            member={currentMember}
            cardSettings={cardSettings}
            orgSettings={orgSettings}
            side="front"
            isPrintVersion={false}
          />
        </div>
        <div id="pdf-render-back" className="w-[500px] no-print print:hidden">
          <MemberCardPreview
            member={currentMember}
            cardSettings={cardSettings}
            orgSettings={orgSettings}
            side="back"
            isPrintVersion={false}
          />
        </div>
      </div>

      {/* PRINT DIALOG MODAL */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="🖨️ Cetak Kartu Anggota MGMP PJOK"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="space-y-4 print:hidden">
            {/* Pilihan Sisi Cetak */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilihan Sisi Cetak:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPrintOption('both')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    printOption === 'both'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs block">Cetak Lengkap</span>
                  <span className="text-[10px] text-slate-400 font-normal">Depan & Belakang</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintOption('front')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    printOption === 'front'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                  }`}
                >
                  <Eye className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs block">Cetak Depan</span>
                  <span className="text-[10px] text-slate-400 font-normal">Hanya Sisi Depan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintOption('back')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    printOption === 'back'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                  }`}
                >
                  <Eye className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <span className="text-xs block">Cetak Belakang</span>
                  <span className="text-[10px] text-slate-400 font-normal">Hanya Sisi Belakang</span>
                </button>
              </div>
            </div>

            {/* Pilihan Gaya Warna Kartu */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilihan Warna / Latar Kartu:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrintTheme('dark')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    printTheme === 'dark'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                    Navy
                  </div>
                  <div>
                    <div className="text-xs font-bold">Warna Standar (Navy)</div>
                    <div className="text-[10px] text-slate-500">Desain modern biru gelap</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintTheme('light')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    printTheme === 'light'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border-2 border-blue-600 shrink-0 flex items-center justify-center text-blue-700 text-[10px] font-bold">
                    Putih
                  </div>
                  <div>
                    <div className="text-xs font-bold">Putih Bersih (Hemat Tinta)</div>
                    <div className="text-[10px] text-slate-500">Latar putih ramah printer</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Printable Preview Container */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 overflow-hidden flex flex-col items-center justify-center print:bg-transparent print:border-none print:p-0 print:m-0">
            <div id="print-modal-card-target" className="print-modal-card-target printable-card-area w-full max-w-md print:max-w-none print:w-auto">
              <MemberCardPreview
                member={currentMember}
                cardSettings={cardSettings}
                orgSettings={orgSettings}
                side={printOption}
                cardTheme={printTheme}
                isPrintVersion={true}
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1 print:hidden">
            <span className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" />
              Petunjuk Cetak (Hanya Kartu yang Tercetak):
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              <li>Latar belakang hitam halaman/layar otomatis dinonaktifkan di cetakan.</li>
              <li>Pilih orientasi: <strong>Landscape</strong>.</li>
              <li>Pilih Skala: <strong>Actual Size / 100%</strong> (bukan Fit to Page).</li>
              <li>Pastikan centang: <strong>Grafik Latar Belakang (Background Graphics)</strong> agar warna kartu tercetak sempurna.</li>
              <li>Atur Margin: <strong>None / Tidak Ada</strong>.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 print:hidden">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={executeBrowserPrint}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Buka Dialog Cetak Browser</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* DEDICATED PRINT-ONLY CONTAINER DIRECTLY IN BODY */}
      {isPrintModalOpen && currentMember && (
        <PrintCardContainer
          member={currentMember}
          cardSettings={cardSettings}
          orgSettings={orgSettings}
          side={printOption}
          cardTheme={printTheme}
        />
      )}

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
