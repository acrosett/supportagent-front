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
            <div class="avatar-placeholder">SA</div>
          </div>
          <div class="model-details">
            <h1>Support Agent</h1>
            <p class="chat-subtitle">Chat Support</p>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-container" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" class="message-wrapper">
          <div :class="['message', message.type === 'user' ? 'message-fan' : 'message-model']">
            <!-- Message Header -->
            <div class="message-header">
              <span class="sender-name">
                {{ message.type === 'user' ? 'You' : 'Support Agent' }}
              </span>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>

            <!-- Message Content -->
            <div class="message-content">
              <p v-if="message.content">{{ message.content }}</p>
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
          <span class="typing-text">Support agent is thinking...</span>
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
import { Message } from '~/eicrud_exports/services/SUPPORT-ms/message/message.entity'

definePageMeta({ 
  layout: 'bare',
  mode: 'spa', // Force SPA mode for this route
  ssr: false, // Disable server-side rendering
  prerender: false, // Disable prerendering
  // Exclude heavy plugins except essential ones
  plugins: ['sp', 'toast'] // Only load super client and toast plugins
})

interface ChatMessage extends Message {
}

// State
const isLoading = ref(true)
const messages = ref<ChatMessage[]>([])
const messageText = ref('')
const isTyping = ref(false)

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
const refreshMessages = async (nuxtApp: NuxtApp, limit = false) => {
  // Get identifier from session storage
  const identifier = sessionStorage.getItem('client-identifier')
  if (!identifier) {
    return;
  }
  try {
    const res = await nuxtApp.$sp.message.get_client_messagesL({
      identifier: identifier,
      apiKey: sessionStorage.getItem('chat-api-token') || ''
    },
    {
      orderBy: { createdAt: 'asc' },
      limit: limit ? 10 : undefined
    });
    const rawMessages = res?.data || []

    // Sort messages by createdAt
    const newMessages = rawMessages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    
    // Merge messages based on ID to avoid duplicates
    const existingIds = new Set(messages.value.map(msg => msg.id))
    const uniqueNewMessages = newMessages.filter((msg: any) => !existingIds.has(msg.id))
    
    // Combine existing and new messages, then sort by createdAt
    const allMessages = [...messages.value, ...uniqueNewMessages].sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    const newMessageCount = allMessages.length
    
    // Check if new messages arrived
    const hasNewMessages = newMessageCount > lastMessageCount.value
    
    // Update messages
    messages.value = allMessages
    
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
    await useNuxtApp().$sp.message.send_client_message({
      identifier: identifier,
      content: messageText.value.trim(),
      apiKey: sessionStorage.getItem('chat-api-token') || ''
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
    
    // Get identifier and apikey from session storage
    const identifier = sessionStorage.getItem('client-identifier')
    const apikey = sessionStorage.getItem('chat-api-token')
    
    if (!identifier) {
      console.warn('Missing client identifier for socket connection')
      return
    }
    
    // Get socket URL from runtime config
    const config = useRuntimeConfig()
    const wsBaseUrl = config.public.socketBaseUrl || 'ws://localhost:3200'
    
    // Create WebSocket connection with identifier and apikey
    const socketData = {
      identifier: identifier,
      apikey: apikey || ''
    }
    const wsUrl = `${wsBaseUrl}/chat-socket?data=${encodeURIComponent(JSON.stringify(socketData))}`
    socket.value = new WebSocket(wsUrl)
    
    socket.value.onopen = () => {
      console.log('Socket connected with data:', socketData)
    }
    
    socket.value.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'new_message':
            // Refresh messages when server tells us to
            await refreshMessages(nuxtApp, true)
            break
          case 'thinking_start':
            // AI started thinking - show typing indicator
            isTyping.value = true
            break
          case 'thinking_stop':
            // AI stopped thinking - hide typing indicator
            isTyping.value = false
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

// Setup listeners for socket management
const setupSocketListeners = (nuxtApp: NuxtApp) => {
  // Track window focus - ensure socket is connected
  const handleFocus = () => {
    const identifier = sessionStorage.getItem('client-identifier')
    if (!socket.value && identifier) {
      openSocketConnection(nuxtApp)
    }
  }
  
  // Track window blur - socket stays connected
  const handleBlur = () => {
    // Socket stays connected for real-time updates
  }
  
  // Add event listeners for socket management
  window.addEventListener('focus', handleFocus)
  window.addEventListener('blur', handleBlur)
  
  // Cleanup function
  return () => {
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('blur', handleBlur)
    closeSocketConnection() // Close socket on cleanup
  }
}

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
  
  // Handle URL parameters for testing
  const route = useRoute()
  
  // Check for guest-id URL parameter
  if (route.query['guest-id']) {
    console.log('Guest ID from URL:', route.query['guest-id'])
    sessionStorage.setItem('client-identifier', route.query['guest-id'] as string)
  }
  
  // Check for api-token URL parameter
  if (route.query['api-token']) {
    console.log('API token from URL:', route.query['api-token'])
    sessionStorage.setItem('chat-api-token', route.query['api-token'] as string)
  }
  
  // Check for user-token URL parameter
  if (route.query['user-token']) {
    console.log('User token from URL:', route.query['user-token'])
    sessionStorage.setItem('client-identifier', route.query['user-token'] as string)
  }
  
  // Initialize chat if we have an identifier from URL params
  const identifier = sessionStorage.getItem('client-identifier')
  if (identifier && (route.query['guest-id'] || route.query['user-token'])) {
    console.log('Initializing chat from URL parameters...')
    initializeChat(nuxtApp)
  }
  
  // Set up socket listeners
  const cleanup = setupSocketListeners(nuxtApp)
  
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
            // Widget became visible - ensure socket connection
            const identifier = sessionStorage.getItem('client-identifier')
            if (!socket.value && identifier) {
              const nuxtApp = useNuxtApp()
              openSocketConnection(nuxtApp)
            }
          } else {
            // Widget became hidden - keep socket alive for real-time updates
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
        case 'user-token':
          // Handle API token from embed.js (initial setup)
          console.log('User token received:', token)
          if (token) {
            sessionStorage.setItem('client-identifier', token)
            // Initialize chat with the received token
            const nuxtApp = useNuxtApp()
            initializeChat(nuxtApp)
          }
          break
        case 'api-token':
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
@use '~/assets/widget.scss';
</style>
