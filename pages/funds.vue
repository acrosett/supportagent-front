<template>
  <div class="page-container">
    <div class="funds-header">
      <h1>{{ t('page.title') }}</h1>
      <p>{{ t('page.subtitle') }}</p>
    </div>

    <!-- Balance Section -->
    <div class="balance-section">
      <div class="section-header">
        <h3>{{ t('balance.title') }}</h3>
        <div class="balance-actions">
          <AppButton
            :label="t('balance.buttons.addFunds')"
            color="primary"
            show-plus-icon
            @click="showAddFundsPopup = true"
          />
          <AppButton
            :label="t('balance.buttons.autoTopup')"
            color="secondary"
            @click="showAutoTopUpPopup = true"
          />
        </div>
      </div>
      
      <div class="balance-display section-card">
        <div class="balance-amount">
          <span class="currency">$</span>
          <span :class="['amount', { 'low-balance': (currentProduct?.balance || 0) < 1 }]">
            {{ formatBalance(currentProduct?.balance || 0, 2) }}
          </span>
        </div>
        <p class="balance-subtitle" v-if="currentProduct?.lastComputedBalance">
          {{ t('balance.verified', { date: formatDate(currentProduct.lastComputedBalance) }) }}
        </p>
        
        <!-- Low Balance Warning -->
        <div v-if="currentProduct && (currentProduct.balance || 0) < 1" class="low-balance-warning">
          <AppIcon name="info" size="sm" />
          <span>{{ t('balance.lowBalance') }}</span>
        </div>
      </div>

      <!-- Auto Top-up Status -->
      <div v-if="currentProduct?.autoTopUpAmount" class="auto-topup-status">
        <div class="auto-topup-info">
          <div class="auto-topup-header">
            <AppIcon name="check" size="sm" />
            <span class="auto-topup-title">{{ t('balance.autoTopup.enabled') }}</span>
          </div>
          <div class="auto-topup-details">
            <span class="auto-topup-amount">${{ currentProduct.autoTopUpAmount }}</span>
            <span class="auto-topup-trigger">{{ t('balance.autoTopup.trigger', { amount: formatBalance((currentProduct.autoTopUpAmount || 0) * 0.1) }) }}</span>
          </div>
        </div>
        <ToggleSwitch
          v-model="autoTopUpEnabled"
          :on-label="t('balance.autoTopup.toggleOn')"
          :off-label="t('balance.autoTopup.toggleOff')"
          @update:model-value="handleAutoTopUpToggle"
        />
      </div>
    </div>

    <!-- Subscription Section -->
    <div class="subscription-section">
      <div class="section-header">
        <h3>{{ t('subscription.title') }}</h3>
        <div class="subscription-actions">
          <AppButton
            :disabled="currentProduct?.subscriptionActive"
            :label="t('subscription.button')"
            color="primary"
            @click="showSubscriptionPopup = true"
          />
        </div>
      </div>
      
      <div class="subscription-display section-card">
        <div class="subscription-status">
          <div class="status-indicator">
            <AppIcon 
              :name="currentProduct?.subscriptionActive ? 'check' : 'close'"
              :color="currentProduct?.subscriptionActive ? '$ok' : '$error'"
              size="sm"
            />
            <span :class="['status-text', { active: currentProduct?.subscriptionActive }]">
              {{ currentProduct?.subscriptionActive ? t('subscription.status.active') : t('subscription.status.inactive') }}
            </span>
          </div>
          <div class="subscription-price">
            <span class="price">{{ t('subscription.price') }}</span>
            <span class="period">{{ t('subscription.period') }}</span>
          </div>
        </div>
        
        <p class="subscription-description">
          {{ currentProduct?.subscriptionActive 
             ? t('subscription.description.active')
             : t('subscription.description.inactive') }}
        </p>

        <!-- Auto Renew Toggle (only show if subscription is active) -->
        <div class="auto-renew-section">
          <div class="auto-renew-label">
            <span>{{ t('subscription.autoRenew.label') }}</span>
            <p class="auto-renew-description">{{ t('subscription.autoRenew.description') }}</p>
          </div>
          <ToggleSwitch
            v-model="autoRenewEnabled"
            :on-label="t('subscription.autoRenew.toggleOn')"
            :off-label="t('subscription.autoRenew.toggleOff')"
            @update:model-value="handleAutoRenewToggle"
          />
        </div>

        <!-- Next billing date (only show if subscription is active) -->
        <div v-if="currentProduct?.subscriptionActive && currentProduct?.lastSubscriptionChecked" class="next-billing">
          <span class="billing-label">{{ t('subscription.nextBilling', { date: formatNextBillingDate(currentProduct.lastSubscriptionChecked) }) }}</span>
        </div>
      </div>
    </div>

    <!-- Spending Limit Section -->
    <div class="spending-section">
      <div class="section-header">
        <h3>{{ t('spendingLimit.title') }}</h3>
        <AppButton
          :label="t('spendingLimit.button')"
          color="secondary"
          show-edit-icon
          margin="left"
          @click="showSpendingLimitPopup = true"
        />
      </div>
      
      <div class="spending-display section-card">
        <div class="limit-amount">
          <span v-if="currentProduct?.maxDepositPerMonth" class="amount">
            ${{ formatBalance(currentProduct.maxDepositPerMonth) }}
          </span>
          <span v-else class="no-limit">{{ t('spendingLimit.noLimit') }}</span>
          <span class="period">{{ t('spendingLimit.period') }}</span>
        </div>
        <p class="limit-description">
          {{ currentProduct?.maxDepositPerMonth 
             ? t('spendingLimit.description.set')
             : t('spendingLimit.description.unset') }}
        </p>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="history-section">
      <h3>{{ t('transactions.title') }}</h3>
      
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="filter in transactionFilters"
          :key="filter.value"
          :class="['filter-tab', { active: activeFilter === filter.value }]"
          @click="activeFilter = filter.value; loadTransactions(true)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Transactions List -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('transactions.loading') }}</p>
      </div>

      <div v-else-if="transactions.length === 0" class="empty-state">
        <AppIcon name="credit-card" size="xl" />
        <h4>{{ t('transactions.empty.title') }}</h4>
        <p>{{ t('transactions.empty.subtitle') }}</p>
      </div>

      <div v-else class="transactions-list section-card">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-item"
        >
          <!-- Basic Transaction Row -->
          <div class="transaction-basic">
            <div class="transaction-icon">
              <AppIcon
                :name="transaction.transactionType === 'deposit' ? 'plus' : 'credit-card'"
                :color="transaction.transactionType === 'deposit' ? 'var(--success-color)' : 'var(--error-color)'"
              />
            </div>
            
            <div class="transaction-info">
              <div class="transaction-main">
                <span class="transaction-type">
                  {{ transaction.transactionType === 'deposit' ? 'Deposit' : 'Spending' }}
                  <span v-if="transaction.transactionType === 'deposit' && transaction.isAutoTopUp" class="auto-badge">Auto</span>
                  <span v-if="transaction.transactionType === 'spend' && transaction.spendType === 'subscription'" class="spend-type-badge">{{ transaction.spendType }}</span>
                  <span v-if="transaction.transactionType === 'spend' && transaction.spendType !== 'subscription'" class="spend-type-grey">({{ transaction.think?.agentType || transaction.spendType }})</span>
                </span>
                <span :class="['transaction-amount', transaction.transactionType]">
                  {{ transaction.transactionType === 'deposit' ? '+' : '-' }}${{ formatBalance(transaction.amount) }}
                </span>
              </div>
              <div class="transaction-date">
                {{ formatDate(transaction.createdAt) }}
              </div>
            </div>

            <button 
              class="detail-button"
              @click="showTransactionDetail(transaction)"
              :title="t('transactions.viewDetails')"
            >
              <AppIcon name="eye" />
            </button>
          </div>
        </div>

        <!-- Load More Indicator -->
        <div v-if="loadingMore" class="loading-more">
          <div class="spinner"></div>
          <span>Loading more transactions...</span>
        </div>
        
        <div v-if="hasMoreTransactions === false && transactions.length > 0" class="end-message">
          <span>{{ t('transactions.noMore') }}</span>
        </div>
      </div>
    </div>

    <!-- Add Funds Popup -->
    <AppPopup
      :show="showAddFundsPopup"
      :title="t('popups.addFunds.title')"
      @close="showAddFundsPopup = false"
    >
      <div class="add-funds-form">
        <div class="amount-input">
          <label for="depositAmount">{{ t('popups.addFunds.amountLabel') }}</label>
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
            :label="t('popups.addFunds.buttons.cancel')"
            color="secondary"
            @click="showAddFundsPopup = false"
          />
          <AppButton
            :label="t('popups.addFunds.buttons.addFunds')"
            color="primary"
            margin="left"
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
      :title="t('popups.autoTopup.title')"
      @close="showAutoTopUpPopup = false"
    >
      <div class="auto-topup-form">
        <div class="topup-explanation">
          <p>{{ t('popups.autoTopup.explanation') }}</p>
        </div>

        <div class="amount-input">
          <label for="autoTopUpAmount">{{ t('popups.autoTopup.amountLabel') }}</label>
          <div class="amount-field">
            <span class="currency-symbol">$</span>
            <input
              id="autoTopUpAmount"
              v-model="autoTopUpAmount"
              type="number"
              min="60"
              step="1"
              placeholder="0"
            />
          </div>
          <div v-if="autoTopUpAmount && autoTopUpAmount < 60" class="minimum-warning">
            {{ t('popups.autoTopup.minimumWarning') }}
          </div>
        </div>

        <div class="quick-amounts">
          <button
            v-for="amount in autoTopUpQuickAmounts"
            :key="amount"
            class="quick-amount"
            @click="autoTopUpAmount = amount"
          >
            ${{ amount }}
          </button>
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
            label="Cancel"
            color="secondary"
            @click="showAutoTopUpPopup = false"
          />
          <AppButton
            label="Choose Payment Method"
            color="primary"
            margin="left"
            :disabled="!autoTopUpAmount || autoTopUpAmount < 60"
            :loading="autoTopUpLoading"
            @click="handleSaveAutoTopUp"
          />
        </div>
      </div>
    </AppPopup>

    <!-- Spending Limit Popup -->
    <AppPopup
      :show="showSpendingLimitPopup"
      :title="t('popups.spendingLimit.title')"
      @close="showSpendingLimitPopup = false"
    >
      <div class="spending-limit-form">
        <MegaForm
          v-if="currentProduct"
          :formClass="Product"
          v-model="currentProduct"
          :includeFields="['maxDepositPerMonth']"
          :actions="spendingLimitActions"
        />
      </div>
    </AppPopup>

    <!-- Subscription Activation Popup -->
    <AppPopup
      :show="showSubscriptionPopup"
      :title="t('popups.subscription.title')"
      @close="showSubscriptionPopup = false"
    >
      <div class="subscription-confirm-form">

        <div class="confirmation-question">
          <p>{{ t('popups.subscription.confirmation') }}</p>
        </div>

        <div class="popup-actions">
          <AppButton
            :label="t('popups.subscription.buttons.cancel')"
            color="secondary"
            @click="showSubscriptionPopup = false"
          />
          <AppButton
            :label="t('popups.subscription.buttons.activate')"
            color="primary"
            margin="left"
            :loading="subscriptionLoading"
            @click="handleActivateSubscription"
          />
        </div>
      </div>
    </AppPopup>

    <!-- Transaction Details Popup -->
    <AppPopup
      :show="showTransactionDetailPopup"
      :title="`Transaction Details - ${selectedTransaction?.transactionType === 'deposit' ? 'Deposit' : 'Spending'}`"
      @close="showTransactionDetailPopup = false"
    >
      <div v-if="selectedTransaction" class="transaction-detail-popup">
        <!-- Basic Transaction Info -->
        <div class="transaction-summary">
          <div class="summary-row">
            <span class="summary-label">Amount:</span>
            <span :class="['summary-value', 'amount', selectedTransaction.transactionType]">
              {{ selectedTransaction.transactionType === 'deposit' ? '+' : '-' }}${{ formatBalance(selectedTransaction.amount) }}
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Date:</span>
            <span class="summary-value">{{ formatDate(selectedTransaction.createdAt) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Transaction ID:</span>
            <span class="summary-value transaction-id">{{ selectedTransaction.id }}</span>
          </div>
        </div>

        <!-- Deposit Details -->
        <div v-if="selectedTransaction.transactionType === 'deposit'" class="deposit-details">
          <h4>Deposit Information</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span :class="['detail-value', 'status', (selectedTransaction as TransactionDeposit).status]">
                {{ (selectedTransaction as TransactionDeposit).status }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Source:</span>
              <span class="detail-value">{{ (selectedTransaction as TransactionDeposit).source || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Currency:</span>
              <span class="detail-value">{{ (selectedTransaction as TransactionDeposit).currency || 'USD' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Auto Top-up:</span>
              <span class="detail-value">{{ (selectedTransaction as TransactionDeposit).isAutoTopUp ? 'Yes' : 'No' }}</span>
            </div>
          </div>

          <!-- Stripe Information -->
          <div v-if="(selectedTransaction as TransactionDeposit).stripePaymentIntentId" class="stripe-info">
            <h5>Payment Details</h5>
            <div class="detail-grid">
              <div v-if="(selectedTransaction as TransactionDeposit).stripePaymentIntentId" class="detail-item">
                <span class="detail-label">Payment Intent:</span>
                <span class="detail-value code">{{ (selectedTransaction as TransactionDeposit).stripePaymentIntentId }}</span>
              </div>
              <div v-if="(selectedTransaction as TransactionDeposit).stripeChargeId" class="detail-item">
                <span class="detail-label">Charge ID:</span>
                <span class="detail-value code">{{ (selectedTransaction as TransactionDeposit).stripeChargeId }}</span>
              </div>
              <div v-if="(selectedTransaction as TransactionDeposit).stripeCustomerId" class="detail-item">
                <span class="detail-label">Customer ID:</span>
                <span class="detail-value code">{{ (selectedTransaction as TransactionDeposit).stripeCustomerId }}</span>
              </div>
            </div>
          </div>

          <!-- Refund Information -->
          <div v-if="(selectedTransaction as TransactionDeposit).refundedAmount" class="refund-info">
            <h5>Refund Information</h5>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Refunded Amount:</span>
                <span class="detail-value refund">-${{ formatBalance((selectedTransaction as TransactionDeposit).refundedAmount!) }}</span>
              </div>
              <div v-if="(selectedTransaction as TransactionDeposit).refundedAt" class="detail-item">
                <span class="detail-label">Refunded At:</span>
                <span class="detail-value">{{ formatDate((selectedTransaction as TransactionDeposit).refundedAt!) }}</span>
              </div>
              <div v-if="(selectedTransaction as TransactionDeposit).stripeRefundId" class="detail-item">
                <span class="detail-label">Refund ID:</span>
                <span class="detail-value code">{{ (selectedTransaction as TransactionDeposit).stripeRefundId }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Spend Details -->
        <div v-else class="spend-details">
          <h4>Spending Information</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Spend Type:</span>
              <span class="detail-value spend-type">{{ (selectedTransaction as TransactionSpend).spendType || 'N/A' }}</span>
            </div>
            <div v-if="(selectedTransaction as TransactionSpend).clientPriority" class="detail-item">
              <span class="detail-label">Priority:</span>
              <span class="detail-value priority">{{ (selectedTransaction as TransactionSpend).clientPriority }}</span>
            </div>
            <div v-if="(selectedTransaction as TransactionSpend).think?.agentType" class="detail-item">
              <span class="detail-label">Agent Type:</span>
              <span class="detail-value">{{ (selectedTransaction as TransactionSpend).think!.agentType }}</span>
            </div>
            <div v-if="(selectedTransaction as TransactionSpend).publicToolId" class="detail-item">
              <span class="detail-label">Public Tool ID:</span>
              <span class="detail-value code">{{ (selectedTransaction as TransactionSpend).publicToolId }}</span>
            </div>
          </div>

          <!-- Token Count Details -->
          <div v-if="(selectedTransaction as TransactionSpend).think" class="token-details">
            <h5>Token Usage Details</h5>
            <div class="token-grid">
              <div v-if="(selectedTransaction as TransactionSpend).think!.inputBaseTokenCount" class="token-item">
                <span class="token-label">
                  Input Base:
                  <FieldTooltip text="Base tokens the AI needs to function.">
                    <AppIcon name="info" size="xs" />
                  </FieldTooltip>
                </span>
                <span class="token-value">{{ (selectedTransaction as TransactionSpend).think!.inputBaseTokenCount!.toLocaleString() }}</span>
              </div>
              
              <div v-if="(selectedTransaction as TransactionSpend).think!.inputProductConfigTokenCount" class="token-item">
                <span class="token-label">
                  Product Config:
                  <FieldTooltip text="Tokens used for product configuration and settings. You can reduce this by simplifying your product description, custom tools description and additional agent instructions.">
                    <AppIcon name="info" size="xs" />
                  </FieldTooltip>
                </span>
                <span class="token-value">{{ (selectedTransaction as TransactionSpend).think!.inputProductConfigTokenCount!.toLocaleString() }}</span>
              </div>
              
              <div v-if="(selectedTransaction as TransactionSpend).think!.inputHistoryTokenCount" class="token-item">
                <span class="token-label">
                  History:
                  <FieldTooltip text="Tokens used for conversation history and context. You can reduce this by limiting your custom tools' output.">
                    <AppIcon name="info" size="xs" />
                  </FieldTooltip>
                </span>
                <span class="token-value">{{ (selectedTransaction as TransactionSpend).think!.inputHistoryTokenCount!.toLocaleString() }}</span>
              </div>
              
              <div v-if="(selectedTransaction as TransactionSpend).think!.outputTokenCount" class="token-item">
                <span class="token-label">
                  Output:
                  <FieldTooltip text="Tokens generated in the response. You can reduce this making your custom tools take less arguments.">
                    <AppIcon name="info" size="xs" />
                  </FieldTooltip>
                </span>
                <span class="token-value">{{ (selectedTransaction as TransactionSpend).think!.outputTokenCount!.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Additional AI Details -->
            <div class="ai-details">
              <div v-if="(selectedTransaction as TransactionSpend).think!.outputType" class="detail-item">
                <span class="detail-label">Output Type:</span>
                <span class="detail-value">{{ (selectedTransaction as TransactionSpend).think!.outputType }}</span>
              </div>
              <div v-if="(selectedTransaction as TransactionSpend).think!.modelType" class="detail-item model-type">
                <span class="detail-label">Model Type:</span>
                <span class="detail-value model-badge">{{ (selectedTransaction as TransactionSpend).think!.modelType }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="popup-actions">
          <AppButton
            label="Close"
            color="primary"
            @click="showTransactionDetailPopup = false"
          />
        </div>
      </div>
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { Deposit } from '~/eicrud_exports/services/BANK-ms/deposit/deposit.entity'
import { Spend, SpendType } from '~/eicrud_exports/services/BANK-ms/spend/spend.entity'
import { CheckoutMode, StripeDepositDto } from '~/eicrud_exports/services/BANK-ms/product-vault/cmds/stripe_deposit/stripe_deposit.dto'
import { ToggleAutoTopUpDto } from '~/eicrud_exports/services/BANK-ms/spend/cmds/toggle_auto_top_up/toggle_auto_top_up.dto'
import MegaForm, { MegaFormAction } from '~/components/MegaForm.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'
import FieldTooltip from '~/components/FieldTooltip.vue'
import { CrudOptions } from '~/eicrud_exports/CrudOptions'

// Transaction types for display
interface TransactionDeposit extends Deposit {
  transactionType: 'deposit'
}

interface TransactionSpend extends Spend {
  transactionType: 'spend'
  spendType: SpendType
}

type Transaction = TransactionDeposit | TransactionSpend

definePageMeta({
  layout: 'default'
})

// Composables
const { t } = await useLocalNamespaceAsync('funds')

// Meta
useHead({
  title: () => t('meta.title')
})

// Reactive state
const { $sp } = useNuxtApp()
const { $toast } = useNuxtApp()

const currentProduct = ref<Product | null>(null)
const loading = ref(true)
const depositLoading = ref(false)
const autoTopUpLoading = ref(false)
const subscriptionLoading = ref(false)

// Popup states
const showAddFundsPopup = ref(false)
const showAutoTopUpPopup = ref(false)
const showSpendingLimitPopup = ref(false)
const showSubscriptionPopup = ref(false)
const showTransactionDetailPopup = ref(false)

// Form data
const depositAmount = ref<number>()
const autoTopUpAmount = ref<number>()
const autoRenewEnabled = ref(true)
const autoTopUpEnabled = ref(false)

// Transaction history
const transactions = ref<Transaction[]>([])
const selectedTransaction = ref<Transaction | null>(null)
const loadingMore = ref(false)
const hasMoreTransactions = ref(true)
const currentOffset = ref(0)
const activeFilter = ref('all')

const quickAmounts = [10, 25, 50, 100, 250, 500]
const autoTopUpQuickAmounts = [60, 100, 150, 250, 500, 1000]

const transactionFilters = [
  { label: t('transactions.filters.all'), value: 'all' },
  { label: t('transactions.filters.deposits'), value: 'deposits' },
  { label: t('transactions.filters.spending'), value: 'spending' }
]

// MegaForm actions for spending limit
const spendingLimitActions: MegaFormAction[] = [
  {
    label: t('popups.addFunds.buttons.cancel'),
    color: 'secondary',
    callback: async () => {
      showSpendingLimitPopup.value = false
    }
  },
  {
    label: 'Save Limit',
    color: 'primary',
    margin: 'left',
    callback: async (formData: Product) => {
      try {
        // Mock implementation - replace with actual API call
        if (currentProduct.value) {
          currentProduct.value.maxDepositPerMonth = formData.maxDepositPerMonth
        }
        $toast.show(t('messages.success.spendingLimitUpdated'), 'success')
        showSpendingLimitPopup.value = false
      } catch (error) {
        console.error('Failed to update spending limit:', error)
        $toast.show(t('messages.error.updateSpendingLimit'), 'error')
      }
    }
  }
]

// Throttle function for scroll events
let scrollTimeout: NodeJS.Timeout | null = null

// Scroll detection for infinite loading
const handleScroll = (event: Event) => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  scrollTimeout = setTimeout(() => {
    const target = event.target as HTMLElement
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight
        
    // Load more when user scrolls to within 200px of bottom
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      loadMoreTransactions()
    }
  }, 100)
}

// Load initial data
onMounted(async () => {
  // Check for Stripe payment result in URL
  await checkStripeResult()
  
  await loadProduct()
  await loadTransactions(true) // Reset on initial load
  loading.value = false
  
  // Add scroll listener for infinite loading to the main content element
  const mainElement = document.querySelector('main.main-content')
  if (mainElement) {
    mainElement.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  // Clean up scroll listener and timeout
  const mainElement = document.querySelector('main.main-content')
  if (mainElement) {
    mainElement.removeEventListener('scroll', handleScroll)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})

const checkStripeResult = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const stripeResult = urlParams.get('stripe_result')
  const setupIntent = urlParams.get('setup_intent')
  
  if (stripeResult === 'success') {
    if (setupIntent) {
      $toast.show('Auto top-up setup completed successfully!', 'success')
      // Reload product data to get updated auto top-up settings
      await loadProduct()
    } else {
      $toast.show(t('messages.success.fundsAdded'), 'success')
      // Reload product data to get updated balance
      await loadProduct()
    }
    // Clean up URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('stripe_result')
    url.searchParams.delete('setup_intent')
    window.history.replaceState({}, '', url.toString())
  } else if (stripeResult === 'error') {
    if (setupIntent) {
      $toast.show('Auto top-up setup failed. Please try again or contact support.', 'error')
    } else {
      $toast.show(t('messages.error.addFunds'), 'error')
    }
    // Clean up URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('stripe_result')
    url.searchParams.delete('setup_intent')
    window.history.replaceState({}, '', url.toString())
  }
}

const loadProduct = async () => {
  try {
    const nuxtApp = useNuxtApp()
    const product = await $sp.product.findOne({ 
      id: nuxtApp.$userProductId, 
    })
    
    currentProduct.value = product
    
    if (currentProduct.value) {
      autoTopUpAmount.value = currentProduct.value.autoTopUpAmount
      autoTopUpEnabled.value = currentProduct.value.autoTopUpEnabled || false
      autoRenewEnabled.value = currentProduct.value.autoRenewSubscription || false
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    $toast.show('Failed to load account information', 'error')
  }
}

const loadTransactions = async (reset = false) => {
  if (!currentProduct.value) return
  
  try {
    if (reset) {
      currentOffset.value = 0
      transactions.value = []
      hasMoreTransactions.value = true
    }
    
    if (!hasMoreTransactions.value) return
    
    const itemsPerPage = 20
    
    // Base query for product
    const baseQuery = {
      product: currentProduct.value.id
    }
    
    const options: CrudOptions = {
      orderBy: { createdAt: 'DESC' as const },
      limit: itemsPerPage,
      offset: Math.floor(currentOffset.value) || 0,
    }
    
    let newTransactions: Transaction[] = []
    let totalCount = 0
    
    if (activeFilter.value === 'deposits') {
      // Load only deposits
      const depositResult = await $sp.deposit.find(baseQuery, options)
      const depositData = Array.isArray(depositResult) ? depositResult : (depositResult?.data || [])
      totalCount = depositResult?.total || 0
      newTransactions = depositData.map((deposit: Deposit): TransactionDeposit => ({
        ...deposit,
        transactionType: 'deposit' as const
      }))
    } else if (activeFilter.value === 'spending') {
      // Load only spends
      const spendResult = await $sp.spend.find(baseQuery, options)
      const spendData = Array.isArray(spendResult) ? spendResult : (spendResult?.data || [])
      totalCount = spendResult?.total || 0
      newTransactions = spendData.map((spend: Spend): TransactionSpend => ({
        ...spend,
        transactionType: 'spend' as const,
        spendType: spend.type // Map spend.type to spendType to avoid confusion
      }))
      
      // Debug: Check if publicToolId is present in spend data
      console.log('Spend-only data sample:', spendData[0])
      console.log('Mapped spend-only sample:', newTransactions[0])
    } else {
      // For 'all' transactions, we need a different strategy since we're combining two APIs
      // Always get fresh totals to ensure accuracy
      const [depositCountResult, spendCountResult] = await Promise.all([
        $sp.deposit.find(baseQuery, { limit: 1, offset: 0 }),
        $sp.spend.find(baseQuery, { limit: 1, offset: 0 })
      ])
      
      const depositsTotal = depositCountResult?.total || 0
      const spendsTotal = spendCountResult?.total || 0
      
      totalCount = depositsTotal + spendsTotal
      
      // Calculate proper offsets based on actual data ratios (avoid division by zero)
      const depositRatio = totalCount > 0 ? depositsTotal / totalCount : 0
      const spendRatio = totalCount > 0 ? spendsTotal / totalCount : 0
      
      const currentLength = transactions.value.length
      const depositOffset = Math.floor(currentLength * depositRatio) || 0
      const spendOffset = Math.floor(currentLength * spendRatio) || 0
      
      const batchSize = itemsPerPage * 2 // Load 2x more to ensure we get enough after sorting
      
      // Load from both APIs with calculated offsets
      const [depositResult, spendResult] = await Promise.all([
        $sp.deposit.find(baseQuery, { 
          ...options, 
          limit: Math.min(batchSize, depositsTotal), // Don't request more than available
          offset: Math.floor(Math.min(depositOffset, Math.max(0, depositsTotal - batchSize)))
        }),
        $sp.spend.find(baseQuery, { 
          ...options, 
          limit: batchSize, 
          offset: Math.floor(spendOffset) || 0
        })
      ])
      
      const depositData = Array.isArray(depositResult) ? depositResult : (depositResult?.data || [])
      const spendData = Array.isArray(spendResult) ? spendResult : (spendResult?.data || [])
      
      const deposits: TransactionDeposit[] = depositData.map((deposit: Deposit): TransactionDeposit => ({
        ...deposit,
        transactionType: 'deposit' as const
      }))
      
      const spends: TransactionSpend[] = spendData.map((spend: Spend): TransactionSpend => ({
        ...spend,
        transactionType: 'spend' as const,
        spendType: spend.type
      }))
      
      // Debug: Check if publicToolId is present in spend data
      console.log('Spend data sample:', spendData[0])
      console.log('Mapped spends sample:', spends[0])
      
      // Combine and sort chronologically
      let allTransactions: Transaction[] = [...deposits, ...spends]
      allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      // Filter out any transactions we already have (to avoid duplicates)
      if (!reset && transactions.value.length > 0) {
        const existingIds = new Set(transactions.value.map(t => t.id))
        allTransactions = allTransactions.filter(t => !existingIds.has(t.id))
      }
      
      // Take only what we need
      newTransactions = allTransactions.slice(0, itemsPerPage)

    }
    
    // Update transactions array
    if (reset) {
      transactions.value = newTransactions
    } else {
      transactions.value = [...transactions.value, ...newTransactions]
    }
    
    // Update offset for next load
    currentOffset.value = Math.floor(currentOffset.value) + itemsPerPage
    
    // Check if we have more transactions to load
    hasMoreTransactions.value = transactions.value.length < totalCount && newTransactions.length > 0
    
  } catch (error) {
    console.error('Failed to load transactions:', error)
    $toast.show(t('messages.error.loadTransactions'), 'error')
  }
}

const handleAddFunds = async () => {
  if (!depositAmount.value || !currentProduct.value) return
  
  depositLoading.value = true
  try {
    const depositDto: StripeDepositDto = {
      amount: depositAmount.value * 100, // Convert to cents
      mode: CheckoutMode.PAYMENT,
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
  
  if (autoTopUpAmount.value < 60) {
    $toast.show('Minimum auto top-up amount is $60', 'error')
    return
  }
  
  autoTopUpLoading.value = true
  try {
    // Create Stripe setup session for auto top-up
    const depositDto: StripeDepositDto = {
      amount: autoTopUpAmount.value * 100, // Convert to cents
      mode: CheckoutMode.SETUP, // Setup mode for payment method setup
    }
    
    const result = await $sp.productVault.stripe_deposit(depositDto)
    
    // Redirect to Stripe setup page
    if (result.sessionUrl) {
      window.location.href = result.sessionUrl
    }
    
  } catch (error) {
    console.error('Failed to setup auto top-up:', error)
    $toast.show('Failed to setup auto top-up', 'error')
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

const handleAutoTopUpToggle = async (enabled: boolean) => {
  if (!currentProduct.value) return
  
  try {
    // Update the product's autoTopUpEnabled property via API
    await $sp.spend.toggle_auto_top_up({
      enable: enabled,
      product: currentProduct.value.id
    })
    
    // Update local state
    currentProduct.value.autoTopUpEnabled = enabled
    autoTopUpEnabled.value = enabled
    
    $toast.show(
      enabled ? 'Auto top-up enabled' : 'Auto top-up disabled', 
      'success'
    )
    
  } catch (error) {
    console.error('Failed to update auto top-up setting:', error)
    $toast.show('Failed to update auto top-up setting', 'error')
    // Revert the toggle on error
    autoTopUpEnabled.value = !enabled
  }
}

const loadMoreTransactions = async () => {
  if (loadingMore.value || !hasMoreTransactions.value) return
  
  loadingMore.value = true
  try {
    await loadTransactions()
  } finally {
    loadingMore.value = false
  }
}

const showTransactionDetail = (transaction: any) => {
  selectedTransaction.value = transaction
  showTransactionDetailPopup.value = true
}

const handleActivateSubscription = async () => {
  if (!currentProduct.value) return
  
  subscriptionLoading.value = true
  try {
    // Use the activate_subscription command from the spend service
    await $sp.spend.activate_subscription({
      productId: currentProduct.value.id
    })
    
    // Reload the product to get updated subscription status
    await loadProduct()
    await loadTransactions(true)
    
    $toast.show('Subscription activated successfully', 'success')
    showSubscriptionPopup.value = false
    
  } catch (error) {
    console.error('Failed to activate subscription:', error)
    $toast.show(error)
  } finally {
    subscriptionLoading.value = false
  }
}

const handleAutoRenewToggle = async (enabled: boolean) => {
  if (!currentProduct.value) return
  
  // Check if subscription is active first
  if (!currentProduct.value.subscriptionActive) {
    // Revert the toggle immediately since subscription is not active
    autoRenewEnabled.value = !enabled
    // Open subscription popup instead
    showSubscriptionPopup.value = true
    $toast.show('Please activate your subscription first', 'warning')
    return
  }
  
  try {
    // Update the product's autoRenewSubscription property via API
    await $sp.product.patch({
      id: currentProduct.value.id
    }, {
      autoRenewSubscription: enabled
    })
    
    // Update local state
    currentProduct.value.autoRenewSubscription = enabled
    autoRenewEnabled.value = enabled
    
    $toast.show(
      enabled ? 'Auto-renew enabled' : 'Auto-renew disabled', 
      'success'
    )
    
  } catch (error) {
    console.error('Failed to update auto-renew setting:', error)
    $toast.show('Failed to update auto-renew setting', 'error')
    // Revert the toggle on error
    autoRenewEnabled.value = !enabled
  }
}

const formatBalance = (amount: number, toFixed = 4): string => {
  if (amount === 0) return "0"
  
  // For very small numbers, count zeros and set minimum precision
  if (amount > 0 && amount < 1) {
    const str = amount.toString()
    
    // Count leading zeros after decimal point
    const match = str.match(/^0\.0*/)
    if (match) {
      const leadingZeros = match[0].length - 2 // subtract "0."
      const minPrecision = leadingZeros + 1 // +1 to show the first non-zero digit
      const precision = Math.max(toFixed, minPrecision)
      return amount.toFixed(precision).replace(/\.?0+$/, '')
    }
  }
  
  // For regular numbers, use the original logic
  return amount.toFixed(toFixed).replace(/\.?0+$/, '')
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

const formatNextBillingDate = (lastChecked: Date | string): string => {
  const lastDate = new Date(lastChecked)
  const nextBilling = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, lastDate.getDate())
  
  return nextBilling.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;
@use 'sass:color';

.funds-header {
  margin-bottom: 2rem;
  
  h1 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: $text-muted;
  }
}

// Shared section card styling
.section-card {
  padding: 1.5rem;
  background: $bg-white;
  border: 1px solid $border;
  border-radius: $radius-small;
}

.balance-section {
  margin-bottom: 3rem;
}

.balance-actions {
  display: flex;
  gap: 1rem;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  
  .currency {
    font-size: 1.25rem;
    color: $text-muted;
  }
  
  .amount {
    font-size: 2rem;
    font-weight: 600;
    color: $brand;
    
    &.low-balance {
      color: $warning;
    }
  }
}

.balance-subtitle {
  font-size: 0.875rem;
  color: $text-muted;
  margin: 0;
}

.low-balance-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: color.scale($warning, $lightness: 90%);
  color: $error;
  border-radius: $radius-small;
  font-size: 0.875rem;
  font-weight: 500;
}

.auto-topup-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: $text-white;
  border-radius: $radius-small;
  margin-top: 1rem;
}

.auto-topup-info {
  flex: 1;
}

.auto-topup-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.auto-topup-title {
  font-weight: 500;
  color: color.scale($ok, $lightness: -20%);
}

.auto-topup-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.auto-topup-amount {
  font-size: 1.125rem;
  font-weight: 600;
  color: color.scale($ok, $lightness: -25%);
}

.auto-topup-trigger {
  font-size: 0.875rem;
  color: color.scale($ok, $lightness: -15%);
}

.spending-section {
  margin-bottom: 3rem;
}

.subscription-section {
  margin-bottom: 3rem;
}

.subscription-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-text {
  font-weight: 600;
  color: $error;
  
  &.active {
    color: $ok;
  }
}

.subscription-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  
  .price {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text;
  }
  
  .period {
    color: $text-muted;
  }
}

.subscription-description {
  margin: 0 0 1.5rem 0;
  color: $text-muted;
  font-size: 0.875rem;
}

.auto-renew-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: $panel;
  border-radius: $radius-small;
  margin-bottom: 1rem;
}

.auto-renew-label {
  flex: 1;
  
  span {
    font-weight: 500;
    color: $text;
    display: block;
    margin-bottom: 0.25rem;
  }
}

.auto-renew-description {
  margin: 0;
  font-size: 0.875rem;
  color: $text-muted;
}

.next-billing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid $border;
  font-size: 0.875rem;
}

.billing-label {
  color: $text-muted;
}

.billing-date {
  font-weight: 500;
  color: $text;
}

.subscription-confirm-form {
  padding: 1rem 0;
}

.subscription-info {
  text-align: center;
  margin-bottom: 2rem;
}

.price-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.large-price {
  font-weight: 600;
  color: $brand;
}

.subscription-benefits {
  color: $text-muted;
  margin: 0;
  line-height: 1.5;
}

.confirmation-question {
  margin-bottom: 2rem;
  padding-left: 1rem;
  padding-right: 1rem;
  background: $panel;
  border-radius: $radius-small;
  

  p {
    margin: 0;
    color: $text-muted;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
  }
}

.limit-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  .amount {
    font-size: 2rem;
    font-weight: 600;
    color: $text;
  }
  
  .no-limit {
    font-size: 1.25rem;
    color: $warning;
    font-weight: 500;
  }
  
  .period {
    font-size: 1rem;
    color: $text-muted;
  }
}

.limit-description {
  margin: 0;
  color: $text-muted;
  font-size: 0.875rem;
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
  border-bottom: 1px solid $border;
}

.filter-tab {
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: $text-muted;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    color: $text;
  }
  
  &.active {
    color: $brand;
    border-bottom-color: $brand;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: $text-muted;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid $border;
  border-top: 2px solid $brand;
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
  color: $text-muted;
  
  h4 {
    margin: 1rem 0 0.5rem;
  }
}

.transactions-list {
  // Uses .section-card base styling
  padding: 0; // Override base padding since transaction items have their own
  overflow: hidden;
}

.transaction-item {
  border-bottom: 1px solid $border;
  
  &:last-child {
    border-bottom: none;
  }
}

.transaction-basic {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: color.scale($panel, $lightness: 10%);
  }
}

.transaction-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: $panel;
  flex-shrink: 0;
}

.transaction-info {
  flex: 1;
}

.transaction-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.transaction-type {
  font-weight: 500;
  color: $text;
  
  .auto-badge {
    background: $brand;
    color: white;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }
  
  .spend-type-badge {
    background: color.scale($brand-2, $lightness: 80%);
    color: color.scale($brand-2, $lightness: -20%);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 0.5rem;
  }

  .spend-type-grey {
    color: color.scale($text-muted, $lightness: 30%);
  }
}

.transaction-amount {
  font-weight: 600;
  
  &.deposit {
    color: color.scale($ok, $lightness: -40%);
  }
  
  &.spend {
    color: $brand-2;
  }
}

.transaction-date {
  font-size: 0.875rem;
  color: $text-muted;
}

.detail-button {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  color: $text-muted;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: $panel;
    color: $text;
  }
}

// Transaction Details Popup Styles
.transaction-detail-popup {
  max-width: 600px;
  
  h4, h5 {
    margin: 0 0 1rem;
    color: $text;
  }
  
  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    border-bottom: 1px solid $border;
    padding-bottom: 0.5rem;
  }
  
  h5 {
    font-size: 1rem;
    font-weight: 500;
    margin-top: 1.5rem;
  }
}

.transaction-summary {
  background: color.scale($panel, $lightness: 10%);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .summary-label {
    font-size: 0.875rem;
    color: $text-muted;
    font-weight: 500;
  }
  
  .summary-value {
    font-size: 0.875rem;
    color: $text;
    font-weight: 500;
    
    &.amount {
      font-size: 1.125rem;
      font-weight: 600;
      
      &.deposit {
        color: color.scale($ok, $lightness: -40%);
      }
      
      &.spend {
        color: $brand-2;
      }
    }
    
    &.transaction-id {
      font-family: monospace;
      font-size: 0.75rem;
      color: $text-muted;
    }
  }
}

.deposit-details,
.spend-details {
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: $bg-white;
  border-radius: 6px;
  border: 1px solid $border;
}

.detail-label {
  font-size: 0.875rem;
  color: $text-muted;
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: $text;
  
  &.status {
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 500;
    
    &.completed {
      color: color.scale($ok, $lightness: -30%);
    }
    
    &.refunded {
      color: color.scale($warning, $lightness: -10%);
    }
    
    &.disputed {
      background: color.scale($error, $lightness: 30%);
      color: color.scale($error, $lightness: -10%);
    }
  }
  
  &.code {
    font-family: monospace;
    font-size: 0.75rem;
    color: $text-muted;
    background: color.scale($panel, $lightness: 15%);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
  
  &.refund {
    color: $warning;
    font-weight: 500;
  }
  
  &.spend-type {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    color: $brand;
  }
  
  &.priority {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    
    &[class*="HIGH"] {
      color: $error;
    }
    
    &[class*="MEDIUM"] {
      color: $warning;
    }
    
    &[class*="LOW"] {
      color: $ok;
    }
  }
}

.stripe-info,
.refund-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid color.scale($border, $lightness: 20%);
}

.token-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid color.scale($border, $lightness: 20%);
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.token-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: $bg-white;
  border-radius: 6px;
  border: 1px solid $border;
}

.token-label {
  font-size: 0.75rem;
  color: $text-muted;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.token-value {
  font-size: 0.75rem;
  color: $text;
  font-weight: 600;
  font-family: monospace;
}

.ai-details {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  
  .detail-item.model-type {
    background: color.scale($brand, $lightness: 35%);
    border-color: color.scale($brand, $lightness: 20%);
    
    .detail-label {
      color: color.scale($brand, $lightness: -10%);
    }
    
    .detail-value.model-badge {
      background: $brand;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
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
    color: $text-muted;
  }
}

.minimum-warning {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: $warning;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.amount-field {
  position: relative;
  
  .currency-symbol {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-muted;
    font-size: 1.125rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2rem;
    border: 1px solid $border;
    border-radius: 6px;
    background: $bg-white;
    color: $text;
    font-size: 1.125rem;
    
    &:focus {
      outline: none;
      border-color: $brand;
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
  background: $panel;
  border: 1px solid $border;
  border-radius: 6px;
  color: $text-muted;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: $bg-white;
    color: $text;
  }
}

.topup-explanation {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: $panel;
  border-radius: 6px;
  
  p {
    margin: 0;
    color: $text-muted;
  }
}

.trigger-info {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: color.scale($brand, $lightness: 40%);
  border-radius: 6px;
  
  p {
    margin: 0;
    color: $text-muted;
    font-size: 0.875rem;
  }
}

.current-status {
  margin-bottom: 2rem;
  padding: 1rem;
  background: $panel;
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
  color: $text;
}

.popup-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.spending-limit-form {
  padding: 1rem 0;
}

.form-explanation {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: $panel;
  border-radius: 6px;
  
  p {
    margin: 0;
    color: $text-muted;
  }
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: $text-muted;
  
  .spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid $border;
    border-top: 2px solid $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.75rem;
  }
  
  span {
    font-size: 0.875rem;
  }
}

.end-message {
  display: flex;
  justify-content: center;
  padding: 2rem;
  color: $text-muted;
  font-size: 0.875rem;
  border-top: 1px solid $border;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
