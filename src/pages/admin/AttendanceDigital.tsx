import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Maximize2,
  Calendar,
  Clock,
  MapPin,
  Search,
  UserCheck,
} from 'lucide-react';
import { Activity, Attendance, Member, OrganizationSetting } from '../../types';
import {
  getAttendancesByActivity,
  recordAttendance,
} from '../../services/dataService';
import { exportAttendancesToExcel } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

interface AttendanceDigitalProps {
  activities: Activity[];
  members: Member[];
  orgSettings: OrganizationSetting;
  selectedActivityProp?: Activity | null;
}

export const AttendanceDigital: React.FC<AttendanceDigitalProps> = ({
  activities,
  members,
  orgSettings,
  selectedActivityProp,
}) => {
  const { user, canManageActivities } = useAuth();

  // Active activity selection
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    selectedActivityProp || activities[0] || null
  );

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Manual Check-in form
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Izin' | 'Sakit' | 'Tugas Luar'>('Hadir');
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // QR simulation check-in
  const [scanMemberNumber, setScanMemberNumber] = useState('');

  // Fetch attendances whenever selectedActivity changes
  useEffect(() => {
    if (selectedActivity) {
      loadAttendances(selectedActivity.id);
      generateQr(selectedActivity);
    }
  }, [selectedActivity]);

  const loadAttendances = async (actId: string) => {
    setLoading(true);
    const list = await getAttendancesByActivity(actId);
    setAttendances(list);
    setLoading(false);
  };

  const generateQr = async (act: Activity) => {
    try {
      const qrPayload = JSON.stringify({
        activityId: act.id,
        title: act.title,
        token: act.qrCodeToken,
        date: act.date,
      });
      const url = await QRCode.toDataURL(qrPayload, {
        width: 380,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  // Perform check-in (Manual or via QR scan simulator)
  const handleRecordAttendance = async (
    member: Member,
    method: 'QR' | 'Manual'
  ) => {
    if (!selectedActivity) return;

    const res = await recordAttendance({
      activityId: selectedActivity.id,
      memberId: member.id,
      memberName: member.fullName + (member.title ? `, ${member.title}` : ''),
      schoolName: member.schoolName,
      nip: member.nip || '',
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      status: attendanceStatus,
      method: method,
      notes: attendanceNotes || undefined,
    });

    if (res.success) {
      setFeedbackMessage({ text: `Berhasil! ${member.fullName} tercatat hadir.` });
      setSelectedMemberId('');
      setAttendanceNotes('');
      setScanMemberNumber('');
      loadAttendances(selectedActivity.id);
    } else {
      setFeedbackMessage({ text: res.message, isError: true });
    }

    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    const member = members.find((m) => m.id === selectedMemberId);
    if (member) {
      handleRecordAttendance(member, 'Manual');
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanMemberNumber) return;
    const member = members.find(
      (m) =>
        m.memberNumber.toLowerCase() === scanMemberNumber.trim().toLowerCase() ||
        (m.nip && m.nip.replace(/\s+/g, '') === scanMemberNumber.trim().replace(/\s+/g, ''))
    );
    if (!member) {
      setFeedbackMessage({
        text: 'Nomor anggota atau NIP tidak ditemukan dalam database!',
        isError: true,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
      return;
    }
    handleRecordAttendance(member, 'QR');
  };

  // Print PDF Rekap Kehadiran
  const handlePrintAttendance = () => {
    if (!selectedActivity) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekap Kehadiran - ${selectedActivity.title}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 30px; color: #000; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            h2, h3 { margin: 2px 0; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
            th { background-color: #f1f5f9; text-align: center; }
            .sig { margin-top: 40px; display: flex; justify-content: space-between; }
            .sig-box { text-align: center; width: 220px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${orgSettings.orgName}</h2>
            <h3>DAFTAR HADIR PESERTA ${selectedActivity.type}</h3>
            <p style="margin: 3px 0;"><strong>Kegiatan:</strong> ${selectedActivity.title}</p>
            <p style="margin: 3px 0;">Hari/Tanggal: ${selectedActivity.date} | Tempat: ${selectedActivity.location}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th width="30">No</th>
                <th>Nama Peserta</th>
                <th>NIP</th>
                <th>Asal Sekolah</th>
                <th>Waktu Presensi</th>
                <th>Status</th>
                <th>Tanda Tangan</th>
              </tr>
            </thead>
            <tbody>
              ${attendances
                .map(
                  (att, idx) => `
                <tr>
                  <td align="center">${idx + 1}</td>
                  <td><strong>${att.memberName}</strong></td>
                  <td>${att.nip || '-'}</td>
                  <td>${att.schoolName}</td>
                  <td align="center">${att.timestamp}</td>
                  <td align="center">${att.status}</td>
                  <td style="height: 30px;">✓ Digital (${att.method})</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="sig">
            <div class="sig-box">
              <p>Mengetahui,<br/>Ketua MGMP</p>
              <div style="height: 50px;"></div>
              <p><strong><u>${orgSettings.welcomeLeaderName}</u></strong></p>
            </div>
            <div class="sig-box">
              <p>Purbalingga, ${selectedActivity.date}<br/>Penanggung Jawab Kegiatan</p>
              <div style="height: 50px;"></div>
              <p><strong><u>${selectedActivity.pic || 'Panitia Pelaksana'}</u></strong></p>
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
            Sistem Presensi Digital MGMP
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Presensi digital berbasis QR Code unik per kegiatan dengan pencegahan presensi ganda.
          </p>
        </div>

        {selectedActivity && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Tampilkan Layar QR Proyektor</span>
            </button>

            <button
              onClick={() => exportAttendancesToExcel(attendances, selectedActivity.title)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={handlePrintAttendance}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Activity Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Pilih Agenda Kegiatan Aktif
        </label>
        <select
          value={selectedActivity?.id || ''}
          onChange={(e) => {
            const act = activities.find((a) => a.id === e.target.value);
            if (act) setSelectedActivity(act);
          }}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
        >
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} ({a.date} - {a.type} [{a.status}])
            </option>
          ))}
        </select>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            feedbackMessage.isError
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {feedbackMessage.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {selectedActivity && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: QR Display & Scanner Simulator */}
          <div className="lg:col-span-5 space-y-6">
            {/* QR Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
              <div className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                QR Code Presensi Unik
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {selectedActivity.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Token: {selectedActivity.qrCodeToken}
              </p>

              {/* QR Image */}
              <div className="w-56 h-56 mx-auto bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-24 h-24 text-slate-300" />
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Pindai dengan kamera ponsel / simulator scanner di bawah untuk konfirmasi kehadiran.
              </p>
            </div>

            {/* Scan / Input Token Simulator */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Pencatatan Presensi Peserta</span>
              </h4>

              {/* QR Scan Simulator Form */}
              <form onSubmit={handleScanSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Input No. Anggota / NIP Peserta (Simulasi QR Scan)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="contoh: MGMP-PBG-001 atau NIP..."
                      value={scanMemberNumber}
                      onChange={(e) => setScanMemberNumber(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Pindai
                    </button>
                  </div>
                </div>
              </form>

              {/* Manual Picker Form */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 mb-2">
                  Atau Pilih Dari Daftar Anggota:
                </div>
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Pilih Guru Anggota --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.memberNumber} - {m.fullName} ({m.schoolName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={attendanceStatus}
                      onChange={(e) => setAttendanceStatus(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Izin">Izin</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Tugas Luar">Tugas Luar</option>
                    </select>

                    <button
                      type="submit"
                      disabled={!selectedMemberId}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                    >
                      Catat Kehadiran
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Rekap Kehadiran Realtime */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Peserta Hadir Realtime
                </h3>
                <p className="text-xs text-slate-500">
                  Total tercatat: <strong>{attendances.length}</strong> orang
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Sinkron
              </span>
            </div>

            {/* Attendances Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Guru</th>
                    <th className="py-2.5 px-3">Sekolah</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Belum ada peserta yang melakukan presensi pada kegiatan ini.
                      </td>
                    </tr>
                  ) : (
                    attendances.map((att, idx) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {att.memberName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{att.schoolName}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{att.timestamp}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {att.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Fullscreen Projector QR Code */}
      {selectedActivity && (
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title="Layar QR Code Proyektor Presensi"
          maxWidth="max-w-3xl"
        >
          <div className="text-center py-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Presensi Digital Kegiatan MGMP
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 max-w-xl mx-auto">
                {selectedActivity.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {selectedActivity.date} • {selectedActivity.time} • {selectedActivity.location}
              </p>
            </div>

            <div className="w-80 h-80 mx-auto p-4 bg-white rounded-3xl border-4 border-slate-900 shadow-2xl flex items-center justify-center">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code Full" className="w-full h-full object-contain" />}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Arahkan kamera ponsel Anda ke QR Code di atas
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Token Kegiatan: {selectedActivity.qrCodeToken}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Tutup Tampilan Proyektor
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
