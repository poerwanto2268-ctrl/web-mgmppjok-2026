import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Users,
  Building2,
  BookOpen,
  Award,
  Filter,
} from 'lucide-react';
import {
  Member,
  Activity,
  School,
  LearningResource,
  OrgDocument,
  Training,
  OrganizationSetting,
} from '../../types';
import { exportMembersToExcel } from '../../services/exportService';

interface ReportsCenterProps {
  members: Member[];
  activities: Activity[];
  schools: School[];
  resources: LearningResource[];
  documents: OrgDocument[];
  trainings: Training[];
  orgSettings: OrganizationSetting;
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  members,
  activities,
  schools,
  resources,
  documents,
  trainings,
  orgSettings,
}) => {
  const [selectedReportType, setSelectedReportType] = useState('members');

  const handlePrintComprehensiveReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Tahunan - ${orgSettings.orgName}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 30px; font-size: 12px; color: #000; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 20px; }
            .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
            .header h3 { margin: 3px 0; font-size: 14px; }
            .header p { margin: 0; font-size: 11px; }
            h4 { border-bottom: 1px solid #000; padding-bottom: 4px; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
            th { background: #f1f5f9; }
            .stat-grid { display: flex; gap: 15px; margin: 15px 0; }
            .stat-box { border: 1px solid #000; padding: 10px; flex: 1; text-align: center; }
            .sig { margin-top: 40px; display: flex; justify-content: flex-end; }
            .sig-box { width: 250px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${orgSettings.orgName}</h2>
            <h3>LAPORAN ADMINISTRASI & PERKEMBANGAN ORGANISASI</h3>
            <p>Sekretariat: ${orgSettings.secretariatAddress}</p>
            <p>Email: ${orgSettings.email} | Kontak: ${orgSettings.contactPhone}</p>
            <p style="margin-top: 4px;"><strong>Tahun Ajaran: ${orgSettings.activeAcademicYear} | Periode: ${orgSettings.period}</strong></p>
          </div>

          <div class="stat-grid">
            <div class="stat-box"><strong>Total Guru Anggota</strong><br/>${members.length} Orang</div>
            <div class="stat-box"><strong>Sekolah SMP</strong><br/>${schools.length} Lembaga</div>
            <div class="stat-box"><strong>Agenda Kegiatan</strong><br/>${activities.length} Kegiatan</div>
            <div class="stat-box"><strong>Perangkat Pembelajaran</strong><br/>${resources.length} Berkas</div>
          </div>

          <h4>I. REKAPITULASI KEGIATAN TAHUN BERJALAN</h4>
          <table>
            <thead>
              <tr><th>No</th><th>Nama Kegiatan</th><th>Jenis</th><th>Tanggal</th><th>Tempat</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${activities.map((a, idx) => `
                <tr>
                  <td align="center">${idx + 1}</td>
                  <td>${a.title}</td>
                  <td>${a.type}</td>
                  <td>${a.date}</td>
                  <td>${a.location}</td>
                  <td>${a.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h4>II. REKAPITULASI PELATIHAN & KOMPETENSI GURU</h4>
          <table>
            <thead>
              <tr><th>No</th><th>Judul Pelatihan</th><th>Instruktur</th><th>Beban JP</th><th>Waktu</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${trainings.map((t, idx) => `
                <tr>
                  <td align="center">${idx + 1}</td>
                  <td>${t.title}</td>
                  <td>${t.instructor}</td>
                  <td align="center">${t.hours} JP</td>
                  <td>${t.startDate} s.d. ${t.endDate}</td>
                  <td>${t.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="sig">
            <div class="sig-box">
              <p>Purbalingga, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Ketua MGMP PJOK SMP</p>
              <div style="height: 60px;"></div>
              <p><strong><u>${orgSettings.welcomeLeaderName}</u></strong><br/>NIP. 19740512 200212 1 004</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
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
            Pusat Rekapitulasi & Laporan Organisasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ekspor data dan cetak laporan resmi berstandar Dinas Pendidikan dengan kop resmi MGMP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMembersToExcel(members)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Anggota (.xlsx)</span>
          </button>

          <button
            onClick={handlePrintComprehensiveReport}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan Lengkap (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Laporan Keanggotaan Guru</h3>
          <p className="text-xs text-slate-500">
            Rekap lengkap {members.length} guru PJOK mencakup NIP, NUPTK, asal sekolah, dan persebaran 18 kecamatan.
          </p>
          <div className="pt-2">
            <button
              onClick={() => exportMembersToExcel(members)}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Unduh Spreadsheet Anggota
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Laporan Agenda & Kegiatan</h3>
          <p className="text-xs text-slate-500">
            Daftar {activities.length} pertemuan rutin, workshop, dan diseminasi beserta narasumber dan status.
          </p>
          <div className="pt-2">
            <button
              onClick={handlePrintComprehensiveReport}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cetak Rekap Agenda
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Laporan Sumber Belajar PJOK</h3>
          <p className="text-xs text-slate-500">
            Rekap {resources.length} modul ajar, ATP, asesmen diagnostik/sumatif Fase D yang telah diverifikasi.
          </p>
          <div className="pt-2">
            <button
              onClick={handlePrintComprehensiveReport}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cetak Rekap Perangkat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
