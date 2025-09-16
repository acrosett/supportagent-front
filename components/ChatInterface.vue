<template>
  <div class="chat-interface" :class="{ 'dark-mode': widgetConfig.darkMode }" :style="dynamicStyles">
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
            <div class="avatar-placeholder" v-html="avatarIcon"></div>
          </div>
          <div class="model-details">
            <h1>Support Agent</h1>
            <p class="chat-subtitle">Chat Support</p>
          </div>
        </div>
        
        <!-- AI Toggle (only shown in inverted mode) -->
        <div v-if="isInvertedMode" class="ai-toggle">
          <label class="toggle-switch">
            <span class="toggle-label">Disable AI</span>
            <input 
              type="checkbox" 
              :checked="!aiEnabled" 
              @change="toggleAI"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-container" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" class="message-wrapper">
          <div :class="['message', getMessageClass(message.type)]">
            <div class="message-header">
              <span class="sender-name">{{ getSenderName(message.type) }}</span>
              <span class="message-time">&nbsp;&nbsp;{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-content" v-html="renderMarkdown(message.content || '')"></div>
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
        <div class="input-wrapper" :class="{ 'disabled': isInvertedMode && aiEnabled }">
          <textarea
            v-model="messageText"
            :placeholder="placeholderText"
            rows="1"
            ref="messageInput"
            :disabled="isInvertedMode && aiEnabled"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="handleShiftEnter"
            @input="autoResize"
          ></textarea>
          
          <div class="input-actions">
            <button 
              type="button" 
              class="send-button" 
              @click="sendMessage"
              :disabled="!messageText.trim() || (isInvertedMode && aiEnabled)"
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
import hljs from 'highlight.js'
import { marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'
import { Message } from '~/eicrud_exports/services/SUPPORT-ms/message/message.entity'

type ChatMessage = Partial<Message>;

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

// Widget configuration state
const widgetConfig = ref<any>({
  welcomeMessage: '',
  icon: 'robot',
  primaryColor: '',
  secondaryColor: '',
  apiToken: '',
  icons: null,
  darkMode: false,
  soundOn: true
})

// Client state
const clientIdentifier = ref('')
const isInvertedMode = ref(false)
const aiEnabled = ref(true)

// Refs
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()
const trainingDataPanel = ref()

// Computed properties
const avatarIcon = computed(() => {
  const cfg = widgetConfig.value
  if (cfg.icons && cfg.icons[cfg.icon]) {
    // Use provided SVG, ensure it inherits currentColor
    let svg = cfg.icons[cfg.icon] as string
    if (!/fill="currentColor"/i.test(svg)) {
      svg = svg.replace('<svg ','<svg fill="currentColor" ')
    }
    return `<span class="avatar-svg-wrapper">${svg}</span>`
  }
  // Fallback font-awesome
  const fallback: Record<string,string> = {
    robot: '<i class="fas fa-robot" style="color: white; font-size: 20px;"></i>',
    message: '<i class="fas fa-comment" style="color: white; font-size: 20px;"></i>',
    phone: '<i class="fas fa-phone" style="color: white; font-size: 20px;"></i>'
  }
  return fallback[cfg.icon] || fallback.robot
})

const dynamicStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (widgetConfig.value.primaryColor) {
    styles['--primary-color'] = widgetConfig.value.primaryColor
  }
  
  if (widgetConfig.value.secondaryColor) {
    styles['--secondary-color'] = widgetConfig.value.secondaryColor
  }
  if (widgetConfig.value.primaryColor) {
    styles['--primary-color-hover'] = shadeColor(widgetConfig.value.primaryColor, -8)
  }
  
  return styles
})

const placeholderText = computed(() => {
  if (isInvertedMode.value && aiEnabled.value) {
    return 'Disable AI to chat with client'
  }
  return 'Type your message...'
})

// Utility: lighten/darken color
function shadeColor(col: string, percent: number) {
  if(!/^#?[0-9A-Fa-f]{6}$/.test(col)) return col
  const hex = col.replace('#','')
  const num = parseInt(hex,16)
  let r = (num >> 16) & 0xFF
  let g = (num >> 8) & 0xFF
  let b = num & 0xFF
  r = Math.min(255, Math.max(0, r + Math.round(255 * (percent/100))))
  g = Math.min(255, Math.max(0, g + Math.round(255 * (percent/100))))
  b = Math.min(255, Math.max(0, b + Math.round(255 * (percent/100))))
  return '#' + ((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1)
}

const initializeChat = async (nuxtApp: NuxtApp) => {
  isLoading.value = false

  try {
    // Load initial messages
    await refreshMessages(nuxtApp)
    
    // Fetch AI status if in inverted mode
    if (isInvertedMode.value) {
      await fetchAIStatus(nuxtApp)
    }
    
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
const refreshMessages = async (nuxtApp: NuxtApp, limit?: number) => {
  // Use client identifier from variable
  if (!clientIdentifier.value) {
    return;
  }
  try {

    const cacheKey = `${cachePrefix}chat-messages-${clientIdentifier.value}`;
    const cachedMessages = limit ? null : sessionStorage.getItem(cacheKey);
    let allMessages = cachedMessages ? JSON.parse(cachedMessages) as ChatMessage[] : null;
    if (!allMessages || limit) {

      console.log('Fetching messages from server...');
      const res = await nuxtApp.$sp.message.get_client_messagesL({
        identifier: clientIdentifier.value,
        apiKey: widgetConfig.value.apiToken || '',
        inverted: isInvertedMode.value
      },
      {
        orderBy: { createdAt: 'asc' },
        limit: limit || undefined
      });
      const rawMessages = res?.data || []
      console.log(`Fetched ${rawMessages.length} messages from server.`);
      // Sort messages by createdAt
      const newMessages = rawMessages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      
      // Remove temporary messages (messages without proper server IDs)
      messages.value = messages.value.filter(msg => !msg.id?.startsWith('temp-'))
      
      // Merge messages based on ID to avoid duplicates
      const existingIds = new Set(messages.value.map(msg => msg.id))
      const uniqueNewMessages = newMessages.filter((msg: any) => !existingIds.has(msg.id))

      
      // Combine existing and new messages, then sort by createdAt
      allMessages = [...messages.value, ...uniqueNewMessages].sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

      // Cache messages in sessionStorage
      sessionStorage.setItem(cacheKey, JSON.stringify(allMessages));
    }
    
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

// Add welcome message for new users
const addWelcomeMessage = () => {
  if (widgetConfig.value.welcomeMessage && messages.value.length === 0) {
    const welcomeMessage = {
      id: 'welcome-message',
      content: widgetConfig.value.welcomeMessage,
      type: 'model' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      identifier: 'system'
    } as Partial<Message>
    
    messages.value.push(welcomeMessage)
    console.log('Added welcome message:', welcomeMessage)
    
  // Play bip sound for welcome message if enabled
  if (widgetConfig.value.soundOn) playBipSound()
    
    // Scroll to bottom to show welcome message
    nextTick(() => {
      scrollToBottom()
  highlightAllDeferred()
    })
  }
}

const sendMessage = async () => {
  console.log('Sending message:', messageText.value)
  if (!messageText.value.trim()) return

  // Initialize audio context on first user interaction
  await initAudioContext()

  let identifier = clientIdentifier.value
  
  // If no identifier exists (new guest), request it from parent
  if (!identifier && window.parent !== window) {
    // Request guest ID from parent for new user's first message
    window.parent.postMessage({ type: 'request-guest-id' }, '*')
    // Wait a moment for the response (this is not ideal but simple)
    await new Promise(resolve => setTimeout(resolve, 100))
    identifier = clientIdentifier.value
  }
  
  if (!identifier) {
    console.warn('Missing client identifier for sending message')
    return
  }

  const messageContent = messageText.value.trim()
  
  // Create temporary message and add to UI immediately
  const tempMessage = {
    id: `temp-${Date.now()}`, // Temporary ID
    content: messageContent,
    type: isInvertedMode.value ? 'ai' : 'user' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    identifier: identifier
  } as Partial<Message>
  
  // Add message to UI immediately
  messages.value.push(tempMessage)
  
  // Clear input
  messageText.value = ''
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  try {
    await useNuxtApp().$sp.message.send_client_message({
      identifier: identifier,
      content: messageContent,
      apiKey: widgetConfig.value.apiToken || '',
      inverted: isInvertedMode.value
    })

    // Update sessionStorage cache with the new message
    const cacheKey = `${cachePrefix}chat-messages-${identifier}`;
    const cachedMessages = sessionStorage.getItem(cacheKey);
    if (cachedMessages) {
      try {
        const messageList = JSON.parse(cachedMessages) as ChatMessage[];
        // Create a proper message object for cache (similar to server response)
        const cacheMessage = {
          id: tempMessage.id, // Will be updated when real message arrives via socket
          content: messageContent,
          type: isInvertedMode.value ? 'ai' : 'user' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          identifier: identifier
        } as Partial<Message>;
        
        messageList.push(cacheMessage);
        sessionStorage.setItem(cacheKey, JSON.stringify(messageList));
      } catch (cacheError) {
        console.warn('Failed to update message cache:', cacheError);
      }
    }

    // Notify parent window about user message (for guest ID storage)
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'user-message' }, '*')
    }

    // Socket will handle message updates automatically
    // The temporary message will be replaced by the real one from the server
    
  } catch (err) {
    // Remove the temporary message on error
    const tempIndex = messages.value.findIndex(msg => msg.id === tempMessage.id)
    if (tempIndex > -1) {
      messages.value.splice(tempIndex, 1)
    }
    useNuxtApp().$toast.show(err, 'error')
  }
  highlightAllDeferred()
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

const formatTime = (date?: Date | string | null) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(d)
}

const getSenderName = (messageType?: string) => {
  // Always show the same labels regardless of mode
  return messageType === 'user' ? 'Client' : 'Support Agent'
}

const getMessageClass = (messageType?: string) => {
  // Always use the same styling regardless of mode
  let cond =  messageType === 'user'
  if(isInvertedMode.value) {
    cond =!cond;
  }
  return cond ? 'message-fan' : 'message-model'
}

// --- Markdown Rendering using marked + DOMPurify ---
// Configure marked with custom renderer for code highlighting
const renderer = new Renderer()
const originalCode = renderer.code.bind(renderer)
renderer.code = (code: string, infostring: string | undefined, escaped: boolean) => {
  const lang = (infostring || '').match(/^[^\s]+/)?.[0]
  let highlighted = code
  if (lang && hljs.getLanguage(lang)) {
    try { highlighted = hljs.highlight(code, { language: lang }).value } catch {}
  } else {
    try { highlighted = hljs.highlightAuto(code).value } catch {}
  }
  return `<pre><code class="hljs language-${lang || 'plaintext'}">${highlighted}</code></pre>`
}
// Override link rendering to force new tab + security rel
const escapeAttr = (s: string) => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
renderer.link = (href: string | null, title: string | null, text: string) => {
  const safeHref = escapeAttr(href || '')
  const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}
marked.setOptions({ gfm: true, breaks: true, renderer })

function renderMarkdown(raw: string): string {
  if (!raw) return ''
  const dirty = marked.parse(raw) as string
  // Sanitize HTML output
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true }, ADD_ATTR: ['target','rel'] })
}

function highlightAllDeferred() {
  nextTick(() => {
    document.querySelectorAll('.message-content pre').forEach(pre => {
      const code = pre.querySelector('code') as HTMLElement | null
      if (code) {
        try { hljs.highlightElement(code) } catch { /* ignore */ }
      }
      // Add copy button if not present
      if (!pre.querySelector('.code-copy-btn')) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'code-copy-btn'
        btn.setAttribute('aria-label', 'Copy code to clipboard')
        btn.textContent = 'Copy'
        btn.addEventListener('click', () => {
          const raw = code?.textContent || ''
            ;(navigator.clipboard?.writeText(raw) || Promise.reject()).then(() => {
              const orig = btn.textContent
              btn.textContent = 'Copied!'
              btn.classList.add('copied')
              setTimeout(() => { btn.textContent = orig || 'Copy'; btn.classList.remove('copied') }, 1600)
            }).catch(() => {
              btn.textContent = 'Failed'
              setTimeout(() => { btn.textContent = 'Copy' }, 1600)
            })
        })
        pre.appendChild(btn)
      }
    })
  })
}

// AI management functions for inverted mode
const fetchAIStatus = async (nuxtApp: NuxtApp) => {
  if (!isInvertedMode.value || !clientIdentifier.value || !widgetConfig.value.apiToken) {
    return
  }
  
  try {
    const result = await nuxtApp.$sp.client.findOne({
      id: clientIdentifier.value,
      product: widgetConfig.value.apiToken
    })
    
    if (result) {
      aiEnabled.value = result.aiOn // Default to true if undefined
    }
  } catch (error) {
    console.error('Failed to fetch AI status:', error)
  }
}

const toggleAI = async () => {
  if (!isInvertedMode.value || !clientIdentifier.value || !widgetConfig.value.apiToken) {
    return
  }
  
  try {
    const newAIState = !aiEnabled.value
    
    await useNuxtApp().$sp.client.patch({
      id: clientIdentifier.value,
      product: widgetConfig.value.apiToken
    }, {
      aiOn: newAIState
    })
    
    aiEnabled.value = newAIState
    useNuxtApp().$toast.show(`AI ${newAIState ? 'enabled' : 'disabled'}`, 'success')
  } catch (error) {
    useNuxtApp().$toast.show(error, 'error')
    console.error('Failed to toggle AI:', error)
  }
}

// Audio context for bip sounds (created after user interaction)
let audioContext: AudioContext | null = null

// Initialize audio context after user interaction
const initAudioContext = async () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume audio context if it's suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
    } catch (error) {
      console.log('Audio context creation failed:', error)
    }
  }
}

// Play a smooth bip sound
const playBipSound = async () => {
  try {
    // Initialize audio context if needed
    await initAudioContext()
    
    if (!audioContext || audioContext.state !== 'running') {
      console.log('Audio context not available or not running')
      return
    }
    
    // Create oscillator for the bip sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configure the bip sound
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime) // 800Hz frequency
    oscillator.type = 'sine' // Smooth sine wave
    
    // Create smooth envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01) // Fade in
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15) // Fade out
    
    // Play the sound
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
    
  } catch (error) {
    console.log('Audio playback failed:', error)
  }
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
    
    // Use reactive variables instead of sessionStorage
    const identifier = clientIdentifier.value
    const apikey = widgetConfig.value.apiToken
    
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
      apikey: apikey || '',
      inverted: isInvertedMode.value
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
            await refreshMessages(nuxtApp, 10)
            // Play bip sound for new message if enabled
            if (widgetConfig.value.soundOn) playBipSound()
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
    if (!socket.value && clientIdentifier.value) {
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

// Re-highlight & ensure copy buttons whenever messages list changes
// (Removed direct messages watch; using length watcher below)
watch(() => messages.value.length, () => {
  highlightAllDeferred()
})


const cachePrefix = 'direct-support-ai-cache-'

onMounted(() => {
  const nuxtApp = useNuxtApp()
  
  // Clear session storage on page restore to avoid stale data
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      // Page was restored from bfcache or session restore
      // Clear only chat message caches, not all sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(cachePrefix)) {
          sessionStorage.removeItem(key);
        }
      });
      console.log("Chat message caches cleared on restore - avoiding stale message cache.");
    }
  });
  
  // Initial highlight attempt (preloaded messages)
  highlightAllDeferred()
  // Handle URL parameters for testing
  const route = useRoute()
  
  // Check for guest-id URL parameter
  if (route.query['guest-id']) {
    console.log('Guest ID from URL:', route.query['guest-id'])
    clientIdentifier.value = route.query['guest-id'] as string
  }
  
  // Check for api-token URL parameter
  if (route.query['api-token']) {
    console.log('API token from URL:', route.query['api-token'])
    widgetConfig.value.apiToken = route.query['api-token'] as string
  }
  
  // Check for user-token URL parameter
  if (route.query['user-token']) {
    console.log('User token from URL:', route.query['user-token'])
    clientIdentifier.value = route.query['user-token'] as string
  }
  
  // Check for inverted mode URL parameter
  if (route.query['inverted']) {
    console.log('Inverted mode from URL:', route.query['inverted'])
    isInvertedMode.value = route.query['inverted'] === 'true'
  }
  
  // Initialize chat if we have an identifier from URL params
  if (clientIdentifier.value && (route.query['guest-id'] || route.query['user-token'])) {
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
            if (!socket.value && clientIdentifier.value) {
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
          if (!isNew) {
            // Only initialize for returning guests
            clientIdentifier.value = guestId
            const nuxtApp = useNuxtApp()
            initializeChat(nuxtApp)
          } else {
            // For new guests, show welcome message if configured
            addWelcomeMessage()
          }
          // For new guests, don't store anything yet - wait for first message
          break
        case 'guest-id-for-message':
          // Handle guest ID provided specifically for sending a message
          console.log('Guest ID for message received:', guestId)
          clientIdentifier.value = guestId
          // Continue with pending message send if any
          break
        case 'user-token':
          // Handle API token from embed.js (initial setup)
          console.log('User token received:', token)
          if (token) {
            clientIdentifier.value = token
            // Initialize chat with the received token
            const nuxtApp = useNuxtApp()
            initializeChat(nuxtApp)
          }
          break
        case 'set-config':
          // Handle full configuration from embed.js
          console.log('Configuration received:', data)
          if (data?.config) {
            const config = data.config
            
            // Update widget configuration directly - much simpler!
            widgetConfig.value = config
            
            // Initialize chat if we have an API token
            if (config.apiToken) {
              const nuxtApp = useNuxtApp()
              initializeChat(nuxtApp)
            }
          }
          break
        case 'widget-config':
          // Handle configuration updates (legacy support)
          console.log('Widget config received:', data)
          if (data) {
            // Simple assignment - much better!
            widgetConfig.value = data
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
/* Inlined former widget.scss with dynamic color variables */
.chat-interface {
  --primary-color: var(--primary-color, #667eea);
  --secondary-color: var(--secondary-color, #764ba2);
  --primary-color-hover: var(--primary-color-hover, #5a6fd8);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-interface.dark-mode { 
  background: #121215; 
  color: #f5f7fa; 
}

* { margin:0; padding:0; box-sizing:border-box; }

body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; line-height:1.6; color:#333; overflow:hidden; }

.loading-state { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#666; }

.spinner { width:32px; height:32px; border:3px solid #f3f3f3; border-top:3px solid var(--primary-color, #667eea); border-radius:50%; animation:spin 1s linear infinite; margin-bottom:1rem; }
@keyframes spin { 0% {transform:rotate(0deg);} 100% {transform:rotate(360deg);} }

.chat-container { display:flex; flex-direction:column; height:100%; overflow:hidden; }
.chat-header { padding:1rem; border-bottom:1px solid #e1e5e9; background:#f8f9fa; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; }
.dark-mode .chat-header { background:#1e1e22; border-bottom-color:#2a2a31; }
.model-info { display:flex; align-items:center; gap:.75rem; }
.model-avatar { width:40px; height:40px; flex-shrink:0; }
.avatar-placeholder { width:100%; height:100%; background:linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:1.2rem; }
.model-details h1 { font-size:1.1rem; font-weight:600; margin-bottom:.25rem; }
.chat-subtitle { font-size:.875rem; color:#666; }

.messages-container { flex:1; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:1rem; }
.messages-container { scrollbar-width:thin; scrollbar-color:rgba(0,0,0,.28) transparent; }
.dark-mode .messages-container { scrollbar-color:rgba(255,255,255,.28) transparent; }
.messages-container::-webkit-scrollbar { width:8px; }
.messages-container::-webkit-scrollbar-track { background:transparent; }
.messages-container::-webkit-scrollbar-thumb { background:rgba(0,0,0,.28); border-radius:4px; }
.messages-container:hover::-webkit-scrollbar-thumb { background:rgba(0,0,0,.4); }
.dark-mode .messages-container::-webkit-scrollbar-thumb { background:rgba(255,255,255,.25); }
.dark-mode .messages-container:hover::-webkit-scrollbar-thumb { background:rgba(255,255,255,.4); }
.message-wrapper { display:flex; flex-direction:column; }
.message { max-width:80%; padding:.75rem 1rem; border-radius:18px; word-wrap:break-word; }
.message-fan { align-self:flex-end; background:var(--primary-color, #667eea); color:#fff; border-bottom-right-radius:6px; }
.message-model { align-self:flex-start; background:#f1f3f4; color:#333; border-bottom-left-radius:6px; }
.dark-mode .message-model { background:#26262b; color:#e6e8ef; }
.dark-mode .message-fan { background:var(--primary-color, #667eea); }
.message-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; font-size:.75rem; opacity:.8; }
.sender-name { font-weight:600; }
.message-time { font-size:.7rem; }
.message-content p { margin:0; line-height:1.4; }
.message-content { display:flex; flex-direction:column; gap:.5rem; }
.message-content pre { position:relative; background:#1e1e22; color:#f5f5f5; padding:.75rem 1rem; border-radius:8px; overflow:auto; font-size:.75rem; line-height:1.4; }
.message-content pre { scrollbar-width:thin; scrollbar-color:rgba(255,255,255,.25) transparent; }
.message-content pre::-webkit-scrollbar { height:8px; width:8px; }
.message-content pre::-webkit-scrollbar-track { background:transparent; }
.message-content pre::-webkit-scrollbar-thumb { background:rgba(255,255,255,.22); border-radius:4px; }
.message-content pre:hover::-webkit-scrollbar-thumb { background:rgba(255,255,255,.34); }
.dark-mode .message-content pre { scrollbar-color:rgba(255,255,255,.25) transparent; }
.message-content pre code { background:transparent; padding:0; display:block; font-family:Menlo,Consolas,monospace; }
.message-content pre .code-copy-btn { position:absolute; top:6px; right:6px; background:#2d2d33; color:#ddd; border:1px solid #3a3a42; font-size:.65rem; padding:.25rem .5rem; border-radius:4px; cursor:pointer; opacity:.85; transition:background .15s, opacity .15s; }
.message-content pre .code-copy-btn:hover { background:#3a3a42; opacity:1; }
.message-content pre .code-copy-btn.copied { background:var(--primary-color,#667eea); color:#fff; border-color:var(--primary-color,#667eea); }
.dark-mode .message-content pre { background:#111114; }
.dark-mode .message-content pre .code-copy-btn { background:#24242a; border-color:#2f2f37; }
.dark-mode .message-content pre .code-copy-btn:hover { background:#2f2f37; }

.typing-indicator { display:flex; align-items:center; gap:.5rem; align-self:flex-start; padding:.75rem 1rem; background:#f1f3f4; border-radius:18px; max-width:80%; }
.dark-mode .typing-indicator { background:#26262b; }
.typing-dots { display:flex; gap:.25rem; }
.typing-dots span { width:6px; height:6px; background:#999; border-radius:50%; animation:typing 1.4s infinite ease-in-out; }
.typing-dots span:nth-child(1){ animation-delay:-.32s; }
.typing-dots span:nth-child(2){ animation-delay:-.16s; }
@keyframes typing { 0%,80%,100% { transform:scale(.8); opacity:.5;} 40% { transform:scale(1); opacity:1; } }
.typing-text { font-size:.875rem; color:#666; font-style:italic; }

.message-input-container { padding:1rem; border-top:1px solid #e1e5e9; background:#fff; flex-shrink:0; }
.dark-mode .message-input-container { background:#1a1a1d; border-top-color:#2a2a31; }
.input-wrapper { display:flex; align-items:flex-end; gap:.5rem; background:#f8f9fa; border:1px solid #e1e5e9; border-radius:24px; padding:.5rem; }
.dark-mode .input-wrapper { background:#26262b; border-color:#2f2f37; }
.input-wrapper textarea { flex:1; background:transparent; border:none; outline:none; resize:none; padding:.5rem .75rem; font-size:.875rem; line-height:1.4; max-height:120px; font-family:inherit; }
.dark-mode .input-wrapper textarea { color:#fff; }
.input-wrapper textarea::placeholder { color:#999; }
.input-actions { display:flex; align-items:center; gap:.25rem; }
.send-button { width:36px; height:36px; background:var(--primary-color, #667eea); border:none; border-radius:50%; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background-color .2s; }
.dark-mode .send-button { background:var(--primary-color, #667eea); }
.send-button:hover:not(:disabled) { background:var(--primary-color-hover, #5a6fd8); }
.send-button:disabled { background:#ccc; cursor:not-allowed; }

/* AI Toggle Styles */
.ai-toggle { display:flex; align-items:center; }
.toggle-switch { display:flex; align-items:center; gap:.5rem; cursor:pointer; }
.toggle-label { font-size:.875rem; color:#666; font-weight:500; }
.dark-mode .toggle-label { color:#ccc; }
.toggle-switch input[type="checkbox"] { display:none; }
.slider { position:relative; width:44px; height:24px; background:#ccc; border-radius:24px; transition:background .3s; }
.slider:before { content:""; position:absolute; top:2px; left:2px; width:20px; height:20px; background:#fff; border-radius:50%; transition:transform .3s; }
.toggle-switch input:checked + .slider { background:#ffb86c; }
.toggle-switch input:checked + .slider:before { transform:translateX(20px); }

/* Disabled Input Styles */
.input-wrapper.disabled { opacity:.6; pointer-events:none; }
.input-wrapper.disabled textarea { background:#f5f5f5; color:#999; }
.dark-mode .input-wrapper.disabled textarea { background:#2a2a2a; color:#666; }

.training-data-panel { display:none !important; }

@media (max-width:320px) {
  .message { max-width:90%; padding:.5rem .75rem; }
  .chat-header { padding:.75rem; }
  .messages-container { padding:.75rem; }
}

/* SVG avatar wrapper */
.avatar-svg-wrapper { display:inline-flex; width:28px; height:28px; color:#fff; align-items:center; justify-content:center; }
.avatar-svg-wrapper svg { width:100%; height:100%; display:block; fill:currentColor; }
</style>