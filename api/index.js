// Simple Vercel serverless function - test first
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }
  
  console.log('🔵 Request:', req.method, req.url);
  
  // Test endpoint
  if (req.url.includes('/test')) {
    return res.status(200).json({
      message: 'API is working!',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      url: req.url,
      method: req.method
    });
  }
  
  // Health endpoint
  if (req.url.includes('/health')) {
    return res.status(200).json({
      status: 'ok',
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
  }
  
  // For other endpoints, return message
  return res.status(200).json({
    message: 'API loaded',
    url: req.url,
    method: req.method,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
};
