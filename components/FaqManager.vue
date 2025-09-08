<template>
  <section class="faq-manager">
    <header class="faq-header-row">
      <h2 class="faq-title">
        Frequently Asked Questions
      </h2>
      <div class="header-actions">
        <AppButton
          label="New FAQ"
          color="primary"
          :showPlusIcon="true"
          @click="startCreate"
        />
        <AppButton
          label="Document Upload"
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
          placeholder="Search FAQs..."
        />
      </div>
      <div class="page-size">
        <label>Per page</label>
        <select v-model.number="pageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
    </div>

    <!-- Create form -->
    <div v-if="mode === 'create'" class="faq-editor">
      <input v-model="draft.question" class="faq-input" placeholder="Question" />
      <textarea v-model="draft.answer" class="faq-textarea" placeholder="Answer"></textarea>
      <div class="editor-actions">
        <AppButton label="Save" color="ok" @click="saveCreate" />
        <AppButton label="Cancel" color="secondary" @click="cancelEdit" />
      </div>
    </div>

    <!-- List -->
    <div v-if="paginated.length === 0" class="empty-state">
      <p>No FAQs match your search.</p>
    </div>
    <ul v-else class="faq-list">
      <li v-for="item in paginated" :key="item.id" class="faq-item">
        <div class="faq-item-head" @click="toggleAnswer(item.id)">
          <h3 class="faq-question">{{ item.question }}</h3>
          <div class="item-actions" @click.stop>
            <button class="icon-btn" title="Toggle answer" @click="toggleAnswer(item.id)">
              <AppIcon name="chevron-down" size="sm" :class="{ 'rotate-180': expandedItems.has(item.id) }" />
            </button>
            <button class="icon-btn" title="Edit" @click="openEditPopup(item)">
              <AppIcon name="edit" size="sm" />
            </button>
            <button class="icon-btn" title="Delete" @click="openDeleteConfirmation(item)">
              <AppIcon name="delete" size="sm" />
            </button>
          </div>
        </div>
        <div v-show="expandedItems.has(item.id)" class="faq-answer-container">
          <p class="faq-answer">{{ item.answer }}</p>
        </div>
      </li>
    </ul>

    <!-- Pagination -->
    <div class="pagination" v-if="pages > 1">
      <button class="pager-btn" :disabled="page === 1" @click="page--">
        <AppIcon name="chevron-left" size="sm" /> Prev
      </button>
      <span class="page-info">Page {{ page }} / {{ pages }}</span>
      <button class="pager-btn" :disabled="page === pages" @click="page++">
        Next <AppIcon name="chevron-down" size="sm" class="rotate-270" />
      </button>
    </div>
  </section>
  
  <!-- Edit FAQ Popup -->
  <AppPopup
    :show="showEditPopup"
    title="Edit FAQ"
    size="lg"
    @close="closeEditPopup"
  >
    <MegaForm
      v-if="showEditPopup && editingFaq"
      :formClass="Faq"
      v-model="editFormData"
      :fieldOverrides="editFieldOverrides"
      :excludeFields="['id', 'owner', 'product', 'createdAt', 'updatedAt']"
      :actions="editActions"
    />
  </AppPopup>

  <!-- Delete Confirmation Popup -->
  <AppPopup
    :show="showDeleteConfirmation"
    title="Delete FAQ"
    size="sm"
    @close="closeDeleteConfirmation"
  >
    <div class="delete-confirmation">
      <p>Are you sure you want to delete this FAQ?</p>
      <div class="delete-question">
        <strong>"{{ deletingFaq?.question }}"</strong>
      </div>
      <p class="delete-warning">This action cannot be undone.</p>
    </div>
    <template #footer>
      <div class="delete-footer">
        <AppButton label="Cancel" color="secondary" @click="closeDeleteConfirmation" />
        <AppButton label="Delete FAQ" color="error" @click="confirmDelete" />
      </div>
    </template>
  </AppPopup>
  
</template>

<script setup lang="ts">
import AppButton from './AppButton.vue'
import AppIcon from './AppIcon.vue'
import AppPopup from './AppPopup.vue'
import MegaForm, { type FieldOverride, type MegaFormAction, type OverrideRecord } from './MegaForm.vue'
import { Faq } from '~/eicrud_exports/services/SUPPORT-ms/faq/faq.entity'

type FaqItem = {
  id: string
  question: string
  answer: string
  updatedAt: string
}

// Local demo data; replace with server data when wiring API
const items = ref<FaqItem[]>([
  { id: crypto.randomUUID(), question: 'How do I reset my password?', answer: 'Go to Account Settings > Security and click “Reset Password”.', updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), question: 'Can I export my data?', answer: 'Yes, visit Account > Data Export to download your data.', updatedAt: new Date().toISOString() },
])

const query = ref('')
const page = ref(1)
const pageSize = ref(10)

const mode = ref<'idle' | 'create' | 'edit'>('idle')
const editingId = ref<string | null>(null)
const draft = reactive({ question: '', answer: '' })

// Collapsible FAQ items
const expandedItems = ref<Set<string>>(new Set())

// Edit popup state
const showEditPopup = ref(false)
const editingFaq = ref<FaqItem | null>(null)
const editFormData = ref({})

// Delete confirmation state
const showDeleteConfirmation = ref(false)
const deletingFaq = ref<FaqItem | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(i =>
    i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q)
  )
})

const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paginated = computed(() => {
  page.value = Math.min(page.value, pages.value)
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function resetDraft() {
  draft.question = ''
  draft.answer = ''
}

function startCreate() {
  resetDraft()
  editingId.value = null
  mode.value = 'create'
}

function startEdit(item: FaqItem) {
  draft.question = item.question
  draft.answer = item.answer
  editingId.value = item.id
  mode.value = 'edit'
}

function cancelEdit() {
  resetDraft()
  editingId.value = null
  mode.value = 'idle'
}

function saveCreate() {
  if (!draft.question.trim() || !draft.answer.trim()) return
  items.value.unshift({
    id: crypto.randomUUID(),
    question: draft.question.trim(),
    answer: draft.answer.trim(),
    updatedAt: new Date().toISOString()
  })
  cancelEdit()
}

function saveEdit() {
  if (!editingId.value) return
  const idx = items.value.findIndex(i => i.id === editingId.value)
  const current = idx >= 0 ? items.value[idx] : undefined
  if (current) {
    items.value[idx] = {
      id: current.id,
      question: draft.question.trim(),
      answer: draft.answer.trim(),
      updatedAt: new Date().toISOString()
    }
  }
  cancelEdit()
}

// Collapsible FAQ functions
function toggleAnswer(id: string) {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

// Edit popup functions
function openEditPopup(item: FaqItem) {
  editingFaq.value = item
  editFormData.value = { ...item }
  showEditPopup.value = true
}

function closeEditPopup() {
  showEditPopup.value = false
  editingFaq.value = null
  editFormData.value = {}
}

const editFieldOverrides: OverrideRecord = {
  answer: {
    type: 'richtext',
    label: 'Answer',
    placeholder: 'Enter the FAQ answer...'
  },
  tags: {
    label: 'Tags (comma-separated)',
    placeholder: 'Enter tags separated by commas',
    type: 'textarea'
  }
}

const editActions: MegaFormAction[] = [
  {
    label: 'Cancel',
    color: 'secondary',
    callback: async () => {
      closeEditPopup()
    }
  },
  {
    label: 'Save Changes',
    color: 'primary',
    callback: async (formData: any) => {
      // Update the FAQ item
      const index = items.value.findIndex(item => item.id === editingFaq.value?.id)
      if (index !== -1 && editingFaq.value) {
        items.value[index] = {
          id: editingFaq.value.id,
          question: formData.question,
          answer: formData.answer,
          updatedAt: new Date().toISOString()
        }
      }
      closeEditPopup()
    }
  }
]

// Delete confirmation functions
function openDeleteConfirmation(item: FaqItem) {
  deletingFaq.value = item
  showDeleteConfirmation.value = true
}

function closeDeleteConfirmation() {
  showDeleteConfirmation.value = false
  deletingFaq.value = null
}

function confirmDelete() {
  if (deletingFaq.value) {
    items.value = items.value.filter(i => i.id !== deletingFaq.value!.id)
    closeDeleteConfirmation()
  }
}

// Navigation functions
function navigateToDocumentUpload() {
  navigateTo('/document-upload')
}
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
.faq-answer { color: $text; margin: 0.5rem 0 0 0; white-space: pre-wrap; }

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