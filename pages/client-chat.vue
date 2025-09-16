<template>
  <div class="page-container client-chat-page">
    <div class="chat-header">
      <div class="header-content">
        <AppButton
          label="Back to Conversations"
          color="secondary"
          :showBackIcon="true"
          margin:="right"
          @click="navigateToConversations"
        />
        <div class="client-info">
          <div class="client-name-row">
            <h1 v-if="client">
              {{ client.isGuest ? 'Anonymous User' : client.name + ' ' + client.email }}
            </h1>
            <h1 v-else>Loading...</h1>
            <span v-if="client" class="priority-badge">{{ getPriorityEmoji(client.priority || ClientPriority.LOWEST) }}</span>
          </div>
          <div v-if="client" class="client-details">
            <span v-if="client.email" class="client-email">{{ client.email }}</span>
            <span class="client-id">ID: {{ client.uniqueId }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-content">
      <ChatInterface />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import { Client, ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'
import { getPriorityEmoji } from '~/utils/priority'

definePageMeta({ 
  layout: 'default'
})

// State
const client = ref<Client | null>(null)
const isLoading = ref(true)

// Get URL parameters
const route = useRoute()
const userToken = route.query['user-token'] as string
const apiToken = route.query['api-token'] as string

// Navigation
const navigateToConversations = () => {
  navigateTo('/conversations')
}

// Load client data
const loadClient = async () => {
  if (!userToken || !apiToken) {
    console.error('Missing user token or API token')
    useNuxtApp().$toast.show('Missing required parameters', 'error')
    return
  }

  try {
    isLoading.value = true
    const { $sp } = useNuxtApp()
    
    const result = await $sp.client.findOne({
      id: userToken,
      product: apiToken
    })
    
    if (result) {
      client.value = result
    } else {
      useNuxtApp().$toast.show('Client not found', 'error')
    }
  } catch (error) {
    console.error('Failed to load client:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isLoading.value = false
  }
}

// Load client on mount
onMounted(() => {
  loadClient()
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.client-chat-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: $panel;
  border-bottom: 1px solid rgba($muted, 0.2);
  padding: 1rem 2rem;
  flex-shrink: 0;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.client-info {
  text-align: right;
  margin-left: auto;
  
  .client-name-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  h1 {
    margin: 0;
    color: $text;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .priority-badge {
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .client-details {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    font-size: 0.9rem;
    color: $muted;
    
    .client-email {
      font-weight: 500;
    }
    
    .client-id {
      font-family: monospace;
      background: rgba($muted, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  }
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 1rem;
  border-radius: $radius;
  background: $panel;
  box-shadow: $shadow;
}

// Mobile responsive
@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .client-info {
    h1 {
      font-size: 1.1rem;
    }
    
    .client-details {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
  
  .chat-content {
    margin: 0.5rem;
  }
}
</style>