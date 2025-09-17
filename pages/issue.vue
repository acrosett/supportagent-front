<template>
  <div class="page-container issue-details-page">
    <div class="issue-header">
      <div class="header-content">
        <AppButton
          fa-icon-left="chevron-left"
          label="Back to Issues"
          color="secondary"
          size="sm"
          @click="goBack"
        />
        <h1>Issue Details</h1>
        <div></div> <!-- Spacer for flexbox alignment -->
      </div>
    </div>

    <div class="issue-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading issue details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="!issue" class="error-state">
        <h3>Issue not found</h3>
        <p>The requested issue could not be found.</p>
        <AppButton
          label="Back to Issues"
          color="primary"
          @click="goBack"
        />
      </div>

      <!-- Issue Content -->
      <div v-else class="content-section">
      <!-- Issue Header -->
      <div class="issue-title">
        <div class="issue-title-section">
          <h2>{{ issue.title }}</h2>
          <div class="issue-meta">
            <span class="issue-id">ID: {{ issue.id?.substring(0, 8) }}...</span>
            <span class="created-date">Created: {{ formatDate(issue.createdAt) }}</span>
            <span 
              class="status-badge"
              :class="{ 'open': issue.status === IssueStatus.OPEN, 'resolved': issue.status === IssueStatus.RESOLVED }"
            >
              <AppIcon :name="issue.status === IssueStatus.OPEN ? 'time' : 'check'" size="sm" />
              {{ issue.status === IssueStatus.OPEN ? 'Open' : 'Resolved' }}
            </span>
          </div>
        </div>
        
        <div class="issue-actions">
          <AppButton
            :label="issue.status === IssueStatus.RESOLVED ? 'Reopen Issue' : 'Mark Resolved'"
            :color="issue.status === IssueStatus.RESOLVED ? 'secondary' : 'ok'"
            @click="toggleResolved"
          />
          <AppButton
            v-if="!issue.isArchived"
            margin="left"
            color="warning"
            fa-icon-left="archive"
            @click="showArchiveConfirmation"
          />
          <AppButton
            v-else
            margin="left"
            color="ok"
            fa-icon-left="fa-solid fa-rotate-left"
            @click="unarchiveIssue"
          />
        </div>
      </div>

      <!-- Tags Section -->
      <div class="tags-section">
        <div class="tags-header">
          <h4>Tags</h4>
          <AppButton
            label="Manage Tags"
            color="secondary"
            margin="left"
            size="sm"
            fa-icon-left="plus"
            @click="showTagManager = true"
          />
        </div>
        <div class="tags-list">
          <span 
            v-for="tag in issue.tags" 
            :key="tag" 
            class="tag"
            :style="{ backgroundColor: getTagColor(tag), color: '#fff' }"
          >
            {{ tag }}
            <button 
              @click="removeTagFromIssue(tag)" 
              class="remove-tag-btn"
              title="Remove tag"
            >
              ×
            </button>
          </span>
          <div v-if="!issue.tags || issue.tags.length === 0" class="no-tags">
            No tags assigned
          </div>
        </div>
      </div>

      <!-- Issue Description -->
      <div class="issue-description">
        <h4>Description</h4>
        <div class="description-content">
          {{ issue.description }}
        </div>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <h4>Comments ({{ comments.length }})</h4>
        
        <!-- Add Comment Form -->
        <div class="add-comment-form">
          <div class="comment-input-container">
            <textarea
              v-model="newComment"
              placeholder="Client Facing AI will be able to see this comment"
              rows="3"
              class="comment-input"
            ></textarea>
            <div class="comment-actions">
              <AppButton
                label="Add Comment"
                color="primary"
                size="sm"
                :disabled="!newComment.trim()"
                :loading="isAddingComment"
                @click="addComment"
              />
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
          <div v-if="comments.length === 0" class="no-comments">
            No comments yet.
          </div>
          
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <div class="comment-meta">
                <span class="comment-from">{{ getCommentFromLabel(comment.from) }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                <span v-if="comment.identifier" class="comment-identifier">
                  ID: {{ comment.identifier }}
                </span>
              </div>
              <div v-if="comment.from === CommentFrom.STAFF" class="comment-actions">
                <AppButton
                  color="error"
                  size="sm"
                  fa-icon-left="trash"
                  @click="deleteComment(comment)"
                />
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </div>

          <!-- Load More Comments -->
          <div v-if="hasMoreComments" class="load-more-section">
            <AppButton
              label="Load More Comments"
              color="secondary"
              size="sm"
              :loading="isLoadingMoreComments"
              @click="loadMoreComments"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
    
    <!-- Archive Confirmation Popup -->
    <AppPopup
      :show="archiveConfirmation.show"
      title="Archive Issue"
      @close="cancelArchive"
    >
      <p>Are you sure you want to archive this issue?</p>
      
      <div class="popup-actions">
        <AppButton
          label="Cancel"
          color="secondary"
          @click="cancelArchive"
        />
        <AppButton
          label="Archive"
          color="warning"
          margin="left"
          @click="confirmArchive"
        />
      </div>
    </AppPopup>

    
    <!-- Tag Manager -->
    <TagManager
      :show="showTagManager"
      :issueId="issue?.id"
      :currentTags="issue?.tags || []"
      @close="showTagManager = false"
      @tagsUpdated="handleTagsUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'
import TagManager from '~/components/TagManager.vue'
import { ref, reactive, onMounted } from 'vue'
import { Issue, IssueStatus } from '~/eicrud_exports/services/SUPPORT-ms/issue/issue.entity'
import { IssueComment, CommentFrom } from '~/eicrud_exports/services/SUPPORT-ms/issue-comment/issue-comment.entity'
import { IssueTag } from '~/eicrud_exports/services/SUPPORT-ms/issue-tag/issue-tag.entity'

// Get issue ID from query params
const route = useRoute()
const issueId = route.query.id as string

// Page state
const issue = ref<Issue | null>(null)
const comments = ref<IssueComment[]>([])
const isLoading = ref(true)
const isAddingComment = ref(false)
const isLoadingMoreComments = ref(false)
const hasMoreComments = ref(true)
const commentsOffset = ref(0)
const commentsPageSize = 20

// Tag management
const availableTags = ref<IssueTag[]>([])
const showTagManager = ref(false)

// Form state
const newComment = ref('')

// Modal states
const archiveConfirmation = reactive({
  show: false
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

const getTagColor = (tagName: string): string => {
  const tag = availableTags.value.find(t => t.name === tagName)
  return tag?.color || '#6366f1' // Default brand color
}

const handleTagsUpdated = (newTags: string[]) => {
  if (issue.value) {
    issue.value.tags = newTags
  }
}

const removeTagFromIssue = async (tagToRemove: string) => {
  if (!issue.value) return

  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    const updatedTags = (issue.value.tags || []).filter((tag: string) => tag !== tagToRemove)

    await $sp.issue.patch({
      id: issue.value.id!,
      product: nuxtApp.$userProductId
    }, {
      tags: updatedTags
    })

    issue.value.tags = updatedTags

    useNuxtApp().$toast.show('Tag removed successfully', 'success')
  } catch (error) {
    console.error('Error removing tag:', error)
    useNuxtApp().$toast.show('Failed to remove tag', 'error')
  }
}

const loadIssue = async () => {
  try {
    isLoading.value = true
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()

    // Load issue details
    const issueResponse = await $sp.issue.findOne({ id: issueId, product: nuxtApp.$userProductId }, {})
    issue.value = issueResponse

    // Load initial comments
    await loadComments(true)
  } catch (error) {
    console.error('Error loading issue:', error)
    useNuxtApp().$toast.show('Failed to load issue details', 'error')
  } finally {
    isLoading.value = false
  }
}

const loadComments = async (reset = false) => {
  try {
    if (reset) {
      commentsOffset.value = 0
      comments.value = []
      hasMoreComments.value = true
    }

    isLoadingMoreComments.value = true
    const { $sp } = useNuxtApp()

    const commentsResponse = await $sp.issueComment.find({
      issue: issueId as any,
      product: useNuxtApp().$userProductId as any
    }, {
      limit: commentsPageSize,
      offset: commentsOffset.value,
      orderBy: { createdAt: 'DESC' }
    })

    if (reset) {
      comments.value = commentsResponse.data || []
    } else {
      comments.value.push(...(commentsResponse.data || []))
    }

    hasMoreComments.value = (commentsResponse.data?.length || 0) === commentsPageSize
    commentsOffset.value += commentsPageSize
  } catch (error) {
    console.error('Error loading comments:', error)
    useNuxtApp().$toast.show('Failed to load comments', 'error')
  } finally {
    isLoadingMoreComments.value = false
  }
}

const loadMoreComments = () => {
  loadComments(false)
}

const addComment = async () => {
  if (!newComment.value.trim() || !issue.value) return

  try {
    isAddingComment.value = true
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()

    const comment = await $sp.issueComment.create({
      content: newComment.value.trim(),
      issue: issue.value.id! as any,
      from: CommentFrom.STAFF,
      product: nuxtApp.$userProductId as any
    })

    // Add to beginning of comments list
    comments.value.unshift(comment)
    newComment.value = ''

    useNuxtApp().$toast.show('Comment added successfully', 'success')
  } catch (error) {
    console.error('Error adding comment:', error)
    useNuxtApp().$toast.show('Failed to add comment', 'error')
  } finally {
    isAddingComment.value = false
  }
}

const deleteComment = async (comment: IssueComment) => {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }

  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()

    await $sp.issueComment.delete({
      id: comment.id,
      product: nuxtApp.$userProductId as any,
      from: comment.from,
    }, {})

    // Remove from comments list
    comments.value = comments.value.filter(c => c.id !== comment.id)

    useNuxtApp().$toast.show('Comment deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting comment:', error)
    useNuxtApp().$toast.show('Failed to delete comment', 'error')
  }
}

const toggleResolved = async () => {
  if (!issue.value) return

  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    const newStatus = issue.value.status === IssueStatus.RESOLVED ? IssueStatus.OPEN : IssueStatus.RESOLVED

    await $sp.issue.patch({
      id: issue.value.id!,
      product: nuxtApp.$userProductId
    }, {
      status: newStatus
    })

    issue.value.status = newStatus

    useNuxtApp().$toast.show(
      `Issue ${newStatus === IssueStatus.RESOLVED ? 'resolved' : 'reopened'} successfully`, 
      'success'
    )
  } catch (error) {
    console.error('Error updating issue status:', error)
    useNuxtApp().$toast.show('Failed to update issue status', 'error')
  }
}

const showArchiveConfirmation = () => {
  archiveConfirmation.show = true
}

const cancelArchive = () => {
  archiveConfirmation.show = false
}

const confirmArchive = async () => {
  if (!issue.value) return

  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()

    await $sp.issue.patch({
      id: issue.value.id!,
      product: nuxtApp.$userProductId
    }, {
      isArchived: true
    })

    issue.value.isArchived = true
    archiveConfirmation.show = false

    useNuxtApp().$toast.show('Issue archived successfully', 'success')
  } catch (error) {
    console.error('Error archiving issue:', error)
    useNuxtApp().$toast.show('Failed to archive issue', 'error')
  }
}

const unarchiveIssue = async () => {
  if (!issue.value) return

  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()

    await $sp.issue.patch({
      id: issue.value.id!,
      product: nuxtApp.$userProductId
    }, {
      isArchived: false
    })

    issue.value.isArchived = false

    useNuxtApp().$toast.show('Issue unarchived successfully', 'success')
  } catch (error) {
    console.error('Error unarchiving issue:', error)
    useNuxtApp().$toast.show('Failed to unarchive issue', 'error')
  }
}

const getCommentFromLabel = (from: CommentFrom): string => {
  switch (from) {
    case CommentFrom.STAFF:
      return 'Staff'
    case CommentFrom.AGENT:
      return 'AI Agent'
    default:
      return 'Unknown'
  }
}

const formatDate = (date?: Date | string): string => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  return d.toLocaleString()
}

const goBack = () => {
  navigateTo('/issues')
}

// Lifecycle
onMounted(() => {
  if (!issueId) {
    useNuxtApp().$toast.show('No issue ID provided', 'error')
    goBack()
    return
  }
  
  loadAvailableTags()
  loadIssue()
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

// Uses global .page-container for sizing

.issue-header {
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



.issue-content {
  display: grid;
  gap: 2rem;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  color: $muted;
  
  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid $border;
    border-top: 2px solid $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  h3 {
    color: $text;
    font-size: 1.5rem;
    margin: 0;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

.content-section {
  background: $panel;
  border-radius: $radius;
  padding: 2rem;
  box-shadow: $shadow;

  .issue-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid $border;
    
    .issue-title-section {
      flex: 1;
      
      h2 {
        color: $text;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.75rem 0;
        line-height: 1.3;
      }
      
      .issue-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        
        .issue-id, .created-date {
          color: $muted;
          font-size: 0.875rem;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: $radius;
          font-size: 0.75rem;
          font-weight: 500;
          
          &.open {
            background: rgba($brand, 0.1);
            color: $brand;
          }
          
          &.resolved {
            background: rgba($ok, 0.1);
            color: $ok;
          }
        }
      }
    }
    
    .issue-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  }
  
  .tags-section {
    padding: 1.5rem 0;
    border-bottom: 1px solid $border;
    
    .tags-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        color: $text;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
      }
    }
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      
      .tag {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: $radius;
        font-size: 0.875rem;
        font-weight: 500;
        color: white;
        position: relative;
        
        .remove-tag-btn {
          background: none;
          border: none;
          color: rgba(white, 0.8);
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          padding: 0;
          margin-left: 0.25rem;
          line-height: 1;
          border-radius: 2px;
          
          &:hover {
            color: white;
            background: rgba(black, 0.2);
          }
          
          &:focus {
            outline: none;
            background: rgba(black, 0.3);
          }
        }
      }
      
      .no-tags {
        color: $muted;
        font-style: italic;
      }
    }
  }
  
  .issue-description {
    padding: 1.5rem 0;
    border-bottom: 1px solid $border;
    
    h4 {
      color: $text;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }
    
    .description-content {
      color: $text;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }
  
  .comments-section {
    padding: 1.5rem 0;
    
    h4 {
      color: $text;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
    }
    
    .add-comment-form {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border: 1px solid $border;
      border-radius: $radius;
      
      .comment-input-container {
        .comment-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid $border;
          border-radius: $radius;
          background: $bg;
          color: $text;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          margin-bottom: 1rem;
          
          &:focus {
            outline: none;
            border-color: $brand;
            box-shadow: 0 0 0 2px rgba($brand, 0.1);
          }
          
          &::placeholder {
            color: $muted;
          }
        }
        
        .comment-actions {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
    
    .comments-list {
      .no-comments {
        text-align: center;
        color: $muted;
        font-style: italic;
        padding: 2rem;
        background: $panel;
        border: 1px solid $border;
        border-radius: $radius;
      }
      
      .comment-item {
        margin-bottom: 1rem;
        padding: 1.5rem;
        background: $panel;
        border: 1px solid $border;
        border-radius: $radius;
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          
          .comment-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            
            .comment-from {
              color: $brand;
              font-weight: 600;
              font-size: 0.875rem;
            }
            
            .comment-date, .comment-identifier {
              color: $muted;
              font-size: 0.75rem;
            }
          }
          
          .comment-actions {
            flex-shrink: 0;
          }
        }
        
        .comment-content {
          color: $text;
          line-height: 1.5;
          white-space: pre-wrap;
        }
      }
      
      .load-more-section {
        text-align: center;
        margin-top: 1.5rem;
      }
    }
  }
}

.popup-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.add-tag-content {
  margin-bottom: 1rem;
  
  label {
    display: block;
    color: $text;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .tag-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border;
    border-radius: $radius;
    background: $bg;
    color: $text;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: $brand;
      box-shadow: 0 0 0 2px rgba($brand, 0.1);
    }
    
    &::placeholder {
      color: $muted;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .issue-header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 2rem;
    }
  }
  
  .content-section {
    padding: 1.5rem;
    
    .issue-header {
      flex-direction: column;
      gap: 1rem;
      
      .issue-actions {
        align-self: stretch;
        justify-content: flex-start;
      }
    }
    
    .tags-section .tags-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }
}
</style>