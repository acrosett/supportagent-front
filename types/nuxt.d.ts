import type { SuperClient } from '~/eicrud_exports/super_client'

declare module 'nuxt/app' {
  interface NuxtApp {
    $sp: SuperClient
    $userId: string
    $userEmail: string
    $userProductId: string
    $userRole: string
    $setIsConnectedCookie: (durationSeconds: number) => void
    $toast: {
      state: { 
        visible: boolean
        message: string
        type: 'info' | 'error' | 'success' | 'warning'
      }
      show: (msgOrErr: any, type?: 'info' | 'error' | 'success' | 'warning', duration?: number) => void
      hide: () => void
    }
    $confirmPopup: {
      state: { 
        visible: boolean
        message: string
        singleButton: boolean
        resolvePromise: ((value: boolean) => void) | null
      }
      show: (message: string) => Promise<boolean>
      showInfo: (message: string) => Promise<boolean>
      confirm: () => void
      reject: () => void
    }
  }
}

export {}