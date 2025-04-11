import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, json, varchar } from "drizzle-orm/pg-core";
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
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  firebaseUid: text("firebase_uid").unique(), // For Google authentication
});

// Role schema
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens schema
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

const userSchema = createInsertSchema(users);
export const insertUserSchema = userSchema.pick({
  username: true,
  password: true,
  fullName: true,
  preferredLanguage: true,
  role: true,
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
  metadata: jsonb("metadata"), // Store error information or other metadata
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  role: true,
  content: true,
  metadata: true,
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
  attachments: jsonb("attachments"), // Optional file attachments
  readBy: jsonb("read_by"), // Array of userIds who have read the message
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediationMessageSchema = createInsertSchema(mediationMessages)
  .omit({ id: true, createdAt: true })
  .extend({
    userId: z.number().optional(),
    sentiment: z.string().optional(),
    attachments: z.any().optional(),
    readBy: z.any().optional(),
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
  // New collaborative features relations
  uploadedDocuments: many(sharedDocuments, { relationName: "uploader" }),
  documentComments: many(documentComments),
  settlementProposals: many(settlementProposals, { relationName: "proposer" }),
  digitalSignatures: many(digitalSignatures, { relationName: "user" }),
  disputeActivities: many(disputeActivities),
  // Court procedures relations
  userCourtProcedures: many(userCourtProcedures),
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
  // New collaborative features relations
  sharedDocuments: many(sharedDocuments),
  settlementProposals: many(settlementProposals),
  activities: many(disputeActivities),
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

// Shared documents for dispute resolution
export const sharedDocuments = pgTable("shared_documents", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").references(() => disputes.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  accessPermissions: jsonb("access_permissions"), // Array of party IDs who can access
  versionNumber: integer("version_number").default(1),
  previousVersionId: integer("previous_version_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertSharedDocumentSchema = createInsertSchema(sharedDocuments)
  .omit({ id: true, createdAt: true })
  .extend({
    accessPermissions: z.any().optional(),
    previousVersionId: z.number().optional(),
    updatedAt: z.date().optional(),
  });
  
export type InsertSharedDocument = z.infer<typeof insertSharedDocumentSchema>;
export type SharedDocument = typeof sharedDocuments.$inferSelect;

// Document comments for collaborative editing
export const documentComments = pgTable("document_comments", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => sharedDocuments.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  position: jsonb("position"), // Reference position in document (page, coordinates)
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertDocumentCommentSchema = createInsertSchema(documentComments)
  .omit({ id: true, createdAt: true })
  .extend({
    position: z.any().optional(),
    updatedAt: z.date().optional(),
  });
  
export type InsertDocumentComment = z.infer<typeof insertDocumentCommentSchema>;
export type DocumentComment = typeof documentComments.$inferSelect;

// Settlement proposals for dispute resolution
export const settlementProposals = pgTable("settlement_proposals", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").references(() => disputes.id, { onDelete: 'cascade' }),
  proposedBy: integer("proposed_by").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"), // 'draft', 'proposed', 'countered', 'accepted', 'rejected'
  documentId: integer("document_id").references(() => sharedDocuments.id),
  termsAndConditions: jsonb("terms_and_conditions"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertSettlementProposalSchema = createInsertSchema(settlementProposals)
  .omit({ id: true, createdAt: true })
  .extend({
    documentId: z.number().optional(),
    termsAndConditions: z.any().optional(),
    expiresAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });
  
export type InsertSettlementProposal = z.infer<typeof insertSettlementProposalSchema>;
export type SettlementProposal = typeof settlementProposals.$inferSelect;

// Digital signatures for settlement agreements
export const digitalSignatures = pgTable("digital_signatures", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => settlementProposals.id, { onDelete: 'cascade' }),
  partyId: integer("party_id").references(() => disputeParties.id),
  signedBy: integer("signed_by").references(() => users.id),
  signatureData: jsonb("signature_data").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  verificationCode: text("verification_code"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDigitalSignatureSchema = createInsertSchema(digitalSignatures)
  .omit({ id: true, createdAt: true, verifiedAt: true })
  .extend({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    verificationCode: z.string().optional(),
  });
  
export type InsertDigitalSignature = z.infer<typeof insertDigitalSignatureSchema>;
export type DigitalSignature = typeof digitalSignatures.$inferSelect;

// Activity tracking for engagement analytics
export const disputeActivities = pgTable("dispute_activities", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").references(() => disputes.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(), // 'login', 'message', 'document_view', 'document_upload', 'proposal_view', etc.
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDisputeActivitySchema = createInsertSchema(disputeActivities)
  .omit({ id: true, createdAt: true })
  .extend({
    details: z.any().optional(),
  });
  
export type InsertDisputeActivity = z.infer<typeof insertDisputeActivitySchema>;
export type DisputeActivity = typeof disputeActivities.$inferSelect;

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

// =========== Court Procedures Module =========== 

// Court procedure categories schema
export const courtProcedureCategories = pgTable("court_procedure_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // Icon identifier for UI
  slug: text("slug").notNull().unique(), // For URL friendly access
  order: integer("order").notNull().default(0), // For display ordering
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCourtProcedureCategorySchema = createInsertSchema(courtProcedureCategories)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    icon: z.string().optional(),
    updatedAt: z.date().optional(),
  });

export type InsertCourtProcedureCategory = z.infer<typeof insertCourtProcedureCategorySchema>;
export type CourtProcedureCategory = typeof courtProcedureCategories.$inferSelect;

// Court procedures schema
export const courtProcedures = pgTable("court_procedures", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => courtProcedureCategories.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  jurisdiction: text("jurisdiction").notNull().default("Canada"), // Federal or province-specific
  steps: jsonb("steps").notNull(), // Array of procedural steps
  flowchartData: jsonb("flowchart_data").notNull(), // JSON structure for flowchart visualization
  estimatedTimeframes: jsonb("estimated_timeframes"), // Time estimates for each step
  courtFees: jsonb("court_fees"), // Fee structure
  requirements: jsonb("requirements"), // Legal requirements for this procedure
  sourceName: text("source_name"), // Name of authoritative source
  sourceUrl: text("source_url"), // URL of source documentation
  relatedForms: jsonb("related_forms"), // Related document templates
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCourtProcedureSchema = createInsertSchema(courtProcedures)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    estimatedTimeframes: z.any().optional(),
    courtFees: z.any().optional(),
    requirements: z.any().optional(),
    sourceName: z.string().optional(),
    sourceUrl: z.string().optional(),
    relatedForms: z.any().optional(),
    updatedAt: z.date().optional(),
  });

export type InsertCourtProcedure = z.infer<typeof insertCourtProcedureSchema>;
export type CourtProcedure = typeof courtProcedures.$inferSelect;

// Court procedure steps schema - for detailed step information
export const courtProcedureSteps = pgTable("court_procedure_steps", {
  id: serial("id").primaryKey(),
  procedureId: integer("procedure_id").references(() => courtProcedures.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stepOrder: integer("step_order").notNull(),
  estimatedTime: text("estimated_time"), // Human-readable time estimate
  requiredDocuments: jsonb("required_documents"), // Documents needed for this step
  instructions: text("instructions"), // Detailed instructions
  tips: jsonb("tips"), // Array of helpful tips
  warnings: jsonb("warnings"), // Array of important warnings
  fees: jsonb("fees"), // Fees specific to this step
  isOptional: boolean("is_optional").default(false),
  nextStepIds: jsonb("next_step_ids"), // Array of possible next steps
  alternatePathInfo: text("alternate_path_info"), // Description of alternate paths
  sourceReferences: jsonb("source_references"), // References to legal sources
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCourtProcedureStepSchema = createInsertSchema(courtProcedureSteps)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    estimatedTime: z.string().optional(),
    requiredDocuments: z.any().optional(),
    instructions: z.string().optional(),
    tips: z.any().optional(),
    warnings: z.any().optional(),
    fees: z.any().optional(),
    isOptional: z.boolean().optional(),
    nextStepIds: z.any().optional(),
    alternatePathInfo: z.string().optional(),
    sourceReferences: z.any().optional(),
    updatedAt: z.date().optional(),
  });

export type InsertCourtProcedureStep = z.infer<typeof insertCourtProcedureStepSchema>;
export type CourtProcedureStep = typeof courtProcedureSteps.$inferSelect;

// User court procedure tracking
export const userCourtProcedures = pgTable("user_court_procedures", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  procedureId: integer("procedure_id").references(() => courtProcedures.id),
  currentStepId: integer("current_step_id").references(() => courtProcedureSteps.id),
  title: text("title").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, completed, abandoned
  progress: integer("progress").notNull().default(0), // 0-100 percent
  completedSteps: jsonb("completed_steps"), // Array of completed step IDs
  startedAt: timestamp("started_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  expectedCompletionDate: timestamp("expected_completion_date"),
  completedAt: timestamp("completed_at"),
  caseSpecificData: jsonb("case_specific_data"), // Case-specific information
});

export const insertUserCourtProcedureSchema = createInsertSchema(userCourtProcedures)
  .omit({ id: true, startedAt: true, lastActivityAt: true, completedAt: true })
  .extend({
    notes: z.string().optional(),
    completedSteps: z.any().optional(),
    expectedCompletionDate: z.date().optional(),
    caseSpecificData: z.any().optional(),
  });

export type InsertUserCourtProcedure = z.infer<typeof insertUserCourtProcedureSchema>;
export type UserCourtProcedure = typeof userCourtProcedures.$inferSelect;

// Define relations for court procedures
export const courtProcedureCategoriesRelations = relations(courtProcedureCategories, ({ many }) => ({
  procedures: many(courtProcedures),
}));

export const courtProceduresRelations = relations(courtProcedures, ({ one, many }) => ({
  category: one(courtProcedureCategories, {
    fields: [courtProcedures.categoryId],
    references: [courtProcedureCategories.id],
  }),
  steps: many(courtProcedureSteps),
  userProcedures: many(userCourtProcedures),
}));

export const courtProcedureStepsRelations = relations(courtProcedureSteps, ({ one }) => ({
  procedure: one(courtProcedures, {
    fields: [courtProcedureSteps.procedureId],
    references: [courtProcedures.id],
  }),
}));

export const userCourtProceduresRelations = relations(userCourtProcedures, ({ one }) => ({
  user: one(users, {
    fields: [userCourtProcedures.userId],
    references: [users.id],
  }),
  procedure: one(courtProcedures, {
    fields: [userCourtProcedures.procedureId],
    references: [courtProcedures.id],
  }),
  currentStep: one(courtProcedureSteps, {
    fields: [userCourtProcedures.currentStepId],
    references: [courtProcedureSteps.id],
  }),
}));

// Relations for collaborative features
export const sharedDocumentsRelations = relations(sharedDocuments, ({ one, many }) => ({
  dispute: one(disputes, {
    fields: [sharedDocuments.disputeId],
    references: [disputes.id],
  }),
  uploader: one(users, {
    fields: [sharedDocuments.uploadedBy],
    references: [users.id],
  }),
  comments: many(documentComments),
  settlementProposals: many(settlementProposals),
}));

export const documentCommentsRelations = relations(documentComments, ({ one }) => ({
  document: one(sharedDocuments, {
    fields: [documentComments.documentId],
    references: [sharedDocuments.id],
  }),
  user: one(users, {
    fields: [documentComments.userId],
    references: [users.id],
  }),
}));

export const settlementProposalsRelations = relations(settlementProposals, ({ one, many }) => ({
  dispute: one(disputes, {
    fields: [settlementProposals.disputeId],
    references: [disputes.id],
  }),
  proposer: one(users, {
    fields: [settlementProposals.proposedBy],
    references: [users.id],
  }),
  document: one(sharedDocuments, {
    fields: [settlementProposals.documentId],
    references: [sharedDocuments.id],
  }),
  signatures: many(digitalSignatures),
}));

export const digitalSignaturesRelations = relations(digitalSignatures, ({ one }) => ({
  proposal: one(settlementProposals, {
    fields: [digitalSignatures.proposalId],
    references: [settlementProposals.id],
  }),
  party: one(disputeParties, {
    fields: [digitalSignatures.partyId],
    references: [disputeParties.id],
  }),
  user: one(users, {
    fields: [digitalSignatures.signedBy],
    references: [users.id],
  }),
}));

export const disputeActivitiesRelations = relations(disputeActivities, ({ one }) => ({
  dispute: one(disputes, {
    fields: [disputeActivities.disputeId],
    references: [disputes.id],
  }),
  user: one(users, {
    fields: [disputeActivities.userId],
    references: [users.id],
  }),
}));

// AI response cache schema for performance optimization
export const aiResponseCache = pgTable("ai_response_cache", {
  id: serial("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'anthropic', 'openai', 'deepseek'
  modelName: varchar("model_name", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  options: jsonb("options").default({}),
  accessCount: integer("access_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

export const insertAiResponseCacheSchema = createInsertSchema(aiResponseCache).omit({
  id: true,
  createdAt: true,
  lastAccessed: true,
});

export type InsertAiResponseCache = z.infer<typeof insertAiResponseCacheSchema>;
export type AiResponseCache = typeof aiResponseCache.$inferSelect;
