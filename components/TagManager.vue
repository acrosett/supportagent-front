<template>
  <AppPopup
    :show="show"
    title="Manage Tags"
    @close="$emit('close')"
    max-width="600px"
  >
    <div class="tag-manager">
      <!-- Available Tags List -->
      <div class="available-tags-section">
        <h4>Available Tags</h4>
        <div v-if="availableTags.length === 0" class="no-tags">
          No tags available
        </div>
        <div v-else class="tags-list">
          <div 
            v-for="tag in availableTags" 
            :key="tag.id"
            class="tag-item"
          >
            <div class="tag-info">
              <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
              <span class="tag-name">{{ tag.name }}</span>
            </div>
            <div class="tag-actions">
              <AppButton
                v-if="!isTagSelected(tag.name)"
                label="Add to Issue"
                color="primary"
                size="sm"
                @click="addTagToIssue(tag.name)"
              />
              <AppButton
                v-else
                label="Remove from Issue"
                color="warning"
                size="sm"
                @click="removeTagFromIssue(tag.name)"
              />
              <AppButton
                color="error"
                size="sm"
                margin="left"
                fa-icon-left="trash"
                @click="showDeleteConfirmation(tag)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Create New Tag Button -->
      <div class="create-tag-section">
        <AppButton
          label="Create New Tag"
          color="ok"
          fa-icon-left="plus"
          @click="showCreateTagForm = true"
        />
      </div>
    </div>

    <!-- Create Tag Form Popup -->
    <AppPopup
      :show="showCreateTagForm"
      title="Create New Tag"
      @close="cancelCreateTag"
      max-width="500px"
    >
      <MegaForm
        :formClass="IssueTag"
        v-model="createTagEntity"
        :includeFields="['name', 'color']"
        :fieldOverrides="fieldOverrides"
        :actions="formActions"
      />
    </AppPopup>

    <!-- Delete Confirmation Popup -->
    <AppPopup
      :show="deleteConfirmation.show"
      title="Delete Tag"
      @close="cancelDeleteTag"
    >
      <p>Are you sure you want to delete the tag "{{ deleteConfirmation.tag?.name }}"?</p>
      <p class="warning-text">This will remove the tag from all issues that use it.</p>
      
      <div class="popup-actions">
        <AppButton
          label="Cancel"
          color="secondary"
          @click="cancelDeleteTag"
        />
        <AppButton
          label="Delete"
          color="error"
          margin="left"
          @click="confirmDeleteTag"
        />
      </div>
    </AppPopup>
  </AppPopup>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppPopup from '~/components/AppPopup.vue'
import MegaForm, { MegaFormAction, FieldOverride, OverrideRecord } from '~/components/MegaForm.vue'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { IssueTag } from '~/eicrud_exports/services/SUPPORT-ms/issue-tag/issue-tag.entity'

interface Props {
  show: boolean
  issueId?: string
  currentTags?: string[]
}

interface Emits {
  (e: 'close'): void
  (e: 'tagsUpdated', tags: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const availableTags = ref<IssueTag[]>([])
const isLoading = ref(false)
const showCreateTagForm = ref(false)
const localTags = ref<string[]>([])

// Create tag form
const createTagEntity = ref({
  name: '',
  color: '#6366f1'
})

// Field overrides for MegaForm
const fieldOverrides: OverrideRecord<IssueTag> = {
  color: {
    type: 'color',
    label: 'Tag Color',
    description: 'Choose a color for this tag'
  },
  name: {
    label: 'Tag Name',
    placeholder: 'Enter tag name...',
    description: 'A unique name for this tag'
  }
}

// Form actions for MegaForm
const formActions: MegaFormAction[] = [
  {
    label: 'Cancel',
    color: 'secondary',
    callback: () => {
      cancelCreateTag()
      return Promise.resolve()
    }
  },
  {
    label: 'Create Tag',
    color: 'primary',
    margin: 'left',
    callback: (formData: any) => createNewTag(formData)
  }
]

const updateCreateTagEntity = (newValue: any) => {
  createTagEntity.value = { ...newValue }
}

// Delete confirmation
const deleteConfirmation = reactive({
  show: false,
  tag: null as IssueTag | null
})

// Computed
const isTagSelected = (tagName: string): boolean => {
  return localTags.value.includes(tagName)
}

// Methods
const loadAvailableTags = async () => {
  try {
    isLoading.value = true
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    
    const response = await $sp.issueTag.find({
      product: nuxtApp.$userProductId
    }, {})
    
    availableTags.value = response.data || []
  } catch (error) {
    console.error('Error loading available tags:', error)
    useNuxtApp().$toast.show('Failed to load tags', 'error')
  } finally {
    isLoading.value = false
  }
}

const addTagToIssue = async (tagName: string) => {
  if (!props.issueId) {
    // Just update local state if no issueId (for creation mode)
    localTags.value.push(tagName)
    emit('tagsUpdated', [...localTags.value])
    return
  }

  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    
    // Get current issue
    const issue = await $sp.issue.findOne({ id: props.issueId, product: nuxtApp.$userProductId }, {})
    
    if (issue) {
      const updatedTags = [...(issue.tags || []), tagName]
      
      await $sp.issue.patch({
        id: props.issueId,
        product: nuxtApp.$userProductId
      }, {
        tags: updatedTags
      })
      
      localTags.value = updatedTags
      emit('tagsUpdated', updatedTags)
      useNuxtApp().$toast.show('Tag added to issue', 'success')
    }
  } catch (error) {
    console.error('Error adding tag to issue:', error)
    useNuxtApp().$toast.show('Failed to add tag', 'error')
  }
}

const removeTagFromIssue = async (tagName: string) => {
  if (!props.issueId) {
    // Just update local state if no issueId (for creation mode)
    localTags.value = localTags.value.filter(tag => tag !== tagName)
    emit('tagsUpdated', [...localTags.value])
    return
  }

  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    
    // Get current issue
    const issue = await $sp.issue.findOne({ id: props.issueId, product: nuxtApp.$userProductId }, {})
    
    if (issue) {
      const updatedTags = (issue.tags || []).filter((tag: string) => tag !== tagName)
      
      await $sp.issue.patch({
        id: props.issueId,
        product: nuxtApp.$userProductId
      }, {
        tags: updatedTags
      })
      
      localTags.value = updatedTags
      emit('tagsUpdated', updatedTags)
      useNuxtApp().$toast.show('Tag removed from issue', 'success')
    }
  } catch (error) {
    console.error('Error removing tag from issue:', error)
    useNuxtApp().$toast.show('Failed to remove tag', 'error')
  }
}

const createNewTag = async (tagData: any) => {
  try {
    const { $sp } = useNuxtApp()
    const nuxtApp = useNuxtApp()
    
    await $sp.issueTag.create({
      name: tagData.name,
      color: tagData.color,
      product: nuxtApp.$userProductId
    }, {})
    
    useNuxtApp().$toast.show('Tag created successfully', 'success')
    showCreateTagForm.value = false
    
    // Reset form
    createTagEntity.value = { name: '', color: '#6366f1' }
    
    // Reload tags
    await loadAvailableTags()
  } catch (error) {
    console.error('Error creating tag:', error)
    useNuxtApp().$toast.show('Failed to create tag', 'error')
  }
}

const cancelCreateTag = () => {
  showCreateTagForm.value = false
  createTagEntity.value = { name: '', color: '#6366f1' }
}

const showDeleteConfirmation = (tag: IssueTag) => {
  deleteConfirmation.tag = tag
  deleteConfirmation.show = true
}

const cancelDeleteTag = () => {
  deleteConfirmation.show = false
  deleteConfirmation.tag = null
}

const confirmDeleteTag = async () => {
  if (!deleteConfirmation.tag) return

  try {
    const { $sp } = useNuxtApp()
    
    await $sp.issueTag.delete({ id: deleteConfirmation.tag.id }, {})
    
    useNuxtApp().$toast.show('Tag deleted successfully', 'success')
    
    // Reload tags
    await loadAvailableTags()
  } catch (error) {
    console.error('Error deleting tag:', error)
    useNuxtApp().$toast.show('Failed to delete tag', 'error')
  }

  cancelDeleteTag()
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadAvailableTags()
    localTags.value = [...(props.currentTags || [])]
  }
})

// Lifecycle
onMounted(() => {
  if (props.show) {
    loadAvailableTags()
  }
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.tag-manager {
  .available-tags-section {
    margin-bottom: 2rem;
    
    h4 {
      margin: 0 0 1rem 0;
      color: $text;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .no-tags {
      color: $muted;
      font-style: italic;
      text-align: center;
      padding: 2rem;
    }
    
    .tags-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
      
      .tag-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: $panel;
        border: 1px solid $border;
        border-radius: $radius;
        
        .tag-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          
          .tag-color {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1px solid rgba($muted, 0.3);
          }
          
          .tag-name {
            color: $text;
            font-weight: 500;
          }
        }
        
        .tag-actions {
          display: flex;
          gap: 0.5rem;
        }
      }
    }
  }
  
  .create-tag-section {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid $border;
  }
}

.warning-text {
  color: $warning;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.popup-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>