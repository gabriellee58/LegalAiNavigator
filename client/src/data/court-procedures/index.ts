import { CourtProcedureData } from './types';
import civilProcedureData from './civil-procedure';

// Create the criminal procedure data
export const criminalProcedureData: CourtProcedureData = {
  id: 'criminal-procedure',
  slug: 'criminal-procedure',
  title: 'Criminal Court Procedure',
  description: 'A guide to understanding criminal procedure in Canadian courts.',
  category: 'Criminal',
  overview: {
    summary: 'Criminal procedure in Canada governs how crimes are investigated, charged, prosecuted, and adjudicated. This system balances the need to enforce criminal laws with protecting the constitutional rights of accused persons.',
    applicability: [
      'Criminal charges under the Criminal Code of Canada',
      'Provincial and territorial offences',
      'Youth criminal justice proceedings',
      'Appeals of criminal convictions or sentences'
    ],
    jurisdiction: 'Provincial/territorial courts and superior courts across Canada',
    timeframe: 'From several months to 2+ years depending on complexity',
    costRange: 'Legal aid may be available for those who qualify; private defence counsel typically CAD $5,000-$50,000+',
    resources: [
      {
        name: 'Criminal Code of Canada',
        url: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/'
      },
      {
        name: 'Canadian Charter of Rights and Freedoms',
        url: 'https://laws-lois.justice.gc.ca/eng/const/page-12.html'
      }
    ]
  },
  steps: [
    {
      id: 'investigation',
      title: 'Investigation',
      description: 'Police gather evidence about a potential crime',
      details: 'The criminal process typically begins with a police investigation. This can be triggered by a complaint, observation of criminal activity, or as part of ongoing investigative work.',
      timeline: {
        minDays: 1,
        maxDays: 365,
        description: 'Can range from immediate to years for complex cases'
      },
      tips: [
        'You have the right to remain silent when questioned by police',
        'You have the right to speak to a lawyer if detained or arrested'
      ]
    }
  ],
  requiredDocuments: [
    {
      name: 'Information/Indictment',
      description: 'The formal charging document outlining the offences alleged against the accused.',
      source: 'Crown prosecutor\'s office'
    }
  ],
  faqs: [
    {
      question: 'What is the difference between summary and indictable offences?',
      answer: 'Summary offences are less serious crimes with simpler procedures, while indictable offences are more serious, often have higher maximum penalties, and may be tried in either provincial or superior court, sometimes with a jury.'
    }
  ]
};

// Create the family court data
export const familyCourtData: CourtProcedureData = {
  id: 'family-court',
  slug: 'family-court',
  title: 'Family Court Procedure',
  description: 'A guide to understanding family court procedures in Canada.',
  category: 'Family',
  overview: {
    summary: 'Family court procedures in Canada govern legal matters related to families, including divorce, child custody, support, and property division.',
    applicability: ['Divorce proceedings', 'Child custody disputes'],
    jurisdiction: 'Provincial family courts and superior courts across Canada',
    timeframe: 'From several months to 1+ years depending on complexity',
    costRange: 'CAD $5,000-$30,000+ depending on complexity and whether contested',
    resources: []
  },
  steps: [],
  requiredDocuments: [],
  faqs: []
};

// Create the small claims data
export const smallClaimsData: CourtProcedureData = {
  id: 'small-claims',
  slug: 'small-claims',
  title: 'Small Claims Court Procedure',
  description: 'A guide to navigating small claims court in Canada.',
  category: 'Small Claims',
  overview: {
    summary: 'Small claims court provides a simplified, less expensive process for resolving civil disputes involving relatively modest amounts of money.',
    applicability: ['Monetary claims under provincial limits (typically $5,000-$50,000)'],
    jurisdiction: 'Provincial small claims courts across Canada',
    timeframe: 'Typically 3-12 months from filing to resolution',
    costRange: 'CAD $100-$5,000 depending on complexity',
    resources: []
  },
  steps: [],
  requiredDocuments: [],
  faqs: []
};

// Create the administrative tribunal data
export const administrativeData: CourtProcedureData = {
  id: 'administrative',
  slug: 'administrative',
  title: 'Administrative Tribunal Procedure',
  description: 'A guide to navigating administrative tribunals in Canada.',
  category: 'Administrative',
  overview: {
    summary: 'Administrative tribunals in Canada are specialized bodies that resolve disputes related to specific areas of law outside the traditional court system.',
    applicability: ['Human rights complaints', 'Employment and labor disputes'],
    jurisdiction: 'Various federal and provincial administrative tribunals',
    timeframe: 'Typically 3-18 months from filing to decision',
    costRange: 'CAD $0-$10,000+ depending on complexity and tribunal',
    resources: []
  },
  steps: [],
  requiredDocuments: [],
  faqs: []
};

// Export the civil procedure
export { civilProcedureData };

// Map of procedure IDs to their data
export const procedureDataMap: Record<string, CourtProcedureData> = {
  'civil-procedure': civilProcedureData,
  'criminal-procedure': criminalProcedureData,
  'family-court': familyCourtData,
  'small-claims': smallClaimsData,
  'administrative': administrativeData,
};

// Get all procedure data as an array
export const getAllProcedures = (): CourtProcedureData[] => {
  return Object.values(procedureDataMap);
};

// Get procedure data by ID
export const getProcedureById = (id: string): CourtProcedureData | undefined => {
  return procedureDataMap[id];
};

// Get procedures by category
export const getProceduresByCategory = (category: string): CourtProcedureData[] => {
  return getAllProcedures().filter(procedure => 
    procedure.category.toLowerCase() === category.toLowerCase()
  );
};