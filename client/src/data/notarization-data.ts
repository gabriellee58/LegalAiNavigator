export interface NotarizationRequirement {
  documentType: string;
  requiresNotarization: boolean;
  details: string;
  alternativeOptions?: string;
}

export interface ProvincialNotarizationInfo {
  province: string;
  overview: string;
  whoCanNotarize: string[];
  typicalCost: string;
  onlineNotarizationAllowed: boolean;
  onlineNotarizationDetails?: string;
  commonRequirements: string[];
  documentRequirements: NotarizationRequirement[];
  usefulLinks: { title: string; url: string }[];
}

export const notarizationData: ProvincialNotarizationInfo[] = [
  {
    province: "Ontario",
    overview: "In Ontario, documents can be notarized by lawyers, notary publics who are also lawyers, and certain court officials. Ontario has specific requirements for different document types.",
    whoCanNotarize: [
      "Lawyers who are members of the Law Society of Ontario",
      "Notary publics who are also lawyers",
      "Court officials with notarial powers",
      "Certain government officials for specific documents"
    ],
    typicalCost: "$25-$150 per document, depending on complexity",
    onlineNotarizationAllowed: true,
    onlineNotarizationDetails: "Ontario allows remote notarization, but the notary must be licensed in Ontario and proper identity verification protocols must be followed.",
    commonRequirements: [
      "Valid government-issued photo ID",
      "Physical presence (unless remote notarization is used)",
      "The document must be signed in the presence of the notary",
      "You must understand the content of the document"
    ],
    documentRequirements: [
      {
        documentType: "Affidavits",
        requiresNotarization: true,
        details: "Must be sworn or affirmed in front of a commissioner for taking affidavits or a notary public."
      },
      {
        documentType: "Powers of Attorney",
        requiresNotarization: true,
        details: "Should be notarized to ensure validity, especially for property matters."
      },
      {
        documentType: "Real Estate Documents",
        requiresNotarization: true,
        details: "Most real estate transactions require notarized documents."
      },
      {
        documentType: "International Documents",
        requiresNotarization: true,
        details: "May require additional authentication or apostille."
      }
    ],
    usefulLinks: [
      {
        title: "Law Society of Ontario - Notary Information",
        url: "https://lso.ca/public-resources/notaries-and-commissioners"
      },
      {
        title: "Ontario Ministry of the Attorney General",
        url: "https://www.ontario.ca/page/ministry-attorney-general"
      }
    ]
  },
  {
    province: "British Columbia",
    overview: "British Columbia has a unique system where notaries public are specially trained professionals who are not necessarily lawyers. They have specific powers granted by the Notaries Act.",
    whoCanNotarize: [
      "BC Notaries (members of the Society of Notaries Public of BC)",
      "Lawyers who are members of the Law Society of BC",
      "Certain government officials for specific documents"
    ],
    typicalCost: "$40-$200 per document, depending on complexity",
    onlineNotarizationAllowed: true,
    onlineNotarizationDetails: "BC has legislation allowing for remote notarization under specific conditions and proper identity verification.",
    commonRequirements: [
      "Two pieces of valid government-issued ID, at least one with a photo",
      "Physical presence (unless remote notarization is used)",
      "Documents must be signed in the presence of the notary",
      "You must understand what you're signing"
    ],
    documentRequirements: [
      {
        documentType: "Affidavits",
        requiresNotarization: true,
        details: "Must be sworn or affirmed in front of a notary public or lawyer."
      },
      {
        documentType: "Powers of Attorney",
        requiresNotarization: true,
        details: "Should be notarized to ensure validity."
      },
      {
        documentType: "Real Estate Documents",
        requiresNotarization: true,
        details: "BC requires notarization for many real estate documents."
      },
      {
        documentType: "Wills",
        requiresNotarization: false,
        details: "BC wills do not require notarization but must be properly witnessed.",
        alternativeOptions: "Two witnesses who are not beneficiaries must sign"
      }
    ],
    usefulLinks: [
      {
        title: "Society of Notaries Public of BC",
        url: "https://www.snpbc.ca/"
      },
      {
        title: "Law Society of British Columbia",
        url: "https://www.lawsociety.bc.ca/"
      }
    ]
  },
  {
    province: "Quebec",
    overview: "Quebec operates under civil law, and notaries play a more significant role than in other provinces. Quebec notaries are legal professionals with specialized training.",
    whoCanNotarize: [
      "Notaries who are members of the Chambre des notaires du Québec",
      "Certain court officials for specific documents"
    ],
    typicalCost: "$50-$250 per document, depending on complexity",
    onlineNotarizationAllowed: true,
    onlineNotarizationDetails: "Quebec allows remote notarial acts under specific conditions.",
    commonRequirements: [
      "Valid government-issued photo ID",
      "Physical presence (unless remote notarization is used)",
      "Documents must be signed in the presence of the notary"
    ],
    documentRequirements: [
      {
        documentType: "Marriage Contracts",
        requiresNotarization: true,
        details: "Must be notarized to be valid in Quebec."
      },
      {
        documentType: "Wills",
        requiresNotarization: true,
        details: "Notarial wills are common in Quebec and have special legal status."
      },
      {
        documentType: "Real Estate Transactions",
        requiresNotarization: true,
        details: "All real estate transactions in Quebec must be notarized."
      },
      {
        documentType: "Protective Mandates",
        requiresNotarization: true,
        details: "Must be notarized to be valid in Quebec."
      }
    ],
    usefulLinks: [
      {
        title: "Chambre des notaires du Québec",
        url: "https://www.cnq.org/"
      },
      {
        title: "Justice Québec",
        url: "https://www.justice.gouv.qc.ca/"
      }
    ]
  },
  {
    province: "Alberta",
    overview: "In Alberta, notaries public are appointed by the provincial government. Lawyers are automatically notaries public upon admission to the bar.",
    whoCanNotarize: [
      "Lawyers who are members of the Law Society of Alberta",
      "Appointed notaries public",
      "Certain government officials for specific documents"
    ],
    typicalCost: "$20-$100 per document, depending on complexity",
    onlineNotarizationAllowed: true,
    onlineNotarizationDetails: "Alberta allows remote notarization under specific conditions.",
    commonRequirements: [
      "Valid government-issued photo ID",
      "Physical presence (unless remote notarization is used)",
      "The document must be signed in the presence of the notary"
    ],
    documentRequirements: [
      {
        documentType: "Affidavits",
        requiresNotarization: true,
        details: "Must be sworn or affirmed in front of a commissioner for oaths or a notary public."
      },
      {
        documentType: "Land Titles Documents",
        requiresNotarization: true,
        details: "Many land titles documents require notarization."
      },
      {
        documentType: "International Documents",
        requiresNotarization: true,
        details: "May require additional authentication or apostille."
      },
      {
        documentType: "Personal Directives",
        requiresNotarization: false,
        details: "Does not require notarization but must be properly witnessed.",
        alternativeOptions: "Two witnesses who are not related to you or your agent"
      }
    ],
    usefulLinks: [
      {
        title: "Law Society of Alberta",
        url: "https://www.lawsociety.ab.ca/"
      },
      {
        title: "Alberta Justice and Solicitor General",
        url: "https://www.alberta.ca/justice-and-solicitor-general.aspx"
      }
    ]
  },
  {
    province: "Nova Scotia",
    overview: "In Nova Scotia, lawyers are automatically notaries public. The province also appoints non-lawyer notaries for specific purposes.",
    whoCanNotarize: [
      "Lawyers who are members of the Nova Scotia Barristers' Society",
      "Appointed non-lawyer notaries for specific purposes",
      "Certain government officials for specific documents"
    ],
    typicalCost: "$25-$100 per document, depending on complexity",
    onlineNotarizationAllowed: true,
    onlineNotarizationDetails: "Nova Scotia allows remote notarization under specific conditions.",
    commonRequirements: [
      "Valid government-issued photo ID",
      "Physical presence (unless remote notarization is used)",
      "Documents must be signed in the presence of the notary"
    ],
    documentRequirements: [
      {
        documentType: "Affidavits",
        requiresNotarization: true,
        details: "Must be sworn or affirmed in front of a commissioner for oaths or a notary public."
      },
      {
        documentType: "Real Estate Documents",
        requiresNotarization: true,
        details: "Many real estate documents require notarization."
      },
      {
        documentType: "Powers of Attorney",
        requiresNotarization: true,
        details: "Should be notarized to ensure validity."
      },
      {
        documentType: "Wills",
        requiresNotarization: false,
        details: "Do not require notarization but must be properly witnessed.",
        alternativeOptions: "Two witnesses present at the same time"
      }
    ],
    usefulLinks: [
      {
        title: "Nova Scotia Barristers' Society",
        url: "https://nsbs.org/"
      },
      {
        title: "Nova Scotia Department of Justice",
        url: "https://novascotia.ca/just/"
      }
    ]
  }
];

// Add more provinces as needed...

export const documentTypes = [
  "Affidavits",
  "Powers of Attorney",
  "Real Estate Documents",
  "Wills",
  "International Documents",
  "Marriage Contracts",
  "Land Titles Documents",
  "Protective Mandates",
  "Personal Directives",
  "Court Documents",
  "Immigration Documents",
  "Business Documents"
];

export const getNotarizationRequirement = (province: string, documentType: string): NotarizationRequirement | undefined => {
  const provinceData = notarizationData.find(p => p.province === province);
  if (!provinceData) return undefined;
  
  return provinceData.documentRequirements.find(d => d.documentType === documentType);
};

export const getProvinceInfo = (province: string): ProvincialNotarizationInfo | undefined => {
  return notarizationData.find(p => p.province === province);
};