import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase, syncUserProfile } from '../services/supabaseClient';
import { Profile } from '../types';

export enum AuthNode {
  USER = 'USER_NODE',
  GUEST = 'ANONYMOUS_NODE'
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  nodeType: AuthNode;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodeType, setNodeType] = useState<AuthNode>(AuthNode.GUEST);

  const fetchProfile = async (userId: string, currentUser?: User) => {
    try {
      // MASTER ARCHITECT: Identity Sync Check
      const activeProfile = await syncUserProfile(currentUser || { id: userId });
      
      if (activeProfile) {
        // ADMIN_FORCE: Hard-coded check for Superuser authority
        if (currentUser?.email === 'wambuamaxwell696@gmail.com') {
          activeProfile.is_admin = true;
          console.log("SUPERUSER AUTHENTICATED: B3ST_SEKTA_ADMIN_LEVEL_0");
        }
        setProfile(activeProfile);
        setNodeType(AuthNode.USER);
        if (activeProfile.accent_color) {
          document.documentElement.style.setProperty('--primary', activeProfile.accent_color);
        }
      } else {
        setProfile(null);
        setNodeType(AuthNode.GUEST);
      }
    } catch (err) {
      console.error('Core Profile Engine Error:', err);
      setNodeType(AuthNode.GUEST);
    }
  };

  useEffect(() => {
    // Apply local accent if guest
    const localAccent = localStorage.getItem('sekta_accent');
    if (localAccent) {
      document.documentElement.style.setProperty('--primary', localAccent);
    }

    const client = getSupabase();
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      (window as any)._currentUserEmail = session?.user?.email;
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setNodeType(AuthNode.GUEST);
      }
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      (window as any)._currentUserEmail = session?.user?.email;
      
      // TOKEN_NULL detection while session purportedly exists
      if (event === 'TOKEN_REFRESHED' && !session) {
         console.warn("KERNEL_ALERT: Token nullification detected. Synchronizing state...");
         window.location.reload();
      }

      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
        setNodeType(AuthNode.GUEST);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut();
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, nodeType, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
