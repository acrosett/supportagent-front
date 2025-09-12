<template>
  <div class="easymde-wrapper">
    <div v-if="isClient" ref="editorElement"></div>
    <div v-else class="loading-placeholder">Loading editor...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

const editorElement = ref<HTMLElement>()
const isClient = ref(false)
let easymde: any = null
let isUpdatingFromProps = false

onMounted(async () => {
  if (process.server) return
  
  isClient.value = true
  await nextTick()
  
  if (!editorElement.value) return

  try {
    // Dynamically import EasyMDE for client-side only
    const { default: EasyMDE } = await import('easymde')
    
    // Create textarea element
    const textarea = document.createElement('textarea')
    textarea.value = props.modelValue || ''
    editorElement.value.appendChild(textarea)

    // Initialize EasyMDE - just like your working example!
    const isMobile = window.innerWidth <= 768
    
    // Build toolbar - common items first, then add desktop-only items
    const toolbar: any[] = [
      'bold', 'italic', 'strikethrough', '|',
      'heading-1', 'heading-2', 'heading-3'
    ]
    
    // Add additional items for desktop
    if (!isMobile) {
      toolbar.push('|', 'unordered-list', 'ordered-list', '|', 'code', 'quote', '|', 'preview', 'side-by-side', 'fullscreen')
    }

    
    easymde = new EasyMDE({
      element: textarea,
      placeholder: 'Enter your product description...',
      spellChecker: false,
      status: false,
      toolbar: toolbar
    })

    // Listen for content changes
    easymde.codemirror.on('change', () => {
      if (!easymde || isUpdatingFromProps) return
      
      const markdown = easymde.value()
      emit('update:modelValue', markdown)
    })
  } catch (error) {
    console.error('Failed to initialize EasyMDE editor:', error)
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (!easymde || !isClient.value || isUpdatingFromProps) return
  
  const currentMarkdown = easymde.value()
  if (currentMarkdown !== (newValue || '')) {
    isUpdatingFromProps = true
    easymde.value(newValue || '')
    nextTick(() => {
      isUpdatingFromProps = false
    })
  }
})
</script>

<style>
/* Import EasyMDE CSS */
@import 'easymde/dist/easymde.min.css';

.easymde-wrapper {
  min-height: 150px;
  max-height: inherit;
  border-radius: 4px;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #666;
  font-style: italic;
}

/* Simple: Just make the CodeMirror scroll within its container */
.easymde-wrapper .CodeMirror {
  height: 310px;
  max-height: inherit;
}

.easymde-wrapper .CodeMirror-code {

}

.easymde-wrapper .CodeMirror-scroll {
  overflow-y: auto;
}

/* Customize heading sizes */
.easymde-wrapper .CodeMirror .cm-header-1 {
  font-size: 1.2em;
}

.easymde-wrapper .CodeMirror .cm-header-2 {
  font-size: 1.1em;
}

.easymde-wrapper .CodeMirror .cm-header-3 {
  font-size: 1em !important;
}

.easymde-wrapper .editor-preview h1,
.easymde-wrapper .editor-preview-side h1 {
  font-size: 1.2em !important;
}

.easymde-wrapper .editor-preview h2,
.easymde-wrapper .editor-preview-side h2 {
  font-size: 1.1em !important;
}

.easymde-wrapper .editor-preview h3,
.easymde-wrapper .editor-preview-side h3 {
  font-size: 1em !important;
}
</style>