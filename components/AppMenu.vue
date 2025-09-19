<template>
  <div class="menu-container">
    <!-- Mobile overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
    
    <!-- Mobile header with hamburger -->
    <header class="mobile-header">
      <button 
        class="hamburger-btn"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1 class="mobile-title">
        <i class="fas fa-robot"></i>
        DirectSupport.ai
      </h1>
    </header>

    <!-- Sidebar navigation -->
    <nav class="sidebar" :class="{ 'sidebar-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <h2 class="app-title">
          <i class="fas fa-robot"></i>
          DirectSupport.ai
        </h2>
      </div>
      <ul class="nav-list">
        <li>
          <NuxtLink to="/" @click="closeMobileMenu">
            <AppIcon name="home" size="md" class="nav-icon" />
            Dashboard
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/edit-product" @click="closeMobileMenu" class="nav-link-with-warning">
            <div class="nav-link-content">
              <AppIcon name="settings" size="md" class="nav-icon" />
              Edit Product
            </div>
            <div v-if="showEditProductWarning" class="warning-indicator">
              <AppIcon name="info" size="sm" />
            </div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/contact-priority" @click="closeMobileMenu">
            <AppIcon name="phone" size="md" class="nav-icon" />
            Contact & Priority
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/faq" @click="closeMobileMenu">
            <AppIcon name="info" size="md" class="nav-icon" />
            FAQ Management
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/widget" @click="closeMobileMenu">
            <AppIcon name="gear" size="md" class="nav-icon" />
            Widget Builder
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/conversations" @click="closeMobileMenu">
            <AppIcon name="message" size="md" class="nav-icon" />
            Conversations
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/issues" @click="closeMobileMenu">
            <AppIcon name="document" size="md" class="nav-icon" />
            Issues
          </NuxtLink>
        </li>
                <li>
          <NuxtLink to="/custom-tools" @click="closeMobileMenu">
            <AppIcon name="tool" size="md" class="nav-icon" />
            Custom Tools
          </NuxtLink>
        </li>
        <li>
          <a 
            href="#"
            @click="handleTestChatClick($event)"
            class="nav-link"
          >
            <AppIcon name="media" size="md" class="nav-icon" />
            Test Chat
          </a>
        </li>
      </ul>
      <div style="flex:1"></div>
      <ul class="nav-list" style="margin-top:auto;">
        <li>
          <NuxtLink to="/notifications" @click="closeMobileMenu" class="nav-link-with-notification">
            <div class="nav-link-content">
              <AppIcon name="notifications" size="md" class="nav-icon" />
              Notifications
            </div>
            <div v-if="notificationCount > 0" class="notification-count">
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </div>
          </NuxtLink>
        </li>
        <li v-if="isAdmin">
          <NuxtLink to="/logs" @click="closeMobileMenu">
            <AppIcon name="document" size="md" class="nav-icon" />
            System Logs
          </NuxtLink>
        </li>
        <li v-if="isAdmin">
          <NuxtLink to="/debug" @click="closeMobileMenu">
            <AppIcon name="tool" size="md" class="nav-icon" />
            Debug
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/funds" @click="closeMobileMenu" class="nav-link-with-warning">
            <div class="nav-link-content">
              <AppIcon name="credit-card" size="md" class="nav-icon" />
              Billing & Usage
            </div>
            <div v-if="showBillingWarning" class="warning-indicator">
              <AppIcon name="info" size="sm" />
            </div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/account" @click="closeMobileMenu" class="nav-link-with-warning">
            <div class="nav-link-content">
              <AppIcon name="user" size="md" class="nav-icon" />
              <span style="max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: bottom;">
                {{ useNuxtApp().$userEmail || 'Account Settings' }}
              </span>
            </div>
            <div v-if="showAccountWarning" class="warning-indicator">
              <AppIcon name="info" size="sm" />
            </div>
          </NuxtLink>
        </li>
        <li>
          <a 
            href="#"
            @click="handleLogout($event)"
            class="nav-link logout-link"
          >
            <AppIcon name="logout" size="md" class="nav-icon" />
            Logout
          </a>
        </li>
      </ul>
    </nav>
    
    <!-- Test Client Selector Popup -->
    <AppPopup
      :show="showTestClientSelector"
      title="Select Test Client"
      size="md"
      @close="showTestClientSelector = false"
    >
      <TestClientSelector
        @close="showTestClientSelector = false"
        @client-selected="handleClientSelected"
      />
    </AppPopup>
  </div>
</template>

<script setup lang="ts">
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'

const isMobileMenuOpen = ref(false)
const isAdmin = ref(false)
const currentProduct = ref<Product | null>(null)
const showBillingWarning = ref(false)
const showEditProductWarning = ref(false)
const showAccountWarning = ref(false)
const notificationCount = ref(0)

// Test client selector state
const showTestClientSelector = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleTestChatClick = (event: Event) => {
  event.preventDefault()
  showTestClientSelector.value = true
  closeMobileMenu()
}

const handleClientSelected = (clientData: { guestId?: string, userToken?: string, apiToken?: string } | null) => {
  showTestClientSelector.value = false
  
  if (clientData) {
    // Build URL with parameters
    const params = new URLSearchParams()
    if (clientData.guestId) params.set('guest-id', clientData.guestId)
    if (clientData.userToken) params.set('user-token', clientData.userToken)
    if (clientData.apiToken) params.set('api-token', clientData.apiToken)
    
    const url = `/test-chat${params.toString() ? '?' + params.toString() : ''}`
    window.open(url, '_blank')
  }
}

const handleLogout = async (event: Event) => {
  event.preventDefault()
  closeMobileMenu()
  
  const nuxtApp = useNuxtApp()
  
  try {
    const confirmed = await nuxtApp.$confirmPopup.show('Are you sure you want to logout?')
    
    if (confirmed) {
      await nuxtApp.$sp.user.logout()
      // Redirect to login page or home page after logout
      await navigateTo('/login')
    }
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const fetchProduct = async () => {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) return
    
    const product = await nuxtApp.$sp.product.findOne({ 
      id: nuxtApp.$userProductId
    })
    
    currentProduct.value = product
    checkWarnings()
  } catch (error) {
    console.error('Failed to fetch product:', error)
  }
}

const checkWarnings = () => {
  checkBillingWarning()
  checkEditProductWarning()
  checkAccountWarning()
  checkNotificationCount()
}

const checkBillingWarning = () => {
  if (!currentProduct.value) {
    showBillingWarning.value = false
    return
  }
  
  const hasLowBalance = (currentProduct.value.balance || 0) <= 1
  const hasInactiveSubscription = !currentProduct.value.subscriptionActive
  
  showBillingWarning.value = hasLowBalance || hasInactiveSubscription
}

const checkEditProductWarning = () => {
  if (!currentProduct.value) {
    showEditProductWarning.value = false
    return
  }
  
  const hasAiOff = !currentProduct.value.chatOn
  
  showEditProductWarning.value = hasAiOff
}

const checkAccountWarning = () => {
  if (!currentProduct.value) {
    showAccountWarning.value = false
    return
  }
  
  const isFlaggedForDeletion = !!currentProduct.value.flaggedForDeletion
  
  showAccountWarning.value = isFlaggedForDeletion
}

const checkNotificationCount = () => {
  if (!currentProduct.value) {
    notificationCount.value = 0
    return
  }
  
  notificationCount.value = currentProduct?.value.notificationConfig?.notificationUnreadCount || 0
}

// Close menu when route changes
const route = useRoute()
watch(() => route.path, async (newPath, oldPath) => {
  closeMobileMenu()
  
  // Refetch product when leaving funds page or navigating to any page
  if (oldPath === '/funds' || oldPath !== '/edit-product') {
    await fetchProduct()
  }

  if(newPath === '/notifications') {
    // set local product notification count to 0
    notificationCount.value = 0
  }
})

// Close menu on escape key
onMounted(async () => {
  // Check admin role from stored value
  const nuxtApp = useNuxtApp()
  isAdmin.value = nuxtApp.$userRole === 'admin'
  
  // Fetch product on init
  await fetchProduct()
  
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMobileMenu()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;
@use 'sass:color';

.menu-container {
  position: relative;
}

/* Mobile header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, $brand-2 0%, $brand 50%, $brand-2 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 1rem;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.mobile-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text;
  margin: 0;
}

.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger-btn span {
  width: 100%;
  height: 2px;
  background: $text;
  border-radius: 1px;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, $panel 0%, color.adjust($panel, $lightness: -3%) 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 1000;
  overflow-y: auto;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(135deg, $brand 0%, $brand-2 100%);
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: $text-white;
  margin: 0;
}

.nav-list {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}

.nav-list li {
  margin: 0;
}

.nav-list a {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: $muted;
  text-decoration: none;
  font-weight: 500;
  border-left: 3px solid transparent;
}

.nav-list a:hover {
  background-color: rgba(110, 231, 255, 0.06);
  color: $brand;
}

.nav-list a.router-link-active {
  background: linear-gradient(135deg, $brand 0%, $brand-2 100%);
  color: $text-white;
  border-left-color: $brand;
}

.nav-list a.disabled-link {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
  
  &:hover {
    background-color: transparent;
    color: $muted;
  }
  
  .nav-icon {
    opacity: 0.5;
  }
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  stroke-width: 2;
}

.logout-link {
  color: color.scale($warning, $lightness: -30%) !important;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
    color: $warning;
  }
}

.nav-link-with-warning {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
}

.nav-link-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.warning-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: $error;
  border-radius: 50%;
  color: white;
  margin-left: 0.5rem;
  animation: pulse-warning 2s infinite;
  
  svg {
    width: 12px;
    height: 12px;
  }
}

@keyframes pulse-warning {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

.nav-link-with-notification {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
}

.notification-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background-color: $brand-2;
  border-radius: 50%;
  color: white;
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0 6px;
  animation: pulse-brand 2s infinite;
}

@keyframes pulse-brand {
  0% {
    box-shadow: 0 0 0 0 rgba($brand, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba($brand, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba($brand, 0);
  }
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Mobile styles */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar-open {
    transform: translateX(0);
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .sidebar-header {
    display: none;
  }
  
  .hamburger-btn:focus span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  
  .hamburger-btn:focus span:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger-btn:focus span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
}

/* Desktop styles */
@media (min-width: 769px) {
  .mobile-header {
    display: none;
  }
  
  .sidebar {
    position: relative;
    transform: none;
    width: 280px;
    height: 100vh;
    position: fixed;
  }
}
</style>
