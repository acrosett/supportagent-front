export default defineNuxtPlugin(async () => {
  // Get runtime config
  const config = useRuntimeConfig()
  const appVersion = config.public.appVersion
  const apiBaseUrl = config.public.apiBaseUrl
  
  console.log('AI Support Widget:', appVersion);
  
  try {
    console.log('Making request to API:', apiBaseUrl);
    const response = await fetch(apiBaseUrl)
    const result = await response.text()
    console.log(result);
  } catch (error) {
    console.log('API Request failed:', error);
  }
})