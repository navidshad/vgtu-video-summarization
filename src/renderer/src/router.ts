import { createRouter, createWebHashHistory } from 'vue-router'
import ApiKeyPage from './pages/ApiKeyPage.vue'
import UploadPage from './pages/UploadPage.vue'
import ChatPage from './pages/ChatPage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import HomePage from './pages/HomePage.vue'

const routes = [
	{
		path: '/',
		redirect: () => {
			const key = localStorage.getItem('gemini_api_key')
			return key ? '/home' : '/api-key'
		}
	},
	{
		path: '/home',
		component: HomePage
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
		path: '/chat/:id',
		component: ChatPage
	},
	{
		path: '/settings',
		component: SettingsPage
	}
]

const router = createRouter({
	history: createWebHashHistory(),
	routes
})

export default router
