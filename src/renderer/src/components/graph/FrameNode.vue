<template>
  <div 
    class="frame-node rounded-[2rem] border-2 border-dashed relative group"
    :class="[
      selected ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-zinc-300 dark:border-zinc-700 bg-zinc-400/5 dark:bg-zinc-400/5',
      isResizing ? 'cursor-nwse-resize' : ''
    ]"
    :style="{ 
      width: `${nodeWidth}px`, 
      height: `${nodeHeight}px`,
    }"
  >
    <!-- Zoom-Sensitive Title -->
    <div 
      class="absolute -top-10 left-0 flex items-center gap-2 px-1"
      :style="{ 
        transform: `scale(${1 / Math.max(0.4, viewport.zoom)})`, 
        transformOrigin: 'bottom left' 
      }"
    >
      <div 
        v-if="isEditing" 
        class="flex items-center bg-white dark:bg-zinc-800 rounded-lg shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden"
      >
        <input 
          ref="inputRef"
          v-model="editTitle"
          class="bg-transparent border-none outline-none px-3 py-1 font-bold text-sm text-zinc-900 dark:text-zinc-100 min-w-[120px]"
          @blur="saveTitle"
          @keydown.enter="saveTitle"
          @keydown.esc="cancelEditing"
        />
      </div>
      <div 
        v-else 
        class="flex items-center gap-2 cursor-text group/title"
        @dblclick="startEditing"
      >
        <div class="px-3 py-1 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-2 hover:border-primary/50 transition-colors">
          <div class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
          <span class="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
            {{ data.title || 'Untitled Group' }}
          </span>
        </div>
        <button 
          class="p-1 opacity-0 group-hover/title:opacity-100 text-zinc-400 hover:text-primary transition-all duration-200"
          @click="startEditing"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Delete Button -->
    <SlimTooltip v-if="selected" text="Delete Frame (ungroup children)" placement="left">
      <button 
        class="absolute top-4 right-4 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 z-50 pointer-events-auto"
        @click="data.onDelete"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </SlimTooltip>

    <!-- Resize Handle -->
    <div 
      v-if="selected"
      class="absolute bottom-4 right-4 w-6 h-6 flex items-center justify-center cursor-nwse-resize text-zinc-400 dark:text-zinc-600 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
      @mousedown.stop.prevent="startResizing"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Selection Area Label -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
      <span class="text-4xl font-black uppercase tracking-[1em] text-zinc-400 dark:text-zinc-600 rotate-12">Frame</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import SlimTooltip from '../SlimTooltip.vue'

const props = defineProps<{
  id: string
  data: {
    title: string
    width: number
    height: number
    onUpdate?: (id: string, metadata: any) => void
    onDelete?: () => void
  }
  selected?: boolean
}>()

const { viewport } = useVueFlow()

const nodeWidth = ref(props.data.width || 400)
const nodeHeight = ref(props.data.height || 300)

const isResizing = ref(false)

const startResizing = (e: MouseEvent) => {
  isResizing.value = true
  document.body.style.cursor = 'nwse-resize'
  document.body.style.userSelect = 'none'
  
  const startX = e.clientX
  const startY = e.clientY
  const startWidth = nodeWidth.value
  const startHeight = nodeHeight.value

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isResizing.value) return
    const zoom = viewport.value.zoom || 1
    const deltaX = (moveEvent.clientX - startX) / zoom
    const deltaY = (moveEvent.clientY - startY) / zoom
    
    nodeWidth.value = Math.max(200, startWidth + deltaX)
    nodeHeight.value = Math.max(150, startHeight + deltaY)
  }

  const onMouseUp = () => {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    
    if (props.data.onUpdate) {
      props.data.onUpdate(props.id, { 
        width: nodeWidth.value, 
        height: nodeHeight.value 
      })
    }
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// Title Editing logic
const isEditing = ref(false)
const editTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const startEditing = () => {
  editTitle.value = props.data.title || 'Untitled Group'
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

const saveTitle = () => {
  if (!isEditing.value) return
  isEditing.value = false
  if (props.data.onUpdate) {
    props.data.onUpdate(props.id, { title: editTitle.value })
  }
}

const cancelEditing = () => {
  isEditing.value = false
}

// Sync from props
watch(() => props.data.width, (v) => { if (v) nodeWidth.value = v })
watch(() => props.data.height, (v) => { if (v) nodeHeight.value = v })

</script>

<style scoped>
.frame-node {
  /* Ensure the node is behind others but not interactive for background clicks unless needed */
  z-index: -1;
}
</style>
