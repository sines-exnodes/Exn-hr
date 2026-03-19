"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
import type { User, LoginRequest, LoginResponse } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userJson = localStorage.getItem("auth_user");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        setState({ user, token, isLoading: false, isAuthenticated: true });
      } catch {
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    const { token, user } = response.data;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    setState({ user, token, isLoading: false, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
