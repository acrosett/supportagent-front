<template>
  <div class="test-chat-page">
    <!-- Admin Training Data Panel -->
    <TrainingDataPanel
      ref="trainingDataPanel"
      :showPanel="showSidebar"
      :modelId="modelId"
      :fanId="fanId"
      @toggle="toggleSidebar"
      @widthChange="handlePanelWidthChange"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Setting up chat...</p>
    </div>

    <!-- Chat Interface -->
    <div v-else class="chat-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="model-info">
          <div class="model-avatar">
            <div class="avatar-placeholder">{{ selectedModel?.name?.charAt(0) || 'M' }}</div>
          </div>
          <div class="model-details">
            <h1>{{ selectedModel?.name || 'Test Model' }}</h1>
            <p class="chat-subtitle">Test Chat - Fan ID: {{ currentFan?.id || 'Loading...' }}</p>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-container" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" class="message-wrapper">
          <div :class="['message', message.sender === 'fan' ? 'message-fan' : 'message-model']">
            <!-- Message Header -->
            <div class="message-header">
              <span class="sender-name">
                {{ message.sender === 'fan' ? (currentFan?.name || 'You') : selectedModel?.name }}
              </span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>

            <!-- Message Content -->
            <div class="message-content">
              <p v-if="message.text">{{ message.text }}</p>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">{{ selectedModel?.name }} is thinking...</span>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="input-wrapper">
          <textarea
            v-model="messageText"
            placeholder="Type your message..."
            rows="1"
            ref="messageInput"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="handleShiftEnter"
            @input="autoResize"
          ></textarea>
          
          <div class="input-actions">
            <button 
              type="button" 
              class="send-button" 
              @click="sendMessage"
              :disabled="!messageText.trim()"
            >
              <AppIcon name="send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtApp } from 'nuxt/app'
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

definePageMeta({ 
  layout: 'bare',
  mode: 'spa', // Force SPA mode for this route
  ssr: false, // Disable server-side rendering
  prerender: false, // Disable prerendering
  // Exclude heavy plugins except essential ones
  plugins: ['sp', 'toast'] // Only load super client and toast plugins
})

interface ChatMessage {
  id: string
  sender: 'fan' | 'model'
  text?: string
  timestamp: Date
}

// URL Parameters
const route = useRoute()
const router = useRouter()
const modelId = computed(() => route.query.modelId as string)
const fanId = computed(() => route.query.fanId as string)
const fanName = computed(() => route.query.fanName as string)



// State
const isLoading = ref(true)
const selectedModel = ref<Model | null>(null)
const currentFan = ref<GetFanInfoReturnDto | null>(null)
const messages = ref<ChatMessage[]>([])
const messageText = ref('')
const isTyping = ref(false)

// User activity tracking
const activityTracker = useUserActivity()
const messagePollingInterval = ref<NodeJS.Timeout | null>(null)

// Admin sidebar state
const showSidebar = ref(false)

// Message count tracking for training data reload optimization
const lastMessageCount = ref(0)

// Refs
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

const initializeChat = async (nuxtApp: NuxtApp) => {
  if (!modelId.value) {
    nuxtApp.$toast.show(new Error('Model ID is required'), 'error')
    await router.push('/models')
    return
  }

  try {
    // Load model
    selectedModel.value = await nuxtApp.$sp.model.findOne({ id: modelId.value, isTestModel: true })
    
    if (!selectedModel.value) {
  nuxtApp.$toast.show(new Error('Model not found'), 'error')
      await router.push('/models')
      return
    }

    // Handle fan - create new one if fanId not provided
    if (fanId.value) {
      try {
        currentFan.value = await nuxtApp.$sp.testing.get_fan_info({ fanId: fanId.value })
      } catch (error) {
        console.warn('Fan not found, creating new one')
      }
    }

    if (!currentFan.value) {
      // Create new fan
      const newFan = await nuxtApp.$sp.testing.create_fan({
        fanName: fanName.value || `Test Fan ${Date.now()}`,
        model_id: modelId.value,
      })
      
      currentFan.value = newFan as any;
      
      // Update URL with new fanId
      await router.replace({
        query: { ...route.query, fanId: currentFan?.value?.id }
      })
    }


  // Load messages and spents
  await refreshMessages(nuxtApp)

    // Start message polling if chat initialized successfully
    if (selectedModel.value && currentFan.value) {
      startMessagePolling(nuxtApp)
    }

    // Scroll to bottom after initial load
    await nextTick()
    scrollToBottom()

  } catch (error: any) {
    console.error('Failed to initialize chat:', error)
  console.error(error)
  nuxtApp.$toast.show(error, 'error')
  } finally {
    isLoading.value = false
  }
}


// Loads messages and builds ChatMessage[]
const refreshMessages = async (nuxtApp: NuxtApp) => {
  if (!selectedModel.value?.id || !currentFan.value?.id) return
  try {
    const res = await nuxtApp.$sp.testing.get_messages({
      model_id: selectedModel.value.id,
      fan: currentFan.value.id
    })
    const rawMessages = res.messages?.data || []

    // Update typing status from API response
    isTyping.value = res.isTyping || false

    // Build ChatMessage[] for messages
    const chatMessages = rawMessages.map((msg: any) => {
      return {
        id: msg.id,
        sender: msg.from,
        text: msg.content,
        timestamp: msg.date ? new Date(msg.date) : (msg.createdAt ? new Date(msg.createdAt) : new Date())
      }
    })

    // Sort messages by timestamp
    const newMessages = chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const newMessageCount = newMessages.length
    
    // Check if new messages arrived
    const hasNewMessages = newMessageCount > lastMessageCount.value
    
    // Update messages
    messages.value = newMessages
    
    // Auto-scroll to bottom if new messages arrived
    if (hasNewMessages) {
      await nextTick()
      scrollToBottom()
    }
    
    // Update message count tracking
    lastMessageCount.value = newMessageCount
  } catch (error: any) {
    console.error('Failed to load messages:', error)
  console.error(error)
  nuxtApp.$toast.show(error, 'error')
  }
}

const sendMessage = async () => {
  console.log('Sending message:', messageText.value)
  if (!messageText.value.trim()) return

  useNuxtApp().$sp.testing.send_message({
    model_id: selectedModel.value?.id as string,
    fan: currentFan.value?.id as string,
    content: messageText.value.trim() || undefined || '',
  }).catch(err => {
    useNuxtApp().$toast.show(err, 'error')
  })
  
  // Clear input
  messageText.value = ''
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  await refreshMessages(useNuxtApp());
}

const handleShiftEnter = (event: KeyboardEvent) => {
  const target = event.target as HTMLTextAreaElement
  if (target) {
    target.value += '\n'
  }
}

const autoResize = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const goBack = () => {
  router.push('/models')
}

// User activity tracking functions - using shared utility
const updateActivity = activityTracker.updateActivity
const checkUserActivity = activityTracker.checkUserActivity

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const handlePanelWidthChange = (width: number) => {
  // Store the panel width if needed for future features
  // For now, we just acknowledge the width change
  console.log('Panel width changed to:', width)
}

const startMessagePolling = (nuxtApp: NuxtApp) => {
  if (messagePollingInterval.value) {
    clearInterval(messagePollingInterval.value)
  }
  fetchNewMessages(nuxtApp);
  messagePollingInterval.value = setInterval(async () => {
    // Only fetch messages if user is active
    if (activityTracker.isUserActive.value && selectedModel.value && currentFan.value) {
      await fetchNewMessages(nuxtApp)
    }
    
    // Check if user is still active
    activityTracker.checkUserActivity()
  }, 3000) // Every 3 seconds
}

const stopMessagePolling = () => {
  if (messagePollingInterval.value) {
    clearInterval(messagePollingInterval.value)
    messagePollingInterval.value = null
  }
}


// Alias for polling
const fetchNewMessages = refreshMessages

const setupActivityListeners = (nuxtApp: NuxtApp) => {
  // Get the base cleanup function from activity tracker
  const baseCleanup = activityTracker.setupActivityListeners()
  
  // Track window focus - restart message polling
  const handleFocus = () => {
    activityTracker.updateActivity()
    startMessagePolling(nuxtApp)
  }
  
  // Track window blur - stop message polling
  const handleBlur = () => {
    activityTracker.isUserActive.value = false
    stopMessagePolling()
  }
  
  // Add additional event listeners specific to chat
  window.addEventListener('focus', handleFocus)
  window.addEventListener('blur', handleBlur)
  
  // Combined cleanup function
  return () => {
    baseCleanup() // Clean up base activity listeners
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('blur', handleBlur)
    stopMessagePolling()
  }
}

// Watch for fanId changes and reload the page
watch(fanId, (newFanId, oldFanId) => {
  if (oldFanId && newFanId && newFanId !== oldFanId) {
    // Reload the page when fanId changes
    window.location.reload()
  }
})

// Watch for typing indicator and auto-scroll to show it
watch(isTyping, (newIsTyping) => {
  if (newIsTyping) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

onMounted(() => {
  const nuxtApp = useNuxtApp()
  
  // Initialize chat if modelId is present
  if (modelId.value) {
    initializeChat(nuxtApp)
  }
  
  // Auto-focus message input
  nextTick(() => {
    messageInput.value?.focus()
  })
  
  // Set up activity tracking and message polling
  const cleanup = setupActivityListeners(nuxtApp)
  
  // Widget communication with parent window (for embedded iframe)
  const isEmbedded = window.self !== window.top
  
  if (isEmbedded) {
    // Notify parent that widget is ready
    window.parent.postMessage({
      type: 'widget-ready',
      data: { timestamp: Date.now() }
    }, '*')
    
    // Listen for messages from parent
    const handleParentMessage = (event: MessageEvent) => {
      const { type, data } = event.data || {}
      
      switch (type) {
        case 'widget-show':
          // Handle show command from parent
          break
        case 'widget-hide':
          // Handle hide command from parent
          break
        case 'widget-config':
          // Handle configuration updates
          if (data?.apiToken) {
            // Update API token if provided
            console.log('Received API token update')
          }
          break
      }
    }
    
    window.addEventListener('message', handleParentMessage)
    
    // Cleanup message listener
    onUnmounted(() => {
      window.removeEventListener('message', handleParentMessage)
    })
  }
  
  // Store cleanup function for onUnmounted
  onUnmounted(cleanup)
})
</script>

<style lang="scss">
// Import widget-specific minimal CSS
@import '~/assets/widget.scss';
</style>
