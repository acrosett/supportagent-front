<template>
  <div class="page-container document-upload-page">
    <div class="upload-header">
      <div class="header-content">
        <AppButton
          :label="t('documentUpload.buttons.backToFaq')"
          color="secondary"
          :showBackIcon="true"
          @click="navigateToFAQ"
        />
        <h1>
          {{ t('documentUpload.page.title') }}
        </h1>
        <div></div> <!-- Spacer for flexbox alignment -->
      </div>
    </div>

    <div class="upload-content">
      <div class="upload-section">
        <p class="ai-note">
          {{ t('documentUpload.aiNote') }}
        </p>
        <DigestFile
          v-model="processedText"
          @error="handleError"
          @processed="handleProcessingComplete"
        />
        
        <!-- Admin Text Preview - Only for admins -->
        <div v-if="processedText && isAdmin" class="admin-text-preview">
          <h3>{{ t('documentUpload.admin.rawTextTitle') }}</h3>
          <div class="text-preview">
            <div class="text-stats">
              <span class="text-size">{{ textSizeFormatted }}</span>
              <span class="text-length">{{ t('documentUpload.admin.charactersCount', { count: processedText.length.toLocaleString() }) }}</span>
            </div>
            <textarea 
              v-model="processedText" 
              readonly 
              class="processed-textarea"
              :placeholder="t('documentUpload.admin.textPlaceholder')"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Editor Tasks Section -->
      <div class="tasks-section">
        <div class="section-header">
          <h2>{{ t('documentUpload.processingQueue.title') }}</h2>
          <p class="section-description">{{ t('documentUpload.processingQueue.description') }}</p>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="search-and-reset">
            <div class="search-bar">
              <AppIcon name="search" size="sm" class="search-icon" />
              <input 
                type="text" 
                :placeholder="t('documentUpload.search.placeholder')"
                v-model="searchQuery"
                class="search-input"
              />
            </div>
            
            <AppButton
              :label="t('documentUpload.buttons.resetFilters')"
              color="secondary"
              size="sm"
              margin="left"
              @click="resetFilters"
            />
          </div>
          
          <div class="filter-controls">
            <CheckBoxColumn
              :title="t('documentUpload.filters.status.title')"
              name="taskStatus"
              v-model="filters.taskStatus"
              :options="[
                { value: 'both', label: t('documentUpload.filters.status.all') },
                { value: 'NEW', label: t('documentUpload.filters.status.processing') },
                { value: 'COMPLETED', label: t('documentUpload.filters.status.completed') },
                { value: 'FAILED', label: t('documentUpload.filters.status.failed') }
              ]"
              @change="applyFilters"
            />
            
            <CheckBoxColumn
              :title="t('documentUpload.filters.initiator.title')"
              name="taskInitiator"
              v-model="filters.taskInitiator"
              :options="[
                { value: 'both', label: t('documentUpload.filters.initiator.all') },
                { value: 'DIGESTOR', label: t('documentUpload.filters.initiator.documentUpload') },
                { value: 'STAFF_AGENT', label: t('documentUpload.filters.initiator.staffAgent') }
              ]"
              @change="applyFilters"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('documentUpload.states.loading') }}</p>
        </div>

        <!-- Tasks List -->
        <div v-else-if="filteredTasks.length === 0" class="empty-state">
          <AppIcon name="document" size="xl" class="empty-icon" />
          <h3>{{ t('documentUpload.states.noTasks.title') }}</h3>
          <p>{{ t('documentUpload.states.noTasks.description') }}</p>
        </div>

        <div v-else class="tasks-grid">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-card"
            :class="{ 
              'new': task.status === EditorTaskStatus.NEW,
              'completed': task.status === EditorTaskStatus.COMPLETED,
              'failed': task.status === EditorTaskStatus.FAILED
            }"
            @click="openTaskDetail(task)"
          >
            <div class="task-header">
              <div class="task-info">
                <h3 class="task-title">{{ getTaskTitle(task) }}</h3>
                <p class="task-id">ID: {{ task.id?.substring(0, 8) || 'Unknown' }}...</p>
              </div>
              <div class="task-badges">
                <!-- Status Badge -->
                <span
                  class="status-badge"
                  :class="getStatusClass(task.status)"
                >
                  <AppIcon :name="getStatusIcon(task.status)" size="sm" />
                  {{ getStatusLabel(task.status) }}
                </span>
                
                <!-- Initiator Badge -->
                <span
                  class="initiator-badge"
                  :class="getInitiatorClass(task.initiator)"
                >
                  <AppIcon :name="getInitiatorIcon(task.initiator)" size="sm" />
                  {{ getInitiatorLabel(task.initiator) }}
                </span>
              </div>
            </div>

            <div class="task-content">
              <p class="knowledge-preview">{{ getKnowledgePreview(task.newKnowledge) }}</p>
              <div class="task-meta">
                <span class="created-date">{{ t('documentUpload.taskCard.created') }} {{ formatDate(task.createdAt) }}</span>
                <span class="updated-date">{{ t('documentUpload.taskCard.updated') }} {{ formatDate(task.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Indicator -->
        <div v-if="isLoadingMore" class="loading-more">
          <div class="spinner"></div>
          <p>{{ t('documentUpload.states.loadingMore') }}</p>
        </div>

        <!-- End of Results Indicator -->
        <div v-else-if="!hasMoreData && editorTasks.length > 0" class="end-of-results">
          <p>{{ t('documentUpload.states.noMoreTasks') }}</p>
        </div>
      </div>
    </div>

    <!-- Task Detail Popup -->
    <AppPopup
      v-if="showTaskDetail && selectedTask"
      @close="closeTaskDetail"
      :title="t('documentUpload.taskDetail.title')"
      :show="showTaskDetail"
    >
      <div class="task-detail-content">
        <div class="task-detail-header">
          <div class="task-detail-info">
            <h3>{{ getTaskTitle(selectedTask) }}</h3>
            <p class="task-detail-id">ID: {{ selectedTask.id?.substring(0, 8) || 'Unknown' }}...</p>
            <div class="task-detail-badges">
              <span
                class="status-badge"
                :class="getStatusClass(selectedTask.status)"
              >
                <AppIcon :name="getStatusIcon(selectedTask.status)" size="sm" />
                {{ getStatusLabel(selectedTask.status) }}
              </span>
              
              <span
                class="initiator-badge"
                :class="getInitiatorClass(selectedTask.initiator)"
              >
                <AppIcon :name="getInitiatorIcon(selectedTask.initiator)" size="sm" />
                {{ getInitiatorLabel(selectedTask.initiator) }}
              </span>
            </div>
          </div>
          
          <div class="task-detail-dates">
            <div class="date-item">
              <span class="date-label">{{ t('documentUpload.taskDetail.created') }}:</span>
              <span class="date-value">{{ formatDate(selectedTask.createdAt) }}</span>
            </div>
            <div class="date-item">
              <span class="date-label">{{ t('documentUpload.taskDetail.updated') }}:</span>
              <span class="date-value">{{ formatDate(selectedTask.updatedAt) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Admin Actions -->
        <div v-if="isAdmin" class="admin-actions">
          <AppButton
            v-if="selectedTask.status === EditorTaskStatus.FAILED"
            :label="t('documentUpload.taskDetail.actions.retry')"
            color="secondary"
            size="sm"
            margin="right"
            :loading="isRetrying"
            @click="retryTask"
          />
          <AppButton
            :label="t('documentUpload.taskDetail.actions.viewLogs')"
            color="primary"
            size="sm"
            margin="left"
            @click="fetchTaskLogs"
          />
        </div>

        <div class="knowledge-content">
          <h4>{{ t('documentUpload.taskDetail.knowledgeContent') }}</h4>
          <div class="knowledge-text">
            {{ selectedTask.newKnowledge || t('documentUpload.taskDetail.noContent') }}
          </div>
        </div>

        <!-- Embedded Logs Popup Component -->
        <div v-if="showLogsPopup" class="embedded-logs-container">
          <LlmLogsPopup
            :show="true"
            title=""
            :context-id="logsContextId"
            embedded
            @close="closeLogsPopup"
          />
        </div>
      </div>
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'
import CheckBoxColumn from '~/components/CheckBoxColumn.vue'
import LlmLogsPopup from '~/components/LlmLogsPopup.vue'
import { EditorTask, EditorTaskStatus, EditorTaskInitiator } from '~/eicrud_exports/services/SUPPORT-ms/editor-task/editor-task.entity'

const { t } = useI18n()
const processedText = ref('')
const isAdmin = ref(false)

// Editor Tasks State
const editorTasks = ref<EditorTask[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const searchQuery = ref('')
const hasMoreData = ref(true)
const currentPage = ref(0)
const pageSize = 20

// Task Detail Popup State
const showTaskDetail = ref(false)
const selectedTask = ref<EditorTask | null>(null)
const isRetrying = ref(false)
const showLogsPopup = ref(false)

// Computed contextId for logs
const logsContextId = computed(() => {
  if (!selectedTask.value?.id) return ''
  return `${useNuxtApp().$userProductId}_${selectedTask.value.id}`
})

// Filter state
const filters = ref({
  taskStatus: 'both',      // 'NEW', 'COMPLETED', 'FAILED', 'both'
  taskInitiator: 'both'    // 'DIGESTOR', 'STAFF_AGENT', 'both'
})

// Auto-refresh interval
let refreshInterval: NodeJS.Timeout | null = null

const textSizeFormatted = computed(() => {
  if (!processedText.value) return '0 Bytes'
  const byteLength = new TextEncoder().encode(processedText.value).length
  return formatFileSize(byteLength)
})

const handleError = (error: string) => {
  // Handle errors from the DigestFile component
  console.error('File processing error:', error)
}

const handleProcessingComplete = async () => {
  await loadEditorTasks(true)
}

const navigateToFAQ = () => {
  navigateTo('/faq')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}



// Editor Tasks Functions
const loadEditorTasks = async (reset = true) => {
  try {
    if (reset) {
      isLoading.value = true
      currentPage.value = 0
      hasMoreData.value = true
    } else {
      isLoadingMore.value = true
    }
    
    const { $sp } = useNuxtApp()
    const apiKey = useNuxtApp().$userProductId
    
    if (!apiKey) {
      throw new Error('User API key not found')
    }
    
    // Build search parameters
    const searchParams: any = {
      product: apiKey
    }
    
    // Add filter parameters
    if (filters.value.taskStatus !== 'both') {
      searchParams.status = filters.value.taskStatus
    }
    
    if (filters.value.taskInitiator !== 'both') {
      searchParams.initiator = filters.value.taskInitiator
    }
    
    // Setup pagination options
    const options: any = {
      limit: pageSize,
      offset: reset ? 0 : currentPage.value * pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    }
    
    // Load editor tasks
    const tasksResult = await $sp.editorTask.find(searchParams, options)
    const newTasks = Array.isArray(tasksResult) ? tasksResult : (tasksResult?.data || [])
    
    if (reset) {
      editorTasks.value = newTasks
    } else {
      editorTasks.value = [...editorTasks.value, ...newTasks]
    }
    
    // Check if there's more data
    hasMoreData.value = newTasks.length === pageSize
    
    // Increment page for next load
    if (!reset) {
      currentPage.value++
    }
    
  } catch (error) {
    console.error('Failed to load editor tasks:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Computed properties
const filteredTasks = computed(() => {
  let filtered = editorTasks.value
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.newKnowledge.toLowerCase().includes(query) ||
      task.id?.toLowerCase().includes(query)
    )
  }
  
  // Apply status filter
  if (filters.value.taskStatus !== 'both') {
    filtered = filtered.filter(task => task.status === filters.value.taskStatus)
  }
  
  // Apply initiator filter
  if (filters.value.taskInitiator !== 'both') {
    filtered = filtered.filter(task => task.initiator === filters.value.taskInitiator)
  }
  
  return filtered
})

// Methods
const resetFilters = () => {
  filters.value = {
    taskStatus: 'both',
    taskInitiator: 'both'
  }
  searchQuery.value = ''
  loadEditorTasks(true)
}

const applyFilters = () => {
  loadEditorTasks(true)
}

const getTaskTitle = (task: EditorTask): string => {
  switch (task.initiator) {
    case EditorTaskInitiator.DIGESTOR:
      return 'Document Processing Task'
    case EditorTaskInitiator.STAFF_AGENT:
      return 'Staff Knowledge Update'
    default:
      return 'Knowledge Update Task'
  }
}

const getStatusClass = (status: EditorTaskStatus): string => {
  switch (status) {
    case EditorTaskStatus.NEW:
      return 'status-new'
    case EditorTaskStatus.COMPLETED:
      return 'status-completed'
    case EditorTaskStatus.FAILED:
      return 'status-failed'
    default:
      return 'status-unknown'
  }
}

const getStatusIcon = (status: EditorTaskStatus): string => {
  switch (status) {
    case EditorTaskStatus.NEW:
      return 'time'
    case EditorTaskStatus.COMPLETED:
      return 'check'
    case EditorTaskStatus.FAILED:
      return 'close'
    default:
      return 'info'
  }
}

const getStatusLabel = (status: EditorTaskStatus): string => {
  switch (status) {
    case EditorTaskStatus.NEW:
      return 'Processing'
    case EditorTaskStatus.COMPLETED:
      return 'Completed'
    case EditorTaskStatus.FAILED:
      return 'Failed'
    default:
      return 'Unknown'
  }
}

const getInitiatorClass = (initiator: EditorTaskInitiator): string => {
  switch (initiator) {
    case EditorTaskInitiator.DIGESTOR:
      return 'initiator-digestor'
    case EditorTaskInitiator.STAFF_AGENT:
      return 'initiator-staff'
    default:
      return 'initiator-unknown'
  }
}

const getInitiatorIcon = (initiator: EditorTaskInitiator): string => {
  switch (initiator) {
    case EditorTaskInitiator.DIGESTOR:
      return 'document'
    case EditorTaskInitiator.STAFF_AGENT:
      return 'user'
    default:
      return 'info'
  }
}

const getInitiatorLabel = (initiator: EditorTaskInitiator): string => {
  switch (initiator) {
    case EditorTaskInitiator.DIGESTOR:
      return 'Document Upload'
    case EditorTaskInitiator.STAFF_AGENT:
      return 'Staff Agent'
    default:
      return 'Unknown'
  }
}

const getKnowledgePreview = (knowledge: string): string => {
  if (!knowledge) return 'No content available'
  return knowledge.length > 150 ? knowledge.substring(0, 150) + '...' : knowledge
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

const openTaskDetail = (task: EditorTask) => {
  selectedTask.value = task
  showTaskDetail.value = true
}

const closeTaskDetail = () => {
  showTaskDetail.value = false
  selectedTask.value = null
}

const retryTask = async () => {
  if (!selectedTask.value || !selectedTask.value.id) return
  
  // Show confirmation popup about costs
  const confirmed = await useNuxtApp().$confirmPopup.show(
    'This will reprocess the task and may incur additional AI processing costs. Do you want to continue?'
  )
  
  if (!confirmed) return
  
  try {
    isRetrying.value = true
    
    const { $sp } = useNuxtApp()
    
    // Use retry_task command to reprocess the task
    await $sp.editorTask.retry_task({
      taskId: selectedTask.value.id,
      productId: useNuxtApp().$userProductId
    })
    
    // Update the selected task status
    selectedTask.value.status = EditorTaskStatus.NEW
    
    // Refresh the tasks list to show updated status
    await loadEditorTasks(true)
    
    useNuxtApp().$toast.show('Task queued for reprocessing', 'success')
    
  } catch (error) {
    console.error('Failed to retry task:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isRetrying.value = false
  }
}

const fetchTaskLogs = async () => {
  if (!selectedTask.value || !selectedTask.value.id) return
  showLogsPopup.value = true
}

const closeLogsPopup = () => {
  showLogsPopup.value = false
}

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

// Lifecycle
onMounted(() => {
  // Check if user is admin
  const nuxtApp = useNuxtApp()
  isAdmin.value = nuxtApp.$userRole === 'admin'
  
  loadEditorTasks(true)
  
  // Set up auto-refresh for tasks (every 30 seconds)
  refreshInterval = setInterval(() => {
    // Only refresh if there are NEW tasks (processing)
    if (editorTasks.value.some(task => task.status === EditorTaskStatus.NEW)) {
      loadEditorTasks(true)
    }
  }, 30000)
  
  // Add scroll listener for infinite scroll
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    
    // Check if user scrolled near the bottom (within 200px)
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (!isLoadingMore.value && hasMoreData.value) {
        currentPage.value++
        loadEditorTasks(false)
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
})

// Watch search query for real-time search
let searchTimeout: NodeJS.Timeout | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadEditorTasks(true)
  }, 500)
})

// Set page metadata
definePageMeta({
  title: 'Document Upload & Processing'
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

// Uses global .page-container for sizing

.upload-header {
  margin-bottom: 3rem;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
    }
  }
  
  h1 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 2rem;
    font-weight: 700;
    color: $text;
    margin: 0;
  }
}

.upload-content {
  display: grid;
  gap: 3rem;
}

.upload-section {
  background: $panel;
  border-radius: $radius;
  padding: 2rem;
  box-shadow: $shadow;

  .ai-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $muted;
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
  }
}

.processed-result {
  margin-top: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: $text;
    font-size: 1.25rem;
  }
}

.text-preview {
  border: 1px solid $muted;
  border-radius: $radius;
  overflow: hidden;
}

.text-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba($muted, 0.1);
  border-bottom: 1px solid $muted;
  font-size: 0.9rem;
  color: $muted;
  
  .text-size {
    font-weight: 600;
  }
}

.processed-textarea {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: none;
  background: $panel;
  color: $text;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  
  &:focus {
    outline: none;
  }
}

.admin-text-preview {
  margin-top: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: $text;
    font-size: 1.1rem;
    opacity: 0.8;
  }
}

// Tasks Section Styles
.tasks-section {
  background: $panel;
  border-radius: $radius;
  padding: 2rem;
  box-shadow: $shadow;
  
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
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba($muted, 0.05);
  border-radius: $radius;
  
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

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: $muted;
  
  .empty-icon {
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

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: $bg;
  border: 2px solid $muted;
  border-radius: $radius;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  
  &.new {
    border-color: $brand;
    background: rgba($brand, 0.02);
  }
  
  &.completed {
    border-color: #10b981;
    background: rgba(#10b981, 0.02);
  }
  
  &.failed {
    border-color: #ef4444;
    background: rgba(#ef4444, 0.02);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow;
  }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba($muted, 0.3);
}

.task-info {
  flex: 1;
  
  .task-title {
    margin: 0 0 0.25rem 0;
    color: $text;
    font-size: 1.1rem;
  }
  
  .task-id {
    margin: 0;
    color: $muted;
    font-family: monospace;
    font-size: 0.8rem;
  }
}

.task-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: $radius;
  font-size: 0.75rem;
  font-weight: 600;
  
  &.status-new {
    background: rgba($brand, 0.1);
    color: $brand;
  }
  
  &.status-completed {
    background: rgba(#10b981, 0.1);
    color: #10b981;
  }
  
  &.status-failed {
    background: rgba(#ef4444, 0.1);
    color: #ef4444;
  }
  
  &.status-unknown {
    background: rgba($muted, 0.1);
    color: $muted;
  }
}

.initiator-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: $radius;
  font-size: 0.75rem;
  font-weight: 600;
  
  &.initiator-digestor {
    background: rgba($brand-2, 0.1);
    color: $brand-2;
  }
  
  &.initiator-staff {
    background: rgba(#8b5cf6, 0.1);
    color: #8b5cf6;
  }
  
  &.initiator-unknown {
    background: rgba($muted, 0.1);
    color: $muted;
  }
}

.task-content {
  .knowledge-preview {
    margin: 0 0 1rem 0;
    color: $text;
    font-size: 0.9rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .task-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: $muted;
    
    @media (max-width: 480px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
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

@media (max-width: 768px) {
  .upload-header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 2rem;
    }
  }
  
  .upload-section {
    padding: 1.5rem;
  }
  
  .tasks-section {
    padding: 1.5rem;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  
  .task-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .task-badges {
    align-items: flex-start;
    flex-direction: row;
    gap: 0.5rem;
  }
}

// Task Detail Popup Styles
.task-detail-content {
  max-width: 800px;
  width: 100%;
}

.task-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba($muted, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
}

.task-detail-info {
  flex: 1;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .task-detail-id {
    margin: 0 0 1rem 0;
    color: $muted;
    font-family: monospace;
    font-size: 0.9rem;
  }
}

.task-detail-badges {
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.task-detail-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
  
  @media (max-width: 768px) {
    text-align: left;
  }
  
  .date-item {
    display: flex;
    gap: 0.5rem;
    font-size: 0.9rem;
    
    .date-label {
      color: $muted;
      font-weight: 500;
    }
    
    .date-value {
      color: $text;
    }
  }
}

.knowledge-content {
  h4 {
    margin: 0 0 1rem 0;
    color: $text;
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.knowledge-text {
  background: rgba($muted, 0.05);
  border: 1px solid rgba($muted, 0.2);
  border-radius: $radius;
  padding: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: $text;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  
  &:empty::before {
    content: 'No content available';
    color: $muted;
    font-style: italic;
  }
}

// Admin Actions
.admin-actions {
  padding: 1rem;
  background: rgba($brand, 0.05);
  border: 1px solid rgba($brand, 0.2);
  border-radius: $radius;
  margin-bottom: 2rem;
  
  display: flex;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    justify-content: stretch;
  }
}

// Add cursor pointer for task cards
.task-card {
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow;
  }
}

// Embedded Logs Section Styles
.embedded-logs-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba($muted, 0.3);
}

.logs-header {
  margin-bottom: 1.5rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.1rem;
  }
  
  .logs-description {
    margin: 0;
    color: $muted;
    font-size: 0.9rem;
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
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  .log-agent {
    font-weight: 600;
    color: $text;
    font-size: 0.95rem;
  }
  
  .log-version {
    background: rgba($muted, 0.2);
    color: $text;
    padding: 0.2rem 0.5rem;
    border-radius: $radius;
    font-size: 0.75rem;
    font-family: monospace;
  }
  
  .test-badge {
    background: rgba($brand, 0.2);
    color: $brand;
    padding: 0.2rem 0.5rem;
    border-radius: $radius;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .error-badge {
    background: rgba(#ef4444, 0.2);
    color: #ef4444;
    padding: 0.2rem 0.5rem;
    border-radius: $radius;
    font-size: 0.7rem;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
