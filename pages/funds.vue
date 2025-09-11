<template>
  <div class="page-container">
    <div class="funds-header">
      <h1>Funds & Billing</h1>
      <p>Manage your account balance, deposits, and spending limits.</p>
    </div>

    <!-- Balance Section -->
    <div class="balance-section">
      <div class="balance-card">
        <div class="balance-info">
          <h2>Account Balance</h2>
          <div class="balance-amount">
            <span class="currency">$</span>
            <span class="amount">{{ formatBalance(currentProduct?.balance || 0) }}</span>
          </div>
          <p class="balance-subtitle" v-if="currentProduct?.lastComputedBalance">
            Last updated {{ formatDate(currentProduct.lastComputedBalance) }}
          </p>
        </div>
        
        <div class="balance-actions">
          <AppButton
            label="Add Funds"
            color="primary"
            show-plus-icon
            @click="showAddFundsPopup = true"
          />
          <AppButton
            label="Auto Top-up"
            color="secondary"
            @click="showAutoTopUpPopup = true"
          />
        </div>
      </div>

      <!-- Auto Top-up Status -->
      <div v-if="currentProduct?.autoTopUpEnabled" class="auto-topup-status">
        <AppIcon name="check" size="sm" />
        <span>Auto top-up enabled: ${{ currentProduct.autoTopUpAmount }} when balance drops below ${{ formatBalance((currentProduct.autoTopUpAmount || 0) * 0.1) }}</span>
      </div>
    </div>

    <!-- Spending Limit Section -->
    <div class="spending-section">
      <h3>Monthly Spending Limit</h3>
      <div class="spending-limit">
        <div class="limit-input">
          <label for="monthlyLimit">Maximum monthly spending</label>
          <input
            id="monthlyLimit"
            v-model="monthlySpendingLimit"
            type="number"
            min="0"
            step="10"
            placeholder="No limit"
            @blur="updateSpendingLimit"
          />
        </div>
        <div class="limit-info">
          <span v-if="monthlySpendingLimit">
            Limit: ${{ formatBalance(monthlySpendingLimit) }}/month
          </span>
          <span v-else class="no-limit">No spending limit set</span>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="history-section">
      <h3>Transaction History</h3>
      
      <!-- Search and Paginate Component -->
      <SearchAndPaginate
        :entity-class="mockTransactionClass"
        :items="transactions"
        :total-items="totalTransactions"
        :current-page="currentPage"
        :total-pages="totalPages"
        :loading="loading"
        :card-component="TransactionCard"
        :filter-overrides="transactionFilterOverrides"
        :sort-options="transactionSortOptions"
        entity-name="transaction"
        empty-title="No transactions found"
        empty-message="Your transaction history will appear here once you make deposits or spend credits."
        empty-icon="credit-card"
        filter-title="Transaction Filters"
        @query-change="handleTransactionQuery"
        @page-change="handlePageChange"
        @refresh="loadTransactions"
        @clear="handleClearFilters"
      />
    </div>

    <!-- Add Funds Popup -->
    <AppPopup
      :show="showAddFundsPopup"
      title="Add Funds"
      @close="showAddFundsPopup = false"
    >
      <div class="add-funds-form">
        <div class="amount-input">
          <label for="depositAmount">Amount to add</label>
          <div class="amount-field">
            <span class="currency-symbol">$</span>
            <input
              id="depositAmount"
              v-model="depositAmount"
              type="number"
              min="1"
              step="1"
              placeholder="0"
            />
          </div>
        </div>
        
        <div class="quick-amounts">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            class="quick-amount"
            @click="depositAmount = amount"
          >
            ${{ amount }}
          </button>
        </div>

        <div class="popup-actions">
          <AppButton
            label="Cancel"
            color="secondary"
            @click="showAddFundsPopup = false"
          />
          <AppButton
            label="Add Funds"
            color="primary"
            :disabled="!depositAmount || depositAmount < 1"
            :loading="depositLoading"
            @click="handleAddFunds"
          />
        </div>
      </div>
    </AppPopup>

    <!-- Auto Top-up Popup -->
    <AppPopup
      :show="showAutoTopUpPopup"
      title="Auto Top-up Settings"
      @close="showAutoTopUpPopup = false"
    >
      <div class="auto-topup-form">
        <div class="topup-explanation">
          <p>Set up automatic billing to maintain your account balance.</p>
        </div>

        <div class="amount-input">
          <label for="autoTopUpAmount">Top-up amount</label>
          <div class="amount-field">
            <span class="currency-symbol">$</span>
            <input
              id="autoTopUpAmount"
              v-model="autoTopUpAmount"
              type="number"
              min="10"
              step="10"
              placeholder="0"
            />
          </div>
        </div>

        <div class="trigger-info" v-if="autoTopUpAmount">
          <AppIcon name="info" size="sm" />
          <p>
            When your balance drops below 
            <strong>${{ formatBalance(autoTopUpAmount * 0.1) }}</strong> (10% of top-up amount),
            you will be automatically billed up to <strong>${{ formatBalance(autoTopUpAmount) }}</strong>.
          </p>
        </div>

        <div class="current-status" v-if="currentProduct?.autoTopUpEnabled">
          <div class="status-item">
            <span>Current auto top-up:</span>
            <span class="status-value">${{ currentProduct.autoTopUpAmount }}</span>
          </div>
          <div class="status-item">
            <span>Trigger threshold:</span>
            <span class="status-value">${{ formatBalance((currentProduct.autoTopUpAmount || 0) * 0.1) }}</span>
          </div>
        </div>

        <div class="popup-actions">
          <AppButton
            v-if="currentProduct?.autoTopUpEnabled"
            label="Disable Auto Top-up"
            color="error"
            @click="handleDisableAutoTopUp"
          />
          <AppButton
            label="Cancel"
            color="secondary"
            @click="showAutoTopUpPopup = false"
          />
          <AppButton
            label="Save Settings"
            color="primary"
            :disabled="!autoTopUpAmount || autoTopUpAmount < 10"
            :loading="autoTopUpLoading"
            @click="handleSaveAutoTopUp"
          />
        </div>
      </div>
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { Deposit } from '~/eicrud_exports/services/BANK-ms/deposit/deposit.entity'
import { Spend } from '~/eicrud_exports/services/BANK-ms/spend/spend.entity'
import { StripeDepositDto } from '~/eicrud_exports/services/BANK-ms/product-vault/cmds/stripe_deposit/stripe_deposit.dto'
import SearchAndPaginate from '~/components/SearchAndPaginate.vue'
import TransactionCardComponent from '~/components/TransactionCard.vue'

// Mock transaction class for filtering
class MockTransaction {
  id: string = ''
  type: 'deposit' | 'spend' = 'deposit'
  amount: number = 0
  createdAt: Date = new Date()
  status?: string
  isAutoTopUp: boolean = false
  description: string = ''
}

definePageMeta({
  layout: 'default'
})

// Reactive state
const { $sp } = useNuxtApp()
const { $toast } = useNuxtApp()

const currentProduct = ref<Product | null>(null)
const loading = ref(true)
const depositLoading = ref(false)
const autoTopUpLoading = ref(false)

// Popup states
const showAddFundsPopup = ref(false)
const showAutoTopUpPopup = ref(false)

// Form data
const depositAmount = ref<number>()
const autoTopUpAmount = ref<number>()
const monthlySpendingLimit = ref<number>()

// Transaction history
const transactions = ref<any[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalTransactions = ref(0)
const activeFilter = ref('all')

// SearchAndPaginate props and configuration
const mockTransactionClass = MockTransaction
const TransactionCard = TransactionCardComponent

const transactionFilterOverrides = [
  {
    fieldName: 'type',
    type: 'select',
    label: 'Transaction Type',
    selectOptions: [
      { label: 'Deposit', value: 'deposit' },
      { label: 'Spend', value: 'spend' }
    ]
  },
  {
    fieldName: 'status',
    type: 'select',
    label: 'Status',
    selectOptions: [
      { label: 'Completed', value: 'completed' },
      { label: 'Pending', value: 'pending' },
      { label: 'Failed', value: 'failed' }
    ]
  },
  {
    fieldName: 'isAutoTopUp',
    type: 'checkbox',
    label: 'Auto Top-up Only'
  }
]

const transactionSortOptions = [
  { label: 'Newest First', value: 'createdAt', direction: 'desc' as const },
  { label: 'Oldest First', value: 'createdAt', direction: 'asc' as const },
  { label: 'Amount (High to Low)', value: 'amount', direction: 'desc' as const },
  { label: 'Amount (Low to High)', value: 'amount', direction: 'asc' as const },
  { label: 'Type', value: 'type', direction: 'asc' as const }
]

const quickAmounts = [10, 25, 50, 100, 250, 500]

const transactionFilters = [
  { label: 'All', value: 'all' },
  { label: 'Deposits', value: 'deposits' },
  { label: 'Spending', value: 'spending' }
]

// Load initial data
onMounted(async () => {
  await loadProduct()
  await loadTransactions()
  loading.value = false
})

const loadProduct = async () => {
  try {
    // Create mock product data for now
    currentProduct.value = {
      id: 'mock-product-1',
      name: 'Demo Product',
      balance: 127.50,
      lastComputedBalance: new Date(),
      autoTopUpEnabled: false,
      maxDepositPerMonth: 500,
      autoTopUpAmount: undefined,
      autoTopUpFailureCount: 0,
      subscriptionActive: true,
      chatOn: true,
      owner: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Product
    
    if (currentProduct.value) {
      monthlySpendingLimit.value = currentProduct.value.maxDepositPerMonth
      autoTopUpAmount.value = currentProduct.value.autoTopUpAmount
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    $toast.show('Failed to load account information', 'error')
  }
}

const loadTransactions = async () => {
  if (!currentProduct.value) return
  
  try {
    // For now, create mock data until the proper API endpoints are available
    const mockTransactions = [
      {
        id: '1',
        type: 'deposit' as const,
        amount: 50.00,
        createdAt: new Date('2024-12-01'),
        status: 'completed',
        isAutoTopUp: false,
        description: 'Credit card deposit'
      },
      {
        id: '2', 
        type: 'spend' as const,
        amount: 12.50,
        createdAt: new Date('2024-12-02'),
        description: 'AI thinking spend'
      }
    ]
    
    transactions.value = mockTransactions
    totalTransactions.value = mockTransactions.length
    totalPages.value = Math.ceil(totalTransactions.value / 20)
    
  } catch (error) {
    console.error('Failed to load transactions:', error)
    $toast.show('Failed to load transaction history', 'error')
  }
}

const handleAddFunds = async () => {
  if (!depositAmount.value || !currentProduct.value) return
  
  depositLoading.value = true
  try {
    const depositDto: StripeDepositDto = {
      amount: depositAmount.value * 100, // Convert to cents
    }
    
    const result = await $sp.productVault.stripe_deposit(depositDto)
    
    // Redirect to Stripe checkout
    if (result.sessionUrl) {
      window.location.href = result.sessionUrl
    }
    
  } catch (error) {
    console.error('Failed to initiate deposit:', error)
    $toast.show('Failed to process payment', 'error')
  } finally {
    depositLoading.value = false
  }
}

const handleSaveAutoTopUp = async () => {
  if (!autoTopUpAmount.value || !currentProduct.value) return
  
  autoTopUpLoading.value = true
  try {
    // Mock implementation - replace with actual API call
    currentProduct.value.autoTopUpEnabled = true
    currentProduct.value.autoTopUpAmount = autoTopUpAmount.value
    
    $toast.show('Auto top-up settings saved', 'success')
    showAutoTopUpPopup.value = false
    
  } catch (error) {
    console.error('Failed to save auto top-up settings:', error)
    $toast.show('Failed to save settings', 'error')
  } finally {
    autoTopUpLoading.value = false
  }
}

const handleDisableAutoTopUp = async () => {
  if (!currentProduct.value) return
  
  autoTopUpLoading.value = true
  try {
    // Mock implementation - replace with actual API call
    currentProduct.value.autoTopUpEnabled = false
    currentProduct.value.autoTopUpAmount = undefined
    
    $toast.show('Auto top-up disabled', 'success')
    showAutoTopUpPopup.value = false
    
  } catch (error) {
    console.error('Failed to disable auto top-up:', error)
    $toast.show('Failed to disable auto top-up', 'error')
  } finally {
    autoTopUpLoading.value = false
  }
}

const updateSpendingLimit = async () => {
  if (!currentProduct.value) return
  
  try {
    // Mock implementation - replace with actual API call
    currentProduct.value.maxDepositPerMonth = monthlySpendingLimit.value
    $toast.show('Spending limit updated', 'success')
    
  } catch (error) {
    console.error('Failed to update spending limit:', error)
    $toast.show('Failed to update spending limit', 'error')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadTransactions()
}

const formatBalance = (amount: number): string => {
  return amount.toFixed(2)
}

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// SearchAndPaginate event handlers
const handleTransactionQuery = (query: any) => {
  console.log('Transaction query changed:', query)
  // Here you would typically call your API with the query
  // For now, we'll just log the query
}

const handleClearFilters = () => {
  console.log('Filters cleared')
  // Here you would typically reset any additional state
  // The SearchAndPaginate component handles its own internal state
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.funds-header {
  margin-bottom: 2rem;
  
  h1 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
  }
}

.balance-section {
  margin-bottom: 3rem;
}

.balance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.balance-info {
  h2 {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  
  .currency {
    font-size: 1.5rem;
    color: var(--text-secondary);
  }
  
  .amount {
    font-size: 3rem;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.balance-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.balance-actions {
  display: flex;
  gap: 1rem;
}

.auto-topup-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--success-background);
  color: var(--success-color);
  border-radius: 8px;
  font-size: 0.875rem;
}

.spending-section {
  margin-bottom: 3rem;
  
  h3 {
    margin-bottom: 1rem;
  }
}

.spending-limit {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.limit-input {
  flex: 1;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--background-primary);
    color: var(--text-primary);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.limit-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
  
  .no-limit {
    color: var(--warning-color);
  }
}

.history-section {
  h3 {
    margin-bottom: 1.5rem;
  }
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.filter-tab {
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--text-primary);
  }
  
  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
  
  h4 {
    margin: 1rem 0 0.5rem;
  }
}

.transactions-list {
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
}

.transaction-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--background-tertiary);
}

.transaction-details {
  flex: 1;
}

.transaction-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.transaction-type {
  font-weight: 500;
  color: var(--text-primary);
  
  .auto-badge {
    background: var(--primary-color);
    color: white;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }
}

.transaction-amount {
  font-weight: 600;
  
  &.deposit {
    color: var(--success-color);
  }
  
  &.spend {
    color: var(--error-color);
  }
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.transaction-status {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  
  &.refunded {
    background: var(--warning-background);
    color: var(--warning-color);
  }
  
  &.disputed {
    background: var(--error-background);
    color: var(--error-color);
  }
}

.add-funds-form,
.auto-topup-form {
  padding: 1rem 0;
}

.amount-input {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
}

.amount-field {
  position: relative;
  
  .currency-symbol {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-size: 1.125rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--background-primary);
    color: var(--text-primary);
    font-size: 1.125rem;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.quick-amount {
  padding: 0.5rem 1rem;
  background: var(--background-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--background-secondary);
    color: var(--text-primary);
  }
}

.topup-explanation {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--background-tertiary);
  border-radius: 6px;
  
  p {
    margin: 0;
    color: var(--text-secondary);
  }
}

.trigger-info {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--info-background);
  border-radius: 6px;
  
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
}

.current-status {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--background-tertiary);
  border-radius: 6px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.status-value {
  font-weight: 500;
  color: var(--text-primary);
}

.popup-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .balance-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .balance-actions {
    width: 100%;
    
    :deep(.app-button) {
      flex: 1;
    }
  }
  
  .spending-limit {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .transaction-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .popup-actions {
    flex-direction: column;
    
    :deep(.app-button) {
      width: 100%;
    }
  }
}
</style>
