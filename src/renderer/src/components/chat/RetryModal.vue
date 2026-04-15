<template>
  <Modal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" title="Retry Generation"
    size="md">
    <template #trigger>
      <span class="hidden"></span>
    </template>

    <template #default>
      <div class="space-y-6 pt-2">
        <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The generation will restart from this message. You can choose to either branch out or remove existing
          subsequent messages.
        </p>

        <!-- Branch Management -->
        <div
          class="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 transition-all hover:border-primary/20 group">
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Clean up branch</span>
            <span class="text-[11px] text-zinc-500 font-medium">Remove subsequent messages in this branch</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="shouldRemoveBranch" class="sr-only peer">
            <div
              class="w-10 h-5 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary">
            </div>
          </label>
        </div>

        <!-- Multi-Gen Count -->
        <div
          class="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 transition-all hover:border-primary/20 group">
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Generation Count</span>
            <span class="text-[11px] text-zinc-500 font-medium">How many parallel variations to trigger</span>
          </div>

          <div
            class="flex items-center bg-white dark:bg-zinc-800 rounded-xl px-2 py-1 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400 mr-2 select-none">Results</span>
            <select v-model="resultsCount"
              class="bg-transparent border-none text-xs font-black text-zinc-700 dark:text-zinc-300 focus:ring-0 p-0 pr-6 cursor-pointer hover:text-primary transition-colors">
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>

        <!-- Thinking Mode -->
        <div
          class="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 transition-all hover:border-primary/20 group">
          <div class="flex flex-col gap-0.5">
            <span
              class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-heading tracking-wide uppercase text-[10px]">Experimental</span>
            <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Thinking Mode</span>
            <span class="text-[11px] text-zinc-500 font-medium">Activate Chain of Thought (CoT)</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="isThinkingMode" class="sr-only peer">
            <div
              class="w-10 h-5 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500">
            </div>
          </label>
        </div>



        <!-- Auto Use Images -->
        <div
          class="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 transition-all hover:border-primary/20 group">
          <div class="flex flex-col gap-0.5 text-zinc-400 group-hover:text-primary transition-colors">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Smart Auto-References</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5">
                <path d="M12 2l2.4 7.2h7.6l-6.1 4.4 2.3 7.4-6.2-4.6-6.2 4.6 2.3-7.4-6.1-4.4h7.6z" />
              </svg>
            </div>
            <span class="text-[11px] text-zinc-500 font-medium">Automatically use project images as references</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="autoUseImages" class="sr-only peer">
            <div
              class="w-10 h-5 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary">
            </div>
          </label>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button variant="outline" @click="$emit('update:modelValue', false)" class="!rounded-xl px-6">Cancel</Button>
        <Button variant="primary" @click="handleConfirm" class="!rounded-xl px-8 shadow-lg shadow-primary/20">
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Retry Generation
          </div>
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Modal } from 'pilotui/complex'
import { Button } from 'pilotui/elements'
import { useVideoStore } from '../../stores/videoStore'

const props = defineProps<{
  modelValue: boolean
  messageId: string | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const videoStore = useVideoStore()
const shouldRemoveBranch = ref(true)
const resultsCount = ref(1)
const isThinkingMode = ref(false)
const autoUseImages = ref(false)

// Sync with message initial state when opened
watch([() => props.modelValue, () => props.messageId], ([isOpen, msgId]) => {
  if (isOpen && msgId && videoStore.currentThread) {
    const msg = videoStore.currentThread.messages.find(m => m.id === msgId)
    if (msg) {
      autoUseImages.value = msg.autoUseImages || false
    }
  }
}, { immediate: true })

const handleConfirm = () => {
  if (props.messageId) {
    emit('confirm', props.messageId, shouldRemoveBranch.value, resultsCount.value, isThinkingMode.value, autoUseImages.value)
    emit('update:modelValue', false)
  }
}
</script>
