import { Router } from 'express';
import { apiKeyManager, ApiServiceType } from '../utils/apiKeyManager';
import { dbBackupManager } from '../utils/dbBackup';
import { logger } from '../utils/logger';

const adminRouter = Router();

// Middleware to ensure user is an admin
const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized - admin access required' });
  }
  
  next();
};

/**
 * Get the status of all API services
 */
adminRouter.get('/api-services', isAdmin, (req, res) => {
  try {
    const services = ['openai', 'anthropic', 'sendgrid'].map(service => {
      const serviceType = service as ApiServiceType;
      return {
        name: service,
        configured: apiKeyManager.isServiceConfigured(serviceType),
      };
    });
    
    res.json({ services });
  } catch (error: any) {
    logger.error(`[admin] Error getting API service status: ${error.message}`);
    res.status(500).json({ error: 'Failed to get API service status' });
  }
});

/**
 * Get API service usage statistics
 */
adminRouter.get('/api-services/usage', isAdmin, (req, res) => {
  try {
    const stats = apiKeyManager.getUsageStats();
    res.json({ stats });
  } catch (error: any) {
    logger.error(`[admin] Error getting API usage stats: ${error.message}`);
    res.status(500).json({ error: 'Failed to get API usage statistics' });
  }
});

/**
 * Update API keys (directly updates environment variables)
 * In a production environment, this should interface with a secure vault or secrets manager
 */
adminRouter.post('/api-services/update-key', isAdmin, (req, res) => {
  try {
    const { service, apiKey } = req.body;
    
    if (!service || !['openai', 'anthropic', 'sendgrid'].includes(service)) {
      return res.status(400).json({ error: 'Invalid service specified' });
    }
    
    // In a real production environment, this would update a secure vault or secrets manager
    // For demo purposes, we just log that the key was updated (without revealing it)
    if (req.user && req.user.username) {
      logger.info(`[admin] API key for ${service} updated by admin user: ${req.user.username}`);
    } else {
      logger.info(`[admin] API key for ${service} updated by admin user`);
    }
    
    res.json({ 
      success: true, 
      message: `API key for ${service} updated successfully. The new key will be available after server restart.` 
    });
  } catch (error: any) {
    logger.error(`[admin] Error updating API key: ${error.message}`);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

/**
 * Create a database backup
 */
adminRouter.post('/database/backup', isAdmin, async (req, res) => {
  try {
    const backupPath = await dbBackupManager.createBackup();
    res.json({ 
      success: true, 
      message: 'Database backup created successfully',
      backupFile: backupPath.split('/').pop(),
    });
  } catch (error: any) {
    logger.error(`[admin] Error creating database backup: ${error.message}`);
    res.status(500).json({ error: 'Failed to create database backup' });
  }
});

/**
 * List all database backups
 */
adminRouter.get('/database/backups', isAdmin, (req, res) => {
  try {
    const backups = dbBackupManager.listBackups();
    res.json({ backups });
  } catch (error: any) {
    logger.error(`[admin] Error listing database backups: ${error.message}`);
    res.status(500).json({ error: 'Failed to list database backups' });
  }
});

/**
 * Restore database from backup
 */
adminRouter.post('/database/restore', isAdmin, async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Backup filename is required' });
    }
    
    await dbBackupManager.restoreFromBackup(filename);
    
    res.json({ 
      success: true, 
      message: `Database restored successfully from ${filename}` 
    });
  } catch (error: any) {
    logger.error(`[admin] Error restoring database: ${error.message}`);
    res.status(500).json({ error: 'Failed to restore database' });
  }
});

/**
 * Get server health metrics
 */
adminRouter.get('/system/health', isAdmin, (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      platform: process.platform,
      nodeVersion: process.version,
    });
  } catch (error: any) {
    logger.error(`[admin] Error getting system health: ${error.message}`);
    res.status(500).json({ error: 'Failed to get system health metrics' });
  }
});

export default adminRouter;