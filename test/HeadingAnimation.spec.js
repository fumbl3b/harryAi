import { mount } from '@vue/test-utils'
import ChatLayout from '@/components/ChatLayout.vue'

describe('Heading Animation Feature', () => {
  test('heading text fills progressively', async () => {
    jest.useFakeTimers()
    const wrapper = mount(ChatLayout)
    
    // Reset animation state manually for testing
    wrapper.vm.displayedHeading = '';
    wrapper.vm.isHeadingDone = false;
    
    // Call the animation method directly
    wrapper.vm.animateHeading();
    
    // After a short time, should have at least one character
    jest.advanceTimersByTime(100)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.displayedHeading.length).toBeGreaterThan(0)
    
    // But should not be complete yet
    expect(wrapper.vm.displayedHeading.length).toBeLessThan(wrapper.vm.headingText.length)
    expect(wrapper.vm.isHeadingDone).toBe(false)
    
    // Let the animation run to completion (worst case: 150ms * total chars)
    const worstCaseTime = 150 * wrapper.vm.headingText.length
    jest.advanceTimersByTime(worstCaseTime)
    await wrapper.vm.$nextTick()
    
    // Now it should be complete
    expect(wrapper.vm.displayedHeading).toBe(wrapper.vm.headingText)
    expect(wrapper.vm.isHeadingDone).toBe(true)
    
    jest.useRealTimers()
  })
  
  test('cursor has blink class when animation is done', async () => {
    const wrapper = mount(ChatLayout)
    
    // Set heading as complete
    await wrapper.setData({
      displayedHeading: wrapper.vm.headingText,
      isHeadingDone: true
    })
    
    await wrapper.vm.$nextTick()
    
    // Find the cursor element
    const cursor = wrapper.find('.cursor')
    expect(cursor.exists()).toBe(true)
    
    // Check that it has the blink class
    expect(cursor.element.className).toContain('blink')
  })
  
  test('random font glitching occurs after animation completes', async () => {
    jest.useFakeTimers()
    const wrapper = mount(ChatLayout)
    
    // Mock Math.random to always return 0.05 (below our 0.1 threshold)
    const originalRandom = Math.random
    Math.random = jest.fn().mockReturnValue(0.05)
    
    // Mock glitchFonts method
    const mockGlitchFonts = jest.fn()
    wrapper.vm.glitchFonts = mockGlitchFonts
    
    // Set animation as complete to trigger random glitching interval
    await wrapper.setData({
      displayedHeading: wrapper.vm.headingText,
      isHeadingDone: true
    })
    
    // Run the animateHeading method to set up glitch interval
    wrapper.vm.animateHeading()
    
    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000)
    
    // The glitchFonts method should have been called
    expect(mockGlitchFonts).toHaveBeenCalled()
    
    // Restore Math.random
    Math.random = originalRandom
    jest.useRealTimers()
  })
})