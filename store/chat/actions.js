import OpenAIService from '~/services/openai';

const openai = new OpenAIService();

export default {
  /**
   * Send a message to OpenAI
   */
  async sendMessage({ commit, state }, userMessage) {
    console.log('[STORE] Starting sendMessage action with:', userMessage);
    try {
      // Add user message to state
      commit('ADD_MESSAGE', {
        text: userMessage,
        isUser: true,
      });
      console.log('[STORE] Added user message to state');

      // Show typing indicator
      commit('ADD_MESSAGE', {
        text: '...',
        isUser: false,
        isTyping: true
      });
      console.log('[STORE] Added typing indicator');

      commit('SET_LOADING', true);
      
      // Convert state messages to OpenAI format
      const messages = state.messages
        .filter(msg => !msg.isTyping) // Filter out typing indicators
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }));
      
      console.log('[STORE] Prepared messages for API:', JSON.stringify(messages));

      try {
        // Stream the response character by character
        let responseText = '';
        let isFirstChunk = true;
        
        console.log('[STORE] Calling streamMessage');
        
        // We need to immediately respond with something to replace the "..."
        if (state.messages.length > 0) {
          // Get the last message (which should be our typing indicator)
          const lastMessageIndex = state.messages.length - 1;
          const lastMessage = state.messages[lastMessageIndex];
          
          // If it's still showing the typing indicator, update it to show we're fetching
          if (lastMessage && lastMessage.isTyping) {
            console.log('[STORE] Updating typing indicator to show we are fetching response...');
            commit('UPDATE_LAST_MESSAGE', {
              text: 'Getting response...',
              isTyping: true // Keep typing animation until we get first chunk
            });
          }
        }
        
        // Use Vue.prototype.$scrollToBottom to access the scrolling method
        // This approach connects the store action to component methods
        const scrollToBottomIfAvailable = () => {
          if (typeof window !== 'undefined' && window.__vueInstance && window.__vueInstance.scrollToBottom) {
            window.__vueInstance.scrollToBottom();
          }
        };
        
        // Store Vue instance reference when streaming starts
        if (typeof window !== 'undefined' && this._vm) {
          window.__vueInstance = this._vm.$root.$children[0];
        }
        
        await openai.streamMessage(messages, (chunk) => {
          console.log('[STORE] Received chunk:', chunk);
          
          if (isFirstChunk) {
            // First chunk received, immediately replace the typing indicator
            console.log('[STORE] First chunk, replacing typing indicator');
            commit('UPDATE_LAST_MESSAGE', {
              text: chunk,
              isTyping: false // Immediately stop typing animation
            });
            responseText = chunk;
            isFirstChunk = false;
          } else {
            // Append new chunks to existing text
            console.log('[STORE] Appending chunk to message');
            commit('APPEND_TO_LAST_MESSAGE', chunk);
            responseText += chunk;
          }
          
          // Try to scroll to bottom after each chunk
          scrollToBottomIfAvailable();
        });

        console.log('[STORE] Stream completed, response:', responseText);
        
        // Make sure loading is set to false and the message is not marked as typing
        commit('SET_LOADING', false);
        
        // Double-check that the last message has the final content and is not marked as typing
        if (responseText) {
          commit('UPDATE_LAST_MESSAGE', {
            text: responseText,
            isTyping: false
          });
        }
        
        return responseText;
      } catch (apiError) {
        // Handle specific API errors
        console.error('[STORE] API Error:', apiError);
        commit('SET_ERROR', apiError.message || 'Error connecting to OpenAI');
        commit('UPDATE_LAST_MESSAGE', {
          text: 'Sorry, there was an error processing your request. Please check your API key and try again.',
          isTyping: false
        });
        commit('SET_LOADING', false);
      }
    } catch (error) {
      // Handle general errors in the action
      console.error('[STORE] Error in sendMessage action:', error);
      commit('SET_ERROR', error.message || 'Failed to send message');
      commit('UPDATE_LAST_MESSAGE', {
        text: 'Sorry, there was an error processing your request.',
        isTyping: false
      });
      commit('SET_LOADING', false);
      throw error;
    }
  },

  /**
   * Clear all messages
   */
  clearChat({ commit }) {
    commit('CLEAR_MESSAGES');
    commit('SET_ERROR', null);
  }
}