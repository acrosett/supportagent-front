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
        </div>
      </div>

      <!-- Conversations List -->
      <div v-if="filteredConversations.length === 0" class="empty-state">
        <h3>No conversations found</h3>
        <p>Customer conversations will appear here when they start chatting</p>
      </div>

      <div v-else class="conversations-grid">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          class="conversation-card"
          :class="{ 'active': conversation.status === 'active', 'resolved': conversation.status === 'resolved' }"
        >
          <div class="conversation-header">
            <div class="customer-info">
              <h3 class="customer-name">{{ conversation.customerName || 'Anonymous User' }}</h3>
              <p class="conversation-id">ID: {{ conversation.id.slice(0, 8) }}</p>
            </div>
            <div class="conversation-status">
              <span
                class="status-badge"
                :class="conversation.status"
              >
                <AppIcon :name="conversation.status === 'active' ? 'time' : 'check'" size="sm" />
                {{ conversation.status === 'active' ? 'Active' : 'Resolved' }}
              </span>
            </div>
          </div>

          <div class="conversation-preview">
            <p class="last-message">{{ conversation.lastMessage }}</p>
            <div class="conversation-meta">
              <span class="message-count">{{ conversation.messageCount }} messages</span>
              <span class="last-activity">{{ formatDate(conversation.lastActivity) }}</span>
            </div>
          </div>

          <div class="conversation-actions">
            <AppButton
              label="View Details"
              color="primary"
              size="sm"
              @click="viewConversation(conversation)"
            />
            <AppButton
              v-if="conversation.status === 'active'"
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

// Demo data - replace with API calls
const conversations = ref([
  {
    id: '1',
    customerName: 'John Doe',
    status: 'active',
    lastMessage: 'I need help with my account settings...',
    messageCount: 12,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    status: 'resolved',
    lastMessage: 'Thank you for the help!',
    messageCount: 8,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    customerName: null, // Anonymous
    status: 'active',
    lastMessage: 'How do I reset my password?',
    messageCount: 3,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  }
])

const searchQuery = ref('')
const activeFilter = ref('all')

// Computed properties
const filteredConversations = computed(() => {
  let filtered = conversations.value

  // Filter by status
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(c => c.status === activeFilter.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.customerName?.toLowerCase().includes(query) ||
      c.lastMessage.toLowerCase().includes(query) ||
      c.id.includes(query)
    )
  }

  return filtered
})

const totalConversations = computed(() => conversations.value.length)
const activeConversations = computed(() => conversations.value.filter(c => c.status === 'active').length)
const resolvedConversations = computed(() => conversations.value.filter(c => c.status === 'resolved').length)

// Methods
const setFilter = (filter: string) => {
  activeFilter.value = filter
}

const viewConversation = (conversation: any) => {
  // TODO: Navigate to conversation details
  console.log('Viewing conversation:', conversation.id)
}

const markResolved = (conversation: any) => {
  conversation.status = 'resolved'
  conversation.lastActivity = new Date()
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
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
