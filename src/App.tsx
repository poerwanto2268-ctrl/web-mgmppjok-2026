import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  DEFAULT_ORG_SETTINGS,
  DEFAULT_ORG_STRUCTURE,
  seedInitialDataIfEmpty,
  getOrganizationSettings,
  getOrgStructure,
  getMembers,
  getSchools,
  getActivities,
  getLearningResources,
  getOrgDocuments,
  getTrainings,
  getDiscussions,
  getBestPractices,
  getAnnouncements,
  getMemberCardSettings,
  DEFAULT_MEMBER_CARD_SETTINGS,
  getRegistrationConfig,
  DEFAULT_REGISTRATION_CONFIG,
  updateRegistrationConfig,
} from './services/dataService';
import { testFirestoreConnection } from './services/firebase';
import {
  OrganizationSetting,
  OrgStructure,
  Member,
  MemberCardSettings,
  MemberRegistrationConfig,
  School,
  Activity,
  LearningResource,
  OrgDocument,
  Training,
  Discussion,
  BestPractice,
  Announcement,
} from './types';

// Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Breadcrumb } from './components/common/Breadcrumb';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';

// Public Pages
import { PublicHome } from './pages/public/PublicHome';
import { PublicProfile } from './pages/public/PublicProfile';
import { PublicStructure } from './pages/public/PublicStructure';
import { PublicAgendas } from './pages/public/PublicAgendas';
import { PublicNews } from './pages/public/PublicNews';
import { PublicLearningResources } from './pages/public/PublicLearningResources';
import { PublicContact } from './pages/public/PublicContact';
import { PublicMemberVerification } from './pages/public/PublicMemberVerification';

// Member & Admin Pages
import { MyMemberCard } from './pages/member/MyMemberCard';
import { MyProfile } from './pages/member/MyProfile';
import { MemberCardsManagement } from './pages/admin/MemberCardsManagement';
import { CardSettingsManagement } from './pages/admin/CardSettingsManagement';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MemberManagement } from './pages/admin/MemberManagement';
import { OrganizationSettings } from './pages/admin/OrganizationSettings';
import { ActivityManagement } from './pages/admin/ActivityManagement';
import { AttendanceDigital } from './pages/admin/AttendanceDigital';
import { LearningResourcesBank } from './pages/admin/LearningResourcesBank';
import { DocumentArchive } from './pages/admin/DocumentArchive';
import { TeacherTrainings } from './pages/admin/TeacherTrainings';
import { DiscussionForum } from './pages/admin/DiscussionForum';
import { BestPractices } from './pages/admin/BestPractices';
import { ReportsCenter } from './pages/admin/ReportsCenter';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminActivityLogs } from './pages/admin/AdminActivityLogs';

// Higher-Order Component / Route Guard to intercept navigation & unauthorized role access
interface RoleGuardProps {
  isAllowed: boolean;
  userRole?: string;
  onBackToDashboard: () => void;
  isSuperAdminRoute?: boolean;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  isAllowed,
  userRole,
  onBackToDashboard,
  isSuperAdminRoute,
  children,
}) => {
  const { unlockSuperAdmin, setSimulationRole } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockSuperAdmin(password)) {
      setSimulationRole('Super Admin');
      setError('');
      setPassword('');
    } else {
      setError('Kata sandi Super Admin salah! Akses ditolak.');
    }
  };

  if (!isAllowed) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-200/80 shadow-xl shadow-rose-900/5 text-center max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-xs">
            ⛔
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide bg-rose-100 text-rose-700 border border-rose-200 mb-2">
              403 FORBIDDEN
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Akses Ditolak</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Anda tidak memiliki hak akses untuk membuka halaman ini.
            </p>
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 inline-block text-[11px] text-slate-500 font-medium">
              Peran Anda saat ini: <strong className="text-purple-700">{userRole || 'Pengunjung'}</strong>
            </div>
          </div>

          {isSuperAdminRoute && (
            <form onSubmit={handleUnlock} className="pt-3 border-t border-slate-100 space-y-2.5 text-left">
              <label className="block text-xs font-bold text-slate-700">
                Buka dengan Kata Sandi Super Admin:
              </label>
              {error && (
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi Super Admin..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-3 pr-16 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  {showPassword ? 'Tutup' : 'Lihat'}
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Buka Akses Super Admin
              </button>
            </form>
          )}

          <div className="pt-2">
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>← Kembali ke Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function MainApp() {
  const {
    user,
    canAccessUsers,
    canAccessSystemSettings,
    canAccessActivityLogs,
    canManageOrgSettings,
    canManageCardSettings,
    canManageMemberCards,
    canManageMembers,
  } = useAuth();
  const [currentView, setCurrentView] = useState<string>('public-home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // App data state
  const [orgSettings, setOrgSettings] = useState<OrganizationSetting>(DEFAULT_ORG_SETTINGS);
  const [structure, setStructure] = useState<OrgStructure>(DEFAULT_ORG_STRUCTURE);
  const [members, setMembers] = useState<Member[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [documents, setDocuments] = useState<OrgDocument[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPractice[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [cardSettings, setCardSettings] = useState<MemberCardSettings>(DEFAULT_MEMBER_CARD_SETTINGS);
  const [regConfig, setRegConfig] = useState<MemberRegistrationConfig>(DEFAULT_REGISTRATION_CONFIG);
  const [verifyMemberId, setVerifyMemberId] = useState<string>('');

  // Selected item for cross-module jumps
  const [selectedActivityForAttendance, setSelectedActivityForAttendance] = useState<Activity | null>(null);

  // URL route synchronization & path interception for direct navigation like /admin/users or /admin/settings
  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#', '');
      const searchParams = new URLSearchParams(window.location.search);
      const queryView = searchParams.get('view');

      if (queryView) {
        setCurrentView(queryView);
      } else if (hash) {
        setCurrentView(hash);
      } else if (pathname.includes('/admin/users') || pathname === '/users') {
        setCurrentView('users');
      } else if (pathname.includes('/admin/settings') || pathname === '/settings') {
        setCurrentView('settings');
      } else if (pathname.includes('/admin/logs') || pathname === '/admin-logs') {
        setCurrentView('admin-logs');
      } else if (pathname.includes('/admin/members') || pathname === '/members') {
        setCurrentView('members');
      } else if (pathname.includes('/admin/cards') || pathname === '/member-cards') {
        setCurrentView('member-cards');
      } else if (pathname.includes('/admin/organization') || pathname === '/organization') {
        setCurrentView('organization');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      try {
        // Detect QR verification link parameter (e.g. ?verify=member&id=MGMP-PBG-001)
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const verifyType = params.get('verify');
          const id = params.get('id');
          if (verifyType === 'member' && id) {
            setVerifyMemberId(id);
            setCurrentView('public-verify-member');
          }
        }

        await testFirestoreConnection();
        await seedInitialDataIfEmpty();
        await loadAllData();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        fetchedSettings,
        fetchedStructure,
        fetchedMembers,
        fetchedSchools,
        fetchedActivities,
        fetchedResources,
        fetchedDocuments,
        fetchedTrainings,
        fetchedDiscussions,
        fetchedBestPractices,
        fetchedAnnouncements,
        fetchedCardSettings,
        fetchedRegConfig,
      ] = await Promise.all([
        getOrganizationSettings(),
        getOrgStructure(),
        getMembers(),
        getSchools(),
        getActivities(),
        getLearningResources(),
        getOrgDocuments(),
        getTrainings(),
        getDiscussions(),
        getBestPractices(),
        getAnnouncements(),
        getMemberCardSettings(),
        getRegistrationConfig(),
      ]);

      setOrgSettings(fetchedSettings);
      setStructure(fetchedStructure);
      setMembers(fetchedMembers);
      setSchools(fetchedSchools);
      setActivities(fetchedActivities);
      setResources(fetchedResources);
      setDocuments(fetchedDocuments);
      setTrainings(fetchedTrainings);
      setDiscussions(fetchedDiscussions);
      setBestPractices(fetchedBestPractices);
      setAnnouncements(fetchedAnnouncements);
      setCardSettings(fetchedCardSettings);
      setRegConfig(fetchedRegConfig);
    } catch (error) {
      console.error('Failed to load all data:', error);
    }
  };

  const handleSaveRegConfig = async (updated: Partial<MemberRegistrationConfig>) => {
    await updateRegistrationConfig(updated);
    await loadAllData();
  };

  const handleSelectActivity = (act: Activity) => {
    setSelectedActivityForAttendance(act);
    setCurrentView('attendance');
  };

  const isPublicView = currentView.startsWith('public-');

  // Breadcrumbs labels mapping
  const viewLabels: Record<string, string> = {
    dashboard: 'Dashboard Utama',
    members: 'Manajemen Anggota',
    'my-card': 'Kartu Anggota Saya',
    'my-profile': 'Profil Saya',
    'member-cards': 'Manajemen Kartu Anggota',
    'card-settings': 'Pengaturan Kartu Anggota',
    organization: 'Organisasi & Struktur',
    activities: 'Agenda & Kegiatan',
    attendance: 'Presensi Digital (QR)',
    resources: 'Bank Perangkat PJOK',
    documents: 'Bank Dokumen & SK',
    trainings: 'Pelatihan & Sertifikat',
    discussions: 'Forum Diskusi',
    'best-practices': 'Inovasi & Praktik Baik',
    reports: 'Pusat Laporan',
    users: 'Manajemen Pengguna (RBAC)',
    'admin-logs': 'Log Aktivitas Administrator',
    settings: 'Pengaturan Sistem',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-base font-bold tracking-wide">MGMP PJOK SMP KABUPATEN PURBALINGGA</p>
          <p className="text-xs text-slate-400">Menghubungkan ke Cloud Firestore...</p>
        </div>
      </div>
    );
  }

  // PUBLIC LAYOUT
  if (isPublicView) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <PublicNavbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          orgSettings={orgSettings}
        />

        <main className="flex-1">
          {currentView === 'public-home' && (
            <PublicHome
              orgSettings={orgSettings}
              activities={activities}
              announcements={announcements}
              resources={resources}
              members={members}
              schools={schools}
              onNavigate={(v) => setCurrentView(v)}
              onSelectActivity={handleSelectActivity}
            />
          )}

          {currentView === 'public-profile' && <PublicProfile orgSettings={orgSettings} />}

          {currentView === 'public-structure' && (
            <PublicStructure structure={structure} orgSettings={orgSettings} />
          )}

          {currentView === 'public-agendas' && (
            <PublicAgendas
              activities={activities}
              onNavigate={(v) => setCurrentView(v)}
              onSelectActivity={handleSelectActivity}
            />
          )}

          {currentView === 'public-news' && <PublicNews announcements={announcements} />}

          {currentView === 'public-resources' && (
            <PublicLearningResources resources={resources} />
          )}

          {currentView === 'public-contact' && <PublicContact orgSettings={orgSettings} />}

          {currentView === 'public-verify-member' && (
            <PublicMemberVerification
              memberId={verifyMemberId}
              members={members}
              cardSettings={cardSettings}
              orgSettings={orgSettings}
              onBackToHome={() => setCurrentView('public-home')}
            />
          )}
        </main>

        <PublicFooter orgSettings={orgSettings} onNavigate={(view) => setCurrentView(view)} />
      </div>
    );
  }

  // INTERNAL / ADMIN / DASHBOARD LAYOUT
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        orgSettings={orgSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          orgSettings={orgSettings}
          currentView={currentView}
          onNavigate={(v) => setCurrentView(v)}
        />

        {/* Content body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
              ...(currentView !== 'dashboard'
                ? [{ label: viewLabels[currentView] || currentView }]
                : []),
            ]}
          />

          {/* Module Views */}
          {currentView === 'dashboard' && (
            <AdminDashboard
              members={members}
              schools={schools}
              activities={activities}
              resources={resources}
              documents={documents}
              trainings={trainings}
              orgSettings={orgSettings}
              regConfig={regConfig}
              onSaveRegConfig={handleSaveRegConfig}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'members' && (
            <RoleGuard
              isAllowed={canManageMembers}
              userRole={user?.role}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <MemberManagement
                members={members}
                schools={schools}
                orgSettings={orgSettings}
                onRefresh={loadAllData}
              />
            </RoleGuard>
          )}

          {currentView === 'my-card' && (
            <MyMemberCard
              members={members}
              cardSettings={cardSettings}
              orgSettings={orgSettings}
              onRefresh={loadAllData}
            />
          )}

          {currentView === 'my-profile' && (
            <MyProfile
              members={members}
              cardSettings={cardSettings}
              orgSettings={orgSettings}
              onNavigate={(v) => setCurrentView(v)}
              onRefresh={loadAllData}
            />
          )}

          {currentView === 'member-cards' && (
            <RoleGuard
              isAllowed={canManageMemberCards}
              userRole={user?.role}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <MemberCardsManagement
                members={members}
                schools={schools}
                cardSettings={cardSettings}
                orgSettings={orgSettings}
                onNavigateToSettings={() => setCurrentView('card-settings')}
              />
            </RoleGuard>
          )}

          {currentView === 'card-settings' && (
            <RoleGuard
              isAllowed={canManageCardSettings}
              userRole={user?.role}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <CardSettingsManagement
                cardSettings={cardSettings}
                orgSettings={orgSettings}
                onRefresh={loadAllData}
              />
            </RoleGuard>
          )}

          {currentView === 'organization' && (
            <RoleGuard
              isAllowed={canManageOrgSettings}
              userRole={user?.role}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <OrganizationSettings
                orgSettings={orgSettings}
                structure={structure}
                regConfig={regConfig}
                onRefresh={loadAllData}
              />
            </RoleGuard>
          )}

          {currentView === 'activities' && (
            <ActivityManagement
              activities={activities}
              orgSettings={orgSettings}
              onRefresh={loadAllData}
              onSelectActivityForAttendance={handleSelectActivity}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceDigital
              activities={activities}
              members={members}
              orgSettings={orgSettings}
              selectedActivityProp={selectedActivityForAttendance}
            />
          )}

          {currentView === 'resources' && (
            <LearningResourcesBank resources={resources} onRefresh={loadAllData} />
          )}

          {currentView === 'documents' && (
            <DocumentArchive documents={documents} onRefresh={loadAllData} />
          )}

          {currentView === 'trainings' && (
            <TeacherTrainings
              trainings={trainings}
              members={members}
              orgSettings={orgSettings}
              onRefresh={loadAllData}
            />
          )}

          {currentView === 'discussions' && (
            <DiscussionForum discussions={discussions} onRefresh={loadAllData} />
          )}

          {currentView === 'best-practices' && (
            <BestPractices practices={bestPractices} onRefresh={loadAllData} />
          )}

          {currentView === 'reports' && (
            <RoleGuard
              isAllowed={canManageMembers}
              userRole={user?.role}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <ReportsCenter
                members={members}
                activities={activities}
                schools={schools}
                resources={resources}
                documents={documents}
                trainings={trainings}
                orgSettings={orgSettings}
              />
            </RoleGuard>
          )}

          {currentView === 'users' && (
            <RoleGuard
              isAllowed={canAccessUsers}
              userRole={user?.role}
              isSuperAdminRoute={true}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <UserManagement />
            </RoleGuard>
          )}

          {currentView === 'admin-logs' && (
            <RoleGuard
              isAllowed={canAccessActivityLogs}
              userRole={user?.role}
              isSuperAdminRoute={true}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <AdminActivityLogs />
            </RoleGuard>
          )}

          {currentView === 'settings' && (
            <RoleGuard
              isAllowed={canAccessSystemSettings}
              userRole={user?.role}
              isSuperAdminRoute={true}
              onBackToDashboard={() => setCurrentView('dashboard')}
            >
              <OrganizationSettings
                orgSettings={orgSettings}
                structure={structure}
                regConfig={regConfig}
                onRefresh={loadAllData}
              />
            </RoleGuard>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
