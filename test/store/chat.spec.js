import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import state from '~/store/chat/state';
import mutations from '~/store/chat/mutations';
import actions from '~/store/chat/actions';

// Mock OpenAI service
jest.mock('~/services/openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMessage: jest.fn().mockResolvedValue('Mock response'),
      streamMessage: jest.fn().mockImplementation((messages, onChunk) => {
        // Simulate streaming behavior
        onChunk('Mock ');
        onChunk('response');
        return Promise.resolve('Mock response');
      })
    };
  });
});

describe('Chat Store', () => {
  let store;
  let localVue;
  
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
    
    store = new Vuex.Store({
      modules: {
        chat: {
          namespaced: true,
          state: state(),
          mutations,
          actions
        }
      }
    });
    
    // Mock console methods
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('Message History Management', () => {
    test('State is initialized with a system message', () => {
      // Verify initial state
      expect(store.state.chat.messageHistory.length).toBe(1);
      expect(store.state.chat.messageHistory[0].role).toBe('system');
    });
    
    test('Adding a user message updates the messageHistory array', () => {
      // When a user sends a message
      store.commit('chat/ADD_MESSAGE', {
        text: 'Hello AI',
        isUser: true
      });
      
      // Then the message is added to history
      expect(store.state.chat.messageHistory.length).toBe(2);
      expect(store.state.chat.messageHistory[1].role).toBe('user');
      expect(store.state.chat.messageHistory[1].content).toBe('Hello AI');
    });
    
    test('Typing indicators are not added to messageHistory', () => {
      // Initial count (system message)
      const initialCount = store.state.chat.messageHistory.length;
      
      // When a typing indicator is added
      store.commit('chat/ADD_MESSAGE', {
        text: '...',
        isUser: false,
        isTyping: true
      });
      
      // Then the history count remains the same
      expect(store.state.chat.messageHistory.length).toBe(initialCount);
    });
    
    test('Assistant response is added to messageHistory', () => {
      // Given a user message already in history
      store.commit('chat/ADD_MESSAGE', {
        text: 'Hello AI',
        isUser: true
      });
      
      const countAfterUserMessage = store.state.chat.messageHistory.length;
      
      // When the assistant responds (first with typing indicator)
      store.commit('chat/ADD_MESSAGE', {
        text: '...',
        isUser: false,
        isTyping: true
      });
      
      // Then update with actual response
      store.commit('chat/UPDATE_LAST_MESSAGE', {
        text: 'Hello human',
        isTyping: false
      });
      
      // Then verify the history has an additional entry for the assistant
      expect(store.state.chat.messageHistory.length).toBe(countAfterUserMessage + 1);
      expect(store.state.chat.messageHistory[countAfterUserMessage].role).toBe('assistant');
      expect(store.state.chat.messageHistory[countAfterUserMessage].content).toBe('Hello human');
    });
    
    test('Clearing messages preserves system messages', () => {
      // Given multiple messages in history
      store.commit('chat/ADD_MESSAGE', { text: 'Hello', isUser: true });
      store.commit('chat/ADD_MESSAGE', { text: 'Hi there', isUser: false });
      
      // When chat is cleared
      store.commit('chat/CLEAR_MESSAGES');
      
      // Then only system messages remain
      expect(store.state.chat.messageHistory.length).toBeGreaterThan(0);
      expect(store.state.chat.messageHistory.every(msg => msg.role === 'system')).toBe(true);
    });
  });
  
  describe('API Interaction', () => {
    test('Complete message history is sent to the API', async () => {
      // Mock the OpenAI service
      const OpenAIService = require('~/services/openai');
      const openaiInstance = new OpenAIService();
      
      // Given multiple messages in history
      store.commit('chat/ADD_MESSAGE', { text: 'First message', isUser: true });
      store.commit('chat/ADD_MESSAGE', { text: 'First response', isUser: false });
      store.commit('chat/ADD_MESSAGE', { text: 'Second message', isUser: true });
      
      // When sending a new message
      await store.dispatch('chat/sendMessage', 'Second response');
      
      // Then verify the complete history was sent
      const sentMessages = openaiInstance.streamMessage.mock.calls[0][0];
      
      // Should include: system + first user + first assistant + second user
      expect(sentMessages.length).toBeGreaterThanOrEqual(4);
      
      // Verify the order of messages
      expect(sentMessages[0].role).toBe('system');
      expect(sentMessages[1].role).toBe('user');
      expect(sentMessages[1].content).toBe('First message');
      expect(sentMessages[2].role).toBe('assistant');
      expect(sentMessages[2].content).toBe('First response');
      expect(sentMessages[3].role).toBe('user');
      expect(sentMessages[3].content).toBe('Second message');
    });
    
    test('After receiving a response, history includes the new assistant message', async () => {
      // Given a user message
      store.commit('chat/ADD_MESSAGE', { text: 'Hello', isUser: true });
      const historyCountBefore = store.state.chat.messageHistory.length;
      
      // When sending via the action
      await store.dispatch('chat/sendMessage', 'What is AI?');
      
      // Then history should include the response
      expect(store.state.chat.messageHistory.length).toBe(historyCountBefore + 2);
      
      // Last two messages should be the user question and AI answer
      const lastUserMsg = store.state.chat.messageHistory[historyCountBefore];
      const lastAiMsg = store.state.chat.messageHistory[historyCountBefore + 1];
      
      expect(lastUserMsg.role).toBe('user');
      expect(lastUserMsg.content).toBe('What is AI?');
      expect(lastAiMsg.role).toBe('assistant');
      expect(lastAiMsg.content).toBe('Mock response');
    });
  });
});