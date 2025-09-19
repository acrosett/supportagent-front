<template>
  <section class="page-container notifications-page">
    <header class="page-header">
      <div class="page-title">
        <h1>Notifications</h1>
        <AppButton
          label="Configure Notification Preferences"
          color="primary"
          margin="left"
          @click="navigateToNotificationConfig"
        />
      </div>
      <p class="page-description">Stay updated with alerts, messages, and important updates from your product and chatbot activities.</p>
    </header>

    <div class="content-section">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading notifications...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="notifications.length === 0" class="empty-state">
        <h3>No notifications found</h3>
        <p>You'll receive notifications here when important events occur with your product.</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-card"
          :class="{ 'unread': !notification.read }"
          @click="markAsRead(notification)"
        >
          <div class="notification-content">
            <div class="notification-message">
              {{ notification.message }}
            </div>
            <div class="notification-meta">
              <span class="notification-date">{{ formatDate(notification.createdAt) }}</span>
              <span v-if="!notification.read" class="unread-indicator">New</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Indicator -->
      <div v-if="isLoadingMore" class="loading-more">
        <div class="spinner"></div>
        <p>Loading more notifications...</p>
      </div>

      <!-- End of Results Indicator -->
      <div v-else-if="!hasMoreData && notifications.length > 0" class="end-of-results">
        <p>No more notifications to load</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import { Notification } from '~/eicrud_exports/services/notification/notification.entity'

// State
const notifications = ref<Notification[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMoreData = ref(true)
const currentPage = ref(0)
const pageSize = 20

// Load notifications data
const loadNotifications = async (reset = true) => {
  try {
    if (reset) {
      isLoading.value = true
      currentPage.value = 0
      hasMoreData.value = true
    } else {
      isLoadingMore.value = true
    }
    
    // Get current user's product ID
    const { $sp } = useNuxtApp()
    const productId = useNuxtApp().$userProductId
    
    if (!productId) {
      throw new Error('User product ID not found')
    }
    
    // Setup pagination options
    const options: any = {
      limit: pageSize,
      offset: reset ? 0 : currentPage.value * pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    }
    
    // Find notifications for the current product
    const result = await $sp.notification.find({ 
      product: productId 
    }, options)
    
    const newNotifications = result.data || []
    
    if (reset) {
      notifications.value = newNotifications
    } else {
      notifications.value = [...notifications.value, ...newNotifications]
    }
    
    // Check if there's more data
    hasMoreData.value = newNotifications.length === pageSize
    
    // Increment page for next load
    if (!reset) {
      currentPage.value++
    }
    
  } catch (error) {
    console.error('Failed to load notifications:', error)
    useNuxtApp().$toast.show('Failed to load notifications', 'error')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Mark notification as read
const markAsRead = async (notification: Notification) => {
  if (notification.read) return // Already read
  
  try {
    const { $sp } = useNuxtApp()
    
    await $sp.notification.patchOne({
      id: notification.id,
      product: useNuxtApp().$userProductId
    }, {
      read: true
    })
    
    // Update local state
    const notificationIndex = notifications.value.findIndex(n => n.id === notification.id)
    if (notificationIndex !== -1 && notifications.value[notificationIndex]) {
      notifications.value[notificationIndex]!.read = true
    }
    
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    useNuxtApp().$toast.show('Failed to update notification', 'error')
  }
}

// Load more notifications
const loadMore = () => {
  if (!isLoadingMore.value && hasMoreData.value) {
    currentPage.value++
    loadNotifications(false)
  }
}

// Format date helper
const formatDate = (date?: Date | string) => {
  if (!date) return 'Unknown date'
  
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return d.toLocaleDateString()
  }
}

// Navigation function
function navigateToNotificationConfig() {
  navigateTo('/edit-notifications')
}

// Load data on mount
onMounted(() => {
  loadNotifications(true)
  
  // Add scroll listener for infinite scroll
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    
    // Check if user scrolled near the bottom (within 200px)
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (!isLoadingMore.value && hasMoreData.value) {
        loadMore()
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // Cleanup scroll listener
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    margin: 0;
    color: $text;
    font-size: 2rem;
  }
}

.page-description {
  color: $muted;
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
}

.content-section {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
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
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: $muted;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
  }
  
  p {
    margin: 0;
  }
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  background: $bg;
  border: 2px solid $muted;
  border-radius: $radius;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: $brand;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($brand, 0.1);
  }
  
  &.unread {
    background: rgba($brand-2, 0.1);
    border-color: $brand-2;
    border-width: 3px;
    
    &:hover {
      background: rgba($brand-2, 0.15);
      border-color: $brand-2;
    }
  }
}

.notification-content {
  .notification-message {
    color: $text;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }
  
  .notification-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: $muted;
    
    .notification-date {
      font-weight: 500;
    }
    
    .unread-indicator {
      background: $brand-2;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: $radius;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
  }
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: $muted;
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba($brand, 0.2);
    border-top: 2px solid $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.end-of-results {
  text-align: center;
  padding: 2rem 1rem;
  color: $muted;
  border-top: 1px solid rgba($muted, 0.2);
  margin-top: 1rem;
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }
  
  .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .notification-card {
    padding: 1rem;
  }
  
  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
