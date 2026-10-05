import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Award,
  UserCheck,
  Printer,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Training, Member, OrganizationSetting } from '../../types';
import { createTraining, registerTrainingMember } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

interface TeacherTrainingsProps {
  trainings: Training[];
  members: Member[];
  orgSettings: OrganizationSetting;
  onRefresh: () => void;
}

export const TeacherTrainings: React.FC<TeacherTrainingsProps> = ({
  trainings,
  members,
  orgSettings,
  onRefresh,
}) => {
  const { user, canManageActivities } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerMemberId, setRegisterMemberId] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const initialForm = {
    title: '',
    instructor: 'Dr. Hari Setiawan, M.Or.',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    location: 'Aula Dindikbud Purbalingga & Daring',
    description: '',
    quota: 100,
    hours: 32,
    certificateTemplate: 'CERT_MGMP_PJOK_2025',
    status: 'Buka Pendaftaran' as 'Buka Pendaftaran' | 'Sedang Berjalan' | 'Selesai',
    registeredMemberIds: [],
    materials: 'Materi Pelatihan Lengkap',
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    await createTraining(formData);
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraining || !registerMemberId) return;

    await registerTrainingMember(selectedTraining.id, registerMemberId);
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
      setIsRegisterModalOpen(false);
      setRegisterMemberId('');
      onRefresh();
    }, 1500);
  };

  // Generate & Print Digital Certificate
  const handlePrintCertificate = (training: Training, member: Member) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const certNumber = `421.3/${training.hours}JP/MGMP-PJOK/${new Date().getFullYear()}/${member.memberNumber.replace(/\D/g, '')}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sertifikat Pelatihan - ${member.fullName}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 20px; font-family: 'Times New Roman', Times, serif; background: #f8fafc; display: flex; justify-content: center; }
            .cert-container {
              width: 950px;
              height: 640px;
              background: #ffffff;
              border: 12px solid #1e3a8a;
              border-image: linear-gradient(to right, #1e3a8a, #0284c7) 1;
              padding: 40px 60px;
              box-sizing: border-box;
              text-align: center;
              position: relative;
              box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            }
            .cert-header h2 { margin: 0; font-size: 20px; color: #1e3a8a; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; }
            .cert-header h4 { margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-family: Arial, sans-serif; font-weight: normal; }
            .cert-title { font-size: 44px; font-weight: bold; color: #0f172a; margin: 25px 0 5px 0; font-family: Georgia, serif; letter-spacing: 1px; }
            .cert-num { font-size: 13px; color: #64748b; margin-bottom: 20px; font-family: monospace; }
            .cert-text { font-size: 15px; color: #334155; margin: 8px 0; }
            .recipient-name { font-size: 28px; font-weight: bold; color: #1e3a8a; margin: 10px 0 2px 0; text-decoration: underline; }
            .recipient-meta { font-size: 14px; color: #475569; margin-bottom: 15px; }
            .course-name { font-size: 18px; font-weight: bold; color: #0f172a; max-width: 750px; margin: 0 auto; line-height: 1.4; }
            .cert-footer { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 40px; font-size: 13px; }
            .sig-box { width: 220px; text-align: center; }
            .sig-line { margin-top: 55px; border-bottom: 1px solid #334155; font-weight: bold; }
            @media print {
              body { background: none; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div>
            <div class="no-print" style="text-align: right; margin-bottom: 15px;">
              <button onclick="window.print()" style="padding: 8px 18px; background: #1e3a8a; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Cetak Sertifikat Digital (PDF)</button>
            </div>
            <div class="cert-container">
              <div class="cert-header">
                <h2>${orgSettings.orgName}</h2>
                <h4>${orgSettings.educationLevel} ${orgSettings.region}</h4>
              </div>

              <div class="cert-title">SERTIFIKAT</div>
              <div class="cert-num">Nomor: ${certNumber}</div>

              <div class="cert-text">Diberikan kepada:</div>
              <div class="recipient-name">${member.fullName}, ${member.title || ''}</div>
              <div class="recipient-meta">NIP: ${member.nip || '-'} • Asal Sekolah: ${member.schoolName}</div>

              <div class="cert-text">Atas partisipasi dan kelulusannya sebagai PESERTA pada kegiatan:</div>
              <div class="course-name">"${training.title}"</div>
              <div class="cert-text" style="margin-top: 8px;">
                Diselenggarakan pada ${training.startDate} s.d. ${training.endDate} dengan beban setara <strong>${training.hours} Jam Pelajaran (JP)</strong>.
              </div>

              <div class="cert-footer">
                <div class="sig-box">
                  <div>Instruktur / Narasumber</div>
                  <div class="sig-line">${training.instructor}</div>
                </div>

                <div class="sig-box">
                  <div>Purbalingga, ${training.endDate}<br/>Ketua MGMP PJOK</div>
                  <div class="sig-line">${orgSettings.welcomeLeaderName}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Pelatihan & Pengembangan Kompetensi Guru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Program peningkatan keprofesian berkelanjutan (PKB) guru PJOK dengan penerbitan sertifikat digital 32 JP.
          </p>
        </div>

        {canManageActivities && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Program Pelatihan</span>
          </button>
        )}
      </div>

      {/* Grid of Trainings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainings.map((tr) => (
          <div
            key={tr.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {tr.hours} Jam Pelajaran (JP)
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">
                  {tr.status}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {tr.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {tr.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><strong>Instruktur:</strong> {tr.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{tr.startDate} s.d. {tr.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{tr.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Kuota: {tr.quota} Peserta • Terdaftar: {tr.registeredMemberIds?.length || 0} orang</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedTraining(tr);
                  setIsRegisterModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Daftarkan Guru Peserta</span>
              </button>

              {/* Quick Certificate generation preview */}
              <button
                onClick={() => {
                  const sampleMember = members[0];
                  if (sampleMember) {
                    handlePrintCertificate(tr, sampleMember);
                  }
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Cetak Sertifikat Digital</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Tambah Program Pelatihan */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Program Pelatihan Guru PJOK Baru"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Pelatihan / Bimtek *</label>
            <input
              type="text"
              required
              placeholder="contoh: Bimtek Penyusunan Asesmen Kebugaran Jasmani Berbasis Digital"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Narasumber / Instruktur *</label>
              <input
                type="text"
                required
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Beban Jam Pelajaran (JP)</label>
              <input
                type="number"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tempat / Moda</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Pelatihan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Buka Pendaftaran">Buka Pendaftaran</option>
                <option value="Sedang Berjalan">Sedang Berjalan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Capaian Pelatihan</label>
            <textarea
              rows={3}
              placeholder="Rincian materi, tugas mandiri, dan syarat kelulusan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Simpan Program
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Daftarkan Guru */}
      {selectedTraining && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title={`Daftarkan Guru Peserta - ${selectedTraining.title}`}
        >
          <form onSubmit={handleRegisterMember} className="space-y-4 text-xs">
            {registerSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pendaftaran peserta berhasil disimpan!</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pilih Guru Anggota MGMP
              </label>
              <select
                required
                value={registerMemberId}
                onChange={(e) => setRegisterMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">-- Pilih Guru Anggota --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.memberNumber} - {m.fullName} ({m.schoolName})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={!registerMemberId}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold"
              >
                Konfirmasi Pendaftaran
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
