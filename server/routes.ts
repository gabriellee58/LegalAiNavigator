import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertResearchQuerySchema,
  insertGeneratedDocumentSchema,
  insertDisputeSchema,
  insertMediationSessionSchema,
  insertMediationMessageSchema
} from "@shared/schema";
import { z } from "zod";
import { generateAIResponse, performLegalResearch } from "./lib/openai";
import { analyzeContract, compareContracts } from "./lib/contractAnalysis";
import { setupAuth } from "./auth";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

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
      
      // Generate AI response
      const aiResponse = await generateAIResponse(parsed.data.content);
      
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
        templates = await storage.getDocumentTemplatesByType(templateType, language);
      } else {
        templates = await storage.getDocumentTemplates(language);
      }
      
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving document templates" });
    }
  });

  app.get("/api/document-templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getDocumentTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving document template" });
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

  // Contract analysis
  app.post("/api/analyze-contract", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const contractSchema = z.object({
        content: z.string().min(1),
        save: z.boolean().optional(),
        title: z.string().optional()
      });
      
      const parsed = contractSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid contract data" });
      }
      
      // Analyze the contract
      const analysisResult = await analyzeContract(parsed.data.content);
      
      // Save the analysis result if requested
      if (parsed.data.save && parsed.data.title) {
        await storage.createContractAnalysis({
          userId: req.user!.id,
          contractContent: parsed.data.content,
          contractTitle: parsed.data.title,
          score: analysisResult.score,
          riskLevel: analysisResult.riskLevel,
          analysisResults: analysisResult as any, // Converting to jsonb
        });
      }
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Contract analysis error:", error);
      res.status(500).json({ message: "Error analyzing contract" });
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
      // Validate research query without userId
      const researchSchema = insertResearchQuerySchema.omit({ userId: true });
      const parsed = researchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid research query" });
      }
      
      // Perform research with OpenAI
      const results = await performLegalResearch(parsed.data.query);
      
      // Save the research query with user ID and results
      const savedQuery = await storage.createResearchQuery({
        ...parsed.data,
        userId: req.user!.id,
        results
      });
      
      res.status(201).json(savedQuery);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}

// Imported here to avoid circular dependencies
import { insertUserSchema } from "@shared/schema";
