import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

// Mock firebase modules so the store doesn't try to initialize Firebase
vi.mock('@/firebase/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
  onAuthChange: vi.fn()
}))

vi.mock('@/firebase/firestore', () => ({
  getDocument: vi.fn(),
  setDocument: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}))

const Stub = { template: '<div />' }

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/login', name: 'login', component: Stub },
      { path: '/dashboard', name: 'dashboard', component: Stub }
    ]
  })
}

describe('LoginView', () => {
  let router: ReturnType<typeof createTestRouter>

  beforeEach(async () => {
    router = createTestRouter()
    router.push('/login')
    await router.isReady()
  })

  function renderLoginView(options: { storeState?: Record<string, any> } = {}) {
    return render(LoginView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: null,
                loading: false,
                error: null,
                ...options.storeState
              }
            }
          }),
          router
        ]
      }
    })
  }

  describe('rendering', () => {
    it('renders the sign-in heading by default', () => {
      renderLoginView()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })

    it('renders email and password inputs', () => {
      renderLoginView()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('renders the sign-in button', () => {
      renderLoginView()
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('renders the Google sign-in button', () => {
      renderLoginView()
      expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument()
    })

    it('renders the toggle to sign up', () => {
      renderLoginView()
      expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument()
    })
  })

  describe('login/register toggle', () => {
    it('switches to register mode when toggle is clicked', async () => {
      renderLoginView()

      await fireEvent.click(screen.getByText("Don't have an account? Sign up"))

      expect(screen.getByText('Create a new account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
      expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument()
    })

    it('switches back to login mode when toggled twice', async () => {
      renderLoginView()

      await fireEvent.click(screen.getByText("Don't have an account? Sign up"))
      await fireEvent.click(screen.getByText('Already have an account? Sign in'))

      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls login on form submit in login mode', async () => {
      renderLoginView()
      const store = useAuthStore()

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')

      await fireEvent.update(emailInput, 'test@example.com')
      await fireEvent.update(passwordInput, 'password123')

      const form = emailInput.closest('form')!
      await fireEvent.submit(form)

      expect(store.login).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('calls register on form submit in register mode', async () => {
      renderLoginView()
      const store = useAuthStore()

      await fireEvent.click(screen.getByText("Don't have an account? Sign up"))

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')

      await fireEvent.update(emailInput, 'new@example.com')
      await fireEvent.update(passwordInput, 'newpass123')

      const form = emailInput.closest('form')!
      await fireEvent.submit(form)

      expect(store.register).toHaveBeenCalledWith('new@example.com', 'newpass123')
    })
  })

  describe('error display', () => {
    it('shows error message when store has error', () => {
      renderLoginView({
        storeState: { error: 'Invalid credentials' }
      })

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('does not show error when store error is null', () => {
      renderLoginView()

      const errorElements = document.querySelectorAll('.bg-red-50')
      expect(errorElements.length).toBe(0)
    })
  })

  describe('submission state', () => {
    it('shows "Please wait..." during submission', async () => {
      renderLoginView()
      const store = useAuthStore()

      // Make login hang (never resolve)
      vi.mocked(store.login).mockReturnValue(new Promise(() => {}))

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')

      await fireEvent.update(emailInput, 'test@example.com')
      await fireEvent.update(passwordInput, 'password123')

      const form = emailInput.closest('form')!
      await fireEvent.submit(form)

      expect(screen.getByText('Please wait...')).toBeInTheDocument()
    })
  })
})
