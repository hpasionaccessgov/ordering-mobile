import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as authService from '../services/authService';
import { getToken, removeToken, setToken } from '../services/tokenStorage';
import type { AuthTokens, RegisterPayload, UserProfile } from '../services/types';

interface AuthContextValue {
  user: UserProfile | null;
  ready: boolean;
  signIn: (username: string, password: string) => Promise<AuthTokens>;
  signUp: (payload: RegisterPayload) => Promise<AuthTokens>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const token = await getToken();
        if (token) {
          setUser(await authService.profile());
        }
      } catch {
        await removeToken();
      } finally {
        if (active) {
          setReady(true);
        }
      }
    })();

    const onUnauthorized = () => setUser(null);
    window.addEventListener('cafebara:unauthorized', onUnauthorized);
    return () => {
      active = false;
      window.removeEventListener('cafebara:unauthorized', onUnauthorized);
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const tokens = await authService.login(username, password);
    await setToken(tokens.token);
    setUser(await authService.profile());
    return tokens;
  }, []);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const tokens = await authService.register(payload);
    await setToken(tokens.token);
    setUser(await authService.profile());
    return tokens;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      await removeToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signUp, signOut }), [user, ready, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
