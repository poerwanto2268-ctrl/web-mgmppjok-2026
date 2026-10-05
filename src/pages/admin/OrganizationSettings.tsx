import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  CheckCircle,
  RefreshCw,
  Plus,
  Trash2,
  UserCheck,
  Shield,
  Layers,
  ClipboardList,
  ExternalLink,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
} from 'lucide-react';
import { OrganizationSetting, OrgStructure, MemberRegistrationConfig } from '../../types';
import {
  updateOrganizationSettings,
  updateOrgStructure,
  updateRegistrationConfig,
  DEFAULT_REGISTRATION_CONFIG,
  getRegistrationConfig,
} from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

interface OrganizationSettingsProps {
  orgSettings: OrganizationSetting;
  structure: OrgStructure;
  regConfig?: MemberRegistrationConfig;
  onRefresh: () => void;
}

export const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({
  orgSettings,
  structure,
  regConfig,
  onRefresh,
}) => {
  const { canManageSettings, canEditGoogleFormSettings } = useAuth();
  const canEditRegistration = canEditGoogleFormSettings;

  const [activeTab, setActiveTab] = useState<'identity' | 'structure' | 'registration'>('identity');
  const [settingsForm, setSettingsForm] = useState<OrganizationSetting>({ ...orgSettings });
  const [structureForm, setStructureForm] = useState<OrgStructure>({ ...structure });
  const [regForm, setRegForm] = useState<MemberRegistrationConfig>(regConfig || DEFAULT_REGISTRATION_CONFIG);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    if (regConfig) {
      setRegForm(regConfig);
    } else {
      getRegistrationConfig().then((cfg) => setRegForm(cfg));
    }
  }, [regConfig]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateOrganizationSettings(settingsForm);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefresh();
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateOrgStructure(structureForm);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefresh();
  };

  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    const cleanUrl = regForm.googleFormUrl?.trim() || '';
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setRegError('Tautan Google Formulir harus diawali dengan https:// atau http://');
      return;
    }

    setSaving(true);
    try {
      await updateRegistrationConfig({
        ...regForm,
        googleFormUrl: cleanUrl,
        spreadsheetUrl: regForm.spreadsheetUrl?.trim() || '',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin / Pengurus MGMP',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to update registration config:', err);
      setRegError(err.message || 'Gagal menyimpan pengaturan pendataan anggota.');
    } finally {
      setSaving(false);
    }
  };

  const addDivisionMember = (divIdx: number) => {
    const updated = { ...structureForm };
    updated.divisions[divIdx].members.push({
      position: 'Anggota',
      name: 'Nama Guru Anggota',
      school: 'SMP di Purbalingga',
    });
    setStructureForm(updated);
  };

  const removeDivisionMember = (divIdx: number, mIdx: number) => {
    const updated = { ...structureForm };
    updated.divisions[divIdx].members.splice(mIdx, 1);
    setStructureForm(updated);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pengaturan Organisasi & Struktur</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola identitas resmi, tahun ajaran aktif, wilayah kerja, dan bagan kepengurusan tanpa mengubah kode program.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan ke database!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('identity')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'identity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identitas & Visi Misi</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'structure'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bagan Struktur Pengurus (SK)</span>
        </button>

        <button
          onClick={() => setActiveTab('registration')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'registration'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Pendataan Anggota (Google Form)</span>
        </button>
      </div>

      {/* TAB 1: IDENTITAS */}
      {activeTab === 'identity' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Organisasi *</label>
              <input
                type="text"
                required
                value={settingsForm.orgName}
                onChange={(e) => setSettingsForm({ ...settingsForm, orgName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline Slogan *</label>
              <input
                type="text"
                required
                value={settingsForm.tagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenjang Pendidikan *</label>
              <input
                type="text"
                required
                value={settingsForm.educationLevel}
                onChange={(e) => setSettingsForm({ ...settingsForm, educationLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Wilayah Kerja *</label>
              <input
                type="text"
                required
                value={settingsForm.region}
                onChange={(e) => setSettingsForm({ ...settingsForm, region: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Periode Kepengurusan *</label>
              <input
                type="text"
                required
                value={settingsForm.period}
                onChange={(e) => setSettingsForm({ ...settingsForm, period: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran Aktif *</label>
              <input
                type="text"
                required
                value={settingsForm.activeAcademicYear}
                onChange={(e) => setSettingsForm({ ...settingsForm, activeAcademicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={settingsForm.email}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Kontak / WhatsApp</label>
              <input
                type="text"
                value={settingsForm.contactPhone}
                onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap Sekretariat</label>
            <input
              type="text"
              value={settingsForm.secretariatAddress}
              onChange={(e) => setSettingsForm({ ...settingsForm, secretariatAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Visi Organisasi</label>
              <textarea
                rows={3}
                value={settingsForm.vision}
                onChange={(e) => setSettingsForm({ ...settingsForm, vision: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Misi Organisasi</label>
              <textarea
                rows={3}
                value={settingsForm.mission}
                onChange={(e) => setSettingsForm({ ...settingsForm, mission: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          {/* Sambutan Ketua */}
          <div className="border-t border-slate-100 pt-4 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Informasi Sambutan Ketua MGMP</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ketua</label>
                <input
                  type="text"
                  value={settingsForm.welcomeLeaderName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, welcomeLeaderName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan Ketua</label>
                <input
                  type="text"
                  value={settingsForm.welcomeLeaderTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, welcomeLeaderTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Foto Ketua</label>
                <input
                  type="url"
                  value={settingsForm.welcomeLeaderPhoto}
                  onChange={(e) => setSettingsForm({ ...settingsForm, welcomeLeaderPhoto: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Isi Sambutan</label>
              <textarea
                rows={4}
                value={settingsForm.welcomeMessage}
                onChange={(e) => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          {canManageSettings && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Identitas'}</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB 2: STRUKTUR PENGURUS */}
      {activeTab === 'structure' && (
        <form onSubmit={handleSaveStructure} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor SK Kepengurusan</label>
              <input
                type="text"
                value={structureForm.skNumber}
                onChange={(e) => setStructureForm({ ...structureForm, skNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pelindung / Pembina</label>
              <input
                type="text"
                value={structureForm.advisor}
                onChange={(e) => setStructureForm({ ...structureForm, advisor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          {/* Inti: Ketua, Wakil, Sekretaris, Bendahara */}
          <div className="border-t border-slate-100 pt-4 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Pengurus Inti Organisasi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <span className="font-bold text-blue-800 block">Ketua Umum</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar"
                  value={structureForm.leader.name}
                  onChange={(e) => setStructureForm({ ...structureForm, leader: { ...structureForm.leader, name: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Asal Sekolah"
                  value={structureForm.leader.school}
                  onChange={(e) => setStructureForm({ ...structureForm, leader: { ...structureForm.leader, school: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="font-bold text-slate-800 block">Wakil Ketua</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar"
                  value={structureForm.viceLeader?.name || ''}
                  onChange={(e) => setStructureForm({ ...structureForm, viceLeader: { position: 'Wakil Ketua', name: e.target.value, school: structureForm.viceLeader?.school || '' } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Asal Sekolah"
                  value={structureForm.viceLeader?.school || ''}
                  onChange={(e) => setStructureForm({ ...structureForm, viceLeader: { position: 'Wakil Ketua', name: structureForm.viceLeader?.name || '', school: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="font-bold text-slate-800 block">Sekretaris</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar"
                  value={structureForm.secretary.name}
                  onChange={(e) => setStructureForm({ ...structureForm, secretary: { ...structureForm.secretary, name: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Asal Sekolah"
                  value={structureForm.secretary.school}
                  onChange={(e) => setStructureForm({ ...structureForm, secretary: { ...structureForm.secretary, school: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="font-bold text-slate-800 block">Bendahara</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar"
                  value={structureForm.treasurer.name}
                  onChange={(e) => setStructureForm({ ...structureForm, treasurer: { ...structureForm.treasurer, name: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Asal Sekolah"
                  value={structureForm.treasurer.school}
                  onChange={(e) => setStructureForm({ ...structureForm, treasurer: { ...structureForm.treasurer, school: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Divisi / Bidang-Bidang */}
          <div className="border-t border-slate-100 pt-4 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Bidang-Bidang Kerja Organisasi</h3>
            <div className="space-y-4">
              {structureForm.divisions.map((div, dIdx) => (
                <div key={dIdx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <div className="font-bold text-blue-700 text-xs">Bidang: {div.name}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Koordinator Bidang</label>
                      <input
                        type="text"
                        value={div.coordinator.name}
                        onChange={(e) => {
                          const updated = { ...structureForm };
                          updated.divisions[dIdx].coordinator.name = e.target.value;
                          setStructureForm(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Sekolah Koordinator</label>
                      <input
                        type="text"
                        value={div.coordinator.school}
                        onChange={(e) => {
                          const updated = { ...structureForm };
                          updated.divisions[dIdx].coordinator.school = e.target.value;
                          setStructureForm(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 mt-1"
                      />
                    </div>
                  </div>

                  {/* Anggota Bidang */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Anggota Bidang</span>
                      <button
                        type="button"
                        onClick={() => addDivisionMember(dIdx)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Tambah Anggota
                      </button>
                    </div>

                    {div.members.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => {
                            const updated = { ...structureForm };
                            updated.divisions[dIdx].members[mIdx].name = e.target.value;
                            setStructureForm(updated);
                          }}
                          placeholder="Nama Anggota"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200"
                        />
                        <input
                          type="text"
                          value={m.school}
                          onChange={(e) => {
                            const updated = { ...structureForm };
                            updated.divisions[dIdx].members[mIdx].school = e.target.value;
                            setStructureForm(updated);
                          }}
                          placeholder="Sekolah"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeDivisionMember(dIdx, mIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canManageSettings && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Bagan Struktur Pengurus'}</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB 3: PENDATAAN ANGGOTA (GOOGLE FORMULIR & SPREADSHEET) */}
      {activeTab === 'registration' && (
        <form onSubmit={handleSaveRegistration} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          {/* Header Info */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-950 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span>Pengaturan Tautan Google Formulir Pendataan Anggota</span>
            </div>
            <p className="text-xs text-blue-800/90 leading-relaxed">
              Tautan Google Formulir ini ditampilkan langsung pada kartu <strong>“📋 Pendataan Anggota MGMP”</strong> di Dashboard. Anggota dapat mengakses dan mengisi formulir secara mandiri. Pengurus dapat mengganti tautan kapan saja tanpa mengubah kode program.
            </p>
          </div>

          {regError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{regError}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5 text-xs">
            {/* Field 1: Google Form URL */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 text-sm">
                Tautan Google Formulir Pendataan Anggota <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://forms.google.com/... atau https://forms.gle/..."
                  value={regForm.googleFormUrl || ''}
                  onChange={(e) => setRegForm({ ...regForm, googleFormUrl: e.target.value })}
                  disabled={!canEditRegistration}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 font-mono disabled:bg-slate-50 disabled:text-slate-500"
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
              <p className="text-[11px] text-slate-500">
                Masukkan URL formulir lengkap, misalnya: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">https://forms.gle/abc123xyz</code> atau tautan resmi Google Form.
              </p>
            </div>

            {/* Preview Tautan Saat Ini */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-700 text-xs">Tautan Formulir Saat Ini:</span>
                {regForm.googleFormUrl && (
                  <a
                    href={regForm.googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors self-start sm:self-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>🔗 Buka Formulir (Preview)</span>
                  </a>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                {regForm.googleFormUrl || (
                  <span className="text-amber-600 italic font-sans flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Belum ada tautan yang dikonfigurasi. Kartu formulir di Dashboard disembunyikan untuk anggota biasa sampai tautan diisi.</span>
                  </span>
                )}
              </div>
            </div>

            {/* Field 2: Google Spreadsheet Result URL */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800 text-sm">
                Tautan Google Spreadsheet Tanggapan Formulir (Google Form Responses)
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing"
                value={regForm.spreadsheetUrl || ''}
                onChange={(e) => setRegForm({ ...regForm, spreadsheetUrl: e.target.value })}
                disabled={!canEditRegistration}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono disabled:bg-slate-50 disabled:text-slate-500"
              />
              <p className="text-[11px] text-slate-500">
                Tautan spreadsheet tempat Google Formulir merekam respon jawaban guru. Digunakan pada menu <strong>Manajemen Anggota ➔ 📥 Import Data Anggota ➔ Google Spreadsheet</strong>.
              </p>
            </div>

            {/* Field 3: Sheet Name */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Nama Lembar Kerja (Sheet Name)
              </label>
              <input
                type="text"
                placeholder="Form Responses 1"
                value={regForm.sheetName || 'Form Responses 1'}
                onChange={(e) => setRegForm({ ...regForm, sheetName: e.target.value })}
                disabled={!canEditRegistration}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono disabled:bg-slate-50 disabled:text-slate-500"
              />
              <p className="text-[11px] text-slate-500">
                Secara default biasanya bernama: <code className="bg-slate-100 px-1 py-0.5 rounded">Form Responses 1</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded">Respon Formulir 1</code>.
              </p>
            </div>

            {/* Visual Workflow Infographic */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Alur Integrasi Pendataan & Penerbitan Kartu Anggota</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-medium">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold">1. Dashboard</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold">2. Google Formulir</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold">3. Google Spreadsheet</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold">4. Import & Validasi Admin</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold">5. Verifikasi Resmi</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">6. Foto Mandiri</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">7. Kartu Anggota & Cetak</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {canEditRegistration ? (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Terakhir diperbarui: {regForm.updatedAt ? new Date(regForm.updatedAt).toLocaleString('id-ID') : '-'}
              </span>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan Tautan...' : '💾 Simpan Tautan'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Hanya Admin atau Pengurus yang berwenang yang dapat mengubah tautan Google Formulir.</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
