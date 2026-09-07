import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { api, setToken } from '../services/api';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
type AuthResponse = { token: string; user: User };
export const useAuthStore = create<AuthState>()(persist((set) => ({
  currentUser: null, isAuthenticated: false,
  login: async (email, password) => { try { const result = await api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setToken(result.token); set({ currentUser: result.user, isAuthenticated: true }); return true; } catch { return false; } },
  register: async (firstName,lastName,email,password) => { try { const result=await api<AuthResponse>('/auth/register',{method:'POST',body:JSON.stringify({firstName,lastName,email,password})});setToken(result.token);set({currentUser:result.user,isAuthenticated:true});return true;}catch{return false;} },
  logout: () => { setToken(null); set({ currentUser: null, isAuthenticated: false }); },
}), { name: 'teampulse-auth-storage' }));
