import React from 'react';
import {
  Users,
  Building2,
  Calendar,
  BookOpen,
  FolderArchive,
  GraduationCap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Plus,
  QrCode,
  FileSpreadsheet,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import {
  Member,
  School,
  Activity,
  LearningResource,
  OrgDocument,
  Training,
  Attendance,
  OrganizationSetting,
  MemberRegistrationConfig,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MemberRegistrationBanner } from '../../components/dashboard/MemberRegistrationBanner';
import { DEFAULT_REGISTRATION_CONFIG, updateRegistrationConfig } from '../../services/dataService';

interface AdminDashboardProps {
  members: Member[];
  schools: School[];
  activities: Activity[];
  resources: LearningResource[];
  documents: OrgDocument[];
  trainings: Training[];
  orgSettings: OrganizationSetting;
  regConfig?: MemberRegistrationConfig;
  onSaveRegConfig?: (updated: Partial<MemberRegistrationConfig>) => Promise<void>;
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  members,
  schools,
  activities,
  resources,
  documents,
  trainings,
  orgSettings,
  regConfig = DEFAULT_REGISTRATION_CONFIG,
  onSaveRegConfig,
  onNavigate,
}) => {
  const { user } = useAuth();

  const handleDefaultSaveRegConfig = async (updated: Partial<MemberRegistrationConfig>) => {
    if (onSaveRegConfig) {
      await onSaveRegConfig(updated);
    } else {
      await updateRegistrationConfig(updated);
    }
  };

  // Active members
  const activeMembers = members.filter((m) => m.status === 'Aktif');

  // Distribution by subdistrict (top 5)
  const subdistrictCounts = members.reduce((acc, m) => {
    const sub = m.subdistrict || 'Lainnya';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSubdistricts = Object.entries(subdistrictCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Distribution by school status
  const negeriCount = schools.filter((s) => s.status === 'Negeri').length;
  const swastaCount = schools.filter((s) => s.status === 'Swasta').length;

  // Upcoming activities
  const upcomingActivities = activities
    .filter((a) => a.status === 'Berlangsung' || a.status === 'Pendaftaran' || a.status === 'Direncanakan')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <span>{orgSettings.educationLevel}</span>
            <span>•</span>
            <span>Tahun Ajaran {orgSettings.activeAcademicYear}</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-sport text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Selamat Datang di Portal{' '}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                MGMP PJOK SMP Purbalingga
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 italic">
              "{orgSettings.tagline}"
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-sky-300/80 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>dev: Purwanto, S.Pd</span>
            </div>
          </div>

          {/* Running Text Glassmorphic Elegan */}
          <div className="overflow-hidden whitespace-nowrap bg-white/5 border border-white/10 rounded-2xl py-2 px-3.5 backdrop-blur-xl shadow-inner flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-sky-400/30 text-sky-200 font-semibold text-xs shrink-0 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-bold">INFO TERKINI</span>
            </div>
            <div className="overflow-hidden relative w-full">
              <div className="inline-block whitespace-nowrap animate-marquee">
                <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-300 via-rose-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-text tracking-wide">
                  🏃 Selamat Datang di Portal MGMP PJOK SMP Purbalingga • "{orgSettings.tagline}" • dev: Purwanto, S.Pd • Meningkatkan Kompetensi, Sportivitas, dan Prestasi Olahraga Pelajar Purbalingga! ⚽ 🏸 🏆
                </span>
                <span className="mx-6 text-sky-400 font-bold">✦✦✦</span>
                <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-300 via-amber-200 to-cyan-200 bg-clip-text text-transparent animate-gradient-text tracking-wide">
                  🏃 Presensi Digital QR Code Aktif • Bank Perangkat Ajar Kurikulum Merdeka Fase D Lengkap • Komunitas Guru PJOK Hebat
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Sistem Informasi Manajemen Organisasi {orgSettings.orgName}. Pantau keanggotaan guru PJOK, jadwal kegiatan, presensi digital, dan repositori pembelajaran secara terpusat.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('my-card')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-300" />
              <span>Kartu Anggota Saya</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Presensi Digital QR</span>
            </button>
            <button
              onClick={() => onNavigate('members')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kelola Anggota</span>
            </button>
            <button
              onClick={() => onNavigate('resources')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bank Perangkat PJOK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tautan Pengisian Google Formulir Pendataan Anggota */}
      <MemberRegistrationBanner
        regConfig={regConfig}
        onSaveConfig={handleDefaultSaveRegConfig}
        onNavigateToSettings={() => onNavigate('settings')}
      />

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Anggota */}
        <div
          onClick={() => onNavigate('members')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total Anggota
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {members.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{activeMembers.length} Guru Aktif</span>
          </div>
        </div>

        {/* Total Sekolah */}
        <div
          onClick={() => onNavigate('members')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Sekolah Terdaftar
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {schools.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {negeriCount} Negeri • {swastaCount} Swasta
          </div>
        </div>

        {/* Total Kegiatan */}
        <div
          onClick={() => onNavigate('activities')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total Kegiatan
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {activities.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {upcomingActivities.length} Agenda Aktif
          </div>
        </div>

        {/* Perangkat & Dokumen */}
        <div
          onClick={() => onNavigate('resources')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Bank Sumber Belajar
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {resources.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {documents.length} Dokumen Arsip
          </div>
        </div>
      </div>

      {/* Grid: Charts & Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Distribusi Anggota per Kecamatan & Sekolah */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribusi Anggota per Kecamatan Teratas
              </h3>
              <p className="text-xs text-slate-500">Penyebaran guru PJOK di wilayah Purbalingga</p>
            </div>
            <button
              onClick={() => onNavigate('members')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Lihat Detail →
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {sortedSubdistricts.map(([sub, count]) => {
              const percentage = Math.round((count / (members.length || 1)) * 100);
              return (
                <div key={sub} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kec. {sub}</span>
                    </span>
                    <span className="text-slate-500">
                      <strong>{count}</strong> guru ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Jenjang Wilayah Kerja</span>
              <span className="text-xs font-bold text-slate-800">{orgSettings.region}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Status Akreditasi PJOK</span>
              <span className="text-xs font-bold text-emerald-600">Terstandar Kurikulum Merdeka</span>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Agenda List */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Agenda Kegiatan Mendatang</h3>
              <button
                onClick={() => onNavigate('activities')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Semua
              </button>
            </div>

            <div className="space-y-3">
              {upcomingActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => onNavigate('activities')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-blue-700">{act.type}</span>
                    <span className="text-slate-500">{act.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{act.title}</h4>
                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{act.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('activities')}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Kelola Seluruh Agenda MGMP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
