import OpenAIService from '~/services/openai';

// Mock global fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ message: { content: 'Test response' } })
  })
);

describe('OpenAI Service', () => {
  let openai;
  
  beforeEach(() => {
    openai = new OpenAIService();
    global.fetch.mockClear();
    
    // Mock environment
    process.env.NODE_ENV = 'test';
    
    // Mock console
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
  });
  
  describe('sendMessage', () => {
    test('Sends the complete message history to the API', async () => {
      // Given a conversation history
      const history = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' }
      ];
      
      // When sending a message
      await openai.sendMessage(history);
      
      // Then verify the full history was sent in the request
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Get the call arguments
      const fetchArgs = global.fetch.mock.calls[0];
      const url = fetchArgs[0];
      const options = fetchArgs[1];
      const requestBody = JSON.parse(options.body);
      
      // Verify correct endpoint
      expect(url).toBe('/api');
      
      // Verify request method
      expect(options.method).toBe('POST');
      
      // Verify content type
      expect(options.headers['Content-Type']).toBe('application/json');
      
      // Verify complete history was sent
      expect(requestBody.messages).toEqual(history);
      expect(requestBody.messages.length).toBe(4);
      
      // Verify order of messages
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[1].role).toBe('user');
      expect(requestBody.messages[2].role).toBe('assistant');
      expect(requestBody.messages[3].role).toBe('user');
    });
    
    test('Handles API errors correctly', async () => {
      // Given a failed API response
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'API Error', details: 'Test error' })
        })
      );
      
      // Given a history array
      const history = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' }
      ];
      
      // When sending a message, expect an error
      await expect(openai.sendMessage(history)).rejects.toThrow();
      
      // Verify the request was still made with the full history
      const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(requestBody.messages).toEqual(history);
    });
  });
  
  describe('streamMessage', () => {
    test('Sends the complete message history when streaming', async () => {
      // Mock sendMessage to verify its parameters
      openai.sendMessage = jest.fn().mockResolvedValue('Test streamed response');
      
      // Given a conversation history
      const history = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'Tell me a joke' }
      ];
      
      // Mock chunk callback
      const onChunk = jest.fn();
      
      // When streaming a message
      await openai.streamMessage(history, onChunk);
      
      // Then verify sendMessage was called with the full history
      expect(openai.sendMessage).toHaveBeenCalledWith(history);
      
      // Verify all history items were included
      const sentHistory = openai.sendMessage.mock.calls[0][0];
      expect(sentHistory.length).toBe(4);
      
      // Verify order of history items
      expect(sentHistory[0].role).toBe('system');
      expect(sentHistory[1].role).toBe('user');
      expect(sentHistory[2].role).toBe('assistant');
      expect(sentHistory[3].role).toBe('user');
      
      // Verify chunk callback was used
      expect(onChunk).toHaveBeenCalled();
    });
  });
});