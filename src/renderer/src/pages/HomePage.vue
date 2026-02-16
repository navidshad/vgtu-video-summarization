<template>
	<div class="h-screen flex flex-col bg-transparent transition-colors duration-300 overflow-hidden relative">
		<div class="container mx-auto px-6 py-12 max-w-5xl flex flex-col h-full z-10 relative">
			<!-- Header -->
			<div class="flex items-center justify-between mb-12 animate-fade-in-up">
				<div>
					<h1 class="text-4xl font-heading font-black text-zinc-900 dark:text-white tracking-tight leading-tight mb-2">Your
						Videos</h1>
					<p class="text-lg text-zinc-500 dark:text-zinc-400 font-medium">Manage your video summaries and chats.</p>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto -mx-6 px-6 pb-8 custom-scrollbar">
				<!-- Thread List -->
				<div v-if="loading" class="flex justify-center py-20">
					<div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
				</div>

				<EmptyState v-else-if="videoStore.threads.length === 0" @create="router.push('/upload')" />

				<div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-20">
					<!-- New Edit Card -->
					<NewThreadCard @click="router.push('/upload')" class="animate-fade-in-up" style="animation-delay: 0.1s" />

					<ThreadCard v-for="(thread, index) in videoStore.threads" :key="thread.id" :thread="thread"
						@open="openThread" @delete="handleDeleteThread" class="animate-fade-in-up" :style="{ animationDelay: `${(index + 2) * 0.1}s` }" />
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
