import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../lib/api.js";

const STORAGE_KEY = "findease-token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(STORAGE_KEY));

  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem(STORAGE_KEY, newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, setToken]);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data;
    },
    [setToken]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const data = await authApi.signup(name, email, password);
      setToken(data.token);
      setUser(data.user);
      return data;
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      isAdmin: user?.role === "admin",
    }),
    [user, token, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
