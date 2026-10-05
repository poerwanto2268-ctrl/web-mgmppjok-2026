import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  FileText,
  Lock,
  Globe,
  Users,
} from 'lucide-react';
import { OrgDocument, DocumentCategory } from '../../types';
import { createOrgDocument, deleteOrgDocument } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

interface DocumentArchiveProps {
  documents: OrgDocument[];
  onRefresh: () => void;
}

export const DocumentArchive: React.FC<DocumentArchiveProps> = ({ documents, onRefresh }) => {
  const { user, canManageMembers, canDeleteData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedYear, setSelectedYear] = useState('Semua');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<OrgDocument | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const initialForm = {
    title: '',
    category: 'Administrasi MGMP' as DocumentCategory,
    year: '2025',
    description: '',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/dokumen-resmi-mgmp.pdf',
    fileName: 'Dokumen_Resmi_MGMP_PJOK.pdf',
    fileSize: '1.2 MB',
    accessLevel: 'Publik' as 'Publik' | 'Anggota' | 'Pengurus',
    uploadedBy: user?.displayName || 'Sekretariat MGMP',
  };

  const [formData, setFormData] = useState(initialForm);

  const categories: DocumentCategory[] = [
    'Administrasi MGMP',
    'Surat Masuk',
    'Surat Keluar',
    'Undangan',
    'Notulen Rapat',
    'Proposal',
    'Laporan Kegiatan',
    'Dokumentasi',
    'Dokumen Kurikulum',
    'Dokumen Lainnya',
  ];

  const filtered = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || doc.category === selectedCategory;
    const matchYear = selectedYear === 'Semua' || doc.year === selectedYear;
    return matchSearch && matchCategory && matchYear;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      uploadedBy: user?.displayName || 'Sekretariat MGMP',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    await createOrgDocument(formData);
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    await deleteOrgDocument(selectedDoc.id);
    setIsDeleteModalOpen(false);
    setSelectedDoc(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Bank Dokumen & Arsip Organisasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pusat arsip SK, surat keluar/masuk, notulen rapat pleno, proposal, dan laporan kegiatan resmi MGMP.
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Dokumen Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari judul dokumen, perihal, atau isi notulen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Kategori Dokumen</label>
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
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Tahun Arsip</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {item.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  {item.accessLevel === 'Publik' ? (
                    <Globe className="w-3 h-3 text-emerald-500" />
                  ) : item.accessLevel === 'Pengurus' ? (
                    <Lock className="w-3 h-3 text-red-500" />
                  ) : (
                    <Users className="w-3 h-3 text-blue-500" />
                  )}
                  <span>{item.accessLevel}</span>
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
                  <span className="text-slate-400">Tahun:</span>
                  <span className="font-semibold text-slate-700">{item.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Diunggah oleh:</span>
                  <span className="truncate max-w-[150px]">{item.uploadedBy}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ukuran: {item.fileSize}</span>
                  <span>{item.fileName}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </a>

              {canDeleteData && (
                <button
                  onClick={() => {
                    setSelectedDoc(item);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Tambah Dokumen */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Unggah Dokumen Arsip Organisasi"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama / Perihal Dokumen *</label>
            <input
              type="text"
              required
              placeholder="contoh: SK Penetapan Tim Pengembang Kurikulum PJOK 2025"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Dokumen</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Tahun Dokumen</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hak Akses</label>
              <select
                value={formData.accessLevel}
                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Publik">Publik</option>
                <option value="Anggota">Anggota</option>
                <option value="Pengurus">Pengurus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL Berkas Dokumen (PDF)</label>
            <input
              type="url"
              required
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Ringkas</label>
            <textarea
              rows={3}
              placeholder="Catatan nomor surat, tanggal pengesahan, dan rincian dokumen..."
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
              Simpan Dokumen
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Hapus Dokumen */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Dokumen Arsip"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600">
            Hapus dokumen <strong className="text-slate-900">{selectedDoc?.title}</strong>?
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
