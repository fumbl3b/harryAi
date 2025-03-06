export default {
  ADD_MESSAGE(state, message) {
    console.log('[MUTATIONS] Adding message:', message);
    state.messages.push(message);
  },
  UPDATE_LAST_MESSAGE(state, { text, isUser, isTyping }) {
    console.log('[MUTATIONS] Updating last message:', { text, isUser, isTyping });
    if (state.messages.length > 0) {
      const lastIndex = state.messages.length - 1;
      // Use Vue.set for reactivity
      const updatedMessage = {
        ...state.messages[lastIndex],
        text,
        // Only update isUser if provided
        ...(isUser !== undefined && { isUser }),
        // Only update isTyping if provided, default to false
        isTyping: isTyping !== undefined ? isTyping : false
      };
      
      // Replace the entire message for better reactivity
      state.messages.splice(lastIndex, 1, updatedMessage);
      
      console.log('[MUTATIONS] Updated message at index', lastIndex, state.messages[lastIndex]);
    } else {
      console.warn('[MUTATIONS] Cannot update last message: no messages in state');
    }
  },
  APPEND_TO_LAST_MESSAGE(state, text) {
    console.log('[MUTATIONS] Appending to last message:', text);
    if (state.messages.length > 0) {
      const lastIndex = state.messages.length - 1;
      const currentMessage = state.messages[lastIndex];
      
      // Create updated message with appended text
      const updatedMessage = {
        ...currentMessage,
        text: currentMessage.text + text,
        isTyping: false // Ensure typing is false when appending content
      };
      
      // Replace the entire message for better reactivity
      state.messages.splice(lastIndex, 1, updatedMessage);
      
      console.log('[MUTATIONS] New message text:', state.messages[lastIndex].text);
    } else {
      console.warn('[MUTATIONS] Cannot append to last message: no messages in state');
    }
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  CLEAR_MESSAGES(state) {
    state.messages = [];
  }
}