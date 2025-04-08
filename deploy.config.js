/**
 * Deployment Configuration File
 * 
 * This file contains configuration settings for different deployment environments.
 * It's used by the deployment scripts to properly configure the application for each environment.
 */

module.exports = {
  // Production Environment
  production: {
    // Server configuration
    port: 80,
    host: '0.0.0.0',
    
    // Database settings
    database: {
      maxConnections: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    
    // Logging configuration
    logging: {
      level: 'info',
      files: [
        { level: 'error', path: './logs/error.log' },
        { level: 'info', path: './logs/application.log' }
      ],
      rotation: {
        maxSize: '10m',
        maxFiles: 5
      }
    },
    
    // Security settings
    security: {
      rateLimiting: {
        enabled: true,
        maxRequests: 200,  // requests per windowMs
        windowMs: 60000,   // 1 minute
      },
      helmet: {
        contentSecurityPolicy: true,
        xssFilter: true,
      },
      cors: {
        origin: 'https://legalai.yourdomain.com', // Update with your production domain
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      }
    },
    
    // Backup configuration
    backups: {
      enabled: true,
      frequency: 'daily',  // 'hourly', 'daily', 'weekly'
      retentionDays: 30,
      storageLocation: './backups'
    },
    
    // Cache settings
    cache: {
      enabled: true,
      queryTTL: 300,        // seconds
      staticTTL: 86400      // seconds
    },
    
    // Performance settings
    performance: {
      compression: true,
      minify: true
    }
  },
  
  // Staging Environment
  staging: {
    port: 8080,
    host: '0.0.0.0',
    
    database: {
      maxConnections: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    
    logging: {
      level: 'debug',
      files: [
        { level: 'error', path: './logs/error.log' },
        { level: 'debug', path: './logs/application.log' }
      ],
      rotation: {
        maxSize: '10m',
        maxFiles: 3
      }
    },
    
    security: {
      rateLimiting: {
        enabled: true,
        maxRequests: 300,
        windowMs: 60000,
      },
      helmet: {
        contentSecurityPolicy: true,
        xssFilter: true,
      },
      cors: {
        origin: 'https://staging.legalai.yourdomain.com', // Update with your staging domain
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      }
    },
    
    backups: {
      enabled: true,
      frequency: 'daily',
      retentionDays: 7,
      storageLocation: './backups'
    },
    
    cache: {
      enabled: true,
      queryTTL: 120,
      staticTTL: 3600
    },
    
    performance: {
      compression: true,
      minify: true
    }
  },
  
  // Development Environment (local)
  development: {
    port: 5000,
    host: '0.0.0.0',
    
    database: {
      maxConnections: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    
    logging: {
      level: 'debug',
      files: [
        { level: 'error', path: './logs/error.log' },
        { level: 'debug', path: './logs/application.log' }
      ],
      rotation: {
        maxSize: '5m',
        maxFiles: 1
      }
    },
    
    security: {
      rateLimiting: {
        enabled: false
      },
      helmet: {
        contentSecurityPolicy: false,
        xssFilter: true,
      },
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      }
    },
    
    backups: {
      enabled: false
    },
    
    cache: {
      enabled: false
    },
    
    performance: {
      compression: false,
      minify: false
    }
  }
};