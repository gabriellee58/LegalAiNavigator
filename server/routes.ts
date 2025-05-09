import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertResearchQuerySchema,
  insertGeneratedDocumentSchema,
  insertDisputeSchema,
  insertDisputePartySchema,
  insertMediationSessionSchema,
  insertMediationMessageSchema,
  insertSavedCitationSchema,
  insertResearchVisualizationSchema,
  insertUserFeedbackSchema
} from "@shared/schema";
import { z } from "zod";

// AI services
import { 
  generateAIResponse as generateDeepSeekResponse, 
  performLegalResearch as performDeepSeekResearch,
  analyzeContract,
  compareContracts,
  extractTextFromPdf
} from "./lib/deepseek";
import { mediationHandlers, generateWelcomeMessage, generateMediatorResponse, generateMediationSummary } from "./lib/mediationAI";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import multer from "multer";
import path from "path";
import { templateSources, importAndSaveTemplate } from "./lib/templateSources";
import { 
  analyzeLegalDocument
} from "./lib/anthropic";

// Enhanced AI services
import { generateChatResponse } from "./lib/aiService";
import { streamAIResponse } from "./lib/aiStreamService";
import { enhancedLegalResearch } from "./lib/researchService";
import { registerAdminRoutes } from "./lib/adminRoutes";
import complianceRouter from "./routes/compliance";
import courtProceduresRouter from "./routes/courtProcedures";
import userRouter from "./routes/user";
import docusealRouter from "./routes/docuseal";
import subscriptionRouter from "./routes/subscription";
import jurisdictionsRouter from "./routes/jurisdictions";
import { handleStripeWebhook } from "./routes/webhook";

// Set up multer for file uploads
const storage_config = multer.memoryStorage();
const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Unsupported file type. Only PDF, TXT, DOC and DOCX files are allowed.'));
    }
  }
});

// Define Google Auth schema
const googleAuthSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional().nullable(),
  photoURL: z.string().optional().nullable(),
  uid: z.string()
});

// Middleware is now imported from auth.ts, no need for duplicates

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Register admin routes for AI service management
  registerAdminRoutes(app);
  
  // Register user routes
  app.use('/api/user', userRouter);
  app.use('/api/docuseal', docusealRouter);
  app.use('/api/subscriptions', subscriptionRouter);
  app.use('/api/jurisdictions', jurisdictionsRouter);
  
  // Stripe webhook endpoint - raw body required for signature verification
  app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), handleStripeWebhook);
  
  // Health check endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
    // Check database connection
    let databaseStatus = false;
    try {
      // Perform a simple database query
      const result = await storage.checkDatabaseHealth();
      databaseStatus = result;
    } catch (error) {
      console.error("Health check - Database error:", error);
    }
    
    // Check AI service availability
    let aiServicesStatus = {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY
    };
    
    // Overall status - ok if database is available
    const status = databaseStatus ? "ok" : "degraded";
    
    res.json({
      status,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: databaseStatus,
        ai: aiServicesStatus,
        streaming: true // Always true since it's handled by the Node.js server
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Basic test endpoint - access via direct port to bypass Vite proxy
  app.get("/api/test-direct", (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      message: "This is a direct test response from the Express server",
      timestamp: new Date().toISOString(),
      services: {
        available: ["ai", "streaming", "database"]
      }
    }, null, 2));
  });
  
  // AI service test endpoint - does not require authentication
  app.post("/api/ai/test", async (req: Request, res: Response) => {
    try {
      const prompt = req.body.prompt || "Test the AI service by generating a brief response about Canadian law.";
      
      // More detailed logging of test request
      console.log("\n=== AI SERVICE TEST REQUEST ===");
      console.log(`Prompt: "${prompt}"`);
      
      // Attempt to get basic response from AI service
      const response = await generateChatResponse(prompt, {
        system: "You are a test assistant. Keep responses brief (1-2 sentences).",
        cacheKey: `test-${Date.now()}`, // Prevent caching for test endpoint
        logPrefix: "AI Test" 
      });
      
      // Log the full response for debugging
      console.log("\n=== AI SERVICE TEST RESPONSE ===");
      
      // Check if we received an error object from the enhanced error handling
      if (response && typeof response === 'object' && 'error' in response) {
        // Handle structured error response
        const errorObj = response as { error: boolean; message: string; errorType: string; recovery?: string };
        console.log(`Error response: Type=${errorObj.errorType}, Message="${errorObj.message}"`);
        console.log(`Recovery suggestion: "${errorObj.recovery || 'None provided'}"`);
        console.log("=====================================\n");
        
        // Return a user-friendly error response with recovery instructions
        const errorResult = {
          success: false,
          errorType: errorObj.errorType,
          message: errorObj.message,
          recovery: errorObj.recovery,
          timestamp: new Date().toISOString()
        };
        
        // Use a 200 status with error info in body, as this is a expected behavior
        res.json(errorResult);
        return errorResult;
      } else {
        // Handle normal string response
        console.log(`Full response: "${response}"`);
        console.log("=====================================\n");
        
        // Send the response to client
        const result = {
          success: true,
          prompt,
          response,
          timestamp: new Date().toISOString()
        };
        
        res.json(result);
        return result;
      }
    } catch (error) {
      console.error("\n=== AI SERVICE TEST ERROR ===");
      console.error(error);
      console.error("=====================================\n");
      
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      
      res.status(500).json(errorResult);
      return errorResult;
    }
  });

  // Google Authentication
  app.post("/api/google-auth", async (req: Request, res: Response) => {
    try {
      const parsed = googleAuthSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid Google auth data",
          errors: parsed.error.errors
        });
      }

      const { email, displayName, uid } = parsed.data;
      const fullName = displayName || email.split('@')[0];

      // Check if user already exists by Firebase UID
      let user = await storage.getUserByFirebaseUid(uid);
      
      if (!user) {
        // Not found by Firebase UID, try to find by email/username
        user = await storage.getUserByUsername(email);
        
        if (!user) {
          // Create a new user if not found at all
          const randomPassword = Math.random().toString(36).slice(-10) + 
                                Math.random().toString(36).slice(-10);
          
          user = await storage.createUser({
            username: email,
            password: randomPassword, // Will be hashed by storage
            fullName: fullName,
            preferredLanguage: "en",
            firebaseUid: uid
          });
        } else {
          // User found by email but no Firebase UID, update with the Firebase UID
          user = await storage.updateUser(user.id, {
            firebaseUid: uid,
            fullName: user.fullName || fullName
          });
        }
      }

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after Google auth:", err);
          return res.status(500).json({ message: "Login failed after Google auth" });
        }
        
        try {
          // Create a safe user object without circular references
          const safeUser = {
            id: user.id,
            username: user.username,
            fullName: user.fullName || null,
            preferredLanguage: user.preferredLanguage || "en"
          };
          
          return res.status(200).json(safeUser);
        } catch (jsonError) {
          console.error("Error serializing user in Google auth:", jsonError);
          return res.status(500).json({ message: "Error creating user session" });
        }
      });
    } catch (error) {
      console.error("Google authentication error:", error);
      res.status(500).json({ 
        message: "Error processing Google authentication",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Chat message routes
  app.get("/api/chat/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get userId from authenticated user session
      const userId = req.user!.id; // Using non-null assertion as we already checked in middleware
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving chat messages" });
    }
  });

  app.post("/api/chat/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate message data
      const messageSchema = insertChatMessageSchema.omit({ userId: true });
      const parsed = messageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      
      // Save the user message with authenticated user ID
      const userMessage = await storage.createChatMessage({
        ...parsed.data,
        userId: req.user!.id
      });
      
      // Generate AI response using enhanced AI service with built-in fallback
      const aiResponse = await generateChatResponse(parsed.data.content, {
        system: `You are an AI legal assistant specialized in Canadian law. 
        Provide helpful, accurate information about Canadian legal topics. 
        Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
        Focus on Canadian legal frameworks, regulations, and precedents.
        Be respectful, concise, and easy to understand.
        Avoid excessive legalese, but maintain accuracy in legal concepts.`,
        cacheKey: `chat-${parsed.data.content.substring(0, 100)}`,
        logPrefix: "Chat API"
      });
      
      // Check if we received an error object from the enhanced error handling
      let aiContent: string;
      let aiErrorCode: string | null = null;
      
      if (aiResponse && typeof aiResponse === 'object' && 'error' in aiResponse) {
        // Handle structured error response with recovery info
        const errorObj = aiResponse as { error: boolean; message: string; errorType: string; recovery?: string };
        console.log(`AI Chat error: Type=${errorObj.errorType}, Message="${errorObj.message}"`);
        
        // Format a user-friendly error message
        aiContent = `${errorObj.message}\n\n${errorObj.recovery || 'Please try again later.'}`;
        aiErrorCode = errorObj.errorType;
      } else {
        // Normal string response
        aiContent = aiResponse as string;
      }
      
      // Save the AI message
      const aiMessage = await storage.createChatMessage({
        userId: req.user!.id,
        role: "assistant",
        content: aiContent,
        metadata: aiErrorCode ? { errorType: aiErrorCode } : undefined
      });
      
      res.status(201).json({ 
        userMessage, 
        aiMessage,
        error: aiErrorCode ? {
          type: aiErrorCode,
          retry: aiErrorCode === 'rate_limit' || aiErrorCode === 'timeout'
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating chat message" });
    }
  });
  
  // Stream chat responses (for real-time UI updates)
  app.post("/api/chat/stream", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate message data
      const messageSchema = z.object({
        content: z.string().min(1),
      });
      
      const parsed = messageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      
      // Save the user message
      await storage.createChatMessage({
        userId: req.user!.id,
        role: "user",
        content: parsed.data.content
      });
      
      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Start streaming the AI response
      await streamAIResponse(req, res);
      
    } catch (error) {
      console.error("Streaming chat error:", error);
      // If headers haven't been sent yet, send error response
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming chat response" });
      } else {
        // Otherwise, end the response with an error event
        res.write(`event: error\ndata: ${JSON.stringify({ message: "Error occurred during streaming" })}\n\n`);
        res.end();
      }
    }
  });

  // Document template routes
  app.get("/api/document-templates", async (req: Request, res: Response) => {
    try {
      const language = (req.query.language as string) || "en";
      const templateType = req.query.type as string;
      
      let templates;
      if (templateType) {
        // Add logging for debugging
        console.log(`Retrieving templates for type: ${templateType}, language: ${language}`);
        templates = await storage.getDocumentTemplatesByType(templateType, language);
      } else {
        templates = await storage.getDocumentTemplates(language);
      }
      
      if (!templates || templates.length === 0) {
        console.log(`No templates found for language: ${language}${templateType ? `, type: ${templateType}` : ''}`);
      }
      
      res.json(templates);
    } catch (error) {
      console.error('Error retrieving document templates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: "Error retrieving document templates", 
        details: errorMessage,
        language: req.query.language || "en",
        type: req.query.type || "all" 
      });
    }
  });

  app.get("/api/document-templates/:id", async (req: Request, res: Response) => {
    try {
      if (!req.params.id || isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ 
          message: "Invalid template ID", 
          details: "Template ID must be a valid number" 
        });
      }
      
      const id = parseInt(req.params.id);
      console.log(`Retrieving template with ID: ${id}`);
      
      const template = await storage.getDocumentTemplate(id);
      
      if (!template) {
        console.log(`Template with ID ${id} not found`);
        return res.status(404).json({ 
          message: "Template not found", 
          details: `No template exists with ID: ${id}`
        });
      }
      
      res.json(template);
    } catch (error) {
      console.error(`Error retrieving document template with ID ${req.params.id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: "Error retrieving document template", 
        details: errorMessage,
        templateId: req.params.id
      });
    }
  });

  // Generated document routes
  app.post("/api/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Log the incoming document creation request for debugging
      console.log("Document creation request received");
      
      // Validate document data without userId
      const documentSchema = insertGeneratedDocumentSchema.omit({ userId: true });
      const parsed = documentSchema.safeParse(req.body);
      
      if (!parsed.success) {
        console.error("Document validation error:", parsed.error);
        return res.status(400).json({ 
          message: "Invalid document data", 
          details: parsed.error.format()
        });
      }
      
      // Add authenticated user ID to the document data
      const document = await storage.createGeneratedDocument({
        ...parsed.data,
        userId: req.user!.id
      });
      
      console.log("Document created successfully with ID:", document.id);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error creating document", 
        error: errorMessage,
        errorType: error.constructor.name || "ServerError"
      });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get userId from authenticated user session
      const userId = req.user!.id;
      const documents = await storage.getGeneratedDocumentsByUserId(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving documents" });
    }
  });

  app.get("/api/documents/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getGeneratedDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Ensure the document belongs to the requesting user
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving document" });
    }
  });

  // Contract analysis with text input
  app.post("/api/analyze-contract", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractSchema = z.object({
        content: z.string().min(1),
        save: z.boolean().optional(),
        title: z.string().optional(),
        jurisdiction: z.string().optional(),
        contractType: z.string().optional()
      });
      
      const parsed = contractSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid contract data" });
      }
      
      // Analyze the contract with optional jurisdiction and contract type
      const analysisResult = await analyzeContract(
        parsed.data.content,
        parsed.data.jurisdiction || 'Canada',
        parsed.data.contractType || 'general'
      );
      
      // Save the analysis result if requested
      if (parsed.data.save && parsed.data.title) {
        const now = new Date();
        
        // Sanitize contract text to prevent encoding issues (remove null bytes)
        const sanitizedContractContent = parsed.data.content.replace(/\0/g, '');
        
        // Create trimmed version if content is too large
        const maxContentLength = 100000; // Reasonable max length for DB storage
        const trimmedContractContent = sanitizedContractContent.length > maxContentLength
          ? sanitizedContractContent.substring(0, maxContentLength) + "... [content truncated due to size]"
          : sanitizedContractContent;
        
        try {
          await storage.createContractAnalysis({
            userId: req.user!.id,
            contractContent: trimmedContractContent,
            contractTitle: parsed.data.title,
            score: analysisResult.score,
            riskLevel: analysisResult.riskLevel,
            analysisResults: analysisResult as any, // Converting to jsonb
            jurisdiction: parsed.data.jurisdiction || 'Canada',
            contractType: parsed.data.contractType || 'general',
            updatedAt: now,
            categories: analysisResult.clause_categories as any
          });
        } catch (saveError) {
          console.error("Failed to save contract analysis:", saveError);
          // Continue with response even if saving fails
        }
      }
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Contract analysis error:", error);
      res.status(500).json({ message: "Error analyzing contract" });
    }
  });
  
  // Contract analysis with file upload
  app.post("/api/analyze-contract/upload", isAuthenticated, upload.single('contractFile'), async (req: Request, res: Response) => {
    try {
      console.log("Contract analysis upload request received");
      
      if (!req.file) {
        console.error("No file received in upload request");
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Log file information for debugging
      console.log(`File received: ${req.file.originalname}, Size: ${req.file.size} bytes, Type: ${req.file.mimetype}`);
      
      // Extract parameters from the form data
      const title = req.body.title;
      const save = req.body.save === 'true';
      const jurisdiction = req.body.jurisdiction || 'Canada';
      const contractType = req.body.contractType || 'general';
      
      console.log(`Analysis parameters: Title: ${title}, Save: ${save}, Jurisdiction: ${jurisdiction}, Type: ${contractType}`);
      
      // Check file size
      if (req.file.size === 0) {
        console.error("Empty file uploaded (size is 0 bytes)");
        return res.status(400).json({ 
          message: "The uploaded file is empty and contains no content to analyze",
          details: "Please upload a file that contains text content"
        });
      }
      
      // Process the file based on its type
      let contractText = '';
      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
      
      console.log(`File details: Size: ${req.file.size} bytes, MIME type: ${req.file.mimetype}, Extension: ${fileExtension}`);
      
      // Use file extension as fallback for mimetype detection
      if (req.file.mimetype === 'application/pdf' || fileExtension === 'pdf') {
        try {
          // Extract text from PDF using enhanced extractor
          console.log("Processing PDF file...");
          const extractionResult = await extractTextFromPdf(req.file.buffer);
          
          if (!extractionResult.success) {
            console.error("PDF extraction failed:", extractionResult.errorDetails);
            return res.status(400).json({
              message: "Failed to extract meaningful text from PDF file",
              error: extractionResult.errorDetails || "Unknown extraction error",
              details: extractionResult.text,
              extractionInfo: {
                method: extractionResult.extractionMethod,
                usedFallback: extractionResult.usedFallbackMethod
              }
            });
          }
          
          // Log extraction details
          console.log(`PDF extraction stats: ${extractionResult.extractedPageCount || 0}/${extractionResult.pageCount || 0} pages, using ${extractionResult.extractionMethod} method`);
          
          if (extractionResult.truncated) {
            console.warn("PDF content was truncated due to size limits");
          }
          
          if (extractionResult.errorPages && extractionResult.errorPages.length > 0) {
            console.warn(`Had issues extracting ${extractionResult.errorPages.length} pages: ${extractionResult.errorPages.join(', ')}`);
          }
          
          contractText = extractionResult.text;
          console.log(`Extracted ${contractText.length} characters from PDF file`);
        } catch (pdfError) {
          const errorMessage = pdfError instanceof Error ? pdfError.message : String(pdfError);
          console.error("PDF extraction error:", errorMessage);
          return res.status(400).json({ 
            message: "Failed to extract text from PDF file",
            error: errorMessage,
            details: "The PDF file may be corrupted, password-protected, or contain only images without text"
          });
        }
      } else if (
        req.file.mimetype === 'text/plain' || 
        fileExtension === 'txt' ||
        req.file.mimetype === 'application/msword' || 
        fileExtension === 'doc' ||
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileExtension === 'docx'
      ) {
        try {
          // For text and Word files, convert buffer to string
          console.log(`Processing ${fileExtension || req.file.mimetype} file...`);
          contractText = req.file.buffer.toString('utf-8');
          console.log(`Extracted ${contractText.length} characters from ${fileExtension || req.file.mimetype} file`);
        } catch (textError) {
          const errorMessage = textError instanceof Error ? textError.message : String(textError);
          console.error("Text extraction error:", errorMessage);
          return res.status(400).json({ 
            message: "Failed to extract text from file",
            error: errorMessage
          });
        }
      } else {
        console.error(`Unsupported file type: ${req.file.mimetype}, Extension: ${fileExtension}`);
        return res.status(400).json({ 
          message: "Unsupported file type. Please upload a PDF, TXT, DOC, or DOCX file.",
          fileType: req.file.mimetype,
          extension: fileExtension
        });
      }
      
      if (!contractText || !contractText.trim()) {
        console.error("No meaningful text could be extracted from the file");
        return res.status(400).json({ 
          message: "Could not extract meaningful text from the uploaded file",
          details: "The file may be empty, corrupted, or contain non-textual content"
        });
      }
      
      // Validate text content is sufficient for analysis
      if (contractText.trim().length < 10) {
        console.error(`Extracted text is too short (${contractText.trim().length} characters)`);
        return res.status(400).json({
          message: "The uploaded file contains too little text to analyze",
          details: "Please upload a file with more substantial contract text",
          textLength: contractText.trim().length
        });
      }
      
      // Import the document chunker to process large text
      try {
        // Log token estimate
        const { estimateTokenCount } = await import('./lib/documentChunker');
        const estimatedTokens = estimateTokenCount(contractText);
        console.log(`Estimated tokens in contract: ${estimatedTokens}`);
      } catch (estimateError) {
        console.warn("Failed to estimate token count:", estimateError);
      }
      
      // Analyze the contract with enhanced error handling
      let analysisResult;
      try {
        analysisResult = await analyzeContract(contractText, jurisdiction, contractType);
        
        // Check if we received an error object from the enhanced AI service
        if (analysisResult && typeof analysisResult === 'object' && 'error' in analysisResult) {
          const errorObj = analysisResult as { error: boolean; message: string; errorType: string; recovery?: string };
          console.error(`Contract analysis error: Type=${errorObj.errorType}, Message="${errorObj.message}"`);
          
          // Convert to a user-friendly format that matches the expected contract analysis structure
          analysisResult = {
            risks: [{ 
              description: errorObj.message, 
              severity: "High", 
              recommendation: errorObj.recovery || "Please try again later",
              clause: "Unknown",
              issue: errorObj.errorType,
              category: "AI Service Error"
            }],
            suggestions: [],
            summary: `Error: ${errorObj.message}. ${errorObj.recovery || 'Please try again later.'}`,
            score: 0,
            riskLevel: "high",
            errorType: errorObj.errorType,
          };
        }
      } catch (analysisError) {
        console.error("Contract analysis failed, returning error result:", analysisError);
        
        // Check for token limit errors
        const errorMessage = analysisError instanceof Error ? analysisError.message : "Error analyzing contract";
        const isTokenLimitError = errorMessage.includes("Token limit exceeded") || 
                                 errorMessage.includes("maximum context length") ||
                                 errorMessage.includes("tokens. However, you requested");
        
        // Return a structured error response that matches the expected format
        if (isTokenLimitError) {
          // This is a token limit error, provide specific guidance
          analysisResult = {
            risks: [{ 
              description: "Contract too large for AI analysis", 
              severity: "High", 
              recommendation: "Please upload a smaller document, or manually extract the key sections of your contract",
              clause: "Document Size",
              issue: "Token limit exceeded",
              category: "File Size Error"
            }],
            suggestions: [],
            summary: "This contract exceeds our AI model's size limits. We recommend breaking it into smaller sections or using our extract key sections feature.",
            score: 0,
            riskLevel: "high",
            errorType: "token_limit_exceeded",
          };
        } else {
          // Generic error handling
          analysisResult = {
            risks: [{ 
              description: errorMessage, 
              severity: "High", 
              recommendation: "Please try again later or try with a smaller document",
              clause: "Unknown",
              issue: "Analysis service error",
              category: "Error"
            }],
            suggestions: [],
            summary: "An error occurred during contract analysis. This may be due to the size or complexity of the document.",
            score: 0,
            riskLevel: "high",
            errorType: "unknown_error",
          };
        }
      }
      
      // Save the analysis result if requested
      if (save && title && analysisResult.score !== undefined) {
        try {
          const now = new Date();
          
          // Sanitize contract text to prevent encoding issues (remove null bytes)
          const sanitizedContractText = contractText.replace(/\0/g, '');
          
          // Create trimmed version if content is too large
          const maxContentLength = 100000; // Reasonable max length for DB storage
          const trimmedContractText = sanitizedContractText.length > maxContentLength
            ? sanitizedContractText.substring(0, maxContentLength) + "... [content truncated due to size]"
            : sanitizedContractText;
          
          await storage.createContractAnalysis({
            userId: req.user!.id,
            contractContent: trimmedContractText,
            contractTitle: title,
            score: analysisResult.score || 0,
            riskLevel: analysisResult.riskLevel || "high",
            analysisResults: analysisResult as any,
            jurisdiction,
            contractType,
            fileName: req.file.originalname,
            updatedAt: now,
            categories: analysisResult.clause_categories as any
          });
        } catch (saveError) {
          console.error("Failed to save contract analysis:", saveError);
          // Continue with response even if saving fails
        }
      }
      
      // Include the extracted text in the response so client can use it for saving
      res.json({
        ...analysisResult,
        extractedText: contractText
      });
    } catch (error) {
      console.error("Contract file analysis error:", error);
      res.status(500).json({ 
        message: "Error analyzing contract file",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get saved contract analyses
  app.get("/api/contract-analyses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const analyses = await storage.getContractAnalysesByUserId(req.user!.id);
      res.json(analyses);
    } catch (error) {
      console.error("Contract analyses retrieval error:", error);
      res.status(500).json({ message: "Error retrieving contract analyses" });
    }
  });
  
  // Get a specific saved contract analysis
  app.get("/api/contract-analyses/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const analysis = await storage.getContractAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Contract analysis not found" });
      }
      
      // Ensure the analysis belongs to the requesting user
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Contract analysis retrieval error:", error);
      res.status(500).json({ message: "Error retrieving contract analysis" });
    }
  });
  
  // Create a contract analysis directly (for saving after analysis)
  app.post("/api/contract-analyses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const analysisSchema = z.object({
        title: z.string().min(1),
        contractContent: z.string().min(1),
        jurisdiction: z.string().optional().default('Canada'),
        contractType: z.string().optional().default('general'),
        analysisResults: z.any(),
      });
      
      const parsed = analysisSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid contract analysis data", errors: parsed.error.format() });
      }
      
      const data = parsed.data;
      const analysisResults = data.analysisResults;
      
      // Create new contract analysis record
      try {
        const now = new Date();
        
        // Sanitize contract text to prevent encoding issues
        const sanitizedContractContent = data.contractContent.replace(/\0/g, '');
        
        // Create trimmed version if content is too large
        const maxContentLength = 100000; // Reasonable max length for DB storage
        const trimmedContractContent = sanitizedContractContent.length > maxContentLength
          ? sanitizedContractContent.substring(0, maxContentLength) + "... [content truncated due to size]"
          : sanitizedContractContent;
        
        const newAnalysis = await storage.createContractAnalysis({
          userId: req.user!.id,
          contractContent: trimmedContractContent,
          contractTitle: data.title,
          score: analysisResults.score || 0,
          riskLevel: analysisResults.riskLevel || "high",
          analysisResults: analysisResults,
          jurisdiction: data.jurisdiction || 'Canada',
          contractType: data.contractType || 'general',
          updatedAt: now,
          categories: analysisResults.clause_categories || null
        });
        
        return res.status(201).json(newAnalysis);
      } catch (saveError) {
        console.error("Failed to save contract analysis:", saveError);
        return res.status(500).json({ message: "Error saving contract analysis" });
      }
    } catch (error) {
      console.error("Contract analysis creation error:", error);
      res.status(500).json({ message: "Error creating contract analysis" });
    }
  });

  // Contract comparison
  app.post("/api/compare-contracts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const comparisonSchema = z.object({
        firstContract: z.string().min(1),
        secondContract: z.string().min(1)
      });
      
      const parsed = comparisonSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid contract comparison data" });
      }
      
      // Import the document chunker to process large text
      try {
        // Log token estimates
        const { estimateTokenCount } = await import('./lib/documentChunker');
        const firstEstimatedTokens = estimateTokenCount(parsed.data.firstContract);
        const secondEstimatedTokens = estimateTokenCount(parsed.data.secondContract);
        
        console.log(`Estimated tokens in first contract: ${firstEstimatedTokens}`);
        console.log(`Estimated tokens in second contract: ${secondEstimatedTokens}`);
        console.log(`Total estimated tokens: ${firstEstimatedTokens + secondEstimatedTokens}`);
      } catch (estimateError) {
        console.warn("Failed to estimate token count:", estimateError);
      }
      
      // Try to compare the contracts with enhanced error handling
      let comparison;
      try {
        comparison = await compareContracts(
          parsed.data.firstContract,
          parsed.data.secondContract
        );
        
        // Check if we received an error object from the enhanced AI service
        if (comparison && typeof comparison === 'object' && 'error' in comparison) {
          const errorObj = comparison as { error: boolean; message: string; errorType: string; recovery?: string };
          console.error(`Contract comparison error: Type=${errorObj.errorType}, Message="${errorObj.message}"`);
          
          // Convert to a user-friendly format that matches the expected contract comparison structure
          comparison = {
            differences: [{
              section: "Error",
              first: "Could not process document",
              second: "Could not process document",
              impact: errorObj.message,
            }],
            summary: `Error: ${errorObj.message}`,
            recommendation: errorObj.recovery || "Try using smaller or more readable contract documents.",
            errorType: errorObj.errorType
          };
        }
      } catch (comparisonError) {
        console.error("Contract comparison failed, returning error result:", comparisonError);
        
        // Check for token limit errors 
        const errorMessage = comparisonError instanceof Error ? comparisonError.message : "Error comparing contracts";
        const isTokenLimitError = errorMessage.includes("Token limit exceeded") || 
                                 errorMessage.includes("maximum context length") ||
                                 errorMessage.includes("tokens. However, you requested");
        
        // Return a structured error response that matches the expected format
        if (isTokenLimitError) {
          comparison = {
            differences: [{
              section: "Error - Document Size Limit Exceeded",
              first: "Document too large to process",
              second: "Document too large to process",
              impact: "The combined size of these contracts exceeds our AI model's token limits",
            }],
            summary: "We couldn't complete the comparison because these contracts are too large for our AI system to process together.",
            recommendation: "Try comparing smaller sections of the contracts, or use our document extraction tool to focus on key clauses only.",
            errorType: "token_limit_exceeded"
          };
        } else {
          comparison = {
            differences: [{
              section: "Error",
              first: "Could not process document",
              second: "Could not process document",
              impact: "Unable to complete comparison due to technical error",
            }],
            summary: "Contract comparison failed due to a technical error. The documents may be too large or in an unsupported format.",
            recommendation: "Try using smaller or more readable contract documents.",
            errorType: "unknown_error"
          };
        }
      }
      
      res.json(comparison);
    } catch (error) {
      console.error("Contract comparison error:", error);
      res.status(500).json({ message: "Error comparing contracts" });
    }
  });

  // Legal research
  app.post("/api/research", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Create enhanced schema with jurisdiction and practiceArea
      const researchSchema = z.object({
        query: z.string().min(1),
        jurisdiction: z.string().optional(),
        practiceArea: z.string().optional(),
      });
      
      const parsed = researchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid research query" });
      }
      
      // Extract parameters with defaults
      const { 
        query, 
        jurisdiction = "canada", 
        practiceArea = "all" 
      } = parsed.data;
      
      // Perform research using enhanced AI service with built-in fallback
      const response = await enhancedLegalResearch(
        query,
        jurisdiction,
        practiceArea
      );
      
      // Check if we received an error object from the enhanced AI service
      let results;
      let errorInfo = null;
      
      if (response && typeof response === 'object' && 'error' in response) {
        // Handle structured error response
        const errorObj = response as { error: boolean; message: string; errorType: string; recovery?: string };
        console.error(`Legal research error: Type=${errorObj.errorType}, Message="${errorObj.message}"`);
        
        // Convert to a format that matches what the frontend expects for research results
        results = {
          citations: [],
          analysis: `Error: ${errorObj.message}. ${errorObj.recovery || 'Please try again later.'}`,
          errorType: errorObj.errorType
        };
        
        errorInfo = {
          type: errorObj.errorType,
          message: errorObj.message,
          recovery: errorObj.recovery
        };
      } else {
        // Normal research results
        results = response;
      }
      
      // Save the research query with user ID and results
      const savedQuery = await storage.createResearchQuery({
        query,
        userId: req.user!.id,
        results: JSON.stringify(results),
        jurisdiction,
        practiceArea
      });
      
      // Return with error info if applicable
      res.status(201).json({
        ...savedQuery,
        results, // Return parsed results directly
        error: errorInfo
      });
    } catch (error) {
      console.error("Research error:", error);
      res.status(500).json({ message: "Error performing legal research" });
    }
  });
  
  // Streaming research for real-time UI updates
  app.post("/api/research/stream", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Create enhanced schema with jurisdiction and practiceArea
      const researchSchema = z.object({
        query: z.string().min(1),
        jurisdiction: z.string().optional(),
        practiceArea: z.string().optional(),
      });
      
      const parsed = researchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid research query" });
      }
      
      // Extract parameters with defaults
      const { 
        query, 
        jurisdiction = "canada", 
        practiceArea = "all" 
      } = parsed.data;
      
      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Set up initial context for the AI request
      req.body.system = `You are a legal research assistant specialized in ${jurisdiction} law with expertise in ${practiceArea}. 
      Provide accurate legal information including relevant cases, statutes, and analysis.
      Your response should be scholarly, well-structured, and focused on legal accuracy.`;
      req.body.content = query;
      req.body.cacheKey = `research-${jurisdiction}-${practiceArea}-${query.substring(0, 50)}`;
      
      // Stream research results
      await streamAIResponse(req, res);
      
      // After streaming, save the research query (we don't have the full response here)
      await storage.createResearchQuery({
        query,
        userId: req.user!.id,
        results: JSON.stringify({ status: "streamed", query, jurisdiction, practiceArea }),
        jurisdiction,
        practiceArea
      });
      
    } catch (error) {
      console.error("Streaming research error:", error);
      // If headers haven't been sent yet, send error response
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming research response" });
      } else {
        // Otherwise, end the response with an error event
        res.write(`event: error\ndata: ${JSON.stringify({ message: "Error occurred during streaming" })}\n\n`);
        res.end();
      }
    }
  });

  app.get("/api/research", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get userId from authenticated user session
      const userId = req.user!.id;
      const queries = await storage.getResearchQueriesByUserId(userId);
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving research queries" });
    }
  });

  // Dispute resolution routes
  app.get("/api/disputes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const disputes = await storage.getDisputesByUserId(userId);
      res.json(disputes);
    } catch (error) {
      console.error("Dispute retrieval error:", error);
      res.status(500).json({ message: "Error retrieving disputes" });
    }
  });

  app.get("/api/disputes/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const dispute = await storage.getDispute(id);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      // Ensure the user has permission to view this dispute
      // Users can view if they're the creator or an involved party
      if (dispute.userId !== req.user!.id) {
        // Check if the current user is a party in this dispute
        const parties = await storage.getDisputePartiesByDisputeId(id);
        const userIsParty = parties.some(party => 
          party.userId === req.user!.id || 
          party.email === req.user!.username
        );
        
        if (!userIsParty) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      res.json(dispute);
    } catch (error) {
      console.error("Dispute retrieval error:", error);
      res.status(500).json({ message: "Error retrieving dispute" });
    }
  });
  
  // Update a dispute
  app.patch("/api/disputes/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const dispute = await storage.getDispute(id);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      // Ensure the dispute belongs to the requesting user
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate update data - only allow certain fields
      const updateSchema = z.object({
        status: z.enum(['pending', 'active', 'mediation', 'resolved', 'closed']).optional(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        parties: z.string().min(1).optional(),
        disputeType: z.string().min(1).optional(),
        supportingDocuments: z.any().optional(),
      });
      
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid update data",
          errors: parsed.error.format() 
        });
      }
      
      // If status is changing to resolved, add the resolved timestamp
      const updates: any = parsed.data;
      if (updates.status === 'resolved' && dispute.status !== 'resolved') {
        updates.resolvedAt = new Date().toISOString();
      }
      
      const updatedDispute = await storage.updateDispute(id, updates);
      
      res.json(updatedDispute);
    } catch (error) {
      console.error("Dispute update error:", error);
      res.status(500).json({ message: "Error updating dispute" });
    }
  });

  app.post("/api/disputes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate dispute data without userId
      const disputeSchema = insertDisputeSchema.omit({ userId: true });
      const parsed = disputeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid dispute data",
          errors: parsed.error.format()
        });
      }
      
      // Add authenticated user ID to the dispute data
      const dispute = await storage.createDispute({
        ...parsed.data,
        userId: req.user!.id
      });
      
      res.status(201).json(dispute);
    } catch (error) {
      console.error("Dispute creation error:", error);
      res.status(500).json({ message: "Error creating dispute" });
    }
  });
  
  // Dispute parties routes
  app.get("/api/disputes/:disputeId/parties", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      // Verify the dispute exists and belongs to this user or user is a party
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      // Check permissions: user must be dispute owner or an invited party
      if (dispute.userId !== req.user!.id) {
        const parties = await storage.getDisputePartiesByDisputeId(disputeId);
        const userIsParty = parties.some(party => 
          party.userId === req.user!.id || 
          party.email === req.user!.username
        );
        
        if (!userIsParty) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const parties = await storage.getDisputePartiesByDisputeId(disputeId);
      res.json(parties);
    } catch (error) {
      console.error("Party retrieval error:", error);
      res.status(500).json({ message: "Error retrieving dispute parties" });
    }
  });
  
  app.post("/api/disputes/:disputeId/parties", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      // Verify the dispute exists and belongs to this user
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Only the dispute creator can add parties" });
      }
      
      // Validate party data
      const partySchema = insertDisputePartySchema.omit({ disputeId: true, invitationCode: true });
      
      const parsed = partySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid party data",
          errors: parsed.error.format()
        });
      }
      
      // Check if the email is already used for this dispute
      const existingParty = await storage.getDisputePartyByEmail(parsed.data.email, disputeId);
      if (existingParty) {
        return res.status(400).json({ message: "A party with this email already exists in this dispute" });
      }
      
      // Generate a unique invitation code
      const invitationCode = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
      
      // Create the party
      const party = await storage.createDisputeParty({
        ...parsed.data,
        disputeId,
        invitationCode,
        verificationStatus: "pending",
        updatedAt: new Date()
      });
      
      // In a real app, you would send an email to the party with the invitation code
      // For now, we just return the invitation code in the response
      
      res.status(201).json(party);
    } catch (error) {
      console.error("Party creation error:", error);
      res.status(500).json({ message: "Error adding dispute party" });
    }
  });
  
  app.get("/api/dispute-party/verify/:code", async (req: Request, res: Response) => {
    try {
      const code = req.params.code;
      
      // Get party by invitation code
      const party = await storage.getDisputePartyByInvitationCode(code);
      if (!party) {
        return res.status(404).json({ message: "Invalid invitation code" });
      }
      
      // Update verification status
      const updatedParty = await storage.updateDisputeParty(party.id, {
        verificationStatus: "verified",
        updatedAt: new Date()
      });
      
      res.json({ 
        message: "Party verification successful",
        party: updatedParty
      });
    } catch (error) {
      console.error("Party verification error:", error);
      res.status(500).json({ message: "Error verifying dispute party" });
    }
  });
  
  app.patch("/api/disputes/:disputeId/parties/:partyId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      const partyId = parseInt(req.params.partyId);
      
      if (isNaN(disputeId) || isNaN(partyId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Verify the dispute exists and user has permission
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Only the dispute creator can update parties" });
      }
      
      // Verify the party exists and belongs to this dispute
      const party = await storage.getDisputeParty(partyId);
      if (!party || party.disputeId !== disputeId) {
        return res.status(404).json({ message: "Party not found in this dispute" });
      }
      
      // Validate update data
      const updateSchema = z.object({
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        role: z.string().optional(),
        phone: z.string().optional(),
        permissions: z.record(z.string(), z.boolean()).optional(),
        notes: z.string().optional(),
        verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional()
      });
      
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid update data",
          errors: parsed.error.format()
        });
      }
      
      // If email is being updated, check it's not already in use
      if (parsed.data.email && parsed.data.email !== party.email) {
        const existingParty = await storage.getDisputePartyByEmail(parsed.data.email, disputeId);
        if (existingParty) {
          return res.status(400).json({ message: "A party with this email already exists in this dispute" });
        }
      }
      
      // Update the party
      const updatedParty = await storage.updateDisputeParty(partyId, {
        ...parsed.data,
        updatedAt: new Date()
      });
      
      res.json(updatedParty);
    } catch (error) {
      console.error("Party update error:", error);
      res.status(500).json({ message: "Error updating dispute party" });
    }
  });
  
  app.delete("/api/disputes/:disputeId/parties/:partyId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      const partyId = parseInt(req.params.partyId);
      
      if (isNaN(disputeId) || isNaN(partyId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Verify the dispute exists and user has permission
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Only the dispute creator can remove parties" });
      }
      
      // Verify the party exists and belongs to this dispute
      const party = await storage.getDisputeParty(partyId);
      if (!party || party.disputeId !== disputeId) {
        return res.status(404).json({ message: "Party not found in this dispute" });
      }
      
      // Delete the party
      await storage.deleteDisputeParty(partyId);
      
      res.json({ message: "Party removed successfully" });
    } catch (error) {
      console.error("Party deletion error:", error);
      res.status(500).json({ message: "Error removing dispute party" });
    }
  });
  
  // Handle dispute file uploads
  app.post("/api/disputes/:id/documents", isAuthenticated, upload.array('documents', 5), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      // Verify the dispute exists and belongs to this user
      const dispute = await storage.getDispute(id);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Process uploaded files
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }
      
      // Build document metadata
      const documentMetadata = files.map(file => ({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        content: file.buffer.toString('base64'),
        uploadedAt: new Date()
      }));
      
      // Update dispute's supporting documents
      const currentDocs = dispute.supportingDocuments || [];
      const updatedDispute = await storage.updateDispute(id, {
        supportingDocuments: [...currentDocs, ...documentMetadata],
        updatedAt: new Date()
      });
      
      res.status(201).json({ 
        message: "Documents uploaded successfully", 
        count: files.length,
        supportingDocuments: updatedDispute.supportingDocuments
      });
      
    } catch (error) {
      console.error("Document upload error:", error);
      if (error.message?.includes("file type")) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error uploading documents" });
    }
  });

  app.patch("/api/disputes/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const dispute = await storage.getDispute(id);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      // Ensure the dispute belongs to the requesting user
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate update data
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        parties: z.string().optional(),
        status: z.string().optional(),
        disputeType: z.string().optional(),
        supportingDocuments: z.any().optional(), // Using any for jsonb
        aiAnalysis: z.any().optional(), // Using any for jsonb
        resolvedAt: z.date().optional().nullable()
      });
      
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid update data",
          errors: parsed.error.format()
        });
      }
      
      // Update dispute with automatic setting of updatedAt
      const updatedDispute = await storage.updateDispute(id, {
        ...parsed.data,
        updatedAt: new Date()
      });
      
      res.json(updatedDispute);
    } catch (error) {
      console.error("Dispute update error:", error);
      res.status(500).json({ message: "Error updating dispute" });
    }
  });

  // Mediation session routes
  app.get("/api/disputes/:disputeId/mediation-sessions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      // First verify that the dispute exists
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      // Check if user is allowed to access
      if (dispute.userId !== req.user!.id) {
        // Check if user is an involved party
        const parties = await storage.getDisputePartiesByDisputeId(disputeId);
        const userIsParty = parties.some(party => 
          party.userId === req.user!.id || 
          party.email === req.user!.username
        );
        
        if (!userIsParty) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const sessions = await storage.getMediationSessionsByDisputeId(disputeId);
      res.json(sessions);
    } catch (error) {
      console.error("Mediation sessions retrieval error:", error);
      res.status(500).json({ message: "Error retrieving mediation sessions" });
    }
  });

  app.post("/api/disputes/:disputeId/mediation-sessions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      // First verify that the dispute exists
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      // Only the dispute creator can create mediation sessions
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Only the dispute creator can create mediation sessions" });
      }
      
      // Validate session data
      const sessionSchema = insertMediationSessionSchema
        .omit({ disputeId: true })
        .extend({
          scheduledAt: z.string().transform(val => new Date(val)).optional()
        });
      
      const parsed = sessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid mediation session data",
          errors: parsed.error.format()
        });
      }
      
      // Generate a unique session code
      const sessionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Check if AI assistance is requested
      const aiAssistance = parsed.data.aiAssistance || false;
      let aiWelcomeMessage = null;
      
      // If AI assistance is enabled, generate a welcome message
      if (aiAssistance) {
        try {
          // Prepare the mediator configuration
          const mediatorConfig = {
            disputeType: dispute.disputeType || 'general',
            disputeDescription: dispute.description || dispute.title,
            parties: dispute.parties,
            legalJurisdiction: 'Canada',
            language: req.user?.preferredLanguage || 'English',
            mediationStyle: parsed.data.mediationStyle || 'facilitative',
            requiresConfidentiality: true
          };
          
          // Generate AI welcome message
          aiWelcomeMessage = await generateWelcomeMessage(mediatorConfig);
        } catch (aiError) {
          console.error("Error generating AI welcome message:", aiError);
          // Continue without AI welcome message
        }
      }
      
      // Create the session
      const session = await storage.createMediationSession({
        ...parsed.data,
        disputeId,
        sessionCode
      });
      
      // Update the dispute to reflect the mediation status
      await storage.updateDispute(disputeId, {
        status: "mediation",
        mediationId: session.id,
        updatedAt: new Date()
      });
      
      // If AI assistance is enabled and we have a welcome message, create the first AI message
      if (aiAssistance && aiWelcomeMessage) {
        try {
          await storage.createMediationMessage({
            sessionId: session.id,
            role: "ai",
            content: aiWelcomeMessage,
            userId: null // AI messages don't have a user ID
          });
        } catch (msgError) {
          console.error("Error creating AI welcome message:", msgError);
          // Continue without creating welcome message
        }
      }
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Mediation session creation error:", error);
      res.status(500).json({ message: "Error creating mediation session" });
    }
  });

  app.get("/api/mediation-sessions/:sessionId/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID format" });
      }
      
      const session = await storage.getMediationSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Mediation session not found" });
      }
      
      // Security check - user must be a party to the dispute or the mediator
      if (!session.disputeId) {
        return res.status(400).json({ message: "Invalid session disputeId" });
      }
      
      const dispute = await storage.getDispute(session.disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Associated dispute not found" });
      }
      
      // Check if the user is either the dispute owner or the mediator (if assigned)
      const isMediatorAssigned = !!session.mediatorId;
      if (dispute.userId !== req.user!.id && (!isMediatorAssigned || session.mediatorId !== req.user!.id)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getMediationMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Mediation messages retrieval error:", error);
      res.status(500).json({ message: "Error retrieving mediation messages" });
    }
  });

  app.post("/api/mediation-sessions/:sessionId/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID format" });
      }
      
      const session = await storage.getMediationSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Mediation session not found" });
      }
      
      // Security check - user must be a party to the dispute or the mediator
      if (!session.disputeId) {
        return res.status(400).json({ message: "Invalid session disputeId" });
      }
      
      const dispute = await storage.getDispute(session.disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Associated dispute not found" });
      }
      
      // Check if the user is either the dispute owner or the mediator (if assigned)
      const isMediatorAssigned = !!session.mediatorId;
      if (dispute.userId !== req.user!.id && (!isMediatorAssigned || session.mediatorId !== req.user!.id)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Determine the role based on who's sending the message
      let role = "user";
      if (session.mediatorId === req.user!.id) {
        role = "mediator";
      }
      
      // Validate message data
      const messageSchema = z.object({
        content: z.string().min(1)
      });
      
      const parsed = messageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid message data",
          errors: parsed.error.format()
        });
      }
      
      // Create the message
      const message = await storage.createMediationMessage({
        sessionId,
        userId: req.user!.id,
        role,
        content: parsed.data.content,
        sentiment: undefined // Sentiment analysis could be added later
      });
      
      // If AI assistance is enabled, generate an AI mediator response
      if (session.aiAssistance && role !== "mediator") {
        try {
          const dispute = await storage.getDispute(session.disputeId);
          if (!dispute) {
            throw new Error("Associated dispute not found");
          }
          
          // Get previous messages for context
          const previousMessages = await storage.getMediationMessagesBySessionId(sessionId);
          
          // Import and use the AI mediator helper
          const { generateMediatorResponse } = await import('./lib/mediationAI');
          
          // Generate AI response based on dispute context and message history
          const mediatorConfig = {
            disputeType: dispute.disputeType || 'general',
            disputeDescription: dispute.description || dispute.title,
            parties: dispute.parties,
            legalJurisdiction: 'Canada',
            language: 'English',
            mediationStyle: session.mediationStyle || 'facilitative',
            requiresConfidentiality: true
          };
          
          const aiResponse = await generateMediatorResponse(
            mediatorConfig,
            previousMessages,
            message
          );
          
          // Create the AI mediator message
          await storage.createMediationMessage({
            sessionId,
            userId: undefined, // AI doesn't have a user ID
            role: "ai",
            content: aiResponse
          });
        } catch (error) {
          console.error("AI mediator response generation error:", error);
          // Fall back to a simple response if AI generation fails
          await storage.createMediationMessage({
            sessionId,
            userId: undefined,
            role: "ai",
            content: "I'm processing your message. Let's continue our discussion to find a resolution."
          });
        }
      }
      
      // Update session status if it was scheduled
      if (session.status === "scheduled") {
        await storage.updateMediationSession(sessionId, {
          status: "in_progress"
        });
      }
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Mediation message creation error:", error);
      res.status(500).json({ message: "Error creating mediation message" });
    }
  });

  // Get mediation session by code (for joining)
  app.get("/api/mediation-sessions/code/:code", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const code = req.params.code;
      const session = await storage.getMediationSessionByCode(code);
      
      if (!session) {
        return res.status(404).json({ message: "Mediation session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Mediation session retrieval error:", error);
      res.status(500).json({ message: "Error retrieving mediation session" });
    }
  });
  
  // Generate AI summary for a mediation session
  // Get complete mediation session details with messages
  app.get("/api/mediation-sessions/:sessionId/details", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID format" });
      }
      
      const session = await storage.getMediationSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Mediation session not found" });
      }
      
      // Security check - user must be a party to the dispute or the mediator
      if (!session.disputeId) {
        return res.status(400).json({ message: "Invalid session disputeId" });
      }
      
      const dispute = await storage.getDispute(session.disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Associated dispute not found" });
      }
      
      // Check if the user is either the dispute owner or the mediator (if assigned)
      const isMediatorAssigned = !!session.mediatorId;
      if (dispute.userId !== req.user!.id && (!isMediatorAssigned || session.mediatorId !== req.user!.id)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get all messages for this session
      const messages = await storage.getMediationMessagesBySessionId(sessionId);
      
      // Return combined results
      res.json({
        session,
        dispute,
        messages
      });
    } catch (error) {
      console.error("Mediation session details retrieval error:", error);
      res.status(500).json({ message: "Error retrieving mediation session details" });
    }
  });
  
  app.post("/api/mediation-sessions/:sessionId/summary", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID format" });
      }
      
      const session = await storage.getMediationSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Mediation session not found" });
      }
      
      // Security check - user must be a party to the dispute or the mediator
      if (!session.disputeId) {
        return res.status(400).json({ message: "Invalid session disputeId" });
      }
      
      const dispute = await storage.getDispute(session.disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Associated dispute not found" });
      }
      
      // Check if the user is either the dispute owner or the mediator (if assigned)
      if (dispute.userId !== req.user!.id && (!session.mediatorId || session.mediatorId !== req.user!.id)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get all messages from the session
      const messages = await storage.getMediationMessagesBySessionId(sessionId);
      
      // Import and use the AI mediator helper
      const { generateMediationSummary } = await import('./lib/mediationAI');
      
      // Prepare mediator config
      const mediatorConfig = {
        disputeType: dispute.disputeType || 'general',
        disputeDescription: dispute.description || dispute.title,
        parties: dispute.parties,
        legalJurisdiction: 'Canada',
        language: 'English',
        mediationStyle: session.mediationStyle || 'facilitative',
        requiresConfidentiality: true
      };
      
      // Generate the session summary
      const summary = await generateMediationSummary(mediatorConfig, messages);
      
      // Update the session with the summary and complete it
      await storage.updateMediationSession(sessionId, {
        status: "completed",
        completedAt: new Date(),
        summary: summary.summary,
        recommendations: summary.recommendations
      });
      
      // Update the dispute status if it's still in mediation
      if (dispute.status === 'mediation') {
        await storage.updateDispute(dispute.id, {
          status: 'resolved',
          resolvedAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      res.json(summary);
    } catch (error) {
      console.error("Session summary generation error:", error);
      res.status(500).json({ message: "Error generating session summary" });
    }
  });

  // Template source routes - available publicly to show available templates
  app.get("/api/template-sources", async (_req: Request, res: Response) => {
    try {
      res.json(templateSources);
    } catch (error) {
      console.error("Template sources error:", error);
      res.status(500).json({ message: "Error retrieving template sources" });
    }
  });

  // Get templates from a specific source
  app.get("/api/template-sources/:sourceId/templates", async (req: Request, res: Response) => {
    try {
      const sourceId = req.params.sourceId;
      const category = req.query.category as string | undefined;
      const jurisdiction = req.query.jurisdiction as string | undefined;
      
      const source = templateSources.find(s => s.id === sourceId);
      if (!source) {
        return res.status(404).json({ message: "Template source not found" });
      }
      
      const templates = await source.fetchTemplates(category, jurisdiction);
      res.json(templates);
    } catch (error) {
      console.error("Template source templates error:", error);
      res.status(500).json({ message: "Error retrieving templates from source" });
    }
  });

  // Import an external template - no authentication required for feedback gathering phase
  app.post("/api/template-sources/import", async (req: Request, res: Response) => {
    try {
      // Validate request body with more detailed schema
      const importSchema = z.object({
        templateId: z.string()
          .min(3, "Template ID is too short")
          .regex(/^[a-z0-9-]+$/i, "Template ID can only contain letters, numbers, and hyphens")
          .refine(val => val.includes('-'), {
            message: "Template ID must include at least one hyphen (e.g., 'source-category')"
          }),
        language: z.enum(['en', 'fr']).default('en')
      });
      
      const parsed = importSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid import data", 
          errors: parsed.error.format(),
          detail: "Template ID format should be 'source-category-name', for example 'canada-legal-nda'"
        });
      }
      
      // Check API key availability first with clearer error messages
      if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
        return res.status(500).json({ 
          message: "AI Service Unavailable", 
          detail: "The AI service is temporarily unavailable. Please try again later."
        });
      }
      
      try {
        // Log the template ID being imported for debugging
        console.log(`Attempting to import template with ID: ${parsed.data.templateId}`);
        
        const template = await importAndSaveTemplate(
          parsed.data.templateId,
          parsed.data.language
        );
        
        if (!template) {
          return res.status(400).json({ 
            message: "Failed to import template", 
            detail: "The template could not be generated. Please check your AI API keys and try again."
          });
        }
        
        res.status(201).json(template);
      } catch (importError: any) {
        // Handle specific errors with appropriate status codes
        console.error("Template import execution error:", importError);
        
        // Format error message from the caught error
        const errorMessage = importError?.message || "Unknown error during template generation";
        
        // If error contains "Invalid template ID format", it's a 400
        if (errorMessage.includes("Invalid template ID format") || 
            errorMessage.includes("template source not found")) {
          return res.status(400).json({ 
            message: "Failed to import template", 
            detail: errorMessage
          });
        }
        
        // If error contains API key issues, it's a 401
        if (errorMessage.includes("API key")) {
          return res.status(401).json({ 
            message: "AI service authorization failed", 
            detail: "Please check your API keys in the environment settings."
          });
        }
        
        // Otherwise, it's a general 400 error
        return res.status(400).json({ 
          message: "Template import failed", 
          detail: errorMessage
        });
      }
    } catch (error) {
      console.error("Template import error:", error);
      res.status(500).json({ 
        message: "Error importing template", 
        detail: error instanceof Error ? error.message : "An unexpected server error occurred"
      });
    }
  });

  // Enhanced document generation with Anthropic endpoint has been removed
  // Simplified document generation workflow now only uses the standard document generation

  // Legal document analysis
  // Check if secret API keys are available
  app.get("/api/secrets/check", async (req: Request, res: Response) => {
    try {
      const key = req.query.key as string;
      
      // If no specific key is requested, return available AI services
      if (!key) {
        return res.json({
          services: {
            openai: !!process.env.OPENAI_API_KEY,
            anthropic: !!process.env.ANTHROPIC_API_KEY,
            deepseek: !!process.env.DEEPSEEK_API_KEY
          },
          available: true, // Always return true to prevent request failures
          message: "AI services availability"
        });
      }
      
      // Check for a specific key
      const available = !!process.env[key];
      res.json({ available });
    } catch (error) {
      console.error("Secret check error:", error);
      res.status(500).json({ message: "Error checking secret availability" });
    }
  });
  
  // API endpoints for legal domains (Phase 3)
  app.get("/api/legal-domains", async (req: Request, res: Response) => {
    try {
      const domains = await storage.getLegalDomains();
      res.json(domains);
    } catch (error) {
      console.error("Error fetching legal domains:", error);
      res.status(500).json({ message: "Failed to fetch legal domains" });
    }
  });
  
  // Get subdomains for a specific legal domain
  app.get("/api/legal-domains/:id/subdomains", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID format" });
      }
      
      const subdomains = await storage.getLegalSubdomains(id);
      res.json(subdomains);
    } catch (error) {
      console.error("Error fetching legal subdomains:", error);
      res.status(500).json({ message: "Failed to fetch legal subdomains" });
    }
  });
  
  // Get a specific legal domain by ID
  app.get("/api/legal-domains/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid domain ID format" });
      }
      
      const domain = await storage.getLegalDomain(id);
      if (!domain) {
        return res.status(404).json({ message: "Legal domain not found" });
      }
      
      res.json(domain);
    } catch (error) {
      console.error("Error fetching legal domain:", error);
      res.status(500).json({ message: "Failed to fetch legal domain" });
    }
  });
  
  // Domain knowledge endpoints (Phase 3)
  app.get("/api/legal-domains/:id/knowledge", async (req: Request, res: Response) => {
    try {
      const domainId = parseInt(req.params.id);
      if (isNaN(domainId)) {
        return res.status(400).json({ message: "Invalid domain ID format" });
      }
      
      const language = req.query.language as string || 'en';
      const knowledge = await storage.getDomainKnowledgeByDomainId(domainId);
      
      // Filter by language if needed
      const filteredKnowledge = language ? 
        knowledge.filter(k => k.language === language) : 
        knowledge;
      
      res.json(filteredKnowledge);
    } catch (error) {
      console.error("Error fetching domain knowledge:", error);
      res.status(500).json({ message: "Failed to fetch domain knowledge" });
    }
  });
  
  // Search domain knowledge
  app.get("/api/knowledge/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const language = req.query.language as string || 'en';
      
      const results = await storage.searchDomainKnowledge(query, domainId, language);
      res.json(results);
    } catch (error) {
      console.error("Error searching domain knowledge:", error);
      res.status(500).json({ message: "Failed to search domain knowledge" });
    }
  });
  
  // Procedural guides endpoints (Phase 3)
  app.get("/api/legal-domains/:id/guides", async (req: Request, res: Response) => {
    try {
      const domainId = parseInt(req.params.id);
      if (isNaN(domainId)) {
        return res.status(400).json({ message: "Invalid domain ID format" });
      }
      
      const language = req.query.language as string || 'en';
      const guides = await storage.getProceduralGuidesByDomainId(domainId, language);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching procedural guides:", error);
      res.status(500).json({ message: "Failed to fetch procedural guides" });
    }
  });
  
  // Additional procedural guides routes
  app.get("/api/procedural-guides", async (req: Request, res: Response) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      
      if (!domainId) {
        return res.status(400).json({ message: "Domain ID is required" });
      }
      
      const language = req.query.language as string || 'en';
      const guides = await storage.getProceduralGuidesByDomainId(domainId, language);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching procedural guides:", error);
      res.status(500).json({ message: "Failed to fetch procedural guides" });
    }
  });
  
  // Get a specific procedural guide by ID
  app.get("/api/procedural-guides/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid guide ID format" });
      }
      
      const guide = await storage.getProceduralGuide(id);
      if (!guide) {
        return res.status(404).json({ message: "Procedural guide not found" });
      }
      
      res.json(guide);
    } catch (error) {
      console.error("Error fetching procedural guide:", error);
      res.status(500).json({ message: "Failed to fetch procedural guide" });
    }
  });
  
  app.post("/api/document/analyze", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const analyzeSchema = z.object({
        content: z.string().min(1),
        documentType: z.string().min(1),
        jurisdiction: z.string().optional()
      });
      
      const parsed = analyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid document analysis request" });
      }
      
      // Analyze legal document with Anthropic
      const analysis = await analyzeLegalDocument(
        parsed.data.content,
        parsed.data.documentType,
        parsed.data.jurisdiction || 'Canada'
      );
      
      res.json(analysis);
    } catch (error) {
      console.error("Document analysis error:", error);
      res.status(500).json({ 
        message: "Error analyzing document",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Saved citations routes
  app.post("/api/saved-citations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate citation data
      const citationSchema = insertSavedCitationSchema.omit({ userId: true });
      const parsed = citationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid citation data" });
      }
      
      // Save the citation with the authenticated user ID
      const citation = await storage.createSavedCitation({
        ...parsed.data,
        userId: req.user!.id
      });
      
      res.status(201).json(citation);
    } catch (error) {
      console.error("Error saving citation:", error);
      res.status(500).json({ message: "Error saving citation" });
    }
  });

  app.get("/api/saved-citations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get userId from authenticated user session
      const userId = req.user!.id;
      const citations = await storage.getSavedCitationsByUserId(userId);
      res.json(citations);
    } catch (error) {
      console.error("Error retrieving saved citations:", error);
      res.status(500).json({ message: "Error retrieving saved citations" });
    }
  });

  app.get("/api/saved-citations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const citation = await storage.getSavedCitation(id);
      if (!citation) {
        return res.status(404).json({ message: "Citation not found" });
      }
      
      // Ensure the citation belongs to the requesting user
      if (citation.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(citation);
    } catch (error) {
      console.error("Error retrieving citation:", error);
      res.status(500).json({ message: "Error retrieving citation" });
    }
  });
  
  app.delete("/api/saved-citations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const citation = await storage.getSavedCitation(id);
      if (!citation) {
        return res.status(404).json({ message: "Citation not found" });
      }
      
      // Ensure the citation belongs to the requesting user
      if (citation.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteSavedCitation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting citation:", error);
      res.status(500).json({ message: "Error deleting citation" });
    }
  });

  // Research visualizations routes
  app.post("/api/research-visualizations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate visualization data
      const visualizationSchema = insertResearchVisualizationSchema.omit({ userId: true });
      const parsed = visualizationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid visualization data" });
      }
      
      // Save the visualization with the authenticated user ID
      const visualization = await storage.createResearchVisualization({
        ...parsed.data,
        userId: req.user!.id,
        updatedAt: new Date()
      });
      
      res.status(201).json(visualization);
    } catch (error) {
      console.error("Error creating visualization:", error);
      res.status(500).json({ message: "Error creating visualization" });
    }
  });

  app.get("/api/research-visualizations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get userId from authenticated user session
      const userId = req.user!.id;
      const visualizations = await storage.getResearchVisualizationsByUserId(userId);
      res.json(visualizations);
    } catch (error) {
      console.error("Error retrieving visualizations:", error);
      res.status(500).json({ message: "Error retrieving visualizations" });
    }
  });

  app.get("/api/research-visualizations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const visualization = await storage.getResearchVisualization(id);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      
      // Ensure the visualization belongs to the requesting user or is public
      if (!visualization.isPublic && visualization.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(visualization);
    } catch (error) {
      console.error("Error retrieving visualization:", error);
      res.status(500).json({ message: "Error retrieving visualization" });
    }
  });
  
  app.patch("/api/research-visualizations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const visualization = await storage.getResearchVisualization(id);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      
      // Ensure the visualization belongs to the requesting user
      if (visualization.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update allowed fields
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
        visualizationData: z.any().optional(),
      });
      
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid update data" });
      }
      
      const updatedVisualization = await storage.updateResearchVisualization(id, {
        ...parsed.data,
        updatedAt: new Date()
      });
      
      res.json(updatedVisualization);
    } catch (error) {
      console.error("Error updating visualization:", error);
      res.status(500).json({ message: "Error updating visualization" });
    }
  });
  
  app.delete("/api/research-visualizations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const visualization = await storage.getResearchVisualization(id);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      
      // Ensure the visualization belongs to the requesting user
      if (visualization.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteResearchVisualization(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting visualization:", error);
      res.status(500).json({ message: "Error deleting visualization" });
    }
  });
  
  // Escalated questions endpoints (Phase 3)
  app.post("/api/escalated-questions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate question data
      const questionSchema = z.object({
        question: z.string().min(5),
        legalDomainId: z.number().optional(),
        urgency: z.string().optional(),
        additionalInfo: z.string().optional(),
      });
      
      const parsed = questionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid question data" });
      }
      
      // Create the escalated question with pending status
      const question = await storage.createEscalatedQuestion({
        userId: req.user!.id,
        question: parsed.data.question,
        context: parsed.data.additionalInfo || '', // Use additionalInfo as context
        domainId: parsed.data.legalDomainId, // Map legalDomainId to domainId
        status: 'pending',
        updatedAt: new Date()
      });
      
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating escalated question:", error);
      res.status(500).json({ message: "Error escalating question" });
    }
  });
  
  app.get("/api/escalated-questions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get userId from authenticated user session
      const userId = req.user!.id;
      const questions = await storage.getEscalatedQuestionsByUserId(userId);
      res.json(questions);
    } catch (error) {
      console.error("Error retrieving escalated questions:", error);
      res.status(500).json({ message: "Error retrieving escalated questions" });
    }
  });
  
  app.get("/api/escalated-questions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const question = await storage.getEscalatedQuestion(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Ensure the question belongs to the requesting user (or is admin in the future)
      if (question.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error retrieving question:", error);
      res.status(500).json({ message: "Error retrieving question" });
    }
  });
  
  // Conversation context endpoints (Phase 3)
  app.get("/api/conversation-context", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      let context = await storage.getConversationContextByUserId(userId);
      
      if (!context) {
        // Create new context if none exists
        context = await storage.createConversationContext({
          userId,
          context: {},
          domainId: null,
          updatedAt: new Date()
        });
      }
      
      res.json(context);
    } catch (error) {
      console.error("Error retrieving conversation context:", error);
      res.status(500).json({ message: "Error retrieving conversation context" });
    }
  });
  
  app.patch("/api/conversation-context", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      let context = await storage.getConversationContextByUserId(userId);
      
      if (!context) {
        return res.status(404).json({ message: "Conversation context not found" });
      }
      
      // Update allowed fields
      const updateSchema = z.object({
        context: z.record(z.any()).optional(),
        domainId: z.number().nullable().optional(),
      });
      
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid update data" });
      }
      
      const updated = await storage.updateConversationContext(context.id, {
        ...parsed.data,
        updatedAt: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating conversation context:", error);
      res.status(500).json({ message: "Error updating conversation context" });
    }
  });
  
  // Case outcome prediction endpoints (Phase 4)
  app.post("/api/case-outcome-predictions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate prediction request data
      const predictionSchema = z.object({
        caseType: z.string().min(3),
        caseDetails: z.string().min(10),
        jurisdiction: z.string().min(2),
        relevantFactors: z.array(z.string()).optional(),
        legalIssues: z.array(z.string()).optional(),
        legalDomainId: z.number().optional(),
      });
      
      const parsed = predictionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid prediction request data" });
      }
      
      // Here we would actually call an AI service to generate the prediction
      // For now, we'll just store the request with mock data based on schema
      
      // Create factor data object for the schema
      const factorData = {
        details: parsed.data.caseDetails,
        factors: parsed.data.relevantFactors || [],
        issues: parsed.data.legalIssues || [],
        domainId: parsed.data.legalDomainId
      };
      
      const prediction = await storage.createCaseOutcomePrediction({
        userId: req.user!.id,
        caseType: parsed.data.caseType,
        jurisdiction: parsed.data.jurisdiction,
        factorData: factorData,
        predictedOutcome: "Pending analysis", // Placeholder
        confidenceScore: "0", // Placeholder
        updatedAt: new Date()
      });
      
      // This would be done in a backend service/job
      // For now, just return the pending prediction
      res.status(201).json(prediction);
    } catch (error) {
      console.error("Error creating case outcome prediction:", error);
      res.status(500).json({ message: "Error creating case outcome prediction" });
    }
  });
  
  app.get("/api/case-outcome-predictions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get userId from authenticated user session
      const userId = req.user!.id;
      const predictions = await storage.getCaseOutcomePredictionsByUserId(userId);
      res.json(predictions);
    } catch (error) {
      console.error("Error retrieving case outcome predictions:", error);
      res.status(500).json({ message: "Error retrieving case outcome predictions" });
    }
  });
  
  app.get("/api/case-outcome-predictions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const prediction = await storage.getCaseOutcomePrediction(id);
      if (!prediction) {
        return res.status(404).json({ message: "Prediction not found" });
      }
      
      // Ensure the prediction belongs to the requesting user
      if (prediction.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(prediction);
    } catch (error) {
      console.error("Error retrieving prediction:", error);
      res.status(500).json({ message: "Error retrieving prediction" });
    }
  });

  // User feedback routes
  app.post("/api/feedback", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate feedback data without userId
      const feedbackSchema = insertUserFeedbackSchema.omit({ userId: true, respondedAt: true });
      const parsed = feedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid feedback data", 
          errors: parsed.error.errors 
        });
      }
      
      // Add authenticated user ID to the feedback data
      const feedback = await storage.createUserFeedback({
        ...parsed.data,
        userId: req.user!.id
      });
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Error submitting feedback" });
    }
  });

  // Get all feedback (admin only)
  app.get("/api/feedback", isAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      let feedback;
      
      if (status) {
        feedback = await storage.getUserFeedbackByStatus(status);
      } else {
        feedback = await storage.getAllUserFeedback();
      }
      
      res.json(feedback);
    } catch (error) {
      console.error("Error retrieving feedback:", error);
      res.status(500).json({ message: "Error retrieving feedback" });
    }
  });

  // Get feedback by ID (admin or owner)
  app.get("/api/feedback/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const feedback = await storage.getUserFeedback(id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      
      // Check if user is admin or owns this feedback
      const isUserAdmin = (req.user as any).isAdmin;
      if (!isUserAdmin && feedback?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(feedback);
    } catch (error) {
      console.error("Error retrieving feedback:", error);
      res.status(500).json({ message: "Error retrieving feedback" });
    }
  });

  // Get user's own feedback
  app.get("/api/my-feedback", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const feedback = await storage.getUserFeedbackByUserId(userId);
      res.json(feedback);
    } catch (error) {
      console.error("Error retrieving user feedback:", error);
      res.status(500).json({ message: "Error retrieving your feedback" });
    }
  });

  // Update feedback status and response (admin only)
  app.patch("/api/feedback/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const updateSchema = z.object({
        status: z.enum(["new", "reviewed", "addressed", "closed"]).optional(),
        response: z.string().optional()
      });
      
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: parsed.error.errors 
        });
      }
      
      const feedback = await storage.getUserFeedback(id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      
      // If response is being added or updated, set respondedAt to now
      const now = new Date();
      const updateData: any = {
        ...parsed.data,
        updatedAt: now
      };
      
      if (parsed.data.response !== undefined && (!feedback.response || parsed.data.response !== feedback.response)) {
        updateData.respondedAt = now;
      }
      
      const updatedFeedback = await storage.updateUserFeedback(id, updateData);
      res.json(updatedFeedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ message: "Error updating feedback" });
    }
  });

  // ===== Collaborative features API routes =====

  // Shared Documents API routes
  app.get("/api/disputes/:disputeId/documents/shared", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      const sharedDocuments = await storage.getSharedDocuments(disputeId);
      res.json(sharedDocuments);
    } catch (error) {
      console.error("Error fetching shared documents:", error);
      res.status(500).json({ message: "Error fetching shared documents" });
    }
  });

  app.post("/api/disputes/:disputeId/documents/shared", isAuthenticated, upload.single('document'), async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No document file uploaded" });
      }
      
      const { title, description, isPublic, accessPermissions } = req.body;
      const fileType = req.file.mimetype;
      const fileSize = req.file.size;
      const fileBuffer = req.file.buffer;
      
      // Save file to storage system (could be cloud storage in production)
      const fileUrl = await storage.saveDocumentFile(fileBuffer, fileType);
      
      const sharedDocument = await storage.createSharedDocument({
        disputeId,
        title,
        description,
        fileUrl,
        fileType,
        fileSize,
        uploadedBy: req.user.id,
        isPublic: isPublic === 'true',
        accessPermissions: accessPermissions ? JSON.parse(accessPermissions) : undefined,
        updatedAt: new Date()
      });

      // Track activity
      await storage.createDisputeActivity({
        disputeId,
        userId: req.user.id,
        activityType: 'document_upload',
        details: { documentId: sharedDocument.id, documentTitle: title }
      });
      
      res.status(201).json(sharedDocument);
    } catch (error) {
      console.error("Error uploading shared document:", error);
      res.status(500).json({ message: "Error uploading shared document" });
    }
  });

  app.get("/api/shared-documents/:documentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID format" });
      }
      
      const document = await storage.getSharedDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user has access
      const hasAccess = await storage.userHasDocumentAccess(req.user.id, document);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Track activity
      await storage.createDisputeActivity({
        disputeId: document.disputeId,
        userId: req.user.id,
        activityType: 'document_view',
        details: { documentId, documentTitle: document.title }
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Error fetching document" });
    }
  });

  // Document comments
  app.get("/api/shared-documents/:documentId/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID format" });
      }
      
      const document = await storage.getSharedDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user has access
      const hasAccess = await storage.userHasDocumentAccess(req.user.id, document);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const comments = await storage.getDocumentComments(documentId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching document comments:", error);
      res.status(500).json({ message: "Error fetching document comments" });
    }
  });

  app.post("/api/shared-documents/:documentId/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID format" });
      }
      
      const document = await storage.getSharedDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user has access
      const hasAccess = await storage.userHasDocumentAccess(req.user.id, document);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { content, position } = req.body;
      const comment = await storage.createDocumentComment({
        documentId,
        userId: req.user.id,
        content,
        position: position ? JSON.parse(position) : undefined,
        updatedAt: new Date()
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating document comment:", error);
      res.status(500).json({ message: "Error creating document comment" });
    }
  });

  // Settlement Proposals
  app.get("/api/disputes/:disputeId/settlement-proposals", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      const proposals = await storage.getSettlementProposals(disputeId);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching settlement proposals:", error);
      res.status(500).json({ message: "Error fetching settlement proposals" });
    }
  });

  app.post("/api/disputes/:disputeId/settlement-proposals", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      const { title, content, documentId, termsAndConditions, expiresAt } = req.body;
      const proposal = await storage.createSettlementProposal({
        disputeId,
        proposedBy: req.user.id,
        title,
        content,
        documentId: documentId ? parseInt(documentId) : undefined,
        termsAndConditions: termsAndConditions ? JSON.parse(termsAndConditions) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        updatedAt: new Date()
      });

      // Track activity
      await storage.createDisputeActivity({
        disputeId,
        userId: req.user.id,
        activityType: 'proposal_create',
        details: { proposalId: proposal.id, proposalTitle: title }
      });
      
      res.status(201).json(proposal);
    } catch (error) {
      console.error("Error creating settlement proposal:", error);
      res.status(500).json({ message: "Error creating settlement proposal" });
    }
  });

  app.patch("/api/settlement-proposals/:proposalId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const proposalId = parseInt(req.params.proposalId);
      if (isNaN(proposalId)) {
        return res.status(400).json({ message: "Invalid proposal ID format" });
      }
      
      const proposal = await storage.getSettlementProposalById(proposalId);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      // Only the proposer or a mediator can update a proposal
      const isProposer = proposal.proposedBy === req.user.id;
      const isMediator = await storage.isDisputeMediator(req.user.id, proposal.disputeId);
      
      if (!isProposer && !isMediator) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { title, content, status, documentId, termsAndConditions, expiresAt } = req.body;
      const updateData = {
        ...(title && { title }),
        ...(content && { content }),
        ...(status && { status }),
        ...(documentId && { documentId: parseInt(documentId) }),
        ...(termsAndConditions && { termsAndConditions: JSON.parse(termsAndConditions) }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        updatedAt: new Date()
      };
      
      const updatedProposal = await storage.updateSettlementProposal(proposalId, updateData);

      // Track activity
      await storage.createDisputeActivity({
        disputeId: proposal.disputeId,
        userId: req.user.id,
        activityType: 'proposal_update',
        details: { 
          proposalId, 
          proposalTitle: updatedProposal.title,
          statusChange: status ? `${proposal.status} -> ${status}` : undefined
        }
      });
      
      res.json(updatedProposal);
    } catch (error) {
      console.error("Error updating settlement proposal:", error);
      res.status(500).json({ message: "Error updating settlement proposal" });
    }
  });

  // Digital Signatures
  app.post("/api/settlement-proposals/:proposalId/signatures", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const proposalId = parseInt(req.params.proposalId);
      if (isNaN(proposalId)) {
        return res.status(400).json({ message: "Invalid proposal ID format" });
      }
      
      const proposal = await storage.getSettlementProposalById(proposalId);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      // Check if the user is a party in the dispute
      const party = await storage.getDisputePartyByUserId(proposal.disputeId, req.user.id);
      if (!party) {
        return res.status(403).json({ message: "Only dispute parties can sign proposals" });
      }
      
      const { signatureData, ipAddress, userAgent } = req.body;
      
      // Generate a verification code
      const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const signature = await storage.createDigitalSignature({
        proposalId,
        partyId: party.id,
        signedBy: req.user.id,
        signatureData: JSON.parse(signatureData),
        ipAddress,
        userAgent,
        verificationCode
      });

      // Track activity
      await storage.createDisputeActivity({
        disputeId: proposal.disputeId,
        userId: req.user.id,
        activityType: 'proposal_sign',
        details: { proposalId, proposalTitle: proposal.title }
      });
      
      res.status(201).json(signature);
    } catch (error) {
      console.error("Error creating digital signature:", error);
      res.status(500).json({ message: "Error creating digital signature" });
    }
  });

  // Activity Analytics
  app.get("/api/disputes/:disputeId/activities", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      // Check if user has access to the dispute
      const isParty = await storage.isDisputeParty(req.user.id, disputeId);
      const isMediator = await storage.isDisputeMediator(req.user.id, disputeId);
      const isOwner = await storage.isDisputeOwner(req.user.id, disputeId);
      
      if (!isParty && !isMediator && !isOwner) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const activities = await storage.getDisputeActivities(disputeId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching dispute activities:", error);
      res.status(500).json({ message: "Error fetching dispute activities" });
    }
  });

  app.get("/api/disputes/:disputeId/activity-report", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const disputeId = parseInt(req.params.disputeId);
      if (isNaN(disputeId)) {
        return res.status(400).json({ message: "Invalid dispute ID format" });
      }
      
      // Check if user has access to the dispute
      const isParty = await storage.isDisputeParty(req.user.id, disputeId);
      const isMediator = await storage.isDisputeMediator(req.user.id, disputeId);
      const isOwner = await storage.isDisputeOwner(req.user.id, disputeId);
      
      if (!isParty && !isMediator && !isOwner) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const report = await storage.generateActivityReport(disputeId);
      res.json(report);
    } catch (error) {
      console.error("Error generating activity report:", error);
      res.status(500).json({ message: "Error generating activity report" });
    }
  });
  
  // Register compliance routes
  app.use('/api/compliance', complianceRouter);
  app.use('/api/court-procedures', courtProceduresRouter);

  const httpServer = createServer(app);
  return httpServer;
}

// Imported here to avoid circular dependencies
import { insertUserSchema } from "@shared/schema";
