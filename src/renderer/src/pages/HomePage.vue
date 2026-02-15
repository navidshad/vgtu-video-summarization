<template>
	<div class="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
		<div class="container mx-auto px-6 py-12 max-w-5xl flex flex-col h-full">
			<!-- Header -->
			<div class="flex items-center justify-between mb-8">
				<div>
					<h1 class="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Your
						Videos</h1>
					<p class="text-zinc-500 dark:text-zinc-400 font-medium">Manage your video summaries and chats.</p>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto -mx-4 px-4 pb-8">
				<!-- Thread List -->
				<div v-if="loading" class="flex justify-center py-20">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>

				<div v-else-if="videoStore.threads.length === 0"
					class="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
					<div
						class="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-zinc-400" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
							stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
					</div>
					<h3 class="text-xl font-bold text-zinc-900 dark:text-white mb-2">No videos yet</h3>
					<p class="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
						Start by creating a new edit to summarize and chat with a video.
					</p>
					<Button @click="router.push('/upload')" variant="secondary" size="lg">
						Create Your First Edit
					</Button>
				</div>

				<div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
					<!-- New Edit Card -->
					<div @click="router.push('/upload')"
						class="group cursor-pointer min-h-[220px] rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-300 flex flex-col items-center justify-center text-center p-6">
						<div
							class="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-blue-500">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="12" y1="5" x2="12" y2="19"></line>
								<line x1="5" y1="12" x2="19" y2="12"></line>
							</svg>
						</div>
						<h3
							class="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
							Create New Edit</h3>
						<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Start a new video analysis</p>
					</div>

					<div v-for="thread in videoStore.threads" :key="thread.id"
						class="group cursor-pointer hover:-translate-y-1 transition-all duration-300"
						@click="openThread(thread.id)">
						<Card
							class="h-full border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
							<div class="p-5 flex flex-col h-full">
								<div class="flex items-start justify-between mb-4">
									<div
										class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
											stroke-linejoin="round">
											<polygon points="23 7 16 12 23 17 23 7" />
											<rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
										</svg>
									</div>
									<div class="flex items-center space-x-2">
										<button @click.stop="handleDeleteThread(thread.id)"
											class="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
											title="Delete Thread">
											<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
												fill="none" stroke="currentColor" stroke-width="2"
												stroke-linecap="round" stroke-linejoin="round">
												<path d="M3 6h18" />
												<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
												<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
											</svg>
										</button>
										<div class="text-xs font-bold uppercase tracking-wider text-zinc-400">
											{{ formatDate(thread.updatedAt) }}
										</div>
									</div>
								</div>

								<h3
									class="font-bold text-lg text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
									{{ thread.title }}
								</h3>

								<p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 flex-grow">
									{{ getLastMessage(thread) }}
								</p>

								<div
									class="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-y-3 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
									<div class="flex items-center bg-zinc-50 dark:bg-zinc-900/50 px-2 py-1 rounded-md">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 mr-1.5 opacity-70"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
											stroke-linecap="round" stroke-linejoin="round">
											<path
												d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
										</svg>
										<span class="font-medium font-mono">{{ thread.messages.length }}</span>
									</div>

									<div class="flex items-center flex-wrap gap-x-3 gap-y-2">
										<div class="flex items-center bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-100/50 dark:border-blue-900/30"
											v-if="thread.versionCounter">
											<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1.5"
												viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
												stroke-linecap="round" stroke-linejoin="round">
												<path
													d="M20.2 6 3 11l-.9-2.4c-.5-1.1.2-2.4 1.3-2.9l13.2-4.8c1.1-.5 2.4.2 2.9 1.3l.7 1.8z" />
												<path d="m6.2 5.3 3.1 3.9" />
												<path d="m12.4 3.4 3.1 4" />
												<path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
											</svg>
											<span class="font-bold uppercase tracking-wider text-[8px]">v.{{
												thread.versionCounter }}</span>
										</div>
										<div class="flex items-center group/tokens">
											<svg xmlns="http://www.w3.org/2000/svg"
												class="w-3 h-3 mr-1 opacity-60 group-hover/tokens:opacity-100 transition-opacity"
												viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
												stroke-linecap="round" stroke-linejoin="round">
												<path
													d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
												<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
												<line x1="12" y1="22.08" x2="12" y2="12" />
											</svg>
											<span class="font-mono">{{
												getThreadTotals(thread).tokens.toLocaleString() }}</span>
										</div>
										<div
											class="flex items-center font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
											${{ getThreadTotals(thread).cost.toFixed(4) }}
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '../stores/videoStore'
import { Button, Card } from '@codebridger/lib-vue-components/elements'

const router = useRouter()
const videoStore = useVideoStore()
const loading = ref(true)

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

const openThread = (id: string) => {
	router.push(`/chat/${id}`)
}

const handleDeleteThread = async (id: string) => {
	if (confirm('Are you sure you want to delete this video summary and all its messages?')) {
		await videoStore.deleteThread(id)
	}
}

onMounted(async () => {
	try {
		await videoStore.fetchThreads()
	} finally {
		loading.value = false
	}
})
</script>
