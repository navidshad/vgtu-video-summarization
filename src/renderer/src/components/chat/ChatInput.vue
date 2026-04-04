<template>
  <footer
    class="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-xl z-20">
    <div class="max-w-4xl mx-auto flex flex-col space-y-2">
      <!-- Attached Images Preview -->
      <div v-if="attachedImages.length > 0" class="flex flex-wrap gap-2 px-2 pb-2">
        <div 
          v-for="(img, idx) in attachedImages" 
          :key="idx" 
          class="relative w-16 h-16 rounded-xl overflow-hidden group shadow-sm border border-zinc-200 dark:border-zinc-800"
        >
          <img :src="normalizeUrl(img)" class="w-full h-full object-cover" />
          <button 
            @click="removeAttachment(idx)"
            class="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="flex items-end space-x-4">
        <!-- Attachment Toggle -->
        <button 
          @click="showAttachmentModal = true"
          class="mb-2 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-primary transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14m-7-7v14"/>
          </svg>
        </button>

        <!-- Main Input area -->
        <InputGroup
          class="!rounded-lg overflow-hidden flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus-within:border-blue-500/50 transition-colors">
          <TextArea v-model="userPrompt" placeholder="Ask a follow-up question or suggest an edit..." :rows="2"
            class="flex-1 !border-0 focus:!ring-0 bg-transparent" @enter="handleSend" />

          <div class="flex items-center p-2 space-x-2 bg-transparent">
            <!-- Compact Branching Indicator -->
            <div v-if="editingMessageId"
              class="flex items-center space-x-1.5 bg-blue-50/80 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/30 text-[11px] text-blue-600 dark:text-blue-400 mb-0.5 animate-in fade-in slide-in-from-right-2 duration-300">
              <span class="font-bold font-mono cursor-pointer hover:underline"
                @click="$emit('scroll-to-reference', editingMessageId)">{{ branchedVersion }}</span>
              <button class="hover:bg-blue-100 dark:hover:bg-blue-800/50 p-0.5 rounded-lg transition-colors"
                @click="$emit('cancel-edit')">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <IconButton icon="IconSend" color="primary" size="sm" rounded="lg" :disabled="!userPrompt.trim() && attachedImages.length === 0"
              @click="handleSend" />
          </div>
        </InputGroup>
      </div>
    </div>

    <AttachmentModal 
      v-model="showAttachmentModal"
      @select="handleImagesSelected"
    />
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AttachmentModal from './AttachmentModal.vue'
import { TextArea, InputGroup } from 'pilotui/form'
import { IconButton } from 'pilotui/elements'
import { FileType } from '@shared/types'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{
  editingMessageId: string | null
}>()

const emit = defineEmits(['send', 'cancel-edit', 'scroll-to-reference'])

const videoStore = useVideoStore()
const userPrompt = ref('')
const showAttachmentModal = ref(false)
const attachedImages = ref<string[]>([])

const branchedVersion = computed(() => {
  if (!props.editingMessageId) return ''
  const msg = videoStore.messages.find((m) => m.id === props.editingMessageId)
  if (!msg) return '...'

  const version = msg.version || msg.id.slice(0, 4)
  const videoFile = msg.files?.find((f) => f.type === FileType.Preview || f.type === FileType.Actual)
  const type = videoFile ? ` ${videoFile.type.toUpperCase()}` : ''

  return `v.${version}${type}`
})

const normalizeUrl = (url: string) => {
  return url.startsWith('media://') ? url : `media://${url}`
}

const handleImagesSelected = (images: string[]) => {
  attachedImages.value = [...attachedImages.value, ...images]
}

const removeAttachment = (index: number) => {
  attachedImages.value.splice(index, 1)
}

const handleSend = () => {
  if (!userPrompt.value.trim() && attachedImages.value.length === 0) return
  emit('send', userPrompt.value, attachedImages.value)
  userPrompt.value = ''
  attachedImages.value = []
}
</script>

<style scoped>
/* Scrollbar Customization */
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

:deep(.form-textarea) {
  border: none !important;
  box-shadow: none !important;
}
</style>
