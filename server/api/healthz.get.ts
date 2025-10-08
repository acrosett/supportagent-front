export default defineEventHandler(async (event) => {
  // Optional: Add more detailed checks
  try {
    // You could add checks here like:
    // - Database connectivity
    // - External service availability
    // - Memory usage, etc.
    
    // Example memory check
    const memUsage = process.memoryUsage()
    
    // Basic health check response
    const healthStatus: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'DirectSupport.ai Frontend',
      version: '1.0.0', // You can make this dynamic
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB'
      }
    }

    // Set appropriate headers
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return healthStatus
    
  } catch (error) {
    // If any health check fails, return 503
    setResponseStatus(event, 503)
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})