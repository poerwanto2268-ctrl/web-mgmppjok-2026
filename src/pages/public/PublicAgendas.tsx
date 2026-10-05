import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, QrCode } from 'lucide-react';
import { Activity } from '../../types';

interface PublicAgendasProps {
  activities: Activity[];
  onSelectActivity?: (act: Activity) => void;
  onNavigate: (view: string) => void;
}

export const PublicAgendas: React.FC<PublicAgendasProps> = ({
  activities,
  onSelectActivity,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');

  const filtered = activities.filter((act) => {
    const matchSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Semua' || act.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Kalender & Jadwal
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Agenda Kegiatan MGMP PJOK</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Informasi pertemuan rutin, workshop, IHT, bimbingan teknis, dan agenda olahraga pelajar.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari kegiatan, materi, atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="Semua">Semua Jenis Kegiatan</option>
          <option value="Pertemuan Rutin">Pertemuan Rutin</option>
          <option value="Workshop">Workshop</option>
          <option value="IHT">IHT</option>
          <option value="Pelatihan">Pelatihan</option>
          <option value="Kegiatan Olahraga Bersama">Kegiatan Olahraga Bersama</option>
          <option value="Rapat Pengurus">Rapat Pengurus</option>
        </select>
      </div>

      {/* Agendas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {act.type}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    act.status === 'Berlangsung'
                      ? 'bg-emerald-100 text-emerald-800'
                      : act.status === 'Pendaftaran'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {act.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{act.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {act.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{act.date}</span>
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
                    <strong>Narasumber:</strong> {act.speaker}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  if (onSelectActivity) onSelectActivity(act);
                  onNavigate('attendance');
                }}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Presensi Digital</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
