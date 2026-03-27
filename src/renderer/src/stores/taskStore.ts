import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface TaskStep {
  name: string
  status: 'pending' | 'active' | 'done'
}

export interface TaskJob {
  id: string
  type: 'summarization' | 'cover_generation' | 'timeline' | string
  status: TaskStatus
  progress: number // 0 to 100
  steps: TaskStep[]
  result?: any
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Record<string, TaskJob>>({})

  const addTask = (task: TaskJob) => {
    tasks.value[task.id] = task
  }

  const updateTask = (id: string, updates: Partial<TaskJob>) => {
    if (tasks.value[id]) {
      tasks.value[id] = { ...tasks.value[id], ...updates }
    }
  }

  return { tasks, addTask, updateTask }
})
