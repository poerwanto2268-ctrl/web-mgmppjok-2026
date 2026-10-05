export type UserRole = 
  | 'Super Admin' 
  | 'Ketua' 
  | 'Sekretaris' 
  | 'Bendahara' 
  | 'Pengurus' 
  | 'Anggota' 
  | 'Pengunjung';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  memberId?: string;
  isCustomRole?: boolean;
  status?: 'Aktif' | 'Nonaktif';
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminActivityLog {
  id?: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  adminRole: UserRole;
  action: string;
  module: string;
  details: string;
  targetId?: string;
}

export interface OrganizationSetting {
  id?: string;
  orgName: string;
  tagline: string;
  educationLevel: string;
  region: string;
  secretariatAddress: string;
  email: string;
  contactPhone: string;
  logoUrl: string;
  logoInstansiUrl: string;
  period: string;
  activeAcademicYear: string;
  vision: string;
  mission: string;
  welcomeMessage: string;
  welcomeLeaderName: string;
  welcomeLeaderTitle: string;
  welcomeLeaderPhoto: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface MemberCardSettings {
  id?: string;
  leaderName: string;
  leaderTitle: string;
  leaderPosition: string;
  signatureUrl: string;
  logoUrl?: string;
  secondaryLogoUrl?: string;
  period: string;
  validUntil: string;
  cardNote: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Member {
  id: string;
  memberNumber: string;
  fullName: string;
  title: string;
  nip?: string;
  nik?: string;
  nuptk?: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace?: string;
  birthDate?: string;
  rankGrade?: string; // Pangkat / Golongan
  position?: string; // Jabatan (Guru PJOK / Kepala Sekolah / dll)
  subject?: string; // Mata Pelajaran
  schoolId?: string;
  schoolName: string;
  npsn?: string;
  schoolAddress?: string;
  subdistrict: string;
  phone: string;
  email: string;
  photoUrl?: string;
  status: 'Aktif' | 'Non-Aktif' | 'Mutasi' | 'Pensiun' | 'Menunggu Verifikasi' | 'Ditolak' | 'Tidak Aktif';
  joinedDate: string;
  notes?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  importedAt?: string;
  importSource?: string;
}

export interface ImportLog {
  id?: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  sourceType: 'Upload Excel' | 'Google Spreadsheet';
  sourceName: string;
  totalRead: number;
  successCount: number;
  updatedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  details?: string;
}

export interface MemberRegistrationConfig {
  id?: string;
  spreadsheetUrl: string;
  sheetName: string;
  googleFormUrl?: string;
  templateSpreadsheetUrl?: string;
  autoVerification?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface School {
  id: string;
  name: string;
  npsn: string;
  subdistrict: string;
  address: string;
  principalName?: string;
  status: 'Negeri' | 'Swasta';
  phone?: string;
}

export type ActivityType = 
  | 'Pertemuan Rutin' 
  | 'Workshop' 
  | 'IHT' 
  | 'Pelatihan' 
  | 'Seminar' 
  | 'Diseminasi' 
  | 'Kegiatan Olahraga Bersama' 
  | 'Rapat Pengurus';

export type ActivityStatus = 
  | 'Direncanakan' 
  | 'Pendaftaran' 
  | 'Berlangsung' 
  | 'Selesai' 
  | 'Dibatalkan';

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  description: string;
  date: string;
  time: string;
  location: string;
  speaker?: string;
  pic?: string;
  quota?: number;
  status: ActivityStatus;
  documentationUrls?: string[];
  materialUrls?: string[];
  qrCodeToken: string;
  allowPublicPresensi?: boolean;
  registeredMemberIds?: string[];
  createdAt?: string;
  createdBy?: string;
}

export interface Attendance {
  id: string;
  activityId: string;
  memberId: string;
  memberName: string;
  schoolName: string;
  nip?: string;
  timestamp: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Tugas Luar';
  method: 'QR' | 'Manual';
  notes?: string;
}

export type ResourceCategory = 
  | 'Capaian Pembelajaran (CP)' 
  | 'Alur Tujuan Pembelajaran (ATP)' 
  | 'Modul Ajar' 
  | 'Rencana Pembelajaran Mendalam' 
  | 'Program Tahunan' 
  | 'Program Semester' 
  | 'Asesmen Diagnostik' 
  | 'Asesmen Formatif' 
  | 'Asesmen Sumatif' 
  | 'LKPD' 
  | 'Rubrik Penilaian' 
  | 'Media Pembelajaran' 
  | 'Bahan Presentasi';

export type SportTopic = 
  | 'Permainan Bola Besar' 
  | 'Permainan Bola Kecil' 
  | 'Atletik' 
  | 'Kebugaran Jasmani' 
  | 'Senam' 
  | 'Aktivitas Gerak Berirama' 
  | 'Aktivitas Air' 
  | 'Pendidikan Kesehatan' 
  | 'Aktivitas Olahraga Tradisional' 
  | 'Aktivitas Jasmani Lainnya';

export interface LearningResource {
  id: string;
  title: string;
  category: ResourceCategory;
  phase: string; // Fase D
  grade: 'Kelas VII' | 'Kelas VIII' | 'Kelas IX' | 'Semua Kelas';
  curriculum: 'Kurikulum Merdeka' | 'Kurikulum 2013';
  sportTopic: SportTopic;
  academicYear: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  uploaderId: string;
  uploaderName: string;
  approvalStatus: 'Disetujui' | 'Menunggu' | 'Ditolak';
  version: string;
  downloadsCount: number;
  createdAt?: string;
}

export type DocumentCategory = 
  | 'Administrasi MGMP' 
  | 'Surat Masuk' 
  | 'Surat Keluar' 
  | 'Undangan' 
  | 'Notulen Rapat' 
  | 'Proposal' 
  | 'Laporan Kegiatan' 
  | 'Dokumentasi' 
  | 'Dokumen Kurikulum' 
  | 'Dokumen Lainnya';

export interface OrgDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  year: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  accessLevel: 'Publik' | 'Anggota' | 'Pengurus';
  uploadedBy: string;
  createdAt?: string;
}

export interface Training {
  id: string;
  title: string;
  instructor: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  quota: number;
  hours: number; // e.g. 32 JP
  certificateTemplate: string;
  status: 'Buka Pendaftaran' | 'Sedang Berjalan' | 'Selesai';
  registeredMemberIds: string[];
  materials?: string;
  createdAt?: string;
}

export interface DiscussionComment {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: string;
}

export interface Discussion {
  id: string;
  title: string;
  category: 'Diskusi Pembelajaran' | 'Asesmen PJOK' | 'Kurikulum' | 'Media Pembelajaran' | 'Praktik Baik' | 'Informasi Organisasi';
  content: string;
  authorId: string;
  authorName: string;
  authorSchool: string;
  repliesCount: number;
  isPinned: boolean;
  isReported: boolean;
  createdAt: string;
}

export interface BestPractice {
  id: string;
  title: string;
  authorName: string;
  authorSchool: string;
  category: 'Inovasi Pembelajaran' | 'Video Praktik Pembelajaran' | 'Modifikasi Permainan' | 'Media Pembelajaran' | 'Strategi Asesmen' | 'Refleksi Pembelajaran' | 'Best Practice';
  description: string;
  mediaUrl: string;
  mediaType: 'Video' | 'Artikel' | 'Dokumen' | 'Gambar';
  publishedDate: string;
  status: 'Publik' | 'Menunggu Moderasi' | 'Draf';
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  publishedDate: string;
  coverUrl?: string;
  isPinned?: boolean;
}

export interface OrgStructureMember {
  position: string;
  name: string;
  school: string;
  photo?: string;
  nip?: string;
  phone?: string;
  subdistrict?: string;
}

export interface OrgStructure {
  id?: string;
  period: string;
  skNumber: string;
  advisor: string; // Pembina (Kepala Dinas / Pengawas)
  leader: OrgStructureMember;
  viceLeader?: OrgStructureMember;
  secretary: OrgStructureMember;
  viceSecretary?: OrgStructureMember;
  treasurer: OrgStructureMember;
  viceTreasurer?: OrgStructureMember;
  divisions: {
    name: string;
    coordinator: OrgStructureMember;
    members: OrgStructureMember[];
  }[];
}
