import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Globe,
  LogOut,
  LogIn,
  Shield,
  UserCheck,
  ChevronDown,
  Sparkles,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OrganizationSetting, UserRole } from '../../types';
import { Modal } from './Modal';

interface HeaderProps {
  onToggleSidebar: () => void;
  orgSettings: OrganizationSetting;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  orgSettings,
  currentView,
  onNavigate,
}) => {
  const {
    user,
    loginWithGoogle,
    logout,
    setSimulationRole,
    isSuperAdminUnlocked,
    unlockSuperAdmin,
    lockSuperAdmin,
  } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Super Admin password protection modal states
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const sharedAppUrl = 'https://ais-pre-deswbl66ovvofq655wtqka-678384907620.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSelectRole = (r: UserRole) => {
    if (r === 'Super Admin') {
      if (!isSuperAdminUnlocked) {
        setShowRoleMenu(false);
        setAdminPasswordInput('');
        setAdminPasswordError('');
        setShowSuperAdminModal(true);
        return;
      }
    }
    setSimulationRole(r);
    setShowRoleMenu(false);
  };

  const handleUnlockSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockSuperAdmin(adminPasswordInput);
    if (success) {
      setSimulationRole('Super Admin');
      setShowSuperAdminModal(false);
      setAdminPasswordInput('');
      setAdminPasswordError('');
    } else {
      setAdminPasswordError('Kata sandi Super Admin salah! Akses ditolak.');
    }
  };
  const [showNotification, setShowNotification] = useState(false);

  const roles: UserRole[] = [
    'Super Admin',
    'Ketua',
    'Sekretaris',
    'Bendahara',
    'Pengurus',
    'Anggota',
    'Pengunjung',
  ];

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Ketua':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Sekretaris':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Bendahara':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pengurus':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Anggota':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {orgSettings.activeAcademicYear}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {orgSettings.region}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Role Simulator, User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick link to public web */}
          <button
            onClick={() => onNavigate('public-home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView.startsWith('public-')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lihat Web Publik</span>
          </button>

          {/* Tautan Akses PC Lain */}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 cursor-pointer shadow-2xs"
            title="Buka atau Salin Tautan untuk PC Lain"
          >
            <Laptop className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Tautan PC Lain</span>
          </button>

          {/* Quick Role Switcher (Simulator) */}
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Ganti Peran Hak Akses (Simulasi)"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Peran:</span>
                <span className="font-bold text-blue-700">{user?.role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {user?.role === 'Super Admin' && isSuperAdminUnlocked && (
                <button
                  onClick={lockSuperAdmin}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Kunci Akses Super Admin (Kembali ke Ketua)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xl:inline">Kunci</span>
                </button>
              )}
            </div>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Simulasi Hak Akses</p>
                  <p className="text-[10px] text-slate-500">Uji tampilan & wewenang pengguna</p>
                </div>
                <div className="py-1">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleSelectRole(r)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        user?.role === r ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{r}</span>
                        {r === 'Super Admin' && !isSuperAdminUnlocked && (
                          <span title="Diproteksi Kata Sandi">
                            <Lock className="w-3 h-3 text-amber-500" />
                          </span>
                        )}
                      </div>
                      {user?.role === r && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile / Login button */}
          {user?.role !== 'Pengunjung' ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => onNavigate('my-profile')}
                className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer group"
                title="Buka Profil Saya & Foto Kartu Anggota"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden group-hover:ring-2 group-hover:ring-blue-400">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    user?.displayName?.charAt(0) || 'G'
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[140px] group-hover:text-blue-600">
                    {user?.displayName}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getRoleBadgeColor(
                        user?.role
                      )}`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                title="Keluar / Beralih ke Pengunjung"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Anggota</span>
            </button>
          )}
        </div>
      </div>
    </header>

      {/* Modal Tautan Akses PC Lain */}
      {showShareModal && (
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Tautan Akses Aplikasi di PC / Perangkat Lain"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Alamat Tautan Resmi (Shared URL)</span>
              </div>
              <p className="text-xs text-blue-800/90 leading-relaxed">
                Salin tautan ini untuk membuka aplikasi WEB MGMP PJOK SMP Kabupaten Purbalingga dari komputer/laptop lain atau smartphone tanpa perlu instalasi tambahan:
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-blue-200 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-800 select-all break-all font-semibold">
                  {sharedAppUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">Petunjuk Akses dari Komputer Lain:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>Buka browser (Google Chrome, Microsoft Edge, Mozilla Firefox) di PC lain.</li>
                <li>Tempelkan (Paste) tautan URL di atas ke kolom alamat web (address bar).</li>
                <li>Tekan tombol <strong>Enter</strong> pada keyboard.</li>
                <li>Seluruh data tersinkronisasi otomatis via Cloud Firestore.</li>
              </ol>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={sharedAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Tab Baru</span>
              </a>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Verifikasi Kata Sandi Super Admin */}
      {showSuperAdminModal && (
        <Modal
          isOpen={showSuperAdminModal}
          onClose={() => {
            setShowSuperAdminModal(false);
            setAdminPasswordInput('');
            setAdminPasswordError('');
          }}
          title="Verifikasi Proteksi Super Admin"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUnlockSuperAdminSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white space-y-2 border border-purple-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Wewenang Super Admin Terproteksi</h3>
                  <p className="text-[11px] text-purple-200">Keamanan Akses Tingkat Administrator Utama</p>
                </div>
              </div>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                Peran Super Admin memiliki hak akses mutlak untuk mengelola pengguna, menghapus data, dan melihat log audit sistem. Masukkan kata sandi Super Admin untuk membuka akses.
              </p>
            </div>

            {adminPasswordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{adminPasswordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi Super Admin:
              </label>
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Masukkan kata sandi..."
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (adminPasswordError) setAdminPasswordError('');
                  }}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuperAdminModal(false);
                  setAdminPasswordInput('');
                  setAdminPasswordError('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Buka Akses Super Admin</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
