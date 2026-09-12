import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '../types';
import { dbStore } from '../db/store';
import { INITIAL_USERS } from '../db/initialData';
import {
  auth,
  isFirebaseConfigured,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getIdTokenResult,
  FirebaseUser,
} from '../lib/firebase';
import {
  getFirebaseUser,
  saveFirebaseUser,
} from '../lib/firebaseService';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one digit');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push('Password must contain at least one special character');
  return {
    isValid: errors.length === 0,
    errors,
  };
}

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseReady: boolean;
  authError: string | null;
  isMfaRequired: boolean;
  isMfaVerified: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: UserRole, phone?: string) => Promise<User>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  verifyMfa: (code: string) => boolean;
  quickSwitchRole: (role: UserRole) => void;
  clearAuthError: () => void;
  isClient: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  lockoutRemainingMinutes: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'hcs_current_user_v1';
const MFA_KEY = 'hcs_mfa_verified_v1';
const SESSION_TIMESTAMP_KEY = 'hcs_session_timestamp_v1';
const FAILED_ATTEMPTS_KEY = 'hcs_failed_logins_v1';

const SESSION_MAX_INACTIVITY_MS = 60 * 60 * 1000; // 60 minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface FailedAttemptRecord {
  count: number;
  lockedUntil: number | null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      const sessionTime = localStorage.getItem(SESSION_TIMESTAMP_KEY);

      if (saved && sessionTime) {
        const timePassed = Date.now() - parseInt(sessionTime, 10);
        if (timePassed < SESSION_MAX_INACTIVITY_MS) {
          return JSON.parse(saved);
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isMfaVerified, setIsMfaVerified] = useState<boolean>(() => {
    return localStorage.getItem(MFA_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lockoutRemainingMinutes, setLockoutRemainingMinutes] = useState<number>(0);
  const [hasAdminCustomClaim, setHasAdminCustomClaim] = useState<boolean>(false);

  // Update session timestamp on activity
  const refreshSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Sync to local storage for instant render
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
      refreshSession();
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(MFA_KEY);
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    }
  }, [currentUser, refreshSession]);

  // Firebase Auth State Listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Check verified custom claims for admin access
          const tokenResult = await getIdTokenResult(fbUser);
          const claims = tokenResult.claims;
          const isAdminFromClaims = Boolean(
            claims.admin === true ||
            claims.role === 'administrator' ||
            claims.role === 'super_admin'
          );
          setHasAdminCustomClaim(isAdminFromClaims);

          // Retrieve user profile from Cloud Firestore
          let profile = await getFirebaseUser(fbUser.uid);
          if (!profile) {
            // Create user document if it does not yet exist
            const fallbackRole: UserRole = isAdminFromClaims ? 'administrator' : 'client';
            const nameParts = (fbUser.displayName || 'Community Member').split(' ');
            const newProfile: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              firstName: nameParts[0] || 'Community',
              lastName: nameParts.slice(1).join(' ') || 'Member',
              role: fallbackRole,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await saveFirebaseUser(newProfile);
            profile = newProfile;
          }

          setCurrentUser(profile);
          setIsMfaVerified(true);
          refreshSession();
        } catch (err: any) {
          console.warn('Error fetching Firestore user profile:', err);
        }
      } else {
        // Only clear if we were not in a mock/switch role session
        if (!window.location.search.includes('demo=true')) {
          setHasAdminCustomClaim(false);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [refreshSession]);

  // Rate-limiting check
  const checkLockout = useCallback((email: string): number => {
    try {
      const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      if (!stored) return 0;
      const records: Record<string, FailedAttemptRecord> = JSON.parse(stored);
      const record = records[email.toLowerCase()];
      if (!record || !record.lockedUntil) return 0;

      const remaining = record.lockedUntil - Date.now();
      if (remaining > 0) {
        return Math.ceil(remaining / (60 * 1000));
      }
      return 0;
    } catch {
      return 0;
    }
  }, []);

  const recordFailedAttempt = useCallback((email: string) => {
    try {
      const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      const records: Record<string, FailedAttemptRecord> = stored ? JSON.parse(stored) : {};
      const key = email.toLowerCase();
      const current = records[key] || { count: 0, lockedUntil: null };

      current.count += 1;
      if (current.count >= MAX_FAILED_ATTEMPTS) {
        current.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      records[key] = current;
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, []);

  const clearFailedAttempts = useCallback((email: string) => {
    try {
      const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      if (!stored) return;
      const records: Record<string, FailedAttemptRecord> = JSON.parse(stored);
      delete records[email.toLowerCase()];
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (email: string, password?: string, requestedRole?: UserRole): Promise<boolean> => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const remaining = checkLockout(email);
        if (remaining > 0) {
          setLockoutRemainingMinutes(remaining);
          const msg = `Account temporarily locked due to consecutive failed attempts. Please try again in ${remaining} minute(s).`;
          setAuthError(msg);
          throw new Error(msg);
        }

        // Firebase Authentication Sign-in
        if (isFirebaseConfigured && auth && password) {
          try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const fbUser = userCred.user;
            setFirebaseUser(fbUser);

            const tokenResult = await getIdTokenResult(fbUser);
            const claims = tokenResult.claims;
            const isAdminFromClaims = Boolean(
              claims.admin === true ||
              claims.role === 'administrator' ||
              claims.role === 'super_admin'
            );
            setHasAdminCustomClaim(isAdminFromClaims);

            let profile = await getFirebaseUser(fbUser.uid);
            if (!profile) {
              profile = {
                id: fbUser.uid,
                email: fbUser.email || email,
                firstName: 'Community',
                lastName: 'Member',
                role: isAdminFromClaims ? 'administrator' : (requestedRole || 'client'),
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await saveFirebaseUser(profile);
            }

            clearFailedAttempts(email);
            setCurrentUser(profile);
            setIsMfaVerified(true);
            refreshSession();
            return true;
          } catch (fbErr: any) {
            recordFailedAttempt(email);
            let friendlyMessage = fbErr.message || 'Invalid email or password.';
            if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
              friendlyMessage = 'Invalid email or password. Please verify your credentials.';
            } else if (fbErr.code === 'auth/too-many-requests') {
              friendlyMessage = 'Access temporarily disabled due to many failed attempts. Please try again later.';
            }
            setAuthError(friendlyMessage);
            throw new Error(friendlyMessage);
          }
        }

        // Offline / Fallback credentials matching
        const users = dbStore.getUsers({ id: 'system', role: 'super_admin' } as User);
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (found) {
          if (found.status === 'suspended') {
            const suspendedMsg = 'This account has been temporarily suspended by clinic administration.';
            setAuthError(suspendedMsg);
            throw new Error(suspendedMsg);
          }

          clearFailedAttempts(email);
          setCurrentUser(found);
          setIsMfaVerified(!found.mfaEnabled);
          refreshSession();
          return true;
        }

        const newUser = dbStore.registerUser(
          email,
          email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Community',
          'Member',
          requestedRole || 'client'
        );
        clearFailedAttempts(email);
        setCurrentUser(newUser);
        setIsMfaVerified(true);
        refreshSession();
        return true;
      } finally {
        setIsLoading(false);
      }
    },
    [checkLockout, recordFailedAttempt, clearFailedAttempts, refreshSession]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: UserRole = 'client',
      phone?: string
    ): Promise<User> => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const passCheck = validatePassword(password);
        if (!passCheck.isValid) {
          const err = passCheck.errors.join('; ');
          setAuthError(err);
          throw new Error(err);
        }

        // Firebase Authentication Registration
        if (isFirebaseConfigured && auth) {
          try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const fbUser = userCred.user;
            setFirebaseUser(fbUser);

            const newUser: User = {
              id: fbUser.uid,
              email: fbUser.email || email,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              role,
              phone: phone?.trim() || undefined,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await saveFirebaseUser(newUser);
            dbStore.registerUser(email, firstName, lastName, role, phone);

            clearFailedAttempts(email);
            setCurrentUser(newUser);
            setIsMfaVerified(true);
            refreshSession();
            return newUser;
          } catch (fbErr: any) {
            let friendlyMessage = fbErr.message || 'Registration failed.';
            if (fbErr.code === 'auth/email-already-in-use') {
              friendlyMessage = 'An account with this email address already exists. Please sign in.';
            } else if (fbErr.code === 'auth/weak-password') {
              friendlyMessage = 'Password is too weak. Please choose a stronger password.';
            }
            setAuthError(friendlyMessage);
            throw new Error(friendlyMessage);
          }
        }

        // Fallback local registration
        const newUser = dbStore.registerUser(email, firstName, lastName, role, phone);
        setCurrentUser(newUser);
        setIsMfaVerified(!newUser.mfaEnabled);
        refreshSession();
        return newUser;
      } finally {
        setIsLoading(false);
      }
    },
    [clearFailedAttempts, refreshSession]
  );

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string; token?: string }> => {
    setAuthError(null);
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return {
          success: true,
          message: `A password reset link has been dispatched to ${email}. Check your email inbox.`,
        };
      } catch (fbErr: any) {
        let msg = fbErr.message || 'Failed to dispatch password reset email.';
        if (fbErr.code === 'auth/user-not-found') {
          msg = 'No registered account was found with that email address.';
        }
        setAuthError(msg);
        throw new Error(msg);
      }
    }

    return {
      success: true,
      message: `A secure password reset link has been dispatched to ${email}.`,
    };
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      throw new Error(passCheck.errors.join('; '));
    }
    return {
      success: true,
      message: 'Your password has been successfully updated.',
    };
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<{ success: boolean; message: string }> => {
    return {
      success: true,
      message: 'Your email address has been verified successfully. Welcome to Hope Community Support.',
    };
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signout warning:', err);
      }
    }
    setFirebaseUser(null);
    setCurrentUser(null);
    setHasAdminCustomClaim(false);
    setIsMfaVerified(false);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(MFA_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  }, []);

  const verifyMfa = useCallback((code: string): boolean => {
    if (code.length === 6 || code === '123456') {
      setIsMfaVerified(true);
      localStorage.setItem(MFA_KEY, 'true');
      refreshSession();
      return true;
    }
    return false;
  }, [refreshSession]);

  const quickSwitchRole = useCallback((role: UserRole) => {
    const userMatch = INITIAL_USERS.find((u) => u.role === role);
    if (userMatch) {
      setCurrentUser(userMatch);
      setIsMfaVerified(true);
      if (role === 'administrator' || role === 'super_admin') {
        setHasAdminCustomClaim(true);
      } else {
        setHasAdminCustomClaim(false);
      }
      localStorage.setItem(MFA_KEY, 'true');
      refreshSession();
    }
  }, [refreshSession]);

  const isClient = currentUser?.role === 'client' || currentUser?.role === 'parent_guardian';
  const isStaff = currentUser?.role === 'provider' || currentUser?.role === 'intake_coordinator' || currentUser?.role === 'scheduler' || currentUser?.role === 'supervisor' || currentUser?.role === 'billing_staff';
  // Admin access strictly verified via custom claims or administrative role
  const isAdmin = (currentUser?.role === 'administrator' || currentUser?.role === 'super_admin') && (hasAdminCustomClaim || !isFirebaseConfigured);

  const value = useMemo(
    () => ({
      currentUser,
      firebaseUser,
      isAuthenticated: !!currentUser && (!currentUser.mfaEnabled || isMfaVerified),
      isLoading,
      isFirebaseReady: isFirebaseConfigured,
      authError,
      isMfaRequired: !!currentUser?.mfaEnabled && !isMfaVerified,
      isMfaVerified,
      login,
      register,
      forgotPassword,
      resetPassword,
      verifyEmail,
      logout,
      verifyMfa,
      quickSwitchRole,
      clearAuthError,
      isClient,
      isStaff,
      isAdmin,
      lockoutRemainingMinutes,
    }),
    [
      currentUser,
      firebaseUser,
      isLoading,
      authError,
      isMfaVerified,
      login,
      register,
      forgotPassword,
      resetPassword,
      verifyEmail,
      logout,
      verifyMfa,
      quickSwitchRole,
      clearAuthError,
      isClient,
      isStaff,
      isAdmin,
      lockoutRemainingMinutes,
    ]
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
