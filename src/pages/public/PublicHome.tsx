import React from 'react';
import {
  Calendar,
  Users,
  Building2,
  BookOpen,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Award,
  CheckCircle,
  FileText,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import {
  OrganizationSetting,
  Activity,
  Announcement,
  LearningResource,
  Member,
  School,
} from '../../types';

interface PublicHomeProps {
  orgSettings: OrganizationSetting;
  activities: Activity[];
  announcements: Announcement[];
  resources: LearningResource[];
  members: Member[];
  schools: School[];
  onNavigate: (view: string) => void;
  onSelectActivity?: (act: Activity) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  orgSettings,
  activities,
  announcements,
  resources,
  members,
  schools,
  onNavigate,
  onSelectActivity,
}) => {
  const upcomingActivities = activities
    .filter((a) => a.status !== 'Selesai' && a.status !== 'Dibatalkan')
    .slice(0, 3);

  const featuredResources = resources.slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white py-20 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Portal Digital Resmi {orgSettings.educationLevel}</span>
              </div>

              <h1 className="font-sport text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
                MGMP PJOK SMP{' '}
                <span className="block bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
                  KABUPATEN PURBALINGGA
                </span>
              </h1>

              <div className="space-y-1.5 pt-1">
                <p className="text-base sm:text-lg font-medium text-slate-300/90 italic tracking-wide">
                  "{orgSettings.tagline}"
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-sky-300/80 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>dev: Purwanto, S.Pd</span>
                </div>
              </div>

              {/* Glassmorphic Elegant Running Ticker */}
              <div className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl py-2 px-3.5 backdrop-blur-xl shadow-lg flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-sky-400/30 text-sky-200 font-semibold text-xs shrink-0 tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-bold">INFO TERKINI</span>
                </div>
                <div className="overflow-hidden relative w-full">
                  <div className="inline-block whitespace-nowrap animate-marquee">
                    <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-300 via-rose-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-text tracking-wide">
                      🏃 Selamat Datang di Portal MGMP PJOK SMP Purbalingga • "{orgSettings.tagline}" • dev: Purwanto, S.Pd • Diseminasi Kurikulum Merdeka PJOK Fase D, Administrasi & Presensi Digital QR Code se-Kabupaten Purbalingga! ⚽ 🏸 🏆
                    </span>
                    <span className="mx-6 text-sky-400 font-bold">✦✦✦</span>
                    <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-300 via-pink-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent animate-gradient-text tracking-wide">
                      🏃 Bergerak Bersama, Berkarya, dan Menginspirasi • Meningkatkan Kompetensi, Sportivitas, dan Prestasi Olahraga Pelajar Purbalingga!
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Platform integrasi administrasi organisasi, tata kelola keanggotaan,
                presensi digital berbasis QR Code, repositori bank perangkat ajar PJOK Fase D,
                serta pusat diseminasi inovasi pendidikan jasmani se-{orgSettings.region}.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('public-agendas')}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Jadwal & Agenda Kegiatan</span>
                </button>
                <button
                  onClick={() => onNavigate('public-resources')}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm flex items-center gap-2 backdrop-blur-xs transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Bank Perangkat PJOK</span>
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SK Resmi Dindikbud</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Presensi QR Unik</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Kurikulum Merdeka PJOK</span>
                </div>
              </div>
            </div>

            {/* Right Hero Stats Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Statistik Organisasi
                    </h3>
                    <p className="text-xs text-slate-400">{orgSettings.period}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Aktif
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold">Guru Anggota</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {members.length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Terdaftar Aktif</p>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-indigo-400 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">Sekolah SMP</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {schools.length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Negeri & Swasta</p>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold">Agenda Kegiatan</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {activities.length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Tahun Berjalan</p>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-semibold">Perangkat PJOK</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {resources.length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Modul & Asesmen</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Masuk ke Dashboard Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SAMBUTAN KETUA MGMP */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="w-44 h-52 sm:w-52 sm:h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-2 ring-blue-100 bg-slate-100 mb-4">
                <img
                  src={orgSettings.welcomeLeaderPhoto}
                  alt={orgSettings.welcomeLeaderName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">{orgSettings.welcomeLeaderName}</h3>
              <p className="text-xs text-blue-600 font-semibold">{orgSettings.welcomeLeaderTitle}</p>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Sambutan Ketua MGMP</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Membangun Generasi Tangguh Melalui Pembelajaran PJOK Berkualitas
              </h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed whitespace-pre-line">
                {orgSettings.welcomeMessage}
              </div>
              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onNavigate('public-structure')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Susunan Pengurus Lengkap</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* AGENDA TERDEKAT */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Kalender Organisasi
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Agenda Kegiatan Terdekat</h2>
            </div>
            <button
              onClick={() => onNavigate('public-agendas')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Semua Agenda</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {act.type}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {act.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{act.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{act.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{act.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{act.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (onSelectActivity) onSelectActivity(act);
                      onNavigate('attendance');
                    }}
                    className="w-full py-2 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Buka Presensi Digital
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BANK SUMBER BELAJAR UNGGULAN */}
        <section className="bg-slate-100/70 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Kurikulum Merdeka PJOK
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Bank Perangkat Pembelajaran Pilihan
              </h2>
            </div>
            <button
              onClick={() => onNavigate('public-resources')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Jelajahi Semua Perangkat</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    {res.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {res.title}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    <span>{res.grade}</span> • <span>{res.sportTopic}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{res.downloadsCount} diunduh</span>
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Unduh
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BERITA & INFORMASI RESMI */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Warta & Pengumuman
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Kabar Terbaru MGMP PJOK</h2>
            </div>
            <button
              onClick={() => onNavigate('public-news')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Semua Berita</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentAnnouncements.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {news.coverUrl && (
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img
                      src={news.coverUrl}
                      alt={news.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-blue-600">
                      {news.category} • {news.publishedDate}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('public-news')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 self-start cursor-pointer"
                  >
                    Baca Selengkapnya →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
