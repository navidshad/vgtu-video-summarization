<template>
  <div class="glass-card glass-card-hover input-focus-ring p-3 rounded-2xl min-w-[320px] cursor-move">
    <Handle type="target" :position="Position.Top" class="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800" />
    
    <BaseMessageInput 
      v-model="input"
      v-model:attachedImages="attachedImages"
      placeholder="Ask for summary, cover, etc..."
      compact
      class="nodrag interactive-in-pan"
      @send="submit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import BaseMessageInput from '../chat/BaseMessageInput.vue'

const props = defineProps<{ data: any }>()
const input = ref('')
const attachedImages = ref<string[]>([])

const submit = (text: string, images: string[], count: number, isThinkingMode: boolean) => {
  if ((text.trim() || images.length > 0) && props.data.onSubmit) {
    props.data.onSubmit(text, images, count, isThinkingMode)
    input.value = ''
    attachedImages.value = []
  }
}
</script>
