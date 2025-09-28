/**
 * Validate redirect URL to prevent open redirect attacks
 * @param url - The URL to validate
 * @returns true if the URL is safe for internal redirection
 */
export function isValidRedirect(url: string): boolean {
  try {
    // Only allow relative paths that start with /
    if (!url.startsWith('/')) {
      return false
    }
    
    // Prevent protocol-relative URLs (//example.com)
    if (url.startsWith('//')) {
      return false
    }
    
    // Prevent javascript: or data: URLs
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}