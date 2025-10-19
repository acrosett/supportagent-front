<template>
  <div class="test-client-selector">
    <div class="selector-header">
      <p class="subtitle">{{ t('testClientSelector.header.subtitle') }}</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('testClientSelector.status.loading') }}</p>
    </div>

    <div v-else-if="testClients.length === 0" class="empty-state">
      <AppIcon name="user" size="lg" />
      <p>{{ t('testClientSelector.status.empty') }}</p>
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
            <h4>{{ client.name || t('testClientSelector.client.unnamedClient') }}</h4>
            <p class="client-meta">{{ t('testClientSelector.client.id') }}: {{ client.uniqueId }}</p>
            <p class="client-meta">{{ t('testClientSelector.client.created') }}: {{ formatDate(client.createdAt?.toString() || '') }}</p>
          </div>
        </div>
        <button 
          @click.stop="deleteClient(client)"
          class="delete-btn"
          :title="t('testClientSelector.actions.deleteClient')"
        >
          <AppIcon name="delete" size="sm" />
        </button>
      </div>
    </div>

    <div class="selector-actions">
      <AppButton
        :label="t('testClientSelector.actions.deleteAllClients')"
        color="warning"
        @click="deleteAllClients"
        :disabled="testClients.length === 0"
      />
      <AppButton
        :label="t('testClientSelector.actions.createNewClient')"
        color="secondary"
        @click="showCreateClientInput = true"
      />
      <AppButton
        :label="t('testClientSelector.actions.cancel')"
        color="secondary"
        @click="$emit('close')"
      />
    </div>

    <!-- Create Client Modal -->
    <AppPopup
      :show="showCreateClientInput"
      :title="t('testClientSelector.modals.createClient.title')"
      size="md"
      @close="cancelCreateClient"
    >
      <MegaForm
        :form-class="Client"
        v-model="newClientData"
        :field-overrides="clientFieldOverrides"
        :include-fields="['name', 'email', 'uniqueId', 'isGuest', 'priority']"
        :actions="[
          {
            label: t('testClientSelector.modals.createClient.cancel'),
            color: 'secondary',
            callback: cancelCreateClient,
            skipValidation: true
          },
          {
            label: t('testClientSelector.modals.createClient.create'),
            color: 'primary',
            callback: createNewClient
          }
        ]"
      />
    </AppPopup>

    <!-- Token Input Modal -->
    <AppPopup
      :show="showTokenInput"
      :title="t('testClientSelector.modals.authToken.title')"
      size="md"
      @close="cancelTokenInput"
    >
      <MegaForm
        :form-class="TokenForm"
        v-model="tokenData"
        :field-overrides="tokenFieldOverrides"
        :include-fields="['token']"
        :actions="[
          {
            label: t('testClientSelector.modals.authToken.cancel'),
            color: 'secondary',
            callback: cancelTokenInput,
            skipValidation: true
          },
          {
            label: t('testClientSelector.modals.authToken.startChat'),
            color: 'primary',
            margin: 'left',
            callback: handleTokenSubmit
          }
        ]"
      />
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import { Client, ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'
import MegaForm from '~/components/MegaForm.vue'
import AppPopup from '~/components/AppPopup.vue'
import type { OverrideRecord } from '~/components/MegaForm.vue'
import { IsString } from 'class-validator'

const { t } = useI18n()

// Token form class for validation
class TokenForm {
  @IsString()
  token!: string
}

const emit = defineEmits(['close', 'client-selected'])

const isLoading = ref(false)
const testClients = ref<Client[]>([])
const showCreateClientInput = ref(false)
const showTokenInput = ref(false)
const selectedClientForToken = ref<Client | null>(null)

// Form data for MegaForm
const newClientData = ref({
  name: '',
  email: '',
  uniqueId: '',
  isGuest: true,
  priority: ClientPriority.REGULAR
})

// Token form data
const tokenData = ref({
  token: ''
})

// Field overrides for MegaForm
const clientFieldOverrides = computed((): OverrideRecord<Client> => ({
  isGuest: {
    label: 'Guest Client',
    type: 'checkbox',
    description: 'Simulate an anonymous guest user (no email or ID needed)',
    invertedConditionsFields: ['email', 'uniqueId'],
  },
  name: {
    label: 'Client Name',
    placeholder: 'Enter client name...',
    type: 'text'
  },
  email: {
    label: 'Email Address',
    placeholder: 'Enter email address...',
    type: 'email',
    props: {
      disabled: newClientData.value.isGuest
    }
  },
  uniqueId: {
    label: 'Unique ID',
    placeholder: 'Corresponds to your database record ID',
    type: 'text',
    description: 'The unique identifier corresponding to your database record of the client',
    props: {
      disabled: newClientData.value.isGuest
    }
  },
  priority: {
    label: 'Priority',
    type: 'select',
    selectOptions: [
      { value: ClientPriority.LOWEST, label: 'Lowest' },
      { value: ClientPriority.REGULAR, label: 'Regular' },
      { value: ClientPriority.HIGH, label: 'High' }
    ]
  }
}))

// Token field overrides
const tokenFieldOverrides = computed((): OverrideRecord<TokenForm> => ({
  token: {
    label: 'Authentication Token',
    placeholder: 'Enter your auth identifier...',
    type: 'text',
    description: 'The identifier sent to your webhook for authentication'
  }
}))

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
      isTest: true,
      anonymized: false
    })
    
    testClients.value = result.data || []
  } catch (error) {
    console.error('Failed to load test clients:', error)
    useNuxtApp().$toast.show(t('testClientSelector.messages.error.loadFailed'), 'error')
    testClients.value = []
  } finally {
    isLoading.value = false
  }
}

const selectClient = (client: Client) => {
  // Check if uniqueId starts with "guest_"
  if (!client.uniqueId?.startsWith('guest_')) {
    // Show token input popup for non-guest clients
    selectedClientForToken.value = client
    tokenData.value.token = ''
    showTokenInput.value = true
    return
  }

  // For guest clients, proceed directly
  const nuxtApp = useNuxtApp()
  const clientData = {
    guestId: client.uniqueId,
    name: client.name || 'Test Client',
    apiToken: nuxtApp.$userProductId
  }
  emit('client-selected', clientData)
}

const deleteClient = async (client: Client) => {
  const confirmed = await useNuxtApp().$confirmPopup.show(t('testClientSelector.messages.confirm.deleteClient', { name: client.name || t('testClientSelector.client.unnamedClient') }))
  if (!confirmed) {
    return
  }
  
  const nuxtApp = useNuxtApp()

  try {
    await nuxtApp.$sp.message.delete_test_client({ id: client.id, product: nuxtApp.$userProductId })
    // Remove from local array
    const index = testClients.value.findIndex(c => c.id === client.id)
    if (index > -1) {
      testClients.value.splice(index, 1)
    }

    nuxtApp.$toast.show(t('testClientSelector.messages.success.clientDeleted'), 'success')
  } catch (error) {
    console.error('Failed to delete test client:', error)
    nuxtApp.$toast.show(t('testClientSelector.messages.error.deleteFailed'), 'error')
  }
}

const deleteAllClients = async () => {
  if (testClients.value.length === 0) return
  
  const confirmed = await useNuxtApp().$confirmPopup.show(t('testClientSelector.messages.confirm.deleteAll', { count: testClients.value.length }))
  if (!confirmed) {
    return
  }
  
  try {
    const { $sp } = useNuxtApp()
    
    // Delete all test clients
    await Promise.all(
      testClients.value.map(client => $sp.client.delete({ id: client.id }))
    )
    
    testClients.value = []
    useNuxtApp().$toast.show(t('testClientSelector.messages.success.allDeleted'), 'success')
  } catch (error) {
    console.error('Failed to delete all test clients:', error)
    useNuxtApp().$toast.show(t('testClientSelector.messages.error.deleteAllFailed'), 'error')
    // Reload to get current state
    await loadTestClients()
  }
}

const createNewClient = async (data: any) => {
  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    
    // Generate uniqueId for guest clients or use provided one
    let uniqueId: string
    if (data.isGuest) {
      uniqueId = "guest_" + generateId()
    } else {
      // For non-guest clients, use provided uniqueId or generate one
      uniqueId = data.uniqueId?.trim()
    }
    
    // Check if client already exists with this uniqueId for this product
    if (uniqueId) {
      try {
        const existingClient = await $sp.client.findOne({
          product: nuxtApp.$userProductId,
          uniqueId: uniqueId
        })
        
        // Check if any client has the exact uniqueId match
        if (existingClient) {
          const errorMessage = `Client with ID "${uniqueId}" already exists for this product`
          useNuxtApp().$toast.show(errorMessage, 'error')
          throw new Error(errorMessage)
        }
      } catch (err: any) {
        console.warn('Could not check for existing client:', err)
      }
    }
    
    const newClient = await $sp.client.create({
      product: nuxtApp.$userProductId,
      uniqueId: uniqueId,
      name: data.name?.trim() || 'Test Client',
      email: data.isGuest ? undefined : (data.email?.trim() || undefined),
      isTest: true,
      isGuest: data.isGuest,
      priority: ClientPriority.REGULAR,
      conversationResolved: false,
      conversationArchived: false,
      aiOn: true,
      lastMessageReadByStaff: false
    })
    
    // Add to list
    testClients.value.unshift(newClient)
    
    // Reset form and close modal
    newClientData.value = {
      name: '',
      email: '',
      uniqueId: '',
      isGuest: true,
      priority: ClientPriority.REGULAR
    }
    showCreateClientInput.value = false
    
    // Auto-select the new client
    selectClient(newClient)
    
    useNuxtApp().$toast.show(t('testClientSelector.messages.success.clientCreated'), 'success')
  } catch (error) {
    console.error('Failed to create test client:', error)
    useNuxtApp().$toast.show(t('testClientSelector.messages.error.createFailed'), 'error')
    throw error // Re-throw to let MegaForm handle the error state
  }
}

const cancelCreateClient = async () => {
  newClientData.value = {
    name: '',
    email: '',
    uniqueId: '',
    isGuest: true,
    priority: ClientPriority.REGULAR
  }
  showCreateClientInput.value = false
}

const handleTokenSubmit = async (data: any) => {
  if (!selectedClientForToken.value) return
  
  const nuxtApp = useNuxtApp()
  const clientData = {
    guestId: "user_" + data.token,
    name: selectedClientForToken.value.name || 'Test Client',
    apiToken: nuxtApp.$userProductId
  }
  
  // Reset token form and close modal
  tokenData.value.token = ''
  showTokenInput.value = false
  selectedClientForToken.value = null
  
  emit('client-selected', clientData)
}

const cancelTokenInput = async () => {
  tokenData.value.token = ''
  showTokenInput.value = false
  selectedClientForToken.value = null
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

// Watch for isGuest changes to clear disabled fields
watch(() => newClientData.value.isGuest, (isGuest) => {
  if (isGuest) {
    // Clear email and uniqueId when switching to guest
    newClientData.value.email = ''
    newClientData.value.uniqueId = ''
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
