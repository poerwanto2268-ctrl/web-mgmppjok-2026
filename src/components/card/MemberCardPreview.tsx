import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Dumbbell,
  CheckCircle,
  ShieldCheck,
  Award,
  Sparkles,
  QrCode as QrIcon,
  RotateCw,
} from 'lucide-react';
import { Member, MemberCardSettings, OrganizationSetting } from '../../types';

interface MemberCardPreviewProps {
  member: Member;
  cardSettings: MemberCardSettings;
  orgSettings: OrganizationSetting;
  side?: 'front' | 'back' | 'both';
  interactiveFlip?: boolean;
  className?: string;
  id?: string;
  isPrintVersion?: boolean;
  cardTheme?: 'dark' | 'light';
}

export const MemberCardPreview: React.FC<MemberCardPreviewProps> = ({
  member,
  cardSettings,
  orgSettings,
  side = 'both',
  interactiveFlip = false,
  className = '',
  id,
  isPrintVersion = false,
  cardTheme = 'dark',
}) => {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const isLight = cardTheme === 'light';

  // Generate verification URL
  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?verify=member&id=${encodeURIComponent(member.id || member.memberNumber)}`
    : `https://mgmppjok-pbg.id/verify/${member.memberNumber}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate card QR:', err));
  }, [verificationUrl, member.memberNumber]);

  const activeLeaderName = cardSettings.leaderName || 'Sutarman';
  const activeLeaderTitle = cardSettings.leaderTitle || 'S.Pd., M.Pd.';
  const activeLeaderPos = cardSettings.leaderPosition || 'Ketua MGMP PJOK SMP Kabupaten Purbalingga';
  const activePeriod = cardSettings.period || orgSettings.period || '2024 - 2027';
  const activeValidUntil = cardSettings.validUntil || 'Selama Menjadi Anggota Aktif';
  const activeCardNote = cardSettings.cardNote || 
    '1. Kartu ini merupakan tanda bukti resmi keanggotaan MGMP PJOK SMP Kab. Purbalingga.\n2. Berlaku selama pemegang kartu berstatus anggota aktif.\n3. Pindai QR Code untuk memverifikasi keabsahan data keanggotaan.\n4. Jika menemukan kartu ini, harap hubungi Sekretariat MGMP PJOK SMP Kab. Purbalingga.';

  const isMemberActive = member.status === 'Aktif';

  // Render Front Face
  const renderFrontCard = () => (
    <div
      className={`id-card relative w-full aspect-[85.6/53.98] rounded-2xl overflow-hidden shadow-2xl select-none flex flex-col justify-between p-3.5 sm:p-5 print:shadow-none ${
        isPrintVersion ? 'print-cr80-card' : ''
      } ${
        isLight
          ? 'bg-gradient-to-br from-white via-slate-50 to-blue-50/80 text-slate-800 border border-slate-300 print:border-slate-400'
          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border border-slate-700/60 print:border-slate-800'
      }`}
      style={{
        boxShadow: isPrintVersion ? 'none' : '0 10px 30px -5px rgba(15, 23, 42, 0.45)',
      }}
    >
      {/* Decorative sports geometric watermark background */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'opacity-[0.04] bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:12px_12px]'
            : 'opacity-[0.06] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]'
        }`}
      />
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl pointer-events-none ${
          isLight ? 'bg-blue-200/30' : 'bg-blue-600/20'
        }`}
      />
      <div
        className={`absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-2xl pointer-events-none ${
          isLight ? 'bg-amber-200/20' : 'bg-amber-500/15'
        }`}
      />

      {/* Decorative diagonal wave ribbon */}
      <div className="absolute top-0 right-0 w-36 sm:w-44 h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -right-10 -top-10 w-44 h-60 bg-gradient-to-b from-blue-500 via-sky-400 to-transparent transform rotate-12 blur-xs" />
      </div>

      {/* TOP HEADER */}
      <div
        className={`relative z-10 flex items-center justify-between pb-2 border-b ${
          isLight ? 'border-blue-200' : 'border-blue-500/30'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Official Logo */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md border border-white/20 shrink-0">
            {cardSettings.logoUrl ? (
              <img
                src={cardSettings.logoUrl}
                alt="Logo MGMP"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </div>
          <div>
            <div
              className={`font-extrabold text-[10px] sm:text-xs tracking-wider uppercase leading-none font-sport ${
                isLight ? 'text-blue-900' : 'text-slate-100'
              }`}
            >
              MGMP PJOK SMP
            </div>
            <div
              className={`font-black text-[11px] sm:text-sm tracking-tight font-sport ${
                isLight
                  ? 'text-blue-950 font-black'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-white'
              }`}
            >
              KABUPATEN PURBALINGGA
            </div>
            <div
              className={`text-[7px] sm:text-[9px] font-medium ${
                isLight ? 'text-blue-700' : 'text-blue-200/80'
              }`}
            >
              Provinsi Jawa Tengah • Periode {activePeriod}
            </div>
          </div>
        </div>

        {/* Card Badge */}
        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wider uppercase border ${
              isLight
                ? 'bg-blue-100 border-blue-300 text-blue-900'
                : 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 border-amber-400/40 text-amber-300'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>KARTU ANGGOTA</span>
          </div>
          <div
            className={`text-[7px] sm:text-[8px] font-mono mt-0.5 tracking-widest font-semibold ${
              isLight ? 'text-slate-500' : 'text-slate-300'
            }`}
          >
            OFFICIAL MEMBER
          </div>
        </div>
      </div>

      {/* CARD BODY: Photo + Member Info + QR */}
      <div className="relative z-10 my-auto py-1 flex items-center gap-3 sm:gap-4">
        {/* Member Photo */}
        <div className="relative shrink-0">
          <div
            className={`w-14 h-18 sm:w-20 sm:h-26 rounded-xl overflow-hidden shadow-md flex items-center justify-center border-2 ${
              isLight ? 'bg-slate-100 border-blue-600' : 'bg-slate-800 border-amber-400/60'
            }`}
          >
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center p-1 text-center">
                <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300/80 mb-1" />
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 leading-tight">
                  PJOK
                </span>
              </div>
            )}
          </div>
          {/* Status Badge overlay on photo */}
          <div
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[7px] sm:text-[8px] font-extrabold uppercase tracking-wide border shadow-xs ${
              isMemberActive
                ? 'bg-emerald-500 text-white border-emerald-300'
                : 'bg-rose-500 text-white border-rose-300'
            }`}
          >
            {member.status}
          </div>
        </div>

        {/* Member Data Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div>
            <span
              className={`text-[7px] sm:text-[9px] font-semibold uppercase tracking-widest block leading-none ${
                isLight ? 'text-blue-800 font-bold' : 'text-sky-300'
              }`}
            >
              NAMA ANGGOTA
            </span>
            <div
              className={`text-xs sm:text-base font-extrabold truncate leading-tight tracking-tight drop-shadow-xs ${
                isLight ? 'text-slate-950 font-black' : 'text-white'
              }`}
            >
              {member.fullName}
              {member.title ? `, ${member.title}` : ''}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] sm:text-[10px]">
            <div>
              <span className={`block text-[7px] sm:text-[8px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                No. Anggota (NIA)
              </span>
              <span
                className={`font-bold font-mono tracking-wide ${
                  isLight ? 'text-blue-900 font-extrabold' : 'text-amber-300'
                }`}
              >
                {member.memberNumber || 'MGMP-PBG-XXX'}
              </span>
            </div>
            <div>
              <span className={`block text-[7px] sm:text-[8px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                NIP / NUPTK
              </span>
              <span
                className={`font-medium truncate block ${
                  isLight ? 'text-slate-800 font-semibold' : 'text-slate-200'
                }`}
              >
                {member.nip || member.nuptk || '-'}
              </span>
            </div>
            <div className="col-span-2">
              <span className={`block text-[7px] sm:text-[8px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Unit Kerja / Sekolah
              </span>
              <span
                className={`font-semibold truncate block ${
                  isLight ? 'text-slate-900 font-bold' : 'text-slate-100'
                }`}
              >
                {member.schoolName}
              </span>
            </div>
          </div>
        </div>

        {/* Front QR Code */}
        <div
          className={`shrink-0 text-center flex flex-col items-center justify-center pl-1 sm:pl-2 border-l ${
            isLight ? 'border-slate-200' : 'border-blue-500/20'
          }`}
        >
          <div className="w-13 h-13 sm:w-17 sm:h-17 bg-white p-1 rounded-xl shadow-md border border-blue-300/40 flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code Member" className="w-full h-full object-contain" />
            ) : (
              <QrIcon className="w-8 h-8 text-slate-800 animate-pulse" />
            )}
          </div>
          <span
            className={`text-[6px] sm:text-[7px] font-mono tracking-wider mt-1 uppercase ${
              isLight ? 'text-blue-900 font-bold' : 'text-sky-200/90'
            }`}
          >
            PINDAI VERIFIKASI
          </span>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div
        className={`relative z-10 pt-1.5 border-t flex items-center justify-between text-[7px] sm:text-[9px] ${
          isLight ? 'border-slate-200 text-slate-600' : 'border-blue-500/25 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="font-medium">
            Berlaku:{' '}
            <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-semibold'}>
              {activeValidUntil}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <span>KODE:</span>
          <span className={`font-bold ${isLight ? 'text-blue-900' : 'text-amber-300'}`}>
            {member.memberNumber}
          </span>
        </div>
      </div>

      {/* Hologram aesthetic strip at bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 opacity-90" />
    </div>
  );

  // Render Back Face
  const renderBackCard = () => (
    <div
      className={`id-card relative w-full aspect-[85.6/53.98] rounded-2xl overflow-hidden shadow-2xl text-slate-800 select-none border border-slate-300 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 flex flex-col justify-between p-3.5 sm:p-5 print:shadow-none print:border print:border-slate-800 ${
        isPrintVersion ? 'print-cr80-card' : ''
      }`}
      style={{
        boxShadow: isPrintVersion ? 'none' : '0 10px 30px -5px rgba(15, 23, 42, 0.45)',
      }}
    >
      {/* Decorative subtle watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:12px_12px]" />
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/40 rounded-full blur-xl pointer-events-none" />

      {/* TOP HEADER BACK */}
      <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-slate-300">
        <div>
          <div className="font-extrabold text-[10px] sm:text-xs text-blue-900 uppercase tracking-tight font-sport leading-none">
            KETENTUAN KARTU TANDA ANGGOTA
          </div>
          <div className="text-[8px] sm:text-[9px] text-slate-600 font-medium">
            MGMP PJOK SMP KABUPATEN PURBALINGGA
          </div>
        </div>
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-800 flex items-center justify-center text-white shrink-0">
          <Dumbbell className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* TERMS & VERIFICATION BODY */}
      <div className="relative z-10 my-auto py-1 grid grid-cols-12 gap-3 items-center">
        {/* Left: Terms note & brief ID */}
        <div className="col-span-7 sm:col-span-8 space-y-1.5">
          <div className="bg-white/90 border border-slate-200/80 rounded-xl p-2 shadow-2xs space-y-1">
            <div className="text-[7px] sm:text-[8px] text-slate-700 leading-tight whitespace-pre-line">
              {activeCardNote}
            </div>
          </div>

          <div className="text-[7px] sm:text-[8px] text-slate-600 leading-tight">
            <span>Pemegang: </span>
            <strong className="text-slate-900 font-bold">{member.fullName}</strong>
            <span className="text-slate-400"> • </span>
            <span className="text-blue-700 font-semibold">{member.memberNumber}</span>
          </div>
        </div>

        {/* Right: Signature of Ketua MGMP */}
        <div className="col-span-5 sm:col-span-4 text-center flex flex-col items-center justify-center">
          <div className="text-[7px] sm:text-[8px] text-slate-600 font-medium leading-none">
            Purbalingga, {activePeriod.split('-')[0]?.trim() || '2024'}
          </div>
          <div className="text-[7px] sm:text-[8px] text-slate-700 font-bold uppercase tracking-wide leading-tight mt-0.5">
            Ketua MGMP PJOK
          </div>

          {/* Signature Image & Official Stamp */}
          <div className="relative w-24 sm:w-28 h-9 sm:h-12 flex items-center justify-center my-0.5">
            {/* Stamp simulation */}
            <div className="absolute left-1/2 -translate-x-1/2 w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-blue-600/40 text-blue-600/60 flex items-center justify-center font-bold text-[5px] sm:text-[6px] uppercase tracking-tighter text-center pointer-events-none rotate-[-12deg] p-0.5">
              MGMP PJOK PURBALINGGA
            </div>

            {/* Signature */}
            {cardSettings.signatureUrl ? (
              <img
                src={cardSettings.signatureUrl}
                alt="Tanda Tangan Ketua"
                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-xs"
              />
            ) : (
              <div className="font-serif italic text-xs sm:text-sm text-blue-900 relative z-10 font-bold">
                {activeLeaderName}
              </div>
            )}
          </div>

          <div className="font-extrabold text-[8px] sm:text-[10px] text-slate-900 leading-tight border-t border-slate-300/80 pt-0.5 w-full">
            {activeLeaderName}, {activeLeaderTitle}
          </div>
          <div className="text-[6px] sm:text-[7px] text-slate-500 font-mono leading-none">
            NIP. 19740512 200212 1 004
          </div>
        </div>
      </div>

      {/* FOOTER BAR BACK */}
      <div className="relative z-10 pt-1.5 border-t border-slate-300 flex items-center justify-between text-[7px] sm:text-[8px] text-slate-500">
        <div className="truncate max-w-[200px] sm:max-w-xs">
          Sekretariat: {orgSettings.secretariatAddress || 'SMPN 1 Purbalingga'}
        </div>
        <div className="font-mono text-blue-800 font-bold">
          mgmppjok-pbg.id
        </div>
      </div>

      {/* Bottom edge color bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600" />
    </div>
  );

  // If interactive flip is requested (single card view that flips)
  if (interactiveFlip) {
    return (
      <div className={`relative perspective-1000 ${className}`} id={id}>
        <div
          onClick={() => setCurrentSide(currentSide === 'front' ? 'back' : 'front')}
          className="cursor-pointer transition-transform duration-500 transform-style-3d group"
        >
          {currentSide === 'front' ? renderFrontCard() : renderBackCard()}

          {/* Quick flip hint button overlay */}
          <div className="absolute top-2 right-2 z-20 opacity-70 group-hover:opacity-100 transition-opacity bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1.5 backdrop-blur-xs text-xs flex items-center gap-1 shadow-md">
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span className="text-[10px] pr-1 font-medium hidden sm:inline">
              Klik untuk {currentSide === 'front' ? 'Sisi Belakang' : 'Sisi Depan'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If side is specified as only front
  if (side === 'front') {
    if (!className && !id) {
      return renderFrontCard();
    }
    return (
      <div className={className} id={id}>
        {renderFrontCard()}
      </div>
    );
  }

  // If side is specified as only back
  if (side === 'back') {
    if (!className && !id) {
      return renderBackCard();
    }
    return (
      <div className={className} id={id}>
        {renderBackCard()}
      </div>
    );
  }

  // Both sides side-by-side or stacked
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`} id={id}>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Sisi Depan (Front)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">CR80 • 85.60 × 53.98 mm</span>
        </div>
        {renderFrontCard()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Sisi Belakang (Back)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">CR80 • 85.60 × 53.98 mm</span>
        </div>
        {renderBackCard()}
      </div>
    </div>
  );
};
