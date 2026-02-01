"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isPublicRoute } from "@/routes/publicRoutes";

const GlobalContext = createContext({});

/**
 * Global state provider for user and company data
 * Handles authentication state and routing protection
 */
export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidenavCollapsed, setSidenavCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  // Initialize session and subscribe to auth state changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await auth.getSession();
        const userMetadata = session?.user?.user_metadata ?? null;
        setUser(userMetadata);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const subscription = auth.onAuthStateChange(async (_event, session) => {
      const userMetadata = session?.user?.user_metadata ?? null;
      setUser(userMetadata);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle route protection - redirect to sign-in if not authenticated and not on public route
  useEffect(() => {
    if (!loading) {
      const publicRoute = isPublicRoute(pathname);
      if (!user && !publicRoute) {
        router.push("/auth/sign-in");
      }
    }
  }, [user, loading, pathname, router]);

  // Wrapper for signOut that includes navigation
  const signOut = async () => {
    await auth.signOut();
    router.push("/auth/sign-in");
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        company,
        loading,
        signOut,
        setCompany,
        sidenavCollapsed,
        setSidenavCollapsed,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => useContext(GlobalContext);
