import { SuperClient } from "~/eicrud_exports/super_client"
import { PUBLIC_PATHS, isPublicPath } from "../utils/auth-config"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp()
  const jwt = nuxtApp.$sp.user.config.storage.get(nuxtApp.$sp.user.JWT_STORAGE_KEY);

  const loggedIn = jwt && await checkLogin(nuxtApp).catch((e) => {
    return false;
  });
  
  // Redirect logged-in users away from login page only
  if (to.path === "/login" && loggedIn) {
    return navigateTo("/")
  }
  // Allow access to public paths without authentication
  if (isPublicPath(to.path)) {
    return
  }
  // Require login for all other pages
  if (!loggedIn && !["/login", "/register"].includes(to.path)) {
    return navigateTo("/login")
  }
})

async function checkLogin(nuxtApp) {
  // TODO: Call API to check login status
  // Return true if logged in, false otherwise


  const res = await nuxtApp.$sp.user.checkJwt();
  nuxtApp.$userId = res;
  return res;
}
