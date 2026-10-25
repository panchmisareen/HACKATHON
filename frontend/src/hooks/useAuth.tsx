import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '../types';
import { authService, type SavedAccount } from '../services/auth.service';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  savedAccounts: SavedAccount[];
  login: (token: string, user: User) => void;
  logout: () => void;
  logoutAll: () => void;
  switchAccount: (userId: number) => Promise<boolean>;
  removeAccount: (userId: number) => void;
  updateUser: (user: User) => void;
  updatePoints: (newPoints: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(authService.getSavedAccounts());

  // Keep savedAccounts fresh
  const refreshSavedAccounts = useCallback(() => {
    setSavedAccounts(authService.getSavedAccounts());
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    authService.setToken(newToken);
    authService.setUser(newUser);
    authService.saveAccount(newUser, newToken);
    setToken(newToken);
    setUser(newUser);
    setSavedAccounts(authService.getSavedAccounts());
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setSavedAccounts(authService.getSavedAccounts());
  }, []);

  const logoutAll = useCallback(() => {
    authService.logoutAll();
    setToken(null);
    setUser(null);
    setSavedAccounts([]);
  }, []);

  const switchAccount = useCallback(async (userId: number): Promise<boolean> => {
    try {
      // Check if we have a saved token for this user
      const existing = savedAccounts.find((a) => a.user_id === userId);
      if (existing && existing.token) {
        // Switch locally first
        authService.setToken(existing.token);
        setToken(existing.token);
        // Fetch verified profile from server
        try {
          const { data } = await api.get('/profile');
          if (data) {
            authService.setUser(data);
            setUser(data);
            authService.saveAccount(data, existing.token);
            setSavedAccounts(authService.getSavedAccounts());
            return true;
          }
        } catch {
          // If token expired, fall back to API switch-account
        }
      }

      // API switch account
      const res = await authService.switchAccount(userId);
      if (res?.access_token && res?.user) {
        setToken(res.access_token);
        setUser(res.user);
        setSavedAccounts(authService.getSavedAccounts());
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to switch account:', err);
      return false;
    }
  }, [savedAccounts]);

  const removeAccount = useCallback((userId: number) => {
    authService.removeSavedAccount(userId);
    setSavedAccounts(authService.getSavedAccounts());
    // If the removed account is the current active one, log out
    if (user?.id === userId) {
      logout();
    }
  }, [user, logout]);

  const updateUser = useCallback((updatedUser: User) => {
    authService.setUser(updatedUser);
    setUser(updatedUser);
    if (token) {
      authService.saveAccount(updatedUser, token);
      setSavedAccounts(authService.getSavedAccounts());
    }
  }, [token]);

  const updatePoints = useCallback((newPoints: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, total_points: newPoints };
      authService.setUser(updated);
      if (token) {
        authService.saveAccount(updated, token);
        setSavedAccounts(authService.getSavedAccounts());
      }
      return updated;
    });
  }, [token]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/profile');
      if (data) {
        authService.setUser(data);
        setUser(data);
        if (token) {
          authService.saveAccount(data, token);
          setSavedAccounts(authService.getSavedAccounts());
        }
      }
    } catch {}
  }, [token]);

  // Ensure current user is saved on initial mount
  useEffect(() => {
    if (user && token) {
      authService.saveAccount(user, token);
      refreshSavedAccounts();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      savedAccounts,
      login,
      logout,
      logoutAll,
      switchAccount,
      removeAccount,
      updateUser,
      updatePoints,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
