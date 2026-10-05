import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Filter,
  Printer,
  QrCode,
  Edit,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Activity, ActivityType, ActivityStatus, OrganizationSetting } from '../../types';
import { createActivity, updateActivity, deleteActivity } from '../../services/dataService';
import { printActivityInvitation } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

interface ActivityManagementProps {
  activities: Activity[];
  orgSettings: OrganizationSetting;
  onRefresh: () => void;
  onSelectActivityForAttendance?: (act: Activity) => void;
}

export const ActivityManagement: React.FC<ActivityManagementProps> = ({
  activities,
  orgSettings,
  onRefresh,
  onSelectActivityForAttendance,
}) => {
  const { canManageActivities, canDeleteData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Form State
  const initialForm = {
    title: '',
    type: 'Pertemuan Rutin' as ActivityType,
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 - 13:00 WIB',
    location: 'Aula SMP Negeri 1 Purbalingga',
    speaker: '',
    pic: 'Pengurus MGMP PJOK',
    quota: 80,
    status: 'Direncanakan' as ActivityStatus,
    qrCodeToken: `PBG-PJOK-${Date.now().toString().slice(-6)}`,
    allowPublicPresensi: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const filtered = activities.filter((act) => {
    const matchSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (act.speaker && act.speaker.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === 'Semua' || act.type === filterType;
    const matchStatus = filterStatus === 'Semua' || act.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      qrCodeToken: `PBG-PJOK-${Date.now().toString().slice(-6)}`,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    await createActivity(formData);
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleOpenEdit = (act: Activity) => {
    setSelectedActivity(act);
    setFormData({
      title: act.title,
      type: act.type,
      description: act.description,
      date: act.date,
      time: act.time,
      location: act.location,
      speaker: act.speaker || '',
      pic: act.pic || '',
      quota: act.quota || 80,
      status: act.status,
      qrCodeToken: act.qrCodeToken || `PBG-PJOK-${Date.now().toString().slice(-6)}`,
      allowPublicPresensi: act.allowPublicPresensi ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    await updateActivity(selectedActivity.id, formData);
    setIsEditModalOpen(false);
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;
    await deleteActivity(selectedActivity.id);
    setIsDeleteModalOpen(false);
    setSelectedActivity(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Agenda & Kegiatan MGMP</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Jadwal pertemuan rutin, bimtek, workshop modul ajar, dan koordinasi olahraga pelajar SMP.
          </p>
        </div>

        {canManageActivities && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Agenda Kegiatan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari judul kegiatan, lokasi, atau narasumber..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Kegiatan</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Jenis Kegiatan</option>
              <option value="Pertemuan Rutin">Pertemuan Rutin</option>
              <option value="Workshop">Workshop</option>
              <option value="IHT">IHT</option>
              <option value="Pelatihan">Pelatihan</option>
              <option value="Seminar">Seminar</option>
              <option value="Diseminasi">Diseminasi</option>
              <option value="Kegiatan Olahraga Bersama">Kegiatan Olahraga Bersama</option>
              <option value="Rapat Pengurus">Rapat Pengurus</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Kegiatan</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Direncanakan">Direncanakan</option>
              <option value="Pendaftaran">Pendaftaran</option>
              <option value="Berlangsung">Berlangsung</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {act.type}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    act.status === 'Berlangsung'
                      ? 'bg-emerald-100 text-emerald-800'
                      : act.status === 'Pendaftaran'
                      ? 'bg-blue-100 text-blue-800'
                      : act.status === 'Selesai'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {act.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{act.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {act.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-medium">{act.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{act.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{act.location}</span>
                </div>
                {act.speaker && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <strong>Narsum:</strong> {act.speaker}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectActivityForAttendance) onSelectActivityForAttendance(act);
                  }}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Buka Presensi QR & Rekap Hadir"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Presensi Digital QR</span>
                </button>

                <button
                  onClick={() => printActivityInvitation(act, orgSettings)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  title="Cetak Surat Undangan Resmi"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {canManageActivities && (
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                  <button
                    onClick={() => handleOpenEdit(act)}
                    className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  {canDeleteData && (
                    <button
                      onClick={() => {
                        setSelectedActivity(act);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-xs text-slate-400 hover:text-red-600 font-semibold flex items-center gap-1 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Tambah Kegiatan */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Agenda Kegiatan MGMP Baru"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Kegiatan *</label>
            <input
              type="text"
              required
              placeholder="contoh: Workshop Pembuatan Modul Ajar PJOK Fase D"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Kegiatan</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Pertemuan Rutin">Pertemuan Rutin</option>
                <option value="Workshop">Workshop</option>
                <option value="IHT">IHT</option>
                <option value="Pelatihan">Pelatihan</option>
                <option value="Seminar">Seminar</option>
                <option value="Diseminasi">Diseminasi</option>
                <option value="Kegiatan Olahraga Bersama">Kegiatan Olahraga Bersama</option>
                <option value="Rapat Pengurus">Rapat Pengurus</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Kegiatan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Direncanakan">Direncanakan</option>
                <option value="Pendaftaran">Pendaftaran</option>
                <option value="Berlangsung">Berlangsung</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu</label>
              <input
                type="text"
                placeholder="08:00 - 13:00 WIB"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tempat / Lokasi *</label>
            <input
              type="text"
              required
              placeholder="contoh: Aula SMP Negeri 1 Purbalingga"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Narasumber</label>
              <input
                type="text"
                placeholder="Dr. Wawan S., M.Pd."
                value={formData.speaker}
                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab / PIC</label>
              <input
                type="text"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Kegiatan</label>
            <textarea
              rows={3}
              placeholder="Rincian materi, persiapan peserta, dan agenda kegiatan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Simpan Kegiatan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Kegiatan */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Agenda Kegiatan"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Kegiatan *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Kegiatan</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Pertemuan Rutin">Pertemuan Rutin</option>
                <option value="Workshop">Workshop</option>
                <option value="IHT">IHT</option>
                <option value="Pelatihan">Pelatihan</option>
                <option value="Seminar">Seminar</option>
                <option value="Diseminasi">Diseminasi</option>
                <option value="Kegiatan Olahraga Bersama">Kegiatan Olahraga Bersama</option>
                <option value="Rapat Pengurus">Rapat Pengurus</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Kegiatan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Direncanakan">Direncanakan</option>
                <option value="Pendaftaran">Pendaftaran</option>
                <option value="Berlangsung">Berlangsung</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tempat / Lokasi *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Narasumber</label>
              <input
                type="text"
                value={formData.speaker}
                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PIC / Penanggung Jawab</label>
              <input
                type="text"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Kegiatan</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
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

      {/* MODAL: Hapus Kegiatan */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Agenda Kegiatan"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600">
            Hapus kegiatan <strong className="text-slate-900">{selectedActivity?.title}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
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
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
