import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertResearchQuerySchema,
  insertGeneratedDocumentSchema,
  insertDisputeSchema,
  insertMediationSessionSchema,
  insertMediationMessageSchema,
  insertSavedCitationSchema,
  insertResearchVisualizationSchema,
  insertUserFeedbackSchema
} from "@shared/schema";
import { z } from "zod";
// Replace OpenAI with DeepSeek implementation
import { 
  generateAIResponse, 
  performLegalResearch,
  analyzeContract,
  compareContracts,
  extractTextFromPdf
} from "./lib/deepseek";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { templateSources, importAndSaveTemplate } from "./lib/templateSources";
import { 
  generateEnhancedDocument, 
  analyzeLegalDocument, 
  generateClaudeResponse, 
  generateAIResponseClaude,
  performLegalResearch as performClaudeLegalResearch 
} from "./anthropic";

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

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Middleware to check if user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

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

      // Check if user exists
      let user = await storage.getUserByUsername(email);
      
      if (!user) {
        // Create a new user with the Google info
        const randomPassword = Math.random().toString(36).slice(-10);
        user = await storage.createUser({
          username: email,
          password: randomPassword, // Will be hashed by storage
          fullName: fullName,
          preferredLanguage: "en",
          firebaseUid: uid
        });
      } else {
        // Update user with Firebase UID if not present
        if (!user.firebaseUid) {
          user = await storage.updateUser(user.id, {
            firebaseUid: uid,
            fullName: user.fullName || fullName
          });
        }
      }

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after Google auth" });
        }
        return res.status(200).json(user);
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
      
      // Generate AI response with DeepSeek, fallback to Claude if DeepSeek fails
      let aiResponse: string;
      try {
        // First try with DeepSeek
        aiResponse = await generateAIResponse(parsed.data.content);
      } catch (aiError) {
        console.error("DeepSeek API error, falling back to Claude:", aiError);
        // Fall back to Claude if DeepSeek fails
        aiResponse = await generateAIResponseClaude(parsed.data.content);
      }
      
      // Save the AI message
      const aiMessage = await storage.createChatMessage({
        userId: req.user!.id,
        role: "assistant",
        content: aiResponse
      });
      
      res.status(201).json({ userMessage, aiMessage });
    } catch (error) {
      res.status(500).json({ message: "Error creating chat message" });
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
      // Validate document data without userId
      const documentSchema = insertGeneratedDocumentSchema.omit({ userId: true });
      const parsed = documentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid document data" });
      }
      
      // Add authenticated user ID to the document data
      const document = await storage.createGeneratedDocument({
        ...parsed.data,
        userId: req.user!.id
      });
      
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Error creating document" });
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
        
        await storage.createContractAnalysis({
          userId: req.user!.id,
          contractContent: parsed.data.content,
          contractTitle: parsed.data.title,
          score: analysisResult.score,
          riskLevel: analysisResult.riskLevel,
          analysisResults: analysisResult as any, // Converting to jsonb
          jurisdiction: parsed.data.jurisdiction || 'Canada',
          contractType: parsed.data.contractType || 'general',
          updatedAt: now,
          categories: analysisResult.clause_categories as any
        });
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
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Extract parameters from the form data
      const title = req.body.title;
      const save = req.body.save === 'true';
      const jurisdiction = req.body.jurisdiction || 'Canada';
      const contractType = req.body.contractType || 'general';
      
      // Process the file based on its type
      let contractText = '';
      
      if (req.file.mimetype === 'application/pdf') {
        // Extract text from PDF
        contractText = await extractTextFromPdf(req.file.buffer);
      } else if (
        req.file.mimetype === 'text/plain' ||
        req.file.mimetype === 'application/msword' ||
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // For text and Word files, convert buffer to string
        contractText = req.file.buffer.toString('utf-8');
      }
      
      if (!contractText.trim()) {
        return res.status(400).json({ message: "Could not extract text from the uploaded file" });
      }
      
      // Analyze the contract
      const analysisResult = await analyzeContract(contractText, jurisdiction, contractType);
      
      // Save the analysis result if requested
      if (save && title) {
        const now = new Date();
        
        await storage.createContractAnalysis({
          userId: req.user!.id,
          contractContent: contractText,
          contractTitle: title,
          score: analysisResult.score,
          riskLevel: analysisResult.riskLevel,
          analysisResults: analysisResult as any,
          jurisdiction,
          contractType,
          fileName: req.file.originalname,
          updatedAt: now,
          categories: analysisResult.clause_categories as any
        });
      }
      
      res.json(analysisResult);
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
      
      const comparison = await compareContracts(
        parsed.data.firstContract,
        parsed.data.secondContract
      );
      
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
      
      // Perform research with DeepSeek using all parameters, fallback to Claude if needed
      let results;
      try {
        // First try with DeepSeek
        results = await performLegalResearch(
          query,
          jurisdiction,
          practiceArea
        );
      } catch (aiError) {
        console.error("DeepSeek research error, falling back to Claude:", aiError);
        // Fall back to Claude if DeepSeek fails
        results = await performClaudeLegalResearch(
          query,
          jurisdiction,
          practiceArea
        );
      }
      
      // Save the research query with user ID and results
      const savedQuery = await storage.createResearchQuery({
        query,
        userId: req.user!.id,
        results: JSON.stringify(results),
        jurisdiction,
        practiceArea
      });
      
      res.status(201).json({
        ...savedQuery,
        results // Return parsed results directly
      });
    } catch (error) {
      console.error("Research error:", error);
      res.status(500).json({ message: "Error performing legal research" });
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
      
      // Ensure the dispute belongs to the requesting user
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
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
      
      // First verify that the dispute belongs to the user
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
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
      
      // First verify that the dispute belongs to the user
      const dispute = await storage.getDispute(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      if (dispute.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
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
          const { generateMediatorResponse, analyzeSentiment } = await import('./lib/mediationAI');
          
          // Generate AI response based on dispute context and message history
          const aiResponse = await generateMediatorResponse(
            dispute,
            previousMessages,
            message
          );
          
          // Analyze sentiment of the message (optional)
          const sentimentAnalysis = await analyzeSentiment(message.content);
          
          // Create the AI mediator message
          await storage.createMediationMessage({
            sessionId,
            userId: undefined, // AI doesn't have a user ID
            role: "ai",
            content: aiResponse,
            sentiment: sentimentAnalysis.sentiment
          });
        } catch (error) {
          console.error("AI mediator response generation error:", error);
          // Fall back to a simple response if AI generation fails
          await storage.createMediationMessage({
            sessionId,
            userId: undefined,
            role: "ai",
            content: "I'm processing your message. Let's continue our discussion to find a resolution.",
            sentiment: undefined
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
      const { generateSessionSummary } = await import('./lib/mediationAI');
      
      // Generate the session summary
      const summary = await generateSessionSummary(dispute, messages);
      
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

  // Import an external template
  app.post("/api/template-sources/import", isAuthenticated, async (req: Request, res: Response) => {
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
      if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "Missing AI API keys", 
          detail: "Both Anthropic and OpenAI API keys are missing. At least one is required for template generation."
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

  // Enhanced document generation with Anthropic
  app.post("/api/documents/enhanced", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const enhancedSchema = z.object({
        template: z.string().min(1),
        formData: z.record(z.any()),
        documentType: z.string().min(1),
        jurisdiction: z.string().optional(),
        saveDocument: z.boolean().optional(),
        title: z.string().optional()
      });
      
      const parsed = enhancedSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid enhanced document request" });
      }
      
      // Generate enhanced document with Anthropic
      const enhancedContent = await generateEnhancedDocument(
        parsed.data.template,
        parsed.data.formData,
        parsed.data.documentType,
        parsed.data.jurisdiction || 'Canada'
      );
      
      // Save document if requested
      if (parsed.data.saveDocument && parsed.data.title) {
        await storage.createGeneratedDocument({
          userId: req.user!.id,
          documentTitle: parsed.data.title,
          documentContent: enhancedContent.content,
          templateId: null, // External template, no direct DB reference
          documentData: {
            type: parsed.data.documentType,
            jurisdiction: parsed.data.jurisdiction || 'Canada',
            generatedWith: 'anthropic',
            formData: parsed.data.formData
          }
        });
      }
      
      res.json({ content: enhancedContent.content });
    } catch (error) {
      console.error("Enhanced document generation error:", error);
      res.status(500).json({ message: "Error generating enhanced document" });
    }
  });

  // Legal document analysis
  // Check if secret API keys are available
  app.get("/api/secrets/check", async (req: Request, res: Response) => {
    try {
      const key = req.query.key as string;
      
      if (!key) {
        return res.status(400).json({ message: "No key specified" });
      }
      
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

  const httpServer = createServer(app);
  return httpServer;
}

// Imported here to avoid circular dependencies
import { insertUserSchema } from "@shared/schema";
