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
        @node-drag-stop="onNodeDragStop"
      >
        <Background pattern-color="#888" :gap="20" />
        <Controls />
        
        <template #node-conversation="props">
          <ConversationNode v-bind="props" />
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

import ConversationNode from '../components/graph/ConversationNode.vue'
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

const onNodeDragStop = (event: any) => {
  const { node } = event
  const newPositions = {
    [node.id]: node.position
  }
  videoStore.updateNodePositions(newPositions)
}

// Hydrate Graph from active real messages
watch(() => videoStore.messages, (messages) => {
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

  // Folding Constants
  const V_SPACING = 600
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
  const nodePositions: Record<string, {x: number, y: number}> = { 
    'root-media': videoStore.currentThread?.nodePositions?.['root-media'] || { x: 0, y: 0 } 
  }
  
  // Root Media Node (Always branching)
  newNodes.push({
    id: 'root-media',
    type: 'media',
    position: nodePositions['root-media'],
    data: { 
      filename: videoStore.currentVideoName, 
      videoPath: videoStore.currentVideoPath,
      onSubmit: async (val: string) => {
         const newMsgId = await videoStore.addMessage(val, MessageRole.User, undefined)
         if (newMsgId && videoStore.currentThreadId) {
           await videoStore.startProcessing(videoStore.currentThreadId, newMsgId)
         }
      }
    }
  })

  // Layout strands
  strandGroups.forEach((strand) => {
    const parentNodeId = msgToNodeId[strand.parentId] || strand.parentId
    const parentPos = nodePositions[parentNodeId] || { x: 0, y: 0 }
    
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
         y = parentPos.y + (V_SPACING * index)
      } else {
         // Sequential children vertical, branches horizontal
         if (index === 0) {
           y = parentPos.y + V_SPACING
         } else {
           x = parentPos.x + (H_SPACING * index)
         }
      }
      nodePositions[strand.id] = { x, y }
    }

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
          steps: [{name: msg.content || 'Processing...', status: 'active'}], 
          onDelete: async () => {
             const confirmed = await (window as any).api.showConfirmation({
               title: 'Delete Task Node',
               message: 'Are you sure you want to delete this running task and all its branches?',
               type: 'warning'
             })
             if (confirmed === 1) {
               await videoStore.removeMessageBranch(strand.id)
             }
          }
        }
      } else {
        nodeType = 'result'
        data = { 
          type: msg.resultType || ((msg.files && msg.files.length > 0) ? 'video' : 'summary'), 
          content: msg.content, 
          files: msg.files, 
          timeline: msg.timeline,
          version: msg.version,
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
          onSubmit: async (val: string) => {
            const newMsgId = await videoStore.addMessage(val, MessageRole.User, strand.id)
            if (newMsgId && videoStore.currentThreadId) {
               await videoStore.startProcessing(videoStore.currentThreadId, newMsgId)
            }
          }
        }
      }
      newNodes.push({ id: strand.id, type: nodeType, position: nodePositions[strand.id], data })
    } else {
      // Conversation
      const lastId = strand.messageIds[strand.messageIds.length-1]
      newNodes.push({
        id: strand.id,
        type: 'conversation',
        position: nodePositions[strand.id],
        data: {
          messages: strand.messageIds.map(id => messageLookup[id]),
          hasInputInitially: (childMap[lastId] || []).length === 0,
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
          onSubmit: async (val: string) => {
            const newMsgId = await videoStore.addMessage(val, MessageRole.User, lastId)
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
