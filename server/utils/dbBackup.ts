import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { config } from '../config';
import { logger } from './logger';

// Convert exec to promise-based
const execPromise = util.promisify(exec);

// Database backup configuration
interface BackupConfig {
  backupDir: string;
  retentionDays: number;
  pgDumpPath: string;
  frequency: string; // 'daily' | 'hourly' | 'weekly'
}

// Parse DATABASE_URL to extract connection info
function parseDbUrl(url: string) {
  try {
    const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const matches = url.match(regex);
    
    if (!matches || matches.length < 6) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    return {
      user: matches[1],
      password: matches[2],
      host: matches[3],
      port: matches[4],
      database: matches[5],
    };
  } catch (error) {
    logger.error('[dbBackup] Failed to parse DATABASE_URL');
    throw error;
  }
}

/**
 * Database backup manager
 * - Creates scheduled backups
 * - Manages backup retention
 * - Provides restore capabilities
 */
export class DbBackupManager {
  private config: BackupConfig;
  private timer?: NodeJS.Timeout;
  
  constructor() {
    // Initialize backup directory
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    this.config = {
      backupDir,
      retentionDays: config.BACKUP_RETENTION_DAYS || 7,
      pgDumpPath: 'pg_dump', // Assumes pg_dump is in PATH
      frequency: config.BACKUP_FREQUENCY || 'daily',
    };
    
    logger.info(`[dbBackup] Initialized with backup directory: ${this.config.backupDir}`);
    logger.info(`[dbBackup] Backup retention: ${this.config.retentionDays} days, frequency: ${this.config.frequency}`);
  }
  
  /**
   * Starts scheduled backups based on configured frequency
   */
  startScheduledBackups(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // Determine interval in milliseconds
    let intervalMs: number;
    switch (this.config.frequency) {
      case 'hourly':
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'daily':
      default:
        intervalMs = 24 * 60 * 60 * 1000; // 24 hours
    }
    
    // Run initial backup
    this.createBackup().catch(err => {
      logger.error(`[dbBackup] Initial backup failed: ${err.message}`);
    });
    
    // Schedule regular backups
    this.timer = setInterval(() => {
      this.createBackup().catch(err => {
        logger.error(`[dbBackup] Scheduled backup failed: ${err.message}`);
      });
    }, intervalMs);
    
    logger.info(`[dbBackup] Scheduled backups started (every ${this.config.frequency})`);
  }
  
  /**
   * Stops scheduled backups
   */
  stopScheduledBackups(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
      logger.info('[dbBackup] Scheduled backups stopped');
    }
  }
  
  /**
   * Creates a database backup using pg_dump
   * @returns Promise resolving to the backup file path
   */
  async createBackup(): Promise<string> {
    try {
      // Generate timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql`;
      const filePath = path.join(this.config.backupDir, filename);
      
      // Get database connection info
      const dbInfo = parseDbUrl(config.DATABASE_URL);
      
      // Build pg_dump command with environment variables for credentials
      const cmd = `PGPASSWORD=${dbInfo.password} ${this.config.pgDumpPath} -h ${dbInfo.host} -p ${dbInfo.port} -U ${dbInfo.user} -d ${dbInfo.database} -f ${filePath}`;
      
      logger.info(`[dbBackup] Creating backup: ${filename}`);
      await execPromise(cmd);
      
      // Check if backup file was created
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        logger.info(`[dbBackup] Backup created successfully: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Clean up old backups
        await this.cleanupOldBackups();
        
        return filePath;
      } else {
        throw new Error('Backup file was not created');
      }
    } catch (error: any) {
      logger.error(`[dbBackup] Backup creation failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Lists all available backups
   * @returns Array of backup file information
   */
  listBackups(): { filename: string; date: Date; size: number }[] {
    try {
      const files = fs.readdirSync(this.config.backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(filename => {
          const filePath = path.join(this.config.backupDir, filename);
          const stats = fs.statSync(filePath);
          
          return {
            filename,
            date: stats.mtime,
            size: stats.size,
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort newest first
      
      return files;
    } catch (error: any) {
      logger.error(`[dbBackup] Failed to list backups: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Restores the database from a specified backup file
   * @param filename The backup file to restore from
   * @returns Promise that resolves when restore is complete
   */
  async restoreFromBackup(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.config.backupDir, filename);
      
      // Verify backup file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file not found: ${filename}`);
      }
      
      // Get database connection info
      const dbInfo = parseDbUrl(config.DATABASE_URL);
      
      // Build psql command for restoration
      const cmd = `PGPASSWORD=${dbInfo.password} psql -h ${dbInfo.host} -p ${dbInfo.port} -U ${dbInfo.user} -d ${dbInfo.database} -f ${filePath}`;
      
      logger.info(`[dbBackup] Restoring from backup: ${filename}`);
      await execPromise(cmd);
      
      logger.info(`[dbBackup] Database restored successfully from: ${filename}`);
    } catch (error: any) {
      logger.error(`[dbBackup] Restore failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cleans up backups older than the retention period
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const files = this.listBackups();
      const oldFiles = files.filter(file => file.date < cutoffDate);
      
      if (oldFiles.length > 0) {
        logger.info(`[dbBackup] Cleaning up ${oldFiles.length} old backups`);
        
        for (const file of oldFiles) {
          const filePath = path.join(this.config.backupDir, file.filename);
          fs.unlinkSync(filePath);
          logger.debug(`[dbBackup] Deleted old backup: ${file.filename}`);
        }
      }
    } catch (error: any) {
      logger.error(`[dbBackup] Cleanup failed: ${error.message}`);
    }
  }
}

// Create and export singleton instance
export const dbBackupManager = new DbBackupManager();