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
import { onMounted } from 'vue'
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

const graphStore = useGraphStore()
const taskStore = useTaskStore()
const videoStore = useVideoStore()
const { fitView } = useVueFlow()
const route = useRoute()
const router = useRouter()

const onPaneReady = () => {
  fitView()
}

// Reset and inject mock data for the selected thread
onMounted(async () => {
  const videoId = route.params.id as string || 'default'
  
  if (videoId !== 'default') {
    await videoStore.selectThread(videoId)
  }

  graphStore.setNodes([
      {
        id: 'node-1',
        type: 'media',
        position: { x: 250, y: 50 },
        data: { filename: `Video ${videoId}.mp4`, size: '25 MB' }
      },
      {
        id: 'node-2',
        type: 'message',
        position: { x: 250, y: 200 },
        data: { sender: 'user', text: 'Can you summarize this video and also generate a cover?' }
      },
      {
        id: 'node-3',
        type: 'task',
        position: { x: 50, y: 350 },
        data: { 
          type: 'summarization', 
          status: 'running', 
          progress: 45,
          steps: [
            { name: 'Extracting audio...', status: 'done' },
            { name: 'Transcribing...', status: 'active' },
            { name: 'Summarizing text', status: 'pending' }
          ]
        }
      },
      {
        id: 'node-4',
        type: 'task',
        position: { x: 450, y: 350 },
        data: { 
          type: 'cover_generation', 
          status: 'pending', 
          progress: 0,
          steps: [
            { name: 'Analyzing frames', status: 'pending' },
            { name: 'Generating images', status: 'pending' }
          ]
        }
      },
      {
        id: 'node-5',
        type: 'input',
        position: { x: 250, y: 600 },
        data: { 
          onSubmit: (val: string) => {
            const yOffset = graphStore.nodes.length * 150
            const msgNodeId = `msg-${Date.now()}`
            
            // 1. Create User Message Node
            graphStore.addNode({
              id: msgNodeId,
              type: 'message',
              position: { x: 250, y: yOffset },
              data: { sender: 'user', text: val }
            })
            // Connect to previous Input node (we'll just connect to the video node for simplicity in this mock)
            graphStore.addEdge({
              id: `edge-${Date.now()}`,
              source: 'node-1',
              target: msgNodeId
            })

            // 2. Create Background Task Node
            const taskId = `task-${Date.now()}`
            const taskNodeId = `tnode-${Date.now()}`
            
            // Add task to store
            taskStore.addTask({
              id: taskId,
              type: val.includes('cover') ? 'cover_generation' : 'summarization',
              status: 'running',
              progress: 0,
              steps: [
                { name: 'Initializing pipeline...', status: 'active' }
              ]
            })

            // We need a reactionary wrapper for Vue Flow data
            // Since store state is reactive, we can just pass the task object reference
            const taskRef = taskStore.tasks[taskId]
            
            graphStore.addNode({
              id: taskNodeId,
              type: 'task',
              position: { x: val.includes('cover') ? 650 : 50, y: yOffset },
              data: taskRef
            })

            graphStore.addEdge({
              id: `edge-t-${Date.now()}`,
              source: msgNodeId,
              target: taskNodeId,
              animated: true
            })

            // Mock Progress Update
            setTimeout(() => {
              taskStore.updateTask(taskId, {
                progress: 50,
                steps: [
                  { name: 'Initializing pipeline...', status: 'done' },
                  { name: 'Processing data...', status: 'active' }
                ]
              })
            }, 2000)

            setTimeout(() => {
              taskStore.updateTask(taskId, {
                status: 'completed',
                progress: 100,
                steps: [
                  { name: 'Initializing pipeline...', status: 'done' },
                  { name: 'Processing data...', status: 'done' },
                  { name: 'Finalizing...', status: 'done' }
                ]
              })
              
              // Spawns a result node
              const resNodeId = `res-${Date.now()}`
              graphStore.addNode({
                id: resNodeId,
                type: 'result',
                position: { x: val.includes('cover') ? 650 : 50, y: yOffset + 200 },
                data: {
                  type: taskRef.type === 'cover_generation' ? 'cover' : 'summary',
                  content: 'This is the completed ' + taskRef.type
                }
              })
              graphStore.addEdge({
                id: `edge-r-${Date.now()}`,
                source: taskNodeId,
                target: resNodeId
              })
            }, 4000)

            // Move the chat input down
            const inputNode = graphStore.nodes.find(n => n.type === 'input')
            if (inputNode) {
              inputNode.position.y = yOffset + 200
              inputNode.position.x = 250
            }
          }
        }
      }
    ])

    graphStore.setEdges([
      { id: 'e1-2', source: 'node-1', target: 'node-2' },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true },
      { id: 'e3-5', source: 'node-3', target: 'node-5' },
      { id: 'e4-5', source: 'node-4', target: 'node-5' }
  ])
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
