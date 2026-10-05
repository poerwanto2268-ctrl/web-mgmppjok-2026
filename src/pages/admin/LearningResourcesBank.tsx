import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  User,
} from 'lucide-react';
import { LearningResource, ResourceCategory, SportTopic } from '../../types';
import {
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
} from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

interface LearningResourcesBankProps {
  resources: LearningResource[];
  onRefresh: () => void;
}

export const LearningResourcesBank: React.FC<LearningResourcesBankProps> = ({
  resources,
  onRefresh,
}) => {
  const { user, canManageSettings, canDeleteData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedTopic, setSelectedTopic] = useState('Semua');
  const [selectedGrade, setSelectedGrade] = useState('Semua');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const initialForm = {
    title: '',
    category: 'Modul Ajar' as ResourceCategory,
    phase: 'Fase D',
    grade: 'Kelas VII' as 'Kelas VII' | 'Kelas VIII' | 'Kelas IX' | 'Semua Kelas',
    curriculum: 'Kurikulum Merdeka' as 'Kurikulum Merdeka' | 'Kurikulum 2013',
    sportTopic: 'Permainan Bola Besar' as SportTopic,
    academicYear: '2024/2025 Genap',
    description: '',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/dokumen-pjok-purbalingga.pdf',
    fileName: 'Perangkat_Ajar_PJOK_Purbalingga.pdf',
    fileSize: '1.5 MB',
    uploaderId: user?.memberId || 'GURU-001',
    uploaderName: user?.displayName || 'Guru PJOK Purbalingga',
    approvalStatus: 'Disetujui' as 'Disetujui' | 'Menunggu' | 'Ditolak',
    version: '1.0',
    downloadsCount: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  const categories: ResourceCategory[] = [
    'Capaian Pembelajaran (CP)',
    'Alur Tujuan Pembelajaran (ATP)',
    'Modul Ajar',
    'Rencana Pembelajaran Mendalam',
    'Program Tahunan',
    'Program Semester',
    'Asesmen Diagnostik',
    'Asesmen Formatif',
    'Asesmen Sumatif',
    'LKPD',
    'Rubrik Penilaian',
    'Media Pembelajaran',
    'Bahan Presentasi',
  ];

  const topics: SportTopic[] = [
    'Permainan Bola Besar',
    'Permainan Bola Kecil',
    'Atletik',
    'Kebugaran Jasmani',
    'Senam',
    'Aktivitas Gerak Berirama',
    'Aktivitas Air',
    'Pendidikan Kesehatan',
    'Aktivitas Olahraga Tradisional',
    'Aktivitas Jasmani Lainnya',
  ];

  const filtered = resources.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uploaderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchTopic = selectedTopic === 'Semua' || item.sportTopic === selectedTopic;
    const matchGrade = selectedGrade === 'Semua' || item.grade === selectedGrade || item.grade === 'Semua Kelas';
    return matchSearch && matchCategory && matchTopic && matchGrade;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      uploaderId: user?.memberId || 'GURU-001',
      uploaderName: user?.displayName || 'Guru PJOK Purbalingga',
      approvalStatus: canManageSettings ? 'Disetujui' : 'Menunggu',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    await createLearningResource(formData);
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleStatusChange = async (id: string, newStatus: 'Disetujui' | 'Menunggu' | 'Ditolak') => {
    await updateLearningResource(id, { approvalStatus: newStatus });
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedResource) return;
    await deleteLearningResource(selectedResource.id);
    setIsDeleteModalOpen(false);
    setSelectedResource(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Bank Perangkat Pembelajaran PJOK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Repositori resmi Modul Ajar, ATP, Asesmen, LKPD, dan media ajar PJOK SMP Fase D.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Unggah Perangkat Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari judul perangkat, materi olahraga, atau pengunggah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Kategori Perangkat</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Materi PJOK</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Materi PJOK</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Kelas (Fase D)</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Kelas</option>
              <option value="Kelas VII">Kelas VII</option>
              <option value="Kelas VIII">Kelas VIII</option>
              <option value="Kelas IX">Kelas IX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 truncate">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    item.approvalStatus === 'Disetujui'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.approvalStatus === 'Menunggu'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {item.approvalStatus}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kelas / Fase:</span>
                  <span className="font-semibold text-slate-800">{item.grade} • {item.phase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Materi:</span>
                  <span className="font-semibold text-slate-800">{item.sportTopic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pengunggah:</span>
                  <span className="truncate max-w-[150px]">{item.uploaderName}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {item.downloadsCount}x diunduh • v{item.version}
                </span>

                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File</span>
                </a>
              </div>

              {canManageSettings && (
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {item.approvalStatus !== 'Disetujui' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'Disetujui')}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800"
                      >
                        Setujui
                      </button>
                    )}
                    {item.approvalStatus !== 'Ditolak' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'Ditolak')}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 ml-2"
                      >
                        Tolak
                      </button>
                    )}
                  </div>

                  {canDeleteData && (
                    <button
                      onClick={() => {
                        setSelectedResource(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Tambah Perangkat */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Unggah Perangkat Pembelajaran PJOK"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Perangkat Ajar *</label>
            <input
              type="text"
              required
              placeholder="contoh: Modul Ajar Atletik Lari Cepat Fase D Kelas VII"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Perangkat *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Materi PJOK *</label>
              <select
                value={formData.sportTopic}
                onChange={(e) => setFormData({ ...formData, sportTopic: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelas Target</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Kelas VII">Kelas VII</option>
                <option value="Kelas VIII">Kelas VIII</option>
                <option value="Kelas IX">Kelas IX</option>
                <option value="Semua Kelas">Semua Kelas</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kurikulum</label>
              <select
                value={formData.curriculum}
                onChange={(e) => setFormData({ ...formData, curriculum: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                <option value="Kurikulum 2013">Kurikulum 2013</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Versi Dokumen</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL Berkas Dokumen (PDF / PPT / Docs / Drive)</label>
            <input
              type="url"
              required
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat & Alur Perangkat</label>
            <textarea
              rows={3}
              placeholder="Jelaskan tujuan pembelajaran, integrasi Profil Pelajar Pancasila, dan diferensiasi..."
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
              Unggah Perangkat
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Hapus Perangkat */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Perangkat Pembelajaran"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600">
            Hapus perangkat <strong className="text-slate-900">{selectedResource?.title}</strong>?
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
