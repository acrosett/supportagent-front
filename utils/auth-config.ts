/**
 * Shared authentication configuration
 * Contains paths that don't require authentication
 */

export const PUBLIC_PATHS = ["/test-chat", "/login", "/register", "/reset-password", "/verify-email", "/coming-soon"]

export const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.includes(path)
}
