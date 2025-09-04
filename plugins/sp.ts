import type { NuxtApp } from 'nuxt/app'
import { SuperClient } from '../eicrud_exports/super_client';
import { ClientStorage } from '@eicrud/client';
import { Model } from '../eicrud_exports/services/OF-ms/model/model.entity';
import { isPublicPath } from '~/utils/auth-config'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()

  const nuxtCookieStorage: ClientStorage = {
    get(name: string): string {
      const cookie = useCookie<string>(`l-${name}-l`, { secure: true });
      return cookie.value || '';
    },
    set(name: string, value: string, durationSeconds: number, secure: boolean): void {
      const cookie = useCookie<string>(`l-${name}-l`, {
        maxAge: durationSeconds,
        secure: true,
        sameSite: 'strict',
      });
      console.log("Setting cookie:", name, value, cookie);
      cookie.value = value;
    },
    del(name: string): void {
      const cookie = useCookie<string>(`l-${name}-l`, { secure: true });
      cookie.value = null as unknown as string;
    },
  };

  const sp = new SuperClient({
    url: config.public.apiBaseUrl as string,
    onLogout: () => {
      console.log("onLogout called");
      const router = useNuxtApp().$router;
      const currentPath = router.currentRoute.value.path;
      
      // Only redirect to login if we're not on a public path
      if (!isPublicPath(currentPath)) {
        router.push("/login");
      }
    },
    storage: nuxtCookieStorage

  });
  nuxtApp.provide('sp', sp)
  
  // Initialize global state with a reactive ref
  const selectedModel = ref<Model | null>(null)
  nuxtApp.provide('selectedModel', selectedModel)
})

// Type augmentation for NuxtApp

declare module 'nuxt/app' {
  interface NuxtApp {
    $sp: SuperClient,
    $userId: string,
    $selectedModel: Ref<Model | null>
  }
}
