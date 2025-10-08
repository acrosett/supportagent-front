export default defineNuxtPlugin(async () => {
  console.log('AI Support Widget: CURRENT_VERSION_STRING');
  
  // Get API base URL from runtime config
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl
  
  try {
    console.log('Making request to API:', apiBaseUrl);
    const response = await fetch(apiBaseUrl)
    const result = await response.text()
    console.log(result);
  } catch (error) {
    console.log('API Request failed:', error);
  }
})