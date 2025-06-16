/**
 * Retry Handler with Exponential Backoff and Circuit Breaker
 * Provides robust error handling for web scraping operations
 */

class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 30000; // 30 seconds
    this.exponentialBase = options.exponentialBase || 2;
    this.jitter = options.jitter || true;
    this.retryableErrors = options.retryableErrors || [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'EPIPE',
      'EHOSTDOWN',
      'EHOSTUNREACH',
      'EAI_AGAIN'
    ];
    this.retryableStatusCodes = options.retryableStatusCodes || [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
      520, // Web Server Returns Unknown Error
      521, // Web Server Is Down
      522, // Connection Timed Out
      524  // A Timeout Occurred
    ];
  }

  /**
   * Execute function with retry logic
   * @param {Function} fn - Function to execute
   * @param {Object} context - Context for logging
   * @returns {Promise} Result of function execution
   */
  async execute(fn, context = {}) {
    let lastError;
    let attempt = 0;

    for (attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await fn();
        
        // Log successful execution
        if (attempt > 0) {
          console.log(`✅ Retry successful after ${attempt} attempts`, {
            context,
            totalTime: Date.now() - startTime,
            attempt: attempt + 1
          });
        }

        return result;
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          console.error(`❌ Non-retryable error encountered`, {
            context,
            error: error.message,
            code: error.code,
            statusCode: error.response?.status,
            attempt: attempt + 1
          });
          throw error;
        }

        // Don't delay on the last attempt
        if (attempt < this.maxRetries) {
          const delay = this.calculateDelay(attempt);
          console.warn(`⚠️ Retryable error on attempt ${attempt + 1}/${this.maxRetries + 1}`, {
            context,
            error: error.message,
            code: error.code,
            statusCode: error.response?.status,
            retryAfter: delay,
            nextAttempt: attempt + 2
          });
          
          await this.delay(delay);
        }
      }
    }

    // All retries exhausted
    console.error(`💥 All retry attempts exhausted`, {
      context,
      totalAttempts: attempt,
      finalError: lastError.message,
      code: lastError.code,
      statusCode: lastError.response?.status
    });

    throw new Error(`Operation failed after ${this.maxRetries + 1} attempts: ${lastError.message}`);
  }

  /**
   * Check if error should be retried
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError(error) {
    // Check error codes
    if (error.code && this.retryableErrors.includes(error.code)) {
      return true;
    }

    // Check HTTP status codes
    if (error.response?.status && this.retryableStatusCodes.includes(error.response.status)) {
      return true;
    }

    // Check for rate limiting
    if (error.response?.status === 429) {
      return true;
    }

    // Check for timeout errors
    if (error.message?.toLowerCase().includes('timeout')) {
      return true;
    }

    // Check for connection errors
    if (error.message?.toLowerCase().includes('connection')) {
      return true;
    }

    return false;
  }

  /**
   * Calculate delay for next retry attempt
   * @param {number} attempt - Current attempt number (0-based)
   * @returns {number} Delay in milliseconds
   */
  calculateDelay(attempt) {
    let delay = this.baseDelay * Math.pow(this.exponentialBase, attempt);
    
    // Cap the delay
    delay = Math.min(delay, this.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (this.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily stopping requests to failing services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.monitoringPeriod = options.monitoringPeriod || 60000; // 1 minute
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
    this.recentResults = [];
  }

  /**
   * Execute function through circuit breaker
   * @param {Function} fn - Function to execute
   * @param {string} serviceId - Identifier for the service
   * @returns {Promise} Result of function execution
   */
  async execute(fn, serviceId = 'unknown') {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker OPEN for ${serviceId}. Next attempt in ${this.nextAttempt - Date.now()}ms`);
      }
      
      // Try to close the circuit
      this.state = 'HALF_OPEN';
      console.log(`🔄 Circuit breaker HALF_OPEN for ${serviceId}`);
    }

    try {
      const result = await fn();
      this.onSuccess(serviceId);
      return result;
    } catch (error) {
      this.onFailure(serviceId, error);
      throw error;
    }
  }

  /**
   * Handle successful execution
   * @param {string} serviceId - Service identifier
   */
  onSuccess(serviceId) {
    this.failureCount = 0;
    this.successCount++;
    this.recordResult(true);

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`✅ Circuit breaker CLOSED for ${serviceId}`);
    }
  }

  /**
   * Handle failed execution
   * @param {string} serviceId - Service identifier
   * @param {Error} error - Error that occurred
   */
  onFailure(serviceId, error) {
    this.failureCount++;
    this.recordResult(false);
    
    console.warn(`⚠️ Circuit breaker failure ${this.failureCount}/${this.failureThreshold} for ${serviceId}`, {
      error: error.message,
      state: this.state
    });

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.error(`🚫 Circuit breaker OPEN for ${serviceId}. Reset in ${this.resetTimeout}ms`);
    }
  }

  /**
   * Record result for monitoring
   * @param {boolean} success - Whether the result was successful
   */
  recordResult(success) {
    const now = Date.now();
    this.recentResults.push({ success, timestamp: now });
    
    // Clean old results
    const cutoff = now - this.monitoringPeriod;
    this.recentResults = this.recentResults.filter(result => result.timestamp > cutoff);
  }

  /**
   * Get circuit breaker statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const totalResults = this.recentResults.length;
    const successResults = this.recentResults.filter(r => r.success).length;
    const successRate = totalResults > 0 ? (successResults / totalResults) * 100 : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      successRate: successRate.toFixed(2) + '%',
      totalRecentRequests: totalResults,
      nextAttemptIn: this.state === 'OPEN' ? Math.max(0, this.nextAttempt - Date.now()) : 0
    };
  }
}

/**
 * Enhanced Error Handler with Context
 * Provides structured error logging and context preservation
 */
class ErrorHandler {
  constructor(options = {}) {
    this.includeStack = options.includeStack || false;
    this.maxContextDepth = options.maxContextDepth || 3;
  }

  /**
   * Log error with context
   * @param {Error} error - Error to log
   * @param {Object} context - Additional context
   * @param {string} level - Log level (error, warn, info)
   */
  logError(error, context = {}, level = 'error') {
    const errorInfo = {
      message: error.message,
      name: error.name,
      code: error.code,
      statusCode: error.response?.status,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context)
    };

    if (this.includeStack) {
      errorInfo.stack = error.stack;
    }

    // Add HTTP response details if available
    if (error.response) {
      errorInfo.responseDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        url: error.response.config?.url
      };
    }

    console[level](`🔥 Error Handler:`, errorInfo);
    
    return errorInfo;
  }

  /**
   * Sanitize context object to prevent circular references
   * @param {Object} context - Context to sanitize
   * @returns {Object} Sanitized context
   */
  sanitizeContext(context, depth = 0) {
    if (depth > this.maxContextDepth) {
      return '[Max Depth Reached]';
    }

    if (context === null || context === undefined) {
      return context;
    }

    if (typeof context !== 'object') {
      return context;
    }

    if (context instanceof Error) {
      return {
        message: context.message,
        name: context.name,
        code: context.code
      };
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(context)) {
      try {
        if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeContext(value, depth + 1);
        } else {
          sanitized[key] = value;
        }
      } catch (err) {
        sanitized[key] = '[Circular Reference]';
      }
    }

    return sanitized;
  }

  /**
   * Create structured error for API responses
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   * @returns {Object} Structured error object
   */
  createApiError(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = {}) {
    return {
      error: {
        message,
        code,
        statusCode,
        timestamp: new Date().toISOString(),
        details
      }
    };
  }
}

module.exports = {
  RetryHandler,
  CircuitBreaker,
  ErrorHandler
}; 