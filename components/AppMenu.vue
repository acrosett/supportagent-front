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
        :aria-label="$t('navigation.toggleMenu')"
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
            {{$t('navigation.dashboard')}}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/edit-product" @click="closeMobileMenu" class="nav-link-with-warning">
            <div class="nav-link-content">
              <AppIcon name="settings" size="md" class="nav-icon" />
              {{ $t('navigation.editProduct') }}
            </div>
            <div v-if="showEditProductWarning" class="warning-indicator">
              <AppIcon name="info" size="sm" />
            </div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/contact-priority" @click="closeMobileMenu">
            <AppIcon name="phone" size="md" class="nav-icon" />
            {{ $t('navigation.contactPriority') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/faq" @click="closeMobileMenu">
            <AppIcon name="info" size="md" class="nav-icon" />
            {{ $t('navigation.faqManagement') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/widget" @click="closeMobileMenu">
            <AppIcon name="gear" size="md" class="nav-icon" />
            {{ $t('navigation.widgetBuilder') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/conversations" @click="closeMobileMenu">
            <AppIcon name="message" size="md" class="nav-icon" />
            {{ $t('navigation.conversations') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/issues" @click="closeMobileMenu">
            <AppIcon name="document" size="md" class="nav-icon" />
            {{ $t('navigation.issues') }}
          </NuxtLink>
        </li>
                <li>
          <NuxtLink to="/custom-tools" @click="closeMobileMenu">
            <AppIcon name="tool" size="md" class="nav-icon" />
            {{ $t('navigation.customTools') }}
          </NuxtLink>
        </li>
        <li>
          <a 
            href="#"
            @click="handleTestChatClick($event)"
            class="nav-link"
          >
            <AppIcon name="media" size="md" class="nav-icon" />
            {{ $t('navigation.testChat') }}
          </a>
        </li>
      </ul>
      <div style="flex:1"></div>
      <ul class="nav-list" style="margin-top:auto;">
        <li>
          <NuxtLink to="/notifications" @click="closeMobileMenu" class="nav-link-with-notification">
            <div class="nav-link-content">
              <AppIcon name="notifications" size="md" class="nav-icon" />
              {{ $t('navigation.notifications') }}
            </div>
            <div v-if="notificationCount > 0" class="notification-count">
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </div>
          </NuxtLink>
        </li>
        <li v-if="isAdmin">
          <NuxtLink to="/logs" @click="closeMobileMenu">
            <AppIcon name="document" size="md" class="nav-icon" />
            {{ $t('navigation.systemLogs') }}
          </NuxtLink>
        </li>
        <li v-if="isAdmin">
          <NuxtLink to="/debug" @click="closeMobileMenu">
            <AppIcon name="tool" size="md" class="nav-icon" />
            {{ $t('navigation.debug') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/funds" @click="closeMobileMenu" class="nav-link-with-warning">
            <div class="nav-link-content">
              <AppIcon name="credit-card" size="md" class="nav-icon" />
              {{ $t('navigation.billingUsage') }}
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
                {{ useNuxtApp().$userEmail || $t('navigation.accountSettings') }}
              </span>
            </div>
            <div v-if="showAccountWarning" class="warning-indicator">
              <AppIcon name="info" size="sm" />
            </div>
          </NuxtLink>
        </li>
        <li class="language-selector">
          <div class="language-dropdown" :class="{ 'dropdown-open': showLanguageDropdown }">
            <button 
              @click="toggleLanguageDropdown"
              class="language-btn"
              :aria-label="$t('navigation.changeLanguage')"
            >
              <img :src="currentFlagUrl" class="flag-icon" />
              {{ currentLocaleDisplay }}
              <AppIcon name="chevron-down" size="sm" class="dropdown-icon" :class="{ 'rotated': showLanguageDropdown }" />
            </button>
            <ul v-if="showLanguageDropdown" class="language-options">
              <li v-for="locale in availableLocales" :key="locale.code">
                <button 
                  @click="switchLanguage(locale.code)"
                  class="language-option"
                  :class="{ 'active': locale.code === currentLocale }"
                >
                  <img :src="flagUrls[locale.code] || flagUrls['en']" class="flag-emoji" />
                  {{ locale.name }}
                </button>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <a 
            href="#"
            @click="handleLogout($event)"
            class="nav-link logout-link"
          >
            <AppIcon name="logout" size="md" class="nav-icon" />
            {{ $t('navigation.logout') }}
          </a>
        </li>
      </ul>
    </nav>
    
    <!-- Test Client Selector Popup -->
    <AppPopup
      :show="showTestClientSelector"
      :title="$t('popup.selectTestClient.title')"
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

// Language selector state
const showLanguageDropdown = ref(false)
import { useLocalNamespace } from '~/composables/useLocalNamespace'
const { locale: currentLocale, locales, setLocale } = useI18n()
const { t } = useLocalNamespace('app-menu')

const availableLocales = computed(() => locales.value)
const currentLocaleDisplay = computed(() => {
  const current = locales.value.find(l => l.code === currentLocale.value)
  return current?.name || 'EN'
})



const flagUrls: Record<string, string> = {
  'en': 'https://kapowaz.github.io/square-flags/flags/gb.svg',
  'fr': 'https://kapowaz.github.io/square-flags/flags/fr.svg',
  'es': 'https://kapowaz.github.io/square-flags/flags/es.svg', 
  'de': 'https://kapowaz.github.io/square-flags/flags/de.svg'
}

const currentFlagUrl = computed(() => {
  return flagUrls[currentLocale.value] || flagUrls['en']
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value
}

const switchLanguage = async (localeCode: string) => {
  try {
    await setLocale(localeCode as any)
    
    // Manually set the cookie to ensure persistence
    const cookieOptions = {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      secure: false,
      sameSite: 'lax' as const
    }
    
    // Set the cookie using Nuxt's useCookie composable
    const localeCookie = useCookie('i18n_locale', cookieOptions)
    localeCookie.value = localeCode
    
    showLanguageDropdown.value = false
    closeMobileMenu()
    
    // Force page reload to ensure locale is properly applied
    await navigateTo(useRoute().fullPath, { replace: true })
  } catch (error) {
    console.error('Failed to switch language:', error)
  }
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
    if (clientData.apiToken) params.set('api-token', clientData.apiToken)
    if (clientData.userToken) params.set('user-token', clientData.userToken)

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
  console.log('Current product:', currentProduct.value)
  if (!currentProduct.value) {
    showEditProductWarning.value = false
    return
  }
  
  const hasAiOff = !currentProduct.value.chatOn
  console.log('hasAiOff:', hasAiOff)
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
  
  // Ensure correct locale is set from cookie
  const localeCookie = useCookie('i18n_locale')
  if (localeCookie.value && localeCookie.value !== currentLocale.value) {
    await setLocale(localeCookie.value as any)
  }
  
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

.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: $muted;
  font-weight: 500;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  border-left: 3px solid transparent;
  
  &:hover {
    background-color: rgba(110, 231, 255, 0.06);
    color: $brand;
  }
}

.flag-icon {
  width: 20px;
  height: 15px;
  margin-right: 0.75rem;
}

.language-options {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
  z-index: 1001;
}

.language-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #333;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &.active {
    background-color: #007bff;
    color: white;
  }
}

.flag-emoji {
  width: 16px;
  height: 12px;
  margin-right: 8px;
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
