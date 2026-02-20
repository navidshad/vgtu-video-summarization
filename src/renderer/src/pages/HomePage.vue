<template>
	<div class="h-screen flex flex-col bg-transparent transition-colors duration-300 overflow-hidden relative">
		<div class="container mx-auto px-6 py-12 max-w-7xl flex flex-col h-full z-10 relative">
			<!-- Header -->
			<PageHeader title="Your Videos" subtitle="Manage your video summaries and chats." />

			<div class="flex-1 overflow-y-auto -mx-6 px-6 pb-8 custom-scrollbar">
				<!-- Thread List -->
				<div v-if="loading" class="flex justify-center py-20">
					<div class="animate-spin rounded-lg h-10 w-10 border-4 border-primary border-t-transparent"></div>
				</div>

				<EmptyState v-else-if="videoStore.threads.length === 0" @create="router.push('/upload')" />

				<div v-else class="grid gap-10 md:grid-cols-2 lg:grid-cols-3 pb-20">
					<!-- New Edit Card -->
					<NewThreadCard @click="router.push('/upload')" class="animate-fade-in-up" style="animation-delay: 0.1s" />

					<ThreadCard v-for="(thread, index) in videoStore.threads" :key="thread.id" :thread="thread"
						@open="openThread" @delete="handleDeleteThread" class="animate-fade-in-up"
						:style="{ animationDelay: `${(index + 2) * 0.1}s` }" />
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
import PageHeader from '../components/PageHeader.vue'

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
