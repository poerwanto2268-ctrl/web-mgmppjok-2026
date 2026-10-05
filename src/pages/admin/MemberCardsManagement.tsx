import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Printer,
  Download,
  Eye,
  Settings,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  QrCode,
  RotateCw,
} from 'lucide-react';
import { Member, MemberCardSettings, OrganizationSetting, School } from '../../types';
import { MemberCardPreview } from '../../components/card/MemberCardPreview';
import { PrintCardContainer } from '../../components/card/PrintCardContainer';
import { Modal } from '../../components/common/Modal';

interface MemberCardsManagementProps {
  members: Member[];
  schools: School[];
  cardSettings: MemberCardSettings;
  orgSettings: OrganizationSetting;
  onNavigateToSettings: () => void;
}

export const MemberCardsManagement: React.FC<MemberCardsManagementProps> = ({
  members,
  schools,
  cardSettings,
  orgSettings,
  onNavigateToSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Preview Modal
  const [previewMember, setPreviewMember] = useState<Member | null>(null);
  const [previewSide, setPreviewSide] = useState<'both' | 'front' | 'back' | 'flip'>('both');

  // Print Dialog
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMember, setPrintMember] = useState<Member | null>(null);
  const [printOption, setPrintOption] = useState<'front' | 'back' | 'both'>('both');
  const [printTheme, setPrintTheme] = useState<'dark' | 'light'>('dark');

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSchool = selectedSchool === 'ALL' || m.schoolName === selectedSchool;
      const matchStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

      return matchSearch && matchSchool && matchStatus;
    });
  }, [members, searchTerm, selectedSchool, selectedStatus]);

  // Statistics
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Aktif').length;
  const inactiveMembers = members.filter((m) => m.status !== 'Aktif').length;

  const handleOpenPreview = (member: Member) => {
    setPreviewMember(member);
    setPreviewSide('both');
  };

  const handleOpenPrint = (member: Member, option: 'front' | 'back' | 'both' = 'both') => {
    setPrintMember(member);
    setPrintOption(option);
    setIsPrintModalOpen(true);
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pusat Kendali Administrasi Kartu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sport">
              Manajemen Kartu Anggota MGMP
            </h1>
            <p className="text-sm text-blue-200/90 max-w-xl">
              Kelola, pantau, terbitkan, dan cetak Kartu Tanda Anggota (KTA) seluruh guru PJOK SMP se-Kabupaten Purbalingga secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToSettings}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Kartu & Tanda Tangan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Anggota Terdaftar</div>
            <div className="text-2xl font-black text-slate-900">{totalMembers}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Guru PJOK Terdata</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Kartu Status Aktif</div>
            <div className="text-2xl font-black text-emerald-600">{activeMembers}</div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">Dapat Dicetak Resmi</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Non-Aktif / Mutasi</div>
            <div className="text-2xl font-black text-amber-600">{inactiveMembers}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Akses Kartu Ditahan</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama guru, No. Anggota, atau sekolah..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter School */}
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Sekolah</option>
              {schools.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
              <option value="Mutasi">Mutasi</option>
              <option value="Pensiun">Pensiun</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
                }`}
              >
                Tabel
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
                }`}
              >
                Grid Kartu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Display: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">No. Anggota</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Sekolah / Unit Kerja</th>
                  <th className="py-3 px-4">Wilayah</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Kartu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada data anggota yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isMemberActive = member.status === 'Aktif';
                    return (
                      <tr key={member.id || member.memberNumber} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {member.memberNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {member.fullName}
                            {member.title ? `, ${member.title}` : ''}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            NIP: {member.nip || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {member.schoolName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {member.subdistrict}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isMemberActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenPreview(member)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-all"
                              title="Lihat Preview Kartu"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat</span>
                            </button>

                            <button
                              onClick={() => handleOpenPrint(member, 'both')}
                              disabled={!isMemberActive}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-all"
                              title="Cetak Kartu"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const isMemberActive = member.status === 'Aktif';
            return (
              <div
                key={member.id || member.memberNumber}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {member.memberNumber}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {member.fullName}
                      {member.title ? `, ${member.title}` : ''}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{member.schoolName}</p>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isMemberActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Scaled Mini Preview */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <MemberCardPreview
                    member={member}
                    cardSettings={cardSettings}
                    orgSettings={orgSettings}
                    side="front"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <button
                    onClick={() => handleOpenPreview(member)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail Kartu</span>
                  </button>
                  <button
                    onClick={() => handleOpenPrint(member, 'both')}
                    disabled={!isMemberActive}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewMember && (
        <Modal
          isOpen={!!previewMember}
          onClose={() => setPreviewMember(null)}
          title={`Kartu Anggota: ${previewMember.fullName}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* View Selector Tabs in Modal */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewSide('both')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    previewSide === 'both' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Dua Sisi (Berdampingan)
                </button>
                <button
                  onClick={() => setPreviewSide('front')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    previewSide === 'front' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Sisi Depan
                </button>
                <button
                  onClick={() => setPreviewSide('back')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    previewSide === 'back' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Sisi Belakang
                </button>
                <button
                  onClick={() => setPreviewSide('flip')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                    previewSide === 'flip' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Flip 3D</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Status: <strong className="text-slate-800">{previewMember.status}</strong>
              </div>
            </div>

            {/* Preview Component */}
            <div className="bg-slate-100/70 p-4 sm:p-6 rounded-3xl border border-slate-200">
              {previewSide === 'flip' ? (
                <div className="max-w-lg mx-auto">
                  <MemberCardPreview
                    member={previewMember}
                    cardSettings={cardSettings}
                    orgSettings={orgSettings}
                    interactiveFlip={true}
                  />
                </div>
              ) : (
                <MemberCardPreview
                  member={previewMember}
                  cardSettings={cardSettings}
                  orgSettings={orgSettings}
                  side={previewSide}
                />
              )}
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Penerbit: {cardSettings.leaderName}, {cardSettings.leaderTitle} ({cardSettings.period})
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMember(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const m = previewMember;
                    setPreviewMember(null);
                    handleOpenPrint(m, 'both');
                  }}
                  disabled={previewMember.status !== 'Aktif'}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Kartu Ini</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* PRINT MODAL DIALOG */}
      {printMember && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Cetak Kartu: ${printMember.fullName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="space-y-4 print:hidden">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Pilih Sisi Pencetakan:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrintOption('both')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      printOption === 'both'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block">Dua Sisi (CR80)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintOption('front')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      printOption === 'front'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <Eye className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block">Sisi Depan Saja</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintOption('back')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      printOption === 'back'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <Eye className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                    <span className="text-xs block">Sisi Belakang Saja</span>
                  </button>
                </div>
              </div>

              {/* Pilihan Gaya Warna Kartu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Pilihan Warna / Latar Kartu:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrintTheme('dark')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      printTheme === 'dark'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                      Navy
                    </div>
                    <div>
                      <div className="text-xs font-bold">Warna Standar (Navy)</div>
                      <div className="text-[10px] text-slate-500">Desain modern biru gelap</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintTheme('light')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      printTheme === 'light'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border-2 border-blue-600 shrink-0 flex items-center justify-center text-blue-700 text-[10px] font-bold">
                      Putih
                    </div>
                    <div>
                      <div className="text-xs font-bold">Putih Bersih (Hemat Tinta)</div>
                      <div className="text-[10px] text-slate-500">Latar putih ramah printer</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Printable Preview Area */}
            <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 overflow-hidden flex flex-col items-center justify-center print:bg-transparent print:border-none print:p-0 print:m-0">
              <div id="print-modal-card-target" className="print-modal-card-target printable-card-area w-full max-w-md print:max-w-none print:w-auto">
                <MemberCardPreview
                  member={printMember}
                  cardSettings={cardSettings}
                  orgSettings={orgSettings}
                  side={printOption}
                  cardTheme={printTheme}
                  isPrintVersion={true}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeBrowserPrint}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Buka Dialog Cetak Browser</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DEDICATED PRINT-ONLY CONTAINER DIRECTLY IN BODY */}
      {isPrintModalOpen && printMember && (
        <PrintCardContainer
          member={printMember}
          cardSettings={cardSettings}
          orgSettings={orgSettings}
          side={printOption}
          cardTheme={printTheme}
        />
      )}
    </div>
  );
};
