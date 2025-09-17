import { reactive } from 'vue'

export default defineNuxtPlugin(nuxtApp => {
  // Reactive confirm popup state available to the component
  const confirmPopupState = reactive({
    visible: false,
    message: '',
    resolvePromise: null as ((value: boolean) => void) | null
  })

  const confirmPopupApi = {
    state: confirmPopupState,
    show(message: string): Promise<boolean> {
      return new Promise((resolve) => {
        confirmPopupState.message = message
        confirmPopupState.visible = true
        confirmPopupState.resolvePromise = resolve
      })
    },
    confirm() {
      if (confirmPopupState.resolvePromise) {
        confirmPopupState.resolvePromise(true)
      }
      confirmPopupState.visible = false
      confirmPopupState.resolvePromise = null
    },
    reject() {
      if (confirmPopupState.resolvePromise) {
        confirmPopupState.resolvePromise(false)
      }
      confirmPopupState.visible = false
      confirmPopupState.resolvePromise = null
    }
  }

  nuxtApp.provide('confirmPopup', confirmPopupApi)

})