"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isPublicRoute } from "@/routes/publicRoutes";
import { Loading } from "@/elements/loading";

const SIGN_IN_PATH = "/auth/sign-in";

/**
 * Handles route protection: shows loading/redirecting UI and redirects
 * unauthenticated users to sign-in. Renders children only when allowed.
 * Receives user and loading from GlobalProvider to avoid circular deps.
 */
export function AuthRouteGuard({ user, loading, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const redirectingRef = useRef(false);

  const isPublic = isPublicRoute(pathname);
  const shouldRedirect =
    !loading &&
    user === null &&
    !isPublic &&
    pathname != null &&
    pathname !== "";

  useEffect(() => {
    if (!shouldRedirect || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(SIGN_IN_PATH);
  }, [shouldRedirect, router]);

  useEffect(() => {
    if (isPublic || user != null) {
      redirectingRef.current = false;
    }
  }, [isPublic, user]);

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  if (shouldRedirect) {
    return <Loading fullScreen message="Redirecting to sign in..." />;
  }

  return children;
}
