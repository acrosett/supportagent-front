import type { Router } from 'vue-router'
import { SuperClient } from '../eicrud_exports/super_client';
import { ClientStorage } from '@eicrud/client';
import { isPublicPath } from '~/utils/auth-config'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()

  // Safe cookie helpers (avoid Nuxt composables in plugin storage)
  function getCookieRaw(key: string): string {
    if (!import.meta.client) return ''
    const name = `${key}=`
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    for (let c of ca) {
      while (c.charAt(0) === ' ') c = c.substring(1)
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
    }
    return ''
  }
  function setCookieRaw(key: string, value: string, maxAgeSeconds: number, secure: boolean) {
    if (!import.meta.client) return
    const attrs = [
      `path=/`,
      `max-age=${maxAgeSeconds}`,
      `SameSite=Strict`,
      secure ? `Secure` : ''
    ].filter(Boolean).join('; ')
    document.cookie = `${key}=${encodeURIComponent(value)}; ${attrs}`
  }
  function deleteCookieRaw(key: string) {
    if (!import.meta.client) return
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
  }

  // Helper functions for isConnected cookie
  function setIsConnectedCookie(durationSeconds: number) {
    setCookieRaw('isConnected', 'true', durationSeconds, true)
  }
  
  function deleteIsConnectedCookie() {
    deleteCookieRaw('isConnected')
  }

  const nuxtCookieStorage: ClientStorage = {
    get(name: string): string {
      return getCookieRaw(`l-${name}-l`)
    },
    set(name: string, value: string, durationSeconds: number, secure: boolean): void {
      setCookieRaw(`l-${name}-l`, value, durationSeconds, true)
    },
    del(name: string): void {
      deleteCookieRaw(`l-${name}-l`)
    },
  };

  const sp = new SuperClient({
    url: config.public.apiBaseUrl as string,
    onLogout: () => {
      console.log("onLogout called");
      deleteIsConnectedCookie();
      const router = nuxtApp.$router as unknown as Router | undefined;
      if (!router) return;
      const currentPath = router.currentRoute.value.path;

      // Only redirect to login if we're not on a public path
      if (!isPublicPath(currentPath)) {
        router.push("/login");
      }
    },
    // storage: nuxtCookieStorage,
    useSecureCookie: true,
  });
  nuxtApp.provide('sp', sp)
  nuxtApp.provide('setIsConnectedCookie', setIsConnectedCookie)


})
