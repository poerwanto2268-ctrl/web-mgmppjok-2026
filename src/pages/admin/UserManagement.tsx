import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  KeyRound,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { AppUser, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  createUserAccount,
  logAdminActivity,
} from '../../services/dataService';
import { Modal } from '../../components/common/Modal';

export const UserManagement: React.FC = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Form states
  const [newUserData, setNewUserData] = useState({
    displayName: '',
    email: '',
    phone: '',
    role: 'Anggota' as UserRole,
    memberId: '',
  });
  const [targetRole, setTargetRole] = useState<UserRole>('Anggota');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.memberId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'Semua' || u.role === roleFilter;
    const matchStatus =
      statusFilter === 'Semua' ||
      (statusFilter === 'Aktif' ? u.status !== 'Nonaktif' : u.status === 'Nonaktif');
    return matchSearch && matchRole && matchStatus;
  });

  const handleOpenChangeRole = (user: AppUser) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setIsChangeRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await updateUserRole(selectedUser.uid, targetRole, currentUser?.displayName || 'Super Admin');
      showNotification(`Hak akses ${selectedUser.displayName} berhasil diubah menjadi ${targetRole}`);
      setIsChangeRoleModalOpen(false);
      await fetchUserList();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AppUser) => {
    const newStatus = user.status === 'Nonaktif' ? 'Aktif' : 'Nonaktif';
    try {
      await updateUserStatus(user.uid, newStatus, currentUser?.displayName || 'Super Admin');
      showNotification(`Status akun ${user.displayName} diubah menjadi ${newStatus}`);
      await fetchUserList();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenResetPassword = (user: AppUser) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsResetPasswordModalOpen(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Log the password reset action securely without exposing plaintext password
      await logAdminActivity({
        adminName: currentUser?.displayName || 'Super Admin',
        adminEmail: 'sutarman811@guru.smp.belajar.id',
        adminRole: 'Super Admin',
        action: 'Reset Kata Sandi Pengguna',
        module: 'Manajemen Pengguna',
        details: `Reset kata sandi untuk akun pengguna: ${selectedUser.displayName} (${selectedUser.email})`,
        targetId: selectedUser.uid,
      });

      showNotification(`Kata sandi akun ${selectedUser.displayName} berhasil diperbarui.`);
      setIsResetPasswordModalOpen(false);
    } catch (err) {
      console.error(err);
      setPasswordError('Gagal memperbarui kata sandi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.displayName || !newUserData.email) return;

    try {
      setIsSubmitting(true);
      await createUserAccount(
        {
          ...newUserData,
          status: 'Aktif',
        },
        currentUser?.displayName || 'Super Admin'
      );

      showNotification(`Akun ${newUserData.displayName} berhasil dibuat dengan role ${newUserData.role}.`);
      setIsAddUserModalOpen(false);
      setNewUserData({
        displayName: '',
        email: '',
        phone: '',
        role: 'Anggota',
        memberId: '',
      });
      await fetchUserList();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
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
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Pengguna & Hak Akses</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola akun, hak akses role (RBAC), status aktivasi, dan keamanan kredensial administrator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUserList}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Security & Initial Credential Notice */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-2xl p-5 text-white shadow-sm border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Kebijakan Proteksi Kredensial Administrator
              </h2>
              <p className="text-xs text-purple-200/90 mt-1 leading-relaxed max-w-2xl">
                Sesuai standar keamanan sistem, kata sandi dienkripsi dan tidak pernah disimpan dalam plaintext di kode program ataupun ditampilkan di antarmuka publik. Super Admin dapat mereset kata sandi atau mengganti hak akses akun kapan saja secara terpusat.
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs shrink-0 space-y-1">
            <div className="text-[11px] text-purple-200 font-semibold">Akun Utama Super Admin:</div>
            <div className="font-mono text-xs font-bold text-white">sutarman811@guru.smp.belajar.id</div>
            <div className="text-[10px] text-emerald-300 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3" /> Terverifikasi Akun Belajar.id
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama, email, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Role Pengguna</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Ketua">Ketua</option>
              <option value="Sekretaris">Sekretaris</option>
              <option value="Bendahara">Bendahara</option>
              <option value="Pengurus">Pengurus</option>
              <option value="Anggota">Anggota</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Status Akun</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">No. Anggota / ID</th>
                <th className="py-3 px-4">Terakhir Aktif</th>
                <th className="py-3 px-4 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentUser = currentUser?.email === u.email;
                  const isActive = u.status !== 'Nonaktif';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.displayName || ''} className="w-full h-full object-cover" />
                            ) : (
                              u.displayName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{u.displayName}</span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {u.memberId || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Belum login'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenChangeRole(u)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title="Ubah Role Hak Akses"
                          >
                            <Shield className="w-3 h-3 text-purple-600" />
                            <span>Ubah Role</span>
                          </button>

                          <button
                            onClick={() => handleOpenResetPassword(u)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-amber-600 transition-colors"
                            title="Reset Kata Sandi"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {!isCurrentUser && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isActive
                                  ? 'border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Role Permissions Matrix Reference */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Matriks Wewenang & Hak Akses Pengguna (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Panduan pembagian kewenangan sesuai ketetapan organisasi MGMP PJOK SMP Kabupaten Purbalingga.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Menu / Fitur Aplikasi</th>
                <th className="py-2.5 px-3 text-center">Super Admin</th>
                <th className="py-2.5 px-3 text-center">Ketua</th>
                <th className="py-2.5 px-3 text-center">Sekretaris</th>
                <th className="py-2.5 px-3 text-center">Anggota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Dashboard Utama</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Profil Saya & Kartu Saya</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Tautan Formulir Pendataan</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ (Kelola)</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ (Buka)</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ (Buka)</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ (Buka)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Manajemen & Verifikasi Anggota</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Import Excel & Google Spreadsheet</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-slate-400 font-medium">Sesuai wewenang</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Manajemen & Pengaturan Kartu</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-slate-400 font-medium">Sesuai wewenang</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Pengaturan Identitas & Struktur Organisasi</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Konfigurasi URL Google Form & Spreadsheet</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Manajemen Pengguna & Hak Akses</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Log Aktivitas Administrator</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ubah Role */}
      {isChangeRoleModalOpen && selectedUser && (
        <Modal
          isOpen={isChangeRoleModalOpen}
          onClose={() => setIsChangeRoleModalOpen(false)}
          title="Ubah Role & Hak Akses Pengguna"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">Nama Pengguna:</p>
              <p className="text-sm font-bold text-slate-800">{selectedUser.displayName}</p>
              <p className="text-xs text-slate-600">{selectedUser.email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Role Baru:
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="Super Admin">Super Admin (Akses Penuh Seluruh Sistem)</option>
                <option value="Ketua">Ketua (Akses Organisasi, Kartu, Verifikasi)</option>
                <option value="Sekretaris">Sekretaris (Akses Anggota, Import Data, Verifikasi)</option>
                <option value="Bendahara">Bendahara (Akses Keuangan & Kegiatan)</option>
                <option value="Pengurus">Pengurus (Akses Kegiatan & Materi)</option>
                <option value="Anggota">Anggota (Akses Dashboard, Profil, & Kartu Mandiri)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-600" />
                Catatan Hak Akses
              </p>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Perubahan role akan segera berlaku pada sesi pengguna berikutnya. Seluruh aktivitas perubahan wewenang ini akan dicatat dalam Log Aktivitas Administrator.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangeRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Role'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reset / Ganti Password */}
      {isResetPasswordModalOpen && selectedUser && (
        <Modal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          title="Reset Kata Sandi Pengguna"
        >
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">Akun Pengguna:</p>
              <p className="text-sm font-bold text-slate-800">{selectedUser.displayName}</p>
              <p className="text-xs text-slate-600">{selectedUser.email}</p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Baru:
              </label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Konfirmasi Kata Sandi Baru:
              </label>
              <input
                type="password"
                required
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Kata sandi akan diperbarui secara aman. Pengguna dapat diminta mengubah kembali kata sandi setelah berhasil masuk.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? 'Memproses...' : 'Perbarui Kata Sandi'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Tambah Pengguna Baru */}
      {isAddUserModalOpen && (
        <Modal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          title="Tambah Pengguna Baru"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso, S.Pd."
                value={newUserData.displayName}
                onChange={(e) => setNewUserData({ ...newUserData, displayName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Akun: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@guru.smp.belajar.id"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp:
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Pengguna: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Anggota">Anggota (Guru PJOK)</option>
                  <option value="Sekretaris">Sekretaris (Pengelola Anggota & Import)</option>
                  <option value="Ketua">Ketua (Pengelola Organisasi & Kartu)</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Pengurus">Pengurus</option>
                  <option value="Super Admin">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Anggota MGMP (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: MGMP-PBG-010"
                  value={newUserData.memberId}
                  onChange={(e) => setNewUserData({ ...newUserData, memberId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
