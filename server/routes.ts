import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertResearchQuerySchema,
  insertGeneratedDocumentSchema
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

  const httpServer = createServer(app);
  return httpServer;
}

// Imported here to avoid circular dependencies
import { insertUserSchema } from "@shared/schema";
