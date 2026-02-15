<template>
  <footer
    class="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-xl z-20">
    <div class="max-w-4xl mx-auto flex flex-col space-y-2">
      <div class="flex items-end space-x-4">
        <!-- Main Input area -->
        <InputGroup
          class="!rounded-2xl overflow-hidden flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus-within:border-blue-500/50 transition-colors">
          <TextArea v-model="userPrompt" placeholder="Ask a follow-up question..." :rows="2"
            class="flex-1 !border-0 focus:!ring-0 bg-transparent" @enter="handleSend" />

          <div class="flex items-center p-2 space-x-2 bg-transparent">
            <!-- Compact Branching Indicator -->
            <div v-if="editingMessageId"
              class="flex items-center space-x-1.5 bg-blue-50/80 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/30 text-[11px] text-blue-600 dark:text-blue-400 mb-0.5 animate-in fade-in slide-in-from-right-2 duration-300">
              <span class="font-bold font-mono cursor-pointer hover:underline"
                @click="$emit('scroll-to-reference', editingMessageId)">{{ branchedVersion }}</span>
              <button class="hover:bg-blue-100 dark:hover:bg-blue-800/50 p-0.5 rounded-md transition-colors"
                @click="$emit('cancel-edit')">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <IconButton icon="IconSend" color="primary" size="sm" rounded="lg" :disabled="!userPrompt.trim()"
              @click="handleSend" />
          </div>
        </InputGroup>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TextArea, InputGroup } from '@codebridger/lib-vue-components/form'
import { IconButton } from '@codebridger/lib-vue-components/elements'
import { FileType } from '@shared/types'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{
  editingMessageId: string | null
}>()

const emit = defineEmits(['send', 'cancel-edit', 'scroll-to-reference'])

const videoStore = useVideoStore()
const userPrompt = ref('')

const branchedVersion = computed(() => {
  if (!props.editingMessageId) return ''
  const msg = videoStore.messages.find((m) => m.id === props.editingMessageId)
  if (!msg) return '...'

  const version = msg.version || msg.id.slice(0, 4)
  const videoFile = msg.files?.find((f) => f.type === FileType.Preview || f.type === FileType.Actual)
  const type = videoFile ? ` ${videoFile.type.toUpperCase()}` : ''

  return `v.${version}${type}`
})

const handleSend = () => {
  if (!userPrompt.value.trim()) return
  emit('send', userPrompt.value)
  userPrompt.value = ''
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
