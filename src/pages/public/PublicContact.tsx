import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { OrganizationSetting } from '../../types';

interface PublicContactProps {
  orgSettings: OrganizationSetting;
}

export const PublicContact: React.FC<PublicContactProps> = ({ orgSettings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setSchool('');
      setSubject('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Hubungi Kami
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Sekretariat {orgSettings.orgName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Punya pertanyaan seputar keanggotaan, agenda MGMP, atau kerjasama pembinaan olahraga? Silakan hubungi kami.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Alamat Sekretariat
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {orgSettings.secretariatAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Email Resmi
                </h4>
                <p className="text-xs text-blue-600 mt-1 font-medium">{orgSettings.email}</p>
                <p className="text-[11px] text-slate-400">Respon dalam 1x24 jam kerja</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Kontak WhatsApp
                </h4>
                <p className="text-xs text-slate-800 mt-1 font-semibold">
                  {orgSettings.contactPhone}
                </p>
                <p className="text-[11px] text-slate-400">Sekretaris / Pengurus MGMP</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Jam Layanan Informasi
                </h4>
                <p className="text-xs text-slate-700 mt-1">
                  Senin - Jumat: 08.00 - 15.30 WIB
                </p>
                <p className="text-[11px] text-slate-400">Sabtu & Minggu: Libur / Kegiatan Lapangan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Kirim Pesan / Pengaduan</h3>
            <p className="text-xs text-slate-500">
              Pengurus MGMP akan segera menindaklanjuti pesan Anda.
            </p>
          </div>

          {sent && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pesan Anda telah berhasil terkirim kepada sekretariat pengurus MGMP PJOK!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Bpk/Ibu Guru..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Aktif
                </label>
                <input
                  type="email"
                  placeholder="guru@guru.smp.belajar.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal Sekolah / Instansi
                </label>
                <input
                  type="text"
                  placeholder="contoh: SMPN 1 Purbalingga"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topik / Perihal
                </label>
                <input
                  type="text"
                  placeholder="contoh: Pertanyaan Registrasi Workshop"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Isi Pesan *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan pesan, pertanyaan, atau masukan Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirimkan Pesan Sekarang</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
