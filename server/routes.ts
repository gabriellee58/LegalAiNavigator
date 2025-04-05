import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertResearchQuerySchema,
  insertGeneratedDocumentSchema
} from "@shared/schema";
import { z } from "zod";
import { generateAIResponse, analyzeContract, performLegalResearch } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }
      
      const existingUser = await storage.getUserByUsername(parsed.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(parsed.data);
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Chat message routes
  app.get("/api/chat/messages", async (req: Request, res: Response) => {
    try {
      // In a real app, get userId from session
      const userId = parseInt(req.query.userId as string) || 1;
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving chat messages" });
    }
  });

  app.post("/api/chat/messages", async (req: Request, res: Response) => {
    try {
      const parsed = insertChatMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      
      // Save the user message
      const userMessage = await storage.createChatMessage(parsed.data);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(parsed.data.content);
      
      // Save the AI message
      const aiMessage = await storage.createChatMessage({
        userId: parsed.data.userId,
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
  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const parsed = insertGeneratedDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid document data" });
      }
      
      const document = await storage.createGeneratedDocument(parsed.data);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Error creating document" });
    }
  });

  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      // In a real app, get userId from session
      const userId = parseInt(req.query.userId as string) || 1;
      const documents = await storage.getGeneratedDocumentsByUserId(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving documents" });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getGeneratedDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving document" });
    }
  });

  // Contract analysis
  app.post("/api/analyze-contract", async (req: Request, res: Response) => {
    try {
      const contractSchema = z.object({
        content: z.string().min(1)
      });
      
      const parsed = contractSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid contract data" });
      }
      
      const analysis = await analyzeContract(parsed.data.content);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Error analyzing contract" });
    }
  });

  // Legal research
  app.post("/api/research", async (req: Request, res: Response) => {
    try {
      const parsed = insertResearchQuerySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid research query" });
      }
      
      // Perform research with OpenAI
      const results = await performLegalResearch(parsed.data.query);
      
      // Update the query with results
      parsed.data.results = results;
      
      // Save the research query
      const savedQuery = await storage.createResearchQuery(parsed.data);
      
      res.status(201).json(savedQuery);
    } catch (error) {
      res.status(500).json({ message: "Error performing legal research" });
    }
  });

  app.get("/api/research", async (req: Request, res: Response) => {
    try {
      // In a real app, get userId from session
      const userId = parseInt(req.query.userId as string) || 1;
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
