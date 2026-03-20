import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  role: string;
  balance: string;
  lifetimeEarnings: string;
  lifetimeSpending: string;
  reputationScore: number;
  referralCode: string;
  referredBy: string | null;
  status: string;
  kycStatus: string;
  twoFactorEnabled: boolean;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  createdAt: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  refreshProfile: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/user/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem("currentUser", JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem("currentUser");
      }
    } catch {
      // Try localStorage fallback
      const cached = localStorage.getItem("currentUser");
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch { setUser(null); }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const logout = useCallback(() => {
    fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setUser(null);
    localStorage.removeItem("currentUser");
    setLocation("/");
  }, [setLocation]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      refreshProfile: fetchProfile,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
