<template>
	<div class="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
		<!-- Video Preview -->
		<div
			class="aspect-video bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden group/video">
			<video :src="getMediaUrl(file.url)" controls class="w-full h-full object-contain"
				preload="metadata"></video>
		</div>

		<!-- Footer info for AI files -->
		<div v-if="role === MessageRole.AI"
			class="p-3 flex items-center justify-between bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
			<div>
				<h3 class="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest leading-none">
					{{ file.type === FileType.Preview ? 'Preview Summary' : 'Final Summary' }}
				</h3>
				<p class="text-[9px] text-zinc-500 font-medium mt-1 leading-none">
					{{ file.type === FileType.Preview ? 'Generating...' : 'Ready' }}
				</p>
			</div>
			<div class="flex gap-2 items-center">
				<Button 
					label="Save"
					@click="$emit('save', file.url)"
				/>
				<Button
					label="Edit"
					v-if="!isPending" 
					@click="$emit('edit')"
				/>
			</div>
		</div>

		<!-- No footer for User files as it moved to ChatMessage metadata -->
	</div>
</template>

<script setup lang="ts">
import { Button, IconButton } from '@codebridger/lib-vue-components/elements'
import { MessageRole, FileType, Attachment } from '@shared/types'

defineProps<{
	file: Attachment
	role: MessageRole
	isPending?: boolean
}>()

defineEmits(['save', 'edit'])

const getMediaUrl = (path: string) => {
	if (!path) return ''
	return `media://${path}`
}
</script>
