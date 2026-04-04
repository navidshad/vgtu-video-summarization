<template>
  <div class="flex flex-col space-y-2" :class="[compact ? '' : 'max-w-4xl mx-auto w-full']">
    <!-- Attached Images Preview -->
    <div v-if="attachedImages.length > 0" class="flex flex-wrap gap-2 px-1 pb-1">
      <div v-for="(img, idx) in attachedImages" :key="idx"
        class="relative rounded-xl overflow-hidden group shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-105"
        :class="compact ? 'w-10 h-10' : 'w-16 h-16'">
        <img :src="normalizeUrl(img)" class="w-full h-full object-cover" />
        <button @click="removeAttachment(idx)"
          class="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="icon-[tabler--x] w-3 h-3"></span>
        </button>
      </div>
    </div>

    <!-- Main Input area -->
    <div class="flex items-end transition-all duration-300" :class="[
      compact
        ? 'space-x-1.5'
        : 'space-x-4 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20'
    ]">
      <!-- Attachment Toggle -->
      <IconButton @click="showAttachmentModal = true" icon="IconPlus" :size="compact ? 'sm' : 'md'" rounded="full"
        variant="ghost" class="mb-0.5 text-zinc-400 hover:text-primary transition-all active:scale-95" />

      <div class="flex-1 min-w-0">
        <textarea v-model="internalText" ref="textareaRef" :placeholder="placeholder" :rows="1"
          class="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 resize-none py-2 px-1 leading-relaxed custom-scrollbar"
          :class="compact ? 'text-[11px] max-h-[150px]' : 'text-sm max-h-[300px]'" @input="adjustTextarea"
          @keydown.enter="handleEnter"></textarea>
      </div>

      <IconButton @click="handleSend" :icon="submitIcon" color="primary" :size="compact ? 'xs' : 'sm'" rounded="lg"
        :disabled="!internalText.trim() && attachedImages.length === 0" />
    </div>

    <AttachmentModal v-model="showAttachmentModal" @select="handleImagesSelected" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { IconButton } from 'pilotui/elements'
import AttachmentModal from './AttachmentModal.vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  attachedImages?: string[]
  compact?: boolean
  submitIcon?: string
}>(), {
  placeholder: 'Type a message...',
  attachedImages: () => [],
  compact: false,
  submitIcon: 'IconSend'
})

const emit = defineEmits(['update:modelValue', 'update:attachedImages', 'send'])

const internalText = ref(props.modelValue)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showAttachmentModal = ref(false)

// Sync modelValue
watch(() => props.modelValue, (newVal) => {
  internalText.value = newVal
})

watch(internalText, (newVal) => {
  emit('update:modelValue', newVal)
})

const normalizeUrl = (url: string) => {
  if (!url) return ''
  return url.startsWith('media://') ? url : `media://${url}`
}

const adjustTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && (internalText.value.trim() || props.attachedImages.length > 0)) {
    e.preventDefault()
    handleSend()
  }
}

const handleImagesSelected = (images: string[]) => {
  const updated = [...props.attachedImages, ...images]
  emit('update:attachedImages', updated)
}

const removeAttachment = (index: number) => {
  const updated = [...props.attachedImages]
  updated.splice(index, 1)
  emit('update:attachedImages', updated)
}

const handleSend = () => {
  if (!internalText.value.trim() && props.attachedImages.length === 0) return
  emit('send', internalText.value, [...props.attachedImages])

  // Clear local state if parent doesn't reset via props (standard pattern)
  internalText.value = ''
  emit('update:attachedImages', [])

  setTimeout(adjustTextarea, 0)
}

onMounted(() => {
  adjustTextarea()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}
</style>
