import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import router from './router'
// import LibVueComponents from '@codebridger/lib-vue-components'

const app = createApp(App)
app.use(router)
// app.use(LibVueComponents, {})
app.mount('#app')
