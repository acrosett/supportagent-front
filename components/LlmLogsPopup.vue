<template>
  <AppPopup
    v-if="!embedded"
    :show="show"
    :title="title"
    @close="$emit('close')"
    size="md"
    class="llm-logs-popup"
  >
    <div class="logs-popup-content">
      <!-- Loading State -->
      <div v-if="isLoadingLogs" class="loading-state">
        <div class="spinner"></div>
        <p>Loading logs...</p>
      </div>

      <!-- No Logs State -->
      <div v-else-if="logs.length === 0" class="no-logs-state">
        <AppIcon name="document" size="lg" class="no-logs-icon" />
        <h3>No logs found</h3>
        <p>No LLM training data available for this context</p>
      </div>

      <!-- Logs Content -->
      <div v-else class="logs-list">
        <div class="logs-header">
          <h4>Processing History ({{ logs.length }} entries)</h4>
          <p class="logs-description">LLM training data and processing logs for this context</p>
        </div>

        <div
          v-for="log in logs"
          :key="log.id"
          class="log-entry"
          :class="{
            'is-test': log.isTest,
            'has-error': log.errorCount > 0
          }"
        >
          <div class="log-header">
            <div class="log-info">
              <div class="log-meta">
                <span class="log-agent">{{ log.agentName || 'Unknown Agent' }}</span>
                <span class="log-version">v{{ log.agentVersion || '1.0' }}</span>
                <span class="test-badge">{{ log.id }}</span>
                <span v-if="log.isTest" class="test-badge">TEST</span>
                <span v-if="log.errorCount > 0" class="error-badge">{{ log.errorCount }} ERROR{{ log.errorCount > 1 ? 'S' : '' }}</span>
              </div>
              <div class="log-timestamp">
                {{ formatDate(log.createdAt) }}
              </div>
            </div>
          </div>

          <div class="log-content">
            <div class="log-section">
              <div class="log-section-header">
                <h5>Input</h5>
                <AppButton
                  v-if="log.llmInput"
                  label="Copy"
                  color="secondary"
                  margin="left"
                  size="small"
                  @click="copyToClipboard(log.llmInput, 'LLM Input copied to clipboard!')"
                />
              </div>
              <div class="log-text">{{ log.llmInput || 'No input available' }}</div>
            </div>
            
            <div class="log-section">
              <h5>Output</h5>
              <div class="log-text">{{ log.llmOutput || 'No output available' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppPopup>
  
  <!-- Embedded version (no popup wrapper) -->
  <div v-else class="logs-popup-content embedded">
    <!-- Loading State -->
    <div v-if="isLoadingLogs" class="loading-state">
      <div class="spinner"></div>
      <p>Loading logs...</p>
    </div>

    <!-- No Logs State -->
    <div v-else-if="logs.length === 0" class="no-logs-state">
      <AppIcon name="document" size="lg" class="no-logs-icon" />
      <h3>No logs found</h3>
      <p>No LLM training data available for this context</p>
    </div>

    <!-- Logs Content -->
    <div v-else class="logs-list">
      <div class="logs-header">
        <h4>Processing History ({{ logs.length }} entries)</h4>
        <p class="logs-description">LLM training data and processing logs for this context</p>
      </div>

      <div
        v-for="log in logs"
        :key="log.id"
        class="log-entry"
        :class="{
          'is-test': log.isTest,
          'has-error': log.errorCount > 0
        }"
      >
        <div class="log-header">
          <div class="log-info">
            <div class="log-meta">
              <span class="log-agent">{{ log.agentName || 'Unknown Agent' }}</span>
              <span class="log-version">v{{ log.agentVersion || '1.0' }}</span>
              <span v-if="log.isTest" class="test-badge">TEST</span>
              <span v-if="log.errorCount > 0" class="error-badge">{{ log.errorCount }} ERROR{{ log.errorCount > 1 ? 'S' : '' }}</span>
            </div>
            <div class="log-timestamp">
              {{ formatDate(log.createdAt) }}
            </div>
          </div>
        </div>

        <div class="log-content">
          <div class="log-section">
            <div class="log-section-header">
              <h5>Input</h5>
              <AppButton
                v-if="log.llmInput"
                label="Copy"
                color="secondary"
                margin="left"
                size="small"
                @click="copyToClipboard(log.llmInput, 'LLM Input copied to clipboard!')"
              />
            </div>
            <div class="log-text">{{ log.llmInput || 'No input available' }}</div>
          </div>
          
          <div class="log-section">
            <h5>Output</h5>
            <div class="log-text">{{ log.llmOutput || 'No output available' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'

interface Props {
  show: boolean
  title: string
  contextId: string
  embedded?: boolean // When true, renders without AppPopup wrapper
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false
})

defineEmits<{
  close: []
}>()

const { logs, isLoadingLogs, fetchLogs } = useLlmLogs()

// Watch for contextId changes to refetch logs
watch(() => props.contextId, (newContextId) => {
  if (newContextId) {
    fetchLogs(newContextId)
  }
}, { immediate: true })

// Copy to clipboard utility function
const copyToClipboard = async (text: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(text)
    useNuxtApp().$toast.show(successMessage, 'success')
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    useNuxtApp().$toast.show('Failed to copy to clipboard', 'error')
  }
}

const formatDate = (date?: Date | string) => {
  if (!date) return 'Unknown'
  
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
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

// Higher z-index to appear above other popups
.llm-logs-popup {
  z-index: 10000 !important;
}

// Task Logs Popup Styles
.logs-popup-content {
  max-width: 1000px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 auto; // Center the content horizontally

  &.embedded {
    max-width: none; // Remove width restrictions when embedded
    max-height: 70vh; // Slightly smaller when embedded
    margin: 0; // No auto margins when embedded
    width: 100%; // Take full width when embedded
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: $muted;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba($muted, 0.3);
    border-top-color: $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}

.no-logs-state {
  text-align: center;
  padding: 4rem 2rem;
  color: $muted;
  
  .no-logs-icon {
    opacity: 0.5;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
  }
  
  p {
    margin: 0;
  }
}

.logs-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.logs-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba($muted, 0.3);
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.25rem;
  }
  
  .logs-description {
    margin: 0;
    color: $muted;
    font-size: 0.95rem;
  }
}

.log-entry {
  background: rgba($muted, 0.03);
  border: 1px solid rgba($muted, 0.2);
  border-radius: $radius;
  margin-bottom: 1rem;
  overflow: hidden;
  
  &.is-test {
    border-color: rgba($brand, 0.3);
    background: rgba($brand, 0.02);
  }
  
  &.has-error {
    border-color: rgba(#ef4444, 0.3);
    background: rgba(#ef4444, 0.02);
  }
}

.log-header {
  padding: 1rem;
  background: rgba($muted, 0.05);
  border-bottom: 1px solid rgba($muted, 0.1);
}

.log-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  .log-agent {
    font-weight: 600;
    color: $text;
  }
  
  .log-version {
    padding: 0.25rem 0.5rem;
    background: rgba($muted, 0.2);
    border-radius: $radius;
    font-size: 0.75rem;
    color: $muted;
    font-family: monospace;
  }
  
  .test-badge {
    padding: 0.25rem 0.5rem;
    background: rgba($brand, 0.2);
    color: $brand;
    border-radius: $radius;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .error-badge {
    padding: 0.25rem 0.5rem;
    background: rgba(#ef4444, 0.2);
    color: #ef4444;
    border-radius: $radius;
    font-size: 0.75rem;
    font-weight: 600;
  }
}

.log-timestamp {
  color: $muted;
  font-size: 0.85rem;
  white-space: nowrap;
}

.log-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.log-section {
  .log-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  h5 {
    margin: 0;
    color: $text;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
  }
}

.log-text {
  background: rgba($muted, 0.05);
  border: 1px solid rgba($muted, 0.2);
  border-radius: $radius;
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: $text;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
  
  &:empty::before {
    content: 'No content available';
    color: $muted;
    font-style: italic;
  }
}
</style>