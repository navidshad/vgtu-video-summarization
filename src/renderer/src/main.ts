import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import router from './router'
import LibVueComponents from 'pilotui'
import 'pilotui/style.css'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(LibVueComponents, {
	dontInstallPinia: false
})
app.mount('#app')
