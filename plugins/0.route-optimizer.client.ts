// Plugin to conditionally load other plugins based on route
export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  
  // Define routes that should have minimal plugin loading
  const lightweightRoutes = ['/test-chat']
  
  // Check if current route should be lightweight
  const isLightweightRoute = lightweightRoutes.some(route_path => 
    route.path.startsWith(route_path)
  )
  
  // Add route info to nuxt app for other plugins to check
  nuxtApp.$isLightweightRoute = isLightweightRoute
  
  // Only load essential plugins for lightweight routes
  if (isLightweightRoute) {
    console.log('Loading lightweight mode for:', route.path)
  }
})
