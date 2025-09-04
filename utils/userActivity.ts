/**
 * Shared user activity tracking utility
 * Used to detect when the user is active/inactive and control auto-refresh behavior
 */
export interface ActivityTracker {
  isUserActive: Ref<boolean>
  lastActivityTime: Ref<number>
  updateActivity: () => void
  checkUserActivity: () => void
  setupActivityListeners: () => () => void
  startAutoRefresh: (callback: () => void | Promise<void>, interval?: number) => void
  stopAutoRefresh: () => void
}

export function useUserActivity(): ActivityTracker {
  const isUserActive = ref(true)
  const lastActivityTime = ref(Date.now())
  const refreshInterval = ref<NodeJS.Timeout | null>(null)
  
  const updateActivity = () => {
    lastActivityTime.value = Date.now()
    isUserActive.value = true
  }
  
  const checkUserActivity = () => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityTime.value
    
    // Consider user inactive after 3 minutes (180 seconds) of no activity
    if (timeSinceLastActivity > 180000) {
      isUserActive.value = false
    }
  }
  
  const setupActivityListeners = () => {
    // Track mouse movement
    const handleMouseMove = () => updateActivity()
    
    // Track keyboard activity  
    const handleKeyPress = () => updateActivity()
    
    // Track clicks
    const handleClick = () => updateActivity()
    
    // Track scroll
    const handleScroll = () => updateActivity()
    
    // Track window focus
    const handleFocus = () => {
      updateActivity()
    }
    
    // Track window blur
    const handleBlur = () => {
      isUserActive.value = false
    }
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('keypress', handleKeyPress, { passive: true })
    document.addEventListener('click', handleClick, { passive: true })
    document.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    
    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keypress', handleKeyPress)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }
  
  const startAutoRefresh = (callback: () => void | Promise<void>, interval: number = 5000) => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
    }
    
    refreshInterval.value = setInterval(async () => {
      // Only refresh if user is active
      if (isUserActive.value) {
        await callback()
      }
      
      // Check if user is still active
      checkUserActivity()
    }, interval)
  }
  
  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }
  
  return {
    isUserActive,
    lastActivityTime,
    updateActivity,
    checkUserActivity,
    setupActivityListeners,
    startAutoRefresh,
    stopAutoRefresh
  }
}
