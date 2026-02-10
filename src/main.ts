import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('Unhandled error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

app.use(pinia)

const authStore = useAuthStore()
authStore.init()

app.use(router)

app.mount('#app')
