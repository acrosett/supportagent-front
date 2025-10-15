/**
 * Shared authentication configuration
 * Contains paths that don't require authentication
 */

export const PUBLIC_PATHS = [
  "/test-chat", 
  "/login", 
  "/register", 
  "/reset-password", 
  "/verify-email", 
  "/coming-soon",
  "/landing",
  "/embed.js"
]

export const isPublicPath = (path: string): boolean => {
  // Exact match first
  if (PUBLIC_PATHS.includes(path)) {
    return true;
  }
  
  // Check for path prefixes (for dynamic routes and query params)
  return PUBLIC_PATHS.some(publicPath => {
    if (publicPath.endsWith('/')) {
      return path.startsWith(publicPath);
    }
    return path === publicPath || path.startsWith(publicPath + '/') || path.startsWith(publicPath + '?');
  });
}
