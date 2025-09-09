import { SuperClient } from "~/eicrud_exports/super_client"
import { PUBLIC_PATHS, isPublicPath } from "../utils/auth-config"
import { NuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {

  const nuxtApp = useNuxtApp()
  const jwt = nuxtApp.$sp.user.config.storage?.get(nuxtApp.$sp.user.JWT_STORAGE_KEY);

  const loggedIn = jwt && await checkLogin(nuxtApp).catch((e) => {
    return false;
  });

    // Run redirect logic only on client side
  if (import.meta.server) {
    return
  }
  
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

async function checkLogin(nuxtApp: NuxtApp) {
  // TODO: Call API to check login status
  // Return true if logged in, false otherwise


  const res = await nuxtApp.$sp.user.check_jwt_extended({});
  const userId = res.base.userId as string;
  const productId = res.productId as string;
  nuxtApp.$userId = userId;
  nuxtApp.$userProductId = productId;
  return res;
}
