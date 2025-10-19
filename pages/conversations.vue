<template>
  <section class="page-container conversations-page">
    <header class="page-header">
      <div class="page-title">
        <h1>{{ t('conversations.page.title') }}</h1>
        <div class="page-actions">
          <ToggleSwitch
            v-model="showArchived"
            :label="t('conversations.filters.seeArchived')"
            label-position="left"
            @update:modelValue="handleArchivedToggle"
          />
        </div>
      </div>
    </header>

    <div class="content-section">
      <!-- <div class="section-header">
        <h2>Customer Conversations</h2>
        <p class="section-description">Monitor and manage all customer chat interactions</p>
      </div> -->

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-and-reset">
          <div class="search-bar">
            <AppIcon name="search" size="sm" class="search-icon" />
            <input 
              type="text" 
              :placeholder="t('conversations.search.placeholder')"
              v-model="searchQuery"
              class="search-input"
            />
          </div>
          
          <!-- Reset Filter -->
          <AppButton
            :label="t('conversations.filters.resetFilters')"
            color="secondary"
            size="sm"
            margin="left"
            @click="resetFilters"
          />
        </div>
        
        <div class="filter-controls">
          <!-- Filter Checkboxes -->
          <div class="filter-checkboxes">
            <!-- Read Status Column -->
            <CheckBoxColumn
              :title="t('conversations.filters.readStatus.title')"
              name="readStatus"
              v-model="filters.readStatus"
              :options="[
                { value: 'both', label: t('conversations.filters.options.both') },
                { value: 'false', label: t('conversations.filters.readStatus.unread') },
                { value: 'true', label: t('conversations.filters.readStatus.read') }
              ]"
              @change="applyFilters"
            />
            
            <!-- Conversation Status Column -->
            <CheckBoxColumn
              :title="t('conversations.filters.status.title')"
              name="resolvedStatus"
              v-model="filters.resolvedStatus"
              :options="[
                { value: 'both', label: t('conversations.filters.options.both') },
                { value: 'false', label: t('conversations.filters.status.active') },
                { value: 'true', label: t('conversations.filters.status.resolved') }
              ]"
              @change="applyFilters"
            />
            
            <!-- AI Status Column -->
            <CheckBoxColumn
              :title="t('conversations.filters.aiStatus.title')"
              name="aiStatus"
              v-model="filters.aiStatus"
              :options="[
                { value: 'both', label: t('conversations.filters.options.both') },
                { value: 'true', label: t('conversations.filters.aiStatus.on') },
                { value: 'false', label: t('conversations.filters.aiStatus.off') }
              ]"
              @change="applyFilters"
            />
            
            <!-- Priority Column -->
            <div class="filter-column">
              <h4>{{ t('conversations.filters.priority.title') }}</h4>
              <label class="checkbox-label">
                <input type="checkbox" v-model="filters.priorityLowest" @change="applyFilters" />
                <span>{{ t('conversations.filters.priority.lowest') }}</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="filters.priorityRegular" @change="applyFilters" />
                <span>{{ t('conversations.filters.priority.regular') }}</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="filters.priorityHigh" @change="applyFilters" />
                <span>{{ t('conversations.filters.priority.high') }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('conversations.status.loading') }}</p>
      </div>

      <!-- Conversations List -->
      <div v-else-if="filteredConversations.length === 0" class="empty-state">
        <h3>{{ t('conversations.empty.title') }}</h3>
        <p>{{ t('conversations.empty.description') }}</p>
      </div>

      <div v-else class="conversations-grid">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          :ref="(el) => setCardRef(el, conversation.id)"
          class="conversation-card"
          :class="{ 
            'active': !conversation.conversationResolved, 
            'resolved': conversation.conversationResolved,
            'unread': !conversation.lastMessageReadByStaff,
            'ai-disabled': !conversation.aiOn,
            'animating-out': animatingCards.has(conversation.id)
          }"
        >
          <!-- Unread indicator -->
          <div v-if="!conversation.lastMessageReadByStaff" class="unread-indicator"></div>
          
 
          
          <div class="conversation-header">
            <div class="customer-info">
              <div class="customer-name-row">
                <span class="priority-badge">{{ getPriorityEmoji(conversation.priority || ClientPriority.LOWEST) }}</span>
                <h3 class="customer-name">{{ getDisplayName(conversation) }}</h3>
              </div>
              <p class="conversation-id">{{ t('conversations.conversation.id') }}: {{ conversation.uniqueId }}</p>
            </div>
            <div class="conversation-status">
              <!-- AI Status Badge -->
              <span
                class="ai-status-badge"
                :class="{ 'ai-on': conversation.aiOn, 'ai-off': !conversation.aiOn }"
              >
                <AppIcon :name="conversation.aiOn ? 'check' : 'close'" size="sm" />
                {{ t('conversations.conversation.ai') }} {{ conversation.aiOn ? t('conversations.conversation.aiOn') : t('conversations.conversation.aiOff') }}
              </span>
              
              <!-- Conversation Status Badge -->
              <span
                class="status-badge"
                :class="{ 'active': !conversation.conversationResolved, 'resolved': conversation.conversationResolved }"
              >
                <AppIcon :name="!conversation.conversationResolved ? 'time' : 'check'" size="sm" />
                {{ !conversation.conversationResolved ? t('conversations.conversation.active') : t('conversations.conversation.resolved') }}
              </span>
            </div>
          </div>

          <div class="conversation-preview">
            <p class="last-message">{{ getLastMessage(conversation) }}</p>
            <div class="conversation-meta">
              <span class="message-count">{{ getMessageCount(conversation) }} {{ t('conversations.conversation.messages') }}</span>
              <span class="last-activity">{{ formatDate(conversation.lastMessageDate) }}</span>
            </div>
          </div>

          <div class="conversation-actions">
            <AppButton
              :label="t('conversations.actions.openChat')"
              color="primary"
              size="sm"
              @click="openInvertedChat(conversation)"
            />
            <AppButton
              v-if="!conversation.conversationArchived"
              margin="left"
              color="warning"
              size="sm"
              fa-icon-left="archive"
              @click="showArchiveConfirmation(conversation)"
            />
            <AppButton
              v-else
              margin="left"
              color="ok"
              size="sm"
              fa-icon-left="fa-solid fa-rotate-left"
              @click="unarchiveConversation(conversation)"
            />
            <AppButton
              v-if="isAdmin"
              margin="no-margins"
              color="secondary"
              size="sm"
              fa-icon-left="fa-solid fa-list"
              @click="openClientLogs(conversation)"
            />
            <AppButton
              :label="conversation.conversationResolved ? t('conversations.actions.reactivate') : t('conversations.actions.markResolved')"
              margin="no-margins"
              color="secondary"
              size="sm"
              @click="toggleResolved(conversation)"
            />
          </div>
        </div>
      </div>

      <!-- Load More Indicator -->
      <div v-if="isLoadingMore" class="loading-more">
        <div class="spinner"></div>
        <p>{{ t('conversations.status.loadingMore') }}</p>
      </div>

      <!-- End of Results Indicator -->
      <div v-else-if="!hasMoreData && clients.length > 0" class="end-of-results">
        <p>{{ t('conversations.status.noMoreConversations') }}</p>
      </div>
    </div>
    
    <!-- Archive Confirmation Popup -->
    <AppPopup
      :show="archiveConfirmation.show"
      :title="t('conversations.archive.title')"
      @close="cancelArchive"
    >
      <p>{{ t('conversations.archive.confirmMessage') }}</p>
      
      <div class="popup-actions">
        <AppButton
          :label="t('conversations.archive.cancel')"
          color="secondary"
          @click="cancelArchive"
        />
        <AppButton
          :label="t('conversations.archive.confirm')"
          color="warning"
          margin="left"
          @click="confirmArchive"
        />
      </div>
    </AppPopup>
    
    <!-- LLM Logs Popup -->
    <LlmLogsPopup
      :show="showLogsPopup"
      :title="logsPopupTitle"
      :context-id="logsContextId"
      @close="closeLogsPopup"
    />
  </section>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'
import CheckBoxColumn from '~/components/CheckBoxColumn.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'
import LlmLogsPopup from '~/components/LlmLogsPopup.vue'
import { Client, ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'
import { Message } from '~/eicrud_exports/services/SUPPORT-ms/message/message.entity'
import { getPriorityEmoji } from '~/utils/priority'

const { t } = useI18n()

// State
const clients = ref<Client[]>([])
const lastMessages = ref<Record<string, Message>>({})
const isLoading = ref(true)
const isLoadingMore = ref(false)
const searchQuery = ref('')
const hasMoreData = ref(true)
const currentPage = ref(0)
const pageSize = 20
const cardRefs = ref<Map<string, HTMLElement>>(new Map())
const visibleCards = ref<Set<string>>(new Set())
const observer = ref<IntersectionObserver | null>(null)

// Filter state
const filters = ref({
  readStatus: 'both',      // 'true' = read only, 'false' = unread only, 'both' = all
  resolvedStatus: 'both',  // 'true' = resolved only, 'false' = active only, 'both' = all
  aiStatus: 'both',        // 'true' = ai on only, 'false' = ai off only, 'both' = all
  priorityLowest: false,
  priorityRegular: false,
  priorityHigh: false
})

// Archive state
const showArchived = ref(false)
const animatingCards = ref<Set<string>>(new Set())
const archiveConfirmation = ref<{
  show: boolean
  client: Client | null
}>({
  show: false,
  client: null
})

// Admin state
const isAdmin = ref(false)

// Logs state
const showLogsPopup = ref(false)
const logsPopupTitle = ref('')
const logsContextId = ref('')

// Load conversations data
const loadConversations = async (reset = true) => {
  try {
    if (reset) {
      isLoading.value = true
      currentPage.value = 0
      hasMoreData.value = true
    } else {
      isLoadingMore.value = true
    }
    
    // Get current user's API token for product filter
    const { $sp } = useNuxtApp()
    
    // Get the user's product ID (API key)
    const apiKey = useNuxtApp().$userProductId
    
    if (!apiKey) {
      throw new Error(t('conversations.messages.error.missingApiKey'))
    }
    
    // Build search parameters based on filters
    const searchParams: any = {
      product: apiKey,
      text: searchQuery.value || undefined
    }
    
    // Add filter parameters using new DTO structure
    if (filters.value.readStatus !== 'both') {
      searchParams.readStatus = filters.value.readStatus
    }
    
    if (filters.value.resolvedStatus !== 'both') {
      searchParams.resolvedStatus = filters.value.resolvedStatus
    }
    
    if (filters.value.aiStatus !== 'both') {
      searchParams.aiStatus = filters.value.aiStatus
    }
    
    // Add archived status filter
    searchParams.archivedStatus = showArchived.value ? 'true' : 'false'
    
    // Add priority filters if any are selected
    const selectedPriorities: ClientPriority[] = []
    if (filters.value.priorityLowest) selectedPriorities.push(ClientPriority.LOWEST)
    if (filters.value.priorityRegular) selectedPriorities.push(ClientPriority.REGULAR)
    if (filters.value.priorityHigh) selectedPriorities.push(ClientPriority.HIGH)
    
    if (selectedPriorities.length > 0) {
      searchParams.priorities = selectedPriorities
    }
    
    // Setup pagination options
    const options: any = {
      limit: pageSize,
      offset: reset ? 0 : currentPage.value * pageSize,
      orderBy: {
        lastMessageDate: 'desc'
      }
    }
    
    // Search for clients using the search API
    const clientsResult = await $sp.client.search(searchParams, options)
    
    const newClients = clientsResult.data || []
    
    if (reset) {
      clients.value = newClients
    } else {
      clients.value = [...clients.value, ...newClients]
    }
    
    // Check if there's more data
    hasMoreData.value = newClients.length === pageSize
    
    // Increment page for next load
    if (!reset) {
      currentPage.value++
    }
    
    // Don't load last messages immediately - let intersection observer handle it
    
  } catch (error) {
    console.error('Failed to load conversations:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Load the last message for a specific client
const loadLastMessage = async (clientId: string) => {
  if (lastMessages.value[clientId]) {
    return // Already loaded
  }
  
  const { $sp } = useNuxtApp()
  
  // Get the user's product ID (API key)
  const apiKey = useNuxtApp().$userProductId
  
  if (!apiKey) return
  
  try {
    const result = await $sp.message.get_client_messagesL({
      identifier: clientId,
      apiKey: apiKey,
      inverted: true
    }, {
      orderBy: { createdAt: 'desc' },
      limit: 1
    })
    
    if (result.data && result.data.length > 0) {
      lastMessages.value[clientId] = result.data[0]!
    }
  } catch (error) {
    console.error(`Failed to load last message for client ${clientId}:`, error)
  }
}

// Load the last message for each client (fallback for non-intersection observer browsers)
const loadLastMessages = async (clientsToLoad?: Client[]) => {
  const { $sp } = useNuxtApp()
  
  // Get the user's product ID (API key)
  const apiKey = useNuxtApp().$userProductId
  
  if (!apiKey) return
  
  const targetClients = clientsToLoad || clients.value
  const messages: Record<string, Message> = { ...lastMessages.value }
  
  // Load last message for each client
  await Promise.all(
    targetClients.map(async (client) => {
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

// Set card ref and setup intersection observer
const setCardRef = (el: Element | ComponentPublicInstance | null, cardId: string) => {
  if (el && el instanceof HTMLElement) {
    cardRefs.value.set(cardId, el)
    
    // Observe the card for visibility
    if (observer.value) {
      observer.value.observe(el)
    }
  }
}

// Setup intersection observer
const setupIntersectionObserver = () => {
  if (typeof window === 'undefined') return
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardElement = entry.target as HTMLElement
          const cardId = Array.from(cardRefs.value.entries()).find(
            ([, element]) => element === cardElement
          )?.[0]
          
          if (cardId && !visibleCards.value.has(cardId)) {
            visibleCards.value.add(cardId)
            loadLastMessage(cardId)
          }
        }
      })
    },
    {
      rootMargin: '50px', // Start loading 50px before the card comes into view
      threshold: 0.1 // Trigger when 10% of the card is visible
    }
  )
}

// Computed properties
const filteredConversations = computed(() => {
  let filtered = clients.value

  // Apply filters locally (basic client-side filtering for UI responsiveness)
  // The main filtering is done server-side in loadConversations()
  
  // Read status filters
  if (filters.value.readStatus !== 'both') {
    if (filters.value.readStatus === 'false') {
      filtered = filtered.filter(c => !c.lastMessageReadByStaff)
    } else if (filters.value.readStatus === 'true') {
      filtered = filtered.filter(c => c.lastMessageReadByStaff)
    }
  }
  
  // Conversation status filters
  if (filters.value.resolvedStatus !== 'both') {
    if (filters.value.resolvedStatus === 'false') {
      filtered = filtered.filter(c => !c.conversationResolved)
    } else if (filters.value.resolvedStatus === 'true') {
      filtered = filtered.filter(c => c.conversationResolved)
    }
  }
  
  // AI status filters
  if (filters.value.aiStatus !== 'both') {
    if (filters.value.aiStatus === 'true') {
      filtered = filtered.filter(c => c.aiOn)
    } else if (filters.value.aiStatus === 'false') {
      filtered = filtered.filter(c => !c.aiOn)
    }
  }

  return filtered
})

// Methods
const resetFilters = () => {
  filters.value = {
    readStatus: 'both',
    resolvedStatus: 'both',
    aiStatus: 'both',
    priorityLowest: false,
    priorityRegular: false,
    priorityHigh: false
  }
  searchQuery.value = ''
  
  // Clear refs and visibility tracking
  cardRefs.value.clear()
  visibleCards.value.clear()
  animatingCards.value.clear()
  
  loadConversations(true)
}

const applyFilters = () => {
  // Clear refs and visibility tracking
  cardRefs.value.clear()
  visibleCards.value.clear()
  animatingCards.value.clear()
  
  // Reload conversations with new filters (reset to first page)
  loadConversations(true)
}

const loadMore = () => {
  if (!isLoadingMore.value && hasMoreData.value) {
    currentPage.value++
    loadConversations(false)
  }
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
      await navigateTo(`/client-chat?inverted=true&user-token=${client.id}&api-token=${apiKey}`)
    }
    
  } catch (error) {
    console.error('Failed to open inverted chat:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

const toggleResolved = async (client: Client) => {
  try {
    const newResolvedState = !client.conversationResolved
    
    await useNuxtApp().$sp.client.patch({
      id: client.id,
      product: client.product as string
    }, {
      conversationResolved: newResolvedState
    })
    
    // Update local state
    const clientIndex = clients.value.findIndex(c => c.id === client.id)
    if (clientIndex !== -1 && clients.value[clientIndex]) {
      clients.value[clientIndex]!.conversationResolved = newResolvedState
    }
    
    const message = newResolvedState 
      ? t('conversations.messages.success.conversationResolved') 
      : t('conversations.messages.success.conversationReactivated')
    useNuxtApp().$toast.show(message, 'success')
  } catch (error) {
    console.error('Failed to toggle conversation status:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

// Archive functions
const handleArchivedToggle = () => {
  // Clear animation state when switching views
  animatingCards.value.clear()
  // Reload conversations when toggling archived view
  loadConversations(true)
}

const showArchiveConfirmation = (client: Client) => {
  archiveConfirmation.value.client = client
  archiveConfirmation.value.show = true
}

const confirmArchive = async () => {
  const client = archiveConfirmation.value.client
  if (!client) return
  
  try {
    // Start animation
    animatingCards.value.add(client.id)
    
    await useNuxtApp().$sp.client.patch({
      id: client.id,
      product: client.product as string
    }, {
      conversationArchived: true
    })
    
    // Wait for animation to complete before removing from array
    setTimeout(() => {
      const clientIndex = clients.value.findIndex(c => c.id === client.id)
      if (clientIndex !== -1) {
        clients.value.splice(clientIndex, 1)
      }
      animatingCards.value.delete(client.id)
    }, 300) // Match the CSS animation duration
    
    useNuxtApp().$toast.show(t('conversations.messages.success.conversationArchived'), 'success')
  } catch (error) {
    console.error('Failed to archive conversation:', error)
    useNuxtApp().$toast.show(error, 'error')
    // Remove animation state if there was an error
    animatingCards.value.delete(client.id)
  } finally {
    archiveConfirmation.value.show = false
    archiveConfirmation.value.client = null
  }
}

const cancelArchive = () => {
  archiveConfirmation.value.show = false
  archiveConfirmation.value.client = null
}

const unarchiveConversation = async (client: Client) => {
  try {
    await useNuxtApp().$sp.client.patch({
      id: client.id,
      product: client.product as string
    }, {
      conversationArchived: false
    })
    
    // Update local state - the UI will reactively update the button
    const clientIndex = clients.value.findIndex(c => c.id === client.id)
    if (clientIndex !== -1 && clients.value[clientIndex]) {
      clients.value[clientIndex]!.conversationArchived = false
    }
    
    useNuxtApp().$toast.show(t('conversations.messages.success.conversationUnarchived'), 'success')
  } catch (error) {
    console.error('Failed to unarchive conversation:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

// Logs functions
const openClientLogs = async (client: Client) => {
  const contextId = `${client.id}`
  
  logsPopupTitle.value = `${t('conversations.logs.title')} - ${getDisplayName(client)}`
  logsContextId.value = contextId
  showLogsPopup.value = true
}

const closeLogsPopup = () => {
  showLogsPopup.value = false
  logsContextId.value = ''
}

const formatDate = (date?: Date | string) => {
  if (!date) return t('conversations.conversation.noActivity')
  
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return t('conversations.conversation.invalidDate')
  
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
  return client.name || client.email || t('conversations.conversation.anonymousUser')
}

const getLastMessage = (client: Client) => {
  const message = lastMessages.value[client.id]
  if (message) {
    return message.content
  }
  
  // Show loading state if card is visible but message not loaded yet
  if (visibleCards.value.has(client.id)) {
    return t('conversations.conversation.loadingMessage')
  }
  
  return t('conversations.conversation.noMessages')
}

const getMessageCount = (client: Client) => {
  return client.messageCount || 0
}

// Load data on mount
onMounted(() => {
  // Check if user is admin
  const nuxtApp = useNuxtApp()
  isAdmin.value = nuxtApp.$userRole === 'admin'
  
  setupIntersectionObserver()
  loadConversations(true)
  
  // Add scroll listener for infinite scroll
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    
    // Check if user scrolled near the bottom (within 200px)
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (!isLoadingMore.value && hasMoreData.value) {
        loadMore()
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // Cleanup scroll listener and intersection observer
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (observer.value) {
      observer.value.disconnect()
    }
    if (searchTimeout) clearTimeout(searchTimeout)
  })
})

// Watch search query for real-time search
watch(searchQuery, async (newQuery) => {
  // Debounce the search to avoid too many API calls
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadConversations(true) // Reset to first page when searching
  }, 500)
})

let searchTimeout: NodeJS.Timeout | null = null
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;
@use 'sass:color';

// Uses global .page-container for sizing

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    margin: 0;
    color: $text;
    font-size: 2rem;
  }
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
}

.search-and-reset {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.search-bar {
  position: relative;
  min-width: 300px;
  max-width: 500px;
  flex: 1;
  
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

.filter-controls {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.filter-checkboxes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  flex: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.filter-column {
  h4 {
    margin: 0 0 0.75rem 0;
    color: $text;
    font-size: 0.9rem;
    font-weight: 600;
    border-bottom: 2px solid $brand;
    padding-bottom: 0.25rem;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: $text;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: $brand;
    cursor: pointer;
  }
  
  &:hover {
    color: $brand;
  }
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
  display: flex;
  flex-direction: column;
  min-height: 200px; // Ensure consistent card height
  
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
  
  // Archive animation
  &.animating-out {
    animation: fadeOut 0.3s ease-out forwards;
    pointer-events: none; // Prevent interaction during animation
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
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

.archive-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: rgba($error, 0.1);
  border: 1px solid rgba($error, 0.3);
  border-radius: 50%;
  color: $error;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  z-index: 2;
  
  &:hover {
    background: rgba($error, 0.2);
    border-color: $error;
    transform: scale(1.1);
  }
}

.archive-warning {
  color: $warning;
  font-size: 0.875rem;
  font-style: italic;
  margin-top: 0.5rem;
}

.popup-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
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
  
  .customer-name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  .customer-name {
    margin: 0;
    color: $text;
    font-size: 1.1rem;
  }
  
  .priority-badge {
    font-size: 1.2rem;
    line-height: 1;
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
      background: rgba($ok, 0.2);
      color: color.scale($ok, $lightness: -60%);
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

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: $muted;
  
  .spinner {
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
    font-size: 0.9rem;
  }
}

.end-of-results {
  text-align: center;
  padding: 2rem 1rem;
  color: $muted;
  border-top: 1px solid rgba($muted, 0.2);
  margin-top: 1rem;
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.conversation-preview {
  margin-bottom: 1.5rem;
  flex-grow: 1; // Take up available space
  display: flex;
  flex-direction: column;
  
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
  margin-top: auto; // Push to bottom of flex container
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
