<template>
  <section class="page-container dashboard-page">
    <header class="page-header">
      <div class="page-title">
        <h1>Dashboard</h1>
        <p class="page-description">Welcome to DirectSupport.ai! Monitor your account activity and get insights into your customer support performance.</p>
      </div>
    </header>

    <!-- Getting Started Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>Getting Started</h2>
        <p class="section-description">Quick setup steps to get the most out of DirectSupport.ai. Click on any step below to get started, or ask the chat support for any details.</p>
      </div>
      
      <div class="getting-started-container">
        <div class="step-card" @click="navigateTo('/edit-product')" style="cursor: pointer;">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Configure Your Product</h3>
            <p>Set up your product information and AI assistant instructions.</p>
          </div>
        </div>
        
        <div class="step-card" @click="navigateTo('/contact-priority')" style="cursor: pointer;">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Assign Your Phone Number</h3>
            <p>Assign your phone number to receive client updates and notifications.</p>
          </div>
        </div>
        
        <div class="step-card" @click="navigateTo('/document-upload')" style="cursor: pointer;">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Upload Your Documentation</h3>
            <p>Upload your documentation files to generate your FAQ automatically.</p>
          </div>
        </div>
        
        <div class="step-card" @click="navigateTo('/widget')" style="cursor: pointer;">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Install Widget</h3>
            <p>Add the chat widget to your website to start receiving customer messages.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Balance Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>Account Balance</h2>
        <p class="section-description">Your current account balance and usage information</p>
      </div>
      
      <div class="balance-container">
        <div class="balance-info">
          <div class="balance-amount">
            <span class="currency">$</span>
            <span class="amount">{{ formatBalance(currentBalance) }}</span>
          </div>
          <div class="balance-status" :class="{ 'low-balance': isLowBalance }">
            <span>{{ getBalanceStatusText() }}</span>
          </div>
        </div>
        <div class="balance-actions">
          <AppButton
            label="Go to Billing"
            color="primary"
            @click="navigateToBilling"
          />
        </div>
      </div>
    </div>

    <!-- Activity Overview Chart Section -->
    <div v-if="showChart" class="content-section">
      <div class="section-header">
        <h2>Message Activity (14 Days)</h2>
        <p class="section-description">Customer message volume by priority level</p>
      </div>
      
      <div class="chart-container-wrapper">
        <div v-if="chartLoading" class="chart-loading">
          <div class="spinner"></div>
          <p>Loading activity data...</p>
        </div>
        <canvas
          ref="chartContainer"
          class="chart-canvas"
          :style="{ display: chartLoading ? 'none' : 'block' }"
        ></canvas>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import AppButton from '~/components/AppButton.vue'
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { ProductStat } from '~/eicrud_exports/services/LOG-ms/product-stat/product-stat.entity'
import { ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'
import 'chartjs-adapter-date-fns'

// State
const product = ref<Product | null>(null)
const productStats = ref<ProductStat[]>([])
const chartLoading = ref(true)
const chartContainer = ref<HTMLElement | null>(null)
let chartInstance: any = null

// Chart visibility logic
const showChart = computed(() => {
  return productStats.value.length >= 5
})

// Balance computed properties
const currentBalance = computed(() => {
  return product.value?.balance || 0
})

const isLowBalance = computed(() => {
  return currentBalance.value <= 5
})

// Load product data
const loadProductData = async () => {
  try {
    const nuxtApp = useNuxtApp()
    const productId = nuxtApp.$userProductId
    
    if (!productId) {
      throw new Error('Product ID not found')
    }
    
    const result = await nuxtApp.$sp.product.findOne({ 
      id: productId 
    })
    
    product.value = result
  } catch (error) {
    console.error('Failed to load product data:', error)
    useNuxtApp().$toast.show('Failed to load product data', 'error')
  }
}

// Load chart data
const loadChartData = async () => {
  chartLoading.value = true
  try {
    const nuxtApp = useNuxtApp()
    const productId = nuxtApp.$userProductId
    
    if (!productId) {
      return
    }
    
    // Get last 14 days of data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 14)
    
    const options: any = {
      orderBy: { startDate: 'asc' },
      limit: 1000 // High limit to get all buckets in the 14-day period
    }
    
    const result = await nuxtApp.$sp.productStat.find({
      product: productId
    }, options)
    
    // Filter to the desired date range
    const filteredStats = (result.data || []).filter(stat => {
      const statDate = new Date(stat.startDate)
      return statDate >= startDate && statDate <= endDate
    })
    
    // Add mock data if no real data exists
    const mockData = addMockChartData(productId, startDate, endDate)
    productStats.value = [...filteredStats, ...mockData]
    
    // Use nextTick to ensure DOM is updated before creating chart
    await nextTick()
    if (showChart.value) {
      createChart()
    }
    
  } catch (error) {
    console.error('Error loading chart data:', error)
    useNuxtApp().$toast.show('Failed to load chart data', 'error')
  } finally {
    chartLoading.value = false
  }
}

// Add mock chart data - COMMENT OUT THIS FUNCTION TO REMOVE MOCK DATA
const addMockChartData = (productId: string, startDate: Date, endDate: Date): ProductStat[] => {
  const mockData: ProductStat[] = []
  const currentDate = new Date(startDate)
  
  // Generate data points every 1 hour for 14 days
  while (currentDate <= endDate) {
    // Create mock data for each priority level
    Object.values(ClientPriority).forEach(priority => {
      // Simulate varying message counts based on time of day and priority
      const hour = currentDate.getHours()
      let baseCount = 0
      
      // Business hours (9-17) have more activity
      if (hour >= 9 && hour <= 17) {
        baseCount = priority === ClientPriority.HIGH ? Math.floor(Math.random() * 32) + 8 :
                   priority === ClientPriority.REGULAR ? Math.floor(Math.random() * 60) + 20 :
                   Math.floor(Math.random() * 12) + 4
      } else {
        baseCount = priority === ClientPriority.HIGH ? Math.floor(Math.random() * 12) :
                   priority === ClientPriority.REGULAR ? Math.floor(Math.random() * 20) :
                   Math.floor(Math.random() * 8)
      }
      
      mockData.push({
        id: `mock-${currentDate.getTime()}-${priority}`,
        product: productId,
        owner: '',
        startDate: new Date(currentDate),
        messageCount: baseCount,
        customToolUsedCount: Math.floor(Math.random() * 12),
        clientPriority: priority,
        createdAt: new Date(currentDate),
        updatedAt: new Date(currentDate)
      } as ProductStat)
    })
    
    // Move to next 1-hour bucket
    currentDate.setHours(currentDate.getHours() + 1)
  }
  
  return mockData
}

// Create chart
const createChart = async (retryCount = 0) => {
  if (!chartContainer.value) {
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 100))
      return createChart(retryCount + 1)
    } else {
      console.error('chartContainer still not available after retries')
      return
    }
  }
  
  try {
    // @ts-ignore - Chart.js dynamic import in Nuxt
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)
    
    // Destroy existing chart
    if (chartInstance) {
      chartInstance.destroy()
    }
    
    const ctx = (chartContainer.value as HTMLCanvasElement).getContext('2d')
    if (!ctx) return
    
    // Prepare data for each priority level
    const priorityColors = {
      [ClientPriority.HIGH]: '#dc2626',
      [ClientPriority.REGULAR]: '#2563eb', 
      [ClientPriority.LOWEST]: '#6b7280'
    }
    
    const datasets = Object.values(ClientPriority).map(priority => {
      const priorityStats = productStats.value.filter(stat => stat.clientPriority === priority)
      
      const data = priorityStats.map(stat => ({
        x: new Date(stat.startDate).getTime(),
        y: stat.messageCount || 0
      }))
      
      return {
        label: priority.charAt(0).toUpperCase() + priority.slice(1) + ' Priority',
        data,
        borderColor: priorityColors[priority],
        backgroundColor: priorityColors[priority] + '20',
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: false
      }
    })
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: {
                hour: 'MMM dd HH:00'
              },
              round: 'hour'
            },
            title: {
              display: true,
              text: 'Time'
            },
            ticks: {
              maxTicksLimit: 20,
              source: 'auto',
              callback: function(value: any, index: number) {
                const date = new Date(value)
                // Only show labels every 4 hours (0, 4, 8, 12, 16, 20)
                if (date.getHours() % 4 === 0) {
                  //Return Sep. 10, 2025 format
                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                }
                return ''
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Message Count'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Customer Message Activity by Priority'
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    })
  } catch (error) {
    console.error('Error creating chart:', error)
    useNuxtApp().$toast.show('Failed to load chart', 'error')
  }
}

// Utility functions
const formatBalance = (balance: number): string => {
  return balance.toFixed(2)
}

const getBalanceStatusText = (): string => {
  if (isLowBalance.value) {
    return 'Low balance - Consider adding funds'
  }
  return 'Balance is sufficient'
}

const navigateToBilling = () => {
  navigateTo('/funds')
}

// Lifecycle
onMounted(async () => {
  await loadProductData()
  await loadChartData()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;
@use 'sass:color';

// Uses global .page-container for sizing

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  h1 {
    margin: 0;
    color: $text;
    font-size: 2rem;
  }
  
  .page-description {
    margin: 0.5rem 0 0 0;
    color: $muted;
    font-size: 1rem;
  }
}

.content-section {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    color: $text;
    font-size: 1.5rem;
  }
  
  .section-description {
    color: $muted;
    margin: 0.25rem 0 0 0;
    font-size: 0.9rem;
  }
}

// Balance Section
.balance-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba($brand, 0.05);
  border: 1px solid rgba($brand, 0.1);
  border-radius: $radius;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

.balance-info {
  flex: 1;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  
  .currency {
    font-size: 1.5rem;
    color: $brand;
    font-weight: 600;
  }
  
  .amount {
    font-size: 2.5rem;
    color: $brand;
    font-weight: 700;
    font-family: monospace;
  }
}

.balance-status {
  font-size: 0.9rem;
  color: $text;
  font-weight: 500;
  
  &.low-balance {
    color: $error;
    font-weight: 600;
  }
}

.balance-actions {
  @media (max-width: 768px) {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}

// Chart Section
.chart-container-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
  background: rgba($muted, 0.02);
  border: 1px solid rgba($muted, 0.1);
  border-radius: $radius;
  padding: 1rem;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

// Getting Started Section
.getting-started-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba($brand, 0.02);
  border: 1px solid rgba($brand, 0.1);
  border-radius: $radius;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  
  &:hover {
    background: rgba($brand, 0.08);
    border-color: rgba($brand, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba($brand, 0.15);
    

    .step-content h3 {
      color: $brand;
    }
  }
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: $brand;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    color: $muted;
    line-height: 1.5;
    font-size: 0.9rem;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }
  
  .chart-container-wrapper {
    height: 300px;
    padding: 0.5rem;
  }
  
  .step-card {
    padding: 1rem;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}
</style>