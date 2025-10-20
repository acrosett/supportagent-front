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

/**
 * Check if a path matches a pattern, accounting for optional locale prefixes
 * @param path The actual path to check
 * @param pattern The pattern to match against (without locale prefix)
 * @returns true if the path matches the pattern (with or without locale prefix)
 */
export const isPathMatch = (path: string, pattern: string): boolean => {
  // Direct match
  if (path === pattern) {
    return true;
  }
  
  // Check with locale prefix: /[locale]/pattern
  const localePathRegex = new RegExp(`^/[a-z]{2}${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
  if (localePathRegex.test(path)) {
    return true;
  }
  
  // For patterns ending with '/', check if path starts with pattern (with or without locale)
  if (pattern.endsWith('/')) {
    if (path.startsWith(pattern)) {
      return true;
    }
    // Check with locale prefix
    const localeStartRegex = new RegExp(`^/[a-z]{2}${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
    return localeStartRegex.test(path);
  }
  
  // Check for path prefixes with query params or sub-paths
  if (path.startsWith(pattern + '/') || path.startsWith(pattern + '?')) {
    return true;
  }
  
  // Check with locale prefix for sub-paths and query params
  const localeSubPathRegex = new RegExp(`^/[a-z]{2}${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[/?]`)
  return localeSubPathRegex.test(path);
}

export const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some(publicPath => isPathMatch(path, publicPath));
}
