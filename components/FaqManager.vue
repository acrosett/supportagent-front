<template>
  <section class="faq-manager">
    <header class="faq-header-row">
      <h2 class="faq-title">
        {{ t('header.title') }}
      </h2>
      <div class="header-actions">
        <AppButton
          :label="t('buttons.newFaq')"
          color="primary"
          :showPlusIcon="true"
          @click="startCreate"
        />
        <AppButton
          :label="t('buttons.documentUpload')"
          color="secondary"
          margin="left"
          @click="navigateToDocumentUpload"
        >
          <AppIcon name="document" size="sm" />
        </AppButton>
      </div>
    </header>

    <div class="faq-controls">
      <div class="search-box">
        <AppIcon name="search" size="sm" class="search-icon" />
        <input
          v-model="query"
          type="text"
          class="search-input"
          :placeholder="t('search.placeholder')"
        />
      </div>
      <div class="page-size">
        <label>{{ t('pagination.perPage') }}</label>
        <select v-model.number="pageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
    </div>

    <!-- List -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('states.loading') }}</p>
    </div>
    <div v-else-if="paginated.length === 0" class="empty-state">
      <p>{{ t('states.empty') }}</p>
    </div>
    <ul v-else class="faq-list">
      <li v-for="item in paginated" :key="item.id" class="faq-item">
        <div class="faq-item-head" @click="toggleAnswer(item.id)">
          <h3 class="faq-question">{{ item.question }}</h3>
          <div class="item-actions" @click.stop>
            <button class="icon-btn" :title="t('actions.toggleAnswer')" @click="toggleAnswer(item.id)">
              <AppIcon name="chevron-down" size="sm" :class="{ 'rotate-180': expandedItems.has(item.id) }" />
            </button>
            <button class="icon-btn" :title="t('actions.edit')" @click="openEditPopup(item)">
              <AppIcon name="edit" size="sm" />
            </button>
            <button class="icon-btn" :title="t('actions.delete')" @click="confirmDelete(item)">
              <AppIcon name="delete" size="sm" />
            </button>
          </div>
        </div>
        <div v-show="expandedItems.has(item.id)" class="faq-answer-container">
          <div class="faq-answer" v-html="renderMarkdown(item.answer || '')"></div>
        </div>
      </li>
    </ul>

    <!-- Pagination -->
    <div class="pagination" v-if="pages > 1">
      <button class="pager-btn" :disabled="page === 1" @click="page--">
        <AppIcon name="chevron-left" size="sm" /> {{ t('buttons.prev') }}
      </button>
      <span class="page-info">{{ t('pagination.pageInfo', { current: page, total: pages }) }}</span>
      <button class="pager-btn" :disabled="page === pages" @click="page++">
        {{ t('buttons.next') }} <AppIcon name="chevron-down" size="sm" class="rotate-270" />
      </button>
    </div>
  </section>

  <!-- Create FAQ Popup -->
  <AppPopup
    :show="showCreatePopup"
    :title="t('popups.create.title')"
    size="lg"
    @close="closeCreatePopup"
  >
    <MegaForm
      v-if="showCreatePopup"
      :formClass="Faq"
      v-model="createFormData"
      :fieldOverrides="createFieldOverrides"
      :includeFields="['question', 'answer', 'tags']"
      :actions="createActions"
    />
  </AppPopup>
  
  <!-- Edit FAQ Popup -->
  <AppPopup
    :show="showEditPopup"
    :title="t('popups.edit.title')"
    size="lg"
    @close="closeEditPopup"
  >
    <MegaForm
      v-if="showEditPopup && editingFaq"
      :formClass="Faq"
      v-model="editFormData"
      :fieldOverrides="editFieldOverrides"
      :includeFields="['question', 'answer', 'tags']"
      :actions="editActions"
    />
  </AppPopup>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from './AppButton.vue'
import AppIcon from './AppIcon.vue'
import AppPopup from './AppPopup.vue'
import MegaForm, { type MegaFormAction, type OverrideRecord } from './MegaForm.vue'
import { Faq } from '~/eicrud_exports/services/SUPPORT-ms/faq/faq.entity'
import type { SearchDto, SearchReturnDto } from '~/eicrud_exports/services/SUPPORT-ms/faq/cmds/search/search.dto'
import type { CrudOptions } from '~/eicrud_exports/CrudOptions'
import { useMarkdown } from '~/composables/useMarkdown'

const { $sp, $toast, $confirmPopup, $userProductId } = useNuxtApp()
const { renderMarkdown, highlightCodeBlocks } = useMarkdown()
import { useLocalNamespace } from '~/composables/useLocalNamespace'
const { t } = useLocalNamespace('faq-manager')

const items = ref<Faq[]>([])
const loading = ref(false)

const query = ref('')
const page = ref(1)
const pageSize = ref(10)

// Collapsible FAQ items
const expandedItems = ref<Set<string>>(new Set())

// Create popup state
const showCreatePopup = ref(false)
const createFormData = ref<Partial<Faq>>({
  question: '',
  answer: '',
  tags: []
})

// Edit popup state
const showEditPopup = ref(false)
const editingFaq = ref<Faq | null>(null)
const editFormData = ref<Partial<Faq>>({
  question: '',
  answer: '',
  tags: []
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(i =>
    i.question?.toLowerCase().includes(q) || i.answer?.toLowerCase().includes(q)
  )
})

const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paginated = computed(() => {
  page.value = Math.min(page.value, pages.value)
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const loadFaqs = async () => {
  if (!$userProductId) {
    items.value = []
    return
  }

  try {
    loading.value = true
    const trimmedQuery = query.value.trim()
    const searchDto: SearchDto = {
      product: $userProductId,
      text: trimmedQuery || undefined
    }
    const options: CrudOptions = {
      orderBy: {
        updatedAt: 'desc'
      },
      limit: 200
    }
    const result = await $sp.faq.search(searchDto, options) as SearchReturnDto | Faq[]
    const data = Array.isArray(result) ? result : (result?.data ?? [])
    items.value = data
    page.value = 1
    expandedItems.value.clear()
  } catch (error) {
    console.error('Failed to load FAQs:', error)
    $toast.show(error, 'error')
  } finally {
    loading.value = false
  }
}

function startCreate() {
  createFormData.value = {
    question: '',
    answer: '',
    tags: []
  }
  showCreatePopup.value = true
}

function closeCreatePopup() {
  showCreatePopup.value = false
  createFormData.value = {
    question: '',
    answer: '',
    tags: []
  }
}

// Collapsible FAQ functions
function toggleAnswer(id: string) {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

function openEditPopup(item: Faq) {
  editingFaq.value = item
  editFormData.value = {
    ...item,
    tags: Array.isArray(item.tags) ? [...item.tags] : []
  }
  showEditPopup.value = true
}

function closeEditPopup() {
  showEditPopup.value = false
  editingFaq.value = null
  editFormData.value = {
    question: '',
    answer: '',
    tags: []
  }
}

const sharedFieldOverrides: OverrideRecord = {
  answer: {
    type: 'richtext',
    label: t('form.fields.answer.label'),
    placeholder: t('form.fields.answer.placeholder')
  },
  tags: {
    label: t('form.fields.tags.label'),
    placeholder: t('form.fields.tags.placeholder')
  }
}

const createFieldOverrides = sharedFieldOverrides
const editFieldOverrides = sharedFieldOverrides

const createActions: MegaFormAction[] = [
  {
    label: t('form.buttons.cancel'),
    color: 'secondary',
    callback: async () => {
      closeCreatePopup()
    }
  },
  {
    label: t('form.buttons.create'),
    color: 'primary',
    callback: async (formData: Partial<Faq>) => {
      if (!$userProductId) return
      try {
        const payload = {
          ...formData,
          tags: Array.isArray(formData.tags)
            ? formData.tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0)
            : []
        }
        await $sp.faq.create({
          ...payload,
          product: $userProductId as any
        })
        $toast.show(t('messages.success.created'), 'success')
        closeCreatePopup()
        await loadFaqs()
      } catch (error) {
        console.error('Failed to create FAQ:', error)
        $toast.show(error, 'error')
      }
    }
  }
]

const editActions: MegaFormAction[] = [
  {
    label: t('form.buttons.cancel'),
    color: 'secondary',
    callback: async () => {
      closeEditPopup()
    }
  },
  {
    label: t('form.buttons.save'),
    color: 'primary',
    margin: 'left',
    callback: async (formData: Partial<Faq>) => {
      if (!editingFaq.value) return
      try {
        const { id, product, createdAt, updatedAt, ...rest } = formData
        const payload = {
          ...rest,
          tags: Array.isArray(formData.tags)
            ? formData.tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0)
            : []
        }
        await $sp.faq.patch({ id: editingFaq.value.id, product: useNuxtApp().$userProductId as any }, payload)
        $toast.show(t('messages.success.updated'), 'success')
        closeEditPopup()
        await loadFaqs()
      } catch (error) {
        console.error('Failed to update FAQ:', error)
        $toast.show(error, 'error')
      }
    }
  }
]

async function confirmDelete(item: Faq) {
  const confirmed = await $confirmPopup.show(
    t('messages.confirm.delete')
  )

  if (!confirmed) return

  try {
    await $sp.faq.delete({ id: item.id, product: useNuxtApp().$userProductId as any })
    $toast.show(t('messages.success.deleted'), 'success')
    await loadFaqs()
  } catch (error) {
    console.error('Failed to delete FAQ:', error)
    $toast.show(error, 'error')
  }
}

function navigateToDocumentUpload() {
  navigateTo('/document-upload')
}

watch(query, () => {
  page.value = 1
})

watch(pageSize, () => {
  page.value = 1
})

// Apply code highlighting when FAQ answers are expanded
watch(expandedItems, () => {
  highlightCodeBlocks('.faq-answer pre')
}, { deep: true })

onMounted(() => {
  loadFaqs()
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;
@use "sass:color";

.faq-manager {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 1.5rem;
}

.faq-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.faq-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: $text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon { opacity: 0.7; }

.faq-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
}
.search-input {
  width: 100%;
  padding: 0.6rem 0.9rem 0.6rem 2rem;
  border: 1px solid $muted;
  border-radius: $radius;
  background: $panel;
  color: $text;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $muted;
}
.page-size select {
  background: $panel;
  color: $text;
  border: 1px solid $muted;
  border-radius: $radius;
  padding: 0.3rem 0.5rem;
}

.faq-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.faq-item {
  border: 1px solid rgba($muted, 0.4);
  border-radius: $radius;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: $bg;
}
.faq-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.faq-question { color: $brand-2; margin: 0; font-size: 1.1rem; }

.faq-answer { 
  color: $text; 
  margin: 0.5rem 0 0 0; 
  
  // Basic typography
  p { margin: 0.5rem 0; line-height: 1.5; }
  ul, ol { margin: 0.5rem 0; padding-left: 1.5rem; }
  li { margin: 0.25rem 0; }
  strong { font-weight: 600; }
  em { font-style: italic; }
  
  // Code blocks styling
  pre { 
    position: relative;
    background: #1e1e22;
    color: #f5f5f5;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    overflow: auto;
    font-size: 0.875rem;
    line-height: 1.4;
    margin: 1rem 0;
    
    code { 
      background: transparent; 
      padding: 0; 
      display: block; 
      font-family: 'Courier New', Courier, monospace; 
    }
    
    // Copy button
    .code-copy-btn { 
      position: absolute; 
      top: 6px; 
      right: 6px; 
      background: #2d2d33; 
      color: #ddd; 
      border: 1px solid #3a3a42; 
      font-size: 0.65rem; 
      padding: 0.25rem 0.5rem; 
      border-radius: 4px; 
      cursor: pointer; 
      opacity: 0.85; 
      transition: background 0.15s, opacity 0.15s; 
      
      &:hover { 
        background: #3a3a42; 
        opacity: 1; 
      }
      
      &.copied { 
        background: $brand; 
        color: #fff; 
        border-color: $brand; 
      }
    }
  }
  
  // Inline code
  code { 
    background: rgba($muted, 0.1); 
    padding: 0.125rem 0.25rem; 
    border-radius: 3px; 
    font-size: 0.875em; 
    font-family: 'Courier New', Courier, monospace; 
  }
  
  // Links
  a { 
    color: $brand; 
    text-decoration: none;
    
    &:hover { 
      text-decoration: underline; 
    }
  }
  
  // Blockquotes
  blockquote { 
    border-left: 4px solid $brand; 
    padding-left: 1rem; 
    margin: 1rem 0; 
    font-style: italic; 
    color: $muted; 
  }
}

.item-actions { display: inline-flex; gap: 0.25rem; }
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 6px;
  border: 1px solid rgba($muted, 0.5);
  background: $panel;
  color: $text;
}
.icon-btn:hover { background: rgba($muted, 0.1); }

.faq-editor { margin: 0.75rem 0 0 0; display: grid; gap: 0.5rem; }
.faq-input {
  padding: 0.6rem 0.9rem;
  border: 1px solid $muted;
  border-radius: $radius;
  background: $panel;
  color: $text;
}
.faq-textarea {
  min-height: 120px;
  padding: 0.6rem 0.9rem;
  border: 1px solid $muted;
  border-radius: $radius;
  background: $panel;
  color: $text;
}
.editor-actions { display: flex; gap: 0.5rem; }

.pagination {
  margin-top: 1rem;
  display: flex; align-items: center; justify-content: center; gap: 1rem;
}
.pager-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 0.7rem; border: 1px solid $muted; background: $panel; color: $text; border-radius: $radius;
}
.page-info { color: $muted; }
.rotate-270 { transform: rotate(-90deg); }
.rotate-180 { transform: rotate(180deg); }

.empty-state { text-align: center; color: $muted; padding: 1rem 0; }

// Collapsible FAQ styles
.faq-item-head {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: $panel;
  border: 1px solid $muted;
  border-radius: $radius;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: color.adjust($panel, $lightness: 3%);
  }
}

.faq-item-title {
  flex: 1;
  font-weight: 600;
  margin-right: 1rem;
}

.faq-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid $muted;
  background: $bg;
  border-radius: $radius;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: $muted;
  }
  
  .app-icon {
    transition: transform 0.2s ease;
  }
  
  &.toggle-btn .app-icon.rotate-180 {
    transform: rotate(180deg);
  }
}

.faq-answer-container {
  margin-top: 0.5rem;
  padding: 1rem;
  background: $bg;
  border: 1px solid $muted;
  border-top: none;
  border-radius: 0 0 $radius $radius;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

// Popup styles
.delete-confirmation {
  text-align: center;
  padding: 1rem;
}

.delete-question {
  margin: 1rem 0;
  padding: 0.75rem;
  background: $bg;
  border-radius: $radius;
  font-style: italic;
}

.delete-warning {
  color: $warning;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.delete-footer {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

// Mobile responsive styles
@media (max-width: 768px) {
  .faq-manager {
    padding: 1rem;
    margin: 0 auto;
    max-width: 100%;
  }

  .faq-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    text-align: center;
  }

  .faq-title {
    justify-content: center;
    font-size: 1.25rem;
  }

  .faq-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-box {
    order: 1;
  }

  .page-size {
    order: 2;
    justify-content: center;
  }

  .faq-item {
    padding: 0.75rem;
  }

  .faq-item-head {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .faq-question {
    text-align: center;
    font-size: 1rem;
  }

  .item-actions {
    justify-content: center;
  }

  .faq-answer-container {
    padding: 0.75rem;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pager-btn {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }

  .page-info {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
}
</style>
