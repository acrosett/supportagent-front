import { LlmTrainingData } from '~/eicrud_exports/services/LOG-ms/llm-training-data/llm-training-data.entity'

export const useLlmLogs = () => {
  const logs = ref<LlmTrainingData[]>([])
  const isLoadingLogs = ref(false)
  
  const fetchLogs = async (contextId: string) => {
    if (!contextId) return
    
    try {
      isLoadingLogs.value = true
      
      const { $sp } = useNuxtApp()
      
      // Fetch LLM training data for this context
      const logsResult = await $sp.llmTrainingData.find({
        contextId: contextId
      }, {
        orderBy: { createdAt: 'desc' },
        limit: 1 // Only get the latest log entry
      })
      
      logs.value = Array.isArray(logsResult) ? logsResult : (logsResult?.data || [])
      
      if (logs.value.length === 0) {
        useNuxtApp().$toast.show('No logs found for this context', 'info')
      }
      
    } catch (error) {
      console.error('Failed to fetch LLM logs:', error)
      useNuxtApp().$toast.show(error, 'error')
      logs.value = []
    } finally {
      isLoadingLogs.value = false
    }
  }
  
  const clearLogs = () => {
    logs.value = []
  }
  
  return {
    logs: readonly(logs),
    isLoadingLogs: readonly(isLoadingLogs),
    fetchLogs,
    clearLogs
  }
}