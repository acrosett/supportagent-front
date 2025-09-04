<template>
  <div class="test-chat-page">
    <!-- Admin Training Data Panel -->
    <TrainingDataPanel
      ref="trainingDataPanel"
      :showPanel="showSidebar"
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
const socket = ref<WebSocket | null>(null)

// Admin sidebar state
const showSidebar = ref(false)

// Message count tracking for training data reload optimization
const lastMessageCount = ref(0)

// Refs
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()
const trainingDataPanel = ref()

const initializeChat = async (nuxtApp: NuxtApp) => {
  isLoading.value = false

  try {
    // Load initial messages
    await refreshMessages(nuxtApp)
    
    // Open socket connection for real-time updates
    await openSocketConnection(nuxtApp)

  } catch (error: any) {
    console.error('Failed to initialize chat:', error)
    nuxtApp.$toast.show(error, 'error')
  } finally {
    isLoading.value = false
  }
}


// Loads messages and builds ChatMessage[]
const refreshMessages = async (nuxtApp: NuxtApp) => {
  // Get identifier from session storage
  const identifier = sessionStorage.getItem('client-identifier')
  if (!identifier) {
    return;
  }
  try {
    const res = await nuxtApp.$sp.testing.get_messages({
      identifier: identifier
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
    
    // Trigger training data panel refresh when messages are updated
    if (hasNewMessages && trainingDataPanel.value) {
      await trainingDataPanel.value.refreshData()
    }
  } catch (error: any) {
    console.error('Failed to load messages:', error)
  console.error(error)
  nuxtApp.$toast.show(error, 'error')
  }
}

const sendMessage = async () => {
  console.log('Sending message:', messageText.value)
  if (!messageText.value.trim()) return

  const identifier = sessionStorage.getItem('client-identifier')
  if (!identifier) {
    console.warn('Missing client identifier for sending message')
    return
  }

  try {
    await useNuxtApp().$sp.testing.send_message({
      identifier: identifier,
      content: messageText.value.trim(),
    })
    
    // Clear input
    messageText.value = ''
    
    // Scroll to bottom
    await nextTick()
    scrollToBottom()

    // Socket will handle message updates automatically
    // No need to manually refresh messages
    
  } catch (err) {
    useNuxtApp().$toast.show(err, 'error')
  }
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

// Socket connection management
const openSocketConnection = async (nuxtApp: NuxtApp) => {
  try {
    // Close existing socket if any
    closeSocketConnection()
    
    // Get identifier from session storage
    const identifier = sessionStorage.getItem('client-identifier')
    if (!identifier) {
      console.warn('Missing client identifier for socket connection')
      return
    }
    
    // Get socket URL from runtime config
    const config = useRuntimeConfig()
    const wsBaseUrl = config.public.socketBaseUrl || 'ws://localhost:3001'
    
    // Create WebSocket connection with only client identifier
    const wsUrl = `${wsBaseUrl}/chat-socket?identifier=${encodeURIComponent(identifier)}`
    socket.value = new WebSocket(wsUrl)
    
    socket.value.onopen = () => {
      console.log('Socket connected for identifier:', identifier)
    }
    
    socket.value.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'new_message':
            // Refresh messages when server tells us to
            await refreshMessages(nuxtApp)
            break
          case 'typing_status':
            // Update typing indicator
            isTyping.value = data.isTyping || false
            break
          case 'message_update':
            // Refresh messages for any updates
            await refreshMessages(nuxtApp)
            break
        }
      } catch (error) {
        console.error('Error parsing socket message:', error)
      }
    }
    
    socket.value.onerror = (error) => {
      console.error('Socket error:', error)
    }
    
    socket.value.onclose = () => {
      console.log('Socket disconnected')
      socket.value = null
    }
    
  } catch (error) {
    console.error('Failed to open socket connection:', error)
  }
}

const closeSocketConnection = () => {
  if (socket.value) {
    socket.value.close()
    socket.value = null
  }
}

// Setup activity listeners for socket management
const setupActivityListeners = (nuxtApp: NuxtApp) => {
  // Get the base cleanup function from activity tracker
  const baseCleanup = activityTracker.setupActivityListeners()
  
  // Track window focus - ensure socket is connected
  const handleFocus = () => {
    activityTracker.updateActivity()
    const identifier = sessionStorage.getItem('client-identifier')
    if (!socket.value && identifier) {
      openSocketConnection(nuxtApp)
    }
  }
  
  // Track window blur - keep socket alive but update activity
  const handleBlur = () => {
    activityTracker.isUserActive.value = false
  }
  
  // Add additional event listeners specific to chat
  window.addEventListener('focus', handleFocus)
  window.addEventListener('blur', handleBlur)
  
  // Combined cleanup function
  return () => {
    baseCleanup() // Clean up base activity listeners
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('blur', handleBlur)
    closeSocketConnection() // Close socket on cleanup
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
      const { type, data, guestId, isNew, visible, token } = event.data || {}
      
      switch (type) {
        case 'widget-show':
          // Handle show command from parent
          console.log('Widget show command received')
          break
        case 'widget-hide':
          // Handle hide command from parent
          console.log('Widget hide command received')
          break
        case 'widget-visibility-changed':
          // Handle visibility change from embed.js
          console.log('Widget visibility changed:', visible)
          if (visible) {
            // Widget became visible - resume activity, ensure socket connection
            activityTracker.updateActivity()
            const identifier = sessionStorage.getItem('client-identifier')
            if (!socket.value && identifier) {
              const nuxtApp = useNuxtApp()
              openSocketConnection(nuxtApp)
            }
          } else {
            // Widget became hidden - keep socket alive but mark as inactive
            // Socket stays connected for real-time updates
            activityTracker.isUserActive.value = false
          }
          break
        case 'guest-id':
          // Handle guest ID from embed.js
          console.log('Guest ID received:', guestId, 'isNew:', isNew)
          // Store guest ID for chat functionality
          sessionStorage.setItem('client-identifier', guestId)
          if (!isNew) {
            const nuxtApp = useNuxtApp()
            initializeChat(nuxtApp)
          }
          break
        case 'api-token':
          // Handle API token from embed.js (initial setup)
          console.log('API token received:', token)
          if (token) {
            sessionStorage.setItem('client-identifier', token)
            // Initialize chat with the received token
            const nuxtApp = useNuxtApp()
            initializeChat(nuxtApp)
          }
          break
        case 'update-token':
          // Handle token update from embed.js
          console.log('Token update received:', token)
          if (token) {
            // Update authentication token
            sessionStorage.setItem('chat-api-token', token)
            // Could re-initialize chat with new token
            const nuxtApp = useNuxtApp()
            initializeChat(nuxtApp)
          }
          break
        case 'widget-config':
          // Handle configuration updates
          if (data?.apiToken) {
            // Update API token if provided
            console.log('Received API token update via config')
            sessionStorage.setItem('chat-api-token', data.apiToken)
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
