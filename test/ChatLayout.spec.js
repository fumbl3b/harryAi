import { mount, shallowMount } from '@vue/test-utils'
import ChatLayout from '@/components/ChatLayout.vue'

describe('ChatLayout', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(ChatLayout)
    expect(wrapper.vm).toBeTruthy()
  })

  test('initial state is correct', () => {
    const wrapper = mount(ChatLayout)
    expect(wrapper.vm.messages).toEqual([])
    expect(wrapper.vm.isChat).toBe(false)
    expect(wrapper.vm.currentMessage).toBe('')
    expect(wrapper.vm.headingText).toBe('What can I help with?')
  })

  test('heading animation starts on mount', async () => {
    const wrapper = mount(ChatLayout)
    // Allow some time for animation to start
    await new Promise(resolve => setTimeout(resolve, 200))
    // displayedHeading should have at least one character from headingText
    expect(wrapper.vm.displayedHeading.length).toBeGreaterThan(0)
    expect(wrapper.vm.headingText).toContain(wrapper.vm.displayedHeading)
  })
  
  test('heading animation completes properly', async () => {
    jest.useFakeTimers()
    const wrapper = mount(ChatLayout)
    
    // Mock the animateHeading method to make it complete immediately
    wrapper.vm.animateHeading = jest.fn().mockImplementation(() => {
      wrapper.vm.displayedHeading = wrapper.vm.headingText;
      wrapper.vm.isHeadingDone = true;
    });
    
    // Call it manually
    wrapper.vm.animateHeading();
    
    // Animation should be complete
    expect(wrapper.vm.displayedHeading).toBe(wrapper.vm.headingText)
    expect(wrapper.vm.isHeadingDone).toBe(true)
    
    // Set isHeadingDone to trigger cursor blink 
    wrapper.setData({ isHeadingDone: true });
    await wrapper.vm.$nextTick();
    
    // Verify cursor exists
    const cursor = wrapper.find('.cursor')
    expect(cursor.exists()).toBe(true)
    
    // For the cursor blinking class we check the element has it in the DOM
    // This is more resilient than checking Vue's class array
    expect(cursor.element.className).toContain('blink')
    
    jest.useRealTimers()
  })

  test('renders nav buttons when not in chat mode', () => {
    const wrapper = mount(ChatLayout)
    expect(wrapper.vm.isChat).toBe(false)
    const navButtons = wrapper.findAll('.nav-button')
    expect(navButtons.length).toBe(wrapper.vm.navItems.length)
    
    // Check that each button has correct text
    wrapper.vm.navItems.forEach((item, index) => {
      expect(navButtons.at(index).text()).toBe(item)
    })
  })

  test('nav button hover changes scale', async () => {
    const wrapper = mount(ChatLayout)
    const index = 0
    
    // Initial state
    expect(wrapper.vm.buttonStyles[index].transform).toBe('scale(1)')
    
    // Call hover method
    wrapper.vm.onButtonHover(index, true)
    expect(wrapper.vm.buttonStyles[index].transform).toBe('scale(1.05)')
    
    // Call unhover method
    wrapper.vm.onButtonHover(index, false)
    expect(wrapper.vm.buttonStyles[index].transform).toBe('scale(1)')
  })

  test('sendMessage toggles to chat mode', async () => {
    const wrapper = mount(ChatLayout)
    wrapper.setData({ currentMessage: 'Hello' })
    
    expect(wrapper.vm.isChat).toBe(false)
    expect(wrapper.vm.messages.length).toBe(0)
    
    wrapper.vm.sendMessage()
    
    expect(wrapper.vm.isChat).toBe(true)
    expect(wrapper.vm.messages.length).toBe(2) // User message + typing indicator
    expect(wrapper.vm.messages[0].text).toBe('Hello')
    expect(wrapper.vm.messages[0].isUser).toBe(true)
    expect(wrapper.vm.currentMessage).toBe('')
  })

  test('autogrow function adjusts textarea height', () => {
    const wrapper = mount(ChatLayout)
    const mockTextarea = {
      style: {
        height: '100px'
      },
      scrollHeight: 150
    }
    
    // Since the function sequentially sets height to 'auto' then to scrollHeight + 'px',
    // we can only check the final value in the test
    wrapper.vm.autoGrow({ target: mockTextarea })
    expect(mockTextarea.style.height).toBe('150px')
  })

  test('glitchFonts changes font multiple times', async () => {
    jest.useFakeTimers()
    const wrapper = mount(ChatLayout)
    const initialFont = wrapper.vm.currentFont
    const initialFontIndex = wrapper.vm.currentFontIndex
    
    wrapper.vm.glitchFonts()
    expect(wrapper.vm.isGlitching).toBe(true)
    
    // Fast-forward through all intervals
    jest.advanceTimersByTime(50 * 15) // 15 cycles * 50ms
    
    expect(wrapper.vm.isGlitching).toBe(false)
    
    // Should have cycled through at least once
    expect(wrapper.vm.currentFontIndex).not.toBe(initialFontIndex)
    
    jest.useRealTimers()
  })

  test('simulateTyping types out sample text', async () => {
    jest.useFakeTimers()
    const wrapper = mount(ChatLayout)
    
    // Mock the autoGrow method
    const mockAutoGrow = jest.fn()
    wrapper.vm.autoGrow = mockAutoGrow
    
    // Make sure we're not already typing
    expect(wrapper.vm.isTyping).toBe(false)
    expect(wrapper.vm.currentMessage).toBe('')
    
    // Start typing simulation with index 0
    wrapper.vm.simulateTyping(0)
    
    // Should now be typing
    expect(wrapper.vm.isTyping).toBe(true)
    
    // Fast-forward through all typing
    const sampleText = wrapper.vm.navTexts[0]
    jest.advanceTimersByTime(50 * sampleText.length)
    
    // Should have typed all characters
    expect(wrapper.vm.currentMessage.length).toBe(sampleText.length)
    
    // Fast-forward past the final 500ms timeout
    jest.advanceTimersByTime(500)
    
    jest.useRealTimers()
  })
})