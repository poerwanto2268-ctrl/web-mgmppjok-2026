import React from 'react';
import { UserCheck, Shield, Award, Building, School } from 'lucide-react';
import { OrgStructure, OrganizationSetting } from '../../types';

interface PublicStructureProps {
  structure: OrgStructure;
  orgSettings: OrganizationSetting;
}

export const PublicStructure: React.FC<PublicStructureProps> = ({ structure, orgSettings }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Bagan Kepengurusan
        </span>
        <h1 className="font-sport text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Struktur Pengurus <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">{orgSettings.orgName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Surat Keputusan: <strong className="text-slate-700">{structure.skNumber}</strong> | Periode: <strong className="text-blue-600">{structure.period}</strong>
        </p>
      </div>

      {/* Pembina Box */}
      <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-2xl p-6 text-center shadow-md space-y-2 border border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
          Pelindung & Pembina
        </span>
        <h3 className="text-base sm:text-lg font-bold text-white">{structure.advisor}</h3>
        <p className="text-xs text-slate-300">Dinas Pendidikan dan Kebudayaan Kabupaten Purbalingga</p>
      </div>

      {/* Pimpinan Utama */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {/* Ketua */}
          <div className="bg-white rounded-xl p-5 border-2 border-blue-500/80 shadow-md text-center space-y-3">
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              {structure.leader.position}
            </span>
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 overflow-hidden border-2 border-blue-500 shadow-xs">
              <img
                src={structure.leader.photo || orgSettings.welcomeLeaderPhoto}
                alt={structure.leader.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{structure.leader.name}</h4>
              <p className="text-xs text-slate-500">{structure.leader.school}</p>
              {structure.leader.nip && (
                <p className="text-[10px] text-slate-400 mt-0.5">NIP: {structure.leader.nip}</p>
              )}
            </div>
          </div>

          {/* Wakil Ketua */}
          {structure.viceLeader && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
              <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {structure.viceLeader.position}
              </span>
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
                {structure.viceLeader.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{structure.viceLeader.name}</h4>
                <p className="text-xs text-slate-500">{structure.viceLeader.school}</p>
                {structure.viceLeader.nip && (
                  <p className="text-[10px] text-slate-400 mt-0.5">NIP: {structure.viceLeader.nip}</p>
                )}
              </div>
            </div>
          )}

          {/* Sekretaris */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              {structure.secretary.position}
            </span>
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
              {structure.secretary.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{structure.secretary.name}</h4>
              <p className="text-xs text-slate-500">{structure.secretary.school}</p>
              {structure.secretary.nip && (
                <p className="text-[10px] text-slate-400 mt-0.5">NIP: {structure.secretary.nip}</p>
              )}
            </div>
          </div>

          {/* Bendahara */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              {structure.treasurer.position}
            </span>
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
              {structure.treasurer.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{structure.treasurer.name}</h4>
              <p className="text-xs text-slate-500">{structure.treasurer.school}</p>
              {structure.treasurer.nip && (
                <p className="text-[10px] text-slate-400 mt-0.5">NIP: {structure.treasurer.nip}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bidang-Bidang */}
      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-bold text-slate-900 text-center">
          Koordinator & Bidang Kerja
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {structure.divisions.map((div, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Bidang Organisasi
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{div.name}</h4>
              </div>

              {/* Koordinator */}
              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 space-y-1">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Koordinator:</div>
                <div className="text-xs font-bold text-slate-900">{div.coordinator.name}</div>
                <div className="text-[11px] text-slate-600">{div.coordinator.school}</div>
                {div.coordinator.nip && (
                  <div className="text-[10px] text-slate-400">NIP: {div.coordinator.nip}</div>
                )}
              </div>

              {/* Anggota */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Anggota Bidang:
                </div>
                <div className="space-y-1.5">
                  {div.members.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="text-xs flex items-center justify-between py-1 border-b border-slate-50 last:border-0"
                    >
                      <span className="font-semibold text-slate-800">{m.name}</span>
                      <span className="text-[11px] text-slate-500">{m.school}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
