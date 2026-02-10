import { createRouter, createWebHashHistory } from 'vue-router'
import ApiKeyPage from './pages/ApiKeyPage.vue'
import UploadPage from './pages/UploadPage.vue'
import ChatPage from './pages/ChatPage.vue'

const routes = [
	{
		path: '/',
		redirect: () => {
			const key = localStorage.getItem('gemini_api_key')
			return key ? '/upload' : '/api-key'
		}
	},
	{
		path: '/api-key',
		component: ApiKeyPage
	},
	{
		path: '/upload',
		component: UploadPage
	},
	{
		path: '/chat',
		component: ChatPage
	}
]

const router = createRouter({
	history: createWebHashHistory(),
	routes
})

export default router
