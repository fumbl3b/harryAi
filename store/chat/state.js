export default () => {
  // Initialize with a system message to give context to the model
  const systemMessage = {
    role: 'system',
    content: 'You are harryAI, a helpful and friendly assistant. You maintain context of your conversations with users and can reference previous messages.'
  };
  
  return {
    messages: [],
    isLoading: false,
    error: null,
    messageHistory: [systemMessage] // Initialize history with a system message
  };
}