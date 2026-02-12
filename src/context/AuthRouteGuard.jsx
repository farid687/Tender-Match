"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isPublicRoute } from "@/routes/publicRoutes";
import { Loading } from "@/elements/loading";

const SIGN_IN_PATH = "/auth/sign-in";
const APP_PROFILE_PATH = "/app/profile";

/**
 * Handles route protection: shows loading/redirecting UI and redirects
 * unauthenticated users to sign-in. Renders children only when allowed.
 * Root "/" always redirects: logged in → /app/profile, not logged in → /auth/sign-in.
 */
export function AuthRouteGuard({ user, loading, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const redirectingRef = useRef(false);

  const isRoot = pathname === "/" || pathname === "";
  const isPublic = isPublicRoute(pathname);
  const shouldRedirectToSignIn =
    !loading &&
    user === null &&
    !isPublic &&
    pathname != null &&
    pathname !== "";
  const shouldRedirectFromRoot = !loading && isRoot;

  useEffect(() => {
    if (!shouldRedirectFromRoot && !shouldRedirectToSignIn) return;
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    const target = shouldRedirectFromRoot
      ? user != null
        ? APP_PROFILE_PATH
        : SIGN_IN_PATH
      : SIGN_IN_PATH;
    router.replace(target);
  }, [shouldRedirectFromRoot, shouldRedirectToSignIn, user, router]);

  useEffect(() => {
    if (isPublic || user != null) {
      redirectingRef.current = false;
    }
  }, [isPublic, user]);

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  if (shouldRedirectToSignIn || shouldRedirectFromRoot) {
    return <Loading fullScreen message="Redirecting..." />;
  }

  return children;
}
