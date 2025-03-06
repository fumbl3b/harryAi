const OpenAI = require('openai');

console.log('[SERVER] Starting chat API middleware');
console.log('[SERVER] Environment variables:', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***' : 'not set',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'not set (will use default)'
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('[SERVER] OpenAI client initialized');

module.exports = async function (req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  
  try {
    // Parse request body
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    await new Promise(resolve => {
      req.on('end', resolve);
    });
    
    console.log('[SERVER] Received request body:', body);
    
    const { messages } = JSON.parse(body);
    
    if (!messages || !Array.isArray(messages)) {
      console.error('[SERVER] Invalid messages format:', messages);
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid request body: messages array is required' }));
      return;
    }
    
    console.log('[SERVER] Sending to OpenAI:', JSON.stringify(messages));
    
    // Call OpenAI API with updated parameters
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      store: true, // Enable storing in OpenAI system
    });
    
    console.log('[SERVER] OpenAI response received:', JSON.stringify(response.choices[0].message));
    
    // Send response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      message: response.choices[0].message
    }));
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    res.statusCode = 500;
    res.end(JSON.stringify({ 
      error: 'Error calling OpenAI API',
      details: error.message
    }));
  }
};