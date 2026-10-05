import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  CreditCard,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  School,
  MapPin,
  Calendar,
  History,
  Check,
  UserCheck,
  FileSpreadsheet,
  ShieldAlert,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Member, School as SchoolType, OrganizationSetting } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  createMember,
  updateMember,
  deleteMember,
  verifyAndApproveMember,
  rejectMember,
} from '../../services/dataService';
import {
  exportMembersToExcel,
  parseMembersFromExcel,
  printMemberCard,
  downloadMemberImportTemplate,
} from '../../services/exportService';
import { Modal } from '../../components/common/Modal';
import { MemberImportModal } from '../../components/admin/MemberImportModal';
import { ImportHistoryModal } from '../../components/admin/ImportHistoryModal';

interface MemberManagementProps {
  members: Member[];
  schools: SchoolType[];
  orgSettings: OrganizationSetting;
  onRefresh: () => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  members,
  schools,
  orgSettings,
  onRefresh,
}) => {
  const { canManageMembers, canDeleteData, canImportData, canVerifyMembers } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState('Semua');
  const [filterSubdistrict, setFilterSubdistrict] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportHistoryOpen, setIsImportHistoryOpen] = useState(false);

  // Active item
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Form state
  const initialFormData = {
    memberNumber: `MGMP-PBG-${String(members.length + 1).padStart(3, '0')}`,
    fullName: '',
    title: 'S.Pd.',
    nip: '',
    nuptk: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    birthPlace: 'Purbalingga',
    birthDate: '1985-01-01',
    schoolName: schools[0]?.name || 'SMP Negeri 1 Purbalingga',
    subdistrict: schools[0]?.subdistrict || 'Purbalingga',
    phone: '',
    email: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif' as Member['status'],
    joinedDate: new Date().toISOString().split('T')[0],
    notes: 'Guru PJOK SMP',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Purbalingga Subdistricts
  const subdistricts = [
    'Purbalingga', 'Kalimanah', 'Padamara', 'Kutasari', 'Bojongsari', 'Mrebet',
    'Bobotsari', 'Karangreja', 'Karangjambu', 'Karanganyar', 'Kertanegara',
    'Karangmoncol', 'Rembang', 'Pengadegan', 'Kejobong', 'Kaligondang', 'Bukateja', 'Kemangkon'
  ];

  // Filtering
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.nip && m.nip.includes(searchTerm)) ||
      (m.nuptk && m.nuptk.includes(searchTerm)) ||
      m.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSchool = filterSchool === 'Semua' || m.schoolName === filterSchool;
    const matchSubdistrict = filterSubdistrict === 'Semua' || m.subdistrict === filterSubdistrict;
    const matchStatus = filterStatus === 'Semua' || m.status === filterStatus;

    return matchSearch && matchSchool && matchSubdistrict && matchStatus;
  });

  // Duplicate verification helper
  const checkDuplicate = (nip?: string, nuptk?: string, email?: string, excludeId?: string) => {
    const found = members.find((m) => {
      if (excludeId && m.id === excludeId) return false;
      if (nip && m.nip && m.nip.trim() !== '' && m.nip.trim() === nip.trim()) return true;
      if (nuptk && m.nuptk && m.nuptk.trim() !== '' && m.nuptk.trim() === nuptk.trim()) return true;
      if (email && m.email && m.email.trim().toLowerCase() === email.trim().toLowerCase()) return true;
      return false;
    });
    return found;
  };

  const handleOpenAdd = () => {
    setFormData({
      ...initialFormData,
      memberNumber: `MGMP-PBG-${String(members.length + 1).padStart(3, '0')}`,
    });
    setDuplicateError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.schoolName) return;

    // Check duplicate
    const dup = checkDuplicate(formData.nip, formData.nuptk, formData.email);
    if (dup) {
      setDuplicateError(
        `Duplikasi terdeteksi! Anggota dengan NIP/NUPTK/Email ini sudah terdaftar: ${dup.fullName} (${dup.memberNumber})`
      );
      return;
    }

    await createMember(formData);
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleOpenEdit = (m: Member) => {
    setSelectedMember(m);
    setFormData({
      memberNumber: m.memberNumber,
      fullName: m.fullName,
      title: m.title || 'S.Pd.',
      nip: m.nip || '',
      nuptk: m.nuptk || '',
      gender: m.gender,
      birthPlace: m.birthPlace || 'Purbalingga',
      birthDate: m.birthDate || '1985-01-01',
      schoolName: m.schoolName,
      subdistrict: m.subdistrict,
      phone: m.phone,
      email: m.email,
      photoUrl: m.photoUrl || '',
      status: m.status,
      joinedDate: m.joinedDate,
      notes: m.notes || '',
    });
    setDuplicateError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const dup = checkDuplicate(formData.nip, formData.nuptk, formData.email, selectedMember.id);
    if (dup) {
      setDuplicateError(
        `Duplikasi terdeteksi! Anggota lain telah menggunakan NIP/NUPTK/Email ini: ${dup.fullName}`
      );
      return;
    }

    await updateMember(selectedMember.id, formData);
    setIsEditModalOpen(false);
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    await deleteMember(selectedMember.id);
    setIsDeleteModalOpen(false);
    setSelectedMember(null);
    onRefresh();
  };

  // Import handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Membaca berkas spreadsheet...');
      const imported = await parseMembersFromExcel(file);
      let countSuccess = 0;
      for (const item of imported) {
        if (item.fullName) {
          await createMember(item as any);
          countSuccess++;
        }
      }
      setImportStatus(`Berhasil mengimpor ${countSuccess} anggota baru.`);
      setTimeout(() => setImportStatus(null), 4000);
      onRefresh();
    } catch (err) {
      setImportStatus('Gagal membaca format file. Pastikan berformat .xlsx atau .csv');
    }
  };

  // Print all member list
  const handlePrintMemberList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daftar Anggota ${orgSettings.orgName}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; font-size: 11px; color: #1e293b; }
            h2, h3 { text-align: center; margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${orgSettings.orgName}</h2>
          <h3>DAFTAR ANGGOTA GURU PJOK SMP</h3>
          <p style="text-align: center; font-size: 10px; margin: 4px 0;">Wilayah: ${orgSettings.region} | Tahun Ajaran: ${orgSettings.activeAcademicYear}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>No. Anggota</th>
                <th>Nama Lengkap</th>
                <th>NIP</th>
                <th>Asal Sekolah</th>
                <th>Kecamatan</th>
                <th>WhatsApp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMembers
                .map(
                  (m, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${m.memberNumber}</td>
                  <td>${m.fullName}, ${m.title || ''}</td>
                  <td>${m.nip || '-'}</td>
                  <td>${m.schoolName}</td>
                  <td>${m.subdistrict}</td>
                  <td>${m.phone}</td>
                  <td>${m.status}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Anggota MGMP</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Database resmi guru PJOK SMP se-Kabupaten Purbalingga ({members.length} guru terdaftar)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageMembers && (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggota</span>
            </button>
          )}

          {canImportData && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Impor Anggota via Wizard (Excel / Google Spreadsheet)"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Impor Data (Wizard)</span>
              </button>

              <button
                onClick={() => setIsImportHistoryOpen(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Lihat Riwayat Log Impor Data"
              >
                <History className="w-3.5 h-3.5 text-slate-600" />
                <span>Riwayat Impor</span>
              </button>
            </>
          )}

          <button
            onClick={() => exportMembersToExcel(filteredMembers)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Ekspor Data ke File Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handlePrintMemberList}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Cetak Rekap Daftar Anggota"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center justify-between">
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama anggota, NIP, NUPTK, sekolah, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Sekolah</label>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Sekolah ({schools.length})</option>
              {schools.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Kecamatan</label>
            <select
              value={filterSubdistrict}
              onChange={(e) => setFilterSubdistrict(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Kecamatan (18)</option>
              {subdistricts.map((sub) => (
                <option key={sub} value={sub}>
                  Kec. {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Keanggotaan</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
              <option value="Mutasi">Mutasi</option>
              <option value="Pensiun">Pensiun</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Members */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Anggota</th>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Asal Sekolah</th>
                <th className="py-3 px-4">Kecamatan</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada data anggota yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                      {m.memberNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {m.fullName}, {m.title || ''}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        NIP: {m.nip || '-'} • NUPTK: {m.nuptk || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{m.schoolName}</td>
                    <td className="py-3 px-4 text-slate-600">{m.subdistrict}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{m.phone}</div>
                      <div className="text-[10px] text-slate-400">{m.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'Mutasi'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Detail Anggota"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => printMemberCard(m, orgSettings)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Cetak Kartu Anggota Digital"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        {canManageMembers && (
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Anggota"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {canDeleteData && (
                          <button
                            onClick={() => {
                              setSelectedMember(m);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Anggota"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Anggota */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Guru Anggota MGMP"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          {duplicateError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{duplicateError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Anggota *</label>
              <input
                type="text"
                required
                value={formData.memberNumber}
                onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap (tanpa gelar) *</label>
              <input
                type="text"
                required
                placeholder="contoh: Sutarman"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gelar Akademik</label>
              <input
                type="text"
                placeholder="S.Pd., M.Pd."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP (opsional)</label>
              <input
                type="text"
                placeholder="1980xxxx xxxxx x xxx"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NUPTK (opsional)</label>
              <input
                type="text"
                placeholder="16 digit NUPTK"
                value={formData.nuptk}
                onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah *</label>
              <select
                value={formData.schoolName}
                onChange={(e) => {
                  const sc = schools.find((s) => s.name === e.target.value);
                  setFormData({
                    ...formData,
                    schoolName: e.target.value,
                    subdistrict: sc ? sc.subdistrict : formData.subdistrict,
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
              <select
                value={formData.subdistrict}
                onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {subdistricts.map((sub) => (
                  <option key={sub} value={sub}>
                    Kec. {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="guru@guru.smp.belajar.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Keanggotaan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
                <option value="Mutasi">Mutasi</option>
                <option value="Pensiun">Pensiun</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL Foto Profil</label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan / Catatan</label>
            <input
              type="text"
              placeholder="contoh: Pengurus Bidang Kurikulum"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Simpan Anggota
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Anggota */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Data Guru Anggota"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          {duplicateError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{duplicateError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Anggota</label>
              <input
                type="text"
                readOnly
                value={formData.memberNumber}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gelar</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP</label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NUPTK</label>
              <input
                type="text"
                value={formData.nuptk}
                onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah</label>
              <select
                value={formData.schoolName}
                onChange={(e) => {
                  const sc = schools.find((s) => s.name === e.target.value);
                  setFormData({
                    ...formData,
                    schoolName: e.target.value,
                    subdistrict: sc ? sc.subdistrict : formData.subdistrict,
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
              <select
                value={formData.subdistrict}
                onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {subdistricts.map((sub) => (
                  <option key={sub} value={sub}>
                    Kec. {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Keanggotaan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
                <option value="Mutasi">Mutasi</option>
                <option value="Pensiun">Pensiun</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keterangan</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Detail Anggota */}
      {selectedMember && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Detail Anggota MGMP"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                <img
                  src={selectedMember.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={selectedMember.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  {selectedMember.memberNumber}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {selectedMember.fullName}, {selectedMember.title || ''}
                </h3>
                <p className="text-xs text-slate-500">{selectedMember.schoolName}</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-slate-400 font-medium">NIP</dt>
                <dd className="font-semibold text-slate-800">{selectedMember.nip || '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">NUPTK</dt>
                <dd className="font-semibold text-slate-800">{selectedMember.nuptk || '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Jenis Kelamin</dt>
                <dd className="font-semibold text-slate-800">{selectedMember.gender}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Tempat, Tanggal Lahir</dt>
                <dd className="font-semibold text-slate-800">
                  {selectedMember.birthPlace || 'Purbalingga'}, {selectedMember.birthDate || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Kecamatan</dt>
                <dd className="font-semibold text-slate-800">Kec. {selectedMember.subdistrict}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Status Keanggotaan</dt>
                <dd className="font-semibold text-emerald-600">{selectedMember.status}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">No. WhatsApp</dt>
                <dd className="font-semibold text-slate-800">{selectedMember.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Email</dt>
                <dd className="font-semibold text-blue-600">{selectedMember.email}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-400 font-medium">Keterangan / Catatan</dt>
                <dd className="text-slate-700">{selectedMember.notes || '-'}</dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => printMemberCard(selectedMember, orgSettings)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Cetak Kartu Anggota</span>
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Anggota"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus data anggota{' '}
            <strong className="text-slate-900">{selectedMember?.fullName}</strong> (
            {selectedMember?.memberNumber})?
          </p>
          <p className="text-red-600 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
            Tindakan ini tidak dapat dibatalkan. Riwayat presensi dan portofolio anggota akan tetap tersimpan di arsip.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Wizard Impor Data Anggota (Excel & Google Spreadsheet) */}
      {isImportModalOpen && (
        <MemberImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          existingMembers={members}
          schools={schools}
          onImportSuccess={() => {
            onRefresh();
            setImportStatus('Data anggota berhasil diimpor & diperbarui.');
            setTimeout(() => setImportStatus(null), 4000);
          }}
        />
      )}

      {/* MODAL: Riwayat Log Impor Data */}
      {isImportHistoryOpen && (
        <ImportHistoryModal
          isOpen={isImportHistoryOpen}
          onClose={() => setIsImportHistoryOpen(false)}
        />
      )}
    </div>
  );
};
