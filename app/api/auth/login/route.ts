import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function POST(request: NextRequest) {
  console.log('[API][Login] Received login request');
  const body = await request.json();
  const { email, password } = body;
  console.log('[API][Login] Attempting login for email:', email);
  const response = NextResponse.next();
  const supabase = createClient(request, response);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.warn('[API][Login] Login failed for', email, 'Error:', error.message);
  } else {
    console.log('[API][Login] Login successful for', email);
  }

  // Create the JSON response
  const jsonResponse = error
    ? NextResponse.json({ error: error.message }, { status: 401 })
    : NextResponse.json({ success: true });

  // Copy cookies from the original response to the JSON response
  response.cookies.getAll().forEach((cookie) => {
    jsonResponse.cookies.set(cookie);
  });

  return jsonResponse;
}
