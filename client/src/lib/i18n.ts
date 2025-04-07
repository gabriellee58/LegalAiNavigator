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
    
    // Other
    search: "Search",
    loading: "Loading...",
    try_again: "Try Again",
    learn_more: "Learn More",
    get_started: "Get Started",
    
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
    
    // Other
    search: "Rechercher",
    loading: "Chargement...",
    try_again: "Réessayer",
    learn_more: "En Savoir Plus",
    get_started: "Commencer",
    
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