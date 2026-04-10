<template>
  <div class="h-full w-full flex flex-col relative bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
    <!-- Ambient Backgrounds -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse-soft">
    </div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 dark:bg-secondary/10 rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse-soft">
    </div>
    <div
      class="px-5 py-3 z-20 w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm flex-shrink-0">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <button @click="router.push('/home')"
          class="flex items-center justify-center w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition text-zinc-600 dark:text-zinc-300 flex-shrink-0">
          <svg class="w-4 h-4 ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <h1
          class="text-xl font-bold font-heading text-zinc-900 dark:text-zinc-100 truncate tracking-tight min-w-[200px] max-w-[40%] ml-2">
          {{ videoStore.currentVideoName || 'Graph Task Manager' }}
        </h1>

        <!-- Vertical Separator -->
        <div v-if="totalCost > 0" class="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 flex-shrink-0"></div>

        <!-- Project Cost (Left Position) -->
        <div v-if="totalCost > 0"
          class="flex items-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800/40 transition-all hover:border-green-500/30 group flex-shrink-0">
          <div class="flex flex-col items-start leading-none gap-0.5">
            <span
              class="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-green-500 transition-colors leading-none">Project
              Cost</span>
            <span
              class="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 italic transition-transform group-hover:scale-105 leading-none">${{
                totalCost.toFixed(4) }}</span>
          </div>
          <div class="ml-3 p-1 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
            <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Right Action Area -->
      <div class="flex items-center justify-end gap-3 min-w-[20px] mr-12">
        <!-- Space reserved for absolute elements -->
      </div>
    </div>
    
    <div class="flex-1 w-full relative">
      <!-- Compact Floating Mode Switcher -->
      <div class="absolute left-6 top-6 z-30 flex items-center bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 shadow-lg">
        <button 
          @click="isSelectMode = false"
          title="Pan View"
          class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
          :class="!isSelectMode ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'"
        >
          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path>
          </svg>
        </button>
        <div class="w-px h-4 bg-zinc-200 dark:border-zinc-800 mx-1"></div>
        <button 
          @click="isSelectMode = true"
          title="Select Tool"
          class="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300"
          :class="isSelectMode ? 'bg-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary/20' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'"
        >
          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2.5" stroke="currentColor" fill="none" stroke-dasharray="4 2"></rect>
            <path d="M7 7h1v1H7zM16 7h1v1h-1zM7 16h1v1H7zM16 16h1v1h-1z" fill="currentColor"></path>
          </svg>
        </button>
      </div>

      <VueFlow :nodes="graphStore.nodes" :edges="graphStore.edges" class="vue-flow-custom" @pane-ready="onPaneReady"
        @node-drag-stop="onNodeDragStop" :min-zoom="0.01" :max-zoom="4"
        :pan-on-drag="!isSelectMode" 
        :selection-key-code="isSelectMode ? true : 'Shift'" 
        :pan-on-scroll="true"
        :zoom-on-scroll="true"
        :pan-on-scroll-mode="'all'"
        :selection-mode="'partial'">
        <Background pattern-color="#888" :gap="20" />
        <Controls />

        <template #node-conversation="props">
          <ConversationNode v-bind="props"
            @node-resize-stop="videoStore.updateNodeMetadata(props.id, { width: $event })" />
        </template>
        <template #node-media="props">
          <MediaNode v-bind="props" @toggle-details="videoStore.updateNodeMetadata(props.id, { showDetails: $event })" />
        </template>
        <template #node-task="props">
          <TaskProgressNode v-bind="props" />
        </template>
        <template #node-video="props">
          <VideoNode v-bind="props" @toggle-details="videoStore.updateNodeMetadata(props.id, { showDetails: $event })" />
        </template>
        <template #node-thumbnail="props">
          <ThumbnailNode v-bind="props" @toggle-details="videoStore.updateNodeMetadata(props.id, { showDetails: $event })" />
        </template>
        <template #node-summary="props">
          <SummaryNode v-bind="props" />
        </template>
        <template #node-input="props">
          <ChatInputNode v-bind="props" />
        </template>
        <template #node-image-collection="props">
          <ImageCollectionNode v-bind="props" />
        </template>
      </VueFlow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

import { useGraphStore } from '../stores/graphStore'
import { useTaskStore } from '../stores/taskStore'
import { useVideoStore } from '../stores/videoStore'

import ConversationNode from '../components/graph/ConversationNode.vue'
import MediaNode from '../components/graph/MediaNode.vue'
import TaskProgressNode from '../components/graph/TaskProgressNode.vue'
import VideoNode from '../components/graph/VideoNode.vue'
import ThumbnailNode from '../components/graph/ThumbnailNode.vue'
import SummaryNode from '../components/graph/SummaryNode.vue'
import ChatInputNode from '../components/graph/ChatInputNode.vue'
import ImageCollectionNode from '../components/graph/ImageCollectionNode.vue'

import { useRoute, useRouter } from 'vue-router'
import { MessageRole } from '@shared/types'
import { ref } from 'vue'

const isSelectMode = ref(false)

const graphStore = useGraphStore()
const taskStore = useTaskStore()
const videoStore = useVideoStore()
const { fitView } = useVueFlow()
const route = useRoute()
const router = useRouter()

const totalCost = computed(() => {
  return videoStore.messages.reduce((acc, msg) => acc + (msg.cost || 0), 0)
})

const onPaneReady = () => {
  fitView()
}

const onNodeDragStop = (event: any) => {
  const { nodes } = event
  const newPositions = nodes.reduce((acc: any, node: any) => {
    acc[node.id] = node.position
    return acc
  }, {})
  videoStore.updateNodePositions(newPositions)
}

// Hydrate Graph from active real messages
watch([() => videoStore.messages, () => videoStore.currentThread?.nodePositions], ([messages]) => {
  if (!videoStore.currentThreadId) return

  const newNodes: any[] = []
  const newEdges: any[] = []

  // 1. Pre-process mapping
  const childMap: Record<string, string[]> = { 'root-media': [] }
  const messageLookup: Record<string, any> = {}

  messages.forEach(m => {
    messageLookup[m.id] = m
    const pId = m.editRefId || 'root-media'
    if (!childMap[pId]) childMap[pId] = []
    childMap[pId].push(m.id)
  })

  // Layout Constants
  const MIN_V_GAP = 150
  const H_SPACING = 600

  const strandGroups: Array<{ id: string, messageIds: string[], parentId: string, isResult: boolean }> = []
  const processedMessageIds = new Set<string>()

  // Recursive strand building
  const buildStrands = (pId: string) => {
    const children = childMap[pId] || []

    children.forEach((cId) => {
      if (processedMessageIds.has(cId)) return

      const msg = messageLookup[cId]
      // A "Result" is anything with real files, or timeline. (Pending text stays in conversation)
      const hasRealFiles = msg.files && msg.files.filter((f: any) => f.type !== 'original').length > 0
      const isResult = !!(hasRealFiles || (msg.timeline && msg.timeline.length > 0))

      if (isResult) {
        // Results are always their own node
        strandGroups.push({ id: cId, messageIds: [cId], parentId: pId, isResult: true })
        processedMessageIds.add(cId)
        buildStrands(cId)
      } else {
        // It's a text message strand
        const strand: string[] = [cId]
        processedMessageIds.add(cId)

        let currentId = cId
        while (true) {
          const nextChildren = childMap[currentId] || []
          if (nextChildren.length !== 1) break

          const nextId = nextChildren[0]
          const nextMsg = messageLookup[nextId]
          const nextHasRealFiles = nextMsg.files && nextMsg.files.filter((f: any) => f.type !== 'original').length > 0
          const nextIsResult = !!(nextHasRealFiles || (nextMsg.timeline && nextMsg.timeline.length > 0))

          if (nextIsResult) break

          strand.push(nextId)
          processedMessageIds.add(nextId)
          currentId = nextId
        }

        strandGroups.push({ id: strand[0], messageIds: strand, parentId: pId, isResult: false })
        buildStrands(currentId)
      }
    })
  }

  buildStrands('root-media')

  // 1.5 Create Message-to-Node mapping
  const msgToNodeId: Record<string, string> = { 'root-media': 'root-media' }
  strandGroups.forEach(strand => {
    strand.messageIds.forEach(mId => {
      msgToNodeId[mId] = strand.id
    })
  })

  // 2. Position Nodes
  // Initialize from saved positions if available
  const nodePositions: Record<string, { x: number, y: number }> = {
    'root-media': videoStore.currentThread?.nodePositions?.['root-media'] || { x: 0, y: 0 }
  }

  // Root Media Node (Always branching)
  const isImageThread = videoStore.currentThread?.type === 'image'

  newNodes.push({
    id: 'root-media',
    type: isImageThread ? 'image-collection' : 'media',
    position: nodePositions['root-media'],
    data: {
      filename: videoStore.currentVideoName,
      videoPath: videoStore.currentVideoPath,
      showDetails: videoStore.currentThread?.nodePositions?.['root-media']?.showDetails || false,
      onSubmit: async (val: string, attachedImages?: string[]) => {
        const newMsgId = await videoStore.addMessage(val, MessageRole.User, undefined, attachedImages)
        if (newMsgId && videoStore.currentThreadId) {
          await videoStore.startProcessing(videoStore.currentThreadId, newMsgId)
        }
      }
    }
  })

  // Helper to estimate node height for layout calculations
  const getEstimatedHeight = (s: any) => {
    if (s.isResult) {
      const m = messageLookup[s.id]
      if (m?.isPending) return 200
      return 500 // Typical result node height
    }

    let h = 80 // Base header + padding
    s.messageIds.forEach((mId: string) => {
      const m = messageLookup[mId]
      const text = m.content || ""
      const lines = Math.max(1, Math.ceil(text.length / 45))
      h += (lines * 24) + 60
      if (m.files?.length) h += m.files.length * 160
    })
    const lastId = s.messageIds[s.messageIds.length - 1]
    const hasInput = (childMap[lastId] || []).length === 0
    if (hasInput) h += 100
    return h
  }

  const strandHeights: Record<string, number> = { 'root-media': isImageThread ? 300 : 350 }

  // Layout strands
  strandGroups.forEach((strand) => {
    const parentNodeId = msgToNodeId[strand.parentId] || strand.parentId
    const parentPos = nodePositions[parentNodeId] || { x: 0, y: 0 }
    const parentHeight = strandHeights[parentNodeId] || 400

    // IF we have a saved position, USE IT. Otherwise calculate.
    if (videoStore.currentThread?.nodePositions?.[strand.id]) {
      nodePositions[strand.id] = videoStore.currentThread.nodePositions[strand.id]
    } else {
      const siblings = strandGroups.filter(s => s.parentId === strand.parentId)
      const index = siblings.indexOf(strand)

      let x = parentPos.x
      let y = parentPos.y

      if (strand.parentId === 'root-media') {
        // Media -> Horizontally offset branches
        x = parentPos.x + H_SPACING
        y = parentPos.y + (index * 600) // Keep horizontal branches separated vertically
      } else {
        // Sequential children vertical, branches horizontal
        if (index === 0) {
          y = parentPos.y + parentHeight + MIN_V_GAP
        } else {
          x = parentPos.x + (H_SPACING * index)
        }
      }
      nodePositions[strand.id] = { x, y }
    }

    // Store height for children positioning
    strandHeights[strand.id] = getEstimatedHeight(strand)

    if (strand.isResult) {
      const msg = messageLookup[strand.id]
      let nodeType = 'message'
      let data: any = { sender: msg.role, text: msg.content }

      if (msg.isPending) {
        nodeType = 'task'
        data = {
          type: 'processing',
          status: 'running',
          progress: null,
          steps: [{ name: msg.content || 'Processing...', status: 'active' }],
          onDelete: async () => {
            const confirmed = await (window as any).api.showConfirmation({
              title: 'Delete Task Node',
              message: 'Are you sure you want to delete this running task and all its branches?',
              type: 'warning'
            })
            if (confirmed === 1) {
              await videoStore.removeMessageBranch(strand.id)
            }
          },
          onStop: async () => {
            await videoStore.abortProcessing(strand.id)
          }
        }
      } else {
        const type = msg.resultType || ((msg.files && msg.files.length > 0) ? 'video' : 'summary')
        // Normalize nodeType to specialized components
        if (type === 'video') nodeType = 'video'
        else if (type === 'thumbnail' || type === 'generate-thumbnail' || type === 'image' || type === 'result-image') nodeType = 'thumbnail'
        else if (type === 'summary' || type === 'cover') nodeType = 'summary'
        else nodeType = 'summary' // Default fallback

        data = {
          id: msg.id,
          type,
          content: msg.content,
          files: msg.files,
          timeline: msg.timeline,
          version: msg.version,
          cost: msg.cost,
          showDetails: videoStore.currentThread?.nodePositions?.[strand.id]?.showDetails || false,
          onDelete: async () => {
            const confirmed = await (window as any).api.showConfirmation({
              title: 'Delete Node',
              message: 'Are you sure you want to delete this result and all its branches?',
              type: 'warning'
            })
            if (confirmed === 1) {
              await videoStore.removeMessageBranch(strand.id)
            }
          },
          onSubmit: async (val: string, attachedImages?: string[]) => {
            const newMsgId = await videoStore.addMessage(val, MessageRole.User, strand.id, attachedImages)
            if (newMsgId && videoStore.currentThreadId) {
              await videoStore.startProcessing(videoStore.currentThreadId, newMsgId)
            }
          }
        }
      }
      newNodes.push({ id: strand.id, type: nodeType, position: nodePositions[strand.id], data })
    } else {
      // Conversation
      const lastId = strand.messageIds[strand.messageIds.length - 1]
      newNodes.push({
        id: strand.id,
        type: 'conversation',
        position: nodePositions[strand.id],
        data: {
          messages: strand.messageIds.map(id => messageLookup[id]),
          hasInputInitially: (childMap[lastId] || []).length === 0,
          width: videoStore.currentThread?.nodePositions?.[strand.id]?.width || 380,
          onDelete: async () => {
            const confirmed = await (window as any).api.showConfirmation({
              title: 'Delete Node',
              message: 'Are you sure you want to delete this conversation and all its branches?',
              type: 'warning'
            })
            if (confirmed === 1) {
              await videoStore.removeMessageBranch(strand.id)
            }
          },
          onSubmit: async (val: string, attachedImages?: string[]) => {
            const newMsgId = await videoStore.addMessage(val, MessageRole.User, lastId, attachedImages)
            if (newMsgId && videoStore.currentThreadId) {
              await videoStore.startProcessing(videoStore.currentThreadId, newMsgId)
            }
          }
        }
      })
    }

    newEdges.push({
      id: `e-${parentNodeId}-${strand.id}`,
      source: parentNodeId,
      target: strand.id,
      animated: strand.isResult && messageLookup[strand.id].isPending
    })
  })

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
