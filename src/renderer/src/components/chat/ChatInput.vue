<template>
  <footer
    class="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-xl z-20"
  >
    <div class="max-w-4xl mx-auto flex flex-col space-y-2">
      <!-- Replying To Indicator -->
      <div
        v-if="editingMessageId"
        class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 text-sm"
      >
        <div class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
          <span class="font-medium">Branching from previous result</span>
        </div>
        <button
          @click="$emit('cancel-edit')"
          class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
		<!-- <IconButton
		icon="IconX"
		color="primary"
		size="xs"
		@click="$emit('cancel-edit')"
		/> -->
      </div>

      <div class="flex items-end space-x-4">
        <!-- Main Input area using Textarea -->
        <div class="flex-1 relative group">
          <TextArea
            v-model="userPrompt"
            :disabled="false"
            :error="false"
            iconName="IconArrowUp"
            iconOppositePosition
            placeholder="Ask a follow-up question..."
            :required="false"
            :rows="2"
            @icon-click="handleSend"
          />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { TextArea } from '@codebridger/lib-vue-components/form'
import { IconButton } from '@codebridger/lib-vue-components/elements'

defineProps<{
  editingMessageId: string | null
}>()

const emit = defineEmits(['send', 'cancel-edit'])
const userPrompt = ref('')

const handleSend = () => {
  if (!userPrompt.value.trim()) return
  emit('send', userPrompt.value)
  userPrompt.value = ''
}
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

:deep(.form-textarea) {
  border-radius: 1.5rem !important;
  border-color: #e4e4e7 !important;
}

:global(.dark) :deep(.form-textarea) {
  border-color: #27272a !important;
}

:deep(.form-textarea:focus) {
  border-color: rgba(59, 130, 246, 0.5) !important;
}
</style>
