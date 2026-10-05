import React, { useState } from 'react';
import { BookOpen, Search, Download, Filter, FileText, CheckCircle2, User } from 'lucide-react';
import { LearningResource, SportTopic, ResourceCategory } from '../../types';

interface PublicLearningResourcesProps {
  resources: LearningResource[];
}

export const PublicLearningResources: React.FC<PublicLearningResourcesProps> = ({ resources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedTopic, setSelectedTopic] = useState<string>('Semua');
  const [selectedGrade, setSelectedGrade] = useState<string>('Semua');

  const categories = [
    'Semua',
    'Capaian Pembelajaran (CP)',
    'Alur Tujuan Pembelajaran (ATP)',
    'Modul Ajar',
    'Rencana Pembelajaran Mendalam',
    'Asesmen Diagnostik',
    'Asesmen Formatif',
    'Asesmen Sumatif',
    'LKPD',
    'Rubrik Penilaian',
    'Bahan Presentasi',
    'Media Pembelajaran'
  ];

  const topics = [
    'Semua',
    'Permainan Bola Besar',
    'Permainan Bola Kecil',
    'Atletik',
    'Kebugaran Jasmani',
    'Senam',
    'Aktivitas Gerak Berirama',
    'Aktivitas Air',
    'Pendidikan Kesehatan',
    'Aktivitas Olahraga Tradisional',
    'Aktivitas Jasmani Lainnya'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Sumber Belajar Digital
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Bank Perangkat Pembelajaran PJOK SMP
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          Pusat berbagi modul ajar Kurikulum Merdeka Fase D, perangkat evaluasi, LKPD, bahan presentasi, dan materi ajar PJOK terstandar di Kabupaten Purbalingga.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Cari judul perangkat, materi ajar (voli, atletik, senam), atau nama pengunggah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Kategori Perangkat</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Materi Olahraga</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
            >
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
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Semua">Semua Kelas</option>
              <option value="Kelas VII">Kelas VII</option>
              <option value="Kelas VIII">Kelas VIII</option>
              <option value="Kelas IX">Kelas IX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Menampilkan <strong>{filtered.length}</strong> perangkat pembelajaran</span>
        <span>Kurikulum Merdeka • Fase D</span>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 truncate">
                  {item.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {item.grade}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Materi:</span>
                  <span className="font-semibold text-slate-700">{item.sportTopic}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pengunggah:</span>
                  <span className="truncate max-w-[170px]">{item.uploaderName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Ukuran: {item.fileSize}</span>
                  <span>v{item.version}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {item.downloadsCount}x diunduh
              </span>
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
