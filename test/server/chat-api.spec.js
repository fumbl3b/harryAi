// Mock OpenAI library
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: 'Test API response'
                }
              }
            ]
          })
        }
      }
    };
  });
});

// Set environment variables for testing
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.OPENAI_MODEL = 'test-model';

// Import the chat API handler
const chatHandler = require('~/server/api/chat');

describe('Chat API Endpoint', () => {
  let req;
  let res;
  
  beforeEach(() => {
    // Mock request object
    req = {
      method: 'POST',
      on: jest.fn(),
      context: {
        nuxt: {
          options: {
            privateRuntimeConfig: {
              OPENAI_API_KEY: 'test-api-key',
              OPENAI_MODEL: 'test-model'
            }
          }
        }
      }
    };
    
    // Mock response object
    res = {
      setHeader: jest.fn(),
      statusCode: 200,
      end: jest.fn()
    };
    
    // Mock console methods
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
  });
  
  test('Passes complete message history to OpenAI API', async () => {
    // Setup request data event to provide message history
    const messageHistory = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'First response' },
      { role: 'user', content: 'Second message' }
    ];
    
    // Setup request with message history
    req.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(JSON.stringify({ messages: messageHistory }));
      }
      if (event === 'end') {
        callback();
      }
      return req;
    });
    
    // Call the API handler
    await chatHandler(req, res);
    
    // Get the OpenAI instance
    const OpenAI = require('openai');
    const openaiInstance = new OpenAI();
    
    // Verify completions.create was called with full message history
    expect(openaiInstance.chat.completions.create).toHaveBeenCalledTimes(1);
    
    // Get the parameters passed to the API
    const apiCallParams = openaiInstance.chat.completions.create.mock.calls[0][0];
    
    // Verify model parameter
    expect(apiCallParams.model).toBe('test-model');
    
    // Verify complete message history was sent
    expect(apiCallParams.messages).toEqual(messageHistory);
    expect(apiCallParams.messages.length).toBe(4);
    
    // Verify message history order was preserved
    expect(apiCallParams.messages[0].role).toBe('system');
    expect(apiCallParams.messages[1].role).toBe('user');
    expect(apiCallParams.messages[2].role).toBe('assistant');
    expect(apiCallParams.messages[3].role).toBe('user');
    
    // Verify response was sent back correctly
    expect(res.statusCode).toBe(200);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({
        message: {
          role: 'assistant',
          content: 'Test API response'
        }
      })
    );
  });
  
  test('Adds a system message if one is not provided', async () => {
    // Setup request with message history that doesn't include a system message
    const messageHistory = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' }
    ];
    
    // Setup request
    req.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(JSON.stringify({ messages: messageHistory }));
      }
      if (event === 'end') {
        callback();
      }
      return req;
    });
    
    // Call the API handler
    await chatHandler(req, res);
    
    // Get the OpenAI instance
    const OpenAI = require('openai');
    const openaiInstance = new OpenAI();
    
    // Get the parameters passed to the API
    const apiCallParams = openaiInstance.chat.completions.create.mock.calls[0][0];
    
    // Verify a system message was added
    expect(apiCallParams.messages.length).toBe(3); // Original 2 + added system
    expect(apiCallParams.messages[0].role).toBe('system');
    
    // Verify original messages were preserved
    expect(apiCallParams.messages[1].role).toBe('user');
    expect(apiCallParams.messages[1].content).toBe('Hello');
    expect(apiCallParams.messages[2].role).toBe('assistant');
    expect(apiCallParams.messages[2].content).toBe('Hi there');
  });
  
  test('Handles invalid message history format', async () => {
    // Setup request with invalid message history
    const invalidHistory = [
      { invalid: 'format' },
      { role: 'user', content: 'Hello' }
    ];
    
    // Setup request
    req.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(JSON.stringify({ messages: invalidHistory }));
      }
      if (event === 'end') {
        callback();
      }
      return req;
    });
    
    // Call the API handler
    await chatHandler(req, res);
    
    // Get the OpenAI instance
    const OpenAI = require('openai');
    const openaiInstance = new OpenAI();
    
    // Get the parameters passed to the API
    const apiCallParams = openaiInstance.chat.completions.create.mock.calls[0][0];
    
    // Verify only valid messages were sent
    expect(apiCallParams.messages.length).toBe(2); // System + valid user message
    
    // Verify invalid messages were filtered out
    expect(apiCallParams.messages[0].role).toBe('system');
    expect(apiCallParams.messages[1].role).toBe('user');
    expect(apiCallParams.messages[1].content).toBe('Hello');
  });
});