import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '../types';
import { dbStore } from '../db/store';
import { INITIAL_USERS } from '../db/initialData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMfaRequired: boolean;
  isMfaVerified: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  register: (email: string, firstName: string, lastName: string, role?: UserRole, phone?: string) => Promise<User>;
  logout: () => void;
  verifyMfa: (code: string) => boolean;
  quickSwitchRole: (role: UserRole) => void;
  isClient: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'hcs_current_user_v1';
const MFA_KEY = 'hcs_mfa_verified_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
      // Default to client Eleanor Vance for an immediate interactive view
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [isMfaVerified, setIsMfaVerified] = useState<boolean>(() => {
    return localStorage.getItem(MFA_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(MFA_KEY);
    }
  }, [currentUser]);

  const isMfaRequired = useMemo(() => {
    if (!currentUser) return false;
    return !!currentUser.mfaEnabled && !isMfaVerified;
  }, [currentUser, isMfaVerified]);

  const login = useCallback(async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = dbStore.getUsers({ id: 'system', role: 'super_admin' } as User);
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        if (found.status === 'suspended') {
          throw new Error('This account has been temporarily suspended. Please contact Hope Community Support administration.');
        }
        setCurrentUser(found);
        setIsMfaVerified(!found.mfaEnabled);
        dbStore.logAction(found, 'USER_LOGIN', 'users', found.id, 'Logged in successfully');
        return true;
      }

      // If new email provided during demo login, auto-register as requested role or client
      const newUser = dbStore.registerUser(
        email,
        email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Community',
        'Member',
        requestedRole || 'client'
      );
      setCurrentUser(newUser);
      setIsMfaVerified(true);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, firstName: string, lastName: string, role: UserRole = 'client', phone?: string): Promise<User> => {
      setIsLoading(true);
      try {
        const newUser = dbStore.registerUser(email, firstName, lastName, role, phone);
        setCurrentUser(newUser);
        setIsMfaVerified(!newUser.mfaEnabled);
        return newUser;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    if (currentUser) {
      dbStore.logAction(currentUser, 'USER_LOGOUT', 'users', currentUser.id, 'Signed out');
    }
    setCurrentUser(null);
    setIsMfaVerified(false);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(MFA_KEY);
  }, [currentUser]);

  const verifyMfa = useCallback((code: string): boolean => {
    // In production this verifies TOTP / SMS. For verified demo, 6-digit code or '123456' succeeds
    if (code.length === 6 || code === '123456') {
      setIsMfaVerified(true);
      localStorage.setItem(MFA_KEY, 'true');
      if (currentUser) {
        dbStore.logAction(currentUser, 'MFA_VERIFIED', 'users', currentUser.id, 'Completed multi-factor authentication challenge');
      }
      return true;
    }
    return false;
  }, [currentUser]);

  const quickSwitchRole = useCallback((role: UserRole) => {
    const userMatch = INITIAL_USERS.find((u) => u.role === role);
    if (userMatch) {
      setCurrentUser(userMatch);
      setIsMfaVerified(true);
      localStorage.setItem(MFA_KEY, 'true');
      dbStore.logAction(userMatch, 'ROLE_SWITCH_DEMO', 'users', userMatch.id, `Switched view to ${role}`);
    }
  }, []);

  const isClient = currentUser?.role === 'client' || currentUser?.role === 'parent_guardian';
  const isStaff = currentUser?.role === 'provider' || currentUser?.role === 'intake_coordinator' || currentUser?.role === 'scheduler' || currentUser?.role === 'supervisor';
  const isAdmin = currentUser?.role === 'administrator' || currentUser?.role === 'super_admin';

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser && (!currentUser.mfaEnabled || isMfaVerified),
      isLoading,
      isMfaRequired,
      isMfaVerified,
      login,
      register,
      logout,
      verifyMfa,
      quickSwitchRole,
      isClient,
      isStaff,
      isAdmin,
    }),
    [currentUser, isLoading, isMfaRequired, isMfaVerified, login, register, logout, verifyMfa, quickSwitchRole, isClient, isStaff, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
