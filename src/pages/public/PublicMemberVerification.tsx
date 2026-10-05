import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Dumbbell,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Sparkles,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { Member, MemberCardSettings, OrganizationSetting } from '../../types';

interface PublicMemberVerificationProps {
  memberId: string;
  members: Member[];
  cardSettings: MemberCardSettings;
  orgSettings: OrganizationSetting;
  onBackToHome?: () => void;
}

export const PublicMemberVerification: React.FC<PublicMemberVerificationProps> = ({
  memberId,
  members,
  cardSettings,
  orgSettings,
  onBackToHome,
}) => {
  // Locate member by ID or memberNumber
  const member = members.find(
    (m) =>
      m.id === memberId ||
      m.memberNumber === memberId ||
      m.memberNumber.toLowerCase() === memberId.toLowerCase()
  );

  const isValidMember = !!member && member.status === 'Aktif';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-6">
        {/* Verification Card Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-600 tracking-wider uppercase font-sport">
              SISTEM VERIFIKASI RESMI
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight font-sport">
              MGMP PJOK SMP PURBALINGGA
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verifikasi Keabsahan Kartu Tanda Anggota (KTA) Digital
            </p>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Status Badge Hero */}
          <div className="text-center space-y-2 pb-4 border-b border-slate-100">
            {isValidMember ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                  KARTU RESMI & VALID
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  Terdaftar resmi dalam Database Keanggotaan MGMP PJOK SMP Kabupaten Purbalingga
                </p>
              </>
            ) : member ? (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                  STATUS: {member.status}
                </div>
                <p className="text-xs text-amber-700 font-medium">
                  Status keanggotaan saat ini tidak aktif atau dalam masa mutasi/nonaktif.
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wider">
                  TIDAK DITEMUKAN / INVALID
                </div>
                <p className="text-xs text-rose-700 font-medium">
                  Kode QR atau Nomor Anggota tidak terdaftar dalam pangkalan data resmi kami.
                </p>
              </>
            )}
          </div>

          {/* Member Details (Publicly Allowed Only - Zero PII Leak) */}
          {member && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Nama Anggota
                  </span>
                  <div className="text-base font-extrabold text-slate-900">
                    {member.fullName}
                    {member.title ? `, ${member.title}` : ''}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                      Nomor Anggota (NIA)
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {member.memberNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                      Status Keanggotaan
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isValidMember
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Asal Sekolah / Unit Kerja
                  </span>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{member.schoolName}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Wilayah Pembinaan
                  </span>
                  <div className="text-xs text-slate-700">
                    Kecamatan {member.subdistrict}, Kabupaten Purbalingga
                  </div>
                </div>
              </div>

              {/* Organization & Verification Meta */}
              <div className="text-[11px] text-slate-500 space-y-1 text-center">
                <div>Periode Kepengurusan: <strong>{cardSettings.period || orgSettings.period}</strong></div>
                <div>Ketua MGMP: <strong>{cardSettings.leaderName}, {cardSettings.leaderTitle}</strong></div>
                <div className="text-slate-400 pt-1">
                  Diverifikasi secara realtime pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Protection Notice */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900/80 leading-relaxed text-center">
            Informasi di atas adalah data publik resmi untuk verifikasi keanggotaan. Data kontak pribadi, NIP lengkap, dan alamat rumah terlindungi demi privasi anggota.
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda Portal</span>
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} MGMP PJOK SMP Kabupaten Purbalingga. All rights reserved.
        </div>
      </div>
    </div>
  );
};
