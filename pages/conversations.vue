<template>
  <section class="page-container conversations-page">
    <header class="page-header">
      <div class="page-title">
        <h1>Conversations</h1>
      </div>
    </header>

    <div class="content-section">
      <!-- <div class="section-header">
        <h2>Customer Conversations</h2>
        <p class="section-description">Monitor and manage all customer chat interactions</p>
      </div> -->

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-bar">
          <AppIcon name="search" size="sm" class="search-icon" />
          <input 
            type="text" 
            placeholder="Search conversations..."
            v-model="searchQuery"
            class="search-input"
          />
        </div>
        <div class="filter-buttons">
          <AppButton
            :label="'All (' + totalConversations + ')'"
            :color="activeFilter === 'all' ? 'primary' : 'secondary'"
            size="sm"
            @click="setFilter('all')"
          />
          <AppButton
            :label="'Unread (' + unreadConversations + ')'"
            :color="activeFilter === 'unread' ? 'primary' : 'secondary'"
            size="sm"
            @click="setFilter('unread')"
          />
          <AppButton
            :label="'Active (' + activeConversations + ')'"
            :color="activeFilter === 'active' ? 'primary' : 'secondary'"
            size="sm"
            @click="setFilter('active')"
          />
          <AppButton
            :label="'Resolved (' + resolvedConversations + ')'"
            :color="activeFilter === 'resolved' ? 'primary' : 'secondary'"
            size="sm"
            @click="setFilter('resolved')"
          />
          <AppButton
            :label="'AI Off (' + aiOffConversations + ')'"
            :color="activeFilter === 'ai-off' ? 'warning' : 'secondary'"
            size="sm"
            @click="setFilter('ai-off')"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading conversations...</p>
      </div>

      <!-- Conversations List -->
      <div v-else-if="filteredConversations.length === 0" class="empty-state">
        <h3>No conversations found</h3>
        <p>Customer conversations will appear here when they start chatting</p>
      </div>

      <div v-else class="conversations-grid">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          class="conversation-card"
          :class="{ 
            'active': !conversation.conversationResolved, 
            'resolved': conversation.conversationResolved,
            'unread': !conversation.lastMessageReadByStaff,
            'ai-disabled': !conversation.aiOn
          }"
        >
          <!-- Unread indicator -->
          <div v-if="!conversation.lastMessageReadByStaff" class="unread-indicator"></div>
          
          <div class="conversation-header">
            <div class="customer-info">
              <h3 class="customer-name">{{ getDisplayName(conversation) }}</h3>
              <p class="conversation-id">ID: {{ conversation.id.slice(0, 8) }}</p>
            </div>
            <div class="conversation-status">
              <!-- AI Status Badge -->
              <span
                class="ai-status-badge"
                :class="{ 'ai-on': conversation.aiOn, 'ai-off': !conversation.aiOn }"
              >
                <AppIcon :name="conversation.aiOn ? 'check' : 'close'" size="sm" />
                AI {{ conversation.aiOn ? 'On' : 'Off' }}
              </span>
              
              <!-- Conversation Status Badge -->
              <span
                class="status-badge"
                :class="{ 'active': !conversation.conversationResolved, 'resolved': conversation.conversationResolved }"
              >
                <AppIcon :name="!conversation.conversationResolved ? 'time' : 'check'" size="sm" />
                {{ !conversation.conversationResolved ? 'Active' : 'Resolved' }}
              </span>
            </div>
          </div>

          <div class="conversation-preview">
            <p class="last-message">{{ getLastMessage(conversation) }}</p>
            <div class="conversation-meta">
              <span class="message-count">{{ getMessageCount(conversation) }} messages</span>
              <span class="last-activity">{{ formatDate(conversation.lastMessageDate) }}</span>
            </div>
          </div>

          <div class="conversation-actions">
            <AppButton
              label="Open Inverted Chat"
              color="primary"
              size="sm"
              @click="openInvertedChat(conversation)"
            />
            <AppButton
              v-if="!conversation.conversationResolved"
              label="Mark Resolved"
              color="secondary"
              size="sm"
              @click="markResolved(conversation)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import { Client } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'
import { Message } from '~/eicrud_exports/services/SUPPORT-ms/message/message.entity'

// State
const clients = ref<Client[]>([])
const lastMessages = ref<Record<string, Message>>({})
const isLoading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')

// Load conversations data
const loadConversations = async () => {
  try {
    isLoading.value = true
    
    // Get current user's API token for product filter
    const { $sp } = useNuxtApp()
    
    // Get the user's product ID (API key)
    const apiKey = useNuxtApp().$userProductId
    
    if (!apiKey) {
      throw new Error('User API key not found')
    }
    
    // Search for clients using the product (API key)
    const clientsResult = await $sp.client.search({
      product: apiKey,
      // Could add text search if needed: text: searchQuery.value
    })
    
    clients.value = clientsResult.data || []
    
    // Load last message for each client
    await loadLastMessages()
    
  } catch (error) {
    console.error('Failed to load conversations:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isLoading.value = false
  }
}

// Load the last message for each client
const loadLastMessages = async () => {
  const { $sp } = useNuxtApp()
  
  // Get the user's product ID (API key)
  const apiKey = useNuxtApp().$userProductId
  
  if (!apiKey) return
  
  const messages: Record<string, Message> = {}
  
  // Load last message for each client
  await Promise.all(
    clients.value.map(async (client) => {
      try {
        const result = await $sp.message.get_client_messagesL({
          identifier: client.id,
          apiKey: apiKey,
          inverted: true
        }, {
          orderBy: { createdAt: 'desc' },
          limit: 1
        })
        
        if (result.data && result.data.length > 0) {
          messages[client.id] = result.data[0]!
        }
      } catch (error) {
        console.error(`Failed to load last message for client ${client.id}:`, error)
      }
    })
  )
  
  lastMessages.value = messages
}

// Computed properties
const filteredConversations = computed(() => {
  let filtered = clients.value

  // Filter by status (read/unread, resolved/active, AI on/off)
  if (activeFilter.value === 'unread') {
    filtered = filtered.filter(c => !c.lastMessageReadByStaff)
  } else if (activeFilter.value === 'active') {
    filtered = filtered.filter(c => !c.conversationResolved)
  } else if (activeFilter.value === 'resolved') {
    filtered = filtered.filter(c => c.conversationResolved)
  } else if (activeFilter.value === 'ai-off') {
    filtered = filtered.filter(c => !c.aiOn)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.id.includes(query) ||
      lastMessages.value[c.id]?.content?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalConversations = computed(() => clients.value.length)
const unreadConversations = computed(() => clients.value.filter(c => !c.lastMessageReadByStaff).length)
const activeConversations = computed(() => clients.value.filter(c => !c.conversationResolved).length)
const resolvedConversations = computed(() => clients.value.filter(c => c.conversationResolved).length)
const aiOffConversations = computed(() => clients.value.filter(c => !c.aiOn).length)

// Methods
const setFilter = (filter: string) => {
  activeFilter.value = filter
}

const openInvertedChat = async (client: Client) => {
  try {
    // Mark conversation as read when opening
    await useNuxtApp().$sp.client.patch({
      id: client.id,
      product: useNuxtApp().$userProductId
    }, {
      lastMessageReadByStaff: true
    })
    
    // Update local state
    const clientIndex = clients.value.findIndex(c => c.id === client.id)
    if (clientIndex !== -1 && clients.value[clientIndex]) {
      clients.value[clientIndex]!.lastMessageReadByStaff = true
    }
    
    // Navigate to inverted chat
    const apiKey = useNuxtApp().$userProductId
    
    if (apiKey) {
      await navigateTo(`/test-chat?inverted=true&user-token=${client.id}&api-token=${apiKey}`)
    }
    
  } catch (error) {
    console.error('Failed to open inverted chat:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

const markResolved = async (client: Client) => {
  try {
    await useNuxtApp().$sp.client.patch({
      id: client.id,
      product: client.product as string
    }, {
      conversationResolved: true
    })
    
    // Update local state
    const clientIndex = clients.value.findIndex(c => c.id === client.id)
    if (clientIndex !== -1 && clients.value[clientIndex]) {
      clients.value[clientIndex]!.conversationResolved = true
    }
    
    useNuxtApp().$toast.show('Conversation marked as resolved', 'success')
  } catch (error) {
    console.error('Failed to mark conversation as resolved:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

const formatDate = (date?: Date | string) => {
  if (!date) return 'No activity'
  
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

const getDisplayName = (client: Client) => {
  return client.name || client.email || 'Anonymous User'
}

const getLastMessage = (client: Client) => {
  const message = lastMessages.value[client.id]
  return message?.content || 'No messages yet'
}

const getMessageCount = (client: Client) => {
  return client.messageCount || 0
}

// Load data on mount
onMounted(() => {
  loadConversations()
})

// Watch search query for real-time search
watch(searchQuery, async (newQuery) => {
  if (newQuery.trim()) {
    // Could implement real-time search with API
    // For now, just filter locally
  }
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

// Uses global .page-container for sizing

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  h1 {
    margin: 0;
    color: $text;
    font-size: 2rem;
  }
}

.content-section {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 2rem;
}

.section-header {
  margin-bottom: 2rem;
  
  h2 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.5rem;
  }
  
  .section-description {
    color: $muted;
    margin: 0;
    font-size: 0.9rem;
  }
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 400px;
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $muted;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid $muted;
    border-radius: $radius;
    background: $bg;
    color: $text;
    font-size: 0.9rem;
    
    &::placeholder {
      color: $muted;
    }
    
    &:focus {
      outline: none;
      border-color: $brand;
    }
  }
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: $muted;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
  }
  
  p {
    margin: 0;
  }
}

.conversations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.conversation-card {
  background: $bg;
  border: 2px solid $muted;
  border-radius: $radius;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  
  &.active {
    border-color: $brand;
    
    .conversation-header {
      border-bottom-color: rgba($brand, 0.2);
    }
  }
  
  &.resolved {
    border-color: $brand-2;
    
    .conversation-header {
      border-bottom-color: rgba($brand-2, 0.2);
    }
  }
  
  &.unread {
    border-color: $brand;
    border-width: 3px;
  }
  
  &:not(.unread) {
    background: rgba($brand, 0.02);
  }
  
  &.ai-disabled {
    border-color: #ff6b6b;
    background: rgba(#ff6b6b, 0.02);
  }
}

.unread-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 10px;
  height: 10px;
  background: $brand;
  border-radius: 50%;
  border: 2px solid $bg;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba($muted, 0.3);
}

.customer-info {
  flex: 1;
  
  .customer-name {
    margin: 0 0 0.25rem 0;
    color: $text;
    font-size: 1.1rem;
  }
  
  .conversation-id {
    margin: 0;
    color: $muted;
    font-family: monospace;
    font-size: 0.8rem;
  }
}

.conversation-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  
  .ai-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: $radius;
    font-size: 0.75rem;
    font-weight: 600;
    
    &.ai-on {
      background: rgba($brand-2, 0.1);
      color: $brand-2;
    }
    
    &.ai-off {
      background: rgba(#ff6b6b, 0.1);
      color: #ff6b6b;
    }
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: $radius;
    font-size: 0.8rem;
    font-weight: 600;
    
    &.active {
      background: rgba($brand, 0.1);
      color: $brand;
    }
    
    &.resolved {
      background: rgba($brand-2, 0.1);
      color: $brand-2;
    }
  }
}

// Add loading spinner styles
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: $muted;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba($brand, 0.2);
    border-top: 3px solid $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.conversation-preview {
  margin-bottom: 1.5rem;
  
  .last-message {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 0.9rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .conversation-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: $muted;
  }
}

.conversation-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

// Mobile responsive
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }
  
  .conversations-grid {
    grid-template-columns: 1fr;
  }
  
  .conversation-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .conversation-actions {
    justify-content: center;
  }
}
</style>
