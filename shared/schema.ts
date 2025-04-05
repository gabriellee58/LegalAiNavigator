import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
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
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
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
