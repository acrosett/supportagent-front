<template>
  <div class="test-client-selector">
    <div class="selector-header">
      <h3>Select Test Client</h3>
      <p class="subtitle">Choose a client to start a test chat session</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading test clients...</p>
    </div>

    <div v-else-if="testClients.length === 0" class="empty-state">
      <AppIcon name="user" size="lg" />
      <p>No test clients found</p>
    </div>

    <div v-else class="clients-list">
      <div 
        v-for="client in testClients" 
        :key="client.id" 
        class="client-item"
        @click="selectClient(client)"
      >
        <div class="client-info">
          <div class="client-avatar">
            <div class="avatar-placeholder">{{ client.name?.charAt(0) || 'C' }}</div>
          </div>
          <div class="client-details">
            <h4>{{ client.name || 'Unnamed Client' }}</h4>
            <p class="client-meta">ID: {{ client.uniqueId }}</p>
            <p class="client-meta">Created: {{ formatDate(client.createdAt?.toString() || '') }}</p>
          </div>
        </div>
        <button 
          @click.stop="deleteClient(client)"
          class="delete-btn"
          title="Delete client"
        >
          <AppIcon name="delete" size="sm" />
        </button>
      </div>
    </div>

    <div class="selector-actions">
      <AppButton
        label="Delete All Clients"
        color="warning"
        @click="deleteAllClients"
        :disabled="testClients.length === 0"
      />
      <AppButton
        label="Create New Test Client"
        color="secondary"
        @click="showCreateClientInput = true"
      />
      <AppButton
        label="Cancel"
        color="secondary"
        @click="$emit('close')"
      />
    </div>

    <!-- Create Client Name Input -->
    <div v-if="showCreateClientInput" class="name-input-overlay">
      <div class="name-input-modal">
        <h4>Create New Test Client</h4>
        <p>Enter a name for the new test client:</p>
        <input
          v-model="newClientName"
          type="text"
          placeholder="Enter client name..."
          class="client-name-input"
          @keydown.enter="createNewClient"
          @keydown.escape="cancelCreateClient"
          ref="clientNameInput"
        />
        <div class="name-input-actions">
          <AppButton
            label="Cancel"
            color="secondary"
            @click="cancelCreateClient"
          />
          <AppButton
            label="Create Client"
            color="primary"
            @click="createNewClient"
            :disabled="!newClientName.trim()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Client, ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'

const emit = defineEmits(['close', 'client-selected'])

const isLoading = ref(false)
const testClients = ref<Client[]>([])
const showCreateClientInput = ref(false)
const newClientName = ref('')
const clientNameInput = ref<HTMLInputElement | null>(null)

// Generate a unique identifier (similar to MongoDB ObjectId)
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16)
  const randomBytes = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return timestamp + randomBytes.substring(0, 16)
}

const loadTestClients = async () => {
  if (!import.meta.client) return
  
  isLoading.value = true
  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    
    const result = await $sp.client.find({ 
      product: nuxtApp.$userProductId, 
      isTest: true 
    })
    
    testClients.value = result.data || []
  } catch (error) {
    console.error('Failed to load test clients:', error)
    useNuxtApp().$toast.show('Failed to load test clients', 'error')
    testClients.value = []
  } finally {
    isLoading.value = false
  }
}

const selectClient = (client: Client) => {
  const nuxtApp = useNuxtApp()
  
  // Use the uniqueId we created the client with
  const clientData = {
    guestId: client.uniqueId,
    name: client.name || 'Test Client',
    apiToken: nuxtApp.$userProductId
  }
  emit('client-selected', clientData)
}

const deleteClient = async (client: Client) => {
  if (!confirm(`Delete test client "${client.name || 'Unnamed Client'}"?`)) {
    return
  }
  
  try {
    const { $sp } = useNuxtApp()
    await $sp.client.delete({ id: client.id })
    
    // Remove from local array
    const index = testClients.value.findIndex(c => c.id === client.id)
    if (index > -1) {
      testClients.value.splice(index, 1)
    }
    
    useNuxtApp().$toast.show('Test client deleted', 'success')
  } catch (error) {
    console.error('Failed to delete test client:', error)
    useNuxtApp().$toast.show('Failed to delete test client', 'error')
  }
}

const deleteAllClients = async () => {
  if (testClients.value.length === 0) return
  
  if (!confirm(`Are you sure you want to delete all ${testClients.value.length} test clients? This action cannot be undone.`)) {
    return
  }
  
  try {
    const { $sp } = useNuxtApp()
    
    // Delete all test clients
    await Promise.all(
      testClients.value.map(client => $sp.client.delete({ id: client.id }))
    )
    
    testClients.value = []
    useNuxtApp().$toast.show('All test clients deleted', 'success')
  } catch (error) {
    console.error('Failed to delete all test clients:', error)
    useNuxtApp().$toast.show('Failed to delete all test clients', 'error')
    // Reload to get current state
    await loadTestClients()
  }
}

const createNewClient = async () => {
  if (!newClientName.value.trim()) return
  
  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    
    const uniqueId = "guest_" + generateId()
    
    const newClient = await $sp.client.create({
      product: nuxtApp.$userProductId,
      uniqueId: uniqueId,
      name: newClientName.value.trim(),
      isTest: true,
      isGuest: true,
      priority: ClientPriority.REGULAR,
      messageCount: 0,
      messagesToday: 0,
      messagesThisWeek: 0,
      conversationResolved: false,
      conversationArchived: false,
      aiOn: true,
      lastMessageReadByStaff: false
    })
    
    // Add to list
    testClients.value.unshift(newClient)
    
    // Reset input and close modal
    newClientName.value = ''
    showCreateClientInput.value = false
    
    // Auto-select the new client
    selectClient(newClient)
    
    useNuxtApp().$toast.show('Test client created', 'success')
  } catch (error) {
    console.error('Failed to create test client:', error)
    useNuxtApp().$toast.show('Failed to create test client', 'error')
  }
}

const cancelCreateClient = () => {
  newClientName.value = ''
  showCreateClientInput.value = false
}

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

onMounted(async () => {
  await loadTestClients()
})

// Focus the input when the create client modal shows
watch(showCreateClientInput, (newValue) => {
  if (newValue) {
    nextTick(() => {
      clientNameInput.value?.focus()
    })
  }
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;
@use 'sass:color';

.test-client-selector {
  background: $bg;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 90vw;
  max-width: 500px;
  min-width: 400px;
  max-height: 80vh;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.selector-header {
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .subtitle {
    margin: 0;
    color: $muted;
    font-size: 0.875rem;
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: $muted;
  
  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid rgba($brand, 0.2);
    border-top: 2px solid $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
  }
}

.clients-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  max-height: 300px;
}

.client-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid rgba($ring, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: rgba($brand, 0.3);
    background: rgba($brand, 0.05);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.client-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.client-avatar {
  .avatar-placeholder {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, $brand, color.adjust($brand, $lightness: -10%));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
  }
}

.client-details {
  h4 {
    margin: 0 0 0.25rem 0;
    color: $text;
    font-size: 1rem;
    font-weight: 500;
  }
  
  .client-meta {
    margin: 0;
    color: $muted;
    font-size: 0.75rem;
    line-height: 1.3;
  }
}

.delete-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba($warning, 0.1);
  color: $warning;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba($warning, 0.2);
    transform: scale(1.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
}

.selector-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid rgba($ring, 0.1);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Client name input modal styles
.name-input-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.name-input-modal {
  background: $bg;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 1.5rem 0;
    color: $muted;
    font-size: 0.875rem;
  }
}

.client-name-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba($ring, 0.2);
  border-radius: 0.5rem;
  background: $panel;
  color: $text;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: $brand;
  }
  
  &::placeholder {
    color: $muted;
  }
}

.name-input-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

// Mobile responsive
@media (max-width: 480px) {
  .test-client-selector {
    min-width: unset;
    max-width: unset;
    width: 100%;
  }
  
  .selector-actions {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
  
  .client-item {
    padding: 0.75rem;
  }
  
  .client-details {
    h4 {
      font-size: 0.875rem;
    }
    
    .client-meta {
      font-size: 0.7rem;
    }
  }
}
</style>
