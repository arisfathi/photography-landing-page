import { supabase } from "@/lib/supabaseClient";

/**
 * Get the current session of the authenticated user
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error.message);
    return null;
  }

  return session;
}

/**
 * Sign in user with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, session: data.session };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Check if current user is admin using Supabase RPC function public.is_admin(uid)
 */
export async function isAdmin(userId: string) {
  const { data, error } = await supabase.rpc("is_admin", { uid: userId });

  if (error) {
    return { success: false, error: error.message, isAdmin: false };
  }

  return { success: true, isAdmin: Boolean(data) };
}
