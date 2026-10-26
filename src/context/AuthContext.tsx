import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Address } from '../types/index.ts';
import { api, getStoredToken, removeStoredToken } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: {
    name?: string;
    phone?: string;
    savedAddresses?: Address[];
    dietaryPreferences?: string[];
  }) => Promise<boolean>;
  loginAsDemoCustomer: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { success, error, info } = useToast();

  const loadUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      removeStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setIsAuthModalOpen(false);
      success('Welcome back!', `Signed in as ${res.user.name}`);
      return true;
    } catch (err: any) {
      error('Login failed', err.message || 'Invalid credentials');
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.register(name, email, phone, pass);
      setUser(res.user);
      setIsAuthModalOpen(false);
      success('Account created!', `Welcome to FoodieHub, ${res.user.name}`);
      return true;
    } catch (err: any) {
      error('Registration failed', err.message || 'Could not create account');
      return false;
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    info('Logged out', 'You have been signed out successfully');
  };

  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    savedAddresses?: Address[];
    dietaryPreferences?: string[];
  }): Promise<boolean> => {
    try {
      const res = await api.updateProfile(updates);
      setUser(res.user);
      success('Profile updated', 'Your preferences and details have been saved');
      return true;
    } catch (err: any) {
      error('Update failed', err.message);
      return false;
    }
  };

  const loginAsDemoCustomer = async () => {
    await login('demo@example.com', 'customer123');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@foodiehub.com', 'admin123');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        logout,
        updateProfile,
        loginAsDemoCustomer,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
