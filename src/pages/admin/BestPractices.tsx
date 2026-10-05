import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Video,
  FileText,
  Image,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { BestPractice } from '../../types';
import { createBestPractice, deleteBestPractice } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

interface BestPracticesProps {
  practices: BestPractice[];
  onRefresh: () => void;
}

export const BestPractices: React.FC<BestPracticesProps> = ({ practices, onRefresh }) => {
  const { user, canManageSettings, canDeleteData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<BestPractice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const categories = [
    'Inovasi Pembelajaran',
    'Video Praktik Pembelajaran',
    'Modifikasi Permainan',
    'Media Pembelajaran',
    'Strategi Asesmen',
    'Refleksi Pembelajaran',
    'Best Practice',
  ];

  const initialForm = {
    title: '',
    authorName: user?.displayName || 'Guru PJOK Purbalingga',
    authorSchool: 'SMP di Purbalingga',
    category: 'Modifikasi Permainan' as any,
    description: '',
    mediaUrl: 'https://youtube.com',
    mediaType: 'Video' as 'Video' | 'Artikel' | 'Dokumen' | 'Gambar',
    publishedDate: new Date().toISOString().split('T')[0],
    status: 'Publik' as 'Publik' | 'Menunggu Moderasi' | 'Draf',
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      authorName: user?.displayName || 'Guru PJOK Purbalingga',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    await createBestPractice(formData);
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedPractice) return;
    await deleteBestPractice(selectedPractice.id);
    setIsDeleteModalOpen(false);
    setSelectedPractice(null);
    onRefresh();
  };

  const filtered = practices.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Inovasi & Praktik Baik Guru PJOK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Koleksi modifikasi alat, permainan olahraga kreatif, dan strategi asesmen autentik karya guru Purbalingga.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Bagikan Praktik Baik</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari inovasi pembelajaran, modifikasi alat, atau nama guru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="Semua">Semua Kategori Praktik Baik</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Grid of Practices */}
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
                  {item.mediaType === 'Video' ? (
                    <Video className="w-3 h-3 text-red-500" />
                  ) : item.mediaType === 'Artikel' ? (
                    <FileText className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Image className="w-3 h-3 text-emerald-500" />
                  )}
                  <span>{item.mediaType}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{item.authorName}</span>
                  <div className="text-[10px]">{item.authorSchool}</div>
                </div>
                <span>{item.publishedDate}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={item.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Buka Media / Tautan</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {canDeleteData && (
                <button
                  onClick={() => {
                    setSelectedPractice(item);
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

      {/* MODAL: Tambah Praktik Baik */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Bagikan Inovasi / Praktik Baik Pembelajaran"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Inovasi / Praktik Baik *</label>
            <input
              type="text"
              required
              placeholder="contoh: Modifikasi Gawang Kasti Menggunakan Pipa Paralon Daur Ulang"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Inovasi</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Jenis Media</label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Video">Video (YouTube / Drive)</option>
                <option value="Artikel">Artikel / Best Practice</option>
                <option value="Dokumen">Dokumen PDF</option>
                <option value="Gambar">Foto / Infografis</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tautan Media (URL YouTube / Dokumen)</label>
            <input
              type="url"
              required
              placeholder="https://..."
              value={formData.mediaUrl}
              onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Uraian Praktik Baik *</label>
            <textarea
              required
              rows={4}
              placeholder="Deskripsikan latar belakang, tantangan yang dihadapi, aksi modifikasi yang dilakukan, dan dampak terhadap keaktifan siswa..."
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
              Publikasikan Praktik Baik
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Hapus Praktik Baik */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Praktik Baik"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600">
            Hapus postingan praktik baik <strong className="text-slate-900">{selectedPractice?.title}</strong>?
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
