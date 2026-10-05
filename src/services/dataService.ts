import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  OrganizationSetting,
  MemberCardSettings,
  Member,
  ImportLog,
  MemberRegistrationConfig,
  School,
  Activity,
  Attendance,
  LearningResource,
  OrgDocument,
  Training,
  Discussion,
  DiscussionComment,
  BestPractice,
  Announcement,
  OrgStructure,
  AppUser,
  UserRole,
  AdminActivityLog,
} from '../types';

// Default signature SVG data URI for Ketua MGMP
export const DEFAULT_KETUA_SIGNATURE_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" fill="none"><path d="M20,55 C45,18 62,70 82,28 C96,6 112,62 132,38 C148,22 158,52 178,42 C194,35 212,48 226,32 M45,45 C75,38 125,42 165,36" stroke="%231e3a8a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export const DEFAULT_MEMBER_CARD_SETTINGS: MemberCardSettings = {
  leaderName: 'Sutarman',
  leaderTitle: 'S.Pd., M.Pd.',
  leaderPosition: 'Ketua MGMP PJOK SMP Kabupaten Purbalingga',
  signatureUrl: DEFAULT_KETUA_SIGNATURE_SVG,
  logoUrl: '',
  secondaryLogoUrl: '',
  period: '2024 - 2027',
  validUntil: 'Selama Menjadi Anggota Aktif',
  cardNote: '1. Kartu ini merupakan tanda pengenal resmi anggota MGMP PJOK SMP Kabupaten Purbalingga.\n2. Berlaku selama pemegang kartu berstatus anggota aktif.\n3. Pindai QR Code untuk memverifikasi keabsahan kartu secara digital.\n4. Apabila kartu ini ditemukan, harap dikembalikan ke Sekretariat MGMP PJOK SMP Kab. Purbalingga.',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistem MGMP'
};

// Default initial organization settings
export const DEFAULT_ORG_SETTINGS: OrganizationSetting = {
  orgName: 'MGMP PJOK SMP KABUPATEN PURBALINGGA',
  tagline: 'Bergerak Bersama, Berkarya, dan Menginspirasi',
  educationLevel: 'Sekolah Menengah Pertama (SMP)',
  region: 'Kabupaten Purbalingga, Jawa Tengah',
  secretariatAddress: 'Kompleks SMP Negeri 1 Purbalingga, Jl. Pierre Tendean No. 2, Purbalingga Lor, Kec. Purbalingga, Kab. Purbalingga 53311',
  email: 'mgmppjoksmppbg@gmail.com',
  contactPhone: '+62 813-2744-8901',
  logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=160&auto=format&fit=crop&q=80',
  logoInstansiUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=160&auto=format&fit=crop&q=80',
  period: '2024 - 2027',
  activeAcademicYear: '2024/2025 Genap',
  vision: 'Mewujudkan komunitas guru PJOK SMP Kabupaten Purbalingga yang profesional, inovatif, berkarakter, dan adaptif terhadap transformasi kurikulum demi generasi sehat berprestasi.',
  mission: '1. Meningkatkan kompetensi pedagogik, profesional, sosial, dan kepribadian guru PJOK SMP.\n2. Mengembangkan pembelajaran PJOK yang menyenangkan, bermakna, dan inklusif berbasis Kurikulum Merdeka.\n3. Mempererat silaturahmi, kolaborasi, dan pembinaan prestasi olahraga pelajar di Purbalingga.\n4. Memfasilitasi bank sumber belajar, perangkat ajar, dan publikasi praktik baik guru secara digital.\n5. Menjalin sinergi kemitraan dengan Dinas Pendidikan & Kebudayaan serta instansi keolahragaan.',
  welcomeMessage: 'Assalamu’alaikum Warahmatullahi Wabarakatuh, Salam Sejahtera, Salam Olahraga!\n\nSelamat datang di Portal Resmi MGMP PJOK SMP Kabupaten Purbalingga. Platform ini hadir sebagai wujud transformasi digital untuk mempererat kolaborasi antar-guru, mempermudah administrasi organisasi, serta menyediakan akses seluas-luasnya terhadap perangkat ajar dan inovasi pembelajaran pendidikan jasmani. Mari terus bergerak aktif, berkarya nyata, dan menginspirasi peserta didik di seluruh penjuru Purbalingga.',
  welcomeLeaderName: 'Sutarman, S.Pd., M.Pd.',
  welcomeLeaderTitle: 'Ketua MGMP PJOK SMP Kabupaten Purbalingga',
  welcomeLeaderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
};

// Initial default structure
export const DEFAULT_ORG_STRUCTURE: OrgStructure = {
  period: '2024 - 2027',
  skNumber: 'SK.Disdikbud/421/045/2024',
  advisor: 'Kepala Dinas Pendidikan dan Kebudayaan Kab. Purbalingga & Pengawas Pembina PJOK',
  leader: {
    position: 'Ketua Umum',
    name: 'Sutarman, S.Pd., M.Pd.',
    school: 'SMP Negeri 1 Purbalingga',
    nip: '19740512 200212 1 004',
    phone: '0813-2744-8901',
    subdistrict: 'Purbalingga'
  },
  viceLeader: {
    position: 'Wakil Ketua',
    name: 'Teguh Prabowo, S.Pd.',
    school: 'SMP Negeri 1 Bobotsari',
    nip: '19780819 200604 1 009',
    phone: '0812-2983-1120',
    subdistrict: 'Bobotsari'
  },
  secretary: {
    position: 'Sekretaris I',
    name: 'Tri Wahyudi, S.Pd.',
    school: 'SMP Negeri 2 Purbalingga',
    nip: '19820311 200902 1 003',
    phone: '0857-4712-3450',
    subdistrict: 'Purbalingga'
  },
  viceSecretary: {
    position: 'Sekretaris II',
    name: 'Rina Rahmawati, S.Pd.',
    school: 'SMP Negeri 1 Bojongsari',
    nip: '19890620 201503 2 002',
    phone: '0821-3567-8899',
    subdistrict: 'Bojongsari'
  },
  treasurer: {
    position: 'Bendahara I',
    name: 'Siti Nurjanah, S.Pd.',
    school: 'SMP Negeri 1 Kalimanah',
    nip: '19811005 200801 2 011',
    phone: '0813-9122-4455',
    subdistrict: 'Kalimanah'
  },
  viceTreasurer: {
    position: 'Bendahara II',
    name: 'Endang Setyowati, S.Pd.',
    school: 'SMP Negeri 1 Bukateja',
    nip: '19850417 201001 2 018',
    phone: '0815-6677-8812',
    subdistrict: 'Bukateja'
  },
  divisions: [
    {
      name: 'Bidang Pengembangan Kurikulum, Asesmen & Mutu Pembelajaran',
      coordinator: {
        position: 'Koordinator',
        name: 'Agus Prasetyo, S.Pd.',
        school: 'SMP Negeri 1 Bobotsari',
        nip: '19800714 200701 1 012',
        subdistrict: 'Bobotsari'
      },
      members: [
        { position: 'Anggota', name: 'Joko Susilo, S.Pd.', school: 'SMP Negeri 3 Purbalingga' },
        { position: 'Anggota', name: 'Nurul Hidayati, S.Pd.', school: 'SMP Negeri 1 Kutasari' },
        { position: 'Anggota', name: 'Hendri Kurniawan, S.Pd.', school: 'SMP Negeri 1 Padamara' }
      ]
    },
    {
      name: 'Bidang Pembinaan Prestasi Olahraga Pelajar & O2SN',
      coordinator: {
        position: 'Koordinator',
        name: 'Bambang Haryanto, S.Pd., Gr.',
        school: 'SMP Negeri 1 Bukateja',
        nip: '19831122 201101 1 007',
        subdistrict: 'Bukateja'
      },
      members: [
        { position: 'Anggota', name: 'Danang Wijaya, S.Pd.', school: 'SMP Negeri 2 Kalimanah' },
        { position: 'Anggota', name: 'Fajar Nugroho, S.Pd.', school: 'SMP Negeri 1 Rembang' },
        { position: 'Anggota', name: 'Eko Sulistyo, S.Pd.', school: 'SMP Negeri 1 Karanganyar' }
      ]
    },
    {
      name: 'Bidang Publikasi Ilmiah, TIK & Hubungan Masyarakat',
      coordinator: {
        position: 'Koordinator',
        name: 'Dwi Lestari, S.Pd.',
        school: 'SMP Negeri 1 Bojongsari',
        nip: '19870102 201402 2 003',
        subdistrict: 'Bojongsari'
      },
      members: [
        { position: 'Anggota', name: 'Arief Budiman, S.Pd.', school: 'SMP Negeri 1 Kejobong' },
        { position: 'Anggota', name: 'Wahyu Ramadhan, S.Pd.', school: 'SMP Negeri 4 Purbalingga' }
      ]
    },
    {
      name: 'Bidang Sarana Prasarana, Kebugaran & Olahraga Tradisional',
      coordinator: {
        position: 'Koordinator',
        name: 'Supriyanto, S.Pd.',
        school: 'SMP Negeri 1 Mrebet',
        nip: '19790218 200501 1 008',
        subdistrict: 'Mrebet'
      },
      members: [
        { position: 'Anggota', name: 'Catur Wibowo, S.Pd.', school: 'SMP Negeri 1 Kemangkon' },
        { position: 'Anggota', name: 'Gunawan Prasetya, S.Pd.', school: 'SMP Negeri 1 Karangmoncol' }
      ]
    }
  ]
};

// Purbalingga initial schools
export const INITIAL_SCHOOLS: Omit<School, 'id'>[] = [
  { name: 'SMP Negeri 1 Purbalingga', npsn: '20303101', subdistrict: 'Purbalingga', address: 'Jl. Pierre Tendean No. 2', status: 'Negeri', principalName: 'Rini S., M.Pd.' },
  { name: 'SMP Negeri 2 Purbalingga', npsn: '20303102', subdistrict: 'Purbalingga', address: 'Jl. Kopral Tanwir No. 1', status: 'Negeri', principalName: 'Budi Santoso, M.Pd.' },
  { name: 'SMP Negeri 3 Purbalingga', npsn: '20303103', subdistrict: 'Purbalingga', address: 'Jl. Letkol Isdiman No. 45', status: 'Negeri', principalName: 'Dra. Sri Mulyani' },
  { name: 'SMP Negeri 4 Purbalingga', npsn: '20303104', subdistrict: 'Purbalingga', address: 'Jl. DI Panjaitan No. 12', status: 'Negeri', principalName: 'Suwarno, M.Pd.' },
  { name: 'SMP Negeri 5 Purbalingga', npsn: '20303105', subdistrict: 'Purbalingga', address: 'Jl. Mayjen Sungkono', status: 'Negeri', principalName: 'H. Sutrisno, M.Pd.' },
  { name: 'SMP Negeri 1 Kalimanah', npsn: '20303106', subdistrict: 'Kalimanah', address: 'Jl. Raya Mayjen Sungkono', status: 'Negeri', principalName: 'Drs. Haryanto' },
  { name: 'SMP Negeri 2 Kalimanah', npsn: '20303107', subdistrict: 'Kalimanah', address: 'Jl. Babakan No. 8', status: 'Negeri', principalName: 'Hj. Maryatun, M.Pd.' },
  { name: 'SMP Negeri 1 Bobotsari', npsn: '20303108', subdistrict: 'Bobotsari', address: 'Jl. Majapura Bobotsari', status: 'Negeri', principalName: 'Puji Haryanto, M.Pd.' },
  { name: 'SMP Negeri 2 Bobotsari', npsn: '20303109', subdistrict: 'Bobotsari', address: 'Jl. Limbasari Bobotsari', status: 'Negeri', principalName: 'Suratman, S.Pd.' },
  { name: 'SMP Negeri 1 Bukateja', npsn: '20303110', subdistrict: 'Bukateja', address: 'Jl. Purwandaru No. 15', status: 'Negeri', principalName: 'Endang K., M.Pd.' },
  { name: 'SMP Negeri 2 Bukateja', npsn: '20303111', subdistrict: 'Bukateja', address: 'Jl. Raya Kebutuh', status: 'Negeri', principalName: 'Waryanto, M.Pd.' },
  { name: 'SMP Negeri 1 Bojongsari', npsn: '20303112', subdistrict: 'Bojongsari', address: 'Jl. Raya Bojongsari', status: 'Negeri', principalName: 'Drs. Triyono' },
  { name: 'SMP Negeri 1 Padamara', npsn: '20303113', subdistrict: 'Padamara', address: 'Jl. Raya Padamara No. 5', status: 'Negeri', principalName: 'Dra. Sumarni' },
  { name: 'SMP Negeri 1 Kutasari', npsn: '20303114', subdistrict: 'Kutasari', address: 'Jl. Raya Kutasari', status: 'Negeri', principalName: 'Ahmad Fauzi, M.Pd.' },
  { name: 'SMP Negeri 1 Mrebet', npsn: '20303115', subdistrict: 'Mrebet', address: 'Jl. Raya Mangunnegara', status: 'Negeri', principalName: 'H. Sudirman, M.Pd.' },
  { name: 'SMP Negeri 1 Rembang', npsn: '20303116', subdistrict: 'Rembang', address: 'Jl. Monumen Soedirman Rembang', status: 'Negeri', principalName: 'Bambang Eko, M.Pd.' },
  { name: 'SMP Negeri 1 Kejobong', npsn: '20303117', subdistrict: 'Kejobong', address: 'Jl. Raya Kejobong', status: 'Negeri', principalName: 'Supriyadi, S.Pd.' },
  { name: 'SMP Negeri 1 Kemangkon', npsn: '20303118', subdistrict: 'Kemangkon', address: 'Jl. Raya Panican Kemangkon', status: 'Negeri', principalName: 'Dra. Nurhayati' },
  { name: 'SMP Negeri 1 Karanganyar', npsn: '20303119', subdistrict: 'Karanganyar', address: 'Jl. Raya Karanganyar', status: 'Negeri', principalName: 'Slamet Riyadi, M.Pd.' },
  { name: 'SMP Negeri 1 Karangmoncol', npsn: '20303120', subdistrict: 'Karangmoncol', address: 'Jl. Raya Pekiringan', status: 'Negeri', principalName: 'Yuliyanto, M.Pd.' },
  { name: 'SMP Santo Borromeus Purbalingga', npsn: '20303130', subdistrict: 'Purbalingga', address: 'Jl. Jenderal Sudirman No. 80', status: 'Swasta', principalName: 'Sr. Maria, SPM' },
  { name: 'SMP Muhammadiyah 1 Purbalingga', npsn: '20303131', subdistrict: 'Purbalingga', address: 'Jl. AW Soemarmo No. 14', status: 'Swasta', principalName: 'Arif Hidayat, S.Pd.I' }
];

// Initial default members
export const INITIAL_MEMBERS: Omit<Member, 'id'>[] = [
  {
    memberNumber: 'MGMP-PBG-001',
    fullName: 'Sutarman',
    title: 'S.Pd., M.Pd.',
    nip: '19740512 200212 1 004',
    nuptk: '3445752654200012',
    gender: 'Laki-laki',
    birthPlace: 'Purbalingga',
    birthDate: '1974-05-12',
    schoolName: 'SMP Negeri 1 Purbalingga',
    subdistrict: 'Purbalingga',
    phone: '0813-2744-8901',
    email: 'sutarman811@guru.smp.belajar.id',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif',
    joinedDate: '2015-08-01',
    notes: 'Ketua MGMP PJOK SMP Kabupaten Purbalingga',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-002',
    fullName: 'Tri Wahyudi',
    title: 'S.Pd.',
    nip: '19820311 200902 1 003',
    nuptk: '7845760662200021',
    gender: 'Laki-laki',
    birthPlace: 'Banyumas',
    birthDate: '1982-03-11',
    schoolName: 'SMP Negeri 2 Purbalingga',
    subdistrict: 'Purbalingga',
    phone: '0857-4712-3450',
    email: 'triwahyudi.pjok@guru.smp.belajar.id',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif',
    joinedDate: '2016-01-15',
    notes: 'Sekretaris MGMP',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-003',
    fullName: 'Siti Nurjanah',
    title: 'S.Pd.',
    nip: '19811005 200801 2 011',
    nuptk: '1245759661300043',
    gender: 'Perempuan',
    birthPlace: 'Purbalingga',
    birthDate: '1981-10-05',
    schoolName: 'SMP Negeri 1 Kalimanah',
    subdistrict: 'Kalimanah',
    phone: '0813-9122-4455',
    email: 'sitinurjanah.pjok@guru.smp.belajar.id',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif',
    joinedDate: '2016-08-10',
    notes: 'Bendahara MGMP',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-004',
    fullName: 'Agus Prasetyo',
    title: 'S.Pd.',
    nip: '19800714 200701 1 012',
    nuptk: '5545758660200032',
    gender: 'Laki-laki',
    birthPlace: 'Purbalingga',
    birthDate: '1980-07-14',
    schoolName: 'SMP Negeri 1 Bobotsari',
    subdistrict: 'Bobotsari',
    phone: '0812-2554-3321',
    email: 'agusprasetyo.pjok@guru.smp.belajar.id',
    status: 'Aktif',
    joinedDate: '2017-02-01',
    notes: 'Koord. Bidang Kurikulum',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-005',
    fullName: 'Bambang Haryanto',
    title: 'S.Pd., Gr.',
    nip: '19831122 201101 1 007',
    nuptk: '9945761663200054',
    gender: 'Laki-laki',
    birthPlace: 'Kebumen',
    birthDate: '1983-11-22',
    schoolName: 'SMP Negeri 1 Bukateja',
    subdistrict: 'Bukateja',
    phone: '0813-8899-7711',
    email: 'bambangharyanto@guru.smp.belajar.id',
    status: 'Aktif',
    joinedDate: '2017-09-15',
    notes: 'Koord. Prestasi Olahraga',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-006',
    fullName: 'Dwi Lestari',
    title: 'S.Pd.',
    nip: '19870102 201402 2 003',
    nuptk: '4345765667300062',
    gender: 'Perempuan',
    birthPlace: 'Purbalingga',
    birthDate: '1987-01-02',
    schoolName: 'SMP Negeri 1 Bojongsari',
    subdistrict: 'Bojongsari',
    phone: '0821-3567-8899',
    email: 'dwilestari.pjok@guru.smp.belajar.id',
    status: 'Aktif',
    joinedDate: '2018-03-20',
    notes: 'Koord. Publikasi & TIK',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-007',
    fullName: 'Teguh Prabowo',
    title: 'S.Pd.',
    nip: '19780819 200604 1 009',
    nuptk: '6145756658200078',
    gender: 'Laki-laki',
    birthPlace: 'Purbalingga',
    birthDate: '1978-08-19',
    schoolName: 'SMP Negeri 1 Bobotsari',
    subdistrict: 'Bobotsari',
    phone: '0812-2983-1120',
    email: 'teguhprabowo@guru.smp.belajar.id',
    status: 'Aktif',
    joinedDate: '2015-08-01',
    notes: 'Wakil Ketua MGMP',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-008',
    fullName: 'Supriyanto',
    title: 'S.Pd.',
    nip: '19790218 200501 1 008',
    nuptk: '8245757659200089',
    gender: 'Laki-laki',
    birthPlace: 'Purbalingga',
    birthDate: '1979-02-18',
    schoolName: 'SMP Negeri 1 Mrebet',
    subdistrict: 'Mrebet',
    phone: '0812-3344-5566',
    email: 'supriyanto.pjok@guru.smp.belajar.id',
    status: 'Aktif',
    joinedDate: '2016-04-12',
    notes: 'Koord. Sarpras & Olahraga Tradisional',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-009',
    fullName: 'Nurul Hidayati',
    title: 'S.Pd.',
    nip: '19910515 201902 2 007',
    nuptk: '2145769671300091',
    gender: 'Perempuan',
    birthPlace: 'Purbalingga',
    birthDate: '1991-05-15',
    schoolName: 'SMP Negeri 1 Kutasari',
    subdistrict: 'Kutasari',
    phone: '0858-6789-1234',
    email: 'nurulhidayati@guru.smp.belajar.id',
    status: 'Aktif',
    joinedDate: '2019-10-01',
    notes: 'Anggota Bid. Kurikulum',
    createdAt: new Date().toISOString()
  },
  {
    memberNumber: 'MGMP-PBG-010',
    fullName: 'Hendri Kurniawan',
    title: 'S.Pd.',
    nip: '19860920 201001 1 014',
    nuptk: '7345764666200102',
    gender: 'Laki-laki',
    birthPlace: 'Banyumas',
    birthDate: '1986-09-20',
    schoolName: 'SMP Negeri 1 Padamara',
    subdistrict: 'Padamara',
    phone: '0813-4455-6677',
    email: 'hendrikurniawan@guru.smp.belajar.id',
    status: 'Aktif',
    joinedDate: '2018-01-10',
    notes: 'Anggota Aktif',
    createdAt: new Date().toISOString()
  }
];

// Initial default activities
export const INITIAL_ACTIVITIES: Omit<Activity, 'id'>[] = [
  {
    title: 'Workshop Penyusunan Modul Ajar PJOK Kurikulum Merdeka Berdiferensiasi',
    type: 'Workshop',
    description: 'Penyusunan modul ajar, asesmen diagnostik, dan strategi pembelajaran berdiferensiasi pada materi atletik dan permainan bola besar fase D.',
    date: '2025-03-12',
    time: '08:00 - 14:00 WIB',
    location: 'Aula SMP Negeri 1 Purbalingga',
    speaker: 'Dr. Wawan S., M.Pd. (Universitas Jenderal Soedirman)',
    pic: 'Agus Prasetyo, S.Pd.',
    quota: 75,
    status: 'Berlangsung',
    qrCodeToken: 'PBG-PJOK-WS-20250312',
    allowPublicPresensi: true,
    registeredMemberIds: [],
    createdAt: new Date().toISOString()
  },
  {
    title: 'Pertemuan Rutin & Rapat Koordinasi Persiapan O2SN SMP Kab. Purbalingga 2025',
    type: 'Pertemuan Rutin',
    description: 'Koordinasi teknis cabang olahraga atletik, bulutangkis, renang, pencak silat, dan karate untuk seleksi O2SN tingkat Kabupaten.',
    date: '2025-03-26',
    time: '08:30 - 12:30 WIB',
    location: 'SMP Negeri 1 Bobotsari',
    speaker: 'Bambang Haryanto, S.Pd., Gr. & Tim Teknis Disdikbud',
    pic: 'Tri Wahyudi, S.Pd.',
    quota: 80,
    status: 'Pendaftaran',
    qrCodeToken: 'PBG-PJOK-RTN-20250326',
    allowPublicPresensi: true,
    registeredMemberIds: [],
    createdAt: new Date().toISOString()
  },
  {
    title: 'Senam Kebugaran Guru PJOK & Evaluasi Tes Kebugaran Pelajar Nusantara',
    type: 'Kegiatan Olahraga Bersama',
    description: 'Aktivitas gerak berirama bersama, praktik tes kebugaran jasmani Indonesia (TKJI), dan pengisian database profil kebugaran siswa.',
    date: '2025-04-16',
    time: '07:00 - 11:30 WIB',
    location: 'Stadion Goentoer Darjono Purbalingga',
    speaker: 'Tim Instruktur MGMP PJOK',
    pic: 'Supriyanto, S.Pd.',
    quota: 100,
    status: 'Direncanakan',
    qrCodeToken: 'PBG-PJOK-SNM-20250416',
    allowPublicPresensi: true,
    registeredMemberIds: [],
    createdAt: new Date().toISOString()
  }
];

// Initial default learning resources
export const INITIAL_LEARNING_RESOURCES: Omit<LearningResource, 'id'>[] = [
  {
    title: 'Modul Ajar PJOK Fase D: Keterampilan Gerak Passing Bawah & Atas Bola Voli',
    category: 'Modul Ajar',
    phase: 'Fase D',
    grade: 'Kelas VII',
    curriculum: 'Kurikulum Merdeka',
    sportTopic: 'Permainan Bola Besar',
    academicYear: '2024/2025 Genap',
    description: 'Modul ajar lengkap dengan alur diferensiasi konten & proses, rubrik unjuk kerja, dan lembar refleksi diri peserta didik.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/modul-bola-voli-fase-d.pdf',
    fileName: 'Modul_Ajar_Voli_Fase_D_Kelas_7.pdf',
    fileSize: '2.4 MB',
    uploaderId: 'MGMP-PBG-001',
    uploaderName: 'Sutarman, S.Pd., M.Pd.',
    approvalStatus: 'Disetujui',
    version: '1.2',
    downloadsCount: 142,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Alur Tujuan Pembelajaran (ATP) PJOK Fase D Kelas VII, VIII, IX',
    category: 'Alur Tujuan Pembelajaran (ATP)',
    phase: 'Fase D',
    grade: 'Semua Kelas',
    curriculum: 'Kurikulum Merdeka',
    sportTopic: 'Aktivitas Jasmani Lainnya',
    academicYear: '2024/2025 Genap',
    description: 'Dokumen ATP hasil musyawarah Tim Pengembang Kurikulum MGMP PJOK SMP Kabupaten Purbalingga.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/atp-pjok-fased-purbalingga.pdf',
    fileName: 'ATP_PJOK_Fase_D_Kab_Purbalingga_Revisi.pdf',
    fileSize: '1.8 MB',
    uploaderId: 'MGMP-PBG-004',
    uploaderName: 'Agus Prasetyo, S.Pd.',
    approvalStatus: 'Disetujui',
    version: '2.0',
    downloadsCount: 230,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Instrumen Asesmen Diagnostik Kebugaran Jasmani & Lembar Observasi TKJI',
    category: 'Asesmen Diagnostik',
    phase: 'Fase D',
    grade: 'Semua Kelas',
    curriculum: 'Kurikulum Merdeka',
    sportTopic: 'Kebugaran Jasmani',
    academicYear: '2024/2025 Genap',
    description: 'Format penilaian kebugaran jasmani (daya tahan jantung-paru, kekuatan otot, kelenturan) lengkap dengan norma usia 13-15 tahun.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/asesmen-kebugaran-smp.xlsx',
    fileName: 'Asesmen_Diagnostik_Kebugaran_Jasmani_SMP.xlsx',
    fileSize: '850 KB',
    uploaderId: 'MGMP-PBG-005',
    uploaderName: 'Bambang Haryanto, S.Pd., Gr.',
    approvalStatus: 'Disetujui',
    version: '1.0',
    downloadsCount: 188,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Bahan Tayang Presentasi Interaktif: Pola Hidup Bersih & Sehat serta Gizi Remaja',
    category: 'Bahan Presentasi',
    phase: 'Fase D',
    grade: 'Kelas VIII',
    curriculum: 'Kurikulum Merdeka',
    sportTopic: 'Pendidikan Kesehatan',
    academicYear: '2024/2025 Genap',
    description: 'Slide presentasi Canva/PowerPoint materi pendidikan kesehatan pencegahan penyakit tidak menular dan gizi seimbang peserta didik.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/ppt-gizi-seimbang-pjok.pptx',
    fileName: 'Bahan_Ajar_PPT_Kesehatan_Gizi_Remaja.pptx',
    fileSize: '4.6 MB',
    uploaderId: 'MGMP-PBG-006',
    uploaderName: 'Dwi Lestari, S.Pd.',
    approvalStatus: 'Disetujui',
    version: '1.1',
    downloadsCount: 95,
    createdAt: new Date().toISOString()
  },
  {
    title: 'LKPD Praktik Atletik Lari Cepat (Sprint 60m): Start Jongkok dan Ayunan Lengan',
    category: 'LKPD',
    phase: 'Fase D',
    grade: 'Kelas VII',
    curriculum: 'Kurikulum Merdeka',
    sportTopic: 'Atletik',
    academicYear: '2024/2025 Genap',
    description: 'Lembar kerja peserta didik dengan panduan gambar fase start bersedia, siap, ya! Serta lembar penilaian teman sejawat.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/lkpd-atletik-sprint-smp.pdf',
    fileName: 'LKPD_Atletik_Sprint_60M_Kelas7.pdf',
    fileSize: '1.2 MB',
    uploaderId: 'MGMP-PBG-002',
    uploaderName: 'Tri Wahyudi, S.Pd.',
    approvalStatus: 'Disetujui',
    version: '1.0',
    downloadsCount: 110,
    createdAt: new Date().toISOString()
  }
];

// Initial default documents
export const INITIAL_ORG_DOCUMENTS: Omit<OrgDocument, 'id'>[] = [
  {
    title: 'SK Penetapan Pengurus MGMP PJOK SMP Kabupaten Purbalingga Masa Bakti 2024-2027',
    category: 'Administrasi MGMP',
    year: '2024',
    description: 'Surat Keputusan Kepala Dinas Pendidikan dan Kebudayaan Kabupaten Purbalingga tentang Susunan Pengurus MGMP PJOK.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/sk-pengurus-mgmp-2024-2027.pdf',
    fileName: 'SK_Kadisdikbud_Pengurus_MGMP_PJOK_2024_2027.pdf',
    fileSize: '1.5 MB',
    accessLevel: 'Publik',
    uploadedBy: 'Sekretariat MGMP',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Surat Undangan Workshop Modul Ajar dan Asesmen Kurikulum Merdeka 2025',
    category: 'Undangan',
    year: '2025',
    description: 'Surat resmi permohonan dispensasi kehadiran guru PJOK SMP se-Kabupaten Purbalingga.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/surat-undangan-workshop-2025.pdf',
    fileName: 'Undangan_Resmi_Workshop_Maret_2025.pdf',
    fileSize: '620 KB',
    accessLevel: 'Publik',
    uploadedBy: 'Tri Wahyudi, S.Pd.',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Notulen Rapat Pleno Pengurus & Evaluasi Program Kerja Awal Tahun',
    category: 'Notulen Rapat',
    year: '2025',
    description: 'Berita acara kesepakatan kalender kegiatan, iuran kas, dan jadwal diseminasi MGMP per sub-wilayah.',
    fileUrl: 'https://storage.googleapis.com/mgmp-pbg-public/notulen-rapat-pleno-januari-2025.pdf',
    fileName: 'Notulen_Pleno_Pengurus_Jan_2025.pdf',
    fileSize: '480 KB',
    accessLevel: 'Pengurus',
    uploadedBy: 'Tri Wahyudi, S.Pd.',
    createdAt: new Date().toISOString()
  }
];

// Initial announcements
export const INITIAL_ANNOUNCEMENTS: Omit<Announcement, 'id'>[] = [
  {
    title: 'Peluncuran Sistem Informasi Digital MGMP PJOK SMP Kabupaten Purbalingga',
    category: 'Informasi Resmi',
    summary: 'Platform digital terpadu untuk pendataan anggota, presensi QR, perangkat ajar, dan portofolio kompetensi resmi diluncurkan.',
    content: 'Dalam rangka meningkatkan tata kelola organisasi dan kemudahan akses bagi seluruh guru PJOK SMP se-Kabupaten Purbalingga, pengurus resmi meluncurkan portal web berbasis komputasi awan. Seluruh guru PJOK diharapkan melakukan verifikasi data keanggotaan dan memanfaatkan bank sumber belajar secara optimal.',
    author: 'Pengurus MGMP PJOK',
    publishedDate: '2025-03-01',
    coverUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    isPinned: true
  },
  {
    title: 'Jadwal Pendaftaran Workshop Pembuatan Modul Ajar PJOK Berdiferensiasi',
    category: 'Agenda Kegiatan',
    summary: 'Kuota terbatas 75 guru PJOK SMP negeri dan swasta. Presensi kehadiran menggunakan sistem QR digital.',
    content: 'Pendaftaran workshop dibuka melalui menu Kegiatan. Peserta diharapkan membawa laptop dan draf perangkat ajar materi pilihan. Sertifikat bernilai 32 JP akan diterbitkan secara digital setelah menyelesaikan produk mandiri.',
    author: 'Bidang Kurikulum',
    publishedDate: '2025-03-05',
    coverUrl: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&auto=format&fit=crop&q=80',
    isPinned: false
  }
];

// Initial best practices
export const INITIAL_BEST_PRACTICES: Omit<BestPractice, 'id'>[] = [
  {
    title: 'Inovasi Modifikasi Bola Voli Spons Ringan untuk Menghilangkan Rasa Takut Siswa Kelas VII',
    authorName: 'Agus Prasetyo, S.Pd.',
    authorSchool: 'SMP Negeri 1 Bobotsari',
    category: 'Modifikasi Permainan',
    description: 'Banyak peserta didik baru merasa takut atau sakit saat melakukan passing bawah dengan bola voli standar. Inovasi ini menggunakan modifikasi bola karet spons lapis busa dengan berat terukur sehingga siswa berani mengarahkan bola dan meningkatkan keterlibatan aktif hingga 100%.',
    mediaUrl: 'https://youtube.com',
    mediaType: 'Video',
    publishedDate: '2025-02-14',
    status: 'Publik'
  },
  {
    title: 'Pemanfaatan Kardus Bekas sebagai Rintangan Agilitas & Koordinasi Gerak Senam Ketangkasan',
    authorName: 'Bambang Haryanto, S.Pd., Gr.',
    authorSchool: 'SMP Negeri 1 Bukateja',
    category: 'Media Pembelajaran',
    description: 'Mengatasi keterbatasan cone dan hurdle olahraga di sekolah dengan memanfaatkan kardus daur ulang yang dihias berwarna. Aman, tidak mencederai saat tersenggol, dan sangat diminati siswa.',
    mediaUrl: 'https://youtube.com',
    mediaType: 'Artikel',
    publishedDate: '2025-01-20',
    status: 'Publik'
  }
];

// Initial discussions
export const INITIAL_DISCUSSIONS: Omit<Discussion, 'id'>[] = [
  {
    title: 'Strategi Penilaian Unjuk Kerja PJOK yang Objektif pada Rombel Gemuk (32 Siswa)?',
    category: 'Asesmen PJOK',
    content: 'Bapak/Ibu rekan guru PJOK, bagaimana cara paling efektif melakukan asesmen sumatif gerak dasar atletik atau senam dalam waktu 2 JP untuk kelas dengan 32 siswa tanpa memakan waktu terlalu lama namun tetap mendapatkan data akurat?',
    authorId: 'MGMP-PBG-002',
    authorName: 'Tri Wahyudi, S.Pd.',
    authorSchool: 'SMP Negeri 2 Purbalingga',
    repliesCount: 4,
    isPinned: true,
    isReported: false,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Rekomendasi Permainan Tradisional Banyumasan/Purbalingga yang Cocok untuk Pembelajaran PJOK',
    category: 'Kurikulum',
    content: 'Untuk melestarikan kearifan lokal di Kurikulum Merdeka, mari berdiskusi tentang integrasi Gobak Sodor, Egrang, atau Bentengan dalam capaian pembelajaran aktivitas kebugaran.',
    authorId: 'MGMP-PBG-008',
    authorName: 'Supriyanto, S.Pd.',
    authorSchool: 'SMP Negeri 1 Mrebet',
    repliesCount: 6,
    isPinned: false,
    isReported: false,
    createdAt: new Date().toISOString()
  }
];

// Initial trainings
export const INITIAL_TRAININGS: Omit<Training, 'id'>[] = [
  {
    title: 'Bimtek Peningkatan Kompetensi Guru PJOK: Penyusunan Asesmen Autentik Berbasis AI & Digital',
    instructor: 'Dr. Hari Setiawan, M.Or. & Tim Balai Guru Penggerak',
    startDate: '2025-04-10',
    endDate: '2025-04-14',
    location: 'Daring (Zoom) & Luring Aula Dindikbud Purbalingga',
    description: 'Pelatihan 32 Jam Pelajaran (JP) mencakup rubrik asesmen digital, pengolahan data kebugaran otomatis, dan sertifikasi resmi.',
    quota: 100,
    hours: 32,
    certificateTemplate: 'CERT_MGMP_PJOK_PBG_2025',
    status: 'Buka Pendaftaran',
    registeredMemberIds: ['MGMP-PBG-001', 'MGMP-PBG-002', 'MGMP-PBG-003'],
    materials: 'Materi Asesmen Autentik, Template Rubrik PJOK',
    createdAt: new Date().toISOString()
  }
];

// Helper to seed initial data safely if collections are empty
export async function seedInitialDataIfEmpty() {
  // CRITICAL: Writing to Firestore requires an authenticated user with permissions.
  // Skip write attempts when unauthenticated to avoid permission denied errors.
  if (!auth.currentUser) {
    return;
  }

  try {
    // 1. Settings
    const settingRef = doc(db, 'settings', 'organization');
    const settingSnap = await getDoc(settingRef);
    if (!settingSnap.exists()) {
      await setDoc(settingRef, DEFAULT_ORG_SETTINGS);
    }

    // 2. Org Structure
    const structureRef = doc(db, 'settings', 'structure');
    const structureSnap = await getDoc(structureRef);
    if (!structureSnap.exists()) {
      await setDoc(structureRef, DEFAULT_ORG_STRUCTURE);
    }

    // 2b. Member Card Settings
    const cardSettingRef = doc(db, 'settings', 'memberCard');
    const cardSettingSnap = await getDoc(cardSettingRef);
    if (!cardSettingSnap.exists()) {
      await setDoc(cardSettingRef, DEFAULT_MEMBER_CARD_SETTINGS);
    }

    // 2c. Member Registration Config (Google Form & Spreadsheet)
    const regConfigRef = doc(db, 'settings', 'registration');
    const regConfigSnap = await getDoc(regConfigRef);
    if (!regConfigSnap.exists()) {
      await setDoc(regConfigRef, DEFAULT_REGISTRATION_CONFIG);
    }

    // 3. Schools
    const schoolSnap = await getDocs(collection(db, 'schools'));
    if (schoolSnap.empty) {
      for (const school of INITIAL_SCHOOLS) {
        await addDoc(collection(db, 'schools'), school);
      }
    }

    // 4. Members
    const memberSnap = await getDocs(collection(db, 'members'));
    if (memberSnap.empty) {
      for (const m of INITIAL_MEMBERS) {
        await setDoc(doc(db, 'members', m.memberNumber), m);
      }
    }

    // 5. Activities
    const actSnap = await getDocs(collection(db, 'activities'));
    if (actSnap.empty) {
      for (const a of INITIAL_ACTIVITIES) {
        await addDoc(collection(db, 'activities'), a);
      }
    }

    // 6. Learning Resources
    const lrSnap = await getDocs(collection(db, 'learningResources'));
    if (lrSnap.empty) {
      for (const lr of INITIAL_LEARNING_RESOURCES) {
        await addDoc(collection(db, 'learningResources'), lr);
      }
    }

    // 7. Documents
    const docSnap = await getDocs(collection(db, 'documents'));
    if (docSnap.empty) {
      for (const d of INITIAL_ORG_DOCUMENTS) {
        await addDoc(collection(db, 'documents'), d);
      }
    }

    // 8. Announcements
    const annSnap = await getDocs(collection(db, 'announcements'));
    if (annSnap.empty) {
      for (const an of INITIAL_ANNOUNCEMENTS) {
        await addDoc(collection(db, 'announcements'), an);
      }
    }

    // 9. Best Practices
    const bpSnap = await getDocs(collection(db, 'bestPractices'));
    if (bpSnap.empty) {
      for (const bp of INITIAL_BEST_PRACTICES) {
        await addDoc(collection(db, 'bestPractices'), bp);
      }
    }

    // 10. Discussions
    const discSnap = await getDocs(collection(db, 'discussions'));
    if (discSnap.empty) {
      for (const dc of INITIAL_DISCUSSIONS) {
        await addDoc(collection(db, 'discussions'), dc);
      }
    }

    // 11. Trainings
    const trSnap = await getDocs(collection(db, 'trainings'));
    if (trSnap.empty) {
      for (const tr of INITIAL_TRAININGS) {
        await addDoc(collection(db, 'trainings'), tr);
      }
    }
  } catch (error) {
    console.warn('Database seeding deferred or not permitted:', error);
  }
}

// ------------------- CRUD OPERATIONS -------------------

// Settings
export async function getOrganizationSettings(): Promise<OrganizationSetting> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'organization'));
    if (snap.exists()) {
      return snap.data() as OrganizationSetting;
    }
    return DEFAULT_ORG_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/organization');
    return DEFAULT_ORG_SETTINGS;
  }
}

export async function updateOrganizationSettings(data: Partial<OrganizationSetting>): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'organization'), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/organization');
  }
}

// Structure
export async function getOrgStructure(): Promise<OrgStructure> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'structure'));
    if (snap.exists()) {
      return snap.data() as OrgStructure;
    }
    return DEFAULT_ORG_STRUCTURE;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/structure');
    return DEFAULT_ORG_STRUCTURE;
  }
}

export async function updateOrgStructure(data: OrgStructure): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'structure'), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/structure');
  }
}

// Members
export async function getMembers(): Promise<Member[]> {
  try {
    const snap = await getDocs(collection(db, 'members'));
    if (snap.empty) {
      return INITIAL_MEMBERS as Member[];
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Member));
  } catch (error) {
    console.warn('Firestore getMembers fallback to default members:', error);
    return INITIAL_MEMBERS as Member[];
  }
}

export async function createMember(member: Omit<Member, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'members'), {
      ...member,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'members');
    return '';
  }
}

export async function updateMember(id: string, member: Partial<Member>): Promise<void> {
  try {
    await updateDoc(doc(db, 'members', id), {
      ...member,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `members/${id}`);
  }
}

export async function updateMemberPhoto(memberIdOrNumber: string, photoUrl: string): Promise<void> {
  try {
    const docRef = doc(db, 'members', memberIdOrNumber);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, {
        photoUrl,
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    // Search by memberNumber if direct doc ID was not matched
    const q = query(collection(db, 'members'), where('memberNumber', '==', memberIdOrNumber));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      await updateDoc(doc(db, 'members', qSnap.docs[0].id), {
        photoUrl,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `members/${memberIdOrNumber}`);
  }
}

export async function deleteMember(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'members', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `members/${id}`);
  }
}

// Schools
export async function getSchools(): Promise<School[]> {
  try {
    const snap = await getDocs(collection(db, 'schools'));
    if (snap.empty) {
      return INITIAL_SCHOOLS.map((s, idx) => ({ id: `SCH-${idx + 1}`, ...s }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as School));
  } catch (error) {
    console.warn('Firestore getSchools fallback to default schools:', error);
    return INITIAL_SCHOOLS.map((s, idx) => ({ id: `SCH-${idx + 1}`, ...s }));
  }
}

export async function createSchool(school: Omit<School, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'schools'), school);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'schools');
    return '';
  }
}

// Activities
export async function getActivities(): Promise<Activity[]> {
  try {
    const snap = await getDocs(collection(db, 'activities'));
    if (snap.empty) {
      return INITIAL_ACTIVITIES.map((a, idx) => ({ id: `ACT-${idx + 1}`, ...a }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity));
  } catch (error) {
    console.warn('Firestore getActivities fallback to default activities:', error);
    return INITIAL_ACTIVITIES.map((a, idx) => ({ id: `ACT-${idx + 1}`, ...a }));
  }
}

export async function createActivity(activity: Omit<Activity, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activity,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'activities');
    return '';
  }
}

export async function updateActivity(id: string, activity: Partial<Activity>): Promise<void> {
  try {
    await updateDoc(doc(db, 'activities', id), activity);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `activities/${id}`);
  }
}

export async function deleteActivity(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'activities', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
  }
}

// Attendances
export async function getAttendancesByActivity(activityId: string): Promise<Attendance[]> {
  try {
    const q = query(collection(db, 'attendances'), where('activityId', '==', activityId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `attendances?activityId=${activityId}`);
    return [];
  }
}

export async function recordAttendance(attendance: Omit<Attendance, 'id'>): Promise<{ success: boolean; message: string }> {
  try {
    // Check if already attended
    const q = query(
      collection(db, 'attendances'),
      where('activityId', '==', attendance.activityId),
      where('memberId', '==', attendance.memberId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, message: 'Anggota ini sudah tercatat hadir pada kegiatan ini!' };
    }

    await addDoc(collection(db, 'attendances'), {
      ...attendance,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
    return { success: true, message: 'Presensi berhasil dicatat!' };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'attendances');
    return { success: false, message: 'Gagal mencatat presensi.' };
  }
}

// Learning Resources
export async function getLearningResources(): Promise<LearningResource[]> {
  try {
    const snap = await getDocs(collection(db, 'learningResources'));
    if (snap.empty) {
      return INITIAL_LEARNING_RESOURCES.map((r, idx) => ({ id: `RES-${idx + 1}`, ...r }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LearningResource));
  } catch (error) {
    console.warn('Firestore getLearningResources fallback to default resources:', error);
    return INITIAL_LEARNING_RESOURCES.map((r, idx) => ({ id: `RES-${idx + 1}`, ...r }));
  }
}

export async function createLearningResource(resource: Omit<LearningResource, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'learningResources'), {
      ...resource,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'learningResources');
    return '';
  }
}

export async function updateLearningResource(id: string, resource: Partial<LearningResource>): Promise<void> {
  try {
    await updateDoc(doc(db, 'learningResources', id), resource);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `learningResources/${id}`);
  }
}

export async function deleteLearningResource(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'learningResources', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `learningResources/${id}`);
  }
}

// Documents
export async function getOrgDocuments(): Promise<OrgDocument[]> {
  try {
    const snap = await getDocs(collection(db, 'documents'));
    if (snap.empty) {
      return INITIAL_ORG_DOCUMENTS.map((d, idx) => ({ id: `DOC-${idx + 1}`, ...d }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OrgDocument));
  } catch (error) {
    console.warn('Firestore getOrgDocuments fallback to default documents:', error);
    return INITIAL_ORG_DOCUMENTS.map((d, idx) => ({ id: `DOC-${idx + 1}`, ...d }));
  }
}

export async function createOrgDocument(orgDoc: Omit<OrgDocument, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...orgDoc,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'documents');
    return '';
  }
}

export async function deleteOrgDocument(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'documents', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `documents/${id}`);
  }
}

// Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    if (snap.empty) {
      return INITIAL_ANNOUNCEMENTS.map((a, idx) => ({ id: `ANN-${idx + 1}`, ...a }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
  } catch (error) {
    console.warn('Firestore getAnnouncements fallback to default announcements:', error);
    return INITIAL_ANNOUNCEMENTS.map((a, idx) => ({ id: `ANN-${idx + 1}`, ...a }));
  }
}

export async function createAnnouncement(ann: Omit<Announcement, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), ann);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'announcements');
    return '';
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
  }
}

// Best Practices
export async function getBestPractices(): Promise<BestPractice[]> {
  try {
    const snap = await getDocs(collection(db, 'bestPractices'));
    if (snap.empty) {
      return INITIAL_BEST_PRACTICES.map((b, idx) => ({ id: `BP-${idx + 1}`, ...b }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BestPractice));
  } catch (error) {
    console.warn('Firestore getBestPractices fallback to default best practices:', error);
    return INITIAL_BEST_PRACTICES.map((b, idx) => ({ id: `BP-${idx + 1}`, ...b }));
  }
}

export async function createBestPractice(practice: Omit<BestPractice, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'bestPractices'), practice);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'bestPractices');
    return '';
  }
}

export async function deleteBestPractice(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'bestPractices', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bestPractices/${id}`);
  }
}

// Trainings
export async function getTrainings(): Promise<Training[]> {
  try {
    const snap = await getDocs(collection(db, 'trainings'));
    if (snap.empty) {
      return INITIAL_TRAININGS.map((t, idx) => ({ id: `TR-${idx + 1}`, ...t }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Training));
  } catch (error) {
    console.warn('Firestore getTrainings fallback to default trainings:', error);
    return INITIAL_TRAININGS.map((t, idx) => ({ id: `TR-${idx + 1}`, ...t }));
  }
}

export async function createTraining(training: Omit<Training, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'trainings'), {
      ...training,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'trainings');
    return '';
  }
}

export async function registerTrainingMember(trainingId: string, memberId: string): Promise<boolean> {
  try {
    const ref = doc(db, 'trainings', trainingId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data() as Training;
    const currentList = data.registeredMemberIds || [];
    if (!currentList.includes(memberId)) {
      await updateDoc(ref, {
        registeredMemberIds: [...currentList, memberId]
      });
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `trainings/${trainingId}`);
    return false;
  }
}

// Discussions
export async function getDiscussions(): Promise<Discussion[]> {
  try {
    const snap = await getDocs(collection(db, 'discussions'));
    if (snap.empty) {
      return INITIAL_DISCUSSIONS.map((d, idx) => ({ id: `DISC-${idx + 1}`, ...d }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Discussion));
  } catch (error) {
    console.warn('Firestore getDiscussions fallback to default discussions:', error);
    return INITIAL_DISCUSSIONS.map((d, idx) => ({ id: `DISC-${idx + 1}`, ...d }));
  }
}

export async function createDiscussion(disc: Omit<Discussion, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'discussions'), {
      ...disc,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'discussions');
    return '';
  }
}

export async function getComments(discussionId: string): Promise<DiscussionComment[]> {
  try {
    const snap = await getDocs(collection(db, `discussions/${discussionId}/comments`));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DiscussionComment));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `discussions/${discussionId}/comments`);
    return [];
  }
}

export async function addComment(discussionId: string, comment: Omit<DiscussionComment, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, `discussions/${discussionId}/comments`), {
      ...comment,
      createdAt: new Date().toISOString()
    });
    // increment reply count
    const discRef = doc(db, 'discussions', discussionId);
    const discSnap = await getDoc(discRef);
    if (discSnap.exists()) {
      const curCount = discSnap.data().repliesCount || 0;
      await updateDoc(discRef, { repliesCount: curCount + 1 });
    }
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `discussions/${discussionId}/comments`);
    return '';
  }
}

// ==================== MEMBER CARD SETTINGS ====================
export async function getMemberCardSettings(): Promise<MemberCardSettings> {
  try {
    const docRef = doc(db, 'settings', 'memberCard');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_MEMBER_CARD_SETTINGS, id: snap.id, ...snap.data() } as MemberCardSettings;
    }
    return DEFAULT_MEMBER_CARD_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/memberCard');
    return DEFAULT_MEMBER_CARD_SETTINGS;
  }
}

export async function updateMemberCardSettings(settings: Partial<MemberCardSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'memberCard');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/memberCard');
  }
}

// ==================== MEMBER REGISTRATION CONFIG (GOOGLE SPREADSHEET / FORM) ====================
export const DEFAULT_REGISTRATION_CONFIG: MemberRegistrationConfig = {
  spreadsheetUrl: '',
  sheetName: 'Form Responses 1',
  googleFormUrl: '',
  templateSpreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
  autoVerification: false,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistem MGMP'
};

export async function getRegistrationConfig(): Promise<MemberRegistrationConfig> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'registration'));
    if (snap.exists()) {
      return { ...DEFAULT_REGISTRATION_CONFIG, id: snap.id, ...snap.data() } as MemberRegistrationConfig;
    }
    return DEFAULT_REGISTRATION_CONFIG;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/registration');
    return DEFAULT_REGISTRATION_CONFIG;
  }
}

export async function updateRegistrationConfig(config: Partial<MemberRegistrationConfig>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'registration');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/registration');
  }
}

// ==================== IMPORT LOGS ====================
export async function getImportLogs(): Promise<ImportLog[]> {
  try {
    const snap = await getDocs(collection(db, 'importLogs'));
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ImportLog));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'importLogs');
    return [];
  }
}

export async function createImportLog(log: Omit<ImportLog, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'importLogs'), log);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'importLogs');
    return '';
  }
}

// ==================== VERIFY & APPROVE CANDIDATE MEMBER ====================
export async function verifyAndApproveMember(memberId: string, currentTotalMembers: number): Promise<string> {
  try {
    const memberRef = doc(db, 'members', memberId);
    const snap = await getDoc(memberRef);
    if (!snap.exists()) {
      throw new Error('Data anggota tidak ditemukan');
    }

    const data = snap.data() as Member;
    // Generate official NIA if it's currently temporary or empty
    let officialNumber = data.memberNumber;
    if (!officialNumber || officialNumber.includes('IMP-') || officialNumber.includes('PEND-')) {
      officialNumber = `MGMP-PBG-${String(currentTotalMembers + 1).padStart(3, '0')}`;
    }

    await updateDoc(memberRef, {
      status: 'Aktif',
      memberNumber: officialNumber,
      updatedAt: new Date().toISOString()
    });

    return officialNumber;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `members/${memberId}`);
    return '';
  }
}

export async function rejectMember(memberId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'members', memberId), {
      status: 'Ditolak',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `members/${memberId}`);
  }
}

// ==================== BULK IMPORT MEMBERS ====================
export async function bulkImportMembers(
  items: { memberData: Partial<Member>; isUpdate: boolean; targetId?: string }[]
): Promise<{ added: number; updated: number; failed: number }> {
  let added = 0;
  let updated = 0;
  let failed = 0;

  for (const item of items) {
    try {
      if (item.isUpdate && item.targetId) {
        // Update existing member
        const memberRef = doc(db, 'members', item.targetId);
        await updateDoc(memberRef, {
          ...item.memberData,
          updatedAt: new Date().toISOString()
        });
        updated++;
      } else {
        // Add new member
        const newDocId = item.memberData.memberNumber || `MGMP-IMP-${Date.now().toString().slice(-5)}${added}`;
        await setDoc(doc(db, 'members', newDocId), {
          ...item.memberData,
          memberNumber: item.memberData.memberNumber || newDocId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        added++;
      }
    } catch (err) {
      console.error('Error importing member row:', err);
      failed++;
    }
  }

  return { added, updated, failed };
}

// ==================== USER MANAGEMENT & RBAC ====================
export const DEFAULT_USERS: AppUser[] = [
  {
    uid: 'user-superadmin-01',
    email: 'sutarman811@guru.smp.belajar.id',
    displayName: 'Sutarman, S.Pd., M.Pd. (Super Admin)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'Super Admin',
    status: 'Aktif',
    memberId: 'MGMP-PBG-001',
    phone: '081234567890',
    createdAt: '2024-01-01T08:00:00.000Z',
    lastLogin: '2026-10-04T12:00:00.000Z',
  },
  {
    uid: 'user-ketua-01',
    email: 'ketua.pjok@purbalingga.go.id',
    displayName: 'Sutarman, S.Pd., M.Pd. (Ketua MGMP)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'Ketua',
    status: 'Aktif',
    memberId: 'MGMP-PBG-001',
    phone: '081234567890',
    createdAt: '2024-01-01T08:00:00.000Z',
    lastLogin: '2026-10-03T09:30:00.000Z',
  },
  {
    uid: 'user-sekretaris-01',
    email: 'triwahyudi.pjok@guru.smp.belajar.id',
    displayName: 'Tri Wahyudi, S.Pd. (Sekretaris)',
    photoURL: null,
    role: 'Sekretaris',
    status: 'Aktif',
    memberId: 'MGMP-PBG-002',
    phone: '081234567891',
    createdAt: '2024-01-01T08:00:00.000Z',
    lastLogin: '2026-10-02T14:15:00.000Z',
  },
  {
    uid: 'user-anggota-01',
    email: 'nurulhidayati@guru.smp.belajar.id',
    displayName: 'Nurul Hidayati, S.Pd. (Guru PJOK)',
    photoURL: null,
    role: 'Anggota',
    status: 'Aktif',
    memberId: 'MGMP-PBG-009',
    phone: '081234567894',
    createdAt: '2024-02-15T08:00:00.000Z',
    lastLogin: '2026-10-01T10:00:00.000Z',
  },
];

export async function getUsers(): Promise<AppUser[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (snap.empty) {
      // Seed default users
      for (const u of DEFAULT_USERS) {
        await setDoc(doc(db, 'users', u.uid), u);
      }
      return DEFAULT_USERS;
    }
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return DEFAULT_USERS;
  }
}

export async function updateUserRole(userId: string, newRole: UserRole, adminName?: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    if (adminName) {
      await logAdminActivity({
        adminName: adminName,
        adminEmail: 'sutarman811@guru.smp.belajar.id',
        adminRole: 'Super Admin',
        action: 'Ubah Role Pengguna',
        module: 'Manajemen Pengguna',
        details: `Mengubah hak akses pengguna ID ${userId} menjadi ${newRole}`,
        targetId: userId,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function updateUserStatus(userId: string, newStatus: 'Aktif' | 'Nonaktif', adminName?: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    if (adminName) {
      await logAdminActivity({
        adminName: adminName,
        adminEmail: 'sutarman811@guru.smp.belajar.id',
        adminRole: 'Super Admin',
        action: 'Ubah Status Akun',
        module: 'Manajemen Pengguna',
        details: `Mengubah status akun pengguna ID ${userId} menjadi ${newStatus}`,
        targetId: userId,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function createUserAccount(newUser: Partial<AppUser>, adminName?: string): Promise<string> {
  try {
    const newUid = newUser.uid || `user-${Date.now()}`;
    const userDoc: AppUser = {
      uid: newUid,
      email: newUser.email || '',
      displayName: newUser.displayName || 'Pengguna Baru',
      photoURL: newUser.photoURL || null,
      role: newUser.role || 'Anggota',
      status: newUser.status || 'Aktif',
      memberId: newUser.memberId || '',
      phone: newUser.phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', newUid), userDoc);

    if (adminName) {
      await logAdminActivity({
        adminName: adminName,
        adminEmail: 'sutarman811@guru.smp.belajar.id',
        adminRole: 'Super Admin',
        action: 'Tambah Pengguna Baru',
        module: 'Manajemen Pengguna',
        details: `Menambahkan akun baru: ${userDoc.displayName} (${userDoc.email}) dengan role ${userDoc.role}`,
        targetId: newUid,
      });
    }

    return newUid;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'users');
    return '';
  }
}

// ==================== ADMIN ACTIVITY LOGS ====================
export const INITIAL_ADMIN_LOGS: AdminActivityLog[] = [
  {
    id: 'log-init-01',
    timestamp: '2026-10-04T10:15:00.000Z',
    adminName: 'Sutarman, S.Pd., M.Pd.',
    adminEmail: 'sutarman811@guru.smp.belajar.id',
    adminRole: 'Super Admin',
    action: 'Inisialisasi Sistem RBAC',
    module: 'Keamanan & Hak Akses',
    details: 'Menerapkan proteksi peran: Super Admin, Ketua, Sekretaris, dan Anggota',
  },
  {
    id: 'log-init-02',
    timestamp: '2026-10-04T11:30:00.000Z',
    adminName: 'Sutarman, S.Pd., M.Pd.',
    adminEmail: 'sutarman811@guru.smp.belajar.id',
    adminRole: 'Super Admin',
    action: 'Pengaturan Tautan Google Formulir',
    module: 'Pendataan Anggota',
    details: 'Menghubungkan tautan pengisian formulir pendataan anggota dengan tombol Dashboard',
  },
  {
    id: 'log-init-03',
    timestamp: '2026-10-04T12:05:00.000Z',
    adminName: 'Tri Wahyudi, S.Pd.',
    adminEmail: 'triwahyudi.pjok@guru.smp.belajar.id',
    adminRole: 'Sekretaris',
    action: 'Import & Verifikasi Anggota',
    module: 'Manajemen Anggota',
    details: 'Melakukan verifikasi data dan pembaharuan status anggota aktif',
  },
];

export async function getAdminLogs(): Promise<AdminActivityLog[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    if (snap.empty) {
      for (const log of INITIAL_ADMIN_LOGS) {
        await addDoc(collection(db, 'auditLogs'), log);
      }
      return INITIAL_ADMIN_LOGS;
    }
    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminActivityLog));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'auditLogs');
    return INITIAL_ADMIN_LOGS;
  }
}

export async function logAdminActivity(
  log: Omit<AdminActivityLog, 'id' | 'timestamp'> & { timestamp?: string }
): Promise<string> {
  try {
    const newLog = {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'auditLogs'), newLog);
    return ref.id;
  } catch (error) {
    console.warn('Could not record admin activity log:', error);
    return '';
  }
}



