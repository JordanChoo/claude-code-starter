import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('ErrorBoundary', () => {
  it('renders slot content when no error occurs', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<p>Hello World</p>'
      }
    })

    expect(wrapper.text()).toContain('Hello World')
    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('displays error UI when error state is set', async () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<p>Content</p>'
      }
    })

    const vm = wrapper.vm as any
    vm.error = new Error('Something broke')
    await nextTick()

    const html = wrapper.html()
    expect(html).toContain('Something went wrong')
    expect(html).toContain('An unexpected error occurred')
    expect(html).toContain('Try Again')
    expect(html).toContain('Error: Something broke')
  })

  it('hides slot content when error is present', async () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<p>Slot Content</p>'
      }
    })

    expect(wrapper.html()).toContain('Slot Content')

    const vm = wrapper.vm as any
    vm.error = new Error('oops')
    await nextTick()

    expect(wrapper.html()).not.toContain('Slot Content')
    expect(wrapper.html()).toContain('Something went wrong')
  })

  it('re-renders slot content after reset', async () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<p>Original Content</p>'
      }
    })

    const vm = wrapper.vm as any

    // Set error
    vm.error = new Error('test error')
    await nextTick()
    expect(wrapper.html()).toContain('Something went wrong')

    // Reset via exposed method
    vm.reset()
    await nextTick()

    expect(vm.error).toBeNull()
    expect(wrapper.html()).toContain('Original Content')
    expect(wrapper.html()).not.toContain('Something went wrong')
  })

  it('increments renderKey on reset to force slot re-mount', async () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<p>Content</p>'
      }
    })

    const vm = wrapper.vm as any
    const initialKey = vm.renderKey

    vm.error = new Error('test')
    await nextTick()

    vm.reset()
    await nextTick()

    expect(vm.renderKey).toBe(initialKey + 1)
  })
})
