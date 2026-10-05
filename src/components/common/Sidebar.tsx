import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  QrCode,
  FolderArchive,
  GraduationCap,
  MessageSquare,
  Award,
  FileSpreadsheet,
  Settings,
  BookOpen,
  X,
  Dumbbell,
  CreditCard,
  ShieldCheck,
  FileSignature,
  User,
  UserCog,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OrganizationSetting } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  orgSettings: OrganizationSetting;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  orgSettings,
}) => {
  const {
    user,
    isSuperAdmin,
    isKetua,
    isSekretaris,
    canAccessUsers,
    canAccessSystemSettings,
    canAccessActivityLogs,
    canManageOrgSettings,
    canManageCardSettings,
    canManageMemberCards,
    canManageMembers,
    canManageActivities,
    canManageResources,
  } = useAuth();

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ...(canManageMembers
          ? [{ id: 'members', label: 'Manajemen Anggota', icon: Users }]
          : []),
        ...(canManageOrgSettings
          ? [{ id: 'organization', label: 'Organisasi & Struktur', icon: Building2 }]
          : []),
      ],
    },
    {
      title: 'KARTU ANGGOTA',
      items: [
        { id: 'my-card', label: 'Kartu Anggota Saya', icon: CreditCard },
        { id: 'my-profile', label: 'Profil Saya', icon: User },
        ...(canManageMemberCards
          ? [{ id: 'member-cards', label: 'Manajemen Kartu Anggota', icon: ShieldCheck }]
          : []),
        ...(canManageCardSettings
          ? [{ id: 'card-settings', label: 'Pengaturan Kartu Anggota', icon: FileSignature }]
          : []),
      ],
    },
    {
      title: 'KEGIATAN & PRESENSI',
      items: [
        { id: 'activities', label: 'Agenda & Kegiatan', icon: Calendar },
        { id: 'attendance', label: 'Presensi Digital (QR)', icon: QrCode },
        { id: 'trainings', label: 'Pelatihan & Sertifikat', icon: GraduationCap },
      ],
    },
    {
      title: 'SUMBER BELAJAR & DOKUMEN',
      items: [
        { id: 'resources', label: 'Bank Perangkat PJOK', icon: BookOpen },
        { id: 'documents', label: 'Bank Dokumen & SK', icon: FolderArchive },
      ],
    },
    {
      title: 'KOLABORASI & PRAKTIK',
      items: [
        { id: 'discussions', label: 'Forum Diskusi', icon: MessageSquare },
        { id: 'best-practices', label: 'Inovasi & Praktik Baik', icon: Award },
      ],
    },
    {
      title: 'ADMINISTRASI',
      items: [
        ...(canManageMembers
          ? [{ id: 'reports', label: 'Pusat Laporan', icon: FileSpreadsheet }]
          : []),
        ...(canAccessUsers
          ? [{ id: 'users', label: 'Manajemen Pengguna (RBAC)', icon: UserCog }]
          : []),
        ...(canAccessActivityLogs
          ? [{ id: 'admin-logs', label: 'Log Aktivitas Admin', icon: ShieldAlert }]
          : []),
        ...(canAccessSystemSettings
          ? [{ id: 'settings', label: 'Pengaturan Sistem', icon: Settings }]
          : []),
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sport font-extrabold text-sm tracking-tight text-white leading-tight">
                MGMP PJOK SMP <span className="text-sky-400 font-black">PURBALINGGA</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Kabupaten Purbalingga
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="text-[11px] text-slate-400 leading-snug">
            <span className="text-white font-semibold block">{orgSettings.period}</span>
            {orgSettings.activeAcademicYear}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 italic">
            "{orgSettings.tagline}"
          </p>
          <p className="text-[9px] text-cyan-400/80 font-normal mt-0.5">
            dev: Purwanto, S.Pd
          </p>
        </div>
      </aside>
    </>
  );
};
