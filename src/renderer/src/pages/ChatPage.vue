<template>
  <div class="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-200 transition-colors">
    <!-- Header -->
    <ChatHeader :title="videoStore.currentVideoName" @back="handleBack" />

    <!-- Chat Messages Stack -->
    <main ref="scrollContainer" class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
      <div class="max-w-4xl mx-auto space-y-4">
        <ChatMessage v-for="(msg, i) in videoStore.messages" :key="msg.id" :id="'message-' + msg.id" :message="msg"
          :is-first="i === 0"
          :is-latest-user="videoStore.messages.findLastIndex(m => m.role === MessageRole.User) === i"
          @edit="startEditing" @save-video="handleSave" @scroll-to-reference="scrollToMessage"
          @remove="videoStore.removeMessage" @retry="videoStore.retryMessage" />
      </div>
    </main>

    <!-- Chat Input -->
    <ChatInput :editing-message-id="editingMessageId" @send="handleSendMessage" @cancel-edit="cancelEdit"
      @scroll-to-reference="scrollToMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessageRole } from '@shared/types'
import { useVideoStore } from '../stores/videoStore'
import ChatHeader from '../components/chat/ChatHeader.vue'
import ChatInput from '../components/chat/ChatInput.vue'
import ChatMessage from '../components/chat/ChatMessage.vue'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()
const scrollContainer = ref<HTMLElement | null>(null)
const editingMessageId = ref<string | null>(null)

const handleBack = () => {
  router.push('/home')
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const startEditing = (messageId: string) => {
  editingMessageId.value = messageId
  const textarea = document.querySelector('textarea')
  textarea?.focus()
}

const cancelEdit = () => {
  editingMessageId.value = null
}

const scrollToMessage = (messageId: string) => {
  const element = document.getElementById('message-' + messageId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Auto-scroll when new messages arrive
watch(() => videoStore.messages.length, scrollToBottom)

// Clear edit mode if a new AI message comes with a video file
watch(() => videoStore.messages, (newMessages) => {
  if (editingMessageId.value && newMessages.length > 0) {
    const lastMessage = newMessages[newMessages.length - 1]
    if (lastMessage.role === MessageRole.AI && !lastMessage.isPending && lastMessage.files && lastMessage.files.length > 0) {
      editingMessageId.value = null
    }
  }
}, { deep: true })

const handleSendMessage = async (userPrompt: string) => {
  // Capture the context ID (which we now persist)
  const editRefId = editingMessageId.value

  // The store action handles adding to current thread
  await videoStore.addMessage(userPrompt, MessageRole.User, editRefId || undefined)

  if (videoStore.currentThreadId) {
    // Pass the captured context ID (if any) to startProcessing
    await videoStore.startProcessing(videoStore.currentThreadId, editRefId || undefined)
  }
}

const handleSave = async (filePath: string) => {
  try {
    // @ts-ignore - api is exposed via preload
    await window.api.saveVideo(filePath)
  } catch (error) {
    console.error('Failed to save video:', error)
  }
}

onMounted(async () => {
  const threadId = route.params.id as string
  if (threadId) {
    await videoStore.selectThread(threadId)
    // If we just created it and it has 1 message (user), start processing
    if (videoStore.messages.length === 1 && videoStore.messages[0].role === MessageRole.User) {
      videoStore.startProcessing(threadId)
    }
  }

  scrollToBottom()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>