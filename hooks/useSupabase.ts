import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  }
);

export function useSupabase() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[SUPABASE_SESSION_ERROR]', error);
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('[SUPABASE_SIGN_IN_ERROR]', error);
      toast.error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Check your email to confirm your account');
    } catch (error: any) {
      console.error('[SUPABASE_SIGN_UP_ERROR]', error);
      toast.error(error.message || 'Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('[SUPABASE_SIGN_OUT_ERROR]', error);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    supabase,
  };
} 