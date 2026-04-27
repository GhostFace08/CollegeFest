import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, setToken, clearToken } from './api';

export type UserRole = 'superadmin' | 'admin' | 'student';

export interface AuthUser {
  id: string; name: string; email: string; role: UserRole;
  committee?: string; committees?: { _id: string; name: string }[];
  phone?: string; college?: string; year?: string; isApproved?: boolean;
}

interface AuthCtx {
  user: AuthUser | null; loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (u: Partial<AuthUser>) => void;
}

const KEY = 'collegefest_user';
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setUser(JSON.parse(s));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      const { token, user: u } = data.data;

      // Normalize user object
      const authUser: AuthUser = {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isApproved: u.isApproved,
        phone: u.phone,
        college: u.college,
        year: u.year,
        committees: u.committees,
        committee: u.committees?.[0]?.name || '',
      };

      // Check admin approval
      if (u.role === 'admin' && !u.isApproved) {
        return { success: false, error: 'Your admin account is pending approval by the superadmin.' };
      }

      setToken(token);
      setUser(authUser);
      localStorage.setItem(KEY, JSON.stringify(authUser));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearToken();
    localStorage.removeItem(KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const u = { ...prev, ...updates };
      localStorage.setItem(KEY, JSON.stringify(u));
      return u;
    });
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
