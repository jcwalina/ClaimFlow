import React from "react";
import { me, logout } from "../api/auth";

type AuthUser = { id: string; role: string; email: string; name: string } | null;

const AuthCtx = React.createContext<{
  user: AuthUser;
  refresh: () => Promise<void>;
  signOut: () => void;
}>({ user: null, refresh: async () => {}, signOut: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser>(null);

  const refresh = React.useCallback(async () => {
    try {
      const res = await me();
      setUser(res.user);
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => { void refresh(); }, [refresh]);

  const signOut = React.useCallback(() => {
    logout();
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, refresh, signOut }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return React.useContext(AuthCtx);
}
