import React, { useEffect, useState, useTransition } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseNotConfiguredError } from '../lib/supabase';
import { AuthContext, type ProfileRow } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [, startTransition] = useTransition();

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Errore nel caricamento del profilo utente:', err);
    }
  };

  useEffect(() => {
    if (!supabase) return;

    // 1. Controlla la sessione attiva
    supabase.auth.getSession().then(({ data: { session } }) => {
      startTransition(() => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        }
        setIsLoading(false);
      });
    });

    // 2. Ascolta cambi di stato auth (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      startTransition(() => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: supabaseNotConfiguredError };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await loadProfile(data.user.id);
        closeAuthModal();
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: supabaseNotConfiguredError };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Il link di conferma riporta al sito da cui ti sei registrata (Vercel o localhost)
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        return { error };
      }

      // Se la conferma email è attiva su Supabase, l'utente potrebbe non avere una sessione immediata
      const needsEmailConfirmation = !data.session;
      if (data.user && !needsEmailConfirmation) {
        await loadProfile(data.user.id);
        closeAuthModal();
      }

      return { error: null, needsEmailConfirmation };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase?.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Errore durante il logout:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
