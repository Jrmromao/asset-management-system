import { createClient } from "@/utils/supabase/client";
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

class SupabaseAuthService {
  private supabase = createClient();

  async createUser({
    email,
    password,
    metadata,
  }: CreateAuthUserParams): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
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
      const { error } = await this.supabase.auth.resend({
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
      const { data, error } = await this.supabase.auth.signInWithPassword({
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

export const authService = new SupabaseAuthService(); 