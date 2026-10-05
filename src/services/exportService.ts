import * as XLSX from 'xlsx';
import { Member, Attendance, Activity, OrganizationSetting } from '../types';

export function exportMembersToExcel(members: Member[], filename = 'Data_Anggota_MGMP_PJOK_Purbalingga.xlsx') {
  const exportData = members.map((m, index) => ({
    No: index + 1,
    'No. Anggota': m.memberNumber,
    'Nama Lengkap': m.fullName,
    Gelar: m.title || '-',
    NIP: m.nip || '-',
    NIK: m.nik || '-',
    NUPTK: m.nuptk || '-',
    'Jenis Kelamin': m.gender,
    'Tempat Lahir': m.birthPlace || '-',
    'Tanggal Lahir': m.birthDate || '-',
    'Pangkat/Golongan': m.rankGrade || '-',
    Jabatan: m.position || 'Guru PJOK',
    'Mata Pelajaran': m.subject || 'PJOK',
    'Asal Sekolah': m.schoolName,
    NPSN: m.npsn || '-',
    'Alamat Sekolah': m.schoolAddress || '-',
    Kecamatan: m.subdistrict,
    'No. WhatsApp': m.phone,
    Email: m.email,
    Status: m.status,
    'Tanggal Bergabung': m.joinedDate,
    Keterangan: m.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Anggota MGMP');
  XLSX.writeFile(workbook, filename);
}

// Download official Excel import template
export function downloadMemberImportTemplate() {
  const headers = [
    'No',
    'Nama Lengkap',
    'NIP',
    'NIK',
    'NUPTK',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Pangkat/Golongan',
    'Jabatan',
    'Mata Pelajaran',
    'Nama Sekolah',
    'NPSN',
    'Alamat Sekolah',
    'No HP',
    'Email',
    'Status'
  ];

  const sampleRows = [
    [
      'CONTOH 1',
      'Purwanto, S.Pd.',
      '19820510 200801 1 005',
      '3303011005820001',
      '4536760662200033',
      'Laki-laki',
      'Purbalingga',
      '1982-05-10',
      'Penata Tk.I / III/d',
      'Guru PJOK',
      'PJOK',
      'SMP Negeri 2 Kutasari',
      '20303123',
      'Jl. Raya Kutasari, Purbalingga',
      '0812-3456-7890',
      'purwanto.pjok@guru.smp.belajar.id',
      'Aktif'
    ],
    [
      'CONTOH 2',
      'Siti Nurjanah, S.Pd.',
      '19851120 201001 2 018',
      '3303026011850002',
      '8745763665300042',
      'Perempuan',
      'Purbalingga',
      '1985-11-20',
      'Penata / III/c',
      'Guru PJOK',
      'PJOK',
      'SMP Negeri 1 Kalimanah',
      '20303124',
      'Jl. Kalimanah Wetan, Purbalingga',
      '0813-9876-5432',
      'sitinurjanah@guru.smp.belajar.id',
      'Aktif'
    ]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 26 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 28 },
    { wch: 12 },
    { wch: 32 },
    { wch: 16 },
    { wch: 32 },
    { wch: 14 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Anggota');

  const guideData = [
    ['PETUNJUK PENGISIAN TEMPLATE DATA ANGGOTA MGMP PJOK SMP KABUPATEN PURBALINGGA'],
    [''],
    ['1. Kolom "Nama Lengkap" dan "Nama Sekolah" adalah data wajib diisi.'],
    ['2. Baris yang berlabel "CONTOH" di kolom No adalah contoh petunjuk dan akan otomatis dilewati saat diimpor.'],
    ['3. Format tanggal lahir disarankan YYYY-MM-DD (misal: 1985-05-20).'],
    ['4. Jenis Kelamin diisi: "Laki-laki" atau "Perempuan".'],
    ['5. Status dapat diisi: "Aktif" atau "Menunggu Verifikasi".'],
    ['6. Jangan mengubah nama-nama kolom pada baris pertama agar pemetaan kolom otomatis.'],
    ['7. Simpan file ini dalam format .xlsx atau .xls sebelum diunggah ke WEB MGMP.']
  ];
  const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
  guideSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, guideSheet, 'Petunjuk');

  XLSX.writeFile(workbook, 'Template_Import_Anggota_MGMP_PJOK_Purbalingga.xlsx');
}

export interface AppImportField {
  key: string;
  label: string;
  required: boolean;
  sample: string;
}

export const APPLICATION_IMPORT_FIELDS: AppImportField[] = [
  { key: 'fullName', label: 'Nama Lengkap', required: true, sample: 'Purwanto, S.Pd.' },
  { key: 'schoolName', label: 'Nama Sekolah', required: true, sample: 'SMP Negeri 2 Kutasari' },
  { key: 'nip', label: 'NIP', required: false, sample: '19820510 200801 1 005' },
  { key: 'nik', label: 'NIK', required: false, sample: '3303011005820001' },
  { key: 'nuptk', label: 'NUPTK', required: false, sample: '4536760662200033' },
  { key: 'gender', label: 'Jenis Kelamin', required: false, sample: 'Laki-laki / Perempuan' },
  { key: 'title', label: 'Gelar Akademik', required: false, sample: 'S.Pd. / S.Pd., M.Pd.' },
  { key: 'birthPlace', label: 'Tempat Lahir', required: false, sample: 'Purbalingga' },
  { key: 'birthDate', label: 'Tanggal Lahir', required: false, sample: '1985-05-20' },
  { key: 'rankGrade', label: 'Pangkat / Golongan', required: false, sample: 'Penata Tk.I / III/d' },
  { key: 'position', label: 'Jabatan', required: false, sample: 'Guru PJOK' },
  { key: 'subject', label: 'Mata Pelajaran', required: false, sample: 'PJOK' },
  { key: 'npsn', label: 'NPSN Sekolah', required: false, sample: '20303123' },
  { key: 'schoolAddress', label: 'Alamat Sekolah', required: false, sample: 'Jl. Raya Kutasari' },
  { key: 'subdistrict', label: 'Kecamatan', required: false, sample: 'Kutasari' },
  { key: 'phone', label: 'No. HP / WhatsApp', required: false, sample: '0812-3456-7890' },
  { key: 'email', label: 'Email', required: false, sample: 'purwanto@guru.smp.belajar.id' },
  { key: 'status', label: 'Status', required: false, sample: 'Aktif / Menunggu Verifikasi' }
];

export function autoDetectColumnMapping(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const synonyms: Record<string, string[]> = {
    fullName: ['namalengkap', 'nama', 'fullname', 'namaguru', 'namapeserta'],
    schoolName: ['namasekolah', 'sekolah', 'asalsekolah', 'unitkerja', 'instansi', 'tempatbekerja'],
    nip: ['nip', 'nomorindukpegawai', 'noindukpegawai'],
    nik: ['nik', 'nomorindukkependudukan', 'noktp', 'ktp'],
    nuptk: ['nuptk'],
    gender: ['jeniskelamin', 'jk', 'gender', 'jeniskelaminlkpr'],
    title: ['gelar', 'gelarakademik', 'title'],
    birthPlace: ['tempatlahir', 'tmplahir', 'kotas'],
    birthDate: ['tanggallahir', 'tgllahir', 'tgl', 'birthdate'],
    rankGrade: ['pangkatgolongan', 'pangkat', 'golongan', 'pangkatgol'],
    position: ['jabatan', 'posisi'],
    subject: ['matapelajaran', 'mapel', 'subject'],
    npsn: ['npsn', 'npsnsekolah'],
    schoolAddress: ['alamatsekolah', 'alamatunitkerja', 'alamatinstansi'],
    subdistrict: ['kecamatan', 'subdistrik', 'wilayah'],
    phone: ['nohp', 'nowhatsapp', 'telepon', 'notelp', 'nowa', 'handphone', 'hp'],
    email: ['email', 'emailbelajarid', 'e-mail', 'surel'],
    status: ['status', 'statuskeanggotaan', 'statuskepegawaian']
  };

  for (const field of APPLICATION_IMPORT_FIELDS) {
    const fieldSyns = synonyms[field.key] || [field.key.toLowerCase()];
    const matchedCol = columns.find((col) => {
      const normCol = normalize(col);
      return fieldSyns.some((syn) => normCol.includes(syn) || syn.includes(normCol));
    });

    if (matchedCol) {
      mapping[field.key] = matchedCol;
    }
  }

  return mapping;
}

// Parse Spreadsheet URL into usable export endpoints
export function parseSpreadsheetUrl(url: string, sheetName?: string) {
  if (!url) return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;

  const id = match[1];
  const gidMatch = url.match(/gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : null;

  // Primary CSV export endpoint
  const queryParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
  const exportUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv${queryParam}`;
  const directExportUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;

  return { id, gid, exportUrl, directExportUrl };
}

// Read Excel file buffer
export function readExcelFile(file: File): Promise<{ sheetNames: string[]; rows: any[]; columns: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames;
        const firstSheet = workbook.Sheets[sheetNames[0]];
        const rawJson: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        const columns = rawJson.length > 0 ? Object.keys(rawJson[0]) : [];
        resolve({ sheetNames, rows: rawJson, columns });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

// Fetch Google Spreadsheet live data via public CSV export
export async function fetchSpreadsheetRows(url: string, sheetName?: string): Promise<{ rows: any[]; columns: string[] }> {
  const parsed = parseSpreadsheetUrl(url, sheetName);
  if (!parsed) {
    throw new Error('Format tautan Google Spreadsheet tidak valid. Pastikan tautan menyertakan ID spreadsheet.');
  }

  // Try gviz endpoint first, then direct export
  let response: Response | null = null;
  let text = '';

  try {
    response = await fetch(parsed.exportUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    text = await response.text();
  } catch (err) {
    // Try secondary endpoint
    try {
      response = await fetch(parsed.directExportUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      text = await response.text();
    } catch (secErr) {
      throw new Error('Gagal mengambil data dari Google Spreadsheet. Pastikan Spreadsheet disetel ke "Siapa saja yang memiliki link dapat melihat" (Anyone with the link can view).');
    }
  }

  const workbook = XLSX.read(text, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return { rows, columns };
}

export function parseMembersFromExcel(file: File): Promise<Partial<Member>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parsedMembers: Partial<Member>[] = rawJson.map((row, idx) => ({
          memberNumber: row['No. Anggota'] || row['Nomor Anggota'] || `MGMP-IMP-${Date.now().toString().slice(-4)}${idx}`,
          fullName: row['Nama Lengkap'] || row['Nama'] || 'Guru PJOK',
          title: row['Gelar'] || 'S.Pd.',
          nip: row['NIP'] ? String(row['NIP']) : '',
          nuptk: row['NUPTK'] ? String(row['NUPTK']) : '',
          gender: (row['Jenis Kelamin'] === 'Perempuan' || row['JK'] === 'P') ? 'Perempuan' : 'Laki-laki',
          schoolName: row['Asal Sekolah'] || row['Sekolah'] || 'SMP di Purbalingga',
          subdistrict: row['Kecamatan'] || 'Purbalingga',
          phone: row['No. WhatsApp'] || row['No WA'] || row['Telepon'] || '-',
          email: row['Email'] || `guru${idx}@guru.smp.belajar.id`,
          status: 'Aktif',
          joinedDate: new Date().toISOString().split('T')[0],
          notes: 'Diimpor dari file Excel/Spreadsheet'
        }));

        resolve(parsedMembers);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function exportAttendancesToExcel(
  attendances: Attendance[],
  activityTitle: string,
  filename = 'Rekap_Presensi_Kegiatan.xlsx'
) {
  const exportData = attendances.map((att, idx) => ({
    No: idx + 1,
    'Nama Guru': att.memberName,
    'Asal Sekolah': att.schoolName,
    NIP: att.nip || '-',
    'Waktu Hadir': att.timestamp,
    Status: att.status,
    Metode: att.method,
    Catatan: att.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi');
  XLSX.writeFile(workbook, filename);
}

export function printMemberCard(member: Member, org: OrganizationSetting) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Kartu Anggota - ${member.fullName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; background-color: #f1f5f9; }
          .card-wrapper { display: flex; flex-direction: column; gap: 20px; }
          .id-card {
            width: 350px;
            height: 220px;
            border-radius: 12px;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
            color: #ffffff;
            padding: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
          }
          .card-header { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px; }
          .card-header img { width: 36px; height: 36px; border-radius: 50%; background: #fff; }
          .card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2; }
          .card-subtitle { font-size: 9px; opacity: 0.85; font-weight: 400; }
          .card-body { display: flex; gap: 14px; margin-top: 12px; align-items: center; }
          .photo-frame { width: 70px; height: 85px; border-radius: 6px; border: 2px solid #38bdf8; overflow: hidden; background: #334155; }
          .photo-frame img { width: 100%; height: 100%; object-fit: cover; }
          .member-info { flex: 1; font-size: 10px; line-height: 1.4; }
          .member-name { font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 2px; }
          .member-num { font-size: 9px; background: rgba(56, 189, 248, 0.2); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px; font-family: monospace; }
          .card-footer { position: absolute; bottom: 8px; left: 16px; right: 16px; display: flex; justify-content: space-between; font-size: 8px; opacity: 0.75; }
          @media print {
            body { background: none; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="card-wrapper">
          <div class="no-print" style="text-align: center; margin-bottom: 10px;">
            <button onclick="window.print()" style="padding: 8px 18px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Cetak Kartu Anggota</button>
          </div>
          <div class="id-card">
            <div class="card-header">
              <div class="card-title">
                ${org.orgName}
                <div class="card-subtitle">${org.region} | ${org.activeAcademicYear}</div>
              </div>
            </div>
            <div class="card-body">
              <div class="photo-frame">
                <img src="${member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}" alt="Foto" />
              </div>
              <div class="member-info">
                <div class="member-num">${member.memberNumber}</div>
                <div class="member-name">${member.fullName}, ${member.title || ''}</div>
                <div><strong>NIP:</strong> ${member.nip || '-'}</div>
                <div><strong>Sekolah:</strong> ${member.schoolName}</div>
                <div><strong>Kecamatan:</strong> ${member.subdistrict}</div>
                <div><strong>Status:</strong> ${member.status}</div>
              </div>
            </div>
            <div class="card-footer">
              <span>Masa Berlaku: ${org.period}</span>
              <span>Ketua: ${org.welcomeLeaderName}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printActivityInvitation(activity: Activity, org: OrganizationSetting) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Surat Undangan - ${activity.title}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 40px; color: #000; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 24px; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header h3 { margin: 4px 0; font-size: 16px; }
          .header p { margin: 0; font-size: 13px; }
          .letter-meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; }
          .content-table { margin: 16px 0; border-collapse: collapse; }
          .content-table td { padding: 4px 10px; font-size: 14px; vertical-align: top; }
          .signatures { display: flex; justify-content: flex-end; margin-top: 50px; text-align: center; }
          .sig-box { width: 250px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #1e3a8a; color: white; border: none; border-radius: 4px; cursor: pointer;">Cetak Surat Undangan (PDF)</button>
        </div>
        <div class="header">
          <h2>${org.orgName}</h2>
          <h3>${org.educationLevel} ${org.region}</h3>
          <p>Sekretariat: ${org.secretariatAddress}</p>
          <p>Email: ${org.email} | Kontak: ${org.contactPhone}</p>
        </div>
        <div class="letter-meta">
          <div>
            <div>Nomor: 042/MGMP-PJOK/UND/${new Date().getFullYear()}</div>
            <div>Lampiran: 1 (satu) Berkas</div>
            <div>Hal: <strong>Undangan ${activity.type}</strong></div>
          </div>
          <div>Purbalingga, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <p>Kepada Yth.<br/><strong>Bapak/Ibu Kepala SMP Negeri & Swasta</strong><br/>se-Kabupaten Purbalingga<br/>di Tempat</p>
        <p>Dengan hormat,<br/>Dalam rangka peningkatan mutu pembelajaran dan profesionalisme guru PJOK SMP di lingkungan Kabupaten Purbalingga, pengurus MGMP PJOK mengundang Bapak/Ibu Guru PJOK di sekolah yang Bapak/Ibu pimpin untuk dapat hadir pada kegiatan:</p>
        <table class="content-table">
          <tr><td width="150"><strong>Kegiatan</strong></td><td>: ${activity.title}</td></tr>
          <tr><td><strong>Jenis Kegiatan</strong></td><td>: ${activity.type}</td></tr>
          <tr><td><strong>Hari, Tanggal</strong></td><td>: ${activity.date}</td></tr>
          <tr><td><strong>Waktu</strong></td><td>: ${activity.time}</td></tr>
          <tr><td><strong>Tempat</strong></td><td>: ${activity.location}</td></tr>
          <tr><td><strong>Narasumber</strong></td><td>: ${activity.speaker || 'Tim MGMP PJOK Purbalingga'}</td></tr>
          <tr><td><strong>Keterangan</strong></td><td>: Presensi digital hadir melalui QR Code resmi portal MGMP.</td></tr>
        </table>
        <p>Mengingat pentingnya kegiatan tersebut, kami mohon Bapak/Ibu berkenan menugaskan guru PJOK yang bersangkutan. Demikian surat undangan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.</p>
        <div class="signatures">
          <div class="sig-box">
            <div>Pengurus MGMP PJOK SMP<br/>Kabupaten Purbalingga</div>
            <div style="height: 60px;"></div>
            <div><strong><u>${org.welcomeLeaderName}</u></strong><br/>Ketua MGMP</div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
