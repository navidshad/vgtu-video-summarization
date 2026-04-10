<template>
  <div class="h-full w-full flex flex-col relative bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
    <!-- Ambient Backgrounds -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse-soft">
    </div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 dark:bg-secondary/10 rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse-soft">
    </div>

    <GraphHeader 
      :title="videoStore.currentVideoName" 
      :total-cost="totalCost"
      @back="router.push('/home')"
    />
    
    <div class="flex-1 w-full relative">
      <GraphToolbar v-model="isSelectMode" />

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
import { onMounted, computed, ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

import { useGraphStore } from '../stores/graphStore'
import { useTaskStore } from '../stores/taskStore'
import { useVideoStore } from '../stores/videoStore'
import { useRoute, useRouter } from 'vue-router'

import ConversationNode from '../components/graph/ConversationNode.vue'
import MediaNode from '../components/graph/MediaNode.vue'
import TaskProgressNode from '../components/graph/TaskProgressNode.vue'
import VideoNode from '../components/graph/VideoNode.vue'
import ThumbnailNode from '../components/graph/ThumbnailNode.vue'
import SummaryNode from '../components/graph/SummaryNode.vue'
import ChatInputNode from '../components/graph/ChatInputNode.vue'
import ImageCollectionNode from '../components/graph/ImageCollectionNode.vue'

import { useGraphLayout } from '../composables/useGraphLayout'
import GraphHeader from '../components/graph/GraphHeader.vue'
import GraphToolbar from '../components/graph/GraphToolbar.vue'

const isSelectMode = ref(false)

const graphStore = useGraphStore()
const taskStore = useTaskStore()
const videoStore = useVideoStore()
const { fitView } = useVueFlow()
const route = useRoute()
const router = useRouter()

// Use modular layout logic
useGraphLayout(videoStore, graphStore)

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
