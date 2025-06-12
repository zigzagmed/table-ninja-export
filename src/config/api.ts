
// API Configuration
// Update these values to match your Python backend setup

export const API_CONFIG = {
  // Base URL for your Python backend API
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  
  // Timeout for API requests (in milliseconds)
  timeout: 30000,
  
  // Retry configuration
  retryAttempts: 2,
  retryDelay: 1000,
  
  // Enable/disable fallback to demo data when API is unavailable
  useFallbackData: true,
  
  // Expected API endpoints (for documentation)
  endpoints: {
    runRegression: '/regression/run',
    getRegression: '/regression/:id',
    listRegressions: '/regression/list',
    deleteRegression: '/regression/:id',
  }
};

// Example Python Flask/FastAPI endpoints your backend should implement:
/*
POST /api/regression/run
Body: {
  "dependentVariable": "realcons",
  "independentVariables": ["realgovt"],
  "data": [...],
  "modelType": "OLS",
  "options": { "includeIntercept": true, "confidenceLevel": 0.95 }
}

GET /api/regression/:id
Returns: RegressionResponse object

GET /api/regression/list
Returns: Array of regression summaries

DELETE /api/regression/:id
Returns: { "success": true }
*/
