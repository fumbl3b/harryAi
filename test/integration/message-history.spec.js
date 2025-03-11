// This test verifies the complete flow of message history from UI to API

// Mock OpenAI service
jest.mock('~/services/openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMessage: jest.fn().mockResolvedValue('Mock API response'),
      streamMessage: jest.fn().mockImplementation((messages, onChunk) => {
        // Record the messages passed to the API for testing
        streamMessage.lastMessages = messages;
        
        // Simulate streaming response
        onChunk('Mock ');
        onChunk('API ');
        onChunk('response');
        
        return Promise.resolve('Mock API response');
      })
    };
  });
});

// Create a global variable to access in tests
const streamMessage = { lastMessages: null };

import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import state from '~/store/chat/state';
import mutations from '~/store/chat/mutations';
import actions from '~/store/chat/actions';

describe('Message History Integration', () => {
  let store;
  let localVue;
  
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
    
    // Create a fresh store instance for each test
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
    
    // Mock console methods to avoid test output clutter
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    
    // Reset mock function calls
    jest.clearAllMocks();
    
    // Reset the reference to lastMessages
    streamMessage.lastMessages = null;
  });
  
  test('Complete conversation history is maintained and passed to API', async () => {
    // 1. Initial state should have a system message
    expect(store.state.chat.messageHistory.length).toBe(1);
    expect(store.state.chat.messageHistory[0].role).toBe('system');
    
    // 2. Send first user message
    await store.dispatch('chat/sendMessage', 'First question');
    
    // Verify history after first exchange
    expect(store.state.chat.messageHistory.length).toBe(3); // system + user + assistant
    expect(store.state.chat.messageHistory[1].role).toBe('user');
    expect(store.state.chat.messageHistory[1].content).toBe('First question');
    expect(store.state.chat.messageHistory[2].role).toBe('assistant');
    expect(store.state.chat.messageHistory[2].content).toBe('Mock API response');
    
    // 3. Send second user message
    await store.dispatch('chat/sendMessage', 'Follow-up question');
    
    // Verify history after second exchange
    expect(store.state.chat.messageHistory.length).toBe(5); // system + user + assistant + user + assistant
    expect(store.state.chat.messageHistory[3].role).toBe('user');
    expect(store.state.chat.messageHistory[3].content).toBe('Follow-up question');
    expect(store.state.chat.messageHistory[4].role).toBe('assistant');
    
    // 4. Send third user message to test context retention
    await store.dispatch('chat/sendMessage', 'Final question');
    
    // Verify the messages passed to the OpenAI API
    const messagesPassedToAPI = streamMessage.lastMessages;
    
    // Should contain complete history (all 7 messages)
    expect(messagesPassedToAPI.length).toBe(7); // system + 3 user/assistant pairs
    
    // Check specific message content and order
    expect(messagesPassedToAPI[0].role).toBe('system');
    expect(messagesPassedToAPI[1].role).toBe('user');
    expect(messagesPassedToAPI[1].content).toBe('First question');
    expect(messagesPassedToAPI[2].role).toBe('assistant');
    expect(messagesPassedToAPI[2].content).toBe('Mock API response');
    expect(messagesPassedToAPI[3].role).toBe('user');
    expect(messagesPassedToAPI[3].content).toBe('Follow-up question');
    expect(messagesPassedToAPI[4].role).toBe('assistant');
    expect(messagesPassedToAPI[5].role).toBe('user');
    expect(messagesPassedToAPI[5].content).toBe('Final question');
    
    // 5. Verify clearing chat preserves system message
    store.commit('chat/CLEAR_MESSAGES');
    expect(store.state.chat.messageHistory.length).toBe(1);
    expect(store.state.chat.messageHistory[0].role).toBe('system');
  });
  
  test('Long conversations maintain all history in proper order', async () => {
    // Create a longer conversation with 5 exchanges
    for (let i = 1; i <= 5; i++) {
      await store.dispatch('chat/sendMessage', `Question ${i}`);
    }
    
    // Check that we have all messages in history
    // 1 system + (5 user + 5 assistant) = 11 messages total
    expect(store.state.chat.messageHistory.length).toBe(11);
    
    // Verify the last API call received all previous history
    const messagesPassedToAPI = streamMessage.lastMessages;
    expect(messagesPassedToAPI.length).toBe(11);
    
    // Verify order of the messages
    for (let i = 1; i <= 5; i++) {
      const userIndex = (i * 2) - 1;
      const assistantIndex = i * 2;
      
      expect(messagesPassedToAPI[userIndex].role).toBe('user');
      expect(messagesPassedToAPI[userIndex].content).toBe(`Question ${i}`);
      
      expect(messagesPassedToAPI[assistantIndex].role).toBe('assistant');
      expect(messagesPassedToAPI[assistantIndex].content).toBe('Mock API response');
    }
  });
});