<template>
  <div class="h-full group cursor-pointer" @click="$emit('open', thread.id)">
    <Card
      class="h-full !rounded-[2.5rem] !bg-white dark:!bg-zinc-900 border !border-zinc-100 dark:!border-zinc-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-none dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
    >
      <!-- Decorative Gradient Blob -->
      <div
        class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"
      ></div>

      <div class="p-6 flex flex-col h-full relative z-10">
        <div class="flex items-start justify-between mb-6">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-full h-full"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>

          <div
            class="text-[10px] font-bold uppercase tracking-widest text-zinc-400/80 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-lg"
          >
            {{ formatDate(thread.updatedAt) }}
          </div>
        </div>

        <h3
          class="font-heading font-bold text-xl text-zinc-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight"
        >
          {{ thread.title }}
        </h3>

        <p
          class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 flex-grow leading-relaxed"
        >
          {{ getLastMessage(thread) }}
        </p>

        <div
          class="mt-6 pt-5 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center flex-wrap gap-2 text-[10px] text-zinc-500 dark:text-zinc-400"
        >
          <div
            class="flex items-center bg-zinc-50 dark:bg-zinc-800/30 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/50 transition-colors group-hover:border-zinc-200 dark:group-hover:border-zinc-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5 mr-1.5 opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              />
            </svg>
            <span class="font-bold">{{ thread.messages.length }}</span>
          </div>

          <div
            v-if="thread.versionCounter"
            class="flex items-center bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1.5 rounded-lg border border-blue-100/50 dark:border-blue-500/20"
          >
            <span class="font-bold uppercase tracking-wider text-[9px]"
              >v.{{ thread.versionCounter }}</span
            >
          </div>

		  <div
            class="flex items-center bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 px-2.5 py-1.5 rounded-lg border border-blue-100/50 dark:border-blue-500/20"
          >
            <span class="font-bold uppercase tracking-wider text-[9px]"
              >${{ getThreadTotals(thread).cost.toFixed(4) }}</span
            >
          </div>
          <div class="flex-grow"></div>

          <button
            @click.stop="$emit('delete', thread.id)"
            class="p-2.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300"
            title="Delete Thread"
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card } from '@codebridger/lib-vue-components/elements'

defineProps<{
  thread: any
}>()

defineEmits(['open', 'delete'])

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getLastMessage = (thread: any) => {
  if (thread.messages.length === 0) return 'No messages yet'
  const lastMsg = thread.messages[thread.messages.length - 1]
  return lastMsg.content
}

const getThreadTotals = (thread: any) => {
  return thread.messages.reduce(
    (acc: { tokens: number; cost: number }, msg: any) => {
      acc.tokens += msg.usage?.totalTokens || 0
      acc.cost += msg.cost || 0
      return acc
    },
    { tokens: 0, cost: 0 }
  )
}
</script>
