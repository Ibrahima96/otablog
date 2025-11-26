import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, skip initialization to avoid network errors
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Cast to any to handle potential library version mismatches (v1 vs v2)
    const auth = (supabase as any).auth;

    const initSession = async () => {
      try {
        // Try v1 session() first (sync), fallback to getSession() (async v2) if needed
        let currentSession = null;
        if (typeof auth.session === 'function') {
           currentSession = auth.session();
        } else if (typeof auth.getSession === 'function') {
           const { data } = await auth.getSession();
           currentSession = data.session;
        }
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Setup listener
    const { data: authListener } = auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
        // Handle both v1 (listener object) and v2 (subscription object)
        if (authListener && typeof authListener.unsubscribe === 'function') {
            authListener.unsubscribe();
        } else if (authListener?.subscription && typeof authListener.subscription.unsubscribe === 'function') {
             authListener.subscription.unsubscribe();
        }
    };
  }, []);

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      await (supabase.auth as any).signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};