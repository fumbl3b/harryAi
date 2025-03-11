const OpenAI = require('openai');

// Helper function to safely extract a Nuxt runtime config value
function getConfigValue(req, key, defaultValue = null) {
  try {
    // First try to get from request context
    if (req.context && 
        req.context.nuxt && 
        req.context.nuxt.options && 
        req.context.nuxt.options.privateRuntimeConfig && 
        req.context.nuxt.options.privateRuntimeConfig[key]) {
      return req.context.nuxt.options.privateRuntimeConfig[key];
    }
    
    // Then try to get from process.env directly
    if (process.env[key]) {
      return process.env[key];
    }
    
    // Finally, fall back to the default value
    return defaultValue;
  } catch (error) {
    console.warn(`[SERVER] Error accessing config value for ${key}:`, error.message);
    return process.env[key] || defaultValue;
  }
}

module.exports = async function(req, res) {
  console.log('[SERVER] Starting chat API middleware');
  
  // Get environment variables safely
  const apiKey = getConfigValue(req, 'OPENAI_API_KEY');
  const model = getConfigValue(req, 'OPENAI_MODEL', 'gpt-4o-mini');
  
  console.log('[SERVER] Environment variables:', {
    OPENAI_API_KEY: apiKey ? '***' : 'not set',
    OPENAI_MODEL: model || 'not set (will use default)',
    NODE_ENV: process.env.NODE_ENV || 'not set'
  });
  
  if (!apiKey) {
    console.error('[SERVER] No OpenAI API key found!');
    res.statusCode = 500;
    res.end(JSON.stringify({ 
      error: 'Server configuration error: Missing API key',
      details: 'The API key is not set in environment variables'
    }));
    return;
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: apiKey
  });

  console.log('[SERVER] OpenAI client initialized');
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
    
    console.log(`[SERVER] Using model: ${model}`);
    
    // Call OpenAI API with updated parameters
    const response = await openai.chat.completions.create({
      model: model,
      messages,
      temperature: 0.7,
      max_tokens: 1500 // Reasonable limit to avoid token issues
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