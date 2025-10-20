<template>
  <section class="page-container issues-page">
    <header class="page-header">
      <div class="page-title">
        <h1>{{ t('page.title') }}</h1>
        <div class="page-actions">
          <ToggleSwitch v-model="showArchived" :label="t('filters.showArchived.label')" label-position="left"
            @update:modelValue="handleArchivedToggle" />
        </div>
      </div>
    </header>

    <div class="content-section">
      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-and-reset">
          <div class="search-bar">
            <AppIcon name="search" size="sm" class="search-icon" />
            <input type="text" :placeholder="t('filters.search.placeholder')" v-model="searchQuery"
              class="search-input" />
          </div>

          <!-- Reset Filter -->
          <AppButton :label="t('filters.reset')" color="secondary" size="sm" margin="left" @click="resetFilters" />
        </div>

        <div class="filter-controls">
          <!-- Filter Checkboxes -->
          <div class="filter-checkboxes">
            <!-- Issue Status Column -->
            <CheckBoxColumn :title="t('filters.status.title')" name="issueStatus" v-model="filters.issueStatus"
              :options="[
                { value: 'both', label: t('filters.status.options.both') },
                { value: 'open', label: t('filters.status.options.open') },
                { value: 'resolved', label: t('filters.status.options.resolved') }
              ]" @change="applyFilters" />

            <!-- Tags Filter -->
            <div class="filter-column">
              <h4>{{ t('filters.tags.title') }}</h4>
              <div class="tags-filter">
                <div v-if="availableTags.length === 0" class="no-tags">{{ t('filters.tags.noTags') }}</div>
                <label v-else v-for="tag in availableTags" :key="tag.id" class="checkbox-label">
                  <input type="checkbox" :value="tag.name" v-model="filters.selectedTags" @change="applyFilters" />
                  <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
                  <span>{{ tag.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('states.loading') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredIssues.length === 0" class="empty-state">
        <h3>{{ t('states.empty.title') }}</h3>
        <p>{{ t('states.empty.description') }}</p>
      </div>

      <!-- Issues List -->
      <div v-else class="issues-grid">
        <div v-for="issue in filteredIssues" :key="issue.id" :ref="(el) => setCardRef(el as Element, issue.id!)"
          class="issue-card" :class="{
            'open': issue.status === IssueStatus.OPEN,
            'resolved': issue.status === IssueStatus.RESOLVED,
            'archived': issue.isArchived,
            'animating-out': animatingCards.has(issue.id)
          }">

          <div class="issue-header">
            <div class="issue-info">
              <h3 class="issue-title">{{ issue.title }}</h3>
              <p class="issue-id">{{ t('issue.id') }}: {{ issue.id?.substring(0, 8) }}...</p>
            </div>
            <div class="issue-status">
              <!-- Status Badge -->
              <span class="status-badge"
                :class="{ 'open': issue.status === IssueStatus.OPEN, 'resolved': issue.status === IssueStatus.RESOLVED }">
                <AppIcon :name="issue.status === IssueStatus.OPEN ? 'time' : 'check'" size="sm" />
                {{ issue.status === IssueStatus.OPEN ? t('issue.status.open') : t('issue.status.resolved') }}
              </span>
            </div>
          </div>

          <!-- Issue Description Preview -->
          <div class="issue-preview">
            <p class="issue-description">{{ getPreviewText(issue.description, 150) }}</p>

            <!-- Tags -->
            <div v-if="issue.tags && issue.tags.length > 0" class="issue-tags">
              <span v-for="tag in issue.tags" :key="tag" class="tag"
                :style="{ backgroundColor: getTagColor(tag), color: '#fff' }">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Last Comment Preview -->
          <div class="issue-meta">
            <span class="last-comment">{{ getLastComment(issue) }}</span>
            <span class="created-date">{{ t('issue.meta.created') }}: {{ formatDate(issue.createdAt) }}</span>
          </div>

          <div class="issue-actions">
            <AppButton :label="t('issue.actions.details')" color="primary" size="sm" @click="openIssueDetails(issue)" />
            <AppButton v-if="!issue.isArchived" margin="left" color="warning" size="sm" fa-icon-left="archive"
              @click="showArchiveConfirmation(issue)" />
            <AppButton v-else margin="left" color="ok" size="sm" fa-icon-left="fa-solid fa-rotate-left"
              @click="unarchiveIssue(issue)" />
            <AppButton
              :label="issue.status === IssueStatus.RESOLVED ? t('issue.actions.reopen') : t('issue.actions.markResolved')"
              margin="no-margins" color="secondary" size="sm" @click="toggleResolved(issue)" />
          </div>
        </div>
      </div>

      <!-- Load More Indicator -->
      <div v-if="isLoadingMore" class="loading-more">
        <div class="spinner"></div>
        <p>{{ t('states.loadingMore') }}</p>
      </div>

      <!-- End of Results Indicator -->
      <div v-else-if="!hasMoreData && issues.length > 0" class="end-of-results">
        <p>{{ t('states.endOfResults') }}</p>
      </div>
    </div>

    <!-- Archive Confirmation Popup -->
    <AppPopup :show="archiveConfirmation.show" :title="t('archive.dialog.title')" @close="cancelArchive">
      <p>{{ t('archive.dialog.message') }}</p>

      <div class="popup-actions">
        <AppButton :label="t('archive.dialog.cancel')" color="secondary" @click="cancelArchive" />
        <AppButton :label="t('archive.dialog.confirm')" color="warning" margin="left" @click="confirmArchive" />
      </div>
    </AppPopup>
  </section>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'
import CheckBoxColumn from '~/components/CheckBoxColumn.vue'
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { Issue, IssueStatus } from '~/eicrud_exports/services/SUPPORT-ms/issue/issue.entity'
import { IssueComment } from '~/eicrud_exports/services/SUPPORT-ms/issue-comment/issue-comment.entity'
import { IssueTag } from '~/eicrud_exports/services/SUPPORT-ms/issue-tag/issue-tag.entity'

const { t } = await useLocalNamespaceAsync('issues')

// Page state
const issues = ref<Issue[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMoreData = ref(true)
const animatingCards = ref(new Set<string>())
const currentOffset = ref(0)
const pageSize = 20

// Search and filters
const searchQuery = ref('')
const showArchived = ref(false)

const filters = reactive({
  issueStatus: 'both',
  selectedTags: [] as string[]
})

// Archive confirmation
const archiveConfirmation = reactive({
  show: false,
  issue: null as Issue | null
})

// Card refs for animations
const cardRefs = ref(new Map())
const setCardRef = (el: Element | null, id: string) => {
  if (el) {
    cardRefs.value.set(id, el)
  }
}

// Available tags for filtering
const availableTags = ref<IssueTag[]>([])

// Get available tag names for filtering
const availableTagNames = computed(() => availableTags.value.map(tag => tag.name))

// Computed properties
const filteredIssues = computed(() => {
  let filtered = issues.value

  // Apply status filter
  if (filters.issueStatus !== 'both') {
    filtered = filtered.filter(issue => issue.status === filters.issueStatus)
  }

  // Apply archive filter
  filtered = filtered.filter(issue =>
    showArchived.value ? issue.isArchived : !issue.isArchived
  )

  // Apply tag filter
  if (filters.selectedTags.length > 0) {
    filtered = filtered.filter(issue =>
      issue.tags && issue.tags.some(tag => filters.selectedTags.includes(tag))
    )
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(issue =>
      issue.title.toLowerCase().includes(query) ||
      issue.description.toLowerCase().includes(query) ||
      (issue.tags && issue.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  return filtered
})

// Methods
const loadAvailableTags = async () => {
  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()

    const response = await $sp.issueTag.find({
      product: nuxtApp.$userProductId
    }, {})

    availableTags.value = response.data || []
  } catch (error) {
    console.error('Error loading available tags:', error)
  }
}

const loadIssues = async (reset = false) => {
  try {
    if (reset) {
      currentOffset.value = 0
      issues.value = []
      hasMoreData.value = true
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()

    const searchDto = {
      product: nuxtApp.$userProductId,
      text: searchQuery.value || undefined,
      tags: filters.selectedTags.length > 0 ? filters.selectedTags : undefined,
      statuses: filters.issueStatus !== 'both' ? [filters.issueStatus as IssueStatus] : undefined,
      archivedStatus: showArchived.value ? 'true' as const : 'false' as const
    }

    const response = await $sp.issue.search(searchDto, {
      limit: pageSize,
      offset: currentOffset.value
    })

    if (reset) {
      issues.value = response.data || []
    } else {
      issues.value.push(...(response.data || []))
    }

    hasMoreData.value = (response.data?.length || 0) === pageSize
    currentOffset.value += pageSize

  } catch (error) {
    console.error('Error loading issues:', error)
    useNuxtApp().$toast.show(t('errors.loadIssues'), 'error')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const applyFilters = () => {
  loadIssues(true)
}

const resetFilters = () => {
  filters.issueStatus = 'both'
  filters.selectedTags = []
  searchQuery.value = ''
  loadIssues(true)
}

const handleArchivedToggle = () => {
  loadIssues(true)
}

const openIssueDetails = (issue: Issue) => {
  navigateTo(`/issue?id=${issue.id}`)
}

const showArchiveConfirmation = (issue: Issue) => {
  archiveConfirmation.issue = issue
  archiveConfirmation.show = true
}

const cancelArchive = () => {
  archiveConfirmation.show = false
  archiveConfirmation.issue = null
}

const confirmArchive = async () => {
  if (!archiveConfirmation.issue) return

  try {
    const issue = archiveConfirmation.issue
    const { $sp } = useNuxtApp()

    // Create animation class
    animatingCards.value.add(issue.id!)

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300))

    await $sp.issue.patch({
      id: issue.id!,
      product: useNuxtApp().$userProductId,
    }, { isArchived: true })

    // Remove from current list
    issues.value = issues.value.filter(i => i.id !== issue.id)
    animatingCards.value.delete(issue.id!)

    useNuxtApp().$toast.show(t('archive.messages.success'), 'success')
  } catch (error) {
    console.error('Error archiving issue:', error)
    useNuxtApp().$toast.show(t('archive.messages.error'), 'error')
    animatingCards.value.delete(archiveConfirmation.issue.id!)
  }

  cancelArchive()
}

const unarchiveIssue = async (issue: Issue) => {
  try {
    const { $sp } = useNuxtApp()

    await $sp.issue.patch({
      id: issue.id!,
      product: useNuxtApp().$userProductId,
    }, {
      isArchived: false
    })

    // Remove from current list if showing archived
    if (showArchived.value) {
      issues.value = issues.value.filter(i => i.id !== issue.id)
    } else {
      // Update in place
      const index = issues.value.findIndex(i => i.id === issue.id)
      if (index !== -1 && issues.value[index]) {
        issues.value[index]!.isArchived = false
      }
    } useNuxtApp().$toast.show(t('archive.messages.unarchiveSuccess'), 'success')
  } catch (error) {
    console.error('Error unarchiving issue:', error)
    useNuxtApp().$toast.show(t('archive.messages.unarchiveError'), 'error')
  }
}

const toggleResolved = async (issue: Issue) => {
  try {
    const { $sp } = useNuxtApp()
    const newStatus = issue.status === IssueStatus.RESOLVED ? IssueStatus.OPEN : IssueStatus.RESOLVED

    await $sp.issue.patch({
      id: issue.id!,
      product: useNuxtApp().$userProductId,
    }, {
      status: newStatus
    })

    // Update in place
    const index = issues.value.findIndex(i => i.id === issue.id)
    if (index !== -1 && issues.value[index]) {
      issues.value[index]!.status = newStatus
    }

    useNuxtApp().$toast.show(
      newStatus === IssueStatus.RESOLVED ? t('status.messages.resolvedSuccess') : t('status.messages.reopenedSuccess'),
      'success'
    )
  } catch (error) {
    console.error('Error updating issue status:', error)
    useNuxtApp().$toast.show(t('status.messages.error'), 'error')
  }
}

const getTagColor = (tagName: string): string => {
  const tag = availableTags.value.find(t => t.name === tagName)
  return tag?.color || '#6366f1' // Default brand color
}

const getPreviewText = (text: string, maxLength: number): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getLastComment = (issue: Issue): string => {
  if (!issue.comments || issue.comments.length === 0) {
    return t('issue.meta.noComments')
  }
  const lastComment = issue.comments[issue.comments.length - 1]
  return `${t('issue.meta.lastComment')}: ${getPreviewText(lastComment.content, 80)}`
}

const formatDate = (date?: Date | string): string => {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60))
    return `${mins}m ago`
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)}d ago`
  } else {
    return d.toLocaleDateString()
  }
}

// Infinite scroll
const handleScroll = () => {
  if (isLoadingMore.value || !hasMoreData.value) return

  const scrollPosition = window.innerHeight + window.scrollY
  const threshold = document.body.offsetHeight - 1000

  if (scrollPosition >= threshold) {
    loadIssues()
  }
}

// Watchers
watch(searchQuery, () => {
  // Debounce search
  setTimeout(() => {
    applyFilters()
  }, 500)
})

// Lifecycle
onMounted(() => {
  loadAvailableTags()
  loadIssues(true)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

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

    .tag-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba($muted, 0.3);
    }

    &:hover {
      color: $brand;
    }
  }

  .tags-filter {
    max-height: 150px;
    overflow-y: auto;

    .no-tags {
      color: $muted;
      font-style: italic;
    }
  }
}

.loading-state,
.loading-more {
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

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.loading-more {
  padding: 2rem 1rem;

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba($brand, 0.2);
    border-top: 2px solid $brand;
    margin-bottom: 0.5rem;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: $muted;

  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
  }
}

.issues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;

  .issue-card {
    background: $bg;
    border: 2px solid $muted;
    border-radius: $radius;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 200px;

    &:hover {
      border-color: $brand;
      box-shadow: 0 4px 12px rgba($brand, 0.1);
    }

    &.open {
      border-color: $brand;

      .issue-header {
        border-bottom-color: rgba($brand, 0.2);
      }
    }

    &.resolved {
      border-color: $brand-2;
      background: rgba($brand-2, 0.02);

      .issue-header {
        border-bottom-color: rgba($brand-2, 0.2);
      }
    }

    &.archived {
      opacity: 0.6;
      background: rgba($muted, 0.02);
    }

    &.animating-out {
      animation: fadeOut 0.3s ease-out forwards;
      pointer-events: none;
    }

    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba($muted, 0.3);

      .issue-info {
        flex: 1;

        .issue-title {
          color: $text;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
        }

        .issue-id {
          color: $muted;
          font-size: 0.875rem;
          margin: 0;
        }
      }

      .issue-status {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: $radius;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;

          &.open {
            background: rgba($brand, 0.1);
            color: $brand;
          }

          &.resolved {
            background: rgba($brand-2, 0.1);
            color: $brand-2;
          }
        }
      }
    }

    .issue-preview {
      margin-bottom: 1rem;

      .issue-description {
        color: $text;
        line-height: 1.4;
        margin: 0 0 0.75rem 0;
      }

      .issue-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        .tag {
          padding: 0.25rem 0.5rem;
          border-radius: $radius;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }
      }
    }

    .issue-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;

      .last-comment {
        color: $muted;
        font-size: 0.875rem;
        font-style: italic;
      }

      .created-date {
        color: $muted;
        font-size: 0.75rem;
      }
    }

    .issue-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  }
}

.end-of-results {
  text-align: center;
  padding: 2rem;
  color: $muted;
  font-style: italic;
}

.popup-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@media (max-width: 768px) {
  .issues-page {
    padding: 1rem;
  }

  .filters-section {
    .filter-controls .filter-checkboxes {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  .issues-grid {
    grid-template-columns: 1fr;
    gap: 1rem;

    .issue-card {
      padding: 1rem;

      .issue-header {
        flex-direction: column;
        gap: 0.75rem;

        .issue-status {
          align-self: flex-start;
        }
      }
    }
  }
}
</style>
