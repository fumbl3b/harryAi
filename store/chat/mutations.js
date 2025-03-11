export default {
  ADD_MESSAGE(state, message) {
    console.log('[MUTATIONS] Adding message:', message);
    state.messages.push(message);
    
    // Add to message history for API context - only actual messages, not typing indicators
    if (!message.isTyping) {
      // Only add meaningful messages to history (skip temporary placeholders)
      if (message.isUser || (message.text !== '...' && !message.text.startsWith('Getting response'))) {
        // Create history entry in OpenAI format
        const historyEntry = {
          role: message.isUser ? 'user' : 'assistant',
          content: message.text
        };
        
        // Add to history array
        state.messageHistory.push(historyEntry);
        
        // Log the updated history
        console.log('[MUTATIONS] Added to history:', historyEntry.role, historyEntry.content.substring(0, 30));
        console.log('[MUTATIONS] History length is now:', state.messageHistory.length);
      }
    }
  },
  UPDATE_LAST_MESSAGE(state, { text, isUser, isTyping }) {
    console.log('[MUTATIONS] Updating last message:', { text, isUser, isTyping });
    if (state.messages.length > 0) {
      const lastIndex = state.messages.length - 1;
      const lastMessage = state.messages[lastIndex];
      // Use Vue.set for reactivity
      const updatedMessage = {
        ...lastMessage,
        text,
        // Only update isUser if provided
        ...(isUser !== undefined && { isUser }),
        // Only update isTyping if provided, default to false
        isTyping: isTyping !== undefined ? isTyping : false
      };
      
      // Replace the entire message for better reactivity
      state.messages.splice(lastIndex, 1, updatedMessage);
      
      // Update message history if this is a non-typing assistant message
      if (!updatedMessage.isTyping && updatedMessage.isUser === false) {
        console.log('[MUTATIONS] Updating assistant message in history');
        
        // Skip temporary messages
        if (text !== '...' && !text.startsWith('Getting response')) {
          // Find the last assistant message in history
          const lastAssistantIndex = state.messageHistory.findIndex(
            msg => msg.role === 'assistant'
          );
          
          if (lastAssistantIndex !== -1) {
            // Update existing history entry
            console.log('[MUTATIONS] Updating existing assistant message in history');
            state.messageHistory[lastAssistantIndex].content = text;
          } else {
            // Add new history entry
            console.log('[MUTATIONS] Adding new assistant message to history');
            state.messageHistory.push({
              role: 'assistant',
              content: text
            });
          }
          
          // Debug log current history state
          console.log('[MUTATIONS] Updated message history:', JSON.stringify(state.messageHistory));
        }
      }
      
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
      
      // Update the corresponding message in history
      if (!updatedMessage.isTyping && updatedMessage.isUser === false) {
        console.log('[MUTATIONS] Appending to assistant message in history');
        
        const lastAssistantIndex = state.messageHistory.findIndex(
          msg => msg.role === 'assistant'
        );
        
        if (lastAssistantIndex !== -1) {
          console.log('[MUTATIONS] Updating existing assistant message in history with appended text');
          state.messageHistory[lastAssistantIndex].content = updatedMessage.text;
        } else {
          // If somehow we're appending but there's no assistant message found, add it
          console.log('[MUTATIONS] No assistant message found, adding new one to history');
          state.messageHistory.push({
            role: 'assistant',
            content: updatedMessage.text
          });
        }
        
        // Debug log current history state
        console.log('[MUTATIONS] Current message history after append:', JSON.stringify(state.messageHistory));
      }
      
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
    // Clear UI messages
    state.messages = [];
    
    // Preserve only system messages in the history, remove user and assistant messages
    const systemMessages = state.messageHistory.filter(msg => msg.role === 'system');
    
    // Reset history with just system messages
    state.messageHistory = systemMessages;
    
    // If we don't have any system messages, add a default one
    if (systemMessages.length === 0) {
      const defaultSystemMessage = {
        role: 'system',
        content: 'You are harryAI, a helpful and friendly assistant. You maintain context of your conversations with users and can reference previous messages.'
      };
      
      state.messageHistory.push(defaultSystemMessage);
      console.log('[MUTATIONS] Added default system message to empty history');
    }
    
    console.log('[MUTATIONS] Cleared chat. Preserved system messages:');
    state.messageHistory.forEach((msg, i) => {
      console.log(`[MUTATIONS] System[${i}]: ${msg.content.substring(0, 40)}...`);
    });
  }
}