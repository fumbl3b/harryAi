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
        console.log('[CLIENT] OpenAI API - Sending full conversation history:');
        console.log(`[CLIENT] Total history messages: ${messages.length}`);
        
        // Ensure all messages follow OpenAI format {role, content}
        const validStructure = messages.every(msg => 
          msg && typeof msg === 'object' && 
          ['user', 'assistant', 'system'].includes(msg.role) && 
          typeof msg.content === 'string' && msg.content.trim() !== ''
        );
        
        if (!validStructure) {
          console.error('[CLIENT] Invalid message structure detected in history!');
          // Print the problematic messages
          messages.forEach((msg, i) => {
            if (!msg || typeof msg !== 'object' || !['user', 'assistant', 'system'].includes(msg.role) || typeof msg.content !== 'string') {
              console.error(`[CLIENT] Invalid message at index ${i}:`, msg);
            }
          });
        }
        
        // Log the full conversation history
        messages.forEach((msg, index) => {
          console.log(`[CLIENT] History[${index}]: ${msg.role} - ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
        });
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
        console.log('[CLIENT] OpenAI API (streaming) - Using full conversation history:');
        console.log(`[CLIENT] Streaming with history length: ${messages.length}`);
        
        // Quick validation before sending to API
        if (!Array.isArray(messages) || messages.length === 0) {
          console.error('[CLIENT] Warning: Invalid or empty message history array!');
        }
        
        // Log the history being used for context
        messages.forEach((msg, index) => {
          console.log(`[CLIENT] History[${index}]: ${msg.role} - ${msg.content.substring(0, 40)}${msg.content.length > 40 ? '...' : ''}`);
        });
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
      
      // Stream in larger chunks for faster output (2-3 seconds total)
      const characters = fullResponse.split('');
      let streamedResponse = '';
      
      // Calculate total characters and timing to complete in ~2.5 seconds
      const totalChars = characters.length;
      const targetTimeMs = 2500; // 2.5 seconds
      
      // For very short responses, just return immediately
      if (totalChars < 100) {
        streamedResponse = fullResponse;
        if (onChunk) onChunk(fullResponse);
      } else {
        // Determine optimal chunk size and delay
        // We'll aim for ~20 chunks to complete in 2.5 seconds
        const numChunks = 20;
        const chunkSize = Math.ceil(totalChars / numChunks);
        const delayBetweenChunks = Math.floor(targetTimeMs / numChunks);
        
        // Send chunks with calculated timing
        for (let i = 0; i < totalChars; i += chunkSize) {
          const end = Math.min(i + chunkSize, totalChars);
          const chunk = characters.slice(i, end).join('');
          streamedResponse += chunk;
          
          if (onChunk) onChunk(chunk);
          
          // Add a small delay between chunks (skip delay on last chunk)
          if (i + chunkSize < totalChars) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
          }
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
    
    // For short responses, return as a single chunk
    if (text.length < 200) {
      return [text];
    }
    
    // For longer responses, split into larger chunks
    // Calculate how many chunks we need to create (aiming for ~5-10 chunks)
    const targetChunkSize = Math.ceil(text.length / 8);
    const chunks = [];
    
    // Try to split at sentence boundaries
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = '';
    
    sentences.forEach(sentence => {
      // If adding this sentence exceeds target chunk size, push current chunk
      if (currentChunk.length + sentence.length > targetChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    });
    
    // Add any remaining text as the final chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    // Fallback: If something went wrong, return the whole text as a single chunk
    if (chunks.length === 0) {
      return [text];
    }
    
    return chunks;
  }
}