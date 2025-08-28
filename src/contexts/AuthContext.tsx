import type { User } from '@supabase/supabase-js';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '@/config/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  showUserProfile: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openUserProfile: () => void;
  closeUserProfile: () => void;
  signInWithPassword: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  resetPassword: (email: string) => Promise<{ data?: any; error?: any }>;
  updateProfile: (updates: any) => Promise<{ data?: any; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showUserProfile, setShowUserProfile] = useState<boolean>(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Manejar verificación automática por email
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Usuario autenticado exitosamente');
        // Cerrar modal de auth si está abierto
        setShowAuthModal(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };


  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  // Modal functions
  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const openUserProfile = () => setShowUserProfile(true);
  const closeUserProfile = () => setShowUserProfile(false);

  const value = {
    user,
    loading,
    showAuthModal,
    showUserProfile,
    openAuthModal,
    closeAuthModal,
    openUserProfile,
    closeUserProfile,
    signInWithPassword,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
