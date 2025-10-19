export default defineNuxtRouteMiddleware((to) => {
  // Get locale from cookie instead of useI18n composable
  const localeCookie = useCookie('i18n_locale')
  const currentLocale = localeCookie.value || 'en' // default to 'en'
  const defaultLocale = 'en'
  
  // Skip if we're already on a localized route or it's the default locale
  if (to.path.startsWith(`/${currentLocale}/`) || currentLocale === defaultLocale) {
    return
  }
  
  // If we have a non-default locale and the path doesn't start with it, redirect
  if (currentLocale !== defaultLocale && !to.path.startsWith(`/${currentLocale}`)) {
    const localizedPath = `/${currentLocale}${to.path === '/' ? '' : to.path}`
    return navigateTo(localizedPath)
  }
})