import React from 'react';
import { Dumbbell, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { OrganizationSetting } from '../../types';

interface PublicFooterProps {
  orgSettings: OrganizationSetting;
  onNavigate: (view: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ orgSettings, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sport font-extrabold text-base sm:text-lg text-white tracking-tight leading-tight">
                  MGMP PJOK SMP <span className="text-sky-400 font-black">PURBALINGGA</span>
                </h3>
                <p className="text-xs text-blue-400 font-semibold">{orgSettings.tagline}</p>
                <p className="text-[10px] text-cyan-300/80 font-normal mt-0.5">dev: Purwanto, S.Pd</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Wadah pembinaan keprofesian berkelanjutan bagi guru Pendidikan Jasmani, Olahraga,
              dan Kesehatan SMP di Kabupaten Purbalingga guna mewujudkan pembelajaran bermakna dan
              prestasi olahraga pelajar.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{orgSettings.secretariatAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{orgSettings.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{orgSettings.contactPhone}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Menu Publik
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('public-home')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('public-profile')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Profil & Visi Misi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('public-structure')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Struktur Organisasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('public-agendas')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Agenda Kegiatan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('public-news')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Berita & Pengumuman
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('public-resources')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Bank Sumber Belajar PJOK
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Link Terkait */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Kemitraan & Tautan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                  <span>Dinas Dikbud Kab. Purbalingga</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                  <span>KONI Kab. Purbalingga</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                  <span>Platform Merdeka Mengajar (PMM)</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                  <span>BGP Provinsi Jawa Tengah</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                  <span>Puspresnas (O2SN SMP)</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {orgSettings.orgName}. Seluruh Hak Cipta Dilindungi.</p>
          <p className="mt-2 sm:mt-0">
            Masa Bakti: <span className="text-slate-400 font-semibold">{orgSettings.period}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
