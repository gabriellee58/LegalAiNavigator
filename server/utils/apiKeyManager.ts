import { config } from '../config';
import { logger } from './logger';

// Types of supported API services
export type ApiServiceType = 'openai' | 'anthropic' | 'sendgrid';

/**
 * A secure utility for managing and accessing API keys
 * - Provides controlled access to API keys
 * - Logs key usage attempts
 * - Checks for key availability
 * - Supports key rotation (future)
 */
class ApiKeyManager {
  private keyMap: Map<ApiServiceType, string | undefined>;
  private keyUsageStats: Map<ApiServiceType, number>;
  
  constructor() {
    // Initialize with keys from environment
    this.keyMap = new Map([
      ['openai', config.OPENAI_API_KEY],
      ['anthropic', config.ANTHROPIC_API_KEY],
      ['sendgrid', config.SENDGRID_API_KEY],
    ]);
    
    // Initialize usage tracking
    this.keyUsageStats = new Map([
      ['openai', 0],
      ['anthropic', 0],
      ['sendgrid', 0],
    ]);
    
    // Log initial configuration
    this.logConfiguration();
  }
  
  /**
   * Gets the API key for a specified service
   * @param service The API service type
   * @returns The API key or undefined if not available
   */
  getKey(service: ApiServiceType): string | undefined {
    const key = this.keyMap.get(service);
    
    // Log access attempt (but not the key itself)
    if (key) {
      this.keyUsageStats.set(service, (this.keyUsageStats.get(service) || 0) + 1);
      logger.debug(`[apiKeyManager] API key for ${service} accessed successfully.`);
      return key;
    } else {
      logger.warn(`[apiKeyManager] Attempted to access API key for ${service}, but it's not configured.`);
      return undefined;
    }
  }
  
  /**
   * Checks if a service has a configured API key
   * @param service The API service to check
   * @returns True if the service has a configured key
   */
  isServiceConfigured(service: ApiServiceType): boolean {
    return !!this.keyMap.get(service);
  }
  
  /**
   * Gets a list of all configured services
   * @returns Array of service names that have API keys configured
   */
  getConfiguredServices(): ApiServiceType[] {
    return Array.from(this.keyMap.entries())
      .filter(([_, key]) => !!key)
      .map(([service]) => service);
  }
  
  /**
   * Logs the current API key configuration (without exposing the keys)
   */
  private logConfiguration(): void {
    const configuredServices = this.getConfiguredServices();
    logger.info(`[apiKeyManager] Configured API services: ${configuredServices.join(', ') || 'None'}`);
    
    // Warn about missing critical services
    const criticalServices: ApiServiceType[] = ['openai', 'anthropic'];
    const missingCritical = criticalServices.filter(service => !this.isServiceConfigured(service));
    
    if (missingCritical.length > 0) {
      logger.warn(`[apiKeyManager] Missing API keys for critical services: ${missingCritical.join(', ')}`);
    }
  }
  
  /**
   * Gets usage statistics for API keys
   * @returns Object with usage counts by service
   */
  getUsageStats() {
    return Object.fromEntries(this.keyUsageStats.entries());
  }
}

// Export a singleton instance
export const apiKeyManager = new ApiKeyManager();