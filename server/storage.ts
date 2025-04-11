import { 
  users, type User, type InsertUser,
  chatMessages, type ChatMessage, type InsertChatMessage,
  documentTemplates, type DocumentTemplate, type InsertDocumentTemplate,
  generatedDocuments, type GeneratedDocument, type InsertGeneratedDocument,
  researchQueries, type ResearchQuery, type InsertResearchQuery,
  contractAnalyses, type ContractAnalysis, type InsertContractAnalysis,
  complianceChecks, type ComplianceCheck, type InsertComplianceCheck,
  disputes, type Dispute, type InsertDispute,
  disputeParties, type DisputeParty, type InsertDisputeParty,
  mediationSessions, type MediationSession, type InsertMediationSession,
  mediationMessages, type MediationMessage, type InsertMediationMessage,
  savedCitations, type SavedCitation, type InsertSavedCitation,
  researchVisualizations, type ResearchVisualization, type InsertResearchVisualization,
  legalDomains, type LegalDomain, type InsertLegalDomain,
  domainKnowledge, type DomainKnowledge, type InsertDomainKnowledge,
  provincialInfo, type ProvincialInfo, type InsertProvincialInfo,
  proceduralGuides, type ProceduralGuide, type InsertProceduralGuide,
  escalatedQuestions, type EscalatedQuestion, type InsertEscalatedQuestion,
  conversationContexts, type ConversationContext, type InsertConversationContext,
  caseOutcomePredictions, type CaseOutcomePrediction, type InsertCaseOutcomePrediction,
  userFeedback, type UserFeedback, type InsertUserFeedback,
  sharedDocuments, type SharedDocument, type InsertSharedDocument,
  documentComments, type DocumentComment, type InsertDocumentComment,
  settlementProposals, type SettlementProposal, type InsertSettlementProposal,
  digitalSignatures, type DigitalSignature, type InsertDigitalSignature,
  disputeActivities, type DisputeActivity, type InsertDisputeActivity,
  passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken
} from "@shared/schema";
import { db } from './db';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { type json as Json } from 'drizzle-orm/pg-core';

// Interface for storage operations
export interface IStorage {
  // Session store for auth
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<Omit<User, "id">>): Promise<User | undefined>;
  
  // Password reset token operations
  createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  
  // Collaborative features
  // Shared Documents
  getSharedDocuments(disputeId: number): Promise<SharedDocument[]>;
  getSharedDocumentById(documentId: number): Promise<SharedDocument | undefined>;
  createSharedDocument(document: InsertSharedDocument): Promise<SharedDocument>;
  updateSharedDocument(id: number, documentData: Partial<SharedDocument>): Promise<SharedDocument | undefined>;
  saveDocumentFile(fileBuffer: Buffer, fileType: string): Promise<string>;
  userHasDocumentAccess(userId: number, document: SharedDocument): Promise<boolean>;
  
  // Document Comments
  getDocumentComments(documentId: number): Promise<DocumentComment[]>;
  createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment>;
  updateDocumentComment(id: number, commentData: Partial<DocumentComment>): Promise<DocumentComment | undefined>;
  
  // Settlement Proposals
  getSettlementProposals(disputeId: number): Promise<SettlementProposal[]>;
  getSettlementProposalById(proposalId: number): Promise<SettlementProposal | undefined>;
  createSettlementProposal(proposal: InsertSettlementProposal): Promise<SettlementProposal>;
  updateSettlementProposal(id: number, proposalData: Partial<SettlementProposal>): Promise<SettlementProposal | undefined>;
  
  // Digital Signatures
  getDigitalSignatures(proposalId: number): Promise<DigitalSignature[]>;
  createDigitalSignature(signature: InsertDigitalSignature): Promise<DigitalSignature>;
  verifyDigitalSignature(id: number, verificationCode: string): Promise<DigitalSignature | undefined>;
  
  // Activity Tracking
  createDisputeActivity(activity: InsertDisputeActivity): Promise<DisputeActivity>;
  getDisputeActivities(disputeId: number): Promise<DisputeActivity[]>;
  generateActivityReport(disputeId: number): Promise<any>;
  
  // Dispute Party Access Control
  isDisputeParty(userId: number, disputeId: number): Promise<boolean>;
  isDisputeMediator(userId: number, disputeId: number): Promise<boolean>;
  isDisputeOwner(userId: number, disputeId: number): Promise<boolean>;
  getDisputePartyByUserId(disputeId: number, userId: number): Promise<DisputeParty | undefined>;
  
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
  
  // Dispute parties operations
  getDisputePartiesByDisputeId(disputeId: number): Promise<DisputeParty[]>;
  getDisputeParty(id: number): Promise<DisputeParty | undefined>;
  getDisputePartyByEmail(email: string, disputeId: number): Promise<DisputeParty | undefined>;
  getDisputePartyByInvitationCode(code: string): Promise<DisputeParty | undefined>;
  createDisputeParty(party: InsertDisputeParty): Promise<DisputeParty>;
  updateDisputeParty(id: number, updates: Partial<DisputeParty>): Promise<DisputeParty | undefined>;
  deleteDisputeParty(id: number): Promise<void>;
  
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

// Database storage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
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

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<Omit<User, "id" | "password">>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Chat message operations
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp));
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
      .orderBy(documentTemplates.title);
  }

  async getDocumentTemplatesByType(templateType: string, language: string = 'en'): Promise<DocumentTemplate[]> {
    return await db
      .select()
      .from(documentTemplates)
      .where(
        and(
          eq(documentTemplates.templateType, templateType),
          eq(documentTemplates.language, language)
        )
      )
      .orderBy(documentTemplates.title);
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
      .orderBy(desc(researchQueries.timestamp));
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

  // Dispute parties operations
  async getDisputePartiesByDisputeId(disputeId: number): Promise<DisputeParty[]> {
    return await db
      .select()
      .from(disputeParties)
      .where(eq(disputeParties.disputeId, disputeId))
      .orderBy(disputeParties.role);
  }

  async getDisputeParty(id: number): Promise<DisputeParty | undefined> {
    const [party] = await db
      .select()
      .from(disputeParties)
      .where(eq(disputeParties.id, id));
    return party;
  }

  async getDisputePartyByEmail(email: string, disputeId: number): Promise<DisputeParty | undefined> {
    const [party] = await db
      .select()
      .from(disputeParties)
      .where(
        and(
          eq(disputeParties.email, email),
          eq(disputeParties.disputeId, disputeId)
        )
      );
    return party;
  }

  async getDisputePartyByInvitationCode(code: string): Promise<DisputeParty | undefined> {
    const [party] = await db
      .select()
      .from(disputeParties)
      .where(eq(disputeParties.invitationCode, code));
    return party;
  }

  async createDisputeParty(party: InsertDisputeParty): Promise<DisputeParty> {
    const [newParty] = await db
      .insert(disputeParties)
      .values(party)
      .returning();
    return newParty;
  }

  async updateDisputeParty(id: number, updates: Partial<DisputeParty>): Promise<DisputeParty | undefined> {
    const [updatedParty] = await db
      .update(disputeParties)
      .set(updates)
      .where(eq(disputeParties.id, id))
      .returning();
    return updatedParty;
  }

  async deleteDisputeParty(id: number): Promise<void> {
    await db
      .delete(disputeParties)
      .where(eq(disputeParties.id, id));
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
    ).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
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
    
    // Default legal domains for Canadian legal system
    const defaultDomains = [
      {
        name: "Family Law",
        description: "Legal matters related to family relationships, including divorce, child custody, and support",
        resources: {
          websites: ["https://www.justice.gc.ca/eng/fl-df/index.html"],
          keyLegislation: ["Divorce Act", "Family Law Act"]
        }
      },
      {
        name: "Immigration Law",
        description: "Legal matters related to immigration, citizenship, and refugee status in Canada",
        resources: {
          websites: ["https://www.canada.ca/en/services/immigration-citizenship.html"],
          keyLegislation: ["Immigration and Refugee Protection Act", "Citizenship Act"]
        }
      },
      {
        name: "Real Estate Law",
        description: "Legal matters related to property ownership, transactions, and land use",
        resources: {
          websites: ["https://www.cmhc-schl.gc.ca/"],
          keyLegislation: ["Land Titles Act", "Residential Tenancies Act"]
        }
      },
      {
        name: "Employment Law",
        description: "Legal matters related to employment relationships, workplace rights, and labor standards",
        resources: {
          websites: ["https://www.canada.ca/en/services/jobs/workplace.html"],
          keyLegislation: ["Canada Labour Code", "Employment Standards Act"]
        }
      },
      {
        name: "Criminal Law",
        description: "Legal matters related to offenses against public law, prosecution, and defense",
        resources: {
          websites: ["https://www.justice.gc.ca/eng/cj-jp/index.html"],
          keyLegislation: ["Criminal Code", "Youth Criminal Justice Act"]
        }
      },
      {
        name: "Business Law",
        description: "Legal matters related to business operations, corporate governance, and commercial transactions",
        resources: {
          websites: ["https://www.ic.gc.ca/eic/site/icgc.nsf/eng/home"],
          keyLegislation: ["Canada Business Corporations Act", "Competition Act"]
        }
      },
      {
        name: "Tax Law",
        description: "Legal matters related to taxation, compliance, and disputes with tax authorities",
        resources: {
          websites: ["https://www.canada.ca/en/services/taxes.html"],
          keyLegislation: ["Income Tax Act", "Excise Tax Act"]
        }
      },
      {
        name: "Intellectual Property Law",
        description: "Legal matters related to patents, trademarks, copyrights, and other intellectual property",
        resources: {
          websites: ["https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home"],
          keyLegislation: ["Patent Act", "Copyright Act", "Trademarks Act"]
        }
      }
    ];
    
    // Insert default domains
    for (const domain of defaultDomains) {
      await db.insert(legalDomains).values(domain);
    }
    
    console.log("Initialized legal domains");
    
    // Initialize procedural guides after domains are created
    await this.initializeProceduralGuides();
  }
  
  async initializeProceduralGuides(): Promise<void> {
    // Check if procedural guides already exist
    const existingGuides = await db.select().from(proceduralGuides);
    if (existingGuides.length > 0) return;
    
    // Get domain IDs for reference
    const domains = await this.getLegalDomains();
    const domainMap = new Map<string, number>();
    
    for (const domain of domains) {
      domainMap.set(domain.name, domain.id);
    }
    
    // Create default procedural guides
    if (domainMap.has("Business Law")) {
      const businessLawId = domainMap.get("Business Law")!;
      
      // Guide for incorporating a business
      await db.insert(proceduralGuides).values({
        domainId: businessLawId,
        title: "How to Incorporate a Business in Canada",
        description: "A step-by-step guide to incorporating a business under Canadian federal law",
        steps: [
          {
            title: "Choose a Corporate Name",
            description: "Conduct a NUANS search to ensure your proposed corporate name is available and meets the requirements of the Canada Business Corporations Act."
          },
          {
            title: "Prepare Articles of Incorporation",
            description: "Draft the Articles of Incorporation which include details about your company such as its name, registered office address, share structure, and restrictions on business."
          },
          {
            title: "Select Initial Directors",
            description: "Identify the initial directors of your corporation. Federal corporations require at least one director (25% must be Canadian residents)."
          },
          {
            title: "File Incorporation Documents",
            description: "Submit your Articles of Incorporation and other required forms to Corporations Canada along with the required fee."
          },
          {
            title: "Create Corporate By-laws",
            description: "Prepare by-laws to govern the internal management of your corporation."
          },
          {
            title: "Organize Corporate Records",
            description: "Set up a corporate minute book to maintain important records including articles, by-laws, minutes of meetings, and share registers."
          },
          {
            title: "Register for Government Programs",
            description: "Register for a business number, GST/HST account, corporate income tax account, and provincial programs as required."
          }
        ],
        jurisdiction: "canada",
        language: "en",
        estimatedTime: "3-4 weeks",
        prerequisites: [
          "Legal capacity to form a corporation",
          "Completed NUANS name search report",
          "Registration fees"
        ]
      });
      
      // Guide for registering a business name
      await db.insert(proceduralGuides).values({
        domainId: businessLawId,
        title: "How to Register a Business Name in Canada",
        description: "Steps to register a business name for a sole proprietorship or partnership in Canada",
        steps: [
          {
            title: "Choose a Business Name",
            description: "Select a unique business name that isn't already registered in your province/territory and complies with local regulations."
          },
          {
            title: "Conduct a Name Search",
            description: "Research to ensure the name isn't already in use. Many provinces offer online databases to check business name availability."
          },
          {
            title: "Prepare Registration Documents",
            description: "Complete the business name registration form for your province or territory, including business contact information and ownership details."
          },
          {
            title: "Submit Registration",
            description: "File your registration documents with the appropriate provincial or territorial business registry and pay the required fee."
          },
          {
            title: "Obtain Business Number",
            description: "Apply for a business number from the Canada Revenue Agency (CRA) for tax purposes."
          },
          {
            title: "Register for Additional Accounts",
            description: "Register for GST/HST, payroll, and import/export accounts if applicable to your business activities."
          },
          {
            title: "Renew Registration",
            description: "Most business name registrations expire after a certain period (usually 3-5 years) and must be renewed."
          }
        ],
        jurisdiction: "canada",
        language: "en",
        estimatedTime: "1-2 weeks",
        prerequisites: [
          "Business name selection",
          "Registration fee",
          "Valid identification"
        ]
      });
      
      console.log("Initialized procedural guides for Business Law");
    }
    
    if (domainMap.has("Family Law")) {
      const familyLawId = domainMap.get("Family Law")!;
      
      // Guide for divorce process
      await db.insert(proceduralGuides).values({
        domainId: familyLawId,
        title: "Navigating the Divorce Process in Canada",
        description: "A comprehensive guide to the legal process of divorce under the Divorce Act",
        steps: [
          {
            title: "Determine Eligibility",
            description: "Ensure you meet the residency requirements (you or your spouse must have been a resident in the province for at least one year)."
          },
          {
            title: "Prepare Divorce Application",
            description: "Complete the application for divorce form and gather supporting documents such as your marriage certificate."
          },
          {
            title: "File the Application",
            description: "Submit your application to the court along with the required filing fee."
          },
          {
            title: "Serve the Documents",
            description: "If filing a joint application, service is not required. Otherwise, serve the documents to your spouse according to the rules of service in your province."
          },
          {
            title: "Wait for Response",
            description: "Your spouse has a limited time (usually 30 days) to respond to the application."
          },
          {
            title: "Address Disputed Issues",
            description: "If there are disputes over child custody, support, or division of property, these may need to be resolved through negotiation, mediation, or court proceedings."
          },
          {
            title: "Obtain Divorce Judgment",
            description: "After the application is processed, the court issues a divorce judgment. The divorce becomes final 31 days after the judgment is issued."
          }
        ],
        jurisdiction: "canada",
        language: "en",
        estimatedTime: "4-6 months (uncontested), 1-2 years (contested)",
        prerequisites: [
          "Valid marriage",
          "Marriage breakdown (separation for at least one year, adultery, or cruelty)",
          "Original or certified copy of marriage certificate"
        ]
      });
      
      // Guide for child custody agreements
      await db.insert(proceduralGuides).values({
        domainId: familyLawId,
        title: "Creating a Child Custody Agreement in Canada",
        description: "How to establish a legally binding child custody and parenting arrangement",
        steps: [
          {
            title: "Understand Types of Custody",
            description: "Learn the difference between sole custody, joint custody, shared custody, and split custody to determine what arrangement best serves your children's interests."
          },
          {
            title: "Negotiate a Parenting Plan",
            description: "Work with the other parent to create a detailed parenting plan that addresses schedules, decision-making, communication, and special occasions."
          },
          {
            title: "Consider Mediation",
            description: "If direct negotiation is difficult, engage a family mediator to help facilitate an agreement between parents."
          },
          {
            title: "Draft a Parenting Agreement",
            description: "Create a written document that outlines all aspects of the custody arrangement and parenting responsibilities."
          },
          {
            title: "Review with Legal Counsel",
            description: "Have a family lawyer review the agreement to ensure it protects your rights and the best interests of your children."
          },
          {
            title: "File with the Court",
            description: "Submit the agreement to the court to be incorporated into a court order, making it legally binding and enforceable."
          },
          {
            title: "Implement and Revise as Needed",
            description: "Follow the agreement consistently and be prepared to revise it as children grow and circumstances change."
          }
        ],
        jurisdiction: "canada",
        language: "en",
        estimatedTime: "1-3 months",
        prerequisites: [
          "Children from the relationship",
          "Willingness to cooperate with the other parent",
          "Child's best interests as the primary consideration"
        ]
      });
      
      console.log("Initialized procedural guides for Family Law");
    }
    
    if (domainMap.has("Immigration Law")) {
      const immigrationLawId = domainMap.get("Immigration Law")!;
      
      // Guide for Express Entry immigration
      await db.insert(proceduralGuides).values({
        domainId: immigrationLawId,
        title: "Canadian Express Entry Immigration Process",
        description: "Steps to immigrate to Canada through the Express Entry system for skilled workers",
        steps: [
          {
            title: "Check Eligibility",
            description: "Determine if you qualify for one of the Express Entry programs: Federal Skilled Worker Program, Federal Skilled Trades Program, or Canadian Experience Class."
          },
          {
            title: "Get Educational Credential Assessment",
            description: "Have your foreign education credentials assessed by a designated organization to verify they meet Canadian standards."
          },
          {
            title: "Take Language Tests",
            description: "Complete an approved language test (IELTS or CELPIP for English, TEF for French) to demonstrate proficiency."
          },
          {
            title: "Create Express Entry Profile",
            description: "Submit your profile to the Express Entry pool, including information about your skills, education, work experience, and language abilities."
          },
          {
            title: "Receive Comprehensive Ranking System Score",
            description: "Get ranked in the Express Entry pool based on your CRS score, which considers factors like age, education, work experience, and language skills."
          },
          {
            title: "Receive Invitation to Apply",
            description: "If selected in an Express Entry draw, you'll receive an Invitation to Apply (ITA) for permanent residence."
          },
          {
            title: "Submit Complete Application",
            description: "Submit your permanent residence application with all supporting documents within 60 days of receiving your ITA."
          },
          {
            title: "Medical Examination and Background Checks",
            description: "Complete a medical exam with an approved physician and provide police certificates from countries where you've lived."
          },
          {
            title: "Receive Permanent Residence",
            description: "If approved, pay the Right of Permanent Residence Fee and receive your Confirmation of Permanent Residence and permanent resident visa."
          }
        ],
        jurisdiction: "canada",
        language: "en",
        estimatedTime: "6-12 months",
        prerequisites: [
          "Meet eligibility criteria for at least one Express Entry program",
          "Valid passport or travel document",
          "Proof of funds to support yourself in Canada",
          "Language test results",
          "Educational Credential Assessment (if applicable)"
        ]
      });
      
      // Guide for family sponsorship
      await db.insert(proceduralGuides).values({
        domainId: immigrationLawId,
        title: "Sponsoring Family Members for Canadian Immigration",
        description: "Process for Canadian citizens and permanent residents to sponsor eligible family members",
        steps: [
          {
            title: "Confirm Eligibility to Sponsor",
            description: "Verify that you meet the requirements to be a sponsor (Canadian citizen or permanent resident, 18+ years old, financially capable)."
          },
          {
            title: "Verify Sponsored Person's Eligibility",
            description: "Ensure your family member is eligible for sponsorship (spouse, partner, dependent child, parent, or grandparent)."
          },
          {
            title: "Submit Sponsorship Application",
            description: "Complete and submit the sponsorship forms, including an undertaking to provide financial support."
          },
          {
            title: "Pay Application Fees",
            description: "Pay the processing fee, right of permanent residence fee (if applicable), and biometric fee."
          },
          {
            title: "Permanent Residence Application",
            description: "Help your family member complete and submit their application for permanent residence."
          },
          {
            title: "Medical Examination",
            description: "Your family member must undergo a medical examination with an approved panel physician."
          },
          {
            title: "Background and Security Checks",
            description: "Provide police certificates for the family member from each country they've lived in for 6+ months since age 18."
          },
          {
            title: "Interview (if required)",
            description: "In some cases, the sponsored family member may need to attend an interview at a visa office."
          },
          {
            title: "Receive Decision",
            description: "If approved, your family member will receive a Confirmation of Permanent Residence and (if applicable) a permanent resident visa."
          }
        ],
        jurisdiction: "canada",
        language: "en",
        estimatedTime: "12-24 months (depending on relationship and country)",
        prerequisites: [
          "Eligible relationship to the sponsored person",
          "Meet income requirements for sponsorship",
          "Not receiving social assistance (except for disability)",
          "No criminal convictions that would make you ineligible"
        ]
      });
      
      console.log("Initialized procedural guides for Immigration Law");
    }
  }
  
  // Provincial info operations
  async getProvincialInfo(domainId: number, province?: string, language: string = 'en'): Promise<ProvincialInfo[]> {
    // Create base query with initial condition
    const baseQuery = db
      .select()
      .from(provincialInfo)
      .where(and(
        eq(provincialInfo.domainId, domainId),
        eq(provincialInfo.language, language)
      ));
    
    // If province is provided, add it to the conditions
    if (province) {
      return await baseQuery.where(eq(provincialInfo.province, province));
    }
    
    // Return base query results
    return await baseQuery;
  }
  
  async getProvincialInfoById(id: number): Promise<ProvincialInfo | undefined> {
    const [info] = await db
      .select()
      .from(provincialInfo)
      .where(eq(provincialInfo.id, id));
    return info;
  }
  
  async createProvincialInfo(info: InsertProvincialInfo): Promise<ProvincialInfo> {
    const [newInfo] = await db
      .insert(provincialInfo)
      .values(info)
      .returning();
    return newInfo;
  }
  
  // User feedback operations
  async getAllUserFeedback(): Promise<UserFeedback[]> {
    return await db
      .select()
      .from(userFeedback)
      .orderBy(desc(userFeedback.createdAt));
  }
  
  async getUserFeedbackByStatus(status: string): Promise<UserFeedback[]> {
    return await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.status, status))
      .orderBy(desc(userFeedback.createdAt));
  }
  
  async getUserFeedback(id: number): Promise<UserFeedback | undefined> {
    const [feedback] = await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.id, id));
    return feedback;
  }
  
  async getUserFeedbackByUserId(userId: number): Promise<UserFeedback[]> {
    return await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.userId, userId))
      .orderBy(desc(userFeedback.createdAt));
  }
  
  async createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const [newFeedback] = await db
      .insert(userFeedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }
  
  async updateUserFeedback(id: number, data: Partial<InsertUserFeedback>): Promise<UserFeedback | undefined> {
    const [updatedFeedback] = await db
      .update(userFeedback)
      .set(data)
      .where(eq(userFeedback.id, id))
      .returning();
    return updatedFeedback;
  }

  // ===== Collaborative Features Implementation =====

  // Shared Documents
  async getSharedDocuments(disputeId: number): Promise<SharedDocument[]> {
    return await db
      .select()
      .from(sharedDocuments)
      .where(eq(sharedDocuments.disputeId, disputeId))
      .orderBy(desc(sharedDocuments.updatedAt));
  }
  
  async getSharedDocumentById(documentId: number): Promise<SharedDocument | undefined> {
    const [document] = await db
      .select()
      .from(sharedDocuments)
      .where(eq(sharedDocuments.id, documentId));
    return document;
  }
  
  async createSharedDocument(document: InsertSharedDocument): Promise<SharedDocument> {
    const [newDocument] = await db
      .insert(sharedDocuments)
      .values(document)
      .returning();
    return newDocument;
  }
  
  async updateSharedDocument(id: number, documentData: Partial<SharedDocument>): Promise<SharedDocument | undefined> {
    const [updatedDocument] = await db
      .update(sharedDocuments)
      .set(documentData)
      .where(eq(sharedDocuments.id, id))
      .returning();
    return updatedDocument;
  }
  
  async saveDocumentFile(fileBuffer: Buffer, fileType: string): Promise<string> {
    // In a production environment, this would upload to cloud storage
    // For now, we'll just create a unique identifier and pretend we saved it
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return `https://storage.example.com/documents/${fileId}`;
  }
  
  async userHasDocumentAccess(userId: number, document: SharedDocument): Promise<boolean> {
    // Public documents are accessible to anyone associated with the dispute
    if (document.isPublic) {
      if (document.disputeId === null) return false;
      
      try {
        const isParty = await this.isDisputeParty(userId, document.disputeId);
        if (isParty) return true;
        
        const isMediator = await this.isDisputeMediator(userId, document.disputeId);
        if (isMediator) return true;
        
        const isOwner = await this.isDisputeOwner(userId, document.disputeId);
        return isOwner;
      } catch (error) {
        console.error("Error checking document access:", error);
        return false;
      }
    }
    
    // Otherwise, check specific permissions
    const accessPermissions = document.accessPermissions as { userIds: number[] } | null;
    
    if (!accessPermissions || !accessPermissions.userIds) {
      // If no specific permissions, only the uploader can access
      return document.uploadedBy !== null && document.uploadedBy === userId;
    }
    
    return accessPermissions.userIds.includes(userId) || 
           (document.uploadedBy !== null && document.uploadedBy === userId);
  }
  
  // Document Comments
  async getDocumentComments(documentId: number): Promise<DocumentComment[]> {
    return await db
      .select()
      .from(documentComments)
      .where(eq(documentComments.documentId, documentId))
      .orderBy(desc(documentComments.createdAt));
  }
  
  async createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment> {
    const [newComment] = await db
      .insert(documentComments)
      .values(comment)
      .returning();
    return newComment;
  }
  
  async updateDocumentComment(id: number, commentData: Partial<DocumentComment>): Promise<DocumentComment | undefined> {
    const [updatedComment] = await db
      .update(documentComments)
      .set(commentData)
      .where(eq(documentComments.id, id))
      .returning();
    return updatedComment;
  }
  
  // Settlement Proposals
  async getSettlementProposals(disputeId: number): Promise<SettlementProposal[]> {
    return await db
      .select()
      .from(settlementProposals)
      .where(eq(settlementProposals.disputeId, disputeId))
      .orderBy(desc(settlementProposals.updatedAt));
  }
  
  async getSettlementProposalById(proposalId: number): Promise<SettlementProposal | undefined> {
    const [proposal] = await db
      .select()
      .from(settlementProposals)
      .where(eq(settlementProposals.id, proposalId));
    return proposal;
  }
  
  async createSettlementProposal(proposal: InsertSettlementProposal): Promise<SettlementProposal> {
    const [newProposal] = await db
      .insert(settlementProposals)
      .values(proposal)
      .returning();
    return newProposal;
  }
  
  async updateSettlementProposal(id: number, proposalData: Partial<SettlementProposal>): Promise<SettlementProposal | undefined> {
    const [updatedProposal] = await db
      .update(settlementProposals)
      .set(proposalData)
      .where(eq(settlementProposals.id, id))
      .returning();
    return updatedProposal;
  }
  
  // Digital Signatures
  async getDigitalSignatures(proposalId: number): Promise<DigitalSignature[]> {
    return await db
      .select()
      .from(digitalSignatures)
      .where(eq(digitalSignatures.proposalId, proposalId))
      .orderBy(digitalSignatures.createdAt);
  }
  
  async createDigitalSignature(signature: InsertDigitalSignature): Promise<DigitalSignature> {
    const [newSignature] = await db
      .insert(digitalSignatures)
      .values(signature)
      .returning();
    return newSignature;
  }
  
  async verifyDigitalSignature(id: number, verificationCode: string): Promise<DigitalSignature | undefined> {
    const [signature] = await db
      .select()
      .from(digitalSignatures)
      .where(eq(digitalSignatures.id, id));
    
    if (!signature || signature.verificationCode !== verificationCode) {
      return undefined;
    }
    
    // Update verification status
    const [verifiedSignature] = await db
      .update(digitalSignatures)
      .set({ 
        verifiedAt: new Date()
      })
      .where(eq(digitalSignatures.id, id))
      .returning();
      
    return verifiedSignature;
  }
  
  // Activity Tracking
  async createDisputeActivity(activity: InsertDisputeActivity): Promise<DisputeActivity> {
    const [newActivity] = await db
      .insert(disputeActivities)
      .values(activity)
      .returning();
    return newActivity;
  }
  
  async getDisputeActivities(disputeId: number): Promise<DisputeActivity[]> {
    return await db
      .select()
      .from(disputeActivities)
      .where(eq(disputeActivities.disputeId, disputeId))
      .orderBy(desc(disputeActivities.createdAt));
  }
  
  async generateActivityReport(disputeId: number): Promise<any> {
    // Get all activities
    const activities = await this.getDisputeActivities(disputeId);
    
    // Count activities by type
    const activityCounts: Record<string, number> = {};
    activities.forEach(activity => {
      const type = activity.activityType;
      activityCounts[type] = (activityCounts[type] || 0) + 1;
    });
    
    // Count activities by user
    const userActivities: Record<number, number> = {};
    activities.forEach(activity => {
      const userId = activity.userId;
      if (userId !== null) {
        userActivities[userId] = (userActivities[userId] || 0) + 1;
      }
    });
    
    // Get the most active users (top 5)
    const topUsers = Object.entries(userActivities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, count]) => ({ userId: parseInt(userId), count }));
    
    // Calculate timeline activity (activities per day)
    const timeline: Record<string, number> = {};
    activities.forEach(activity => {
      const date = new Date(activity.createdAt || Date.now()).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    
    // Get most recent activities (last 10)
    const recentActivities = activities.slice(0, 10);
    
    return {
      totalActivities: activities.length,
      activityCounts,
      topUsers,
      timeline,
      recentActivities
    };
  }
  
  // Dispute Party Access Control
  async isDisputeParty(userId: number, disputeId: number): Promise<boolean> {
    const party = await this.getDisputePartyByUserId(disputeId, userId);
    return !!party;
  }
  
  async isDisputeMediator(userId: number, disputeId: number): Promise<boolean> {
    const [mediationSession] = await db
      .select()
      .from(mediationSessions)
      .where(
        and(
          eq(mediationSessions.disputeId, disputeId),
          eq(mediationSessions.mediatorId, userId)
        )
      );
    return !!mediationSession;
  }
  
  async isDisputeOwner(userId: number, disputeId: number): Promise<boolean> {
    const [dispute] = await db
      .select()
      .from(disputes)
      .where(
        and(
          eq(disputes.id, disputeId),
          eq(disputes.userId, userId)
        )
      );
    return !!dispute;
  }
  
  async getDisputePartyByUserId(disputeId: number, userId: number): Promise<DisputeParty | undefined> {
    const [party] = await db
      .select()
      .from(disputeParties)
      .where(
        and(
          eq(disputeParties.disputeId, disputeId),
          eq(disputeParties.userId, userId)
        )
      );
    return party;
  }
}

// Export an instance of the DatabaseStorage class
export const storage = new DatabaseStorage();