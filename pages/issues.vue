<template>
  <section class="issues-page page-container">
    <header class="page-header">
      <div class="page-title">
        <h1>Issues</h1>
      </div>
    </header>

    <div class="content-section">

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-bar">
          <AppIcon name="search" size="sm" class="search-icon" />
          <input 
            type="text" 
            placeholder="Search issues..."
            v-model="searchQuery"
            class="search-input"
          />
        </div>
        <div class="filter-buttons">
          <AppButton
            :label="'All (' + totalIssues + ')'"
            :color="activeFilter === 'all' ? 'primary' : 'secondary'"
            size="sm"
            @click="setFilter('all')"
          />
          <AppButton
            :label="'Open (' + openIssues + ')'"
            :color="activeFilter === 'open' ? 'primary' : 'secondary'"
            size="sm"
            @click="setFilter('open')"
          />
          <AppButton
            :label="'Resolved (' + resolvedIssues + ')'"
            :color="activeFilter === 'resolved' ? 'primary' : 'secondary'"
            size="sm"
            @click="setFilter('resolved')"
          />
          
          <AppButton
            label="Create Issue"
            color="primary"
            @click="openCreateIssueModal"
          >
            <AppIcon name="plus" size="sm" />
          </AppButton>
        </div>
      </div>

      <!-- Issues List -->
      <div v-if="filteredIssues.length === 0" class="empty-state">
        <h3>No issues found</h3>
        <p>Support issues will appear here when customers report problems</p>
      </div>

      <div v-else class="issues-list">
        <div
          v-for="issue in filteredIssues"
          :key="issue.id"
          class="issue-card"
          :class="issue.status"
        >
          <div class="issue-header">
            <div class="issue-info">
              <h3 class="issue-title">{{ issue.title }}</h3>
              <p class="issue-id">Issue #{{ issue.id }}</p>
            </div>
            <div class="issue-meta">
              <span class="priority-badge" :class="issue.priority">
                {{ getPriorityEmoji(issue.priority) }} {{ issue.priority.toUpperCase() }}
              </span>
              <span class="status-badge" :class="issue.status">
                <AppIcon :name="getStatusIcon(issue.status)" size="sm" />
                {{ formatStatus(issue.status) }}
              </span>
            </div>
          </div>

          <div class="issue-content">
            <p class="issue-description">{{ issue.description }}</p>
            <div class="issue-details">
              <div class="detail-item">
                <span class="detail-label">Reporter:</span>
                <span class="detail-value">{{ issue.reporter || 'Anonymous' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Category:</span>
                <span class="detail-value">{{ issue.category }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created:</span>
                <span class="detail-value">{{ formatDate(issue.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Updated:</span>
                <span class="detail-value">{{ formatDate(issue.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="issue-actions">
            <AppButton
              label="View Details"
              color="primary"
              size="sm"
              @click="viewIssue(issue)"
            />
            <AppButton
              v-if="issue.status !== 'resolved'"
              label="Update Status"
              color="secondary"
              size="sm"
              @click="updateIssueStatus(issue)"
            />
            <AppButton
              label="Add Note"
              color="secondary"
              size="sm"
              @click="addNote(issue)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Issue Modal -->
    <AppPopup
      :show="showCreateModal"
      title="Create New Issue"
      @close="showCreateModal = false"
    >
      <div class="create-issue-form">
        <div class="form-group">
          <label>Title</label>
          <input 
            type="text" 
            v-model="newIssue.title"
            placeholder="Brief description of the issue"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="newIssue.description"
            placeholder="Detailed description of the issue"
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Priority</label>
            <select v-model="newIssue.priority" class="form-select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="newIssue.category" class="form-select">
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="support">Support Request</option>
              <option value="billing">Billing Issue</option>
              <option value="performance">Performance Issue</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Reporter (optional)</label>
          <input 
            type="text" 
            v-model="newIssue.reporter"
            placeholder="Customer name or email"
            class="form-input"
          />
        </div>
        <div class="form-actions">
          <AppButton
            label="Cancel"
            color="secondary"
            @click="showCreateModal = false"
          />
          <AppButton
            label="Create Issue"
            color="primary"
            @click="createIssue"
          />
        </div>
      </div>
    </AppPopup>
  </section>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'

// Demo data - replace with API calls
const issues = ref([
  {
    id: '1001',
    title: 'Unable to upload documents',
    description: 'Users are reporting that the document upload feature is not working properly. Files get stuck at 50% upload progress.',
    status: 'open',
    priority: 'high',
    category: 'bug',
    reporter: 'john.doe@example.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '1002',
    title: 'Add dark mode to the interface',
    description: 'Multiple customers have requested a dark mode option for better viewing in low-light environments.',
    status: 'in-progress',
    priority: 'medium',
    category: 'feature',
    reporter: 'jane.smith@example.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    id: '1003',
    title: 'Billing discrepancy in monthly charges',
    description: 'Customer was charged twice for the same month. Need to investigate and process refund.',
    status: 'resolved',
    priority: 'critical',
    category: 'billing',
    reporter: 'support@directsupport.ai',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  }
])

const searchQuery = ref('')
const activeFilter = ref('all')
const showCreateModal = ref(false)

const newIssue = ref({
  title: '',
  description: '',
  priority: 'medium',
  category: 'bug',
  reporter: ''
})

// Computed properties
const filteredIssues = computed(() => {
  let filtered = issues.value

  // Filter by status
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(i => i.status === activeFilter.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(i => 
      i.title.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query) ||
      i.id.includes(query) ||
      i.reporter?.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => {
    // Sort by priority (critical > high > medium > low) then by date
    const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    const priorityDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

const totalIssues = computed(() => issues.value.length)
const openIssues = computed(() => issues.value.filter(i => i.status === 'open').length)
const inProgressIssues = computed(() => issues.value.filter(i => i.status === 'in-progress').length)
const resolvedIssues = computed(() => issues.value.filter(i => i.status === 'resolved').length)

// Methods
const setFilter = (filter: string) => {
  activeFilter.value = filter
}

const openCreateIssueModal = () => {
  showCreateModal.value = true
}

const createIssue = () => {
  const id = (Math.max(...issues.value.map(i => parseInt(i.id))) + 1).toString()
  const now = new Date()
  
  issues.value.push({
    id,
    title: newIssue.value.title,
    description: newIssue.value.description,
    status: 'open',
    priority: newIssue.value.priority,
    category: newIssue.value.category,
    reporter: newIssue.value.reporter || '',
    createdAt: now,
    updatedAt: now
  })

  // Reset form
  newIssue.value = {
    title: '',
    description: '',
    priority: 'medium',
    category: 'bug',
    reporter: ''
  }
  
  showCreateModal.value = false
}

const viewIssue = (issue: any) => {
  // TODO: Navigate to issue details
  console.log('Viewing issue:', issue.id)
}

const updateIssueStatus = (issue: any) => {
  // TODO: Open status update modal
  console.log('Updating status for issue:', issue.id)
}

const addNote = (issue: any) => {
  // TODO: Open add note modal
  console.log('Adding note to issue:', issue.id)
}

const getPriorityEmoji = (priority: string) => {
  const emojis: Record<string, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  }
  return emojis[priority] || '⚪'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    open: 'info',
    'in-progress': 'time',
    resolved: 'check'
  }
  return icons[status] || 'info'
}

const formatStatus = (status: string) => {
  return status.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
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
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.issues-page {
 
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
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
  
  .section-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
  }
  
  h2 {
    margin: 0;
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
  min-width: 200px;
  
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
  flex-wrap: wrap;
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

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.issue-card {
  background: $bg;
  border: 2px solid $muted;
  border-radius: $radius;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &.open {
    border-left-color: $brand;
    border-left-width: 4px;
  }
  
  &.in-progress {
    border-left-color: #ff9500;
    border-left-width: 4px;
  }
  
  &.resolved {
    border-left-color: $brand-2;
    border-left-width: 4px;
    opacity: 0.8;
  }
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.issue-info {
  flex: 1;
  
  .issue-title {
    margin: 0 0 0.25rem 0;
    color: $text;
    font-size: 1.2rem;
    line-height: 1.3;
  }
  
  .issue-id {
    margin: 0;
    color: $muted;
    font-family: monospace;
    font-size: 0.9rem;
  }
}

.issue-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: $radius;
  font-size: 0.8rem;
  font-weight: 600;
  
  &.low {
    background: rgba(#4caf50, 0.1);
    color: #4caf50;
  }
  
  &.medium {
    background: rgba(#ffc107, 0.1);
    color: #ffc107;
  }
  
  &.high {
    background: rgba(#ff9500, 0.1);
    color: #ff9500;
  }
  
  &.critical {
    background: rgba(#f44336, 0.1);
    color: #f44336;
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
  
  &.open {
    background: rgba($brand, 0.1);
    color: $brand;
  }
  
  &.in-progress {
    background: rgba(#ff9500, 0.1);
    color: #ff9500;
  }
  
  &.resolved {
    background: rgba($brand-2, 0.1);
    color: $brand-2;
  }
}

.issue-content {
  margin-bottom: 1.5rem;
  
  .issue-description {
    margin: 0 0 1rem 0;
    color: $text;
    line-height: 1.5;
  }
  
  .issue-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
    background: rgba($muted, 0.05);
    border-radius: $radius;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    
    .detail-label {
      font-size: 0.8rem;
      color: $muted;
      font-weight: 600;
    }
    
    .detail-value {
      font-size: 0.9rem;
      color: $text;
    }
  }
}

.issue-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

// Create Issue Modal
.create-issue-form {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: $text;
      font-weight: 600;
      font-size: 0.9rem;
    }
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $muted;
    border-radius: $radius;
    background: $bg;
    color: $text;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: $brand;
    }
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    
    @media (max-width: 768px) {
      flex-direction: column-reverse;
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }
  
  .issue-actions {
    justify-content: center;
  }
}
</style>
