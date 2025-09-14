<template>
  <div 
    class="training-data-panel" 
    :class="{ 'panel-open': showPanel }"
    :style="{ width: panelWidth + 'px' }"
  >
    <div class="panel-header">
      <div class="header-title">
        <h3>LLM Training Data</h3>
        <span v-if="data" class="data-date">{{ formatDate(new Date(data.createdAt)) }}</span>
      </div>
      <div class="navigation-controls" v-if="dataList.length > 1">
        <button 
          class="nav-arrow" 
          @click="nextRecord" 
          :disabled="currentIndex === dataList.length - 1"
          title="Previous record"
        >
          <AppIcon name="chevron-left" />
        </button>
        <span class="record-counter">{{ currentIndex + 1 }} / {{ dataList.length }}</span>
        <button 
          class="nav-arrow" 
          @click="previousRecord" 
          :disabled="currentIndex === 0"
          title="Next record"
        >
          <AppIcon name="chevron-right" />
        </button>
      </div>
      <button class="panel-toggle" @click="togglePanel">
        <AppIcon :name="showPanel ? 'close' : 'menu'" />
      </button>
    </div>
    
    <!-- Resize Handle -->
    <div 
      v-if="showPanel"
      class="resize-handle"
      @mousedown="startResize"
    ></div>
    
    <div class="panel-content" v-if="showPanel">
      <div v-if="loading" class="loading-state">
        <div class="spinner-small"></div>
        <p>Loading training data...</p>
      </div>
      
      <div v-else-if="data" class="training-data">
        <div class="data-item input-section" :class="{ 'input-section-small': !data.llmInput }">
          <label>Input:</label>
          <div v-if="data.llmInput" class="data-content" ref="inputContainer">
            <ClientOnly>
              <highlightjs
                language="xml"
                :code="data.llmInput"
              />
            </ClientOnly>
          </div>
          <div v-else class="admin-only-message">
            <p>Only admins can see llmInput</p>
          </div>
        </div>
        
        <div class="data-item output-section" :class="{ 'output-section-large': !data.llmInput }">
          <label>Output:</label>
          <div class="data-content" ref="outputContainer">
            <ClientOnly>
              <highlightjs
                language="xml"
                :code="data.llmOutput"
              />
            </ClientOnly>
          </div>
        </div>
        
        <div class="data-meta">
          <span><strong>Agent:</strong> {{ data.agentName }}</span>
          <span><strong>Version:</strong> {{ data.agentVersion }}</span>
          <span><strong>Errors:</strong> {{ data.errorCount }}</span>
        </div>
      </div>
      
      <div v-else class="no-data">
        <p>No training data found for chat-agent</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showPanel: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'widthChange', width: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Admin state
const isAdmin = ref(false)

// Training data state
const loading = ref(false)
const data = ref<any>(null)
const dataList = ref<any[]>([])
const currentIndex = ref(0)

// Panel state
const panelWidth = ref(400)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

// Refs
const inputContainer = ref<HTMLElement>()
const outputContainer = ref<HTMLElement>()

// Admin functions
const checkAdminRole = async () => {
  try {
    const nuxtApp = useNuxtApp()

    if(!nuxtApp.$userId){
      return;
    }

    const role = await nuxtApp.$userRole;
    isAdmin.value = role === 'admin'
    
    // Load training data for all users
    await loadTrainingData()
  } catch (error) {
    console.error('Failed to check admin role:', error)
    isAdmin.value = false
    // Still load training data even if admin check fails
    await loadTrainingData()
  }
}

const loadTrainingData = async (showLoading = true) => {
  // Get identifier from session storage
  const identifier = sessionStorage.getItem('client-identifier')
  if (!identifier) return
  
  if (showLoading) {
    loading.value = true
  }
  try {
    const nuxtApp = useNuxtApp()
    const query = {
      agentName: "chat-agent",
      contextId: identifier, // Use client identifier directly
      isTest: isAdmin.value ? undefined : true
    }
    
    const options: any = {
      orderBy: { createdAt: 'desc' }
    }
    
    // Set limit based on admin status
    if (!isAdmin.value) {
      options.limit = 20
    }
    
    const result = await nuxtApp.$sp.llmTrainingData.find(query, options)
    console.log('Training data loaded:', result)
    
    const newDataList = Array.isArray(result) ? result : (result?.data || [])
    
    // Only update UI if there's actually new data
    const hasNewData = newDataList.length != dataList.value.length
    
    if (hasNewData || dataList.value.length === 0) {
      dataList.value = newDataList
      currentIndex.value = 0
      
      // Set current data to first item
      data.value = dataList.value.length > 0 ? dataList.value[0] : null
    }
  } catch (error) {
    console.error('Failed to load training data:', error)
    dataList.value = []
    data.value = null
    currentIndex.value = 0
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

// Navigation functions
const previousRecord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    data.value = dataList.value[currentIndex.value]
  }
}

const nextRecord = () => {
  if (currentIndex.value < dataList.value.length - 1) {
    currentIndex.value++
    data.value = dataList.value[currentIndex.value]
  }
}

const togglePanel = () => {
  emit('toggle')
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Manual refresh function - exposed to parent
const refreshData = async () => {
  await loadTrainingData(false) // Don't show loading for manual refresh from parent
}

// Expose refresh function to parent component
defineExpose({
  refreshData
})

// Resize functionality
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = panelWidth.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = e.clientX - startX.value
  const newWidth = Math.max(300, Math.min(800, startWidth.value + deltaX))
  
  panelWidth.value = newWidth
  emit('widthChange', newWidth)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Scroll to bottom of input when data changes or panel opens
const scrollToBottom = () => {
  if (data.value && props.showPanel) {
    nextTick(() => {
      if (inputContainer.value) {
        const scrollElement = inputContainer.value.querySelector('.data-content') || inputContainer.value
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    })
  }
}

watch(() => data.value, scrollToBottom, { immediate: true })
watch(() => props.showPanel, scrollToBottom)



onMounted(() => {
  checkAdminRole()
})

onUnmounted(() => {
  if (isResizing.value) {
    stopResize()
  }
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.training-data-panel {
  position: fixed;
  top: 0;
  left: -400px;
  width: 400px;
  height: 100%;
  max-height: 100dvh;
  background: $panel;
  border-right: 1px solid rgba($ring, 0.2);
  z-index: 1000;
  transition: left 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  
  &.panel-open {
    left: 0;
  }
  
  .panel-header {
    padding: 1rem;
    background: $bg;
    border-bottom: 1px solid rgba($ring, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-title {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
    
    h3 {
      margin: 0;
      color: $text;
      font-size: 1rem;
    }
    
    .data-date {
      font-size: 0.75rem;
      color: $muted;
      font-weight: normal;
    }
    
    .navigation-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .nav-arrow {
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 4px;
        background: rgba($brand, 0.1);
        color: $brand;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        
        &:hover:not(:disabled) {
          background: rgba($brand, 0.2);
        }
        
        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        svg {
          width: 14px;
          height: 14px;
        }
      }
      
      .record-counter {
        font-size: 0.8rem;
        color: $muted;
        white-space: nowrap;
        padding: 0 0.25rem;
      }
    }
    
    .panel-toggle {
      position: absolute;
      right: -40px;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background: $brand;
      color: white;
      border: none;
      border-radius: 0 8px 8px 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
      
      &:hover {
        background: $brand-2;
      }
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
  
  .resize-handle {
    position: absolute;
    top: 0;
    right: -2px;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    background: transparent;
    
    &:hover {
      background: rgba($brand, 0.3);
    }
  }
  
  .panel-content {
    height: calc(100vh - 80px);
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }
  
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: $muted;
    
    .spinner-small {
      width: 24px;
      height: 24px;
      border: 2px solid rgba($brand, 0.2);
      border-top: 2px solid $brand;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 0.5rem;
    }
    
    p {
      margin: 0;
      font-size: 0.875rem;
    }
  }
  
  .training-data {
    display: flex;
    flex-direction: column;
    height: 100%;
    
    .data-item {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      min-height: 0;
      
      // Default: input takes space, output is fixed
      &.input-section {
        flex: 1;
      }
      
      &.output-section {
        flex: 0 0 auto;
      }
      
      // Override when input is hidden: output takes space, input is fixed
      &.input-section-small {
        flex: 0 0 auto;
      }
      
      &.output-section-large {
        flex: 1;
      }
      
      label {
        display: block;
        font-weight: 600;
        color: $text;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        flex-shrink: 0;
      }
      
      .data-content {
        background: $bg;
        border: 1px solid rgba($ring, 0.2);
        border-radius: 6px;
        padding: 0;
        overflow: hidden;
        max-height: 200px;
        overflow-y: auto;
        
        // Common code styling for both hljs and pre elements
        :deep(.hljs),
        pre {
          background: transparent !important;
          padding: 0.75rem;
          margin: 0;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
          
          code {
            background: transparent;
            padding: 0;
            border-radius: 0;
            font-size: inherit;
            line-height: inherit;
          }
        }
      }
      
      // Expandable sections override default constraints
      &.input-section .data-content,
      &.output-section-large .data-content {
        flex: 1;
        max-height: none;
        min-height: 0;
      }
      
      .admin-only-message {
        background: rgba($muted, 0.1);
        border: 1px solid rgba($ring, 0.2);
        border-radius: 6px;
        padding: 0.75rem;
        text-align: center;
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        
        p {
          margin: 0;
          color: $muted;
          font-style: italic;
          font-size: 0.875rem;
        }
      }
    }
    
    .data-meta {
      background: rgba($muted, 0.05);
      border-radius: 6px;
      padding: 0.5rem;
      margin-top: 0.5rem;
      flex-shrink: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      
      span {
        font-size: 0.7rem;
        color: $muted;
        white-space: nowrap;
        
        strong {
          color: $text;
        }
      }
    }
  }
  
  .no-data {
    text-align: center;
    padding: 2rem;
    color: $muted;
    
    p {
      margin: 0;
      font-size: 0.875rem;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Mobile responsive
@media (max-width: 768px) {
  .training-data-panel {
    width: 100vw !important;
    left: -100vw;
    
    &.panel-open {
      left: 0;
      
      .panel-header .panel-toggle {
        position: static;
        transform: none;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        box-shadow: none;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
    
    .resize-handle {
      display: none;
    }
  }
}
</style>
