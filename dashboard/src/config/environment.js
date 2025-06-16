// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const isGitHubPages = window.location.hostname === 'howard768.github.io';

const config = {
  // API URLs
  API_BASE_URL: isGitHubPages 
    ? 'https://priorai-api.yourdomain.com' // Update this when you have a hosted backend
    : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'),
  
  AI_SERVICE_URL: isGitHubPages
    ? 'https://priorai-ai.yourdomain.com' // Update this when you have a hosted backend
    : (process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3001'),
  
  // Feature flags
  USE_MOCK_DATA: isGitHubPages, // Use mock data on GitHub Pages
  ENABLE_ANALYTICS: isProduction && !isGitHubPages,
  
  // Demo mode
  IS_DEMO: isGitHubPages,
  DEMO_MESSAGE: 'This is a demo version. Backend services are not connected.',
};

export default config; 