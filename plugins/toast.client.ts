import { reactive } from 'vue'
import Toast from '~/components/Toast.vue'

export default defineNuxtPlugin(nuxtApp => {
  // Reactive toast state available to the component
  const toastState = reactive({
    visible: false,
    message: '',
    type: 'info' as 'info' | 'error' | 'success' | 'warning',
    timeoutId: null as any
  })

  const toastApi = {
    state: toastState,
    show (msgOrErr: any, type: 'info'|'error'|'success'|'warning' = 'info', duration = 3500) {
      let message = msgOrErr
      if (type === 'error' && typeof msgOrErr === 'object') {
        console.error(msgOrErr)
        message = msgOrErr?.response?.data?.message || msgOrErr?.message || 'Unknown error'
      }
      toastState.message = message
      toastState.type = type
      toastState.visible = true
      if (toastState.timeoutId) clearTimeout(toastState.timeoutId)
      toastState.timeoutId = setTimeout(() => { toastState.visible = false }, duration)
    },
    hide () {
      toastState.visible = false
    }
  }

  nuxtApp.provide('toast', toastApi)


})
