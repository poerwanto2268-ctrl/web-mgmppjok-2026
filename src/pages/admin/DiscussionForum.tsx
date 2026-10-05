import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Send,
  Pin,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { Discussion, DiscussionComment } from '../../types';
import {
  createDiscussion,
  getComments,
  addComment,
} from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

interface DiscussionForumProps {
  discussions: Discussion[];
  onRefresh: () => void;
}

export const DiscussionForum: React.FC<DiscussionForumProps> = ({ discussions, onRefresh }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(discussions[0] || null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<any>('Diskusi Pembelajaran');
  const [newTopicContent, setNewTopicContent] = useState('');

  const categories = [
    'Diskusi Pembelajaran',
    'Asesmen PJOK',
    'Kurikulum',
    'Media Pembelajaran',
    'Praktik Baik',
    'Informasi Organisasi',
  ];

  useEffect(() => {
    if (activeDiscussion) {
      loadComments(activeDiscussion.id);
    }
  }, [activeDiscussion]);

  const loadComments = async (discId: string) => {
    setLoadingComments(true);
    const list = await getComments(discId);
    setComments(list);
    setLoadingComments(false);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !newTopicContent) return;

    await createDiscussion({
      title: newTopicTitle,
      category: newTopicCategory,
      content: newTopicContent,
      authorId: user?.uid || 'guest',
      authorName: user?.displayName || 'Guru PJOK',
      authorSchool: 'SMP di Purbalingga',
      repliesCount: 0,
      isPinned: false,
      isReported: false,
      createdAt: new Date().toISOString(),
    });

    setIsAddModalOpen(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    onRefresh();
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDiscussion || !newCommentText.trim()) return;

    await addComment(activeDiscussion.id, {
      discussionId: activeDiscussion.id,
      content: newCommentText.trim(),
      authorId: user?.uid || 'guest',
      authorName: user?.displayName || 'Guru PJOK',
      createdAt: new Date().toISOString(),
    });

    setNewCommentText('');
    loadComments(activeDiscussion.id);
    onRefresh();
  };

  const filtered = discussions.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || d.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Forum Diskusi Profesional Guru PJOK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ruang temu gagasan, tanya jawab implementasi Kurikulum Merdeka, dan pertukaran strategi mengajar.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Topik Diskusi Baru</span>
        </button>
      </div>

      {/* Main Forum Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Thread list & filters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari topik diskusi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Kategori Diskusi</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((d) => (
              <div
                key={d.id}
                onClick={() => setActiveDiscussion(d)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  activeDiscussion?.id === d.id
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {d.category}
                  </span>
                  {d.isPinned && (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Disematkan
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                  {d.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>{d.authorName}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    <strong>{d.repliesCount || 0}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Thread Detail & Responses */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[500px]">
          {activeDiscussion ? (
            <div className="space-y-6">
              {/* Thread header */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                  {activeDiscussion.category}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {activeDiscussion.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-700">{activeDiscussion.authorName}</span>
                  </div>
                  <span>•</span>
                  <span>{activeDiscussion.authorSchool}</span>
                </div>
              </div>

              {/* Thread Content */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {activeDiscussion.content}
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tanggapan Rekan Guru ({comments.length})
                </h4>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      Belum ada tanggapan. Jadilah yang pertama memberikan masukan atau solusi!
                    </p>
                  ) : (
                    comments.map((cm) => (
                      <div key={cm.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{cm.authorName}</span>
                          <span className="text-slate-400">
                            {new Date(cm.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{cm.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendComment} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tulis tanggapan atau praktik Anda..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Pilih salah satu topik diskusi di samping untuk melihat obrolan.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Buat Topik Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Topik Diskusi Baru"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Topik Diskusi *</label>
            <input
              type="text"
              required
              placeholder="contoh: Cara Mengatasi Siswa yang Enggan Bergerak Saat Pembelajaran Senam"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Diskusi</label>
            <select
              value={newTopicCategory}
              onChange={(e) => setNewTopicCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Isi Diskusi / Pertanyaan *</label>
            <textarea
              required
              rows={4}
              placeholder="Ceritakan latar belakang masalah, pengalaman di lapangan, atau hal yang ingin Anda diskusikan..."
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
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
              Publikasikan Topik
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
