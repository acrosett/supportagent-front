import { reactive } from 'vue'

export default defineNuxtPlugin(nuxtApp => {
  // Reactive confirm popup state available to the component
  const confirmPopupState = reactive({
    visible: false,
    message: '',
    singleButton: false,
    resolvePromise: null as ((value: boolean) => void) | null
  })

  const confirmPopupApi = {
    state: confirmPopupState,
    show(message: string): Promise<boolean> {
      return new Promise((resolve) => {
        confirmPopupState.message = message
        confirmPopupState.visible = true
        confirmPopupState.singleButton = false
        confirmPopupState.resolvePromise = resolve
      })
    },
    showInfo(message: string): Promise<boolean> {
      return new Promise((resolve) => {
        confirmPopupState.message = message
        confirmPopupState.visible = true
        confirmPopupState.singleButton = true
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