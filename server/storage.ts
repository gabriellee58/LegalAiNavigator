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
  
  async updateUser(id: number, userData: Partial<Omit<User, "id">>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Password reset token operations
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({
        userId,
        token,
        expiresAt
      })
      .returning();
    return resetToken;
  }
  
  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken;
  }
  
  async deletePasswordResetToken(token: string): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
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

    // Default template data for the Canadian legal system
    const defaultTemplates = [
      // CONTRACTS
      {
        templateType: "contracts",
        subcategory: "services",
        title: "Service Agreement",
        description: "A standard agreement for providing services to clients",
        language: "en",
        templateContent: "# SERVICE AGREEMENT\n\nThis Service Agreement (the \"Agreement\") is entered into as of [DATE] by and between [SERVICE PROVIDER NAME], located at [ADDRESS] (the \"Service Provider\"), and [CLIENT NAME], located at [CLIENT ADDRESS] (the \"Client\").\n\n## 1. SERVICES\n\nService Provider agrees to provide the following services to Client (the \"Services\"): [DETAILED DESCRIPTION OF SERVICES]\n\n## 2. TERM\n\nThis Agreement shall commence on [START DATE] and continue until [END DATE], unless earlier terminated as provided herein.\n\n## 3. COMPENSATION\n\nClient agrees to pay Service Provider [AMOUNT] in Canadian Dollars (CAD) for the Services according to the following schedule: [PAYMENT SCHEDULE]\n\n## 4. TERMINATION\n\nEither party may terminate this Agreement with [NOTICE PERIOD] written notice to the other party.\n\n## 5. CONFIDENTIALITY\n\nEach party agrees to maintain the confidentiality of any proprietary information received from the other party during the term of this Agreement and for [TIME PERIOD] thereafter.\n\n## 6. GOVERNING LAW\n\nThis Agreement shall be governed by the laws of [PROVINCE/TERRITORY], Canada.\n\n## 7. DISPUTE RESOLUTION\n\nAny dispute arising from this Agreement shall be resolved through arbitration in [CITY], [PROVINCE/TERRITORY] in accordance with the rules of the Canadian Arbitration Association.\n\n## 8. ENTIRE AGREEMENT\n\nThis Agreement constitutes the entire agreement between the parties and supersedes all previous agreements or representations, whether written or oral.\n\nIN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.\n\n[SERVICE PROVIDER NAME]\nBy: ______________________________\nName: [NAME]\nTitle: [TITLE]\n\n[CLIENT NAME]\nBy: ______________________________\nName: [NAME]\nTitle: [TITLE]",
        fields: {
          serviceProviderName: { type: "text", label: "Service Provider Name", required: true },
          serviceProviderAddress: { type: "text", label: "Service Provider Address", required: true },
          clientName: { type: "text", label: "Client Name", required: true },
          clientAddress: { type: "text", label: "Client Address", required: true },
          serviceDescription: { type: "textarea", label: "Service Description", required: true },
          startDate: { type: "date", label: "Start Date", required: true },
          endDate: { type: "date", label: "End Date", required: true },
          compensationAmount: { type: "text", label: "Compensation Amount", required: true },
          paymentSchedule: { type: "text", label: "Payment Schedule", required: true },
          noticePeriod: { type: "text", label: "Notice Period", required: true, default: "30 days" },
          confidentialityPeriod: { type: "text", label: "Confidentiality Period", required: true, default: "2 years" },
          province: { type: "select", label: "Governing Law Province/Territory", required: true, options: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] },
          city: { type: "text", label: "Arbitration City", required: true },
          signatoryName1: { type: "text", label: "Service Provider Signatory Name", required: true },
          signatoryTitle1: { type: "text", label: "Service Provider Signatory Title", required: true },
          signatoryName2: { type: "text", label: "Client Signatory Name", required: true },
          signatoryTitle2: { type: "text", label: "Client Signatory Title", required: true }
        },
        jurisdiction: "Canada"
      },
      {
        templateType: "contracts",
        subcategory: "nda",
        title: "Non-Disclosure Agreement",
        description: "A confidentiality agreement to protect sensitive information",
        language: "en",
        templateContent: "# NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (the \"Agreement\") is entered into as of [DATE] between [PARTY A NAME], located at [PARTY A ADDRESS] (\"Party A\"), and [PARTY B NAME], located at [PARTY B ADDRESS] (\"Party B\").\n\n## 1. PURPOSE\n\nThe parties wish to explore a potential business relationship concerning [BUSINESS PURPOSE] (the \"Purpose\"). In connection with the Purpose, each party may disclose to the other certain confidential and proprietary information.\n\n## 2. CONFIDENTIAL INFORMATION\n\n\"Confidential Information\" means any information disclosed by one party (the \"Disclosing Party\") to the other party (the \"Receiving Party\"), either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as \"Confidential\" or would reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.\n\n## 3. OBLIGATIONS\n\nThe Receiving Party shall:\n(a) maintain the confidentiality of the Disclosing Party's Confidential Information;\n(b) not disclose any Confidential Information to any person other than employees or agents of the Receiving Party who have a need to know such information and who are bound by obligations of confidentiality at least as restrictive as those contained herein;\n(c) not use any Confidential Information for any purpose other than in connection with the Purpose; and\n(d) use at least the same degree of care to protect the Disclosing Party's Confidential Information as it uses to protect its own confidential information, but in no case less than reasonable care.\n\n## 4. EXCLUSIONS\n\nThe obligations in Section 3 shall not apply to information that:\n(a) was rightfully known to the Receiving Party without restriction before receipt from the Disclosing Party;\n(b) is or becomes publicly available through no fault of the Receiving Party;\n(c) is rightfully received by the Receiving Party from a third party without a duty of confidentiality; or\n(d) is independently developed by the Receiving Party without use of the Disclosing Party's Confidential Information.\n\n## 5. REQUIRED DISCLOSURE\n\nIf the Receiving Party is required by law to disclose Confidential Information, it shall promptly notify the Disclosing Party and provide reasonable cooperation, at the Disclosing Party's expense, to permit the Disclosing Party to obtain a protective order or otherwise prevent or restrict such disclosure.\n\n## 6. TERM AND TERMINATION\n\nThis Agreement shall commence on the date first written above and continue for a period of [TERM] years. The Receiving Party's obligations with respect to Confidential Information shall survive for a period of [CONFIDENTIALITY PERIOD] years following termination of this Agreement.\n\n## 7. GOVERNING LAW\n\nThis Agreement shall be governed by the laws of [PROVINCE/TERRITORY], Canada, without regard to its conflict of laws principles.\n\nIN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.\n\n[PARTY A NAME]\nBy: ______________________________\nName: [NAME]\nTitle: [TITLE]\n\n[PARTY B NAME]\nBy: ______________________________\nName: [NAME]\nTitle: [TITLE]",
        fields: {
          partyAName: { type: "text", label: "Party A Name", required: true },
          partyAAddress: { type: "text", label: "Party A Address", required: true },
          partyBName: { type: "text", label: "Party B Name", required: true },
          partyBAddress: { type: "text", label: "Party B Address", required: true },
          businessPurpose: { type: "textarea", label: "Business Purpose", required: true },
          term: { type: "number", label: "Agreement Term (years)", required: true, default: 2 },
          confidentialityPeriod: { type: "number", label: "Confidentiality Period (years)", required: true, default: 5 },
          province: { type: "select", label: "Governing Law Province/Territory", required: true, options: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] },
          signatoryNameA: { type: "text", label: "Party A Signatory Name", required: true },
          signatoryTitleA: { type: "text", label: "Party A Signatory Title", required: true },
          signatoryNameB: { type: "text", label: "Party B Signatory Name", required: true },
          signatoryTitleB: { type: "text", label: "Party B Signatory Title", required: true }
        },
        jurisdiction: "Canada"
      },
      
      // LEASES
      {
        templateType: "leases",
        subcategory: "residential",
        title: "Residential Lease Agreement",
        description: "A standard residential lease agreement compliant with Ontario regulations.",
        language: "en",
        templateContent: "# RESIDENTIAL LEASE AGREEMENT\n\nThis Residential Lease Agreement (the \"Lease\") is made on [DATE] between [LANDLORD NAME], located at [LANDLORD ADDRESS] (the \"Landlord\"), and [TENANT NAME] (the \"Tenant\").\n\n## 1. PREMISES\n\nLandlord hereby leases to Tenant and Tenant hereby leases from Landlord, subject to the terms and conditions of this Lease, the residential premises located at [PROPERTY ADDRESS] (the \"Premises\").\n\n## 2. TERM\n\nThe term of this Lease shall be for [LEASE TERM] commencing on [START DATE] and ending on [END DATE], unless earlier terminated as provided herein.\n\n## 3. RENT\n\nTenant shall pay to Landlord as rent for the Premises the sum of $[MONTHLY RENT] per month, due on the [DUE DATE] day of each month, without demand or deduction. Rent shall be paid to Landlord at [PAYMENT ADDRESS] or such other place as Landlord may designate from time to time.\n\n## 4. SECURITY DEPOSIT\n\nUpon execution of this Lease, Tenant shall pay to Landlord the sum of $[SECURITY DEPOSIT AMOUNT] as a security deposit. Landlord may apply the security deposit to remedy any default by Tenant in the performance of Tenant's obligations under this Lease. The security deposit, or any balance thereof, shall be returned to Tenant within [RETURN PERIOD] days after the termination of this Lease.\n\n## 5. UTILITIES\n\nTenant shall be responsible for arranging and paying for all utility services required on the Premises, except for the following, which shall be provided by the Landlord: [LANDLORD PROVIDED UTILITIES].\n\n## 6. USE OF PREMISES\n\nThe Premises shall be used as a private dwelling only. Tenant shall not use or allow the Premises to be used for any other purpose without the prior written consent of Landlord.\n\n## 7. MAINTENANCE AND REPAIRS\n\nTenant shall maintain the Premises in a clean and sanitary condition and shall not damage or permit damage to be done to the Premises. Tenant shall be responsible for the cost of repairing any damage to the Premises caused by Tenant or Tenant's guests, other than normal wear and tear.\n\n## 8. ASSIGNMENT AND SUBLETTING\n\nTenant shall not assign this Lease or sublet any portion of the Premises without the prior written consent of Landlord, which consent shall not be unreasonably withheld.\n\n## 9. LANDLORD'S ACCESS TO PREMISES\n\nLandlord may enter the Premises at reasonable times and with reasonable notice to inspect the Premises, make necessary repairs, or show the Premises to prospective tenants or purchasers. In case of emergency, Landlord may enter the Premises without notice.\n\n## 10. TERMINATION\n\nThis Lease may be terminated by Landlord or Tenant in accordance with applicable law.\n\n## 11. GOVERNING LAW\n\nThis Lease shall be governed by the laws of [PROVINCE/TERRITORY], Canada, and the Residential Tenancies Act.\n\nIN WITNESS WHEREOF, the parties have executed this Lease as of the date first above written.\n\n[LANDLORD NAME]\nBy: ______________________________\nName: [NAME]\nTitle: [TITLE]\n\n[TENANT NAME]\nBy: ______________________________\nName: [NAME]",
        fields: {
          landlordName: { type: "text", label: "Landlord Name", required: true },
          landlordAddress: { type: "text", label: "Landlord Address", required: true },
          tenantName: { type: "text", label: "Tenant Name", required: true },
          propertyAddress: { type: "text", label: "Property Address", required: true },
          leaseTerm: { type: "text", label: "Lease Term", required: true, default: "12 months" },
          startDate: { type: "date", label: "Start Date", required: true },
          endDate: { type: "date", label: "End Date", required: true },
          monthlyRent: { type: "number", label: "Monthly Rent", required: true },
          dueDate: { type: "number", label: "Rent Due Date", required: true, default: 1 },
          paymentAddress: { type: "text", label: "Payment Address", required: true },
          securityDeposit: { type: "number", label: "Security Deposit Amount", required: true },
          returnPeriod: { type: "number", label: "Security Deposit Return Period (days)", required: true, default: 30 },
          landlordProvidedUtilities: { type: "text", label: "Landlord Provided Utilities", required: true, default: "water, property tax" },
          province: { type: "select", label: "Province/Territory", required: true, options: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] },
          landlordSignatoryName: { type: "text", label: "Landlord Signatory Name", required: true },
          landlordSignatoryTitle: { type: "text", label: "Landlord Signatory Title", required: true },
          tenantSignatoryName: { type: "text", label: "Tenant Signatory Name", required: true }
        },
        jurisdiction: "Ontario"
      },
      {
        templateType: "leases",
        subcategory: "commercial",
        title: "Commercial Lease Agreement",
        description: "A comprehensive commercial lease agreement for business properties.",
        language: "en",
        templateContent: "# COMMERCIAL LEASE AGREEMENT\n\nThis Commercial Lease Agreement (the \"Lease\") is made on [DATE] between [LANDLORD NAME], located at [LANDLORD ADDRESS] (the \"Landlord\"), and [TENANT NAME], located at [TENANT ADDRESS] (the \"Tenant\").\n\n## 1. PREMISES\n\nLandlord hereby leases to Tenant and Tenant hereby leases from Landlord, subject to the terms and conditions of this Lease, the commercial premises located at [PROPERTY ADDRESS], consisting of approximately [SQUARE FOOTAGE] square feet (the \"Premises\").\n\n## 2. TERM\n\nThe term of this Lease shall be for [LEASE TERM] commencing on [START DATE] (the \"Commencement Date\") and ending on [END DATE] (the \"Expiration Date\"), unless earlier terminated or extended as provided herein.\n\n## 3. RENT\n\n### 3.1 Base Rent\n\nTenant shall pay to Landlord as base rent for the Premises the sum of $[ANNUAL RENT] per year, payable in equal monthly installments of $[MONTHLY RENT] on the [DUE DATE] day of each month, without demand or deduction.\n\n### 3.2 Additional Rent\n\nIn addition to the Base Rent, Tenant shall pay as additional rent Tenant's proportionate share of all Operating Expenses, as defined in Section 4 below.\n\n### 3.3 Late Payment\n\nIf Tenant fails to pay any installment of rent within [GRACE PERIOD] days after the due date, Tenant shall pay to Landlord a late charge equal to [LATE FEE PERCENTAGE]% of the overdue amount.\n\n## 4. OPERATING EXPENSES\n\n### 4.1 Definition\n\n\"Operating Expenses\" shall mean all costs and expenses incurred by Landlord in the ownership, operation, maintenance, repair and replacement of the Building, including but not limited to: [LIST OF OPERATING EXPENSES].\n\n### 4.2 Payment of Tenant's Share\n\nTenant shall pay to Landlord Tenant's proportionate share of the Operating Expenses. Tenant's proportionate share shall be calculated by dividing the square footage of the Premises by the total square footage of the Building.\n\n## 5. SECURITY DEPOSIT\n\nUpon execution of this Lease, Tenant shall pay to Landlord the sum of $[SECURITY DEPOSIT AMOUNT] as a security deposit. Landlord may apply the security deposit to remedy any default by Tenant in the performance of Tenant's obligations under this Lease. The security deposit, or any balance thereof, shall be returned to Tenant within [RETURN PERIOD] days after the termination of this Lease.\n\n## 6. USE OF PREMISES\n\nTenant shall use the Premises solely for the purpose of [PERMITTED USE] and for no other purpose without the prior written consent of Landlord.\n\n## 7. MAINTENANCE AND REPAIRS\n\n### 7.1 Landlord's Obligations\n\nLandlord shall maintain in good condition and repair the structural elements of the Building, including the foundation, exterior walls, structural condition of interior bearing walls, exterior roof, common areas, and the building systems serving the Premises.\n\n### 7.2 Tenant's Obligations\n\nTenant shall, at Tenant's expense, maintain the Premises in good condition and repair, including all non-structural portions of the Premises such as interior walls, floors, ceilings, doors, windows, and all electrical, plumbing, heating, ventilating and air conditioning systems serving the Premises exclusively.\n\n## 8. ALTERATIONS AND IMPROVEMENTS\n\nTenant shall not make any alterations, additions or improvements to the Premises without the prior written consent of Landlord, which consent shall not be unreasonably withheld.\n\n## 9. ASSIGNMENT AND SUBLETTING\n\nTenant shall not assign this Lease or sublet any portion of the Premises without the prior written consent of Landlord, which consent shall not be unreasonably withheld.\n\n## 10. INSURANCE\n\nTenant shall, at Tenant's expense, obtain and maintain throughout the term of this Lease commercial general liability insurance, property insurance, and any other insurance required by Landlord or by law.\n\n## 11. INDEMNIFICATION\n\nTenant shall indemnify, defend and hold harmless Landlord from and against any and all claims, damages, liabilities, costs and expenses (including reasonable attorneys' fees) arising from Tenant's use of the Premises or from any activity, work or thing done, permitted or suffered by Tenant in or about the Premises.\n\n## 12. DEFAULT\n\nThe occurrence of any of the following shall constitute a default by Tenant under this Lease: [LIST OF DEFAULT EVENTS].\n\n## 13. REMEDIES\n\nUpon the occurrence of any default by Tenant, Landlord may, at Landlord's option, exercise any one or more of the following remedies: [LIST OF REMEDIES].\n\n## 14. GOVERNING LAW\n\nThis Lease shall be governed by the laws of [PROVINCE/TERRITORY], Canada.\n\nIN WITNESS WHEREOF, the parties have executed this Lease as of the date first above written.\n\n[LANDLORD NAME]\nBy: ______________________________\nName: [NAME]\nTitle: [TITLE]\n\n[TENANT NAME]\nBy: ______________________________\nName: [NAME]\nTitle: [TITLE]",
        fields: {
          landlordName: { type: "text", label: "Landlord Name", required: true },
          landlordAddress: { type: "text", label: "Landlord Address", required: true },
          tenantName: { type: "text", label: "Tenant Name", required: true },
          tenantAddress: { type: "text", label: "Tenant Address", required: true },
          propertyAddress: { type: "text", label: "Property Address", required: true },
          squareFootage: { type: "number", label: "Square Footage", required: true },
          leaseTerm: { type: "text", label: "Lease Term", required: true, default: "5 years" },
          startDate: { type: "date", label: "Start Date", required: true },
          endDate: { type: "date", label: "End Date", required: true },
          annualRent: { type: "number", label: "Annual Rent", required: true },
          monthlyRent: { type: "number", label: "Monthly Rent", required: true },
          dueDate: { type: "number", label: "Rent Due Date", required: true, default: 1 },
          gracePeriod: { type: "number", label: "Grace Period (days)", required: true, default: 5 },
          lateFeePercentage: { type: "number", label: "Late Fee Percentage", required: true, default: 5 },
          operatingExpenses: { type: "textarea", label: "List of Operating Expenses", required: true, default: "property taxes, insurance, utilities, maintenance, repairs, cleaning, security" },
          securityDeposit: { type: "number", label: "Security Deposit Amount", required: true },
          returnPeriod: { type: "number", label: "Security Deposit Return Period (days)", required: true, default: 30 },
          permittedUse: { type: "text", label: "Permitted Use", required: true },
          defaultEvents: { type: "textarea", label: "List of Default Events", required: true, default: "Failure to pay rent, breach of any provision of this Lease, abandonment of the Premises, bankruptcy or insolvency" },
          remedies: { type: "textarea", label: "List of Remedies", required: true, default: "Terminate the Lease, recover all damages, recover possession of the Premises, pursue any other remedy available at law or in equity" },
          province: { type: "select", label: "Province/Territory", required: true, options: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] },
          landlordSignatoryName: { type: "text", label: "Landlord Signatory Name", required: true },
          landlordSignatoryTitle: { type: "text", label: "Landlord Signatory Title", required: true },
          tenantSignatoryName: { type: "text", label: "Tenant Signatory Name", required: true },
          tenantSignatoryTitle: { type: "text", label: "Tenant Signatory Title", required: true }
        },
        jurisdiction: "Canada"
      },

      // WILLS & ESTATES
      {
        templateType: "wills-estates",
        subcategory: "simple-will",
        title: "Simple Will",
        description: "A basic will template suitable for individuals with straightforward estates.",
        language: "en",
        templateContent: "# LAST WILL AND TESTAMENT\n\nI, [TESTATOR NAME], of [TESTATOR ADDRESS], being of sound mind and memory, hereby revoke all previous wills and codicils made by me and declare this to be my Last Will and Testament.\n\n## 1. EXECUTOR\n\nI appoint [EXECUTOR NAME], of [EXECUTOR ADDRESS], to be the Executor of this Will. If [EXECUTOR NAME] is unable or unwilling to act as Executor, I appoint [ALTERNATE EXECUTOR NAME], of [ALTERNATE EXECUTOR ADDRESS], to be the Executor of this Will.\n\n## 2. GUARDIAN\n\nIf at the time of my death I have any minor children, I appoint [GUARDIAN NAME], of [GUARDIAN ADDRESS], to be the Guardian of such children. If [GUARDIAN NAME] is unable or unwilling to act as Guardian, I appoint [ALTERNATE GUARDIAN NAME], of [ALTERNATE GUARDIAN ADDRESS], to be the Guardian of such children.\n\n## 3. SPECIFIC BEQUESTS\n\nI give the following specific bequests:\n\n[SPECIFIC BEQUESTS]\n\n## 4. RESIDUE OF ESTATE\n\nI give the residue of my estate to [RESIDUARY BENEFICIARY], of [RESIDUARY BENEFICIARY ADDRESS]. If [RESIDUARY BENEFICIARY] does not survive me, I give the residue of my estate to [ALTERNATE RESIDUARY BENEFICIARY], of [ALTERNATE RESIDUARY BENEFICIARY ADDRESS].\n\n## 5. EXECUTOR'S POWERS\n\nMy Executor shall have the following powers:\n\n(a) to sell, lease, or otherwise dispose of any property in my estate;\n(b) to invest any money in my estate in any investments that my Executor considers appropriate;\n(c) to make any division or distribution of property in my estate in cash or in kind, or partly in cash and partly in kind;\n(d) to pay any debts or expenses relating to my estate;\n(e) to exercise any other powers that are necessary or desirable for the proper administration of my estate.\n\n## 6. GOVERNING LAW\n\nThis Will shall be governed by the laws of [PROVINCE/TERRITORY], Canada.\n\nIN WITNESS WHEREOF, I have signed this Will on [DATE].\n\n______________________________\n[TESTATOR NAME]\n\nSigned by [TESTATOR NAME] as their Last Will and Testament in our presence, and at their request and in their presence and in the presence of each other, we have signed our names as witnesses.\n\n______________________________\nWitness Signature\n[WITNESS 1 NAME]\n[WITNESS 1 ADDRESS]\n[WITNESS 1 OCCUPATION]\n\n______________________________\nWitness Signature\n[WITNESS 2 NAME]\n[WITNESS 2 ADDRESS]\n[WITNESS 2 OCCUPATION]",
        fields: {
          testatorName: { type: "text", label: "Your Full Legal Name", required: true },
          testatorAddress: { type: "text", label: "Your Full Address", required: true },
          executorName: { type: "text", label: "Executor Full Name", required: true },
          executorAddress: { type: "text", label: "Executor Address", required: true },
          alternateExecutorName: { type: "text", label: "Alternate Executor Full Name", required: true },
          alternateExecutorAddress: { type: "text", label: "Alternate Executor Address", required: true },
          guardianName: { type: "text", label: "Guardian Full Name (if applicable)" },
          guardianAddress: { type: "text", label: "Guardian Address (if applicable)" },
          alternateGuardianName: { type: "text", label: "Alternate Guardian Full Name (if applicable)" },
          alternateGuardianAddress: { type: "text", label: "Alternate Guardian Address (if applicable)" },
          specificBequests: { type: "textarea", label: "Specific Bequests", default: "1. I give my [ITEM] to [BENEFICIARY NAME].\n2. I give my [ITEM] to [BENEFICIARY NAME]." },
          residuaryBeneficiary: { type: "text", label: "Residuary Beneficiary Full Name", required: true },
          residuaryBeneficiaryAddress: { type: "text", label: "Residuary Beneficiary Address", required: true },
          alternateResiduaryBeneficiary: { type: "text", label: "Alternate Residuary Beneficiary Full Name", required: true },
          alternateResiduaryBeneficiaryAddress: { type: "text", label: "Alternate Residuary Beneficiary Address", required: true },
          province: { type: "select", label: "Province/Territory", required: true, options: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] },
          witness1Name: { type: "text", label: "First Witness Full Name", required: true },
          witness1Address: { type: "text", label: "First Witness Address", required: true },
          witness1Occupation: { type: "text", label: "First Witness Occupation", required: true },
          witness2Name: { type: "text", label: "Second Witness Full Name", required: true },
          witness2Address: { type: "text", label: "Second Witness Address", required: true },
          witness2Occupation: { type: "text", label: "Second Witness Occupation", required: true }
        },
        jurisdiction: "Canada"
      },

      // BUSINESS FORMATION
      {
        templateType: "business-formation",
        subcategory: "incorporation",
        title: "Articles of Incorporation",
        description: "Documentation required for incorporating a business in Canada.",
        language: "en",
        templateContent: "# ARTICLES OF INCORPORATION\n\nThese Articles of Incorporation are submitted to incorporate a corporation under the Canada Business Corporations Act.\n\n## 1. CORPORATE NAME\n\nThe name of the corporation is: [CORPORATION NAME]\n\n## 2. REGISTERED OFFICE\n\nThe registered office of the corporation is located in the province of [PROVINCE/TERRITORY], at:\n\n[REGISTERED OFFICE ADDRESS]\n\n## 3. CLASSES AND MAXIMUM NUMBER OF SHARES\n\nThe corporation is authorized to issue an unlimited number of shares of the following classes:\n\n[SHARE CLASSES]\n\n## 4. RESTRICTIONS ON SHARE TRANSFERS\n\nThe right to transfer shares of the corporation shall be restricted as follows:\n\n[TRANSFER RESTRICTIONS]\n\n## 5. NUMBER OF DIRECTORS\n\nThe board of directors of the corporation shall consist of a minimum of [MINIMUM NUMBER] and a maximum of [MAXIMUM NUMBER] directors.\n\n## 6. RESTRICTIONS ON BUSINESS\n\nThere are no restrictions on the business that the corporation may carry on.\n\n## 7. OTHER PROVISIONS\n\n[OTHER PROVISIONS]\n\n## 8. INCORPORATORS\n\nName and address of each incorporator:\n\n[INCORPORATOR NAME]\n[INCORPORATOR ADDRESS]\n\nDate: [DATE]\n\n______________________________\nSignature of Incorporator",
        fields: {
          corporationName: { type: "text", label: "Corporation Name", required: true },
          province: { type: "select", label: "Province/Territory", required: true, options: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] },
          registeredOfficeAddress: { type: "textarea", label: "Registered Office Address", required: true },
          shareClasses: { type: "textarea", label: "Share Classes", required: true, default: "Class A Common Shares: The holders of Class A Common Shares shall be entitled to vote at all meetings of shareholders, to receive dividends as and when declared by the directors, and to receive the remaining property of the corporation upon dissolution." },
          transferRestrictions: { type: "textarea", label: "Transfer Restrictions", required: true, default: "No shares of the corporation shall be transferred without the approval of the board of directors of the corporation, expressed by a resolution passed at a meeting of the board of directors or by a resolution in writing signed by all of the directors." },
          minimumDirectors: { type: "number", label: "Minimum Number of Directors", required: true, default: 1 },
          maximumDirectors: { type: "number", label: "Maximum Number of Directors", required: true, default: 10 },
          otherProvisions: { type: "textarea", label: "Other Provisions", default: "The directors may appoint one or more additional directors, who shall hold office for a term expiring not later than the close of the next annual meeting of shareholders, but the total number of directors so appointed may not exceed one-third of the number of directors elected at the previous annual meeting of shareholders." },
          incorporatorName: { type: "text", label: "Incorporator Full Name", required: true },
          incorporatorAddress: { type: "text", label: "Incorporator Address", required: true }
        },
        jurisdiction: "Canada"
      },

      // IP MANAGEMENT
      {
        templateType: "ip-management",
        subcategory: "trademark",
        title: "Trademark Application",
        description: "Template for filing a trademark application in Canada.",
        language: "en",
        templateContent: "# APPLICATION FOR REGISTRATION OF A TRADEMARK\n\nTo the Registrar of Trademarks:\n\nThe undersigned hereby requests the registration of the following trademark under the Trademarks Act:\n\n## 1. APPLICANT INFORMATION\n\nName: [APPLICANT NAME]\nAddress: [APPLICANT ADDRESS]\nTelephone: [APPLICANT PHONE]\nEmail: [APPLICANT EMAIL]\n\n## 2. TRADEMARK INFORMATION\n\nTrademark: [TRADEMARK]\nType of Trademark: [TRADEMARK TYPE]\nDescription of Trademark (if applicable): [TRADEMARK DESCRIPTION]\n\n## 3. GOODS AND SERVICES\n\nThe trademark is used or proposed to be used in Canada in association with the following goods and services:\n\n[GOODS AND SERVICES]\n\n## 4. DATE OF FIRST USE\n\nThe trademark has been used in Canada since [FIRST USE DATE] in association with the following goods and services: [USED GOODS AND SERVICES]\n\nThe trademark is proposed to be used in Canada in association with the following goods and services: [PROPOSED GOODS AND SERVICES]\n\n## 5. PRIORITY CLAIM\n\n[PRIORITY CLAIM]\n\n## 6. DISCLAIMERS\n\n[DISCLAIMERS]\n\n## 7. REPRESENTATIVE FOR SERVICE\n\nName: [REPRESENTATIVE NAME]\nAddress: [REPRESENTATIVE ADDRESS]\nTelephone: [REPRESENTATIVE PHONE]\nEmail: [REPRESENTATIVE EMAIL]\n\nDated at [CITY], [PROVINCE/TERRITORY], this [DAY] day of [MONTH], [YEAR].\n\n______________________________\n[APPLICANT NAME]\n[TITLE]",
        fields: {
          applicantName: { type: "text", label: "Applicant Name", required: true },
          applicantAddress: { type: "textarea", label: "Applicant Address", required: true },
          applicantPhone: { type: "text", label: "Applicant Phone", required: true },
          applicantEmail: { type: "text", label: "Applicant Email", required: true },
          trademark: { type: "text", label: "Trademark", required: true },
          trademarkType: { type: "select", label: "Type of Trademark", required: true, options: ["Word Mark", "Design Mark", "Sound Mark", "Certification Mark", "Distinguishing Guise"] },
          trademarkDescription: { type: "textarea", label: "Trademark Description (for non-word marks)" },
          goodsAndServices: { type: "textarea", label: "Goods and Services", required: true },
          firstUseDate: { type: "date", label: "Date of First Use (if applicable)" },
          usedGoodsAndServices: { type: "textarea", label: "Goods and Services Already in Use" },
          proposedGoodsAndServices: { type: "textarea", label: "Goods and Services Proposed to be Used" },
          priorityClaim: { type: "textarea", label: "Priority Claim (if applicable)" },
          disclaimers: { type: "textarea", label: "Disclaimers (if applicable)" },
          representativeName: { type: "text", label: "Representative Name" },
          representativeAddress: { type: "textarea", label: "Representative Address" },
          representativePhone: { type: "text", label: "Representative Phone" },
          representativeEmail: { type: "text", label: "Representative Email" },
          city: { type: "text", label: "City", required: true },
          province: { type: "select", label: "Province/Territory", required: true, options: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] },
          day: { type: "number", label: "Day", required: true },
          month: { type: "text", label: "Month", required: true },
          year: { type: "number", label: "Year", required: true },
          title: { type: "text", label: "Title", required: true }
        },
        jurisdiction: "Canada"
      }
    ];

    // Insert default templates
    for (const template of defaultTemplates) {
      await this.createDocumentTemplate(template);
    }

    console.log(`Initialized ${defaultTemplates.length} default document templates`);
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