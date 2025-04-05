/**
 * Simple internationalization utility for the application
 * Supports English and French languages
 */

// Available languages
export type Language = 'en' | 'fr';

// Store current language
let currentLanguage: Language = 'en';

// Get language from localStorage if available
const initLanguage = () => {
  const storedLang = localStorage.getItem('language');
  if (storedLang === 'en' || storedLang === 'fr') {
    currentLanguage = storedLang;
  }
};

// Call initialization
initLanguage();

// Language translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "legal_assistant": "Legal Assistant",
    "document_generator": "Document Generator",
    "legal_research": "Legal Research",
    "dispute_resolution": "Dispute Resolution",
    "compliance_checker": "Compliance Checker",
    "document_templates": "Document Templates",
    "contracts": "Contracts",
    "leases": "Leases",
    "wills_estates": "Wills & Estates",
    "business_formation": "Business Formation",
    "ip_management": "IP Management",
    "help_resources": "Help & Resources",
    "settings": "Settings",
    "services": "Services",
    
    // Legal Assistant
    "assistant_title": "Virtual Legal Assistant",
    "assistant_subtitle": "Get AI-powered legal guidance compliant with Canadian law",
    "disclaimer_title": "Important Disclaimer",
    "disclaimer_text": "This AI assistant provides information about Canadian law but is not a substitute for professional legal advice. The information provided is for general guidance only.",
    "welcome_message": "Hello! I'm your AI legal assistant, designed to help with Canadian legal matters. What can I help you with today?",
    "topics_title": "Some topics I can assist with:",
    "topic_rental": "Understanding rental agreements and tenant rights",
    "topic_business": "Small business legal requirements",
    "topic_employment": "Employment law questions",
    "topic_estate": "Basic estate planning information",
    "message_placeholder": "Type your legal question here...",
    "powered_by": "Powered by OpenAI",
    "canadian_law": "All information based on Canadian law",
    
    // Document Generator
    "document_gen_title": "Document Generator",
    "document_gen_subtitle": "Create customized legal documents compliant with Canadian law",
    "select_template": "Select a document template",
    "fill_details": "Fill in document details",
    "preview_document": "Preview document",
    "download_document": "Download document",
    "template_categories": "Template Categories",
    "document_preview": "Document Preview",
    "form_required": "Required field",
    "generate_document": "Generate Document",
    
    // Legal Research
    "research_title": "Legal Research",
    "research_subtitle": "Search and analyze Canadian legal information",
    "search_placeholder": "Search legal questions, documents, or resources...",
    "recent_searches": "Recent Searches",
    "relevant_laws": "Relevant Laws",
    "relevant_cases": "Relevant Cases",
    "search_results": "Search Results",
    "no_results": "No results found",
    "search_button": "Search",
    
    // Contract Analysis
    "contract_analysis": "Contract Analysis",
    "contract_risks": "Identified Risks",
    "contract_suggestions": "Improvement Suggestions",
    "contract_summary": "Summary",
    "paste_contract": "Paste your contract text here",
    "analyze_contract": "Analyze Contract",
    "risk_severity_high": "High Risk",
    "risk_severity_medium": "Medium Risk",
    "risk_severity_low": "Low Risk"
  },
  fr: {
    // Navigation
    "legal_assistant": "Assistant Juridique",
    "document_generator": "Générateur de Documents",
    "legal_research": "Recherche Juridique",
    "dispute_resolution": "Résolution de Conflits",
    "compliance_checker": "Vérificateur de Conformité",
    "document_templates": "Modèles de Documents",
    "contracts": "Contrats",
    "leases": "Baux",
    "wills_estates": "Testaments & Successions",
    "business_formation": "Formation d'Entreprise",
    "ip_management": "Gestion de PI",
    "help_resources": "Aide & Ressources",
    "settings": "Paramètres",
    "services": "Services",
    
    // Legal Assistant
    "assistant_title": "Assistant Juridique Virtuel",
    "assistant_subtitle": "Obtenez des conseils juridiques alimentés par l'IA conformes au droit canadien",
    "disclaimer_title": "Avertissement Important",
    "disclaimer_text": "Cet assistant IA fournit des informations sur le droit canadien mais ne remplace pas les conseils juridiques professionnels. Les informations fournies sont uniquement à titre indicatif général.",
    "welcome_message": "Bonjour! Je suis votre assistant juridique IA, conçu pour vous aider avec les questions juridiques canadiennes. Comment puis-je vous aider aujourd'hui?",
    "topics_title": "Quelques sujets sur lesquels je peux vous aider :",
    "topic_rental": "Comprendre les contrats de location et les droits des locataires",
    "topic_business": "Exigences légales pour les petites entreprises",
    "topic_employment": "Questions de droit du travail",
    "topic_estate": "Informations de base sur la planification successorale",
    "message_placeholder": "Tapez votre question juridique ici...",
    "powered_by": "Propulsé par OpenAI",
    "canadian_law": "Toutes les informations sont basées sur le droit canadien",
    
    // Document Generator
    "document_gen_title": "Générateur de Documents",
    "document_gen_subtitle": "Créez des documents juridiques personnalisés conformes au droit canadien",
    "select_template": "Sélectionnez un modèle de document",
    "fill_details": "Remplissez les détails du document",
    "preview_document": "Aperçu du document",
    "download_document": "Télécharger le document",
    "template_categories": "Catégories de Modèles",
    "document_preview": "Aperçu du Document",
    "form_required": "Champ obligatoire",
    "generate_document": "Générer le Document",
    
    // Legal Research
    "research_title": "Recherche Juridique",
    "research_subtitle": "Recherchez et analysez des informations juridiques canadiennes",
    "search_placeholder": "Rechercher des questions juridiques, des documents ou des ressources...",
    "recent_searches": "Recherches Récentes",
    "relevant_laws": "Lois Pertinentes",
    "relevant_cases": "Cas Pertinents",
    "search_results": "Résultats de Recherche",
    "no_results": "Aucun résultat trouvé",
    "search_button": "Rechercher",
    
    // Contract Analysis
    "contract_analysis": "Analyse de Contrat",
    "contract_risks": "Risques Identifiés",
    "contract_suggestions": "Suggestions d'Amélioration",
    "contract_summary": "Résumé",
    "paste_contract": "Collez votre texte de contrat ici",
    "analyze_contract": "Analyser le Contrat",
    "risk_severity_high": "Risque Élevé",
    "risk_severity_medium": "Risque Moyen",
    "risk_severity_low": "Risque Faible"
  }
};

// Get translation function
export const t = (key: string): string => {
  return translations[currentLanguage][key] || key;
};

// Set language function
export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  // Force UI update by dispatching a custom event
  window.dispatchEvent(new Event('languageChanged'));
};

// Get current language
export const getLanguage = (): Language => currentLanguage;

// Check if a string is right-to-left
export const isRTL = (): boolean => {
  // Neither English nor French are RTL languages
  return false;
};
