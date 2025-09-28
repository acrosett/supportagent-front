/**
 * Composable for handling reCAPTCHA v3 integration
 */

// Global reCAPTCHA declaration
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export const useRecaptcha = () => {
  /**
   * Get reCAPTCHA token for the specified action
   * @param v3Action - The action to use for reCAPTCHA v3 (e.g., 'guest_creation', 'login', 'submit')
   * @returns Promise<string | null> - The reCAPTCHA token or null if failed
   */
  const getRecaptchaToken = async (v3Action: string = 'submit'): Promise<string | null> => {
    return new Promise((resolve) => {
      if (typeof window.grecaptcha === 'undefined' || typeof window.grecaptcha.ready !== 'function') {
        console.warn('reCAPTCHA not available')
        resolve(null)
        return
      }
      
      window.grecaptcha.ready(() => {
        // TODO: Replace 'reCAPTCHA_site_key' with actual site key from config
        window.grecaptcha.execute('6Ld0ANcrAAAAAB5t0TU3wifH5jwD29wSzyk3604H', { action: v3Action }).then((token: string) => {
          resolve(token)
        }).catch((error: any) => {
          console.error('reCAPTCHA execution failed:', error)
          resolve(null)
        })
      })
    })
  }

  return {
    getRecaptchaToken
  }
}