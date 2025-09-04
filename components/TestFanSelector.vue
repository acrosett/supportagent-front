<template>
  <div class="test-fan-selector">
    <div class="selector-header">
      <h3>Select Test Fan</h3>
      <p class="subtitle">Choose a fan to start a test chat with {{ modelName }}</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading test fans...</p>
    </div>

    <div v-else-if="testFans.length === 0" class="empty-state">
      <AppIcon name="user" size="lg" />
      <p>No test fans found for this model</p>
    </div>

    <div v-else class="fans-list">
      <div 
        v-for="fan in testFans" 
        :key="fan.id" 
        class="fan-item"
        @click="selectFan(fan)"
      >
        <div class="fan-info">
          <div class="fan-avatar">
            <div class="avatar-placeholder">{{ fan.name?.charAt(0) || 'F' }}</div>
          </div>
          <div class="fan-details">
            <h4>{{ fan.name || 'Unnamed Fan' }}</h4>
            <p class="fan-meta">ID: {{ fan.id }}</p>
            <p class="fan-meta">Created: {{ formatDate(fan.createdAt?.toString() || '') }}</p>
          </div>
        </div>
        <button 
          @click.stop="deleteFan(fan)"
          class="delete-btn"
          title="Delete fan"
        >
          <AppIcon name="trash" size="sm" />
        </button>
      </div>
    </div>

    <div class="selector-actions">
      <AppButton
        label="Delete All Fans"
        color="warning"
        @click="deleteAllFans"
        :disabled="testFans.length === 0"
      />
      <AppButton
        label="Create New Test Fan"
        color="secondary"
        @click="showCreateFanInput = true"
      />
      <AppButton
        label="Cancel"
        color="secondary"
        @click="$emit('close')"
      />
    </div>

    <!-- Create Fan Name Input -->
    <div v-if="showCreateFanInput" class="name-input-overlay">
      <div class="name-input-modal">
        <h4>Create New Test Fan</h4>
        <p>Enter a name for the new test fan:</p>
        <input
          v-model="newFanName"
          type="text"
          placeholder="Enter fan name..."
          class="fan-name-input"
          @keydown.enter="createNewFan"
          @keydown.escape="cancelCreateFan"
          ref="fanNameInput"
        />
        <div class="name-input-actions">
          <AppButton
            label="Cancel"
            color="secondary"
            @click="cancelCreateFan"
          />
          <AppButton
            label="Create Fan"
            color="primary"
            @click="createNewFan"
            :disabled="!newFanName.trim()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Fan } from '~/eicrud_exports/services/OF-ms/fan/fan.entity'

interface Props {
  modelId: string
  modelName: string
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'fanSelected'])

const isLoading = ref(true)
const testFans = ref<Fan[]>([])
const showCreateFanInput = ref(false)
const newFanName = ref('')
const fanNameInput = ref<HTMLInputElement | null>(null)

const loadTestFans = async () => {
  isLoading.value = true
  try {
    const result = await useNuxtApp().$sp.fan.find({
      model: props.modelId,
      isTestFan: true
    })
    testFans.value = result.data || []
  } catch (error: any) {
    console.error('Failed to load test fans:', error)
    useNuxtApp().$toast.show(error, 'error')
    testFans.value = []
  } finally {
    isLoading.value = false
  }
}

const selectFan = (fan: Fan) => {
  emit('fanSelected', fan)
}

const deleteFan = async (fan: Fan) => {
  try {
    useNuxtApp().$toast.show(`Deleting test fan ${fan.name}...`, 'info')
    
    await useNuxtApp().$sp.testing.delete_test_fan({
      fanId: fan.id,
      modelId: props.modelId
    })
    
    useNuxtApp().$toast.show('Test fan deleted successfully', 'success')
    
    // Reload the fans list
    await loadTestFans()
  } catch (error: any) {
    console.error('Failed to delete test fan:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

const deleteAllFans = async () => {
  if (testFans.value.length === 0) return
  
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete all ${testFans.value.length} test fans for this model? This action cannot be undone.`)) {
    return
  }
  
  try {
    useNuxtApp().$toast.show(`Deleting ${testFans.value.length} test fans...`, 'info')
    
    // Delete all fans sequentially
    for (const fan of testFans.value) {
      await useNuxtApp().$sp.testing.delete_test_fan({
        fanId: fan.id,
        modelId: props.modelId
      })
    }
    
    useNuxtApp().$toast.show('All test fans deleted successfully', 'success')
    
    // Reload the fans list
    await loadTestFans()
  } catch (error: any) {
    console.error('Failed to delete all test fans:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

const createNewFan = () => {
  if (!newFanName.value.trim()) return
  
  // Emit with the fan name to create a new fan
  emit('fanSelected', null, newFanName.value.trim())
  
  // Reset the input
  newFanName.value = ''
  showCreateFanInput.value = false
}

const cancelCreateFan = () => {
  newFanName.value = ''
  showCreateFanInput.value = false
}

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

onMounted(() => {
  loadTestFans()
})

// Focus the input when the create fan modal shows
watch(showCreateFanInput, (newValue) => {
  if (newValue) {
    nextTick(() => {
      fanNameInput.value?.focus()
    })
  }
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;
@use 'sass:color';

.test-fan-selector {
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

.fans-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  max-height: 300px;
}

.fan-item {
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

.fan-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.fan-avatar {
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

.fan-details {
  h4 {
    margin: 0 0 0.25rem 0;
    color: $text;
    font-size: 1rem;
    font-weight: 500;
  }
  
  .fan-meta {
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

// Fan name input modal styles
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

.fan-name-input {
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
  .test-fan-selector {
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
  
  .fan-item {
    padding: 0.75rem;
  }
  
  .fan-details {
    h4 {
      font-size: 0.875rem;
    }
    
    .fan-meta {
      font-size: 0.7rem;
    }
  }
}
</style>
