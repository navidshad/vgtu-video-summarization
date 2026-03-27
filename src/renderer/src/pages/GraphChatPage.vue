<template>
  <div class="h-full w-full flex flex-col relative bg-zinc-50 dark:bg-zinc-950">
    <div class="px-5 py-3 z-10 w-full flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
      <button @click="router.push('/home')" class="flex items-center justify-center w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition text-zinc-600 dark:text-zinc-300 flex-shrink-0">
        <svg class="w-4 h-4 ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <h1 class="text-xl font-bold font-heading text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
        {{ videoStore.currentVideoName || 'Graph Task Manager' }}
      </h1>
    </div>
    
    <div class="flex-1 w-full relative">
      <VueFlow 
        :nodes="graphStore.nodes" 
        :edges="graphStore.edges" 
        class="vue-flow-custom" 
        @pane-ready="onPaneReady"
      >
        <Background pattern-color="#888" :gap="20" />
        <Controls />
        
        <template #node-message="props">
          <MessageNode v-bind="props" />
        </template>
        <template #node-media="props">
          <MediaNode v-bind="props" />
        </template>
        <template #node-task="props">
          <TaskProgressNode v-bind="props" />
        </template>
        <template #node-result="props">
          <ResultNode v-bind="props" />
        </template>
        <template #node-input="props">
          <ChatInputNode v-bind="props" />
        </template>
      </VueFlow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

import { useGraphStore } from '../stores/graphStore'
import { useTaskStore } from '../stores/taskStore'
import { useVideoStore } from '../stores/videoStore'

import MessageNode from '../components/graph/MessageNode.vue'
import MediaNode from '../components/graph/MediaNode.vue'
import TaskProgressNode from '../components/graph/TaskProgressNode.vue'
import ResultNode from '../components/graph/ResultNode.vue'
import ChatInputNode from '../components/graph/ChatInputNode.vue'

import { useRoute, useRouter } from 'vue-router'
import { MessageRole } from '@shared/types'

const graphStore = useGraphStore()
const taskStore = useTaskStore()
const videoStore = useVideoStore()
const { fitView } = useVueFlow()
const route = useRoute()
const router = useRouter()

const onPaneReady = () => {
  fitView()
}

// Hydrate Graph from active real messages
watch(() => videoStore.messages, (messages) => {
  if (!videoStore.currentThreadId) return

  const newNodes: any[] = []
  const newEdges: any[] = []

  // Add the root media node
  newNodes.push({
    id: 'root-media',
    type: 'media',
    position: { x: 250, y: 50 },
    data: { filename: videoStore.currentVideoName, size: 'Original File' }
  })

  // Simple layout logic based on logical depth
  const levelOffsets: Record<number, number> = {}
  const nodeDepths: Record<string, number> = { 'root-media': 0 }

  messages.forEach(m => {
    let parentId = m.editRefId || 'root-media'
    
    // Determine logical depth based on parent
    let depth = (nodeDepths[parentId] ?? 0) + 1
    nodeDepths[m.id] = depth
    
    if (levelOffsets[depth] === undefined) levelOffsets[depth] = 0
    let xOffset = levelOffsets[depth]++
    
    let x = 250 + (xOffset * 350)
    let y = 50 + (depth * 250)

    let nodeType = 'message'
    let data: any = { sender: m.role, text: m.content }

    if (m.role === 'ai') {
        if (m.isPending) {
            nodeType = 'task'
            data = { type: 'processing', status: 'running', progress: null, steps: [{name: m.content || 'Processing...', status: 'active'}] }
        } else if ((m.files && m.files.length > 0) || (m.timeline && m.timeline.length > 0)) {
            nodeType = 'result'
            data = { type: (m.files && m.files.length > 0) ? 'video' : 'summary', content: m.content, files: m.files, timeline: m.timeline }
        } else {
             data = { sender: 'ai', text: m.content }
        }
    }

    newNodes.push({ id: m.id, type: nodeType, position: {x,y}, data })
    newEdges.push({ id: `e-${parentId}-${m.id}`, source: parentId, target: m.id, animated: m.isPending })
  })

  // Add Interactive ChatInputNode bound to the leaf of the active branch
  const lastMsg = messages[messages.length - 1]
  const inputParent = lastMsg ? lastMsg.id : 'root-media'
  const inputDepth = (nodeDepths[inputParent] ?? 0) + 1

  if (levelOffsets[inputDepth] === undefined) levelOffsets[inputDepth] = 0
  let inputXOffset = levelOffsets[inputDepth]

  newNodes.push({
    id: 'chat-input',
    type: 'input',
    position: { x: 250 + (inputXOffset * 350), y: 50 + (inputDepth * 250) },
    data: {
      onSubmit: async (val: string) => {
         const parentId = inputParent === 'root-media' ? undefined : inputParent
         const newMsgId = await videoStore.addMessage(val, MessageRole.User, parentId)
         if (newMsgId && videoStore.currentThreadId) {
             await videoStore.startProcessing(videoStore.currentThreadId, newMsgId)
         }
      }
    }
  })
  
  newEdges.push({ id: `e-${inputParent}-input`, source: inputParent, target: 'chat-input', style: { strokeDasharray: '5,5' } })

  graphStore.setNodes(newNodes)
  graphStore.setEdges(newEdges)
}, { deep: true, immediate: true })

onMounted(async () => {
  const videoId = route.params.id as string || 'default'
  
  if (videoId !== 'default') {
    await videoStore.selectThread(videoId)
  }
})
</script>

<style>
.vue-flow-custom {
  --vf-bg: transparent;
}
.vue-flow__node {
  border: none;
  background: transparent;
  padding: 0;
  border-radius: 0;
}
</style>
