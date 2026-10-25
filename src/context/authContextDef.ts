import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
