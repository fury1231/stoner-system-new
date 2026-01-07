import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import './styles/main.css'
import './style.css'

const app = createApp(App)
app.use(pinia)  // 🔄 Pinia 狀態管理
app.use(router)
app.mount('#app')
