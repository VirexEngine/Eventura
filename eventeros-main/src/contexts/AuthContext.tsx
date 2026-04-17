import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiLogin, apiGetUser, apiUpdateUserProfile } from '@/lib/api';

export type UserRole = 'organizer' | 'judge' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username?: string;
  role: UserRole;
  avatar?: string;
  organisations?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: { name?: string; email?: string }) => Promise<boolean>;
  updateUsername: (username: string) => Promise<boolean>;
  joinOrg: (orgId: string, code: string) => Promise<boolean>;
  leaveOrg: (orgId: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persist session in localStorage (survives tab refresh)
const SESSION_KEY = 'eventflow_session';

// ── Fallback credentials (used when backend is offline) ──────────────────────
const mockUsers: Record<UserRole, User> = {
  organizer: { id: '1', name: 'Sarah Chen', email: 'sarah@eventpro.com', role: 'organizer', avatar: '' },
  judge: { id: '2', name: 'Dr. Alex Rivera', email: 'alex@judge.com', role: 'judge', avatar: '' },
  user: { id: '3', name: 'Riya Sharma', email: 'riya@user.com', role: 'user', avatar: '' },
};

const mockPasswords: Record<UserRole, string> = {
  organizer: 'organizer123',
  judge: 'judge123',
  user: 'user123',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  // On mount: if we have a session, refresh user data from backend
  useEffect(() => {
    if (!user) return;
    apiGetUser(user.id).then(fresh => {
      if (fresh) setUser(fresh as User);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    // Try backend first
    const backendUser = await apiLogin(email, password, role);
    if (backendUser) {
      setUser(backendUser as User);
      return true;
    }

    // Fallback: offline mock auth
    if (role) {
      const mock = mockUsers[role];
      if (mock && mockPasswords[role] === password && mock.email === email) {
        setUser(mock);
        return true;
      }
    } else {
      // Search all mock users if no role provided
      for (const r of Object.keys(mockUsers) as UserRole[]) {
        const mock = mockUsers[r];
        if (mock && mockPasswords[r] === password && mock.email === email) {
          setUser(mock);
          return true;
        }
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateUser = useCallback(async (updates: { name?: string; email?: string }): Promise<boolean> => {
    let currentId: string | null = null;
    setUser(prev => {
      if (!prev) return prev;
      currentId = prev.id;
      const next = { ...prev, ...updates };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    if (!currentId) return false;
    const ok = await apiUpdateUserProfile(currentId, updates);
    const fresh = await apiGetUser(currentId);
    if (fresh) {
      setUser(fresh as User);
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(fresh)); } catch { /* noop */ }
    }
    return ok;
  }, []);

  const updateUsername = useCallback(async (username: string): Promise<boolean> => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, username };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    return true; // Mock true for now
  }, []);

  const joinOrg = useCallback(async (orgId: string, code: string): Promise<boolean> => {
    // Basic mock implementation
    if (!code) return false;
    setUser(prev => {
      if (!prev) return prev;
      const orgs = prev.organisations || [];
      if (orgs.includes(orgId)) return prev;
      const next = { ...prev, organisations: [...orgs, orgId] };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    return true;
  }, []);

  const leaveOrg = useCallback(async (orgId: string): Promise<boolean> => {
    setUser(prev => {
      if (!prev) return prev;
      const orgs = prev.organisations || [];
      const next = { ...prev, organisations: orgs.filter(id => id !== orgId) };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, updateUsername, joinOrg, leaveOrg, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
