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

    const initializeAuth = async () => {
      try {
        const userFromAuth = await auth.getUser();
        if (!cancelled) {
          setUser(userFromAuth?.user_metadata ?? null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initializeAuth();

    const subscription = auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const userFromAuth = await auth.getUser();
          if (!cancelled) {
            setUser(userFromAuth?.user_metadata ?? null);
          }
        } catch {
          if (!cancelled) setUser(null);
        }
      } else {
        if (!cancelled) setUser(null);
      }
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
