"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthRouteGuard } from "@/context/AuthRouteGuard";

const GlobalContext = createContext({});

/**
 * Global state provider for user and company data.
 * Handles auth state only; route protection is delegated to AuthRouteGuard.
 * Use useAuth().signOut() for signing out (AuthRouteGuard redirects when user becomes null).
 */
export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidenavCollapsed, setSidenavCollapsed] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    let cancelled = false;

    // onAuthStateChange fires INITIAL_SESSION immediately on subscribe, so we don't need a separate getUser() call.
    // Using session from callback avoids duplicate API calls.
    const subscription = auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user.user_metadata ?? null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    company,
    loading,
    setCompany,
    sidenavCollapsed,
    setSidenavCollapsed,
  };

  return (
    <GlobalContext.Provider value={value}>
      <AuthRouteGuard user={user} loading={loading}>
        {children}
      </AuthRouteGuard>
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => useContext(GlobalContext);
