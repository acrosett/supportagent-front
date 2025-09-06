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
        AI Support Agent
      </h1>
    </header>

    <!-- Sidebar navigation -->
    <nav class="sidebar" :class="{ 'sidebar-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <h2 class="app-title">
          <i class="fas fa-robot"></i>
          AI Support Agent
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
          <NuxtLink to="/notifications" @click="closeMobileMenu">
            <AppIcon name="notifications" size="md" class="nav-icon" />
            Notifications
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/insights" @click="closeMobileMenu">
            <AppIcon name="stats" size="md" class="nav-icon" />
            Analytics & Insights
          </NuxtLink>
        </li>
        <li>
          <a 
            href="#"
            @click="handleTestChatClick($event)"
            class="nav-link"
          >
            <AppIcon name="chat" size="md" class="nav-icon" />
            Test Chat
          </a>
        </li>
        <li>
          <NuxtLink to="/edit-product" @click="closeMobileMenu">
            <AppIcon name="settings" size="md" class="nav-icon" />
            Edit Product
          </NuxtLink>
        </li>
      </ul>
      <div style="flex:1"></div>
      <ul class="nav-list" style="margin-top:auto;">
        <li v-if="isAdmin">
          <NuxtLink to="/debug" @click="closeMobileMenu">
            <AppIcon name="tool" size="md" class="nav-icon" />
            Debug
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/funds" @click="closeMobileMenu">
            <AppIcon name="credit-card" size="md" class="nav-icon" />
            Billing & Usage
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/account" @click="closeMobileMenu">
            <AppIcon name="user" size="md" class="nav-icon" />
            Account Settings
          </NuxtLink>
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
const isMobileMenuOpen = ref(false)
const isAdmin = ref(false)

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

// Close menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  closeMobileMenu()
})

// Close menu on escape key
onMounted(async () => {
  // Check admin role
  try {
    const role = await useNuxtApp().$sp.user.get_user_role({ myArg: 'test' })
    isAdmin.value = role === 'admin'
  } catch (error) {
    console.error('Failed to check admin role:', error)
    isAdmin.value = false
  }
  
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
