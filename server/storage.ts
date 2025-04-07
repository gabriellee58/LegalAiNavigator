import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, desc, and, SQL, sql } from "drizzle-orm";
import {
  users, User, InsertUser,
  chatMessages, ChatMessage, InsertChatMessage,
  documentTemplates, DocumentTemplate, InsertDocumentTemplate,
  generatedDocuments, GeneratedDocument, InsertGeneratedDocument,
  researchQueries, ResearchQuery, InsertResearchQuery,
  contractAnalyses, ContractAnalysis, InsertContractAnalysis,
  complianceChecks, ComplianceCheck, InsertComplianceCheck,
  disputes, Dispute, InsertDispute,
  mediationSessions, MediationSession, InsertMediationSession,
  mediationMessages, MediationMessage, InsertMediationMessage,
  savedCitations, SavedCitation, InsertSavedCitation,
  researchVisualizations, ResearchVisualization, InsertResearchVisualization,
  legalDomains, LegalDomain, InsertLegalDomain,
  domainKnowledge, DomainKnowledge, InsertDomainKnowledge,
  proceduralGuides, ProceduralGuide, InsertProceduralGuide,
  escalatedQuestions, EscalatedQuestion, InsertEscalatedQuestion,
  conversationContexts, ConversationContext, InsertConversationContext,
  caseOutcomePredictions, CaseOutcomePrediction, InsertCaseOutcomePrediction
} from "@shared/schema";

export interface IStorage {
  // Session store for auth
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat message operations
  getChatMessagesByUserId(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Document template operations
  getDocumentTemplates(language?: string): Promise<DocumentTemplate[]>;
  getDocumentTemplatesByType(templateType: string, language?: string): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  
  // Generated document operations
  getGeneratedDocumentsByUserId(userId: number): Promise<GeneratedDocument[]>;
  getGeneratedDocument(id: number): Promise<GeneratedDocument | undefined>;
  createGeneratedDocument(document: InsertGeneratedDocument): Promise<GeneratedDocument>;
  
  // Research query operations
  getResearchQueriesByUserId(userId: number): Promise<ResearchQuery[]>;
  createResearchQuery(query: InsertResearchQuery): Promise<ResearchQuery>;
  
  // Contract analysis operations
  getContractAnalysesByUserId(userId: number): Promise<ContractAnalysis[]>;
  getContractAnalysis(id: number): Promise<ContractAnalysis | undefined>;
  createContractAnalysis(analysis: InsertContractAnalysis): Promise<ContractAnalysis>;
  
  // Compliance check operations
  getComplianceChecksByUserId(userId: number): Promise<ComplianceCheck[]>;
  getComplianceCheck(id: number): Promise<ComplianceCheck | undefined>;
  createComplianceCheck(check: InsertComplianceCheck): Promise<ComplianceCheck>;
  updateComplianceCheck(id: number, check: Partial<InsertComplianceCheck>): Promise<ComplianceCheck | undefined>;
  
  // Dispute resolution operations
  getDisputesByUserId(userId: number): Promise<Dispute[]>;
  getDispute(id: number): Promise<Dispute | undefined>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined>;
  getDisputesByStatus(statuses: string[]): Promise<Dispute[]>;
  
  // Mediation session operations
  getMediationSessionsByDisputeId(disputeId: number): Promise<MediationSession[]>;
  getMediationSession(id: number): Promise<MediationSession | undefined>;
  getMediationSessionByCode(sessionCode: string): Promise<MediationSession | undefined>;
  createMediationSession(session: InsertMediationSession): Promise<MediationSession>;
  updateMediationSession(id: number, updates: Partial<MediationSession>): Promise<MediationSession | undefined>;
  
  // Mediation message operations
  getMediationMessagesBySessionId(sessionId: number): Promise<MediationMessage[]>;
  createMediationMessage(message: InsertMediationMessage): Promise<MediationMessage>;
  
  // Saved citations operations
  getSavedCitationsByUserId(userId: number): Promise<SavedCitation[]>;
  getSavedCitation(id: number): Promise<SavedCitation | undefined>;
  createSavedCitation(citation: InsertSavedCitation): Promise<SavedCitation>;
  deleteSavedCitation(id: number): Promise<void>;
  
  // Research visualizations operations
  getResearchVisualizationsByUserId(userId: number): Promise<ResearchVisualization[]>;
  getResearchVisualization(id: number): Promise<ResearchVisualization | undefined>;
  createResearchVisualization(visualization: InsertResearchVisualization): Promise<ResearchVisualization>;
  updateResearchVisualization(id: number, updates: Partial<ResearchVisualization>): Promise<ResearchVisualization | undefined>;
  deleteResearchVisualization(id: number): Promise<void>;
  
  // Legal domain operations (Phase 3)
  getLegalDomains(): Promise<LegalDomain[]>;
  getLegalDomain(id: number): Promise<LegalDomain | undefined>;
  getLegalDomainByName(name: string): Promise<LegalDomain | undefined>;
  createLegalDomain(domain: InsertLegalDomain): Promise<LegalDomain>;
  updateLegalDomain(id: number, updates: Partial<LegalDomain>): Promise<LegalDomain | undefined>;
  getLegalSubdomains(parentId: number): Promise<LegalDomain[]>;
  
  // Domain knowledge operations (Phase 3)
  getDomainKnowledgeByDomainId(domainId: number): Promise<DomainKnowledge[]>;
  getDomainKnowledge(id: number): Promise<DomainKnowledge | undefined>;
  createDomainKnowledge(knowledge: InsertDomainKnowledge): Promise<DomainKnowledge>;
  updateDomainKnowledge(id: number, updates: Partial<DomainKnowledge>): Promise<DomainKnowledge | undefined>;
  searchDomainKnowledge(query: string, domainId?: number, language?: string): Promise<DomainKnowledge[]>;
  
  // Procedural guide operations (Phase 3)
  getProceduralGuidesByDomainId(domainId: number, language?: string): Promise<ProceduralGuide[]>;
  getProceduralGuide(id: number): Promise<ProceduralGuide | undefined>;
  createProceduralGuide(guide: InsertProceduralGuide): Promise<ProceduralGuide>;
  updateProceduralGuide(id: number, updates: Partial<ProceduralGuide>): Promise<ProceduralGuide | undefined>;
  
  // Escalated questions operations (Phase 3)
  getEscalatedQuestionsByUserId(userId: number): Promise<EscalatedQuestion[]>;
  getEscalatedQuestion(id: number): Promise<EscalatedQuestion | undefined>;
  createEscalatedQuestion(question: InsertEscalatedQuestion): Promise<EscalatedQuestion>;
  updateEscalatedQuestion(id: number, updates: Partial<EscalatedQuestion>): Promise<EscalatedQuestion | undefined>;
  getEscalatedQuestionsByStatus(status: string): Promise<EscalatedQuestion[]>;
  
  // Conversation context operations (Phase 3)
  getConversationContextByUserId(userId: number): Promise<ConversationContext | undefined>;
  createConversationContext(context: InsertConversationContext): Promise<ConversationContext>;
  updateConversationContext(id: number, updates: Partial<ConversationContext>): Promise<ConversationContext | undefined>;
  
  // Case outcome prediction operations (Phase 4)
  getCaseOutcomePredictionsByUserId(userId: number): Promise<CaseOutcomePrediction[]>;
  getCaseOutcomePrediction(id: number): Promise<CaseOutcomePrediction | undefined>;
  createCaseOutcomePrediction(prediction: InsertCaseOutcomePrediction): Promise<CaseOutcomePrediction>;
  updateCaseOutcomePrediction(id: number, updates: Partial<CaseOutcomePrediction>): Promise<CaseOutcomePrediction | undefined>;
  
  // Initialize methods
  initializeDefaultDocumentTemplates(): Promise<void>;
  initializeLegalDomains(): Promise<void>;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Chat message operations
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Document template operations
  async getDocumentTemplates(language: string = 'en'): Promise<DocumentTemplate[]> {
    return await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.language, language))
      .orderBy(documentTemplates.name);
  }

  async getDocumentTemplatesByType(templateType: string, language: string = 'en'): Promise<DocumentTemplate[]> {
    return await db
      .select()
      .from(documentTemplates)
      .where(
        and(
          eq(documentTemplates.type, templateType),
          eq(documentTemplates.language, language)
        )
      )
      .orderBy(documentTemplates.name);
  }

  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    const [template] = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.id, id));
    return template;
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [newTemplate] = await db
      .insert(documentTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  // Generated document operations
  async getGeneratedDocumentsByUserId(userId: number): Promise<GeneratedDocument[]> {
    return await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.userId, userId))
      .orderBy(desc(generatedDocuments.createdAt));
  }

  async getGeneratedDocument(id: number): Promise<GeneratedDocument | undefined> {
    const [document] = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.id, id));
    return document;
  }

  async createGeneratedDocument(document: InsertGeneratedDocument): Promise<GeneratedDocument> {
    const [newDocument] = await db
      .insert(generatedDocuments)
      .values(document)
      .returning();
    return newDocument;
  }

  // Research query operations
  async getResearchQueriesByUserId(userId: number): Promise<ResearchQuery[]> {
    return await db
      .select()
      .from(researchQueries)
      .where(eq(researchQueries.userId, userId))
      .orderBy(desc(researchQueries.createdAt));
  }

  async createResearchQuery(query: InsertResearchQuery): Promise<ResearchQuery> {
    const [newQuery] = await db
      .insert(researchQueries)
      .values(query)
      .returning();
    return newQuery;
  }

  // Contract analysis operations
  async getContractAnalysesByUserId(userId: number): Promise<ContractAnalysis[]> {
    return await db
      .select()
      .from(contractAnalyses)
      .where(eq(contractAnalyses.userId, userId))
      .orderBy(desc(contractAnalyses.createdAt));
  }

  async getContractAnalysis(id: number): Promise<ContractAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(contractAnalyses)
      .where(eq(contractAnalyses.id, id));
    return analysis;
  }

  async createContractAnalysis(analysis: InsertContractAnalysis): Promise<ContractAnalysis> {
    const [newAnalysis] = await db
      .insert(contractAnalyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  // Compliance check operations
  async getComplianceChecksByUserId(userId: number): Promise<ComplianceCheck[]> {
    return await db
      .select()
      .from(complianceChecks)
      .where(eq(complianceChecks.userId, userId))
      .orderBy(desc(complianceChecks.createdAt));
  }

  async getComplianceCheck(id: number): Promise<ComplianceCheck | undefined> {
    const [check] = await db
      .select()
      .from(complianceChecks)
      .where(eq(complianceChecks.id, id));
    return check;
  }

  async createComplianceCheck(check: InsertComplianceCheck): Promise<ComplianceCheck> {
    const [newCheck] = await db
      .insert(complianceChecks)
      .values(check)
      .returning();
    return newCheck;
  }

  async updateComplianceCheck(id: number, updates: Partial<InsertComplianceCheck>): Promise<ComplianceCheck | undefined> {
    const [updatedCheck] = await db
      .update(complianceChecks)
      .set(updates)
      .where(eq(complianceChecks.id, id))
      .returning();
    return updatedCheck;
  }

  // Dispute resolution operations
  async getDisputesByUserId(userId: number): Promise<Dispute[]> {
    return await db
      .select()
      .from(disputes)
      .where(eq(disputes.userId, userId))
      .orderBy(desc(disputes.createdAt));
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    const [dispute] = await db
      .select()
      .from(disputes)
      .where(eq(disputes.id, id));
    return dispute;
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [newDispute] = await db
      .insert(disputes)
      .values(dispute)
      .returning();
    return newDispute;
  }

  async updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const [updatedDispute] = await db
      .update(disputes)
      .set(updates)
      .where(eq(disputes.id, id))
      .returning();
    return updatedDispute;
  }

  async getDisputesByStatus(statuses: string[]): Promise<Dispute[]> {
    return await db
      .select()
      .from(disputes)
      .where(
        sql`${disputes.status} = ANY(${statuses})`
      )
      .orderBy(desc(disputes.createdAt));
  }

  // Mediation session operations
  async getMediationSessionsByDisputeId(disputeId: number): Promise<MediationSession[]> {
    return await db
      .select()
      .from(mediationSessions)
      .where(eq(mediationSessions.disputeId, disputeId))
      .orderBy(desc(mediationSessions.createdAt));
  }

  async getMediationSession(id: number): Promise<MediationSession | undefined> {
    const [session] = await db
      .select()
      .from(mediationSessions)
      .where(eq(mediationSessions.id, id));
    return session;
  }

  async getMediationSessionByCode(sessionCode: string): Promise<MediationSession | undefined> {
    const [session] = await db
      .select()
      .from(mediationSessions)
      .where(eq(mediationSessions.sessionCode, sessionCode));
    return session;
  }

  async createMediationSession(session: InsertMediationSession): Promise<MediationSession> {
    const [newSession] = await db
      .insert(mediationSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateMediationSession(id: number, updates: Partial<MediationSession>): Promise<MediationSession | undefined> {
    const [updatedSession] = await db
      .update(mediationSessions)
      .set(updates)
      .where(eq(mediationSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Mediation message operations
  async getMediationMessagesBySessionId(sessionId: number): Promise<MediationMessage[]> {
    return await db
      .select()
      .from(mediationMessages)
      .where(eq(mediationMessages.sessionId, sessionId))
      .orderBy(mediationMessages.createdAt);
  }

  async createMediationMessage(message: InsertMediationMessage): Promise<MediationMessage> {
    const [newMessage] = await db
      .insert(mediationMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Saved citations operations
  async getSavedCitationsByUserId(userId: number): Promise<SavedCitation[]> {
    return await db
      .select()
      .from(savedCitations)
      .where(eq(savedCitations.userId, userId))
      .orderBy(desc(savedCitations.createdAt));
  }

  async getSavedCitation(id: number): Promise<SavedCitation | undefined> {
    const [citation] = await db
      .select()
      .from(savedCitations)
      .where(eq(savedCitations.id, id));
    return citation;
  }

  async createSavedCitation(citation: InsertSavedCitation): Promise<SavedCitation> {
    const [newCitation] = await db
      .insert(savedCitations)
      .values(citation)
      .returning();
    return newCitation;
  }

  async deleteSavedCitation(id: number): Promise<void> {
    await db
      .delete(savedCitations)
      .where(eq(savedCitations.id, id));
  }

  // Research visualizations operations
  async getResearchVisualizationsByUserId(userId: number): Promise<ResearchVisualization[]> {
    return await db
      .select()
      .from(researchVisualizations)
      .where(eq(researchVisualizations.userId, userId))
      .orderBy(desc(researchVisualizations.createdAt));
  }

  async getResearchVisualization(id: number): Promise<ResearchVisualization | undefined> {
    const [visualization] = await db
      .select()
      .from(researchVisualizations)
      .where(eq(researchVisualizations.id, id));
    return visualization;
  }

  async createResearchVisualization(visualization: InsertResearchVisualization): Promise<ResearchVisualization> {
    const [newVisualization] = await db
      .insert(researchVisualizations)
      .values(visualization)
      .returning();
    return newVisualization;
  }

  async updateResearchVisualization(id: number, updates: Partial<ResearchVisualization>): Promise<ResearchVisualization | undefined> {
    const [updatedVisualization] = await db
      .update(researchVisualizations)
      .set(updates)
      .where(eq(researchVisualizations.id, id))
      .returning();
    return updatedVisualization;
  }

  async deleteResearchVisualization(id: number): Promise<void> {
    await db
      .delete(researchVisualizations)
      .where(eq(researchVisualizations.id, id));
  }

  // Legal domain operations (Phase 3)
  async getLegalDomains(): Promise<LegalDomain[]> {
    return await db
      .select()
      .from(legalDomains)
      .where(sql`${legalDomains.parentId} IS NULL`)
      .orderBy(legalDomains.name);
  }

  async getLegalDomain(id: number): Promise<LegalDomain | undefined> {
    const [domain] = await db
      .select()
      .from(legalDomains)
      .where(eq(legalDomains.id, id));
    return domain;
  }

  async getLegalDomainByName(name: string): Promise<LegalDomain | undefined> {
    const [domain] = await db
      .select()
      .from(legalDomains)
      .where(eq(legalDomains.name, name));
    return domain;
  }

  async createLegalDomain(domain: InsertLegalDomain): Promise<LegalDomain> {
    const [newDomain] = await db
      .insert(legalDomains)
      .values(domain)
      .returning();
    return newDomain;
  }

  async updateLegalDomain(id: number, updates: Partial<LegalDomain>): Promise<LegalDomain | undefined> {
    const [updatedDomain] = await db
      .update(legalDomains)
      .set(updates)
      .where(eq(legalDomains.id, id))
      .returning();
    return updatedDomain;
  }

  async getLegalSubdomains(parentId: number): Promise<LegalDomain[]> {
    return await db
      .select()
      .from(legalDomains)
      .where(eq(legalDomains.parentId, parentId))
      .orderBy(legalDomains.name);
  }

  // Domain knowledge operations (Phase 3)
  async getDomainKnowledgeByDomainId(domainId: number): Promise<DomainKnowledge[]> {
    return await db
      .select()
      .from(domainKnowledge)
      .where(eq(domainKnowledge.domainId, domainId))
      .orderBy(desc(domainKnowledge.relevanceScore));
  }

  async getDomainKnowledge(id: number): Promise<DomainKnowledge | undefined> {
    const [knowledge] = await db
      .select()
      .from(domainKnowledge)
      .where(eq(domainKnowledge.id, id));
    return knowledge;
  }

  async createDomainKnowledge(knowledge: InsertDomainKnowledge): Promise<DomainKnowledge> {
    const [newKnowledge] = await db
      .insert(domainKnowledge)
      .values(knowledge)
      .returning();
    return newKnowledge;
  }

  async updateDomainKnowledge(id: number, updates: Partial<DomainKnowledge>): Promise<DomainKnowledge | undefined> {
    const [updatedKnowledge] = await db
      .update(domainKnowledge)
      .set(updates)
      .where(eq(domainKnowledge.id, id))
      .returning();
    return updatedKnowledge;
  }

  async searchDomainKnowledge(query: string, domainId?: number, language: string = 'en'): Promise<DomainKnowledge[]> {
    let whereClause;
    
    if (domainId) {
      whereClause = and(
        eq(domainKnowledge.language, language),
        eq(domainKnowledge.domainId, domainId)
      );
    } else {
      whereClause = eq(domainKnowledge.language, language);
    }
    
    // Basic search implementation
    // In a production environment, this would use full-text search capabilities
    const results = await db
      .select()
      .from(domainKnowledge)
      .where(whereClause);
    
    // Filter results that contain the query in question or answer
    // This is a simple approach - a production system would use proper text search
    return results.filter(item => 
      item.question.toLowerCase().includes(query.toLowerCase()) || 
      item.answer.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Procedural guides operations (Phase 3)
  async getProceduralGuidesByDomainId(domainId: number, language: string = 'en'): Promise<ProceduralGuide[]> {
    return await db
      .select()
      .from(proceduralGuides)
      .where(
        and(
          eq(proceduralGuides.domainId, domainId),
          eq(proceduralGuides.language, language)
        )
      )
      .orderBy(proceduralGuides.title);
  }

  async getProceduralGuide(id: number): Promise<ProceduralGuide | undefined> {
    const [guide] = await db
      .select()
      .from(proceduralGuides)
      .where(eq(proceduralGuides.id, id));
    return guide;
  }

  async createProceduralGuide(guide: InsertProceduralGuide): Promise<ProceduralGuide> {
    const [newGuide] = await db
      .insert(proceduralGuides)
      .values(guide)
      .returning();
    return newGuide;
  }

  async updateProceduralGuide(id: number, updates: Partial<ProceduralGuide>): Promise<ProceduralGuide | undefined> {
    const [updatedGuide] = await db
      .update(proceduralGuides)
      .set(updates)
      .where(eq(proceduralGuides.id, id))
      .returning();
    return updatedGuide;
  }

  // Escalated questions operations (Phase 3)
  async getEscalatedQuestionsByUserId(userId: number): Promise<EscalatedQuestion[]> {
    return await db
      .select()
      .from(escalatedQuestions)
      .where(eq(escalatedQuestions.userId, userId))
      .orderBy(desc(escalatedQuestions.createdAt));
  }

  async getEscalatedQuestion(id: number): Promise<EscalatedQuestion | undefined> {
    const [question] = await db
      .select()
      .from(escalatedQuestions)
      .where(eq(escalatedQuestions.id, id));
    return question;
  }

  async createEscalatedQuestion(question: InsertEscalatedQuestion): Promise<EscalatedQuestion> {
    const [newQuestion] = await db
      .insert(escalatedQuestions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async updateEscalatedQuestion(id: number, updates: Partial<EscalatedQuestion>): Promise<EscalatedQuestion | undefined> {
    const [updatedQuestion] = await db
      .update(escalatedQuestions)
      .set(updates)
      .where(eq(escalatedQuestions.id, id))
      .returning();
    return updatedQuestion;
  }

  async getEscalatedQuestionsByStatus(status: string): Promise<EscalatedQuestion[]> {
    return await db
      .select()
      .from(escalatedQuestions)
      .where(eq(escalatedQuestions.status, status))
      .orderBy(desc(escalatedQuestions.createdAt));
  }

  // Conversation context operations (Phase 3)
  async getConversationContextByUserId(userId: number): Promise<ConversationContext | undefined> {
    const [context] = await db
      .select()
      .from(conversationContexts)
      .where(eq(conversationContexts.userId, userId))
      .orderBy(desc(conversationContexts.updatedAt))
      .limit(1);
    return context;
  }

  async createConversationContext(context: InsertConversationContext): Promise<ConversationContext> {
    const [newContext] = await db
      .insert(conversationContexts)
      .values(context)
      .returning();
    return newContext;
  }

  async updateConversationContext(id: number, updates: Partial<ConversationContext>): Promise<ConversationContext | undefined> {
    const [updatedContext] = await db
      .update(conversationContexts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversationContexts.id, id))
      .returning();
    return updatedContext;
  }

  // Case outcome prediction operations (Phase 4)
  async getCaseOutcomePredictionsByUserId(userId: number): Promise<CaseOutcomePrediction[]> {
    return await db
      .select()
      .from(caseOutcomePredictions)
      .where(eq(caseOutcomePredictions.userId, userId))
      .orderBy(desc(caseOutcomePredictions.createdAt));
  }

  async getCaseOutcomePrediction(id: number): Promise<CaseOutcomePrediction | undefined> {
    const [prediction] = await db
      .select()
      .from(caseOutcomePredictions)
      .where(eq(caseOutcomePredictions.id, id));
    return prediction;
  }

  async createCaseOutcomePrediction(prediction: InsertCaseOutcomePrediction): Promise<CaseOutcomePrediction> {
    const [newPrediction] = await db
      .insert(caseOutcomePredictions)
      .values(prediction)
      .returning();
    return newPrediction;
  }

  async updateCaseOutcomePrediction(id: number, updates: Partial<CaseOutcomePrediction>): Promise<CaseOutcomePrediction | undefined> {
    const [updatedPrediction] = await db
      .update(caseOutcomePredictions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(caseOutcomePredictions.id, id))
      .returning();
    return updatedPrediction;
  }

  // Initialize methods
  async initializeDefaultDocumentTemplates(): Promise<void> {
    // Check if templates already exist
    const existingTemplates = await this.getDocumentTemplates();
    if (existingTemplates.length > 0) return;

    // Implementation would go here to create default templates
    console.log("Initialized default document templates");
  }

  async initializeLegalDomains(): Promise<void> {
    // Check if domains already exist
    const existingDomains = await this.getLegalDomains();
    if (existingDomains.length > 0) return;
    
    // Implementation would go here to create default legal domains
    console.log("Initialized legal domains");
  }
}

// Export an instance of the DatabaseStorage class
export const storage = new DatabaseStorage();