import { 
  users, type User, type InsertUser,
  chatMessages, type ChatMessage, type InsertChatMessage,
  documentTemplates, type DocumentTemplate, type InsertDocumentTemplate,
  generatedDocuments, type GeneratedDocument, type InsertGeneratedDocument,
  researchQueries, type ResearchQuery, type InsertResearchQuery,
  contractAnalyses, type ContractAnalysis, type InsertContractAnalysis,
  complianceChecks, type ComplianceCheck, type InsertComplianceCheck,
  disputes, type Dispute, type InsertDispute,
  mediationSessions, type MediationSession, type InsertMediationSession,
  mediationMessages, type MediationMessage, type InsertMediationMessage,
  savedCitations, type SavedCitation, type InsertSavedCitation,
  researchVisualizations, type ResearchVisualization, type InsertResearchVisualization
} from "@shared/schema";
import { db } from './db';
import { eq, and, desc, inArray } from 'drizzle-orm';
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
  
  // Initialize default templates
  initializeDefaultDocumentTemplates(): Promise<void>;
}

// Initialize PostgreSQL session store for Express sessions
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  // Session store for user authentication
  public sessionStore: session.Store;

  constructor() {
    // Initialize PostgreSQL session store
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
      .orderBy(chatMessages.timestamp);
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    return chatMessage;
  }
  
  // Document template operations
  async getDocumentTemplates(language = 'en'): Promise<DocumentTemplate[]> {
    return await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.language, language));
  }
  
  async getDocumentTemplatesByType(templateType: string, language = 'en'): Promise<DocumentTemplate[]> {
    return await db
      .select()
      .from(documentTemplates)
      .where(
        and(
          eq(documentTemplates.templateType, templateType),
          eq(documentTemplates.language, language)
        )
      );
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
  
  async updateComplianceCheck(id: number, check: Partial<InsertComplianceCheck>): Promise<ComplianceCheck | undefined> {
    const [updatedCheck] = await db
      .update(complianceChecks)
      .set(check)
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
      .where(inArray(disputes.status, statuses))
      .orderBy(desc(disputes.updatedAt));
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
      .orderBy(desc(researchVisualizations.updatedAt));
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

  // Method to initialize default document templates if not already present
  async initializeDefaultDocumentTemplates() {
    // Check if templates already exist
    const existing = await this.getDocumentTemplates();
    if (existing.length > 0) return;
    
    // Service Agreement template
    await this.createDocumentTemplate({
      templateType: 'contract',
      subcategory: 'service',
      title: 'Service Agreement',
      description: 'A basic service agreement between a service provider and client',
      language: 'en',
      jurisdiction: 'Canada',
      templateContent: `SERVICE AGREEMENT

This Service Agreement (the "Agreement") is made and entered into as of [DATE], by and between [CLIENT NAME], with a principal place of business at [CLIENT ADDRESS] (the "Client"), and [SERVICE PROVIDER NAME], with a principal place of business at [SERVICE PROVIDER ADDRESS] (the "Service Provider").

1. SERVICES
Service Provider agrees to provide the following services to Client (the "Services"):
[DESCRIPTION OF SERVICES]

2. TERM
This Agreement shall commence on [START DATE] and shall remain in effect until [END DATE] or until terminated as provided herein.

3. COMPENSATION
In consideration for the Services, Client shall pay Service Provider [PAYMENT AMOUNT] [per hour/fixed fee] plus applicable taxes. Payment shall be made as follows: [PAYMENT SCHEDULE].

4. TERMINATION
Either party may terminate this Agreement upon [NOTICE PERIOD] days written notice to the other party.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the Province of [PROVINCE], Canada, without giving effect to any choice or conflict of law provision.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

[CLIENT NAME]
By: ________________________
Name: [AUTHORIZED PERSON]
Title: [TITLE]

[SERVICE PROVIDER NAME]
By: ________________________
Name: [AUTHORIZED PERSON]
Title: [TITLE]`,
      fields: [
        { name: 'date', label: 'Agreement Date', type: 'date', required: true },
        { name: 'clientName', label: 'Client Name', type: 'text', required: true },
        { name: 'clientAddress', label: 'Client Address', type: 'text', required: true },
        { name: 'serviceProviderName', label: 'Service Provider Name', type: 'text', required: true },
        { name: 'serviceProviderAddress', label: 'Service Provider Address', type: 'text', required: true },
        { name: 'servicesDescription', label: 'Description of Services', type: 'textarea', required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        { name: 'paymentAmount', label: 'Payment Amount', type: 'text', required: true },
        { name: 'paymentSchedule', label: 'Payment Schedule', type: 'text', required: true },
        { name: 'noticePeriod', label: 'Notice Period (days)', type: 'number', required: true },
        { name: 'province', label: 'Governing Province', type: 'text', required: true },
        { name: 'clientAuthorizedPerson', label: 'Client Authorized Person', type: 'text', required: true },
        { name: 'clientTitle', label: 'Client Title', type: 'text', required: true },
        { name: 'serviceProviderAuthorizedPerson', label: 'Service Provider Authorized Person', type: 'text', required: true },
        { name: 'serviceProviderTitle', label: 'Service Provider Title', type: 'text', required: true }
      ]
    });
    
    // Residential Lease Agreement template
    await this.createDocumentTemplate({
      templateType: 'real-estate',
      subcategory: 'residential-lease',
      title: 'Residential Lease Agreement',
      description: 'A standard residential lease agreement for landlords and tenants',
      language: 'en',
      jurisdiction: 'Canada',
      templateContent: `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement (the "Lease") is made and entered into as of [DATE], by and between [LANDLORD NAME], with an address of [LANDLORD ADDRESS] (the "Landlord"), and [TENANT NAME], with an address of [TENANT ADDRESS] (the "Tenant").

1. PREMISES
Landlord hereby leases to Tenant, and Tenant hereby leases from Landlord, the residential premises located at [PROPERTY ADDRESS] (the "Premises").

2. TERM
The term of this Lease shall begin on [START DATE] and end on [END DATE] ("Term").

3. RENT
Tenant agrees to pay Landlord rent in the amount of [RENT AMOUNT] Canadian Dollars per month, payable in advance on the [DUE DAY] day of each month.

4. SECURITY DEPOSIT
Upon execution of this Lease, Tenant shall pay to Landlord the sum of [SECURITY DEPOSIT AMOUNT] Canadian Dollars as a security deposit.

5. UTILITIES
Tenant shall be responsible for the payment of the following utilities: [UTILITIES].
Landlord shall be responsible for the payment of the following utilities: [LANDLORD UTILITIES].

6. MAINTENANCE AND REPAIRS
Tenant shall keep the Premises in a clean and sanitary condition and shall surrender the same at termination of the Lease in as good condition as received, normal wear and tear excepted.

7. GOVERNING LAW
This Lease shall be governed by and construed in accordance with the laws of the Province of [PROVINCE], and the Residential Tenancies Act applicable to that province.

IN WITNESS WHEREOF, the parties have executed this Lease as of the date first above written.

[LANDLORD NAME]
By: ________________________
Name: [LANDLORD NAME]

[TENANT NAME]
By: ________________________
Name: [TENANT NAME]`,
      fields: [
        { name: 'date', label: 'Agreement Date', type: 'date', required: true },
        { name: 'landlordName', label: 'Landlord Name', type: 'text', required: true },
        { name: 'landlordAddress', label: 'Landlord Address', type: 'text', required: true },
        { name: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
        { name: 'tenantAddress', label: 'Tenant Address', type: 'text', required: true },
        { name: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
        { name: 'startDate', label: 'Lease Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'Lease End Date', type: 'date', required: true },
        { name: 'rentAmount', label: 'Monthly Rent Amount', type: 'number', required: true },
        { name: 'dueDay', label: 'Rent Due Day', type: 'number', required: true },
        { name: 'securityDepositAmount', label: 'Security Deposit Amount', type: 'number', required: true },
        { name: 'utilities', label: 'Tenant Utilities', type: 'text', required: true },
        { name: 'landlordUtilities', label: 'Landlord Utilities', type: 'text', required: true },
        { name: 'province', label: 'Province', type: 'text', required: true }
      ]
    });
    
    // Simple Last Will and Testament template
    await this.createDocumentTemplate({
      templateType: 'estate',
      subcategory: 'will',
      title: 'Simple Last Will and Testament',
      description: 'A basic will document for simple estates',
      language: 'en',
      jurisdiction: 'Canada',
      templateContent: `LAST WILL AND TESTAMENT

I, [TESTATOR NAME], a resident of [CITY], [PROVINCE], Canada, being of sound mind, declare this to be my Last Will and Testament, hereby revoking all previous wills and codicils made by me.

1. EXECUTOR
I appoint [EXECUTOR NAME], of [EXECUTOR ADDRESS], as Executor of this my Will. If [EXECUTOR NAME] is unable or unwilling to serve, then I appoint [ALTERNATE EXECUTOR] as alternate Executor.

2. DEBTS AND EXPENSES
I direct my Executor to pay all my just debts, funeral expenses, and the expenses of administering my estate as soon as practicable after my death.

3. SPECIFIC BEQUESTS
[SPECIFIC BEQUESTS]

4. RESIDUARY ESTATE
I give, devise, and bequeath all the rest, residue, and remainder of my estate, of whatever kind and wherever situated, to [BENEFICIARY NAME], of [BENEFICIARY ADDRESS]. If [BENEFICIARY NAME] does not survive me, then I give, devise, and bequeath my residuary estate to [ALTERNATE BENEFICIARY].

5. GUARDIAN
If I am the sole parent or legal guardian of any minor children at the time of my death, I nominate and appoint [GUARDIAN NAME], of [GUARDIAN ADDRESS], as guardian of the person and property of such minor children.

6. POWERS OF EXECUTOR
I grant to my Executor full power to sell, lease, mortgage, or otherwise manage and dispose of all property in my estate, real or personal, without the need for a court order.

IN WITNESS WHEREOF, I have hereunto set my hand this [DAY] day of [MONTH], [YEAR].

[TESTATOR NAME]

WITNESS ATTESTATION
The foregoing instrument was signed, published, and declared by [TESTATOR NAME] as their Last Will and Testament, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses.

Witness 1: ________________________
Name: [WITNESS 1 NAME]
Address: [WITNESS 1 ADDRESS]

Witness 2: ________________________
Name: [WITNESS 2 NAME]
Address: [WITNESS 2 ADDRESS]`,
      fields: [
        { name: 'testatorName', label: 'Testator Name', type: 'text', required: true },
        { name: 'city', label: 'City', type: 'text', required: true },
        { name: 'province', label: 'Province', type: 'text', required: true },
        { name: 'executorName', label: 'Executor Name', type: 'text', required: true },
        { name: 'executorAddress', label: 'Executor Address', type: 'text', required: true },
        { name: 'alternateExecutor', label: 'Alternate Executor', type: 'text', required: true },
        { name: 'specificBequests', label: 'Specific Bequests', type: 'textarea', required: false },
        { name: 'beneficiaryName', label: 'Primary Beneficiary Name', type: 'text', required: true },
        { name: 'beneficiaryAddress', label: 'Primary Beneficiary Address', type: 'text', required: true },
        { name: 'alternateBeneficiary', label: 'Alternate Beneficiary', type: 'text', required: true },
        { name: 'guardianName', label: 'Guardian Name (if applicable)', type: 'text', required: false },
        { name: 'guardianAddress', label: 'Guardian Address', type: 'text', required: false },
        { name: 'day', label: 'Day', type: 'number', required: true },
        { name: 'month', label: 'Month', type: 'text', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'witness1Name', label: 'Witness 1 Name', type: 'text', required: true },
        { name: 'witness1Address', label: 'Witness 1 Address', type: 'text', required: true },
        { name: 'witness2Name', label: 'Witness 2 Name', type: 'text', required: true },
        { name: 'witness2Address', label: 'Witness 2 Address', type: 'text', required: true }
      ]
    });
  }
}

// Export an instance of the DatabaseStorage class
export const storage = new DatabaseStorage();