export default defineNuxtRouteMiddleware((to) => {

  // Get locale from cookie instead of useI18n composable
  const localeCookie = useCookie('i18n_locale')
  const currentLocale = localeCookie.value || 'en' // default to 'en'
  const defaultLocale = 'en'
  
  console.log(`[i18n middleware] Processing path: ${to.path}, locale: ${currentLocale}`)
  
  // Skip if we're already on a localized route or it's the default locale
  if (to.path.startsWith(`/${currentLocale}/`) || currentLocale === defaultLocale) {
    console.log(`[i18n middleware] No redirect needed - already localized or default locale`)
    return
  }
  
  // If we have a non-default locale and the path doesn't start with it, redirect
  if (currentLocale !== defaultLocale && !to.path.startsWith(`/${currentLocale}`)) {
    const localizedPath = `/${currentLocale}${to.path === '/' ? '' : to.path}`
    
    // Preserve query parameters and hash
    const queryAndHash = to.fullPath.substring(to.path.length)
    const finalPath = localizedPath + queryAndHash
    
    console.log(`[i18n middleware] Redirecting from ${to.fullPath} to ${finalPath} (locale: ${currentLocale})`)
    return navigateTo(finalPath)
  }
})