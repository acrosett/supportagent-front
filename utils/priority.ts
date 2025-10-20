import { ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'

/**
 * Get the emoji representation for a client priority level
 * @param priority - The client priority level
 * @returns The corresponding emoji string
 */
export const getPriorityEmoji = (priority: ClientPriority): string => {
  switch (priority) {
    case ClientPriority.HIGH:
      return '🟡' // High priority - yellow circle
    case ClientPriority.REGULAR:
      return '🔵' // Regular priority - blue circle
    case ClientPriority.LOWEST:
    default:
      return '⚪' // Lowest priority - white circle
  }
}

