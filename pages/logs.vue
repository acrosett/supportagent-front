<template>
  <div class="logs-page">
    <div class="header">
      <div class="header-content">
        <h1>System Logs</h1>
        <div class="debug-toggle-container">
          <div class="debug-toggle">
            <label class="debug-label">
              <span v-if="debugEnabled">⚠️</span>
              Collect Debug Logs
            </label>
            <ToggleSwitch
              :model-value="debugEnabled"
              :disabled="debugLoading"
              on-label="ON"
              off-label="OFF"
              @update:model-value="toggleDebug"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <!-- Chart Section -->
      <div class="chart-section">
        <div class="chart-header">
          <h3>Log Activity</h3>
          <div class="chart-controls">
            <div class="time-period-buttons">
              <AppButton
                v-for="weeks in [1, 2, 3, 4]"
                :key="weeks"
                :label="`${weeks} Week${weeks > 1 ? 's' : ''}`"
                :color="chartWeeks === weeks ? 'primary' : 'secondary'"
                size="small"
                @click="changeChartWeeks(weeks)"
              />
            </div>
          </div>
        </div>
        
        <div class="chart-container-wrapper">
          <div v-if="chartLoading" class="chart-loading">
            <p>Loading chart data...</p>
          </div>
          <canvas
            ref="chartContainer"
            class="chart-canvas"
            :style="{ display: chartLoading ? 'none' : 'block' }"
          ></canvas>
        </div>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label for="message-search">Search Message:</label>
          <input
            id="message-search"
            v-model="searchMessage"
            type="text"
            placeholder="Search in log messages..."
            class="filter-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div class="filter-group">
          <label>Log Types:</label>
          <div class="log-types-checklist">
            <div
              v-for="type in logTypes"
              :key="type"
              class="checkbox-item"
            >
              <input
                :id="`type-${type}`"
                v-model="selectedTypes"
                :value="type"
                type="checkbox"
                class="checkbox-input"
                @change="resetAndSearch"
              />
              <label :for="`type-${type}`" class="checkbox-label">
                <span class="log-type-badge" :class="`badge-${type.toLowerCase()}`">
                  {{ type }}
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="filter-group date-range-group">
          <label>Date Range:</label>
          <div class="date-range-inputs">
            <div class="date-input-wrapper">
              <label for="start-date" class="date-label">From:</label>
              <input
                id="start-date"
                v-model="startDate"
                type="datetime-local"
                class="filter-input date-input"
                @change="resetAndSearch"
              />
            </div>
            <div class="date-input-wrapper">
              <label for="end-date" class="date-label">To:</label>
              <input
                id="end-date"
                v-model="endDate"
                type="datetime-local"
                class="filter-input date-input"
                @change="resetAndSearch"
              />
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <AppButton
            label="Refresh"
            color="primary"
            fa-icon-left="refresh"
            :loading="loading"
            @click="refreshLogs"
          />
          <AppButton
            label="Clear Filters"
            color="secondary"
            margin="left"
            @click="clearFilters"
          />
        </div>
      </div>

      <div class="logs-container">
        <div v-if="loading && logs.length === 0" class="loading-state">
          <p>Loading logs...</p>
        </div>

        <div v-else-if="logs.length === 0 && !loading" class="empty-state">
          <p>No logs found matching your criteria.</p>
        </div>

        <div v-else class="logs-list">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-item"
            :class="`log-type-${log.type.toLowerCase()}`"
            @click="openLogDetails(log)"
          >
            <div class="log-header">
              <div class="log-type-badge" :class="`badge-${log.type.toLowerCase()}`">
                {{ log.type }}
              </div>
              <div class="log-meta">
                <span class="log-service">{{ log.serviceName }}</span>
                <span v-if="log.cmdName" class="log-cmd">/ {{ log.cmdName }}</span>
              </div>
              <div class="log-time">
                {{ formatDate(log.createdAt) }}
              </div>
            </div>
            
            <div class="log-message">
              {{ truncateMessage(log.message) }}
            </div>
            
            <div class="log-footer">
              <span class="log-level">Level: {{ log.level }}</span>
              <span class="log-user">User: {{ log.userId || 'System' }}</span>
              <span class="log-details-trigger">Click for details →</span>
            </div>
          </div>
        </div>

        <div v-if="loading && logs.length > 0" class="loading-more">
          <p>Loading more logs...</p>
        </div>

        <div v-if="!hasMore && logs.length > 0" class="end-message">
          <p>No more logs to load.</p>
        </div>
      </div>
    </div>

    <!-- Log Details Popup -->
    <AppPopup
      :show="showLogDetails"
      title="Log Details"
      size="lg"
      @close="showLogDetails = false"
    >
      <div v-if="selectedLog" class="log-details">
        <div class="detail-section">
          <h3>Basic Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Type:</label>
              <span class="log-type-badge" :class="`badge-${selectedLog.type.toLowerCase()}`">
                {{ selectedLog.type }}
              </span>
            </div>
            <div class="detail-item">
              <label>Level:</label>
              <span>{{ selectedLog.level }}</span>
            </div>
            <div class="detail-item">
              <label>Service:</label>
              <span>{{ selectedLog.serviceName }}</span>
            </div>
            <div class="detail-item">
              <label>Command:</label>
              <span>{{ selectedLog.cmdName || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>User ID:</label>
              <span>{{ selectedLog.userId || 'System' }}</span>
            </div>
            <div class="detail-item">
              <label>Product ID:</label>
              <span>{{ selectedLog.productId || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>IP Address:</label>
              <span>{{ selectedLog.ip || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>Current Microservice:</label>
              <span>{{ selectedLog.currentMs || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>Created:</label>
              <span>{{ formatFullDate(selectedLog.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Updated:</label>
              <span>{{ formatFullDate(selectedLog.updatedAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Expires At:</label>
              <span>{{ selectedLog.expireAt ? formatFullDate(selectedLog.expireAt) : 'Never' }}</span>
            </div>
            <div class="detail-item">
              <label>Fail Notification:</label>
              <span>{{ selectedLog.failNotif ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Message</h3>
          <div class="detail-content">
            <pre>{{ selectedLog.message }}</pre>
          </div>
        </div>

        <div class="detail-section">
          <h3>Data</h3>
          <div class="detail-content">
            <pre>{{ formatJsonData(selectedLog.data) }}</pre>
          </div>
        </div>

        <div class="detail-section">
          <h3>Query</h3>
          <div class="detail-content">
            <pre>{{ formatJsonData(selectedLog.query) }}</pre>
          </div>
        </div>

        <div class="detail-section">
          <h3>Options</h3>
          <div class="detail-content">
            <pre>{{ formatJsonData(selectedLog.options) }}</pre>
          </div>
        </div>
      </div>
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Log, LogType } from '~/eicrud_exports/services/LOG-ms/log/log.entity'
import { AdminNotif } from '~/eicrud_exports/services/LOG-ms/admin-notif/admin-notif.entity'
import type { SearchDto } from '~/eicrud_exports/services/LOG-ms/log/cmds/search/search.dto'
import type { SetDebugDto } from '~/eicrud_exports/services/LOG-ms/log/cmds/set_debug/set_debug.dto'
import type { GetDebugDto } from '~/eicrud_exports/services/LOG-ms/log/cmds/get_debug/get_debug.dto'
import AppButton from '~/components/AppButton.vue'
import AppPopup from '~/components/AppPopup.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'
import { CrudOptions } from '~/eicrud_exports/CrudOptions'
import 'chartjs-adapter-date-fns'

// Define middleware to check admin access
definePageMeta({
  middleware: async () => {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$userRole !== 'admin') {
      return navigateTo('/')
    }
  }
})

// Reactive data
const logs = ref<Log[]>([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(0)
const pageSize = 20

// Debug toggle
const debugEnabled = ref(false)
const debugLoading = ref(false)

// Chart data and state
const chartData = ref<AdminNotif[]>([])
const chartLoading = ref(false)
const chartWeeks = ref(1)
const chartContainer = ref<HTMLElement | null>(null)
let chartInstance: any = null

// Filters
const searchMessage = ref('')
const selectedTypes = ref<LogType[]>([])
const startDate = ref('')
const endDate = ref('')
const logTypes = Object.values(LogType)

// Log details popup
const showLogDetails = ref(false)
const selectedLog = ref<Log | null>(null)

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    resetAndSearch()
  }, 500)
}

// Load logs function
const loadLogs = async (reset = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const searchDto: SearchDto = {}
    
    if (searchMessage.value.trim()) {
      searchDto.messageLike = searchMessage.value.trim()
    }
    
    if (selectedTypes.value.length > 0) {
      searchDto.types = selectedTypes.value
    }
    
    if (startDate.value) {
      searchDto.startDate = startDate.value
    }
    
    if (endDate.value) {
      searchDto.endDate = endDate.value
    }
    
    const options: CrudOptions = {
      limit: pageSize,
      offset: reset ? 0 : currentPage.value * pageSize,
      orderBy: {
        $natural: 'desc'
      } 
    }
    
    const result = await useNuxtApp().$sp.log.search(searchDto, options)
    
    if (reset) {
      logs.value = result.data || []
      currentPage.value = 0
    } else {
      logs.value.push(...(result.data || []))
    }
    
    hasMore.value = (result.data?.length || 0) === pageSize
    
    if (!reset) {
      currentPage.value++
    }
    
  } catch (error) {
    console.error('Error loading logs:', error)
    useNuxtApp().$toast.show('Failed to load logs', 'error')
  } finally {
    loading.value = false
  }
}

// Reset and search
const resetAndSearch = () => {
  currentPage.value = 0
  hasMore.value = true
  loadLogs(true)
}

// Refresh logs
const refreshLogs = () => {
  resetAndSearch()
}

// Clear filters
const clearFilters = () => {
  searchMessage.value = ''
  selectedTypes.value = []
  startDate.value = ''
  endDate.value = ''
  resetAndSearch()
}

// Chart functions
const loadChartData = async () => {
  chartLoading.value = true
  try {
    const options: CrudOptions = {
      orderBy: { startDate: 'ASC' },
      limit: chartWeeks.value * 7 * 24 * 4 // 4 buckets per hour * 24 hours * days
    }
    
    const result = await useNuxtApp().$sp.adminNotif.find({}, options)
    
    // Filter to the desired date range since buckets are ordered by startDate
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (chartWeeks.value * 7))
    
    chartData.value = (result.data || []).filter(bucket => {
      const bucketDate = new Date(bucket.startDate)
      return bucketDate >= startDate && bucketDate <= endDate
    })

    // Use nextTick to ensure DOM is updated before creating chart
    await nextTick()
    createChart()
    
  } catch (error) {
    console.error('Error loading chart data:', error)
    useNuxtApp().$toast.show('Failed to load chart data', 'error')
  } finally {
    chartLoading.value = false
  }
}

const createChart = async (retryCount = 0) => {
  if (!chartData.value.length) {
    return
  }
  
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
    
    // Prepare data for each log type
    const logTypeColors = {
      debug: '#6c757d',
      info: 'lightskyblue',
      warning: '#ffc107',
      error: 'rgb(197, 0, 0)',
      security: 'purple',
      critical: '#d935dc'
    }
    
    const datasets = Object.keys(logTypeColors).map(logType => {
      const data = chartData.value.map(bucket => {
        const value = bucket[logType as keyof AdminNotif] as number
        return {
          x: new Date(bucket.startDate).getTime(),
          y: value || 0,
          bucket: bucket
        }
      })
      
      return {
        label: logType.toUpperCase(),
        data,
        borderColor: logTypeColors[logType as keyof typeof logTypeColors],
        backgroundColor: logTypeColors[logType as keyof typeof logTypeColors] + '20',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6
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
                hour: 'MMM dd HH:mm'
              }
            },
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Log Count'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Log Activity (${chartWeeks.value} week${chartWeeks.value > 1 ? 's' : ''})`
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        interaction: {
          intersect: false,
          mode: 'point'
        },
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const element = elements[0]
            const datasetIndex = element.datasetIndex
            const index = element.index
            const dataset = datasets[datasetIndex]
            const dataPoint = dataset?.data[index]
            const bucket = dataPoint?.bucket as AdminNotif
            
            if (bucket) {
              // Set date range to this bucket
              const bucketStart = new Date(bucket.startDate)
              const bucketEnd = new Date(bucketStart.getTime() + 15 * 60 * 1000) // +15 minutes
              
              startDate.value = bucketStart.toISOString().slice(0, 16)
              endDate.value = bucketEnd.toISOString().slice(0, 16)
              
              // Trigger search
              resetAndSearch()
              
              // Show toast
              useNuxtApp().$toast.show(`Filtered to ${bucketStart.toLocaleString()} - ${bucketEnd.toLocaleString()}`, 'info')
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error creating chart:', error)
    useNuxtApp().$toast.show('Failed to load chart', 'error')
  }
}

const changeChartWeeks = async (weeks: number) => {
  chartWeeks.value = weeks
  await loadChartData()
}

// Debug toggle functions
const getDebugStatus = async () => {
  try {
    const result = await useNuxtApp().$sp.log.get_debug({});
    debugEnabled.value = result.debugEnabled
  } catch (error) {
    console.error('Error getting debug status:', error)
  }
}

const toggleDebug = async (enabled: boolean) => {
  if (debugLoading.value) return
  
  debugLoading.value = true
  try {
    const setDebugDto: SetDebugDto = { enableDebug: enabled }
    await useNuxtApp().$sp.log.set_debug(setDebugDto)
    debugEnabled.value = enabled
    
    const message = enabled 
      ? 'Debug logging enabled - Warning: This may affect performance'
      : 'Debug logging disabled'
    const type = enabled ? 'warning' : 'success'
    
    useNuxtApp().$toast.show(message, type)
  } catch (error) {
    console.error('Error setting debug status:', error)
    // Revert the toggle
    debugEnabled.value = !enabled
    useNuxtApp().$toast.show('Failed to update debug setting', 'error')
  } finally {
    debugLoading.value = false
  }
}

// Open log details
const openLogDetails = (log: Log) => {
  selectedLog.value = log
  showLogDetails.value = true
}

// Utility functions
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

const formatFullDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })
}

const truncateMessage = (message: string, length = 200) => {
  if (message.length <= length) return message
  return message.substring(0, length) + '...'
}

const formatJsonData = (data: string) => {
  try {
    const parsed = JSON.parse(data)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return data
  }
}

// Infinite scroll
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  if (scrollTop + windowHeight >= documentHeight - 1000 && hasMore.value && !loading.value) {
    loadLogs()
  }
}

// Lifecycle
onMounted(async () => {
  // Get initial debug status
  await getDebugStatus()
  
  // Load initial logs
  await loadLogs(true)
  
  // Load chart data
  await loadChartData()
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (searchTimeout) clearTimeout(searchTimeout)
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.logs-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
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
    color: var(--text);
    margin: 0;
  }
}

.debug-toggle-container {
  display: flex;
  justify-content: flex-end;
  min-width: 200px;
}

.debug-toggle {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.debug-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    font-size: 1.2rem;
  }
}

.content {
  display: grid;
  gap: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: end;
  padding: 1.5rem;
  background: var(--panel);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  
  label {
    font-weight: 600;
    color: var(--text);
  }
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
}

.filter-input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  color: var(--text);
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: var(--brand);
    box-shadow: 0 0 0 2px rgba(110, 231, 255, 0.2);
  }
}

.date-range-group {
  min-width: 300px;
}

.date-range-inputs {
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.date-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.date-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

.date-input {
  min-width: 140px;
}

.log-types-checklist {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  min-height: 60px;
  max-height: 120px;
  overflow-y: auto;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--brand);
  cursor: pointer;
}

.checkbox-label {
  cursor: pointer;
  margin: 0;
  font-weight: normal;
  
  .log-type-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}

.logs-container {
  min-height: 400px;
}

.loading-state,
.empty-state,
.loading-more,
.end-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.logs-list {
  display: grid;
  gap: 1rem;
}

.log-item {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  &.log-type-error {
    border-left-color: rgb(197, 0, 0);
  }
  &.log-type-critical {
    border-left-color: #d935dc;
  }
  
  &.log-type-warning {
    border-left-color: #ffc107;
  }
  
  &.log-type-info {
    border-left-color: lightskyblue;
  }
  
  &.log-type-debug {
    border-left-color: #6c757d;
  }
  
  &.log-type-security {
    border-left-color: purple;
  }
}

.log-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.log-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  &.badge-error {
    background: rgb(197, 0, 0);
    color: white;
  }
  
  &.badge-critical {
    background: #d935dc;
    color: white;
  }
  
  &.badge-warning {
    background: #ffc107;
    color: #212529;
  }
  
  &.badge-info {
    background: lightskyblue;
    color: #212529;
  }
  
  &.badge-debug {
    background: #6c757d;
    color: white;
  }
  
  &.badge-security {
    background: purple;
    color: white;
  }
}

.log-meta {
  flex: 1;
  font-weight: 600;
  color: var(--text);
}

.log-cmd {
  color: var(--text-secondary);
  font-weight: normal;
}

.log-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.log-message {
  margin-bottom: 1rem;
  line-height: 1.5;
  color: var(--text);
}

.log-footer {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.log-details-trigger {
  margin-left: auto;
  color: var(--brand);
  font-weight: 600;
}

.log-details {
  max-height: 80vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  span {
    color: var(--text);
  }
}

.detail-content {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--text);
  }
}

@media (max-width: 768px) {
  .logs-page {
    padding: 1rem;
  }
  
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .log-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

// Chart styles
.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.2rem;
  }
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-period-buttons {
  display: flex;
  gap: 0.5rem;
}

.chart-container-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .time-period-buttons {
    flex-wrap: wrap;
  }
  
  .chart-container-wrapper {
    height: 300px;
  }
}
</style>