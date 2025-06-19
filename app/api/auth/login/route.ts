import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log("[API][Login] Received login request");
  const body = await request.json();
  const { email, password } = body;
  console.log("[API][Login] Attempting login for email:", email);
  
  const cookieStore = cookies();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      }
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.warn(
      "[API][Login] Login failed for",
      email,
      "Error:",
      error.message,
    );
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  console.log("[API][Login] Login successful for", email);
  
  const response = NextResponse.json({ success: true });
  
  // Set auth cookies
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    response.cookies.set('sb-access-token', session.access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set('sb-refresh-token', session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}
