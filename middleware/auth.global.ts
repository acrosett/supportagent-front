import { SuperClient } from "~/eicrud_exports/super_client"
import { PUBLIC_PATHS, isPublicPath, isPathMatch } from "../utils/auth-config"
import { isValidRedirect } from "../utils/redirect-validation"
import { NuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {

  const nuxtApp = useNuxtApp()
  
  // Run redirect logic only on client side
  if (import.meta.server) {
    return
  }

  // Allow access to public paths without authentication first (before any API calls)
  if (isPublicPath(to.path)) {
    return
  }

  const jwt = nuxtApp.$sp.user.config.storage?.get(nuxtApp.$sp.user.JWT_STORAGE_KEY);

  const loggedIn = jwt && await checkLogin(nuxtApp).catch((e) => {
    console.warn('Login check failed:', e);
    return false;
  });
  
  // Redirect logged-in users away from login page
  if (isPathMatch(to.path, '/login') && loggedIn) {
    const redirectTo = to.query.redirectTo as string
    if (redirectTo && isValidRedirect(redirectTo)) {
      return navigateTo(redirectTo)
    }
    return navigateTo("/")
  }
  
  // Require login for all other pages
  if (!loggedIn) {
    // Use relative path only (path + query + hash) to prevent open redirect attacks
    const queryString = Object.keys(to.query).length > 0 ? '?' + new URLSearchParams(to.query as Record<string, string>).toString() : ''
    const relativePath = to.path + queryString + (to.hash || '')
    return navigateTo(`/login?redirectTo=${encodeURIComponent(relativePath)}`)
  }
})

async function checkLogin(nuxtApp: NuxtApp) {
  // TODO: Call API to check login status
  // Return true if logged in, false otherwise


  const res = await nuxtApp.$sp.user.check_jwt_extended({});
  const userId = res.base.userId as string;
  const productId = res.productId as string;
  const userRole = res.userRole as string;
  const email = res.email as string;
  nuxtApp.$userId = userId;
  nuxtApp.$userProductId = productId;
  nuxtApp.$userRole = userRole;
  nuxtApp.$userEmail = email;
  return res;
}
