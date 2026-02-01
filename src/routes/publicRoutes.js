/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  "/",
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
  // Special case for home route - exact match
  if (pathname === "/") {
    return true;
  }
  // For other routes, check if pathname starts with any public route
  return PUBLIC_ROUTES.some(route => route !== "/" && pathname.startsWith(route));
};
