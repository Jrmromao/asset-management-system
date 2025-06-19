import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface AuthUserMetadata {
  firstName: string;
  lastName: string;
  companyId: string;
  role: string;
}

interface CreateAuthUserParams {
  email: string;
  password: string;
  metadata: AuthUserMetadata;
}

interface AuthResponse<T> {
  data: T | null;
  error: Error | null;
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;

  private constructor() {}

  public static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  async createUser({ email, password, metadata }: CreateAuthUserParams): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      return {
        data: data.user,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  async resendVerificationEmail(email: string): Promise<AuthResponse<void>> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        throw error;
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return {
        data: data.user,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }
}

export const authService = SupabaseAuthService.getInstance(); 