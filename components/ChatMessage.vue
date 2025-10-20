<template>
  <div class="message-wrapper">
    <!-- Regular chat message -->
    <div v-if="message.type !== 'tool-trace'" :class="['message', getMessageClass(message.type), { 'message-streaming': isStreaming(message.id) }]" :data-message-id="message.id">
      <div class="message-header">
        <span class="sender-name">{{ getSenderName(message.type) }} <span class="ai-type-label">{{getAiTypeLabel(message.aiType)}}</span></span>
        <span class="message-time">&nbsp;&nbsp;{{ formatTime(message.createdAt) }}</span>
      </div>
      <div class="message-content" :class="{ 'streaming-content': isStreaming(message.id) }">
        <div v-html="renderMarkdown(getMessageContent(message))"></div>
      </div>
      
      <!-- Follow-up questions (only show on last message) -->
      <div v-if="isLastMessage && hasFollowUps(message)" class="follow-up-questions">
        <div class="follow-up-label">{{ t('chatMessage.followUp.label') }}</div>
        <button 
          v-for="(question, qIndex) in getFollowUps(message)" 
          :key="qIndex"
          class="follow-up-button"
          @click="$emit('send-message', question)"
        >
          {{ question }}
        </button>
      </div>
    </div>
    
    <!-- Tool trace message -->
    <div v-else class="tool-trace-message">
      <div class="tool-trace-header">
        <div class="tool-trace-info">
          <span class="tool-trace-icon">🛠️</span>
          <span class="tool-trace-name">{{ getToolName(message) }}</span>
          <span class="tool-trace-status" :class="getToolTraceStatusClass(message)">
            {{ getToolTraceStatus(message) }}
          </span>
        </div>
        <div class="tool-trace-actions">
          <span class="message-time">{{ formatTime(message.createdAt) }}</span>
          <button 
            class="tool-trace-details-btn" 
            @click="$emit('show-tool-trace-details', message)"
          >
            {{ t('chatMessage.toolTrace.detailsButton') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMarkdown } from '~/composables/useMarkdown'
import { Message } from '~/eicrud_exports/services/SUPPORT-ms/message/message.entity'
import { ToolTrace } from '~/eicrud_exports/services/SUPPORT-ms/tool-trace/tool-trace.entity'
import { useLocalNamespaceAsync } from '~/composables/useLocalNamespace'

const { t } = await useLocalNamespaceAsync('chat')

type ChatMessage = Partial<Message>;
type ToolTraceMessage = Partial<ToolTrace> & { type: 'tool-trace' };
type ChatItem = ChatMessage | ToolTraceMessage;

interface Props {
  message: ChatItem
  isLastMessage?: boolean
  streamingMessageId?: string | null
  isInvertedMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLastMessage: false,
  streamingMessageId: null,
  isInvertedMode: false
})

const emit = defineEmits<{
  'send-message': [message: string]
  'show-tool-trace-details': [trace: ToolTraceMessage]
}>()

// Composables
const { renderMarkdown } = useMarkdown()

// Computed properties and methods
const formatTime = (date?: Date | string | null) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(d)
}

const getSenderName = (messageType?: string) => {
  // Always show the same labels regardless of mode
  return messageType === 'user' ? t('chatMessage.sender.client') : t('chatMessage.sender.agent')
}

const getAiTypeLabel = (aiType?: string) => {
  if (!aiType) return ''
  
  switch (aiType.toLowerCase()) {
    case 'fast':
      return `(${t('chatMessage.aiType.fast')})`
    case 'smart':
      return `(${t('chatMessage.aiType.smart')})`
    case 'pro':
      return `(${t('chatMessage.aiType.pro')})`
    default:
      return ''
  }
}

// Follow-up questions helper functions
const hasFollowUps = (message: ChatItem): boolean => {
  const chatMessage = message as ChatMessage
  return Array.isArray(chatMessage.followUps) && chatMessage.followUps.length > 0
}

const getFollowUps = (message: ChatItem): string[] => {
  const chatMessage = message as ChatMessage
  return chatMessage.followUps || []
}

// Streaming animation helper functions
const isStreaming = (messageId?: string): boolean => {
  return props.streamingMessageId === messageId
}

const getMessageContent = (message: ChatItem): string => {
  const chatMessage = message as ChatMessage
  return chatMessage.content || ''
}

const getMessageClass = (messageType?: string) => {
  // Always use the same styling regardless of mode
  let cond = messageType === 'user'
  if(props.isInvertedMode) {
    cond = !cond;
  }
  return cond ? 'message-fan' : 'message-model'
}

// Tool trace helper functions
const getToolName = (trace: ToolTraceMessage): string => {
  return trace.toolName || t('chatMessage.toolTrace.unknownTool')
}

const getToolTraceStatus = (trace: ToolTraceMessage): string => {
  if (trace.toolError) return t('chatMessage.toolTrace.status.error')
  if (trace.toolResult) return t('chatMessage.toolTrace.status.success')
  return t('chatMessage.toolTrace.status.unknown')
}

const getToolTraceStatusClass = (trace: ToolTraceMessage): string => {
  if (trace.toolError) return 'status-error'
  if (trace.toolResult) return 'status-success'
  return 'status-unknown'
}
</script>

<style lang="scss" scoped>
.message-wrapper { 
  display: flex; 
  flex-direction: column; 
}

.message { 
  max-width: 80%; 
  padding: 0.75rem 1rem; 
  border-radius: 18px; 
  word-wrap: break-word; 
}

.message-fan { 
  align-self: flex-end; 
  background: var(--primary-color, #667eea); 
  color: #fff; 
  border-bottom-right-radius: 6px; 
}

.message-model { 
  align-self: flex-start; 
  background: #f1f3f4; 
  color: #333; 
  border-bottom-left-radius: 6px; 
}

:global(.dark-mode) .message-model { 
  background: #26262b; 
  color: #e6e8ef; 
}

:global(.dark-mode) .message-fan { 
  background: var(--primary-color, #667eea); 
}

.message-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 0.5rem; 
  font-size: 0.75rem; 
  opacity: 0.8; 
}

.sender-name { 
  font-weight: 600; 
}

.ai-type-label { 
  opacity: 0.7; 
}

.message-time { 
  font-size: 0.7rem; 
}

.message-content p { 
  margin: 0; 
  line-height: 1.4; 
}

.message-content { 
  display: flex; 
  flex-direction: column; 
  gap: 0.5rem; 
}

.message-content :deep(ul), 
.message-content :deep(ol) { 
  margin: 0; 
  padding-left: 1.5rem; 
  line-height: 1.4; 
}

.message-content :deep(li) { 
  margin-bottom: 0.25rem; 
}

.message-content :deep(pre) { 
  position: relative; 
  background: #1e1e22; 
  color: #f5f5f5; 
  padding: 0.75rem 1rem; 
  border-radius: 8px; 
  overflow: auto; 
  font-size: 0.75rem; 
  line-height: 1.4; 
}

.message-content :deep(pre) { 
  scrollbar-width: thin; 
  scrollbar-color: rgba(255,255,255,.25) transparent; 
}

.message-content :deep(pre::-webkit-scrollbar) { 
  height: 8px; 
  width: 8px; 
}

.message-content :deep(pre::-webkit-scrollbar-track) { 
  background: transparent; 
}

.message-content :deep(pre::-webkit-scrollbar-thumb) { 
  background: rgba(255,255,255,.22); 
  border-radius: 4px; 
}

.message-content :deep(pre:hover::-webkit-scrollbar-thumb) { 
  background: rgba(255,255,255,.34); 
}

:global(.dark-mode) .message-content :deep(pre) { 
  scrollbar-color: rgba(255,255,255,.25) transparent; 
}

.message-content :deep(pre code) { 
  background: transparent; 
  padding: 0; 
  display: block; 
  font-family: Menlo,Consolas,monospace; 
}

.message-content :deep(pre .code-copy-btn) { 
  position: absolute; 
  top: 6px; 
  right: 6px; 
  background: #2d2d33; 
  color: #ddd; 
  border: 1px solid #3a3a42; 
  font-size: 0.65rem; 
  padding: 0.25rem 0.5rem; 
  border-radius: 4px; 
  cursor: pointer; 
  opacity: 0.85; 
  transition: background .15s, opacity .15s; 
}

.message-content :deep(pre .code-copy-btn:hover) { 
  background: #3a3a42; 
  opacity: 1; 
}

.message-content :deep(pre .code-copy-btn.copied) { 
  background: var(--primary-color,#667eea); 
  color: #fff; 
  border-color: var(--primary-color,#667eea); 
}

:global(.dark-mode) .message-content :deep(pre) { 
  background: #111114; 
}

:global(.dark-mode) .message-content :deep(pre .code-copy-btn) { 
  background: #24242a; 
  border-color: #2f2f37; 
}

:global(.dark-mode) .message-content :deep(pre .code-copy-btn:hover) { 
  background: #2f2f37; 
}

/* Follow-up Questions Styles */
.follow-up-questions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-fan .follow-up-questions {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.message-model .follow-up-questions {
  border-top-color: rgba(0, 0, 0, 0.1);
}

:global(.dark-mode) .message-model .follow-up-questions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.follow-up-label {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.follow-up-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  line-height: 1.4;
}

.follow-up-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(2px);
}

.message-model .follow-up-button {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: #333;
}

.message-model .follow-up-button:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.15);
}

:global(.dark-mode) .message-model .follow-up-button {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #e6e8ef;
}

:global(.dark-mode) .message-model .follow-up-button:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Tool Trace Styles */
.tool-trace-message {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 0.75rem;
  max-width: 90%;
  align-self: flex-end;
}

:global(.dark-mode) .tool-trace-message {
  background: #2a2a31;
  border-color: #3a3a42;
}

.tool-trace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tool-trace-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.tool-trace-icon {
  font-size: 1.2rem;
}

.tool-trace-name {
  font-weight: 600;
  color: #495057;
}

:global(.dark-mode) .tool-trace-name {
  color: #e9ecef;
}

.tool-trace-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

:global(.dark-mode) .status-success {
  background: #155724;
  color: #d4edda;
  border-color: #0f4419;
}

:global(.dark-mode) .status-error {
  background: #721c24;
  color: #f8d7da;
  border-color: #5a161c;
}

:global(.dark-mode) .status-unknown {
  background: #495057;
  color: #e9ecef;
  border-color: #3a3a42;
}

.tool-trace-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tool-trace-details-btn {
  background: var(--primary-color, #667eea);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tool-trace-details-btn:hover {
  background: var(--primary-color-hover, #5a6fd8);
}

/* Message reveal animation - reveals entire message from top to bottom */
.message-streaming {
  animation: messageReveal 1s forwards;
}

@keyframes messageReveal {
  0% {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}
</style>