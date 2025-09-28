<template>
  <div class="digest-file">
    <div class="upload-area" :class="{ 'drag-over': isDragOver }">
      <input
        ref="fileInput"
        type="file"
        accept=".html,.htm,.pdf,.doc,.docx,.xml,.txt,.md,.json,.csv,text/html,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/xml,application/xml,text/plain,text/markdown,application/json,text/csv"
        @change="handleFileSelect"
        class="file-input"
        id="file-upload"
      />
      
      <div 
        class="drop-zone"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" 
        @drop.prevent="handleDrop"
        @click="triggerFileSelect"
      >
        <div v-if="!isProcessing && !processedText" class="upload-prompt">
          <AppIcon name="document" size="xl" class="upload-icon" />
          <h3>Upload Document</h3>
          <p>Drop your file here or click to browse</p>
          <p class="file-types">Supports: HTML, PDF, Word (.doc, .docx), XML, Text (.txt), Markdown (.md), JSON, CSV</p>
        </div>
        
        <div v-else-if="isProcessing" class="processing-state">
          <div class="spinner"></div>
          <p>Processing {{ currentFileName }}...</p>
        </div>
        
        <div v-else class="success-state">
          <AppIcon name="check" size="lg" class="success-icon" />
          <h4>{{ currentFileName }}</h4>
          <p>Successfully processed</p>
          <AppButton 
            @click.stop="resetUpload"
            label="Upload Another File"
            color="secondary"
            size="sm"
          />
        </div>
      </div>
    </div>
    

  </div>
  
  <!-- Confirm price popup -->
  <AppPopup
    :show="showConfirm"
    title="Confirm Upload"
    size="sm"
    @close="cancelConfirm"
  >
    <div class="confirm-content">
      <p>
        You are about to upload <strong>{{ pendingFile?.name || 'your file' }}</strong>
        ({{ (pendingSizeKB || 0).toFixed(1) }} KB).
      </p>
      <div v-if="isCalculatingCost" class="calculating-cost">
        <div class="mini-spinner"></div>
        Calculating estimated cost...
      </div>
      <p v-else>
        Estimated processing cost: <strong>${{ estimatedCost.toFixed(2) }}</strong>
      </p>
    </div>
    <template #footer>
      <div class="confirm-footer">
        <AppButton label="Cancel" color="secondary" @click="cancelConfirm" />
        <AppButton label="Process with AI" margin="left" color="primary" @click="confirmUpload" />
      </div>
    </template>
  </AppPopup>
</template>

<script setup lang="ts">
import { estimateFullDigestCost } from '~/eicrud_exports/services/AI-ms/digestor/shared.utils'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const isProcessing = ref(false)
const error = ref('')
const currentFileName = ref('')
const processedText = ref(props.modelValue || '')
// Upload confirmation state
const showConfirm = ref(false)
const pendingFile = ref<File | null>(null)
const estimatedCost = ref(0)
const isCalculatingCost = ref(false)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  processedText.value = newValue || ''
})

// Watch for internal changes
watch(processedText, (newValue) => {
  emit('update:modelValue', newValue)
})

const MAX_SIZE_BYTES = 900 * 1024 // 900KB limit

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    pendingFile.value = file
    try {
      estimatedCost.value = await calculateEstimatedCost(file)
      showConfirm.value = true
    } catch (err) {
      useNuxtApp().$toast.show(err, 'error');
      resetUpload()
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  isDragOver.value = false
}

const handleDrop = async (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    pendingFile.value = file
    try {
      estimatedCost.value = await calculateEstimatedCost(file)
      showConfirm.value = true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file'
      error.value = errorMessage
      resetUpload()
    }
  }
}

const resetUpload = () => {
  processedText.value = ''
  currentFileName.value = ''
  showConfirm.value = false
  pendingFile.value = null
  estimatedCost.value = 0
  isCalculatingCost.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Confirmation helpers
const pendingSizeKB = computed(() => {
  return pendingFile.value ? (pendingFile.value.size / 1024) : 0
})

// Shared function to extract and validate text with size limits
const extractAndValidateText = async (file: File): Promise<{ text: string; cost: number }> => {
  const fileType = file.type || getFileTypeFromExtension(file.name)
  
  // Try processing without removing images first
  let extractedText = await extractTextByType(file, fileType, false)
  
  // Check size limit
  let textSizeBytes = new TextEncoder().encode(extractedText).length
  if (textSizeBytes > MAX_SIZE_BYTES) {
    // Try again without images if the text is too large
    console.log('Text too large, attempting to remove images and retry...')
    
    try {
      extractedText = await extractTextByType(file, fileType, true)
      const newTextSizeBytes = new TextEncoder().encode(extractedText).length
      
      if (newTextSizeBytes > MAX_SIZE_BYTES) {
        throw new Error(`Extracted text is still too large after removing images (${formatFileSize(newTextSizeBytes)}). Try using a shorter document.`)
      } else {
        console.log(`✅ Successfully reduced file size from ${formatFileSize(textSizeBytes)} to ${formatFileSize(newTextSizeBytes)} by removing images.`)
      }
    } catch (retryError) {
      // If retry fails or file type doesn't support image removal, throw original size error
      throw new Error(`Extracted text is too large (${formatFileSize(textSizeBytes)}). Try using a shorter document.`)
    }
  }
  
  // Calculate cost
  const cost = await estimateFullDigestCost(extractedText)
  
  return {
    text: extractedText.trim(),
    cost: cost > 0 ? cost : 0
  }
}

const calculateEstimatedCost = async (file: File) => {
  if (!file) return 0
  
  try {
    isCalculatingCost.value = true
    const { cost } = await extractAndValidateText(file)
    return cost
  } catch (error) {
    console.error('Failed to estimate cost:', error)
    // If file is too large or processing fails, show error in UI
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file'
    // You might want to show this error to user in the confirmation dialog
    throw error // Re-throw to handle in calling function
  } finally {
    isCalculatingCost.value = false
  }
}


const confirmUpload = async () => {
  if (!pendingFile.value) return
  const file = pendingFile.value
  showConfirm.value = false
  pendingFile.value = null
  
  try {
    // Process file to extract text first
    await processFile(file)
    
    // Then call digest_file with the extracted text
    if (processedText.value) {
      await callDigestFile()
    }
  } catch (err) {
    useNuxtApp().$toast.show(err, 'error')
    resetUpload()
  }
}

const callDigestFile = async () => {
  const { $sp } = useNuxtApp()
  const productId = useNuxtApp().$userProductId
  
  if (!productId) {
    throw new Error('Product ID not found')
  }
  
  await $sp.digestor.digest_file({
    fileText: processedText.value,
    productId: productId
  })
  
  useNuxtApp().$toast.show('Document processing started successfully', 'success')
}
const cancelConfirm = () => {
  // Clear selection to avoid accidental upload
  resetUpload()
}

const processFile = async (file: File) => {
  currentFileName.value = file.name
  isProcessing.value = true
  
  try {
    const { text } = await extractAndValidateText(file)
    processedText.value = text
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to process file'
    emit('error', errorMessage)
    resetUpload()
  } finally {
    isProcessing.value = false
  }
}

const extractTextByType = async (file: File, fileType: string, removeImages: boolean): Promise<string> => {
  switch (fileType) {
    case 'text/html':
    case 'application/html':
      return await extractTextFromHTML(file, removeImages)
    case 'application/pdf':
      if (removeImages) {
        throw new Error('PDF images are usually not extracted as text anyway')
      }
      return await extractTextFromPDF(file)
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await extractTextFromWord(file, removeImages)
    case 'text/xml':
    case 'application/xml':
      return await extractTextFromXML(file, removeImages)
    case 'text/plain':
    case 'text/markdown':
    case 'application/json':
    case 'text/csv':
      if (removeImages) {
        throw new Error('Plain text files don\'t contain images')
      }
      return await extractTextFromPlainText(file)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

const getFileTypeFromExtension = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'html':
    case 'htm':
      return 'text/html'
    case 'pdf':
      return 'application/pdf'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xml':
      return 'text/xml'
    case 'txt':
      return 'text/plain'
    case 'md':
      return 'text/markdown'
    case 'json':
      return 'application/json'
    case 'csv':
      return 'text/csv'
    default:
      return 'unknown'
  }
}

const extractTextFromHTML = async (file: File, removeImages: boolean = false): Promise<string> => {
  const text = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style')
  scripts.forEach(el => el.remove())
  
  // Remove images if requested
  if (removeImages) {
    const images = doc.querySelectorAll('img, picture, figure, svg')
    images.forEach(el => el.remove())
  }
  
  // Convert HTML structure to formatted text
  return convertHtmlToFormattedText(doc.body || doc.documentElement)
}

const convertHtmlToFormattedText = (element: Element): string => {
  let result = ''
  
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) result += text + ' '
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tagName = el.tagName.toLowerCase()
      
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const headerLevel = parseInt(tagName.charAt(1))
          result += '\n\n' + '#'.repeat(headerLevel) + ' ' + (el.textContent?.trim() || '') + '\n\n'
          break
        case 'p':
          result += '\n\n' + (el.textContent?.trim() || '') + '\n\n'
          break
        case 'br':
          result += '\n'
          break
        case 'strong':
        case 'b':
          result += '**' + (el.textContent?.trim() || '') + '**'
          break
        case 'em':
        case 'i':
          result += '*' + (el.textContent?.trim() || '') + '*'
          break
        case 'ul':
        case 'ol':
          result += '\n\n' + convertListToText(el) + '\n\n'
          break
        case 'li':
          // Handled by convertListToText
          break
        case 'blockquote':
          result += '\n\n> ' + (el.textContent?.trim() || '') + '\n\n'
          break
        case 'code':
          result += '`' + (el.textContent?.trim() || '') + '`'
          break
        case 'pre':
          result += '\n\n```\n' + (el.textContent?.trim() || '') + '\n```\n\n'
          break
        case 'img':
        case 'picture':
        case 'figure':
        case 'svg':
          // Skip image elements - don't add to result
          break
        default:
          result += convertHtmlToFormattedText(el)
          break
      }
    }
  }
  
  return result
}

const convertListToText = (listElement: Element): string => {
  let result = ''
  const isOrdered = listElement.tagName.toLowerCase() === 'ol'
  let counter = 1
  
  for (const li of listElement.querySelectorAll('li')) {
    const prefix = isOrdered ? `${counter}. ` : '- '
    result += prefix + (li.textContent?.trim() || '') + '\n'
    counter++
  }
  
  return result
}

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Dynamically import pdf-parse with proper typing
    const pdfParse = await import('pdf-parse') as any
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    const data = await pdfParse.default(uint8Array)
    return data.text || ''
  } catch (error) {
    throw new Error('Failed to process PDF file. Please ensure it contains extractable text.')
  }
}

const extractTextFromWord = async (file: File, removeImages: boolean = false): Promise<string> => {
  try {
    // Dynamically import mammoth
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    
    // Extract to HTML first to preserve some formatting
  const result = await mammoth.convertToHtml(arrayBuffer)
    
    // Convert the HTML to formatted text
    const parser = new DOMParser()
    const doc = parser.parseFromString(result.value || '', 'text/html')
    
    // Remove any remaining image elements if requested
    if (removeImages) {
      const images = doc.querySelectorAll('img, picture, figure')
      images.forEach(el => el.remove())
    }
    
    return convertHtmlToFormattedText(doc.body || doc.documentElement)
  } catch (error) {
    console.error('Mammoth HTML conversion failed, trying raw text:', error)
    try {
      // Fallback to raw text if HTML conversion fails
      const mammoth = await import('mammoth')
      const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText(arrayBuffer)
      return result.value || ''
    } catch (fallbackError) {
      throw new Error('Failed to process Word document. Please ensure it\'s a valid .doc or .docx file.')
    }
  }
}

const extractTextFromXML = async (file: File, removeImages: boolean = false): Promise<string> => {
  const text = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')
  
  // Check for XML parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid XML format')
  }
  
  // Remove image-related elements if requested
  if (removeImages) {
    const imageElements = doc.querySelectorAll('image, img, picture, graphic, media')
    imageElements.forEach(el => el.remove())
  }
  
  // Convert XML structure to formatted text
  return convertXmlToFormattedText(doc.documentElement)
}

const convertXmlToFormattedText = (element: Element): string => {
  let result = ''
  const tagName = element.tagName
  const textContent = element.textContent?.trim()
  
  // If element has only text content, format it nicely
  if (element.children.length === 0 && textContent) {
    result += `**${tagName}:** ${textContent}\n`
  } else if (element.children.length > 0) {
    // If element has children, create a section
    result += `\n## ${tagName}\n\n`
    
    for (const child of element.children) {
      result += convertXmlToFormattedText(child)
    }
  }
  
  return result
}

const extractTextFromPlainText = async (file: File): Promise<string> => {
  // For plain text and markdown files, just return the content as-is
  return await file.text()
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.digest-file {
  width: 100%;
}

.upload-area {
  border: 2px dashed $muted;
  border-radius: $radius;
  transition: all 0.3s ease;
  
  &.drag-over {
    border-color: $brand-2;
    background-color: rgba($brand-2, 0.05);
  }

}

.file-input {
  display: none;
}

.drop-zone {
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba($muted, 0.05);
  }
}

.upload-prompt {
  h3 {
    margin: 1rem 0 0.5rem;
    color: $text;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0.5rem 0;
    color: $muted;
    
    &.file-types {
      font-size: 0.9rem;
      font-style: italic;
    }
  }
}

.upload-icon {
  color: $muted;
  opacity: 0.7;
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  p {
    color: $text;
    font-size: 1.1rem;
  }
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  h4 {
    margin: 0;
    color: $text;
    font-size: 1.2rem;
  }
  
  p {
    margin: 0;
    color: $muted;
  }
}

.success-icon {
  color: #10b981;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba($brand-2, 0.3);
  border-top: 3px solid $brand-2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .drop-zone {
    padding: 2rem 1rem;
    min-height: 150px;
  }
  
  .upload-prompt h3 {
    font-size: 1.25rem;
  }
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.calculating-cost {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $muted;
  font-style: italic;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba($brand-2, 0.3);
  border-top: 2px solid $brand-2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
