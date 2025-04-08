export interface Translations {
  [language: string]: {
    [key: string]: string;
  };
}

// Get the current language
export function getLanguage(): string {
  return localStorage.getItem('language') || 'en';
}

// Set the language
export function setLanguage(language: string): void {
  localStorage.setItem('language', language);
  
  // Dispatch a custom event to notify language change
  const event = new Event('languageChanged');
  window.dispatchEvent(event);
}

// Translation function (for direct imports)
export function t(key: string, replacements?: Record<string, string>): string {
  // Get current language
  const currentLanguage = getLanguage();
  
  // Get translations for current language or fall back to English
  const languageTranslations = translations[currentLanguage] || translations.en;
  
  // Get the translated string or use the key as fallback
  let translatedString = languageTranslations[key] || key;
  
  // Replace placeholders if replacements are provided
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translatedString = translatedString.replace(`{{${placeholder}}}`, value);
    });
  }
  
  return translatedString;
}

export const translations: Translations = {
  en: {
    // General
    app_name: "LegalAI Navigator",
    
    // Navigation
    home: "Home",
    services: "Services",
    legal_domains: "Legal Domains",
    legal_domains_description: "Explore legal domains, templates, and resources across Canadian law",
    
    // Services
    legal_assistant: "Legal Assistant",
    document_generator: "Document Generator",
    legal_research: "Legal Research",
    contract_analysis: "Contract Analysis",
    dispute_resolution: "Dispute Resolution",
    compliance_checker: "Compliance Checker",
    help_resources: "Help & Resources",
    settings: "Settings",
    
    // Document Templates
    document_templates: "Document Templates",
    contracts: "Contracts",
    
    // Virtual Legal Assistant
    assistant_title: "Virtual Legal Assistant",
    assistant_subtitle: "Get answers to your Canadian legal questions",
    disclaimer_title: "Important Legal Notice",
    disclaimer_text: "This AI assistant provides general information only and not legal advice. For specific legal issues, please consult with a qualified lawyer.",
    welcome_message: "Hello! I'm your virtual legal assistant. How can I help you with Canadian legal information today?",
    topics_title: "I can help with topics like:",
    topic_rental: "Rental and housing laws",
    topic_business: "Business regulations and compliance",
    topic_employment: "Employment rights and obligations",
    topic_estate: "Wills and estate planning",
    suggested_questions: "You might want to ask about:",
    suggest_rental_laws: "What are my rights as a tenant in Canada?",
    suggest_business_regulations: "How do I register a business in my province?",
    suggest_employment_rights: "What are the basic employment standards?",
    suggest_estate_planning: "What should I include in my will?",
    suggest_followup_1: "Can you explain that in simpler terms?",
    suggest_followup_2: "What are the next steps I should take?",
    suggest_legal_citation: "Are there any relevant legal cases?",
    suggest_related_topic: "How does this relate to tax obligations?",
    message_placeholder: "Type your legal question here...",
    error_loading_chat: "Error Loading Chat",
    error_loading_chat_description: "There was a problem loading your conversation history. Please try again.",
    error_sending_message: "Message Failed to Send",
    error_sending_message_description: "Your message couldn't be processed. Please try again.",
    error_message_text: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
    powered_by: "Powered by LegalAI",
    
    // Other
    search: "Search",
    loading: "Loading...",
    try_again: "Try Again",
    learn_more: "Learn More",
    get_started: "Get Started",
    download_pdf: "Download PDF",
    view_transcript: "View Transcript", 
    key_concepts_covered: "Key Concepts Covered",
    watch_video: "Watch Video",
    video_not_available: "Video is currently processing. Please try again later or use the PDF version.",
    transcript: "Transcript",
    external_legal_resources: "External Legal Resources",
    resources_description: "Access trusted legal resources across Canada",
    still_need_help: "Still need help?",
    contact_support: "Contact Support",
    visit_website: "Visit Website",
    
    // Legal Domains
    family_law: "Family Law",
    estate_planning: "Estate Planning",
    business_law: "Business Law",
    employment_law: "Employment Law",
    real_estate_law: "Real Estate Law",
    immigration_law: "Immigration Law",
    criminal_law: "Criminal Law",
    civil_litigation: "Civil Litigation",
    human_rights: "Human Rights",
    intellectual_property: "Intellectual Property",
    tax_law: "Tax Law",
    indigenous_law: "Indigenous Law",
    environmental_law: "Environmental Law",
    personal_injury: "Personal Injury",
    consumer_rights: "Consumer Rights",
    insurance: "Insurance Law",
    land_claims: "Land Claims",
    administrative: "Administrative Law",
    constitutional: "Constitutional Law",
    youth_justice: "Youth Justice",
    mediation: "Mediation & ADR",
    technology: "Technology Law",
    entertainment: "Entertainment Law",
    
    // Legal Categories
    personal_law: "Personal & Family",
    business_and_commercial: "Business & Commercial",
    property_and_real_estate: "Property & Real Estate",
    government_and_administrative: "Government & Administrative",
    litigation_and_dispute: "Litigation & Dispute Resolution",
    specialized_fields: "Specialized Fields",
  },
  fr: {
    // General
    app_name: "Navigateur JuridiqueIA",
    
    // Navigation
    home: "Accueil",
    services: "Services",
    legal_domains: "Domaines Juridiques",
    legal_domains_description: "Explorez les domaines juridiques, modèles et ressources du droit canadien",
    
    // Services
    legal_assistant: "Assistant Juridique",
    document_generator: "Générateur de Documents",
    legal_research: "Recherche Juridique",
    contract_analysis: "Analyse de Contrat",
    dispute_resolution: "Résolution des Litiges",
    compliance_checker: "Vérificateur de Conformité",
    help_resources: "Aide et Ressources",
    settings: "Paramètres",
    
    // Document Templates
    document_templates: "Modèles de Documents",
    contracts: "Contrats",
    
    // Virtual Legal Assistant
    assistant_title: "Assistant Juridique Virtuel",
    assistant_subtitle: "Obtenez des réponses à vos questions juridiques canadiennes",
    disclaimer_title: "Avis Juridique Important",
    disclaimer_text: "Cet assistant IA fournit des informations générales seulement et non des conseils juridiques. Pour des problèmes juridiques spécifiques, veuillez consulter un avocat qualifié.",
    welcome_message: "Bonjour! Je suis votre assistant juridique virtuel. Comment puis-je vous aider avec des informations juridiques canadiennes aujourd'hui?",
    topics_title: "Je peux vous aider avec des sujets comme:",
    topic_rental: "Lois sur la location et le logement",
    topic_business: "Réglementations et conformité des entreprises",
    topic_employment: "Droits et obligations en matière d'emploi",
    topic_estate: "Testaments et planification successorale",
    suggested_questions: "Vous pourriez vouloir demander:",
    suggest_rental_laws: "Quels sont mes droits en tant que locataire au Canada?",
    suggest_business_regulations: "Comment enregistrer une entreprise dans ma province?",
    suggest_employment_rights: "Quelles sont les normes d'emploi de base?",
    suggest_estate_planning: "Que devrais-je inclure dans mon testament?",
    suggest_followup_1: "Pouvez-vous expliquer cela en termes plus simples?",
    suggest_followup_2: "Quelles sont les prochaines étapes que je devrais prendre?",
    suggest_legal_citation: "Y a-t-il des cas juridiques pertinents?",
    suggest_related_topic: "Comment cela se rapporte-t-il aux obligations fiscales?",
    message_placeholder: "Tapez votre question juridique ici...",
    error_loading_chat: "Erreur de Chargement du Chat",
    error_loading_chat_description: "Un problème est survenu lors du chargement de votre historique de conversation. Veuillez réessayer.",
    error_sending_message: "Échec de l'Envoi du Message",
    error_sending_message_description: "Votre message n'a pas pu être traité. Veuillez réessayer.",
    error_message_text: "Je suis désolé, j'ai du mal à traiter votre demande en ce moment. Veuillez réessayer dans un instant.",
    powered_by: "Propulsé par JuridiqueIA",
    
    // Other
    search: "Rechercher",
    loading: "Chargement...",
    try_again: "Réessayer",
    learn_more: "En Savoir Plus",
    get_started: "Commencer",
    download_pdf: "Télécharger PDF",
    view_transcript: "Voir la Transcription", 
    key_concepts_covered: "Concepts Clés Abordés",
    watch_video: "Regarder la Vidéo",
    video_not_available: "La vidéo est en cours de traitement. Veuillez réessayer plus tard ou utiliser la version PDF.",
    transcript: "Transcription",
    external_legal_resources: "Ressources Juridiques Externes",
    resources_description: "Accédez à des ressources juridiques fiables à travers le Canada",
    still_need_help: "Besoin d'aide supplémentaire ?",
    contact_support: "Contacter le Support",
    visit_website: "Visiter le Site",
    
    // Legal Domains
    family_law: "Droit de la Famille",
    estate_planning: "Planification Successorale",
    business_law: "Droit des Affaires",
    employment_law: "Droit du Travail",
    real_estate_law: "Droit Immobilier",
    immigration_law: "Droit de l'Immigration",
    criminal_law: "Droit Pénal",
    civil_litigation: "Litige Civil",
    human_rights: "Droits de la Personne",
    intellectual_property: "Propriété Intellectuelle",
    tax_law: "Droit Fiscal",
    indigenous_law: "Droit Autochtone",
    environmental_law: "Droit de l'Environnement",
    personal_injury: "Dommages Corporels",
    consumer_rights: "Droits des Consommateurs",
    insurance: "Droit des Assurances",
    land_claims: "Revendications Territoriales",
    administrative: "Droit Administratif",
    constitutional: "Droit Constitutionnel",
    youth_justice: "Justice pour les Jeunes",
    mediation: "Médiation et MARC",
    technology: "Droit des Technologies",
    entertainment: "Droit du Divertissement",
    
    // Legal Categories
    personal_law: "Personnel et Famille",
    business_and_commercial: "Affaires et Commercial",
    property_and_real_estate: "Propriété et Immobilier",
    government_and_administrative: "Gouvernement et Administratif",
    litigation_and_dispute: "Litiges et Résolution des Différends",
    specialized_fields: "Domaines Spécialisés",
  }
};