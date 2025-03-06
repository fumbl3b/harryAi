const OpenAI = require('openai');

// This is a test endpoint to verify OpenAI API connectivity
module.exports = async function (req, res) {
  // Access Nuxt runtime config
  const config = req.context ? req.context.nuxt.options : null;
  const privateConfig = config ? config.privateRuntimeConfig : null;
  
  // Get API key from Nuxt config or fallback to process.env
  const apiKey = privateConfig?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const model = privateConfig?.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  
  try {
    console.log('[TEST API] Starting OpenAI API test');
    console.log('[TEST API] Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      OPENAI_API_KEY: apiKey ? '***' : 'not set',
      OPENAI_MODEL: model || 'not set (will use default)'
    });
    
    // Check if API key is set
    if (!apiKey) {
      console.error('[TEST API] No API key provided');
      res.statusCode = 500;
      res.end(JSON.stringify({ 
        error: 'API key not configured',
        message: 'Please set the OPENAI_API_KEY environment variable in Vercel project settings or .env file'
      }));
      return;
    }
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    console.log('[TEST API] Initialized OpenAI client, testing connection...');
    
    // Simple API call to test connection
    const testMessage = {
      role: 'user',
      content: 'Return only the text "CONNECTION_SUCCESSFUL" without any additional text.'
    };
    
    console.log(`[TEST API] Using model: ${model}`);
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [testMessage],
      temperature: 0.7,
      max_tokens: 25,
      store: true // Enable storing in OpenAI system
    });
    
    const responseContent = response.choices[0].message.content;
    console.log('[TEST API] Response received:', responseContent);
    
    // Send response with test results
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'success',
      message: 'OpenAI API connection test successful',
      response: responseContent,
      model: model,
      hasAPIKey: !!apiKey,
      apiKeyHint: apiKey ? apiKey.substring(0, 5) + '...' : 'not set'
    }));
  } catch (error) {
    console.error('[TEST API] Error calling OpenAI API:', error);
    
    res.statusCode = 500;
    res.end(JSON.stringify({ 
      error: 'Error calling OpenAI API',
      details: error.message,
      hasAPIKey: !!apiKey,
      apiKeyHint: apiKey ? apiKey.substring(0, 5) + '...' : 'not set'
    }));
  }
};