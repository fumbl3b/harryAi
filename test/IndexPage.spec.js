import { shallowMount, createLocalVue } from '@vue/test-utils'
import IndexPage from '@/pages/index.vue'

// Create a simple stub for ChatLayout component
const ChatLayoutStub = {
  name: 'ChatLayout',
  template: '<div class="chat-layout-stub"></div>'
}

describe('IndexPage', () => {
  test('is a Vue instance', () => {
    // Create a local Vue instance
    const localVue = createLocalVue()
    
    // Mount with stubbed components
    const wrapper = shallowMount(IndexPage, {
      localVue,
      stubs: {
        'ChatLayout': ChatLayoutStub
      }
    })
    
    expect(wrapper.vm).toBeTruthy()
    expect(wrapper.html()).toContain('chat-layout-stub')
  })
})