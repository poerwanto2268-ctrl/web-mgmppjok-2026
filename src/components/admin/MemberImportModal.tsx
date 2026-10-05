import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Database,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Info,
  Loader2,
  ListFilter,
  Users,
} from 'lucide-react';
import { Member, School, MemberRegistrationConfig } from '../../types';
import {
  downloadMemberImportTemplate,
  readExcelFile,
  fetchSpreadsheetRows,
  autoDetectColumnMapping,
  APPLICATION_IMPORT_FIELDS,
  AppImportField,
} from '../../services/exportService';
import {
  bulkImportMembers,
  createImportLog,
  getRegistrationConfig,
  updateRegistrationConfig,
} from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

interface MemberImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: Member[];
  schools: School[];
  onImportSuccess: () => void;
}

interface ParsedCandidate {
  raw: any;
  rowIndex: number;
  data: Partial<Member>;
  isValid: boolean;
  validationErrors: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
  matchedExistingMember?: Member;
  action: 'insert' | 'update' | 'skip';
}

export const MemberImportModal: React.FC<MemberImportModalProps> = ({
  isOpen,
  onClose,
  existingMembers,
  schools,
  onImportSuccess,
}) => {
  const { user } = useAuth();

  // Multi-step wizard
  // Step 1: Select Source (Excel / Google Spreadsheet)
  // Step 2: Column Mapping
  // Step 3: Preview & Duplicate Handling
  // Step 4: Final Confirmation & Result
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [sourceType, setSourceType] = useState<'excel' | 'spreadsheet'>('excel');

  // Excel File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Spreadsheet State
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('Form Responses 1');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [isCheckingSpreadsheet, setIsCheckingSpreadsheet] = useState(false);
  const [spreadsheetInspection, setSpreadsheetInspection] = useState<{
    totalRows: number;
    detectedColumns: string[];
    sheetName: string;
  } | null>(null);

  // Raw data from file/spreadsheet
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [sourceName, setSourceName] = useState<string>('');

  // Column Mapping
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Parsed candidates
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [filterPreviewStatus, setFilterPreviewStatus] = useState<'ALL' | 'VALID' | 'DUPLICATE' | 'ERROR'>('ALL');

  // Import options
  const [globalDuplicateMode, setGlobalDuplicateMode] = useState<'insert' | 'update' | 'skip'>('skip');
  const [defaultImportStatus, setDefaultImportStatus] = useState<'Menunggu Verifikasi' | 'Aktif'>('Menunggu Verifikasi');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    added: number;
    updated: number;
    skipped: number;
    failed: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load saved registration config on open
  useEffect(() => {
    async function loadConfig() {
      if (isOpen) {
        try {
          const cfg = await getRegistrationConfig();
          if (cfg.spreadsheetUrl) setSpreadsheetUrl(cfg.spreadsheetUrl);
          if (cfg.sheetName) setSheetName(cfg.sheetName);
          if (cfg.googleFormUrl) setGoogleFormUrl(cfg.googleFormUrl);
        } catch (e) {
          console.error('Failed to load registration config:', e);
        }
      }
    }
    loadConfig();
  }, [isOpen]);

  // Handle Excel file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSourceName(file.name);

    try {
      const result = await readExcelFile(file);
      if (result.rows.length === 0) {
        setErrorMessage('File Excel kosong atau tidak memiliki baris data.');
        return;
      }
      setRawRows(result.rows);
      setDetectedColumns(result.columns);

      // Auto detect mappings
      const initialMap = autoDetectColumnMapping(result.columns);
      setColumnMapping(initialMap);

      // Proceed to Step 2
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMessage(`Gagal membaca file Excel: ${err.message || 'Format tidak valid'}`);
    }
  };

  // Handle Google Spreadsheet Check
  const handleCheckSpreadsheet = async () => {
    if (!spreadsheetUrl) {
      setErrorMessage('Harap masukkan URL Google Spreadsheet.');
      return;
    }
    setErrorMessage('');
    setIsCheckingSpreadsheet(true);

    try {
      const result = await fetchSpreadsheetRows(spreadsheetUrl, sheetName);
      if (result.rows.length === 0) {
        throw new Error('Spreadsheet terbaca tetapi tidak ditemukan baris data pada sheet yang dipilih.');
      }

      setRawRows(result.rows);
      setDetectedColumns(result.columns);
      setSourceName(`Google Spreadsheet: ${sheetName || 'Utama'}`);
      setSpreadsheetInspection({
        totalRows: result.rows.length,
        detectedColumns: result.columns,
        sheetName: sheetName || 'Default',
      });

      // Auto detect mappings
      const initialMap = autoDetectColumnMapping(result.columns);
      setColumnMapping(initialMap);

      // Also persist URL to config
      await updateRegistrationConfig({
        spreadsheetUrl,
        sheetName,
        googleFormUrl,
      });

      // Proceed to Step 2
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Gagal memeriksa Google Spreadsheet. Pastikan URL benar dan izin akses publik/berbagi diatur ke "Siapa saja yang memiliki link dapat melihat".'
      );
    } finally {
      setIsCheckingSpreadsheet(false);
    }
  };

  // Convert raw rows into validated candidates based on current column mapping
  const processRawRowsIntoCandidates = () => {
    const list: ParsedCandidate[] = [];

    // Filter out dummy/sample rows
    const isSampleRow = (row: any) => {
      const val = Object.values(row).join(' ').toLowerCase();
      return val.includes('contoh') || val.includes('petunjuk pengisian');
    };

    rawRows.forEach((row, idx) => {
      if (isSampleRow(row)) return;

      const getVal = (fieldKey: string): string => {
        const col = columnMapping[fieldKey];
        if (!col || row[col] === undefined || row[col] === null) return '';
        return String(row[col]).trim();
      };

      const fullName = getVal('fullName');
      const schoolName = getVal('schoolName');
      const nip = getVal('nip').replace(/[^0-9]/g, '');
      const nik = getVal('nik').replace(/[^0-9]/g, '');
      const nuptk = getVal('nuptk').replace(/[^0-9]/g, '');
      const genderRaw = getVal('gender').toLowerCase();
      const gender: 'Laki-laki' | 'Perempuan' =
        genderRaw.includes('perempuan') || genderRaw === 'p' ? 'Perempuan' : 'Laki-laki';
      const phone = getVal('phone');
      const email = getVal('email');
      const birthPlace = getVal('birthPlace');
      const birthDate = getVal('birthDate');
      const title = getVal('title') || 'S.Pd.';
      const rankGrade = getVal('rankGrade');
      const position = getVal('position') || 'Guru PJOK';
      const subject = getVal('subject') || 'PJOK';
      const npsn = getVal('npsn');
      const schoolAddress = getVal('schoolAddress');
      const subdistrictRaw = getVal('subdistrict');
      const subdistrict = subdistrictRaw || 'Purbalingga';
      const statusRaw = getVal('status');

      // Validation
      const errors: string[] = [];
      if (!fullName) errors.push('Nama Lengkap wajib diisi');
      if (!schoolName) errors.push('Nama Sekolah wajib diisi');

      const isValid = errors.length === 0;

      // Duplicate Check with Priority:
      // 1. NIP match
      // 2. NUPTK match
      // 3. Email match
      // 4. Full Name + School combination
      let matchedMember: Member | undefined;
      let duplicateReason = '';

      if (nip) {
        matchedMember = existingMembers.find((m) => m.nip && m.nip.replace(/[^0-9]/g, '') === nip);
        if (matchedMember) duplicateReason = `NIP cocok dengan anggota: ${matchedMember.fullName}`;
      }

      if (!matchedMember && nuptk) {
        matchedMember = existingMembers.find((m) => m.nuptk && m.nuptk.replace(/[^0-9]/g, '') === nuptk);
        if (matchedMember) duplicateReason = `NUPTK cocok dengan anggota: ${matchedMember.fullName}`;
      }

      if (!matchedMember && email) {
        matchedMember = existingMembers.find(
          (m) => m.email && m.email.toLowerCase() === email.toLowerCase()
        );
        if (matchedMember) duplicateReason = `Email cocok dengan anggota: ${matchedMember.fullName}`;
      }

      if (!matchedMember && fullName && schoolName) {
        matchedMember = existingMembers.find(
          (m) =>
            m.fullName.toLowerCase() === fullName.toLowerCase() &&
            m.schoolName.toLowerCase() === schoolName.toLowerCase()
        );
        if (matchedMember) duplicateReason = `Nama dan Sekolah sama persis: ${matchedMember.fullName}`;
      }

      const isDuplicate = !!matchedMember;

      // Determine initial action based on globalDuplicateMode
      let action: 'insert' | 'update' | 'skip' = 'insert';
      if (!isValid) {
        action = 'skip';
      } else if (isDuplicate) {
        action = globalDuplicateMode;
      }

      // Final status: prioritize user selection or row value
      const status =
        (statusRaw === 'Aktif' || statusRaw === 'Menunggu Verifikasi')
          ? statusRaw
          : defaultImportStatus;

      const memberData: Partial<Member> = {
        fullName,
        title,
        nip,
        nik,
        nuptk,
        gender,
        schoolName,
        npsn,
        schoolAddress,
        subdistrict,
        phone,
        email,
        birthPlace,
        birthDate,
        rankGrade,
        position,
        subject,
        status,
        joinedDate: new Date().toISOString().split('T')[0],
        importedAt: new Date().toISOString(),
        importSource: sourceType === 'excel' ? 'File Excel' : 'Google Spreadsheet',
      };

      list.push({
        raw: row,
        rowIndex: idx + 1,
        data: memberData,
        isValid,
        validationErrors: errors,
        isDuplicate,
        duplicateReason,
        matchedExistingMember: matchedMember,
        action,
      });
    });

    setCandidates(list);
    setCurrentStep(3);
  };

  // Re-apply duplicate action when global mode changes
  const applyGlobalDuplicateMode = (mode: 'insert' | 'update' | 'skip') => {
    setGlobalDuplicateMode(mode);
    setCandidates((prev) =>
      prev.map((c) => {
        if (!c.isValid) return { ...c, action: 'skip' };
        if (c.isDuplicate) return { ...c, action: mode };
        return { ...c, action: 'insert' };
      })
    );
  };

  // Toggle single row action
  const toggleRowAction = (index: number, newAction: 'insert' | 'update' | 'skip') => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, action: newAction } : c))
    );
  };

  // Execute Final Import
  const handleExecuteImport = async () => {
    setIsProcessing(true);
    setProcessProgress(20);

    const validActionItems = candidates.filter((c) => c.action !== 'skip' && c.isValid);
    const totalToProcess = validActionItems.length;

    try {
      const itemsToBulk = validActionItems.map((c, i) => ({
        memberData: {
          ...c.data,
          // Generate provisional NIA if new insert
          memberNumber: c.action === 'insert'
            ? `MGMP-IMP-${Date.now().toString().slice(-4)}${i + 1}`
            : c.matchedExistingMember?.memberNumber,
        },
        isUpdate: c.action === 'update',
        targetId: c.matchedExistingMember?.id || c.matchedExistingMember?.memberNumber,
      }));

      setProcessProgress(50);
      const result = await bulkImportMembers(itemsToBulk);
      setProcessProgress(80);

      const skippedCount = candidates.filter((c) => c.action === 'skip').length;
      const duplicatesCount = candidates.filter((c) => c.isDuplicate).length;

      // Log import into Firestore
      await createImportLog({
        timestamp: new Date().toISOString(),
        adminName: user?.displayName || 'Pengurus MGMP',
        adminEmail: user?.email || 'admin@mgmppjok.id',
        sourceType: sourceType === 'excel' ? 'Upload Excel' : 'Google Spreadsheet',
        sourceName,
        totalRead: candidates.length,
        successCount: result.added,
        updatedCount: result.updated,
        rejectedCount: skippedCount + result.failed,
        duplicateCount: duplicatesCount,
        details: `Import selesai. Ditambahkan: ${result.added}, Diperbarui: ${result.updated}, Dilewati: ${skippedCount}, Gagal: ${result.failed}`,
      });

      setProcessProgress(100);
      setImportSummary({
        total: candidates.length,
        added: result.added,
        updated: result.updated,
        skipped: skippedCount,
        failed: result.failed,
      });

      setCurrentStep(4);
      onImportSuccess();
    } catch (err: any) {
      console.error('Import failed:', err);
      setErrorMessage(`Proses import gagal: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset modal state
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setRawRows([]);
    setDetectedColumns([]);
    setCandidates([]);
    setErrorMessage('');
    setImportSummary(null);
  };

  const filteredCandidates = candidates.filter((c) => {
    if (filterPreviewStatus === 'VALID') return c.isValid && !c.isDuplicate;
    if (filterPreviewStatus === 'DUPLICATE') return c.isDuplicate;
    if (filterPreviewStatus === 'ERROR') return !c.isValid;
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📥 Import Data Anggota MGMP PJOK"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                currentStep === 1
                  ? 'bg-blue-600 text-white'
                  : currentStep > 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>1</span>
              <span>Pilih Sumber</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

            <span
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-blue-600 text-white'
                  : currentStep > 2
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>2</span>
              <span>Pemetaan Kolom</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

            <span
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                currentStep === 3
                  ? 'bg-blue-600 text-white'
                  : currentStep > 3
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>3</span>
              <span>Pratinjau & Validasi</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

            <span
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                currentStep === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>4</span>
              <span>Selesai</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Database Utama: MGMP Purbalingga
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 text-xs sm:text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* ==================== STEP 1: SELECT DATA SOURCE ==================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Source Type Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSourceType('excel')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                  sourceType === 'excel'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    sourceType === 'excel' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Upload File Excel</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Gunakan template standar format .xlsx / .xls
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('spreadsheet')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                  sourceType === 'spreadsheet'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    sourceType === 'spreadsheet'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Google Spreadsheet</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Hubungkan langsung dari respon Google Formulir
                  </div>
                </div>
              </button>
            </div>

            {/* TAB 1: EXCEL UPLOAD */}
            {sourceType === 'excel' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      Format Standar Pendataan Anggota MGMP
                    </span>
                    <p className="text-xs text-slate-500">
                      Unduh template resmi yang sudah dilengkapi kolom dan petunjuk pengisian.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadMemberImportTemplate}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer shrink-0 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>⬇️ Download Template Excel</span>
                  </button>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 sm:p-12 text-center bg-white hover:bg-blue-50/20 transition-all cursor-pointer space-y-3"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Klik untuk Upload File Excel (.xlsx, .xls)
                    </p>
                    <p className="text-xs text-slate-500">
                      Sistem akan membaca kolom dan menampilkan pratinjau sebelum disimpan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GOOGLE SPREADSHEET */}
            {sourceType === 'spreadsheet' && (
              <div className="space-y-4">
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-2 text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Alur Pendataan Google Formulir:
                  </p>
                  <p className="text-[11px] text-blue-800">
                    1. Pengurus membagikan Google Formulir ke guru PJOK.<br />
                    2. Respon masuk otomatis ke Google Spreadsheet.<br />
                    3. Salin URL Spreadsheet di bawah ini dan klik <strong>"Periksa Spreadsheet"</strong>.<br />
                    4. <em>Penting:</em> Pastikan izin Spreadsheet disetel ke <strong>"Siapa saja yang memiliki link dapat melihat" (Viewer)</strong>.
                  </p>
                </div>

                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      URL Google Spreadsheet *
                    </label>
                    <input
                      type="url"
                      value={spreadsheetUrl}
                      onChange={(e) => setSpreadsheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Nama Sheet (Lembar Kerja)
                      </label>
                      <input
                        type="text"
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        placeholder="Form Responses 1"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        URL Google Formulir (Opsional)
                      </label>
                      <input
                        type="url"
                        value={googleFormUrl}
                        onChange={(e) => setGoogleFormUrl(e.target.value)}
                        placeholder="https://forms.gle/..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                          '_blank'
                        )
                      }
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>📋 Gunakan Template Google Spreadsheet</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCheckingSpreadsheet || !spreadsheetUrl}
                      onClick={handleCheckSpreadsheet}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                    >
                      {isCheckingSpreadsheet ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span>🔍 Periksa Spreadsheet</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 2: COLUMN MAPPING ==================== */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Pemetaan Kolom (Column Mapping)
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sumber: <strong>{sourceName}</strong> ({rawRows.length} baris terdeteksi).
                  Periksa apakah kolom file cocok dengan data aplikasi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Ganti Sumber Data
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-1/3">Kolom Aplikasi MGMP</th>
                    <th className="py-2.5 px-3 w-1/3">Kolom di File / Spreadsheet</th>
                    <th className="py-2.5 px-3 w-1/3">Contoh Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {APPLICATION_IMPORT_FIELDS.map((field) => {
                    const mappedCol = columnMapping[field.key] || '';
                    const sampleVal = rawRows[0] && mappedCol ? String(rawRows[0][mappedCol] || '-') : '-';

                    return (
                      <tr key={field.key} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{field.label}</span>
                            {field.required && (
                              <span className="text-[10px] text-rose-500 font-bold">*Wajib</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={mappedCol}
                            onChange={(e) =>
                              setColumnMapping((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white ${
                              mappedCol
                                ? 'border-emerald-300 text-emerald-900 bg-emerald-50/30 font-medium'
                                : field.required
                                ? 'border-rose-300 text-rose-800'
                                : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            <option value="">-- Tidak Dipetakan --</option>
                            {detectedColumns.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 truncate max-w-[200px]">
                          {sampleVal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={processRawRowsIntoCandidates}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <span>👁️ Lanjut ke Pratinjau & Validasi Data</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 3: PREVIEW & DUPLICATE HANDLING ==================== */}
        {currentStep === 3 && (
          <div className="space-y-5">
            {/* Options Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className="text-slate-500">Total Dibaca: </span>
                    <strong className="text-slate-900 font-bold">{candidates.length} baris</strong>
                  </div>

                  <span className="text-slate-300">•</span>

                  <div className="text-xs text-emerald-700 font-semibold">
                    Valid: {candidates.filter((c) => c.isValid && !c.isDuplicate).length}
                  </div>

                  <span className="text-slate-300">•</span>

                  <div className="text-xs text-amber-700 font-semibold">
                    Duplikat: {candidates.filter((c) => c.isDuplicate).length}
                  </div>

                  <span className="text-slate-300">•</span>

                  <div className="text-xs text-rose-700 font-semibold">
                    Error: {candidates.filter((c) => !c.isValid).length}
                  </div>
                </div>

                {/* Status Destination Option (Section 27) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-semibold">Status Awal Anggota:</span>
                  <select
                    value={defaultImportStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setDefaultImportStatus(newStatus);
                      setCandidates((prev) =>
                        prev.map((c) => ({
                          ...c,
                          data: { ...c.data, status: newStatus },
                        }))
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white font-bold text-blue-700"
                  >
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi (Calon Anggota)</option>
                    <option value="Aktif">Langsung Aktif</option>
                  </select>
                </div>
              </div>

              {/* Duplicate Handling Mode Selector (Section 24) */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-700">Jika Ditemukan Data Duplikat:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyGlobalDuplicateMode('skip')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      globalDuplicateMode === 'skip'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Lewati Duplikat
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGlobalDuplicateMode('update')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      globalDuplicateMode === 'update'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Perbarui Data yang Ada
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGlobalDuplicateMode('insert')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      globalDuplicateMode === 'insert'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Simpan Sebagai Anggota Baru
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterPreviewStatus('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  filterPreviewStatus === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Semua ({candidates.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPreviewStatus('VALID')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  filterPreviewStatus === 'VALID' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Valid ({candidates.filter((c) => c.isValid && !c.isDuplicate).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPreviewStatus('DUPLICATE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  filterPreviewStatus === 'DUPLICATE' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Duplikat ({candidates.filter((c) => c.isDuplicate).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPreviewStatus('ERROR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  filterPreviewStatus === 'ERROR' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Error ({candidates.filter((c) => !c.isValid).length})
              </button>
            </div>

            {/* Table of Candidates */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Lengkap & NIP</th>
                    <th className="py-2.5 px-3">Sekolah</th>
                    <th className="py-2.5 px-3">Status Validasi</th>
                    <th className="py-2.5 px-3 text-center">Tindakan Import</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((c, index) => {
                    const actualIdx = c.rowIndex;
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-slate-50/80 ${
                          !c.isValid
                            ? 'bg-rose-50/30'
                            : c.isDuplicate
                            ? 'bg-amber-50/30'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-slate-400">{actualIdx}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">
                            {c.data.fullName || <span className="text-rose-500 italic">Nama kosong</span>}
                            {c.data.title ? `, ${c.data.title}` : ''}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            NIP: {c.data.nip || '-'} • NUPTK: {c.data.nuptk || '-'}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-800">
                            {c.data.schoolName || <span className="text-rose-500 italic">Sekolah kosong</span>}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Kec. {c.data.subdistrict || 'Purbalingga'}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          {!c.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                              <X className="w-3 h-3" />
                              {c.validationErrors.join(', ')}
                            </span>
                          ) : c.isDuplicate ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                ⚠️ Duplikat
                              </span>
                              <div className="text-[10px] text-amber-900 leading-tight">
                                {c.duplicateReason}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <Check className="w-3 h-3" />
                              Valid
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <select
                            value={c.action}
                            onChange={(e) =>
                              toggleRowAction(index, e.target.value as any)
                            }
                            className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                              c.action === 'insert'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : c.action === 'update'
                                ? 'border-blue-300 bg-blue-50 text-blue-800'
                                : 'border-slate-200 bg-slate-100 text-slate-500'
                            }`}
                          >
                            <option value="insert">Tambah Baru</option>
                            {c.isDuplicate && <option value="update">Perbarui</option>}
                            <option value="skip">Lewati</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Kembali ke Pemetaan
              </button>

              <button
                type="button"
                disabled={isProcessing || candidates.filter((c) => c.action !== 'skip').length === 0}
                onClick={handleExecuteImport}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database ({processProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>
                      Konfirmasi & Simpan (
                      {candidates.filter((c) => c.action !== 'skip').length} Anggota)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 4: SUCCESS SUMMARY ==================== */}
        {currentStep === 4 && importSummary && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 font-sport">
                Proses Import Data Berhasil!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Data anggota telah berhasil disimpan ke database utama MGMP PJOK SMP Kabupaten Purbalingga.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Total Baris</div>
                <div className="text-lg font-black text-slate-800">{importSummary.total}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <div className="text-[11px] text-emerald-600">Ditambahkan</div>
                <div className="text-lg font-black text-emerald-700">+{importSummary.added}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
                <div className="text-[11px] text-blue-600">Diperbarui</div>
                <div className="text-lg font-black text-blue-700">{importSummary.updated}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Dilewati</div>
                <div className="text-lg font-black text-slate-600">{importSummary.skipped}</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 max-w-lg mx-auto leading-relaxed text-left">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <Info className="w-4 h-4 text-blue-600" />
                Langkah Selanjutnya:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800 text-[11px]">
                <li>
                  Data calon anggota kini tampil pada tab <strong>"Calon Anggota"</strong> untuk diverifikasi & disetujui.
                </li>
                <li>
                  Setelah disetujui, Kartu Anggota digital dan QR Code otomatis diterbitkan serta dapat dicetak langsung.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Import Lagi
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
