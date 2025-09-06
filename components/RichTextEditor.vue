<template>
  <div class="rich-text-wrapper">
    <div v-if="isClient" ref="quillEditor" class="rich-text-editor"></div>
    <div v-else class="rich-text-placeholder">Loading editor...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'

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

const quillEditor = ref<HTMLElement>()
const isClient = ref(false)
let quill: any = null
let turndownService: any = null

// Computed style to handle height constraints
const editorStyle = computed(() => {
  // Get the max-height from parent if set
  return {}
})

// Helper function to convert markdown to basic HTML for Quill
function markdownToHtml(markdown: string): string {
  if (!markdown) return ''
  
  // Basic markdown to HTML conversion
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]*)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>')
}

onMounted(async () => {
  if (process.server) return
  
  isClient.value = true
  await nextTick()
  
  if (!quillEditor.value) return

  try {
    // Dynamically import Quill and TurndownService for client-side only
    const [{ default: Quill }, { default: TurndownService }] = await Promise.all([
      import('quill'),
      import('turndown')
    ])

    turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    })

    // Configure Turndown for better markdown output
    turndownService.addRule('lineBreak', {
      filter: 'br',
      replacement: () => '\n'
    })
    
    // Configure toolbar with only essential options
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      ['code-block'],
      [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
      [{ 'list': 'ordered' }],
      [{ 'list': 'bullet' }],
    ]

    quill = new Quill(quillEditor.value, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Enter your product description...'
    })

    // Set initial content if provided
    if (props.modelValue) {
      const htmlContent = markdownToHtml(props.modelValue)
      quill.root.innerHTML = htmlContent
    }

    // Listen for content changes and convert to markdown
    quill.on('text-change', () => {
      if (!quill || !turndownService) return
      
      const html = quill.root.innerHTML
      // Convert HTML to markdown
      const markdown = turndownService.turndown(html).trim()
      emit('update:modelValue', markdown)
    })
  } catch (error) {
    console.error('Failed to initialize Quill editor:', error)
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (!quill || !turndownService || !isClient.value) return
  
  // Only update if the content actually changed to avoid cursor jumping
  const currentHtml = quill.root.innerHTML
  const currentMarkdown = turndownService.turndown(currentHtml).trim()
  
  if (currentMarkdown !== (newValue || '')) {
    // Convert markdown to HTML for display in Quill
    const htmlContent = markdownToHtml(newValue || '')
    quill.root.innerHTML = htmlContent
  }
})
</script>

<style>
/* Wrapper container that maintains control over layout */
.rich-text-wrapper {
  min-height: 150px;
  max-height: inherit; /* Inherit from parent (MegaForm max-height) */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* The editor container - Quill will replace this but wrapper remains */
.rich-text-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Target Quill's structure within our wrapper */
.rich-text-wrapper .ql-toolbar {
  flex-shrink: 0; /* Keep toolbar at fixed height */
  border: none;
  border-bottom: 1px solid #ccc;
  border-radius: 4px 4px 0 0;
}

.rich-text-wrapper .ql-container {
  flex: 1; /* Take remaining space */
  border: none;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rich-text-wrapper .ql-editor {
  flex: 1;
  overflow-y: auto; /* This provides the scroll */
  min-height: 120px;
  padding: 12px 15px;
  scrollbar-color: grey transparent;
}

/* Ensure content inside editor doesn't break out */
.rich-text-wrapper .ql-editor * {
  max-width: 100%;
  word-wrap: break-word;
}

.rich-text-placeholder {
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
</style>
