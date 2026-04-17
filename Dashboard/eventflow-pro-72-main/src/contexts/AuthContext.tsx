import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiLogin, apiGetUser, apiUpdateUserProfile } from '@/lib/api';

export type UserRole = 'organizer' | 'judge' | 'team';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  teamId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: { name?: string; email?: string }) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persist session in localStorage (survives tab refresh)
const SESSION_KEY = 'eventflow_session';

// ── Fallback credentials (used when backend is offline) ──────────────────────
const mockUsers: Record<UserRole, User> = {
  organizer: { id: '1', name: 'Sarah Chen', email: 'sarah@eventpro.com', role: 'organizer', avatar: '' },
  judge: { id: '2', name: 'Dr. Alex Rivera', email: 'alex@judge.com', role: 'judge', avatar: '' },
  team: { id: '3', name: 'Team Alpha', email: 'alpha@team.com', role: 'team', teamId: '1', avatar: '' },
};

const mockPasswords: Record<UserRole, string> = {
  organizer: 'organizer123',
  judge: 'judge123',
  team: 'team123',
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

  /** Update profile — optimistic local update first, then persist to backend and re-fetch */
  const updateUser = useCallback(async (updates: { name?: string; email?: string }): Promise<boolean> => {
    // Read current user id safely inside functional updater to avoid stale closure
    let currentId: string | null = null;
    setUser(prev => {
      if (!prev) return prev;
      currentId = prev.id;
      const next = { ...prev, ...updates };
      // Keep localStorage in sync right away (don't wait for the useEffect)
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    if (!currentId) return false;
    // Persist to backend
    const ok = await apiUpdateUserProfile(currentId, updates);
    // Re-fetch the authoritative record so every component gets the true saved data
    const fresh = await apiGetUser(currentId);
    if (fresh) {
      setUser(fresh as User);
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(fresh)); } catch { /* noop */ }
    }
    return ok;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
