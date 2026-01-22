/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  "/auth/sign-in",
  "/auth/register",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/update-password"
];

/**
 * Check if a route is a public route
 */
export const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};
