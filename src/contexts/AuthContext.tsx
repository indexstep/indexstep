"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  profilePicture?: string | null;
  backgroundImage?: string | null;
  backgroundPosition?: string | null; // JSON string {"x":50,"y":50}
  age?: number | null;
  gender?: string | null;
  country?: string | null;
}

class BanError extends Error {
  banReason: string;
  constructor(banReason: string) {
    super("Account has been suspended");
    this.banReason = banReason;
    this.name = "BanError";
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, agreedToTerms: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      if (res.status === 403 && error.banReason) {
        throw new BanError(error.banReason);
      }
      throw new Error(error.error || "Login failed");
    }

    await refresh();
  };

  const signup = async (email: string, password: string, name: string, agreedToTerms: boolean) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, agreedToTerms }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Signup failed");
    }

    await refresh();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
