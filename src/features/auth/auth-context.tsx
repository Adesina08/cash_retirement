import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import create from 'zustand';
import { Role, User } from '@lib/types';
import { useDataClient } from '@lib/data';

interface AuthState {
  user?: User;
  setUser: (user: User) => void;
  clear: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  clear: () => set({ user: undefined })
}));

interface AuthContextValue {
  user?: User;
  loading: boolean;
  signInAs: (role: Role) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dataClient = useDataClient();
  const [loading, setLoading] = useState(true);
  const { user, setUser, clear } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      try {
        const current = await dataClient.currentUser();
        setUser(current);
      } catch (error) {
        console.warn('No authenticated session found', error);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [dataClient, setUser]);

  const value: AuthContextValue = {
    user,
    loading,
    signInAs: async (role) => {
      const candidates = await dataClient.listUsers(role);
      const userForRole = candidates[0];
      if (!userForRole) throw new Error(`No user found for role ${role}`);
      setUser(userForRole);
    },
    signOut: () => {
      clear();
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireRole(roles: Role[]): User | undefined {
  const { user } = useAuth();
  if (user && !roles.includes(user.role)) {
    throw new Error('Access denied');
  }
  return user;
}
