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
      <div class="messages-container" ref="messagesContainer" @scroll="handleScroll">
        <!-- Loading More Messages Indicator -->
        <div v-if="isLoadingMoreMessages" class="loading-more-indicator">
          <div class="spinner-small"></div>
          <span>Loading older messages...</span>
        </div>
        
        <div v-for="message in messages" :key="message.id" class="message-wrapper">
          <!-- Regular chat message -->
          <div v-if="message.type !== 'tool-trace'" :class="['message', getMessageClass(message.type)]">
            <div class="message-header">
              <span class="sender-name">{{ getSenderName(message.type) }}</span>
              <span class="message-time">&nbsp;&nbsp;{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-content" v-html="renderMarkdown((message as ChatMessage).content || '')"></div>
          </div>
          
          <!-- Tool trace message -->
          <div v-else class="tool-trace-message">
            <div class="tool-trace-header">
              <div class="tool-trace-info">
                <span class="tool-trace-icon">🛠️</span>
                <span class="tool-trace-name">{{ getToolName(message as ToolTraceMessage) }}</span>
                <span class="tool-trace-status" :class="getToolTraceStatusClass(message as ToolTraceMessage)">
                  {{ getToolTraceStatus(message as ToolTraceMessage) }}
                </span>
              </div>
              <div class="tool-trace-actions">
                <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                <button 
                  class="tool-trace-details-btn" 
                  @click="showToolTraceDetails(message as ToolTraceMessage)"
                >
                  Details
                </button>
              </div>
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

    <!-- Tool Trace Details Popup -->
    <AppPopup
      :show="showToolTracePopup"
      title="Tool Trace Details"
      size="lg"
      @close="closeToolTracePopup"
    >
      <div v-if="selectedToolTrace" class="tool-trace-popup-content">
        <div class="tool-trace-detail-section">
          <h4>Tool Information</h4>
          <div class="tool-trace-detail-item">
            <strong>Tool Name:</strong> {{ getToolName(selectedToolTrace) }}
          </div>
          <div class="tool-trace-detail-item">
            <strong>Status:</strong> 
            <span :class="getToolTraceStatusClass(selectedToolTrace)">
              {{ getToolTraceStatus(selectedToolTrace) }}
            </span>
          </div>
          <div class="tool-trace-detail-item">
            <strong>Executed At:</strong> {{ formatTime(selectedToolTrace.createdAt) }}
          </div>
        </div>

        <div v-if="selectedToolTrace.toolInput" class="tool-trace-detail-section">
          <h4>Input</h4>
          <pre class="tool-trace-code">{{ selectedToolTrace.toolInput }}</pre>
        </div>

        <div v-if="selectedToolTrace.toolResult" class="tool-trace-detail-section">
          <h4>Output</h4>
          <pre class="tool-trace-code">{{ selectedToolTrace.toolResult }}</pre>
        </div>

        <div v-if="selectedToolTrace.toolError" class="tool-trace-detail-section">
          <h4>Error</h4>
          <pre class="tool-trace-code error">{{ selectedToolTrace.toolError }}</pre>
        </div>
      </div>
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import { NuxtApp } from 'nuxt/app'
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Message } from '~/eicrud_exports/services/SUPPORT-ms/message/message.entity'
import { ToolTrace } from '~/eicrud_exports/services/SUPPORT-ms/tool-trace/tool-trace.entity'
import { useRecaptcha } from '~/composables/useRecaptcha'
import { useMarkdown } from '~/composables/useMarkdown'

type ChatMessage = Partial<Message>;
type ToolTraceMessage = Partial<ToolTrace> & { type: 'tool-trace' };
type ChatItem = ChatMessage | ToolTraceMessage;

// State
const isLoading = ref(true)
const messages = ref<ChatItem[]>([])
const messageText = ref('')
const isTyping = ref(false)

const socket = ref<WebSocket | null>(null)

// Tool trace state
const toolTraces = ref<ToolTraceMessage[]>([])
const showToolTracePopup = ref(false)
const selectedToolTrace = ref<ToolTraceMessage | null>(null)

// Admin sidebar state
const showSidebar = ref(false)

// Message count tracking for training data reload optimization
const lastMessageCount = ref(0)

// Pagination state for message loading
const messageOffset = ref(0)
const toolTraceOffset = ref(0)
const messagesPerPage = 20
const isLoadingMoreMessages = ref(false)
const hasMoreMessages = ref(true)

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
const isNewGuest = ref(false) // Track if this is a new guest

// Composables
const { getRecaptchaToken } = useRecaptcha()
const { renderMarkdown, highlightCodeBlocks } = useMarkdown()

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
  isLoading.value = true

  try {
    // Reset pagination state
    messageOffset.value = 0
    toolTraceOffset.value = 0
    hasMoreMessages.value = true
    isLoadingMoreMessages.value = false
    
    // Load initial messages
    await refreshMessages(nuxtApp, messagesPerPage)
    
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
const refreshMessages = async (nuxtApp: NuxtApp, limit?: number, append: boolean = false) => {
  // Use client identifier from variable
  if (!clientIdentifier.value) {
    return;
  }
  
  try {
    const effectiveLimit = limit || messagesPerPage
    const currentMessageOffset = append ? messageOffset.value : 0
    const currentToolTraceOffset = append ? toolTraceOffset.value : 0

    console.log(`Fetching messages from server... offset: ${currentMessageOffset}, limit: ${effectiveLimit}`);

    const res = await nuxtApp.$sp.message.get_client_messagesL({
      identifier: clientIdentifier.value,
      apiKey: widgetConfig.value.apiToken || '',
      inverted: isInvertedMode.value
    },
    {
      orderBy: { createdAt: 'desc' }, // Get newest first, then reverse
      limit: effectiveLimit,
      offset: currentMessageOffset
    });
    
    const rawMessages = res?.data || []
    console.log(`Fetched ${rawMessages.length} messages from server.`);
    
    // Check if we got fewer messages than requested (no more messages)
    if (rawMessages.length < effectiveLimit) {
      hasMoreMessages.value = false
    }
    
    // Fetch tool traces if in inverted mode
    let toolTraceMessages: ToolTraceMessage[] = []
    if (isInvertedMode.value) {
      toolTraceMessages = await fetchToolTraces(nuxtApp, effectiveLimit, currentToolTraceOffset)
    }
    
    // For initial loads, preserve temp messages; for append, just add to existing
    const baseMessages = messages.value.filter(msg => msg.id?.startsWith('temp-'))

    // Combine all messages and sort by date
    let allMessages = [...baseMessages, ...rawMessages, ...toolTraceMessages].sort((a: any, b: any) => 
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    )

    //Make unique
    const existingIds = new Set(allMessages.map(msg => msg.id))
    allMessages = allMessages.filter((msg: any) => !existingIds.has(msg.id))

    const newMessageCount = allMessages.length
    const hasNewMessages = newMessageCount > lastMessageCount.value
    
    // Update messages and offset
    messages.value = allMessages
    messageOffset.value = allMessages.filter(msg => msg.type != 'tool-trace').length
    toolTraceOffset.value = allMessages.filter(msg => msg.type === 'tool-trace').length

    // Only scroll to bottom for initial loads/refreshes, not appends
    if (!append && hasNewMessages) {
      await nextTick()
      scrollToBottom()
    }
    
    // Update tracking and trigger panel refresh (initial loads only)
    lastMessageCount.value = newMessageCount
    
    if (hasNewMessages && trainingDataPanel.value) {
      await trainingDataPanel.value.refreshData()
    }
    
    // Cache messages in sessionStorage
    const cacheKey = `${cachePrefix}chat-messages-${clientIdentifier.value}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(allMessages));
  
    
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
      highlightCodeBlocks()
    })
  }
  
}

// Add mock tool traces for testing
const addMockToolTraces = (messages: any[]) => {
  const mockTraces: ToolTraceMessage[] = [
    {
      id: 'mock-trace-1',
      type: 'tool-trace',
      toolName: 'web_search',
      toolInput: JSON.stringify({
        query: 'latest cryptocurrency prices',
        max_results: 5
      }, null, 2),
      toolResult: JSON.stringify({
        results: [
          { title: 'Bitcoin Price Today', url: 'https://example.com/btc', snippet: 'Bitcoin is trading at $45,000...' },
          { title: 'Ethereum Latest News', url: 'https://example.com/eth', snippet: 'Ethereum shows strong momentum...' }
        ]
      }, null, 2),
      createdAt: new Date(Date.now() - 5000),
      updatedAt: new Date(Date.now() - 5000)
    },
    {
      id: 'mock-trace-2',
      type: 'tool-trace',
      toolName: 'calculate',
      toolInput: JSON.stringify({
        expression: '(45000 * 0.1) + 2500',
        precision: 2
      }, null, 2),
      toolResult: JSON.stringify({
        result: 7000,
        formatted: '$7,000.00'
      }, null, 2),
      createdAt: new Date(Date.now() - 3000),
      updatedAt: new Date(Date.now() - 3000)
    },
    {
      id: 'mock-trace-3',
      type: 'tool-trace',
      toolName: 'send_email',
      toolInput: JSON.stringify({
        to: 'user@example.com',
        subject: 'Investment Summary',
        body: 'Here is your portfolio update...'
      }, null, 2),
      toolError: 'Failed to send email: SMTP server connection timeout',
      createdAt: new Date(Date.now() - 1000),
      updatedAt: new Date(Date.now() - 1000)
    }
  ]
  
  // Add mock traces to messages
  //essages.push(...mockTraces)
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
    // Prepare message data
    const messageData: any = {
      identifier: identifier,
      content: messageContent,
      apiKey: widgetConfig.value.apiToken || '',
      inverted: isInvertedMode.value
    }

    // If this is a new guest's first message, get reCAPTCHA token
    if (isNewGuest.value) {
      const recaptchaToken = await getRecaptchaToken('guest_creation')
      if (recaptchaToken) {
        messageData.recaptchaToken = recaptchaToken
      }
      // Mark guest as no longer new after first message
      isNewGuest.value = false
    }

    await useNuxtApp().$sp.message.send_client_message(messageData)

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
  highlightCodeBlocks()
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

// Load more messages when scrolling near the top
const loadMoreMessages = async () => {
  if (isLoadingMoreMessages.value || !hasMoreMessages.value || !clientIdentifier.value) {
    return
  }
  
  isLoadingMoreMessages.value = true
  
  try {
    // Store current scroll position and height to maintain position after loading
    const container = messagesContainer.value
    if (!container) return
    
    const oldScrollHeight = container.scrollHeight
    const oldScrollTop = container.scrollTop
    
    const nuxtApp = useNuxtApp()
    await refreshMessages(nuxtApp, messagesPerPage, true) // append = true
    
    // Restore scroll position relative to new content
    await nextTick()
    if (container.scrollHeight > oldScrollHeight) {
      const newScrollHeight = container.scrollHeight
      const scrollDiff = newScrollHeight - oldScrollHeight
      container.scrollTop = oldScrollTop + scrollDiff
    }
    
  } catch (error) {
    console.error('Failed to load more messages:', error)
  } finally {
    isLoadingMoreMessages.value = false
  }
}

// Handle scroll events for pagination
const handleScroll = () => {
  if (!messagesContainer.value || isLoadingMoreMessages.value || !hasMoreMessages.value) {
    return
  }
  
  const container = messagesContainer.value
  const scrollThreshold = 100 // Load more when within 100px of top
  
  if (container.scrollTop <= scrollThreshold) {
    loadMoreMessages()
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

// Tool trace helper functions
const getToolName = (trace: ToolTraceMessage): string => {
  return trace.toolName || 'Unknown Tool'
}

const getToolTraceStatus = (trace: ToolTraceMessage): string => {
  if (trace.toolError) return 'Error'
  if (trace.toolResult) return 'Success'
  return 'Unknown'
}

const getToolTraceStatusClass = (trace: ToolTraceMessage): string => {
  if (trace.toolError) return 'status-error'
  if (trace.toolResult) return 'status-success'
  return 'status-unknown'
}

const showToolTraceDetails = (trace: ToolTraceMessage) => {
  selectedToolTrace.value = trace
  showToolTracePopup.value = true
}

const closeToolTracePopup = () => {
  showToolTracePopup.value = false
  selectedToolTrace.value = null
}

// Fetch tool traces for inverted mode
const fetchToolTraces = async (nuxtApp: NuxtApp, limit?: number, offset?: number): Promise<ToolTraceMessage[]> => {
  if (!isInvertedMode.value || !clientIdentifier.value || !widgetConfig.value.apiToken) {
    return []
  }

  try {
    console.log(`Fetching tool traces from server... offset: ${offset || 0}, limit: ${limit || 'unlimited'}`)
    const res = await nuxtApp.$sp.toolTrace.find({
      client: clientIdentifier.value,
      product: widgetConfig.value.apiToken
    }, {
      orderBy: { createdAt: 'desc' },
      limit: limit || undefined,
      offset: offset || undefined
    })

    const rawTraces = res?.data || []
    console.log(`Fetched ${rawTraces.length} tool traces from server.`)

    // Convert to ToolTraceMessage format
    const traceMessages: ToolTraceMessage[] = rawTraces.map(trace => ({
      ...trace,
      type: 'tool-trace' as const
    }))

    // Only add mock traces for initial load (no offset)
    if (!offset) {
      addMockToolTraces(traceMessages)
    }

    return traceMessages
  } catch (error) {
    console.error('Failed to load tool traces:', error)
    return []
  }
}

// Markdown rendering is now handled by the useMarkdown composable

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
            // Refresh messages when server tells us to (just get latest, don't append)
            await refreshMessages(nuxtApp, 9)
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
  highlightCodeBlocks()
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
  highlightCodeBlocks()
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
          console.log('User token received')
          if (token) {
            clientIdentifier.value = "user_" + token
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
.spinner-small { width:16px; height:16px; border:2px solid #f3f3f3; border-top:2px solid var(--primary-color, #667eea); border-radius:50%; animation:spin 1s linear infinite; }
@keyframes spin { 0% {transform:rotate(0deg);} 100% {transform:rotate(360deg);} }

.loading-more-indicator { display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.75rem; color:#666; font-size:0.875rem; margin-bottom:1rem; }
.dark-mode .loading-more-indicator { color:#ccc; }

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

/* Tool Trace Styles */
.tool-trace-message {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 0.75rem;
  max-width: 90%;
  align-self: flex-end;
}

.dark-mode .tool-trace-message {
  background: #2a2a31;
  border-color: #3a3a42;
}

.tool-trace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tool-trace-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.tool-trace-icon {
  font-size: 1.2rem;
}

.tool-trace-name {
  font-weight: 600;
  color: #495057;
}

.dark-mode .tool-trace-name {
  color: #e9ecef;
}

.tool-trace-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.dark-mode .status-success {
  background: #155724;
  color: #d4edda;
  border-color: #0f4419;
}

.dark-mode .status-error {
  background: #721c24;
  color: #f8d7da;
  border-color: #5a161c;
}

.dark-mode .status-unknown {
  background: #495057;
  color: #e9ecef;
  border-color: #3a3a42;
}

.tool-trace-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tool-trace-details-btn {
  background: var(--primary-color, #667eea);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tool-trace-details-btn:hover {
  background: var(--primary-color-hover, #5a6fd8);
}

/* Tool Trace Popup Styles */
.tool-trace-popup-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tool-trace-detail-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

.dark-mode .tool-trace-detail-section {
  border-color: #3a3a42;
  background: #2a2a31;
}

.tool-trace-detail-section h4 {
  margin: 0 0 1rem 0;
  color: var(--primary-color, #667eea);
  font-size: 1rem;
  font-weight: 600;
}

.tool-trace-detail-item {
  margin-bottom: 0.75rem;
}

.tool-trace-detail-item:last-child {
  margin-bottom: 0;
}

.tool-trace-detail-item strong {
  color: #495057;
  margin-right: 0.5rem;
}

.dark-mode .tool-trace-detail-item strong {
  color: #e9ecef;
}

.tool-trace-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.dark-mode .tool-trace-code {
  background: #1e1e22;
  border-color: #3a3a42;
  color: #e9ecef;
}

.tool-trace-code.error {
  background: #fff5f5;
  border-color: #fed7d7;
  color: #c53030;
}

.dark-mode .tool-trace-code.error {
  background: #2d1b1b;
  border-color: #742a2a;
  color: #fed7d7;
}

.grecaptcha-badge { 
    visibility: hidden !important;
}
</style>