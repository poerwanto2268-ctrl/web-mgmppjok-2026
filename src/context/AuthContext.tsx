import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut } from '../services/firebase';
import { AppUser, UserRole } from '../types';

export const SUPER_ADMIN_PASSWORD = 'd@viks2268#';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  setSimulationRole: (role: UserRole) => boolean | void;
  isSuperAdminUnlocked: boolean;
  unlockSuperAdmin: (password: string) => boolean;
  lockSuperAdmin: () => void;
  isSuperAdmin: boolean;
  isKetua: boolean;
  isSekretaris: boolean;
  isAnggota: boolean;
  canAccessUsers: boolean;
  canAccessSystemSettings: boolean;
  canAccessActivityLogs: boolean;
  canEditGoogleFormSettings: boolean;
  canManageOrgSettings: boolean;
  canManageCardSettings: boolean;
  canManageMemberCards: boolean;
  canImportData: boolean;
  canManageMembers: boolean;
  canVerifyMembers: boolean;
  canManageActivities: boolean;
  canManageResources: boolean;
  canManageFinances: boolean;
  canDeleteData: boolean;
  canManageSettings: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>({
    uid: 'guest',
    email: null,
    displayName: 'Pengunjung Umum',
    photoURL: null,
    role: 'Pengunjung',
  });
  const [loading, setLoading] = useState(true);

  // Super Admin password unlock state
  const [isSuperAdminUnlocked, setIsSuperAdminUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('super_admin_unlocked') === 'true';
    }
    return false;
  });

  const unlockSuperAdmin = (password: string): boolean => {
    if (password === SUPER_ADMIN_PASSWORD) {
      setIsSuperAdminUnlocked(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('super_admin_unlocked', 'true');
      }
      return true;
    }
    return false;
  };

  const lockSuperAdmin = () => {
    setIsSuperAdminUnlocked(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('super_admin_unlocked');
    }
    setUser({
      uid: 'sim-ketua',
      email: 'ketua.pjok@purbalingga.go.id',
      displayName: 'Sutarman, S.Pd., M.Pd. (Ketua MGMP)',
      photoURL: null,
      role: 'Ketua',
      memberId: 'MGMP-PBG-001',
      isCustomRole: true,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Check if admin email
        const isAdmin = fbUser.email === 'sutarman811@guru.smp.belajar.id';
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'Bpk/Ibu Guru PJOK',
          photoURL: fbUser.photoURL,
          role: isAdmin ? 'Super Admin' : 'Anggota',
          memberId: 'MGMP-PBG-001',
        });
      } else {
        // Default to demo Ketua state so Super Admin is protected by password
        setUser((prev) => {
          if (prev && prev.isCustomRole) return prev;
          return {
            uid: 'admin-preview',
            email: 'ketua.pjok@purbalingga.go.id',
            displayName: 'Sutarman, S.Pd., M.Pd. (Ketua MGMP)',
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            role: 'Ketua',
            memberId: 'MGMP-PBG-001',
            isCustomRole: true,
          };
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-in Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      lockSuperAdmin();
      setUser({
        uid: 'guest',
        email: null,
        displayName: 'Pengunjung Umum',
        photoURL: null,
        role: 'Pengunjung',
        isCustomRole: true,
      });
    } catch (error) {
      console.error('Sign-out Error:', error);
    }
  };

  const setSimulationRole = (role: UserRole): boolean | void => {
    if (role === 'Super Admin' && !isSuperAdminUnlocked) {
      return false;
    }

    if (role === 'Pengunjung') {
      setUser({
        uid: 'guest',
        email: null,
        displayName: 'Pengunjung Umum',
        photoURL: null,
        role: 'Pengunjung',
        isCustomRole: true,
      });
      return true;
    }

    const roleNameMap: Record<UserRole, { name: string; email: string; memberId: string }> = {
      'Super Admin': { name: 'Sutarman, S.Pd., M.Pd. (Super Admin)', email: 'sutarman811@guru.smp.belajar.id', memberId: 'MGMP-PBG-001' },
      'Ketua': { name: 'Sutarman, S.Pd., M.Pd. (Ketua MGMP)', email: 'ketua.pjok@purbalingga.go.id', memberId: 'MGMP-PBG-001' },
      'Sekretaris': { name: 'Tri Wahyudi, S.Pd. (Sekretaris)', email: 'triwahyudi.pjok@guru.smp.belajar.id', memberId: 'MGMP-PBG-002' },
      'Bendahara': { name: 'Siti Nurjanah, S.Pd. (Bendahara)', email: 'sitinurjanah.pjok@guru.smp.belajar.id', memberId: 'MGMP-PBG-003' },
      'Pengurus': { name: 'Agus Prasetyo, S.Pd. (Koord. Kurikulum)', email: 'agusprasetyo.pjok@guru.smp.belajar.id', memberId: 'MGMP-PBG-004' },
      'Anggota': { name: 'Nurul Hidayati, S.Pd. (Guru PJOK)', email: 'nurulhidayati@guru.smp.belajar.id', memberId: 'MGMP-PBG-009' },
      'Pengunjung': { name: 'Pengunjung Umum', email: '', memberId: '' }
    };

    const target = roleNameMap[role];
    setUser({
      uid: `sim-${role.toLowerCase().replace(/\s+/g, '-')}`,
      email: target.email,
      displayName: target.name,
      photoURL: null,
      role: role,
      memberId: target.memberId,
      isCustomRole: true,
    });
    return true;
  };

  const role = user?.role || 'Pengunjung';
  const isLoggedIn = role !== 'Pengunjung';
  const isSuperAdmin = role === 'Super Admin' && isSuperAdminUnlocked;
  const isKetua = role === 'Ketua' || isSuperAdmin;
  const isSekretaris = role === 'Sekretaris';
  const isAnggota = role === 'Anggota';

  // Section F RBAC Table
  const canAccessUsers = isSuperAdmin;
  const canAccessSystemSettings = isSuperAdmin;
  const canAccessActivityLogs = isSuperAdmin;
  const canEditGoogleFormSettings = isSuperAdmin;

  const canManageOrgSettings = isSuperAdmin || isKetua;
  const canManageCardSettings = isSuperAdmin || isKetua;
  const canManageMemberCards = isSuperAdmin || isKetua;

  const canImportData = isSuperAdmin || isSekretaris;
  const canManageMembers = isSuperAdmin || isKetua || isSekretaris;
  const canVerifyMembers = isSuperAdmin || isKetua || isSekretaris;

  const canManageActivities = isSuperAdmin || isKetua || isSekretaris || role === 'Pengurus';
  const canManageResources = isSuperAdmin || isKetua || isSekretaris || role === 'Pengurus' || isAnggota;
  const canManageFinances = isSuperAdmin || isKetua || role === 'Bendahara';
  const canDeleteData = isSuperAdmin;
  const canManageSettings = isSuperAdmin || isKetua;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithGoogle,
        logout,
        setSimulationRole,
        isSuperAdminUnlocked,
        unlockSuperAdmin,
        lockSuperAdmin,
        isSuperAdmin,
        isKetua,
        isSekretaris,
        isAnggota,
        canAccessUsers,
        canAccessSystemSettings,
        canAccessActivityLogs,
        canEditGoogleFormSettings,
        canManageOrgSettings,
        canManageCardSettings,
        canManageMemberCards,
        canImportData,
        canManageMembers,
        canVerifyMembers,
        canManageActivities,
        canManageResources,
        canManageFinances,
        canDeleteData,
        canManageSettings,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
