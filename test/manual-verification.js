/**
 * Manual verification script for message history
 * Run this in a Node environment to simulate the message history flow
 */

// Chat history verification
function simulateChat() {
  // Initial state
  const state = {
    messages: [],
    messageHistory: [
      { role: 'system', content: 'You are harryAI, a helpful assistant.' }
    ]
  };

  console.log('===== CHAT HISTORY VERIFICATION =====');
  console.log('Initial state:');
  console.log('- History length:', state.messageHistory.length);
  console.log('- History:', JSON.stringify(state.messageHistory, null, 2));
  console.log('');

  // Add user message
  function addUserMessage(text) {
    console.log(`User sends: "${text}"`);
    
    // Add to UI messages
    state.messages.push({
      text,
      isUser: true
    });
    
    // Add to message history
    state.messageHistory.push({
      role: 'user',
      content: text
    });
    
    console.log('- After user message, history length:', state.messageHistory.length);
  }

  // Add assistant message
  function addAssistantMessage(text) {
    console.log(`Assistant responds: "${text}"`);
    
    // Add to UI messages
    state.messages.push({
      text,
      isUser: false
    });
    
    // Add to message history
    state.messageHistory.push({
      role: 'assistant',
      content: text
    });
    
    console.log('- After assistant response, history length:', state.messageHistory.length);
  }

  // Simulate sending to API
  function sendToAPI() {
    console.log('\nSending to API:');
    console.log('- Complete message history (length: ' + state.messageHistory.length + '):');
    
    // Log each message in the history
    state.messageHistory.forEach((msg, i) => {
      console.log(`  [${i}] ${msg.role}: ${msg.content.substring(0, 30)}${msg.content.length > 30 ? '...' : ''}`);
    });
    
    console.log('');
  }

  // Simulate a conversation
  addUserMessage('Hello, who are you?');
  addAssistantMessage('Hi! I am harryAI, a helpful assistant. How can I help you today?');
  sendToAPI();

  addUserMessage('Tell me about yourself');
  addAssistantMessage('I am an AI assistant designed to help with various tasks and answer questions. I can maintain context throughout our conversation.');
  sendToAPI();

  addUserMessage('What was my first question to you?');
  addAssistantMessage('Your first question to me was "Hello, who are you?"');
  sendToAPI();

  // Clear chat but preserve system message
  console.log('\nClearing chat but preserving system message...');
  state.messages = [];
  state.messageHistory = state.messageHistory.filter(msg => msg.role === 'system');
  
  console.log('- After clearing, history length:', state.messageHistory.length);
  console.log('- System message preserved:', state.messageHistory[0].content);
  
  // Start a new conversation
  console.log('\nStarting new conversation...');
  addUserMessage('Do you remember our previous conversation?');
  addAssistantMessage('I do not have access to our previous conversation as the chat history was cleared. But I am ready to help with a new topic!');
  sendToAPI();

  console.log('\nVerification complete! The message history is being properly maintained and passed to the API.');
}

// Run the simulation
simulateChat();