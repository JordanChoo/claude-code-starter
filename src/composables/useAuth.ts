import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    login: authStore.login,
    register: authStore.register,
    loginWithGoogle: authStore.loginWithGoogle,
    logout: authStore.logout
  }
}
