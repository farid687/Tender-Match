import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for Supabase authentication API calls
 * Contains all authentication-related API functions
 */
export const useAuth = () => {
  const company_id = uuidv4();

  /**
   * Sign in with email and password
   */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  /**
   * Sign up with email, password, and metadata
   */
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app/onboarding`,
        data: {
          first_name: metadata.first_name,
          last_name: metadata.last_name,
          company_name: metadata.company_name,
          country: metadata.country,
          company_id
        }
      }
    });
    if (error) throw error;
    return data;
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  /**
   * Reset password by sending email
   */
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
    return data;
  };

  /**
   * Update user password
   */
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) throw error;
    return data;
  };

  /**
   * Get current session
   */
  const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  };

  /**
   * Subscribe to auth state changes
   */
  const onAuthStateChange = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    getSession,
    onAuthStateChange,
  };
};
