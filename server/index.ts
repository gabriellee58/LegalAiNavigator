import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { logger, logInfo, logError, logRequest } from "./utils/logger";
import { errorHandler, setupUncaughtExceptionHandling } from "./utils/errorHandler";
import { db } from "./db";
import { enhanceDbClient } from "./utils/dbMiddleware";
import { config, initializeConfig } from "./config";
import { apiKeyManager } from "./utils/apiKeyManager";
import { dbBackupManager } from "./utils/dbBackup";

// Setup global error handlers for unhandled exceptions
setupUncaughtExceptionHandling();

// Initialize configuration
initializeConfig();

// Enhance database client with logging and error handling
enhanceDbClient(db);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture JSON responses for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log completed requests
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      logRequest(req.method, path, res.statusCode, duration, capturedJsonResponse);
    }
  });

  next();
});

// Add endpoint for client-side error logging
app.post('/api/log-client-error', (req, res) => {
  try {
    const { error, url, timestamp } = req.body;
    logError(`Client error at ${url}: ${error}`, 'client');
    res.status(200).send('Error logged');
  } catch (err) {
    // Don't let client logging failures disrupt the app
    res.status(500).send('Failed to log error');
  }
});

(async () => {
  // Initialize database and create tables
  try {
    // Run database migrations first
    const { runDatabaseMigrations } = await import("./db-migrate");
    logInfo("Running database migrations...");
    await runDatabaseMigrations();
    
    // Import here to avoid circular dependencies
    const { storage } = await import("./storage");
    logInfo("Initializing database and creating default templates...");
    await storage.initializeDefaultDocumentTemplates();
    logInfo("Initializing legal domains and knowledge base...");
    await storage.initializeLegalDomains();
    logInfo("Database initialization completed");
  } catch (error) {
    logError(`Database initialization error: ${(error as Error).message}`);
    console.error(error);
  }

  const server = await registerRoutes(app);

  // Global error handler middleware
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get port from configuration or use default 5000
  // This serves both the API and the client
  const port = config.PORT || 5000; // Changed back to 5000 to match workflow configuration
  server.listen({
    port,
    host: config.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
    reusePort: true,
  }, () => {
    logInfo(`Server started in ${config.NODE_ENV} mode and listening on port ${port}`);
    
    // Start database backup scheduler in production mode
    if (config.NODE_ENV === 'production' && config.BACKUP_FREQUENCY !== 'none') {
      dbBackupManager.startScheduledBackups();
      logInfo(`Database backups scheduled (${config.BACKUP_FREQUENCY})`);
    }
  });
})();
