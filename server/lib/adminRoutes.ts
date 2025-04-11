/**
 * Admin Routes for AI Service Management
 * 
 * This module provides admin routes for controlling AI service behavior,
 * including feature flags, cache management, and service diagnostics.
 */

import { Express, Request, Response } from 'express';
import { isAuthenticated, isAdmin } from '../auth';
import { 
  aiFeatureFlags, 
  updateFeatureFlags, 
  clearResponseCache, 
  getCacheStats 
} from './aiService';
import { z } from 'zod';

/**
 * Register admin routes for AI service management
 */
export function registerAdminRoutes(app: Express): void {
  // Get AI service status
  app.get("/api/admin/ai-service/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const cacheStats = await getCacheStats();
      res.json({
        featureFlags: aiFeatureFlags,
        cacheStats
      });
    } catch (error) {
      console.error("Error getting AI service status:", error);
      res.status(500).json({ 
        message: "Error getting AI service status" 
      });
    }
  });

  // Update feature flags
  app.post("/api/admin/ai-service/feature-flags", isAuthenticated, isAdmin, (req: Request, res: Response) => {
    try {
      // Validate input
      const schema = z.object({
        featureFlags: z.record(z.boolean())
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid feature flags", 
          errors: parsed.error.errors 
        });
      }

      // Update flags
      const updatedFlags = updateFeatureFlags(parsed.data.featureFlags);
      res.json({
        success: true,
        featureFlags: updatedFlags
      });
    } catch (error) {
      console.error("Error updating feature flags:", error);
      res.status(500).json({ 
        message: "Error updating feature flags" 
      });
    }
  });

  // Clear AI response cache
  app.post("/api/admin/ai-service/clear-cache", isAuthenticated, isAdmin, (req: Request, res: Response) => {
    try {
      const cacheStats = getCacheStats();
      clearResponseCache();
      res.json({
        success: true,
        message: `Cache cleared successfully (${cacheStats.size} entries removed)`
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ 
        message: "Error clearing cache" 
      });
    }
  });
}