import React, { useState } from 'react';
import { Calendar, User, Search, Pin } from 'lucide-react';
import { Announcement } from '../../types';

interface PublicNewsProps {
  announcements: Announcement[];
}

export const PublicNews: React.FC<PublicNewsProps> = ({ announcements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<Announcement | null>(null);

  const filtered = announcements.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Informasi & Publikasi
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Berita & Pengumuman Resmi</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Pusat informasi resmi kegiatan MGMP, surat edaran, dan berita seputar dunia olahraga pendidikan.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Cari pengumuman atau berita..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
        />
      </div>

      {/* Selected News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {selectedNews.category}
              </span>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕ Tutup
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {selectedNews.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedNews.publishedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{selectedNews.author}</span>
              </div>
            </div>
            {selectedNews.coverUrl && (
              <div className="rounded-xl overflow-hidden max-h-72 w-full bg-slate-100">
                <img
                  src={selectedNews.coverUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedNews.content}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {news.coverUrl && (
                <div className="h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={news.coverUrl}
                    alt={news.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600">{news.category}</span>
                  {news.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3" /> Disematkan
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {news.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">{news.publishedDate}</span>
              <button
                onClick={() => setSelectedNews(news)}
                className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Baca Lengkap →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
