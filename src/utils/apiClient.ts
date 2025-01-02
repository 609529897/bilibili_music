interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export class ApiClient {
  private static defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000
  };

  static async request<T>(
    apiCall: () => Promise<T>, 
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await Promise.race<T>([
          apiCall(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt === retryConfig.maxRetries) break;
        
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt),
          retryConfig.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
} 