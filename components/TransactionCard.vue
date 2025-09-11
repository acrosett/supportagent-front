<template>
  <div class="transaction-card" :class="{ 'list-view': viewMode === 'list' }">
    <div class="transaction-header">
      <div class="transaction-type">
        <AppIcon 
          :name="item.type === 'deposit' ? 'credit-card' : 'document'" 
          :class="['type-icon', item.type]"
        />
        <span class="type-text">{{ item.type === 'deposit' ? 'Deposit' : 'Spend' }}</span>
      </div>
      <div class="transaction-amount" :class="item.type">
        {{ item.type === 'deposit' ? '+' : '-' }}${{ Math.abs(item.amount).toFixed(2) }}
      </div>
    </div>

    <div class="transaction-content">
      <div class="transaction-meta">
        <div class="meta-item">
          <AppIcon name="time" class="meta-icon" />
          <span>{{ formatDate(item.createdAt) }}</span>
        </div>
        <div v-if="item.status" class="meta-item">
          <span class="status-badge" :class="item.status.toLowerCase()">
            {{ item.status }}
          </span>
        </div>
        <div v-if="item.isAutoTopUp" class="meta-item">
          <span class="auto-badge">Auto Top-up</span>
        </div>
      </div>

      <div v-if="item.description && viewMode === 'grid'" class="transaction-description">
        {{ truncateText(item.description, 80) }}
      </div>
      <div v-else-if="item.description && viewMode === 'list'" class="transaction-description">
        {{ item.description }}
      </div>
    </div>

    <div class="transaction-footer">
      <div class="transaction-id">
        ID: {{ item.id }}
      </div>
      <div class="transaction-actions">
        <AppButton 
          label="View" 
          color="secondary" 
          margin="no-margins"
          @click="$emit('view', item)"
        />
        <AppButton 
          label="Receipt" 
          color="secondary" 
          margin="no-margins"
          @click="$emit('download', item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TransactionItem {
  id: string
  type: 'deposit' | 'spend'
  amount: number
  createdAt: string | Date
  status?: string
  isAutoTopUp?: boolean
  description?: string
}

interface Props {
  item: TransactionItem
  viewMode: 'grid' | 'list'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [item: TransactionItem]
  download: [item: TransactionItem]
}>()

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}
</script>

<style scoped>
.transaction-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  transition: all 0.2s ease;
  height: fit-content;
}

.transaction-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.transaction-card.list-view {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-view .transaction-header {
  margin-bottom: 0;
  flex: 0 0 auto;
}

.transaction-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  width: 20px;
  height: 20px;
}

.type-icon.deposit {
  color: #10b981;
}

.type-icon.spend {
  color: #ef4444;
}

.type-text {
  font-weight: 500;
  color: #374151;
}

.transaction-amount {
  font-weight: 600;
  font-size: 18px;
}

.transaction-amount.deposit {
  color: #10b981;
}

.transaction-amount.spend {
  color: #ef4444;
}

.transaction-content {
  margin-bottom: 12px;
}

.list-view .transaction-content {
  margin-bottom: 0;
  flex: 1;
}

.transaction-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.list-view .transaction-meta {
  margin-bottom: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

.auto-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #e0e7ff;
  color: #3730a3;
}

.transaction-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.transaction-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.list-view .transaction-footer {
  padding-top: 0;
  border-top: none;
  flex: 0 0 auto;
}

.transaction-id {
  font-size: 12px;
  color: #9ca3af;
  font-family: monospace;
}

.transaction-actions {
  display: flex;
  gap: 8px;
}

.list-view .transaction-actions {
  flex-direction: row;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .transaction-card {
    padding: 12px;
  }
  
  .transaction-amount {
    font-size: 16px;
  }
  
  .transaction-footer {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .transaction-actions {
    justify-content: center;
  }
  
  .list-view .transaction-footer {
    flex-direction: row;
    align-items: center;
  }
  
  .list-view .transaction-actions {
    justify-content: flex-end;
  }
}
</style>
