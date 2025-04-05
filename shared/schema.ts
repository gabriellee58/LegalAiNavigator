import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

const userSchema = createInsertSchema(users);
export const insertUserSchema = userSchema.pick({
  username: true,
  password: true,
  fullName: true,
  preferredLanguage: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chat history schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  role: true,
  content: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Document templates schema
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  templateType: text("template_type").notNull(), // 'contract', 'will', 'lease', etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  language: text("language").notNull().default("en"), // 'en' or 'fr'
  templateContent: text("template_content").notNull(),
  fields: jsonb("fields").notNull(), // Required fields for template generation
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).pick({
  templateType: true,
  title: true,
  description: true,
  language: true,
  templateContent: true,
  fields: true,
});

export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

// User generated documents schema
export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  templateId: integer("template_id").references(() => documentTemplates.id),
  documentContent: text("document_content").notNull(),
  documentTitle: text("document_title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  documentData: jsonb("document_data"), // Form data used to generate document
});

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments).pick({
  userId: true,
  templateId: true,
  documentContent: true,
  documentTitle: true,
  documentData: true,
});

export type InsertGeneratedDocument = z.infer<typeof insertGeneratedDocumentSchema>;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;

// Legal research queries schema
export const researchQueries = pgTable("research_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  query: text("query").notNull(),
  results: jsonb("results"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertResearchQuerySchema = createInsertSchema(researchQueries).pick({
  userId: true,
  query: true,
  results: true,
});

export type InsertResearchQuery = z.infer<typeof insertResearchQuerySchema>;
export type ResearchQuery = typeof researchQueries.$inferSelect;

// Contract analysis results schema
export const contractAnalyses = pgTable("contract_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  contractContent: text("contract_content").notNull(),
  contractTitle: text("contract_title").notNull(),
  score: integer("score").notNull(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high'
  analysisResults: jsonb("analysis_results").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContractAnalysisSchema = createInsertSchema(contractAnalyses).pick({
  userId: true,
  contractContent: true,
  contractTitle: true,
  score: true,
  riskLevel: true,
  analysisResults: true,
});

export type InsertContractAnalysis = z.infer<typeof insertContractAnalysisSchema>;
export type ContractAnalysis = typeof contractAnalyses.$inferSelect;

// Business compliance checks schema
export const complianceChecks = pgTable("compliance_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  businessType: text("business_type").notNull(),
  jurisdiction: text("jurisdiction").notNull(), // Province/territory code
  complianceArea: text("compliance_area").notNull(), // 'tax', 'employment', 'licensing', etc.
  checkResults: jsonb("check_results").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).pick({
  userId: true,
  businessType: true,
  jurisdiction: true,
  complianceArea: true,
  checkResults: true,
  completed: true,
});

export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;
export type ComplianceCheck = typeof complianceChecks.$inferSelect;

// Define relations after all tables are defined
export const usersRelations = relations(users, ({ many }) => ({
  chatMessages: many(chatMessages),
  generatedDocuments: many(generatedDocuments),
  researchQueries: many(researchQueries),
  contractAnalyses: many(contractAnalyses),
  complianceChecks: many(complianceChecks),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const documentTemplatesRelations = relations(documentTemplates, ({ many }) => ({
  generatedDocuments: many(generatedDocuments),
}));

export const generatedDocumentsRelations = relations(generatedDocuments, ({ one }) => ({
  user: one(users, {
    fields: [generatedDocuments.userId],
    references: [users.id],
  }),
  template: one(documentTemplates, {
    fields: [generatedDocuments.templateId],
    references: [documentTemplates.id],
  }),
}));

export const researchQueriesRelations = relations(researchQueries, ({ one }) => ({
  user: one(users, {
    fields: [researchQueries.userId],
    references: [users.id],
  }),
}));

export const contractAnalysesRelations = relations(contractAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [contractAnalyses.userId],
    references: [users.id],
  }),
}));

export const complianceChecksRelations = relations(complianceChecks, ({ one }) => ({
  user: one(users, {
    fields: [complianceChecks.userId],
    references: [users.id],
  }),
}));
