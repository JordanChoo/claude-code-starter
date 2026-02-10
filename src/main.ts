import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useAuthStore } from './stores/auth'
import { reportError } from './utils/errorReporting'
import './assets/main.css'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  reportError(err instanceof Error ? err : new Error(String(err)), {
    component: instance?.$options?.name || 'unknown',
    info: info || 'unknown',
    type: 'vue-error-handler'
  })
}

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  reportError(
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    { type: 'unhandled-rejection' }
  )
})

app.use(pinia)

const authStore = useAuthStore()
authStore.init()

app.use(router)

app.mount('#app')
