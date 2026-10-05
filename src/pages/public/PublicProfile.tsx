import React from 'react';
import { Target, Compass, Award, Shield, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { OrganizationSetting } from '../../types';

interface PublicProfileProps {
  orgSettings: OrganizationSetting;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ orgSettings }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Tentang Organisasi
        </span>
        <h1 className="font-sport text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Profil <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">{orgSettings.orgName}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          {orgSettings.tagline}
        </p>
      </div>

      {/* Identitas Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2 border-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Identitas Organisasi</span>
          </h3>
          <dl className="space-y-2.5 text-xs sm:text-sm">
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Nama Organisasi</dt>
              <dd className="col-span-2 font-semibold text-slate-800">{orgSettings.orgName}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Jenjang</dt>
              <dd className="col-span-2 font-semibold text-slate-800">{orgSettings.educationLevel}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Wilayah Kerja</dt>
              <dd className="col-span-2 font-semibold text-slate-800">{orgSettings.region}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Masa Bakti</dt>
              <dd className="col-span-2 font-semibold text-blue-600">{orgSettings.period}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Tahun Ajaran</dt>
              <dd className="col-span-2 font-semibold text-slate-800">{orgSettings.activeAcademicYear}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2 border-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Sekretariat & Kontak</span>
          </h3>
          <dl className="space-y-2.5 text-xs sm:text-sm">
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Alamat</dt>
              <dd className="col-span-2 font-medium text-slate-800">{orgSettings.secretariatAddress}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Email Resmi</dt>
              <dd className="col-span-2 font-medium text-blue-600">{orgSettings.email}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-slate-500 font-medium">Telepon / WA</dt>
              <dd className="col-span-2 font-medium text-slate-800">{orgSettings.contactPhone}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Visi Organisasi</h2>
          <p className="text-sm text-blue-100 leading-relaxed italic">
            "{orgSettings.vision}"
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Misi Organisasi</h2>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
            {orgSettings.mission}
          </div>
        </div>
      </div>
    </div>
  );
};
