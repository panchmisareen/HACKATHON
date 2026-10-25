import api from './api';
import type { TokenResponse, User } from '../types';

export interface SavedAccount {
  user_id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_color: string;
  total_points?: number;
  token: string;
  last_active: string;
}

const SAVED_ACCOUNTS_KEY = 'ecopulse_saved_accounts';

export const authService = {
  async demoLogin(): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/demo-login');
    this.saveAccount(data.user, data.access_token);
    return data;
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
    this.saveAccount(data.user, data.access_token);
    return data;
  },

  async register(email: string, password: string, username: string, full_name: string): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/register', { email, password, username, full_name });
    this.saveAccount(data.user, data.access_token);
    return data;
  },

  async switchAccount(userId: number): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/switch-account', { user_id: userId });
    this.setToken(data.access_token);
    this.setUser(data.user);
    this.saveAccount(data.user, data.access_token);
    return data;
  },

  async getDemoAccounts(): Promise<any[]> {
    try {
      const { data } = await api.get('/auth/demo-accounts');
      return data || [];
    } catch {
      return [];
    }
  },

  setToken(token: string) {
    localStorage.setItem('eco_token', token);
  },

  setUser(user: User) {
    localStorage.setItem('eco_user', JSON.stringify(user));
  },

  getToken(): string | null {
    return localStorage.getItem('eco_token');
  },

  getUser(): User | null {
    const raw = localStorage.getItem('eco_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Saved accounts management on shared device
  getSavedAccounts(): SavedAccount[] {
    try {
      const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveAccount(user: User, token: string) {
    try {
      const accounts = this.getSavedAccounts();
      const existingIdx = accounts.findIndex((a) => a.user_id === user.id);
      const newEntry: SavedAccount = {
        user_id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_color: user.avatar_color || '#15803D',
        total_points: user.total_points,
        token: token,
        last_active: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        accounts[existingIdx] = newEntry;
      } else {
        accounts.unshift(newEntry);
      }
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to store saved account', e);
    }
  },

  removeSavedAccount(userId: number) {
    try {
      const accounts = this.getSavedAccounts().filter((a) => a.user_id !== userId);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to remove saved account', e);
    }
  },

  logout() {
    localStorage.removeItem('eco_token');
    localStorage.removeItem('eco_user');
  },

  logoutAll() {
    localStorage.removeItem('eco_token');
    localStorage.removeItem('eco_user');
    localStorage.removeItem(SAVED_ACCOUNTS_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('eco_token');
  },
};
