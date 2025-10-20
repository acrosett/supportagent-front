import { onBeforeMount, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Load a per-component/local-scope namespace from ~/locales/{locale}/{ns}.json
 * Example: useLocalNamespace('checkout')
 */
export function useLocalNamespace(ns: string) {
  // Local composer; inherits current global locale
  const i18n = useI18n({
    useScope: 'local',
    inheritLocale: true,      // follow global locale
    messages: {
      en: {},
      fr: {}
    }
  })

  const loading = ref(true)

  async function load(loc = i18n.locale.value) {
    loading.value = true
    try {
      // Vite handles JSON imports both on server (SSR) and client
      const mod = await import(`~/i18n/locales/${loc}/${ns}.json`)
      // Set/replace this component's local messages for the active locale
      console.log(`Loaded local namespace for locale '${loc}' and namespace '${ns}'`)
      i18n.setLocaleMessage(loc, mod.default ?? mod)
    } catch (e) {
      console.error(`Could not load local namespace for locale '${loc}' and namespace '${ns}':`, e)
      // Optional: fall back to empty to avoid runtime errors
      i18n.setLocaleMessage(loc, {})
    } finally {
      loading.value = false
    }
  }

  onBeforeMount(() => load())
  watch(i18n.locale, (loc) => load(loc))

  // expose the local t() and loading state
  return { t: i18n.t, loading }
}