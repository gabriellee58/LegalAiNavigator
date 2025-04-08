import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { logInfo, logError, logRequest } from "./utils/logger";
import { errorHandler, setupUncaughtExceptionHandling } from "./utils/errorHandler";
import { db } from "./db";
import { enhanceDbClient } from "./utils/dbMiddleware";

// Setup global error handlers for unhandled exceptions
setupUncaughtExceptionHandling();

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logInfo(`Server started and listening on port ${port}`);
  });
})();
