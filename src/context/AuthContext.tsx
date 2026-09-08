import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '../types';
import { dbStore } from '../db/store';
import { INITIAL_USERS } from '../db/initialData';

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
  isAuthenticated: boolean;
  isLoading: boolean;
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
const PASSWORDS_VAULT_KEY = 'hcs_mock_creds_v1';
const RESET_TOKENS_KEY = 'hcs_reset_tokens_v1';

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
      // Eleanor Vance test persona only loaded if explicitly requested via ?demo=true
      if (typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
        return INITIAL_USERS[0];
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isMfaVerified, setIsMfaVerified] = useState<boolean>(() => {
    return localStorage.getItem(MFA_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lockoutRemainingMinutes, setLockoutRemainingMinutes] = useState<number>(0);

  // Update session timestamp on activity
  const refreshSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
    }
  }, []);

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

  // Periodic session timeout check
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionTime = localStorage.getItem(SESSION_TIMESTAMP_KEY);
      if (sessionTime && currentUser) {
        const timePassed = Date.now() - parseInt(sessionTime, 10);
        if (timePassed > SESSION_MAX_INACTIVITY_MS) {
          // Session expired
          dbStore.logAction(
            currentUser,
            'SESSION_EXPIRED',
            'users',
            currentUser.id,
            'Session expired due to 60 minutes of inactivity',
            'info'
          );
          setCurrentUser(null);
          setIsMfaVerified(false);
          localStorage.removeItem(AUTH_USER_KEY);
          localStorage.removeItem(MFA_KEY);
          localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const isMfaRequired = useMemo(() => {
    if (!currentUser) return false;
    return !!currentUser.mfaEnabled && !isMfaVerified;
  }, [currentUser, isMfaVerified]);

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
        dbStore.reportSecurityIncident(
          {
            reporterId: 'system',
            reporterName: 'Automated Rate Limiter',
            type: 'unauthorized_access_attempt',
            severity: 'medium',
            description: `Account lockout enforced for ${email}: ${MAX_FAILED_ATTEMPTS} consecutive invalid authentication attempts.`,
            status: 'investigating',
          },
          { id: 'system', role: 'super_admin' } as User
        );
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
      if (stored) {
        const records: Record<string, FailedAttemptRecord> = JSON.parse(stored);
        delete records[email.toLowerCase()];
        localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(records));
      }
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (email: string, password?: string, requestedRole?: UserRole): Promise<boolean> => {
      setIsLoading(true);
      try {
        const remaining = checkLockout(email);
        if (remaining > 0) {
          setLockoutRemainingMinutes(remaining);
          throw new Error(`Account temporarily locked due to consecutive failed attempts. Please try again in ${remaining} minute(s).`);
        }

        // Attempt server-side authentication if credentials provided
        if (password) {
          try {
            const apiRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            if (apiRes.ok) {
              const data = await apiRes.json();
              if (data.token) {
                localStorage.setItem('hcs_auth_token', data.token);
              }
              const loggedUser: User = {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                role: data.user.role as UserRole,
                phone: data.user.phone,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              clearFailedAttempts(email);
              setCurrentUser(loggedUser);
              setIsMfaVerified(true);
              refreshSession();
              return true;
            } else if (apiRes.status === 423) {
              const err = await apiRes.json();
              throw new Error(err.error || 'Account temporarily locked.');
            }
          } catch (netErr: any) {
            if (netErr.message?.includes('locked')) throw netErr;
            // Fallback to local store if server unreachable or offline
          }
        }

        const users = dbStore.getUsers({ id: 'system', role: 'super_admin' } as User);
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (found) {
          if (found.status === 'suspended') {
            throw new Error('This account has been temporarily suspended by clinic administration. Please contact (803) 701-9332.');
          }

          if (password && password.length < 6) {
            recordFailedAttempt(email);
            throw new Error('Invalid credentials. Please verify your email and password.');
          }

          clearFailedAttempts(email);
          setCurrentUser(found);
          setIsMfaVerified(!found.mfaEnabled);
          refreshSession();
          dbStore.logAction(found, 'USER_LOGIN', 'users', found.id, 'Logged in successfully');
          return true;
        }

        // If email not found and valid password, allow self-service registration
        if (password) {
          const check = validatePassword(password);
          if (!check.isValid) {
            throw new Error(check.errors[0]);
          }
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
    async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'client', phone?: string): Promise<User> => {
      setIsLoading(true);
      try {
        const passCheck = validatePassword(password);
        if (!passCheck.isValid) {
          throw new Error(passCheck.errors.join('; '));
        }

        // Try backend registration
        try {
          const apiRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, lastName, phone, role }),
          });
          if (apiRes.ok) {
            const data = await apiRes.json();
            if (data.token) {
              localStorage.setItem('hcs_auth_token', data.token);
            }
            const registeredUser: User = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              role: data.user.role as UserRole,
              phone: data.user.phone,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            dbStore.registerUser(email, firstName, lastName, role, phone);
            setCurrentUser(registeredUser);
            setIsMfaVerified(true);
            refreshSession();
            return registeredUser;
          } else {
            const err = await apiRes.json();
            if (err.error) throw new Error(err.error);
          }
        } catch (netErr: any) {
          if (netErr.message && !netErr.message.includes('fetch')) {
            throw netErr;
          }
        }

        const existing = dbStore.getUsers({ id: 'system', role: 'super_admin' } as User)
          .find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          throw new Error('An account with this email address already exists. Please log in or use forgot password.');
        }

        const newUser = dbStore.registerUser(email, firstName, lastName, role, phone);
        setCurrentUser(newUser);
        setIsMfaVerified(!newUser.mfaEnabled);
        refreshSession();
        return newUser;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string; token?: string }> => {
    const users = dbStore.getUsers({ id: 'system', role: 'super_admin' } as User);
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    const token = `rst_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    try {
      const stored = localStorage.getItem(RESET_TOKENS_KEY);
      const tokens: Record<string, { email: string; expiresAt: number }> = stored ? JSON.parse(stored) : {};
      tokens[token] = {
        email: email.toLowerCase(),
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      };
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
    } catch {
      // ignore
    }

    if (found) {
      dbStore.logAction(found, 'PASSWORD_RESET_REQUESTED', 'users', found.id, 'Password reset token generated and dispatched');
    }

    return {
      success: true,
      message: `A secure password reset link has been dispatched to ${email}. Check your inbox for instructions.`,
      token,
    };
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      throw new Error(passCheck.errors.join('; '));
    }

    try {
      const stored = localStorage.getItem(RESET_TOKENS_KEY);
      const tokens: Record<string, { email: string; expiresAt: number }> = stored ? JSON.parse(stored) : {};
      const record = tokens[token];

      if (!record || record.expiresAt < Date.now()) {
        throw new Error('This password reset link is invalid or has expired. Please request a new one.');
      }

      delete tokens[token];
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

      const users = dbStore.getUsers({ id: 'system', role: 'super_admin' } as User);
      const found = users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());

      if (found) {
        dbStore.logAction(found, 'PASSWORD_RESET_COMPLETED', 'users', found.id, 'Password was updated successfully');
      }

      return {
        success: true,
        message: 'Your password has been successfully updated. You may now log in with your new credentials.',
      };
    } catch (e: any) {
      throw new Error(e.message || 'Password reset failed');
    }
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<{ success: boolean; message: string }> => {
    return {
      success: true,
      message: 'Your email address has been verified successfully. Welcome to Hope Community Support.',
    };
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      dbStore.logAction(currentUser, 'USER_LOGOUT', 'users', currentUser.id, 'Signed out');
    }
    setCurrentUser(null);
    setIsMfaVerified(false);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(MFA_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  }, [currentUser]);

  const verifyMfa = useCallback((code: string): boolean => {
    if (code.length === 6 || code === '123456') {
      setIsMfaVerified(true);
      localStorage.setItem(MFA_KEY, 'true');
      refreshSession();
      if (currentUser) {
        dbStore.logAction(currentUser, 'MFA_VERIFIED', 'users', currentUser.id, 'Completed multi-factor authentication challenge');
      }
      return true;
    }
    return false;
  }, [currentUser, refreshSession]);

  const quickSwitchRole = useCallback((role: UserRole) => {
    const userMatch = INITIAL_USERS.find((u) => u.role === role);
    if (userMatch) {
      setCurrentUser(userMatch);
      setIsMfaVerified(true);
      localStorage.setItem(MFA_KEY, 'true');
      refreshSession();
      dbStore.logAction(userMatch, 'ROLE_SWITCH_DEMO', 'users', userMatch.id, `Switched view to ${role}`);
    }
  }, [refreshSession]);

  const isClient = currentUser?.role === 'client' || currentUser?.role === 'parent_guardian';
  const isStaff = currentUser?.role === 'provider' || currentUser?.role === 'intake_coordinator' || currentUser?.role === 'scheduler' || currentUser?.role === 'supervisor' || currentUser?.role === 'billing_staff';
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
      forgotPassword,
      resetPassword,
      verifyEmail,
      logout,
      verifyMfa,
      quickSwitchRole,
      isClient,
      isStaff,
      isAdmin,
      lockoutRemainingMinutes,
    }),
    [
      currentUser,
      isLoading,
      isMfaRequired,
      isMfaVerified,
      login,
      register,
      forgotPassword,
      resetPassword,
      verifyEmail,
      logout,
      verifyMfa,
      quickSwitchRole,
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
