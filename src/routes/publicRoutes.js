/**
 * Public routes that don't require authentication.
 * All other routes require a valid session and redirect to sign-in when missing.
 */
export const PUBLIC_ROUTES = [
  "/auth/sign-in",
  "/auth/register",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/update-password",
];

/**
 * Check if the current pathname is a public (unauthenticated) route.
 * Safe for SSR/hydration: returns false when pathname is missing.
 */
export const isPublicRoute = (pathname) => {
  if (pathname == null || typeof pathname !== "string" || pathname === "") {
    return false;
  }
  const normalized = pathname.trim();
  return PUBLIC_ROUTES.some((route) => normalized.startsWith(route));
};

/**
 * Whether the route is under /app (protected app shell).
 */
export const isAppRoute = (pathname) => {
  if (pathname == null || typeof pathname !== "string") return false;
  return pathname.trim().startsWith("/app");
};
