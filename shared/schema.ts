import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
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
  firebaseUid: text("firebase_uid").unique(), // For Google authentication
});

const userSchema = createInsertSchema(users);
export const insertUserSchema = userSchema.pick({
  username: true,
  password: true,
  fullName: true,
  preferredLanguage: true,
  firebaseUid: true,
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
  templateType: text("template_type").notNull(), // Main category: 'family', 'immigration', 'employment', etc.
  subcategory: text("subcategory"), // Subcategory: 'divorce', 'child-custody', etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  language: text("language").notNull().default("en"), // 'en' or 'fr'
  templateContent: text("template_content").notNull(),
  fields: jsonb("fields").notNull(), // Required fields for template generation
  jurisdiction: text("jurisdiction").default("Canada"), // Jurisdiction: 'Canada', 'Ontario', etc.
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).pick({
  templateType: true,
  subcategory: true,
  title: true,
  description: true,
  language: true,
  templateContent: true,
  fields: true,
  jurisdiction: true,
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
  jurisdiction: text("jurisdiction").default("canada"),
  practiceArea: text("practice_area").default("all"),
  results: jsonb("results"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertResearchQuerySchema = createInsertSchema(researchQueries).pick({
  userId: true,
  query: true,
  jurisdiction: true,
  practiceArea: true,
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
  jurisdiction: text("jurisdiction").default('Canada'),
  contractType: text("contract_type").default('general'),
  fileName: text("file_name"),
  updatedAt: timestamp("updated_at"),
  categories: jsonb("categories"),
});

export const insertContractAnalysisSchema = createInsertSchema(contractAnalyses).pick({
  userId: true,
  contractContent: true,
  contractTitle: true,
  score: true,
  riskLevel: true,
  analysisResults: true,
  jurisdiction: true,
  contractType: true,
  fileName: true,
  updatedAt: true,
  categories: true,
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

// Dispute resolution schema
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  parties: text("parties").notNull(), // Legacy field, kept for backward compatibility
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'mediation', 'resolved', 'closed'
  disputeType: text("dispute_type").notNull(), // 'landlord_tenant', 'employment', 'contract', 'family', 'business', 'other'
  supportingDocuments: jsonb("supporting_documents"),
  aiAnalysis: jsonb("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  mediationId: integer("mediation_id"),
});

// Dispute parties schema
export const disputeParties = pgTable("dispute_parties", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").references(() => disputes.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // 'claimant', 'respondent', 'mediator', 'witness', 'representative', etc.
  userId: integer("user_id").references(() => users.id), // If the party has a user account
  status: text("status").notNull().default("invited"), // 'invited', 'active', 'declined'
  invitationCode: uuid("invitation_code").defaultRandom().notNull(),
  verified: boolean("verified").default(false),
  verificationStatus: text("verification_status").default("pending"),
  verificationDocuments: jsonb("verification_documents"),
  notificationPreferences: jsonb("notification_preferences").default({
    email: true,
    inApp: true,
    textMessages: false
  }),
  contactAddress: text("contact_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  lastActiveAt: timestamp("last_active_at"),
});

export const insertDisputePartySchema = createInsertSchema(disputeParties).pick({
  disputeId: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  userId: true,
  status: true,
  verificationStatus: true,
  invitationCode: true,
  verified: true,
  contactAddress: true,
  verificationDocuments: true,
  notificationPreferences: true,
}).extend({
  userId: z.number().optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
  verificationStatus: z.string().optional(),
  invitationCode: z.string().optional(),
  verified: z.boolean().optional(),
  contactAddress: z.string().optional(),
  verificationDocuments: z.any().optional(),
  notificationPreferences: z.any().optional(),
  updatedAt: z.date().optional(),
});

export type InsertDisputeParty = z.infer<typeof insertDisputePartySchema>;
export type DisputeParty = typeof disputeParties.$inferSelect;

export const insertDisputeSchema = createInsertSchema(disputes).pick({
  userId: true,
  title: true,
  description: true,
  parties: true,
  disputeType: true,
  supportingDocuments: true,
});

export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;

// Mediation sessions schema
export const mediationSessions = pgTable("mediation_sessions", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").references(() => disputes.id, { onDelete: 'cascade' }),
  mediatorId: integer("mediator_id").references(() => users.id),
  sessionCode: text("session_code").notNull().unique(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  summary: text("summary"),
  recommendations: jsonb("recommendations"),
  aiAssistance: boolean("ai_assistance").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediationSessionSchema = createInsertSchema(mediationSessions)
  .omit({ id: true, createdAt: true, completedAt: true, summary: true, recommendations: true })
  .extend({
    mediatorId: z.number().optional(),
  });

export type InsertMediationSession = z.infer<typeof insertMediationSessionSchema>;
export type MediationSession = typeof mediationSessions.$inferSelect;

// Mediation messages schema for real-time mediation
export const mediationMessages = pgTable("mediation_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => mediationSessions.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(), // 'user', 'mediator', 'ai'
  content: text("content").notNull(),
  sentiment: text("sentiment"), // Optional AI analysis of message sentiment
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediationMessageSchema = createInsertSchema(mediationMessages)
  .omit({ id: true, createdAt: true })
  .extend({
    userId: z.number().optional(),
    sentiment: z.string().optional(),
  });

export type InsertMediationMessage = z.infer<typeof insertMediationMessageSchema>;
export type MediationMessage = typeof mediationMessages.$inferSelect;

// Define relations after all tables are defined
// Saved legal citations schema
export const savedCitations = pgTable("saved_citations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  citation: text("citation").notNull(),
  sourceName: text("source_name"),
  sourceUrl: text("source_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedCitationSchema = createInsertSchema(savedCitations).pick({
  userId: true,
  name: true,
  citation: true,
  sourceName: true, 
  sourceUrl: true,
  notes: true,
});

export type InsertSavedCitation = z.infer<typeof insertSavedCitationSchema>;
export type SavedCitation = typeof savedCitations.$inferSelect;

// Research visualization schema
export const researchVisualizations = pgTable("research_visualizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  queryId: integer("query_id").references(() => researchQueries.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  visualizationType: text("visualization_type").notNull(), // 'network', 'timeline', 'hierarchy', etc.
  visualizationData: jsonb("visualization_data").notNull(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertResearchVisualizationSchema = createInsertSchema(researchVisualizations).pick({
  userId: true,
  queryId: true,
  title: true,
  description: true,
  visualizationType: true,
  visualizationData: true,
  isPublic: true,
  updatedAt: true,
});

export type InsertResearchVisualization = z.infer<typeof insertResearchVisualizationSchema>;
export type ResearchVisualization = typeof researchVisualizations.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  chatMessages: many(chatMessages),
  generatedDocuments: many(generatedDocuments),
  researchQueries: many(researchQueries),
  contractAnalyses: many(contractAnalyses),
  complianceChecks: many(complianceChecks),
  disputes: many(disputes),
  mediatedSessions: many(mediationSessions, { relationName: "mediator" }),
  mediationMessages: many(mediationMessages),
  savedCitations: many(savedCitations),
  researchVisualizations: many(researchVisualizations),
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

export const researchQueriesRelations = relations(researchQueries, ({ one, many }) => ({
  user: one(users, {
    fields: [researchQueries.userId],
    references: [users.id],
  }),
  visualizations: many(researchVisualizations),
}));

export const savedCitationsRelations = relations(savedCitations, ({ one }) => ({
  user: one(users, {
    fields: [savedCitations.userId],
    references: [users.id],
  }),
}));

export const researchVisualizationsRelations = relations(researchVisualizations, ({ one }) => ({
  user: one(users, {
    fields: [researchVisualizations.userId],
    references: [users.id],
  }),
  query: one(researchQueries, {
    fields: [researchVisualizations.queryId],
    references: [researchQueries.id],
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

export const disputesRelations = relations(disputes, ({ one, many }) => ({
  user: one(users, {
    fields: [disputes.userId],
    references: [users.id],
  }),
  mediationSessions: many(mediationSessions),
  parties: many(disputeParties),
}));

export const disputePartiesRelations = relations(disputeParties, ({ one }) => ({
  dispute: one(disputes, {
    fields: [disputeParties.disputeId],
    references: [disputes.id],
  }),
  user: one(users, {
    fields: [disputeParties.userId],
    references: [users.id],
  }),
}));

export const mediationSessionsRelations = relations(mediationSessions, ({ one, many }) => ({
  dispute: one(disputes, {
    fields: [mediationSessions.disputeId],
    references: [disputes.id],
  }),
  mediator: one(users, {
    fields: [mediationSessions.mediatorId],
    references: [users.id],
    relationName: "mediator",
  }),
  messages: many(mediationMessages),
}));

export const mediationMessagesRelations = relations(mediationMessages, ({ one }) => ({
  session: one(mediationSessions, {
    fields: [mediationMessages.sessionId],
    references: [mediationSessions.id],
  }),
  user: one(users, {
    fields: [mediationMessages.userId],
    references: [users.id],
  }),
}));

// Legal domain knowledge schema for specialized assistant
export const legalDomains = pgTable("legal_domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  parentId: integer("parent_id"),
  resources: jsonb("resources"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertLegalDomainSchema = createInsertSchema(legalDomains).pick({
  name: true,
  description: true,
  parentId: true,
  resources: true,
  updatedAt: true,
});

export type InsertLegalDomain = z.infer<typeof insertLegalDomainSchema>;
export type LegalDomain = typeof legalDomains.$inferSelect;

// Specialized domain knowledge for enhanced assistant
export const domainKnowledge = pgTable("domain_knowledge", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => legalDomains.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  language: text("language").default("en"),
  jurisdiction: text("jurisdiction").default("canada"),
  tags: jsonb("tags"),
  relevanceScore: integer("relevance_score").default(0),
  sources: jsonb("sources"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Provincial-specific legal information
export const provincialInfo = pgTable("provincial_info", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => legalDomains.id, { onDelete: 'cascade' }),
  province: text("province").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  language: text("language").default("en"),
  keyLegislation: jsonb("key_legislation"),
  resources: jsonb("resources"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertDomainKnowledgeSchema = createInsertSchema(domainKnowledge).pick({
  domainId: true,
  question: true,
  answer: true,
  language: true,
  jurisdiction: true,
  tags: true,
  relevanceScore: true,
  sources: true,
  updatedAt: true,
});

export type InsertDomainKnowledge = z.infer<typeof insertDomainKnowledgeSchema>;
export type DomainKnowledge = typeof domainKnowledge.$inferSelect;

export const insertProvincialInfoSchema = createInsertSchema(provincialInfo).pick({
  domainId: true,
  province: true,
  title: true,
  content: true,
  language: true,
  keyLegislation: true,
  resources: true,
  updatedAt: true,
});

export type InsertProvincialInfo = z.infer<typeof insertProvincialInfoSchema>;
export type ProvincialInfo = typeof provincialInfo.$inferSelect;

// Procedural guidance for step-by-step instructions
export const proceduralGuides = pgTable("procedural_guides", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => legalDomains.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  steps: jsonb("steps").notNull(),
  jurisdiction: text("jurisdiction").default("canada"),
  language: text("language").default("en"),
  estimatedTime: text("estimated_time"),
  prerequisites: jsonb("prerequisites"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertProceduralGuideSchema = createInsertSchema(proceduralGuides).pick({
  domainId: true,
  title: true,
  description: true,
  steps: true,
  jurisdiction: true,
  language: true,
  estimatedTime: true,
  prerequisites: true,
  updatedAt: true,
});

export type InsertProceduralGuide = z.infer<typeof insertProceduralGuideSchema>;
export type ProceduralGuide = typeof proceduralGuides.$inferSelect;

// Escalation tracking for complex legal questions
export const escalatedQuestions = pgTable("escalated_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  context: text("context").notNull(),
  domainId: integer("domain_id").references(() => legalDomains.id),
  status: text("status").notNull().default("pending"), // 'pending', 'assigned', 'answered', 'closed'
  assignedTo: text("assigned_to"),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  resolvedAt: timestamp("resolved_at"),
});

export const insertEscalatedQuestionSchema = createInsertSchema(escalatedQuestions).pick({
  userId: true,
  question: true,
  context: true,
  domainId: true,
  status: true,
  assignedTo: true,
  answer: true,
  updatedAt: true,
  resolvedAt: true,
});

export type InsertEscalatedQuestion = z.infer<typeof insertEscalatedQuestionSchema>;
export type EscalatedQuestion = typeof escalatedQuestions.$inferSelect;

// Conversation context tracking
export const conversationContexts = pgTable("conversation_contexts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  domainId: integer("domain_id").references(() => legalDomains.id),
  context: jsonb("context").notNull(),
  activeGuideId: integer("active_guide_id").references(() => proceduralGuides.id),
  currentStep: integer("current_step").default(0),
  recommendedTemplates: jsonb("recommended_templates"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertConversationContextSchema = createInsertSchema(conversationContexts).pick({
  userId: true,
  domainId: true,
  context: true,
  activeGuideId: true,
  currentStep: true,
  recommendedTemplates: true,
  updatedAt: true,
});

export type InsertConversationContext = z.infer<typeof insertConversationContextSchema>;
export type ConversationContext = typeof conversationContexts.$inferSelect;

// Predictive case outcomes for legal analytics
export const caseOutcomePredictions = pgTable("case_outcome_predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  caseType: text("case_type").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  factorData: jsonb("factor_data").notNull(),
  predictedOutcome: text("predicted_outcome").notNull(),
  confidenceScore: text("confidence_score").notNull(),
  similarCases: jsonb("similar_cases"),
  visualizationData: jsonb("visualization_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCaseOutcomePredictionSchema = createInsertSchema(caseOutcomePredictions).pick({
  userId: true,
  caseType: true,
  jurisdiction: true,
  factorData: true,
  predictedOutcome: true,
  confidenceScore: true,
  similarCases: true,
  visualizationData: true,
  updatedAt: true,
});

export type InsertCaseOutcomePrediction = z.infer<typeof insertCaseOutcomePredictionSchema>;
export type CaseOutcomePrediction = typeof caseOutcomePredictions.$inferSelect;

// Relations for new tables
export const legalDomainsRelations = relations(legalDomains, ({ one, many }) => ({
  parentDomain: one(legalDomains, {
    fields: [legalDomains.parentId],
    references: [legalDomains.id],
  }),
  subdomains: many(legalDomains),
  domainKnowledge: many(domainKnowledge),
  proceduralGuides: many(proceduralGuides),
  conversationContexts: many(conversationContexts),
  provincialInfo: many(provincialInfo),
}));

export const domainKnowledgeRelations = relations(domainKnowledge, ({ one }) => ({
  domain: one(legalDomains, {
    fields: [domainKnowledge.domainId],
    references: [legalDomains.id],
  }),
}));

export const proceduralGuidesRelations = relations(proceduralGuides, ({ one, many }) => ({
  domain: one(legalDomains, {
    fields: [proceduralGuides.domainId],
    references: [legalDomains.id],
  }),
  activeConversations: many(conversationContexts),
}));

export const escalatedQuestionsRelations = relations(escalatedQuestions, ({ one }) => ({
  user: one(users, {
    fields: [escalatedQuestions.userId],
    references: [users.id],
  }),
  domain: one(legalDomains, {
    fields: [escalatedQuestions.domainId],
    references: [legalDomains.id],
  }),
}));

export const conversationContextsRelations = relations(conversationContexts, ({ one }) => ({
  user: one(users, {
    fields: [conversationContexts.userId],
    references: [users.id],
  }),
  domain: one(legalDomains, {
    fields: [conversationContexts.domainId],
    references: [legalDomains.id],
  }),
  activeGuide: one(proceduralGuides, {
    fields: [conversationContexts.activeGuideId],
    references: [proceduralGuides.id],
  }),
}));

export const provincialInfoRelations = relations(provincialInfo, ({ one }) => ({
  domain: one(legalDomains, {
    fields: [provincialInfo.domainId],
    references: [legalDomains.id],
  }),
}));

export const caseOutcomePredictionsRelations = relations(caseOutcomePredictions, ({ one }) => ({
  user: one(users, {
    fields: [caseOutcomePredictions.userId],
    references: [users.id],
  }),
}));

// User feedback table for collecting ratings, suggestions, and questions
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  type: text("type").notNull(), // 'rating', 'suggestion', 'question'
  contextType: text("context_type").notNull(), // 'general', 'document', 'guide', 'domain', 'research'
  contextId: integer("context_id"),
  contextTitle: text("context_title"),
  rating: integer("rating"),
  content: text("content").notNull(),
  status: text("status").default("new"), // 'new', 'reviewed', 'addressed', 'closed'
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  respondedAt: timestamp("responded_at"),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).pick({
  userId: true,
  type: true,
  contextType: true,
  contextId: true,
  contextTitle: true,
  rating: true,
  content: true,
  status: true,
  response: true,
  updatedAt: true,
  respondedAt: true,
});

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(users, {
    fields: [userFeedback.userId],
    references: [users.id],
  }),
}));
