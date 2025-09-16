<template>
  <div class="widget-config-page page-container">
    <header class="page-header">
      <h1 class="page-title">Widget Configuration</h1>
      <p class="page-desc">Tune your support widget appearance & behavior, then copy the embed snippet.</p>
    </header>

    <div class="content-section">
      <MegaForm
        :formClass="WidgetConfig"
        v-model="formData"
        :fieldOverrides="fieldOverrides"
        :excludeFields="excludeFields"
        :actions="actions"
      >
        <div class="embed-snippet-block">
          <h2 class="snippet-header">
            <span>Embed Snippet</span>
            <button class="copy-btn" type="button" @click="copySnippet">Copy Snippet</button>
          </h2>
          <div class="code-wrapper"><pre><code ref="codeEl">{{ snippet }}</code></pre></div>
          <p v-if="copied" class="copied-msg">Copied!</p>
        </div>
      </MegaForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import MegaForm, { OverrideRecord, MegaFormAction } from '@/components/MegaForm.vue'
import { WidgetConfig, WidgetPosition, WidgetIcon } from '@/eicrud_exports/services/SUPPORT-ms/widget-config/widget-config.entity'

definePageMeta({ layout: 'default' })

const nuxtApp = useNuxtApp()
const apiToken = computed(() => (nuxtApp as any).$userProductId || 'REPLACE_TOKEN')

const excludeFields = ['id','owner','product','createdAt','updatedAt']

const defaultConfig = (): Partial<WidgetConfig> => ({
  id: '',
  product: undefined as any,
  position: WidgetPosition.BOTTOM_RIGHT,
  width: '400px',
  height: '600px',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  icon: WidgetIcon.ROBOT,
  welcomeMessage: '👋 Welcome! How can I help you today?',
  bounceAfterInit: 1,
  periodicBounce: 20,
  startOpen: false,
  darkMode: false,
  draggable: true,
  soundOn: true,

})

const formData = ref<WidgetConfig>(defaultConfig() as any)
const loadingConfig = ref(false)

const loadConfig = async () => {
  if (!nuxtApp.$userProductId) return
  loadingConfig.value = true
  try {
  const existing = await nuxtApp.$sp.widgetConfig.findOne({ product:  nuxtApp.$userProductId })
    if (existing) {
      formData.value = { ...existing }
    } else {
      // create default
      const payload: any = { ...defaultConfig(), product: nuxtApp.$userProductId }
      const created = await nuxtApp.$sp.widgetConfig.create(payload)
      formData.value = { ...created }
    }
  } catch (e) {
    console.error('Failed to load widget config', e)
    nuxtApp.$toast.show(e, 'error')
  } finally {
    loadingConfig.value = false
  }
}

const buildAttributes = () => {
  const attrs: string[] = []
  const f = formData.value
  attrs.push(`data-api-token="${apiToken.value}"`)
  attrs.push(`data-position="${f.position}"`)
  attrs.push(`data-width="${f.width}"`)
  attrs.push(`data-height="${f.height}"`)
  if (f.primaryColor) attrs.push(`data-primary-color="${f.primaryColor}"`)
  if (f.secondaryColor) attrs.push(`data-secondary-color="${f.secondaryColor}"`)
  if (f.icon) attrs.push(`data-icon="${f.icon}"`)
  if (f.welcomeMessage) attrs.push(`data-welcome-message="${f.welcomeMessage.replace(/"/g,'&quot;')}"`)
  if (f.bounceAfterInit != null) attrs.push(`data-bounce-after-init="${f.bounceAfterInit}"`)
  if (f.periodicBounce != null) attrs.push(`data-periodic-bounce="${f.periodicBounce}"`)
  if (f.startOpen) attrs.push('data-start-open="true"')
  if (f.darkMode) attrs.push('data-dark-mode="true"')
  if (!f.draggable) attrs.push('data-draggable="false"')
  if (!f.soundOn) attrs.push('data-sound-on="false"')
  attrs.push('data-debug="true"')
  
  return attrs.join('\n        ')
}

const snippet = computed(() => {
  // Use a placeholder to avoid prematurely closing the surrounding script context
  const closingTag = '<' + '/script>'
  return `<script src=\"${window.location.origin}/embed.js\"\n        ${buildAttributes()}\n>${closingTag}`
})

const copied = ref(false)
const codeEl = ref<HTMLElement | null>(null)
let previewBuildTimer: any = null
const PREVIEW_DEBOUNCE = 160

const copySnippet = async () => {
  await navigator.clipboard.writeText(snippet.value)
  copied.value = true
  setTimeout(()=> copied.value = false, 1500)
}

const cleanupPreview = () => {
  sessionStorage.removeItem('ai-support-guest-id');
  document.querySelectorAll('#ai-support-widget').forEach(el => el.remove())
  document.querySelectorAll('#ai-support-widget-bubble').forEach(el => el.remove())
  document.querySelectorAll('#widget-preview-script').forEach(el => el.remove())
}

const buildPreview = () => {
  cleanupPreview()
  const s = document.createElement('script')
  s.id = 'widget-preview-script'
  s.src = `${window.location.origin}/embed.js`
  const f = formData.value
  s.setAttribute('data-api-token', apiToken.value)
  s.setAttribute('data-position', f.position)
  s.setAttribute('data-width', f.width)
  s.setAttribute('data-height', f.height)
  s.setAttribute('data-primary-color', f.primaryColor)
  s.setAttribute('data-secondary-color', f.secondaryColor)
  s.setAttribute('data-icon', f.icon)
  s.setAttribute('data-welcome-message', f.welcomeMessage)
  if (f.bounceAfterInit != null) s.setAttribute('data-bounce-after-init', String(f.bounceAfterInit))
  if (f.periodicBounce != null) s.setAttribute('data-periodic-bounce', String(f.periodicBounce))
  if (f.startOpen) s.setAttribute('data-start-open', 'true')
  if (f.darkMode) s.setAttribute('data-dark-mode', 'true')
  if (!f.draggable) s.setAttribute('data-draggable', 'false')
  s.setAttribute('data-sound-on', 'false')
  document.body.appendChild(s)
}

const schedulePreview = () => {
  if (previewBuildTimer) clearTimeout(previewBuildTimer)
  previewBuildTimer = setTimeout(buildPreview, PREVIEW_DEBOUNCE)
}

watch(() => ({...formData.value, apiToken: apiToken.value}), () => schedulePreview(), { deep: true })

onMounted(async () => { await loadConfig(); buildPreview() })
onBeforeUnmount(() => { if (previewBuildTimer) clearTimeout(previewBuildTimer); cleanupPreview() })

const fieldOverrides: OverrideRecord<WidgetConfig> = {
  position: { selectOptions: [
    { label: 'Bottom Right', value: WidgetPosition.BOTTOM_RIGHT },
    { label: 'Bottom Left', value: WidgetPosition.BOTTOM_LEFT }
  ]},
  icon: { selectOptions: [
    { label: 'Robot', value: WidgetIcon.ROBOT },
    { label: 'Message', value: WidgetIcon.MESSAGE },
    { label: 'Headset', value: WidgetIcon.HEADSET },
  ]},
  primaryColor: { type: 'color', label: 'Primary Color' },
  secondaryColor: { type: 'color', label: 'Secondary Color' },
  bounceAfterInit: { type: 'number', label: 'Bounce After Init (seconds)' },
  periodicBounce: { type: 'number', label: 'Periodic Bounce (seconds)' },
  startOpen: { type: 'checkbox', onLabel: 'YES', offLabel: 'NO' },
  darkMode: { type: 'checkbox', onLabel: 'ON', offLabel: 'OFF' },
  draggable: { type: 'checkbox', onLabel: 'ON', offLabel: 'OFF' },
  soundOn: { type: 'checkbox', onLabel: 'ON', offLabel: 'OFF' },
  welcomeMessage: { type: "richtext", placeholder: '👋 Welcome!', label: 'Welcome Message' }
}

const actions: MegaFormAction[] = [
  { label: 'Save', color: 'primary', callback: async (data:any) => {
      try {
        // Associate product (if available) so server can link
        if (nuxtApp.$userProductId) data.product = { id: nuxtApp.$userProductId }
        // Persist via service client (create or update based on existing id?)
        if (formData.value.id) {
          await nuxtApp.$sp.widgetConfig.patchOne({ id: formData.value.id }, data)
          nuxtApp.$toast.show('Widget config updated', 'success')
        } else {
          const created = await nuxtApp.$sp.widgetConfig.create(data)
          formData.value.id = created.id
          nuxtApp.$toast.show('Widget config saved', 'success')
        }
      } catch (e:any) {
        console.error(e)
        nuxtApp.$toast.show(e, 'error')
      }
    }}
]
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.widget-config-page { }
.page-header { margin-bottom:2rem; }
.page-title { margin:0; font-size:2rem; color:$text; }
.page-desc { color:$muted; margin:.5rem 0 0; font-size:.9rem; }

.content-section { background:$panel; border-radius:$radius; box-shadow:$shadow; padding:2rem; }

.embed-snippet-block { margin-top:2rem; }
.embed-snippet-block h2 { margin:0 0 .75rem; font-size:1.1rem; color:$text; }
.snippet-header { display:flex; align-items:center; gap:.75rem; }
.snippet-header .copy-btn { margin-top:0; margin-left:auto; }
.code-wrapper { background:#1e1e24; color:#cdd; padding:1rem 1rem; border-radius:8px; overflow:auto; font-size:.75rem; line-height:1.35; box-shadow:0 4px 12px rgba(0,0,0,.25); }
.copy-btn { margin-top:.75rem; background:$brand; color:#fff; border:none; padding:.55rem .9rem; font-size:.75rem; font-weight:600; border-radius:6px; cursor:pointer; }
.copy-btn:hover { background:$brand-2; }
.copied-msg { margin-top:.35rem; font-size:.6rem; color:#2d995b; font-weight:600; }

@media (max-width: 768px){
  .content-section { padding:1rem; }
  .page-title { font-size:1.8rem; }
}
</style>
