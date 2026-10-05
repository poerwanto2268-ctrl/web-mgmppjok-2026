import React, { useState } from 'react';
import {
  Dumbbell,
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  Shield,
  ChevronDown,
  UserCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OrganizationSetting, UserRole } from '../../types';
import { Modal } from '../common/Modal';

interface PublicNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  orgSettings: OrganizationSetting;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentView,
  onNavigate,
  orgSettings,
}) => {
  const {
    user,
    loginWithGoogle,
    setSimulationRole,
    isSuperAdminUnlocked,
    unlockSuperAdmin,
    lockSuperAdmin,
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Super Admin password protection modal
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const handleSelectRole = (r: UserRole) => {
    if (r === 'Super Admin') {
      if (!isSuperAdminUnlocked) {
        setShowRoleMenu(false);
        setMobileMenuOpen(false);
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

  const navLinks = [
    { id: 'public-home', label: 'Beranda' },
    { id: 'public-profile', label: 'Profil' },
    { id: 'public-structure', label: 'Struktur Organisasi' },
    { id: 'public-agendas', label: 'Agenda & Kegiatan' },
    { id: 'public-news', label: 'Berita' },
    { id: 'public-resources', label: 'Sumber Belajar PJOK' },
    { id: 'public-contact', label: 'Kontak' },
  ];

  const roles: UserRole[] = [
    'Super Admin',
    'Ketua',
    'Sekretaris',
    'Bendahara',
    'Pengurus',
    'Anggota',
    'Pengunjung',
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('public-home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sport font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
                MGMP PJOK SMP <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">PURBALINGGA</span>
              </div>
              <div className="text-[11px] text-blue-600 font-semibold tracking-wide">
                {orgSettings.tagline}
              </div>
              <div className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                dev: Purwanto, S.Pd
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === link.id
                    ? 'text-blue-700 bg-blue-50/80'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Simulation role switch */}
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Peran: <strong className="text-blue-700">{user?.role}</strong></span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {user?.role === 'Super Admin' && isSuperAdminUnlocked && (
                  <button
                    onClick={lockSuperAdmin}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center gap-1 cursor-pointer"
                    title="Kunci Akses Super Admin"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kunci</span>
                  </button>
                )}
              </div>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulasi Akses
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleSelectRole(r)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        user?.role === r ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-600'
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
              )}
            </div>

            {user?.role !== 'Pengunjung' ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Masuk Dashboard</span>
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Anggota</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentView === link.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user?.role !== 'Pengunjung' ? (
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Buka Dashboard ({user?.role})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  loginWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Anggota</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>

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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white space-y-2 border border-purple-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Wewenang Super Admin Terproteksi</h3>
                <p className="text-[11px] text-purple-300">Keamanan Akses Administrator Utama</p>
              </div>
            </div>
            <p className="text-xs text-purple-100/90 leading-relaxed pt-1">
              Peran Super Admin memiliki wewenang penuh organisasi dan sistem. Masukkan kata sandi Super Admin untuk membuka akses.
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
                placeholder="Ketik kata sandi..."
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
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
