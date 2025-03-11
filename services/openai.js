export default class OpenAIService {
  /**
   * Send a message to OpenAI through our server API
   * @param {Array} messages - Array of message objects {role: 'user'|'assistant', content: string}
   * @returns {Promise<string>} - The assistant's response
   */
  async sendMessage(messages) {
    try {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT] Sending messages to API:', JSON.stringify(messages));
      }
      
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT] API response status:', response.status);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[CLIENT] API error:', errorData);
        throw new Error(errorData.details || 'Error calling OpenAI API');
      }
      
      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT] API response data:', data);
      }
      
      if (!data.message || !data.message.content) {
        console.error('[CLIENT] Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }
      
      return data.message.content;
    } catch (error) {
      console.error('[CLIENT] Error calling OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Simulates streaming by splitting the response into chunks 
   * (since we're not using server-sent events in this simple version)
   * @param {Array} messages - Array of message objects {role: 'user'|'assistant', content: string}
   * @param {Function} onChunk - Callback for each chunk of the response
   * @returns {Promise<string>} - The full response text
   */
  async streamMessage(messages, onChunk) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT] streamMessage called with messages:', JSON.stringify(messages));
      }
      
      // Get the full response first
      const fullResponse = await this.sendMessage(messages);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT] Got full response:', fullResponse);
      }
      
      // If there's no response or error, handle it
      if (!fullResponse) {
        console.error('[CLIENT] Empty response from API');
        throw new Error('Empty response from API');
      }
      
      // Stream character by character for a more realistic effect
      const characters = fullResponse.split('');
      let streamedResponse = '';
      
      // Send the first few characters immediately to create immediate feedback
      const initialChunkSize = Math.min(5, characters.length);
      if (initialChunkSize > 0) {
        const initialChunk = characters.slice(0, initialChunkSize).join('');
        streamedResponse += initialChunk;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[CLIENT] Sending initial characters:', initialChunk);
        }
        
        if (onChunk) onChunk(initialChunk);
      }
      
      // Process the rest with small delays
      for (let i = initialChunkSize; i < characters.length; i++) {
        // Random delay between 10-40ms for more natural typing
        const delay = Math.floor(Math.random() * 30) + 10;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const char = characters[i];
        streamedResponse += char;
        
        if (onChunk) onChunk(char);
        
        // Every 20 characters, create a slightly longer pause 
        // (like a natural pause in typing)
        if (i % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 70));
        }
      }
      
      return fullResponse;
    } catch (error) {
      console.error('[CLIENT] Error in streaming:', error);
      // Make sure we call onChunk with an error message so the UI updates
      if (onChunk) onChunk('Error: ' + (error.message || 'Failed to get response'));
      throw error;
    }
  }
  
  /**
   * Helper method to split text into chunks for simulated streaming
   * @param {string} text - Text to split
   * @returns {Array} - Array of text chunks
   */
  splitTextIntoChunks(text) {
    // Handle empty or undefined text
    if (!text) {
      return ['No response'];
    }
    
    // For very short responses, return immediately as a single chunk
    if (text.length < 50) {
      return [text];
    }
    
    // For longer responses, make sure we return a good first chunk immediately
    const chunks = [];
    
    // Extract first sentence or first 30 characters for immediate display
    const firstSentenceMatch = text.match(/^[^.!?]*[.!?]/);
    if (firstSentenceMatch && firstSentenceMatch[0]) {
      // We found a complete first sentence
      chunks.push(firstSentenceMatch[0]);
      text = text.substring(firstSentenceMatch[0].length);
    } else {
      // No complete sentence found, take first chunk with a reasonable size
      const firstChunk = text.substring(0, Math.min(30, text.length));
      chunks.push(firstChunk);
      text = text.substring(firstChunk.length);
    }
    
    // Process the remaining text
    if (text.length > 0) {
      // Split by spaces and punctuation, trying to keep natural breaks
      let currentChunk = '';
      
      // Split on sentence boundaries first
      const sentences = text.split(/(?<=[.!?])\s+/);
      
      for (const sentence of sentences) {
        // For each sentence, break it down further
        const words = sentence.split(/\s+/);
        
        for (const word of words) {
          currentChunk += (currentChunk ? ' ' : '') + word;
          
          // Create a chunk after accumulating a few words or at punctuation
          if (currentChunk.length >= 5 && /[.,;!?]$/.test(currentChunk)) {
            chunks.push(currentChunk);
            currentChunk = '';
          }
        }
        
        // If there's a remaining chunk after processing all words in a sentence
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
      }
    }
    
    // Fallback: If we somehow ended up with only the initial chunk, just return the whole text
    if (chunks.length <= 1) {
      return [text];
    }
    
    return chunks;
  }
}