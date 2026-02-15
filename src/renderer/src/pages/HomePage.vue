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

				<EmptyState v-else-if="videoStore.threads.length === 0" @create="router.push('/upload')" />

				<div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
					<!-- New Edit Card -->
					<NewThreadCard @click="router.push('/upload')" />

					<ThreadCard v-for="thread in videoStore.threads" :key="thread.id" :thread="thread"
						@open="openThread" @delete="handleDeleteThread" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '../stores/videoStore'
import EmptyState from '../components/home/EmptyState.vue'
import NewThreadCard from '../components/home/NewThreadCard.vue'
import ThreadCard from '../components/home/ThreadCard.vue'

const router = useRouter()
const videoStore = useVideoStore()
const loading = ref(true)

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
