import { 
  users, type User, type InsertUser,
  chatMessages, type ChatMessage, type InsertChatMessage,
  documentTemplates, type DocumentTemplate, type InsertDocumentTemplate,
  generatedDocuments, type GeneratedDocument, type InsertGeneratedDocument,
  researchQueries, type ResearchQuery, type InsertResearchQuery
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
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
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatMessages: Map<number, ChatMessage>;
  private documentTemplates: Map<number, DocumentTemplate>;
  private generatedDocuments: Map<number, GeneratedDocument>;
  private researchQueries: Map<number, ResearchQuery>;
  
  private currentUserId: number;
  private currentChatMessageId: number;
  private currentDocumentTemplateId: number;
  private currentGeneratedDocumentId: number;
  private currentResearchQueryId: number;
  
  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.documentTemplates = new Map();
    this.generatedDocuments = new Map();
    this.researchQueries = new Map();
    
    this.currentUserId = 1;
    this.currentChatMessageId = 1;
    this.currentDocumentTemplateId = 1;
    this.currentGeneratedDocumentId = 1;
    this.currentResearchQueryId = 1;
    
    // Initialize with default document templates
    this.initializeDefaultDocumentTemplates();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Chat message operations
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.userId === userId,
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const timestamp = new Date();
    const message: ChatMessage = { ...insertMessage, id, timestamp };
    this.chatMessages.set(id, message);
    return message;
  }
  
  // Document template operations
  async getDocumentTemplates(language = 'en'): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values())
      .filter(template => template.language === language);
  }
  
  async getDocumentTemplatesByType(templateType: string, language = 'en'): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values())
      .filter(template => template.templateType === templateType && template.language === language);
  }
  
  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    return this.documentTemplates.get(id);
  }
  
  async createDocumentTemplate(insertTemplate: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const id = this.currentDocumentTemplateId++;
    const template: DocumentTemplate = { ...insertTemplate, id };
    this.documentTemplates.set(id, template);
    return template;
  }
  
  // Generated document operations
  async getGeneratedDocumentsByUserId(userId: number): Promise<GeneratedDocument[]> {
    return Array.from(this.generatedDocuments.values())
      .filter(document => document.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getGeneratedDocument(id: number): Promise<GeneratedDocument | undefined> {
    return this.generatedDocuments.get(id);
  }
  
  async createGeneratedDocument(insertDocument: InsertGeneratedDocument): Promise<GeneratedDocument> {
    const id = this.currentGeneratedDocumentId++;
    const createdAt = new Date();
    const document: GeneratedDocument = { ...insertDocument, id, createdAt };
    this.generatedDocuments.set(id, document);
    return document;
  }
  
  // Research query operations
  async getResearchQueriesByUserId(userId: number): Promise<ResearchQuery[]> {
    return Array.from(this.researchQueries.values())
      .filter(query => query.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createResearchQuery(insertQuery: InsertResearchQuery): Promise<ResearchQuery> {
    const id = this.currentResearchQueryId++;
    const timestamp = new Date();
    const query: ResearchQuery = { ...insertQuery, id, timestamp };
    this.researchQueries.set(id, query);
    return query;
  }
  
  // Initialize default document templates
  private initializeDefaultDocumentTemplates() {
    // English templates
    this.createDocumentTemplate({
      templateType: 'contract',
      title: 'Service Agreement',
      description: 'A basic service agreement between a service provider and client',
      language: 'en',
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
    
    this.createDocumentTemplate({
      templateType: 'lease',
      title: 'Residential Lease Agreement',
      description: 'A standard residential lease agreement for landlords and tenants',
      language: 'en',
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
    
    this.createDocumentTemplate({
      templateType: 'will',
      title: 'Simple Last Will and Testament',
      description: 'A basic will document for simple estates',
      language: 'en',
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
    
    // French templates
    this.createDocumentTemplate({
      templateType: 'contract',
      title: 'Contrat de Service',
      description: 'Un contrat de service de base entre un prestataire de services et un client',
      language: 'fr',
      templateContent: `CONTRAT DE SERVICE

Ce Contrat de Service (le "Contrat") est conclu et signé le [DATE], par et entre [NOM DU CLIENT], ayant son siège social à [ADRESSE DU CLIENT] (le "Client"), et [NOM DU PRESTATAIRE], ayant son siège social à [ADRESSE DU PRESTATAIRE] (le "Prestataire").

1. SERVICES
Le Prestataire s'engage à fournir au Client les services suivants (les "Services"):
[DESCRIPTION DES SERVICES]

2. DURÉE
Ce Contrat prendra effet le [DATE DE DÉBUT] et restera en vigueur jusqu'au [DATE DE FIN] ou jusqu'à sa résiliation conformément aux dispositions des présentes.

3. RÉMUNÉRATION
En contrepartie des Services, le Client paiera au Prestataire [MONTANT DE PAIEMENT] [par heure/montant fixe] plus les taxes applicables. Le paiement sera effectué comme suit: [CALENDRIER DE PAIEMENT].

4. RÉSILIATION
Chaque partie peut résilier ce Contrat moyennant un préavis écrit de [PÉRIODE DE PRÉAVIS] jours adressé à l'autre partie.

5. LOI APPLICABLE
Ce Contrat sera régi et interprété conformément aux lois de la Province de [PROVINCE], Canada, sans donner effet à aucun choix ou conflit de disposition légale.

EN FOI DE QUOI, les parties ont signé ce Contrat à la date indiquée ci-dessus.

[NOM DU CLIENT]
Par: ________________________
Nom: [PERSONNE AUTORISÉE]
Titre: [TITRE]

[NOM DU PRESTATAIRE]
Par: ________________________
Nom: [PERSONNE AUTORISÉE]
Titre: [TITRE]`,
      fields: [
        { name: 'date', label: 'Date du Contrat', type: 'date', required: true },
        { name: 'clientName', label: 'Nom du Client', type: 'text', required: true },
        { name: 'clientAddress', label: 'Adresse du Client', type: 'text', required: true },
        { name: 'serviceProviderName', label: 'Nom du Prestataire', type: 'text', required: true },
        { name: 'serviceProviderAddress', label: 'Adresse du Prestataire', type: 'text', required: true },
        { name: 'servicesDescription', label: 'Description des Services', type: 'textarea', required: true },
        { name: 'startDate', label: 'Date de Début', type: 'date', required: true },
        { name: 'endDate', label: 'Date de Fin', type: 'date', required: true },
        { name: 'paymentAmount', label: 'Montant du Paiement', type: 'text', required: true },
        { name: 'paymentSchedule', label: 'Calendrier de Paiement', type: 'text', required: true },
        { name: 'noticePeriod', label: 'Période de Préavis (jours)', type: 'number', required: true },
        { name: 'province', label: 'Province Applicable', type: 'text', required: true },
        { name: 'clientAuthorizedPerson', label: 'Personne Autorisée du Client', type: 'text', required: true },
        { name: 'clientTitle', label: 'Titre du Client', type: 'text', required: true },
        { name: 'serviceProviderAuthorizedPerson', label: 'Personne Autorisée du Prestataire', type: 'text', required: true },
        { name: 'serviceProviderTitle', label: 'Titre du Prestataire', type: 'text', required: true }
      ]
    });
  }
}

export const storage = new MemStorage();
