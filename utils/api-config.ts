/**
 * Utility function to get the API base URL
 * This can be used both client-side and server-side
 */
export const getApiBaseUrl = (): string => {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl as string
}

/**
 * Utility function to construct full media URLs
 * @param mediaPath - The media path from the API (e.g., "/media/123" or just "123")
 * @returns Full URL to the media
 */
export const getMediaUrl = (mediaPath: string): string => {
  if (!mediaPath) return ''
  
  // If it's already a full URL, return as is
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath
  }
  
  const baseUrl = getApiBaseUrl()
  
  // Ensure the path starts with /
  const path = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`
  
  return `${baseUrl}${path}`
}
