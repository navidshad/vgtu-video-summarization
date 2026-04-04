<template>
  <footer
    class="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-xl z-20"
  >
    <div class="max-w-4xl mx-auto flex flex-col space-y-2">
      <!-- Branched Version Indicator -->
      <div v-if="editingMessageId"
        class="flex items-center space-x-1.5 bg-blue-50/80 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100/50 dark:border-blue-800/30 text-[11px] text-blue-600 dark:text-blue-400 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300 w-fit"
      >
        <span class="font-bold font-mono cursor-pointer hover:underline"
          @click="$emit('scroll-to-reference', editingMessageId)">{{ branchedVersion }}</span>
        <button class="hover:bg-blue-100 dark:hover:bg-blue-800/50 p-1 rounded-lg transition-colors"
          @click="$emit('cancel-edit')">
          <span class="icon-[tabler--x] w-3 h-3"></span>
        </button>
      </div>

      <BaseMessageInput 
        v-model="userPrompt"
        v-model:attachedImages="attachedImages"
        placeholder="Ask a follow-up question or suggest an edit..."
        @send="handleSend"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseMessageInput from './BaseMessageInput.vue'
import { FileType } from '@shared/types'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{
  editingMessageId: string | null
}>()

const emit = defineEmits(['send', 'cancel-edit', 'scroll-to-reference'])

const videoStore = useVideoStore()
const userPrompt = ref('')
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

const handleSend = (text: string, images: string[]) => {
  emit('send', text, images)
  userPrompt.value = ''
  attachedImages.value = []
}
</script>

<style scoped>
:deep(.form-textarea) {
  border: none !important;
  box-shadow: none !important;
}
</style>
