<template>
  <div class="media-selector">
    <div class="selector-content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading media...</p>
      </div>
      
      <div v-else-if="availableMedia.length === 0" class="empty-state">
        <AppIcon name="media" size="xl" class="empty-icon" />
        <h3>No media available</h3>
        <p>Upload some media files first to select them for your script.</p>
      </div>
      
      <div v-else class="media-grid">
        <ImageCard
          v-for="media in sortedMedia"
          :key="media.id"
          v-memo="[media.id, isMediaSelected(media.id || ''), media.title, media.description, media.excitementLvl]"
          :title="media.title"
          :description="media.description"
          :image="media.image"
          :image-alt="media.title"
          :price="media.price"
          :badges="getMediaBadges(media)"
          :actions="getMediaActions(media)"
          :meta="getMediaMeta(media)"
          :selectable="hasValidId(media)"
          :selected="isMediaSelected(media.id || '')"
          :clickable="false"
          @select="handleMediaSelect(media, $event)"
        />
      </div>
    </div>
    
    <!-- Footer with actions -->
    <div class="selector-footer">
      <div class="selector-actions">
        <AppButton
          label="Cancel"
          color="secondary"
          margin="no-margins"
          @click="handleCancel"
        />
        <AppButton
          :label="selectedCount > 0 ? `Select Media (${selectedCount})` : 'Select Media'"
          color="primary"
          margin="no-margins"
          :disabled="selectedCount === 0"
          @click="handleConfirm"
        />
      </div>
    </div>
    
    <!-- Media Edit Popup -->
    <AppPopup
      :show="showMediaEdit"
      title="Edit Media"
      size="md"
      @close="handleCancelEdit"
    >
      <EditMedia
        :media="editingMedia"
        :is-saving="isSavingMedia"
        :clothes-options="clothesOptions"
        @save="handleSaveMedia"
        @cancel="handleCancelEdit"
      />
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ClothesOptions, MediaItem } from './EditMedia.vue';
import { Media } from '~/eicrud_exports/services/OF-ms/media/media.entity'
import { Clothes } from '~/eicrud_exports/services/OF-ms/clothes/clothes.entity'
import { getMediaUrl } from '~/utils/api-config'


interface Props {
  selectedMedias?: Media[]
  scriptClothes?: Clothes[]
  scriptId?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedMedias: () => [],
  scriptClothes: () => []
})

const emit = defineEmits<{
  confirm: [selectedMedia: MediaItem[]]
  cancel: []
}>()

// Generate clothes options from script clothes - computed only when needed
const clothesOptions = ref<ClothesOptions>({})

const generateClothesOptions = () => {
  const options: ClothesOptions = {}


  props.scriptClothes.forEach(clotheItem => {
    if (clotheItem?.name && typeof clotheItem.name === 'string') {
      const isAssociatedWithMedia = clotheItem.medias?.some((mediaId: string) => {
        return mediaId === editingMedia.value?.id
      }) || false


      options[clotheItem.name] = {
        id: clotheItem.id,
        value: isAssociatedWithMedia,
        label: clotheItem.name.charAt(0).toUpperCase() + clotheItem.name.slice(1)
      }
    } 
  })
  
  clothesOptions.value = options
}


// Reactive state
const isLoading = ref(false)
const availableMedia = ref<MediaItem[]>([])
const selectedMediaIds = ref<string[]>(props.selectedMedias.map(media => media.id))
const showMediaEdit = ref(false)
const editingMedia = ref<MediaItem | null>(null)
const isSavingMedia = ref(false)

const selectedCount = computed(() => selectedMediaIds.value.length)

// Sort media with selected items first
const sortedMedia = computed(() => {
  return [...availableMedia.value].sort((a, b) => {
    const aSelected = isMediaSelected(a.id || '')
    const bSelected = isMediaSelected(b.id || '')
    
    // Selected items first
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    
    // If both selected or both unselected, maintain original order
    return 0
  })
})

// Cache expensive operations with WeakMap for better performance
const actionsCache = new WeakMap()
const metaCache = new WeakMap()

// Optimize action creation - cache per media item
const getMediaActions = (media: MediaItem) => {
  if (!actionsCache.has(media)) {
    actionsCache.set(media, [
      {
        label: 'Edit',
        icon: 'edit' as const,
        color: 'secondary' as const,
        title: 'Edit media details',
        handler: () => handleEditMedia(media)
      }
    ])
  }
  return actionsCache.get(media)
}

// Optimize meta creation - cache per media item
const getMediaMeta = (media: MediaItem) => {
  if (!metaCache.has(media)) {
    const meta: Array<{ label: string; icon: 'time' | 'views' }> = media.createdAt ? [
      {
        label: formatDate(media.createdAt),
        icon: 'time'
      }
    ] : []
    
    if (media.views) {
      meta.push({
        label: `${media.views} views`,
        icon: 'views'
      })
    }
    
    metaCache.set(media, meta)
  }
  return metaCache.get(media)
}

// Generate badges array for media item
const getMediaBadges = (media: MediaItem) => {
  const badges: Array<{ label: string; color: string }> = []
  
  const excitementBadge = getExcitementBadge(media.excitementLvl)
  if (excitementBadge) {
    badges.push(excitementBadge)
  }
  
  return badges
}

// Generate excitement level badge with dynamic "hot" colors
const getExcitementBadge = (excitementLvl?: number): { label: string; color: string } | null => {
  if (excitementLvl === undefined || excitementLvl < 0) return null
  
  // Color gradient from cool to hot (0-6+)
  const colors = [
    '#6b7280', // 0 - Cool gray
    '#3b82f6', // 1 - Blue (cool)
    '#10b981', // 2 - Green (mild)
    '#f59e0b', // 3 - Amber (warm)
    '#f97316', // 4 - Orange (hot)
    '#ef4444', // 5 - Red (very hot)
    '#dc2626'  // 6+ - Dark red (blazing)
  ]
  
  const colorIndex = Math.min(excitementLvl, colors.length - 1)
  const color = colors[colorIndex] || '#6b7280' // Fallback to gray
  
  return {
    label: `EL: ${excitementLvl}`,
    color
  }
}

// Simple memoized function for selected state
const isMediaSelected = (mediaId: string) => selectedMediaIds.value.includes(mediaId)

// Check if media has a valid ID for selection
const hasValidId = (media: MediaItem): boolean => {
  return !!(media.id && !media.id.startsWith('temp_') && !media.id.startsWith('new_'))
}

// Cache date formatter
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

const formatDate = (date: Date) => dateFormatter.format(new Date(date))

const loadMedia = async () => {
  isLoading.value = true
  try {
    const modelId = useNuxtApp().$selectedModel.value?.id;
    if(!modelId) {
      throw new Error('No model selected');
    };
    const userId = useNuxtApp().$userId;

    const response = await useNuxtApp().$sp.ofApi.get_of_medias({
      modelId,
      ownerId: userId
    })

    availableMedia.value = response.map(media => ({
      image: getMediaUrl(media.url),
      ofId: media.ofId
    }))

    const createdMedias = await useNuxtApp().$sp.media.find({
      model: modelId,
      owner: userId
    }); // Populate clothes relationship

    //Merge createdMedias to any corresponding ofId in availableMedia
    createdMedias.data.forEach(createdMedia => {
      const index = availableMedia.value.findIndex(media => media.ofId === createdMedia.ofId);
      if (index !== -1) {
        availableMedia.value[index] = {
          ...availableMedia.value[index],
          ...createdMedia,
          // Ensure script is always a string if it exists
          script: typeof createdMedia.script === 'string' ? createdMedia.script : createdMedia.script?.id
        };
      }
    });

    // Filter availableMedia based on script rules
    availableMedia.value = availableMedia.value.filter(media => {
      
      return true;
      //FOR LATER WHEN DOING PPB BUNDLES
      
      // Always keep media that have no script and isSoloPPV is false or undefined
      if (!media.script && (!media.isSoloPPV)) {
        return true;
      }
      
      // If scriptId is provided, also keep media with matching script ID
      if (props.scriptId && media.script == props.scriptId) {
        return true;
      }
      
      // Filter out everything else
      return false;
    });

  } catch (error) {
    console.error('Failed to load media:', error)
    // useNuxtApp().$toast.show('Failed to load media', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleMediaSelect = (media: MediaItem, selected: boolean) => {
  // Check if media has a valid ID - if not, open edit popup instead of selecting
  if (!media.id || media.id.startsWith('temp_') || media.id.startsWith('new_')) {
    // Media doesn't have a valid ID, open edit popup to save it first
    handleEditMedia(media)
    return
  }
  
  // Immediate UI update for responsiveness
  if (selected) {
    if (media.id && !selectedMediaIds.value.includes(media.id)) {
      selectedMediaIds.value.push(media.id)
    }
  } else {
    selectedMediaIds.value = selectedMediaIds.value.filter(id => id !== media.id)
  }
  
  // Delayed popup opening to avoid blocking the UI
  if (selected && (!media.description || media.description.trim() === '')) {
    // Use setTimeout to not block the checkbox update
    setTimeout(() => {
      handleEditMedia(media)
    }, 50) // Small delay to let the UI update first
  }
}

const handleEditMedia = (media: MediaItem) => {
  editingMedia.value = { ...media }
  generateClothesOptions() // Generate clothes options when opening edit popup
  showMediaEdit.value = true
}

const handleMediaClick = (media: MediaItem) => {
  // This function is no longer used since we removed @click from ImageCard
  // but keeping it for potential future use
  handleEditMedia(media)
}

const handleSaveMedia = async (updatedMedia: MediaItem) => {
  isSavingMedia.value = true
  
  try {
    let savedMedia: MediaItem
    
    // Check if this is a create or update operation
    const isNewMedia = !updatedMedia.id || updatedMedia.id.startsWith('temp_') || updatedMedia.id.startsWith('new_')
          // Create new media
      const mediaPayload: Partial<Media> = {
        description: updatedMedia.description,
        excitementLvl: updatedMedia.excitementLvl,
        type: updatedMedia.type as any || 'image',
        ofId: updatedMedia.ofId,
        // Note: clothes are separate entities managed in edit-script, not saved directly on media
        owner: useNuxtApp().$userId,
        model: useNuxtApp().$selectedModel.value?.id
      }
    if (isNewMedia) {

      
      const createdMedia = await useNuxtApp().$sp.media.create(mediaPayload)
      savedMedia = {
        ...updatedMedia,
        id: createdMedia.id
      }
      
    } else {
 
      await useNuxtApp().$sp.media.patch(
        { 
          id: updatedMedia.id,
          owner: useNuxtApp().$userId,
          model: useNuxtApp().$selectedModel.value?.id
        }, 
        mediaPayload
      )
      
      savedMedia = updatedMedia

    }
    // Update clothes relationships bidirectionally
    // Loop through all scriptClothes to update their media associations
    props.scriptClothes.forEach(clotheItem => {
      if (clotheItem && clotheItem.id) {
      // Check if this clothes item should be associated with the media
      // updatedMedia.clothes is now ClothesOption[] from ChecklistInput
      const shouldBeAssociated = updatedMedia.clothes?.some((clothesOption: any) => {
        return clothesOption.id === clotheItem.id
      }) || false

      // Check if it's currently associated in the clothe's medias array
      const isCurrentlyAssociated = clotheItem.medias?.some((mediaId: string) => {
        return mediaId === savedMedia.id
      }) || false

      // Update the clothe's medias array to reflect the change
      if (shouldBeAssociated && !isCurrentlyAssociated) {
        // Add media to clothe's medias array
        if (!clotheItem.medias) {
        clotheItem.medias = []
        }
        clotheItem.medias.push(savedMedia.id as string)
        console.log(`[Clothes Update] Added media ${savedMedia.id} to clothe ${clotheItem.id}`)
      } else if (!shouldBeAssociated && isCurrentlyAssociated) {
        // Remove media from clothe's medias array
        if (clotheItem.medias) {
        clotheItem.medias = clotheItem.medias.filter((mediaId: string) => mediaId !== savedMedia.id)
        console.log(`[Clothes Update] Removed media ${savedMedia.id} from clothe ${clotheItem.id}`)
        }
      }
      }
    })


    generateClothesOptions()

    // Update local data
    const index = availableMedia.value.findIndex(m => m.id === updatedMedia.id)
    if (index !== -1) {
      availableMedia.value[index] = savedMedia
    }
    // Auto-select the media after saving (now it has a valid ID)
    if (savedMedia.id && !selectedMediaIds.value.includes(savedMedia.id)) {
      selectedMediaIds.value.push(savedMedia.id)
    }
    
    showMediaEdit.value = false
    editingMedia.value = null
    useNuxtApp().$toast.show(`Media ${isNewMedia ? 'created' : 'updated'} successfully`, 'success')
  } catch (error) {
    console.error('Failed to save media:', error)
    const action = (!updatedMedia.id || updatedMedia.id.startsWith('temp_') || updatedMedia.id.startsWith('new_')) ? 'create' : 'update'
    useNuxtApp().$toast.show(`Failed to ${action} media`, 'error')
  } finally {
    isSavingMedia.value = false
  }
}

const handleCancelEdit = () => {
  showMediaEdit.value = false
  editingMedia.value = null
  isSavingMedia.value = false
}

const handleConfirm = () => {
  const selectedMedia = availableMedia.value.filter(media => 
    media.id && selectedMediaIds.value.includes(media.id)
  )
  emit('confirm', selectedMedia)
}

const handleCancel = () => {
  emit('cancel')
}

// Load media on mount
onMounted(() => {
  loadMedia()
  generateClothesOptions() // Initialize clothes options on mount
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;
@use 'sass:color';

.media-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.selector-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 6rem; // Space for footer
}

.selector-footer {
  position: sticky;
  bottom: 0;
  background-color: $bg; // Use solid color instead of semi-transparent
  border-top: 1px solid rgba($ring, 0.1);
  border-radius: 1em 1em 0 0;
  padding: 1rem;
  z-index: 10;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: $muted;
}

.loading-state {
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba($brand, 0.1);
    border-top: 3px solid $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
}

.empty-state {
  .empty-icon {
    width: 64px;
    height: 64px;
    color: rgba($muted, 0.5);
    margin-bottom: 1rem;
    stroke-width: 1.5;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0;
    max-width: 300px;
  }
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.selector-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: relative;
  z-index: 11; // Higher than footer
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Mobile responsive
@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .selector-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
}
</style>
