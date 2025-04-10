/**
 * Mock Research Data for Testing Legal Research Functionality
 * 
 * This file contains mock research data for various legal topics to be used
 * when the AI services are unavailable or for testing purposes.
 */

import { ResearchResult } from './researchService';

type MockDataByType = {
  [key: string]: ResearchResult;
};

// Mock data for family law queries
const familyLawMockData: MockDataByType = {
  'child support': {
    summary: "Child support in Canada is determined by federal and provincial guidelines that consider income, number of children, and custody arrangements. The Federal Child Support Guidelines establish baseline amounts, while provincial regulations may add specific requirements. Courts can deviate from guidelines in special circumstances, and enforcement mechanisms exist at both federal and provincial levels.",
    relevantLaws: [
      {
        title: "Divorce Act",
        description: "The Divorce Act is the federal law that governs divorce proceedings in Canada, including matters related to child support. It outlines the obligations of parents to financially support their children post-divorce, the factors considered in determining support amounts, and the enforcement of support orders.",
        source: "Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), Section 15.1",
        url: "https://laws-lois.justice.gc.ca/eng/acts/d-3.4/",
        relevanceScore: 0.95
      },
      {
        title: "Federal Child Support Guidelines",
        description: "These guidelines establish a framework for determining child support amounts based on the payor's income, number of children, and other factors. They provide tables that set base support amounts and address special circumstances such as shared custody and extraordinary expenses.",
        source: "SOR/97-175",
        url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-97-175/",
        relevanceScore: 0.98
      },
      {
        title: "Family Law Act (Ontario)",
        description: "Provincial legislation that addresses family law matters including child support. It works in conjunction with federal laws to govern child support obligations in Ontario.",
        source: "R.S.O. 1990, c. F.3",
        url: "https://www.ontario.ca/laws/statute/90f03",
        relevanceScore: 0.85
      },
      {
        title: "Family Maintenance Act (Manitoba)",
        description: "Provincial legislation that addresses child support obligations in Manitoba, including determination of amounts and enforcement mechanisms.",
        source: "C.C.S.M. c. F20",
        url: "https://web2.gov.mb.ca/laws/statutes/ccsm/f020e.php",
        relevanceScore: 0.78
      },
      {
        title: "Family Responsibility and Support Arrears Enforcement Act",
        description: "Ontario legislation that provides for the enforcement of support obligations and establishes the Family Responsibility Office to collect and distribute support payments.",
        source: "S.O. 1996, c. 31",
        url: "https://www.ontario.ca/laws/statute/96f31",
        relevanceScore: 0.82
      }
    ],
    relevantCases: [
      {
        name: "Contino v. Leonelli-Contino",
        citation: "2005 SCC 63",
        relevance: "Landmark Supreme Court case that addresses how to calculate child support in shared custody situations. The court established principles for determining support when both parents have the child for at least 40% of the time.",
        year: "2005",
        jurisdiction: "Supreme Court of Canada",
        judgment: "The court ruled that a strict mathematical formula shouldn't be the only consideration in shared custody situations. Judges must consider the increased costs of shared custody arrangements, the conditions, means, needs and other circumstances of each parent and child, and the standard of living the child enjoyed before the separation.",
        keyPoints: [
          "In shared custody arrangements, courts should consider the section 9 factors as a whole rather than focusing solely on a mathematical offset of table amounts",
          "Both the straight set-off approach and the formulaic approach have limitations and should not be applied mechanically",
          "Courts should consider the actual increased costs of shared custody and the standard of living the child experienced before separation"
        ]
      },
      {
        name: "D.B.S. v. S.R.G.",
        citation: "2006 SCC 37",
        relevance: "Key Supreme Court case dealing with retroactive child support. The court addressed when retroactive child support can be ordered and how far back such orders can extend.",
        year: "2006",
        jurisdiction: "Supreme Court of Canada",
        judgment: "The court established guidelines for awarding retroactive child support, including factors such as the reason for delay in seeking support, the conduct of the payor parent, and the circumstances of the child.",
        keyPoints: [
          "Retroactive child support can be ordered when there is a failure to disclose increases in income",
          "Courts should consider the reason for delay, conduct of the payor parent, circumstances of the child, and hardship in determining retroactive awards",
          "Generally, retroactive awards should not go back further than three years from the date of formal notice"
        ]
      },
      {
        name: "Michel v. Graydon",
        citation: "2020 SCC 24",
        relevance: "Recent Supreme Court case that addresses retroactive child support for periods after a child has become an adult. The court clarified when such support can be awarded.",
        year: "2020",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Colucci v. Colucci",
        citation: "2021 SCC 24",
        relevance: "Supreme Court case addressing the legal framework for varying child support and dealing with support arrears. The court clarified the obligations of payors to disclose income changes and the consequences of failing to do so.",
        year: "2021",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Francis v. Baker",
        citation: "1999 CanLII 659 (SCC)",
        relevance: "Supreme Court case addressing child support for high-income earners. The court established principles for determining support when the payor's income exceeds the maximum amount in the Federal Child Support Guidelines tables.",
        year: "1999",
        jurisdiction: "Supreme Court of Canada"
      }
    ],
    legalConcepts: [
      {
        concept: "Guideline Income",
        definition: "The income amount used to determine child support obligations under the Federal Child Support Guidelines, generally based on line 150 of the payor's income tax return but may be adjusted in certain circumstances.",
        relevance: "Guideline income is the foundation for calculating child support amounts. Courts may impute additional income if they believe the reported income does not accurately reflect the payor's capacity to pay."
      },
      {
        concept: "Section 7 Expenses",
        definition: "Special or extraordinary expenses that are shared between parents in addition to the base child support amount, including childcare, medical expenses, education costs, and extracurricular activities.",
        relevance: "Section 7 expenses are typically shared proportionately based on the parents' incomes, in addition to the base child support amount."
      },
      {
        concept: "Shared Custody",
        definition: "A parenting arrangement where the child spends at least 40% of their time with each parent, which may affect the calculation of child support.",
        relevance: "In shared custody situations, child support may be calculated differently, often by offsetting the amounts each parent would pay the other, with adjustments for the increased overall costs of maintaining two households."
      },
      {
        concept: "Variation of Child Support",
        definition: "The legal process of changing an existing child support order due to a change in circumstances, such as a significant increase or decrease in the payor's income.",
        relevance: "Parents can apply to vary child support when there has been a material change in circumstances that would result in a different support amount under the guidelines."
      },
      {
        concept: "Disclosure Obligations",
        definition: "The legal requirement for parents to provide complete and accurate financial information for determining child support.",
        relevance: "Failure to disclose income changes can result in retroactive support orders and potential penalties."
      }
    ]
  },
  'divorce': {
    summary: "Divorce in Canada is governed primarily by the federal Divorce Act, which establishes a no-fault system requiring a one-year separation period in most cases. Provincial family laws handle related matters such as property division. The process typically involves filing an application, serving documents, and either negotiating a settlement or proceeding to trial if disputes remain unresolved.",
    relevantLaws: [
      {
        title: "Divorce Act",
        description: "The federal law that governs divorce in Canada, establishing grounds for divorce, procedures for obtaining a divorce, and provisions for child custody, access, and support.",
        source: "R.S.C. 1985, c. 3 (2nd Supp.)",
        url: "https://laws-lois.justice.gc.ca/eng/acts/d-3.4/",
        relevanceScore: 0.98
      },
      {
        title: "Family Law Act (Ontario)",
        description: "Provincial legislation that addresses division of property, spousal support, and other family law matters related to divorce in Ontario.",
        source: "R.S.O. 1990, c. F.3",
        url: "https://www.ontario.ca/laws/statute/90f03",
        relevanceScore: 0.85
      },
      {
        title: "Federal Child Support Guidelines",
        description: "Regulations that establish a framework for determining child support amounts in divorce cases, based on income, number of children, and other factors.",
        source: "SOR/97-175",
        url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-97-175/",
        relevanceScore: 0.75
      },
      {
        title: "Spousal Support Advisory Guidelines",
        description: "Non-binding guidelines that provide a range of spousal support amounts and duration based on the length of marriage and income disparity between spouses.",
        source: "Department of Justice Canada, 2008 (revised 2013)",
        url: "https://www.justice.gc.ca/eng/fl-df/spousal-epoux/ssag-ldfpae.html",
        relevanceScore: 0.70
      },
      {
        title: "Divorce Regulations",
        description: "Federal regulations that set out procedural requirements for divorce proceedings, including forms and documentation.",
        source: "SOR/86-600",
        url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-86-600/",
        relevanceScore: 0.65
      }
    ],
    relevantCases: [
      {
        name: "Bracklow v. Bracklow",
        citation: "1999 CanLII 715 (SCC)",
        relevance: "Supreme Court case establishing principles for spousal support in divorce cases, particularly the compensatory and non-compensatory bases for support.",
        year: "1999",
        jurisdiction: "Supreme Court of Canada",
        keyPoints: [
          "Three bases for spousal support: contractual, compensatory, and non-compensatory",
          "Economic interdependence during marriage can create support obligations even without economic disadvantage",
          "Duration and amount of support depend on the specific circumstances of each case"
        ]
      },
      {
        name: "Miglin v. Miglin",
        citation: "2003 SCC 24",
        relevance: "Key case on the enforceability of separation agreements in divorce proceedings, establishing a two-stage test for reviewing such agreements.",
        year: "2003",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Gordon v. Goertz",
        citation: "1996 CanLII 191 (SCC)",
        relevance: "Landmark case on mobility rights in custody disputes following divorce, establishing factors to consider when a parent wishes to relocate with a child.",
        year: "1996",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Moge v. Moge",
        citation: "1992 CanLII 25 (SCC)",
        relevance: "Significant case on spousal support, emphasizing the compensatory basis for support when one spouse has suffered economic disadvantage from the marriage.",
        year: "1992",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Hartshorne v. Hartshorne",
        citation: "2004 SCC 22",
        relevance: "Important case on the validity of marriage contracts and prenuptial agreements in the context of divorce proceedings.",
        year: "2004",
        jurisdiction: "Supreme Court of Canada"
      }
    ],
    legalConcepts: [
      {
        concept: "No-Fault Divorce",
        definition: "A divorce system that doesn't require proof of wrongdoing by either spouse. In Canada, the main ground for divorce is a one-year separation.",
        relevance: "The Canadian divorce system is primarily no-fault, focusing on the breakdown of the marriage rather than assigning blame."
      },
      {
        concept: "Breakdown of Marriage",
        definition: "The legal basis for divorce in Canada, established by showing a one-year separation, adultery, or physical/mental cruelty.",
        relevance: "Most Canadian divorces proceed on the ground of a one-year separation, though adultery and cruelty remain available as grounds."
      },
      {
        concept: "Equalization of Net Family Property",
        definition: "The process in provinces like Ontario where the value of property acquired during the marriage is divided equally between spouses upon divorce.",
        relevance: "This concept ensures that both spouses share equally in the wealth accumulated during the marriage, regardless of whose name assets are in."
      },
      {
        concept: "Matrimonial Home",
        definition: "The family's primary residence, which receives special treatment under provincial family laws in divorce proceedings.",
        relevance: "Both spouses typically have equal right to possession of the matrimonial home regardless of ownership, and special rules often apply to its division."
      },
      {
        concept: "Corollary Relief",
        definition: "Additional orders made in divorce proceedings relating to matters such as custody, access, child support, and spousal support.",
        relevance: "These orders address the ongoing legal relationships between former spouses, particularly regarding children and financial support."
      }
    ]
  }
};

// Mock data for criminal law queries
const criminalLawMockData: MockDataByType = {
  'dui': {
    summary: "Driving under the influence (DUI) in Canada, legally termed 'impaired driving,' is a serious criminal offense under the Criminal Code. Recent legal changes have strengthened enforcement and penalties, including mandatory minimum fines, driving prohibitions, and potential imprisonment for repeat offenders. Police can demand breath samples without suspicion of alcohol consumption, and refusing testing carries penalties similar to impaired driving convictions.",
    relevantLaws: [
      {
        title: "Criminal Code of Canada, Section 320.14",
        description: "This section defines the offenses of operation while impaired and operation with prohibited blood alcohol or blood drug concentration. It criminalizes driving while one's ability is impaired by alcohol or drugs, as well as driving with blood alcohol concentration equal to or exceeding 80 mg of alcohol in 100 mL of blood.",
        source: "Criminal Code, R.S.C. 1985, c. C-46, s. 320.14",
        url: "https://laws-lois.justice.gc.ca/eng/acts/c-46/section-320.14.html",
        relevanceScore: 0.98
      },
      {
        title: "Criminal Code of Canada, Section 320.15",
        description: "This section criminalizes the refusal to comply with a demand made by a peace officer to provide a breath sample or to submit to evaluation or testing for impairment. Refusing to provide a sample carries penalties similar to those for impaired driving.",
        source: "Criminal Code, R.S.C. 1985, c. C-46, s. 320.15",
        url: "https://laws-lois.justice.gc.ca/eng/acts/c-46/section-320.15.html",
        relevanceScore: 0.92
      },
      {
        title: "Criminal Code of Canada, Section 320.19",
        description: "This section establishes the penalties for impaired driving offenses, including mandatory minimum fines, driving prohibitions, and imprisonment for repeat offenders. It sets out escalating punishments based on blood alcohol concentration and previous convictions.",
        source: "Criminal Code, R.S.C. 1985, c. C-46, s. 320.19",
        url: "https://laws-lois.justice.gc.ca/eng/acts/c-46/section-320.19.html",
        relevanceScore: 0.90
      },
      {
        title: "Criminal Code of Canada, Section 320.27",
        description: "This section authorizes peace officers to demand breath samples from drivers, including the controversial 'mandatory alcohol screening' provision that allows officers to demand breath samples without suspicion of alcohol consumption.",
        source: "Criminal Code, R.S.C. 1985, c. C-46, s. 320.27",
        url: "https://laws-lois.justice.gc.ca/eng/acts/c-46/section-320.27.html",
        relevanceScore: 0.85
      },
      {
        title: "Provincial Highway Traffic Acts",
        description: "In addition to federal criminal laws, each province has its own highway traffic act that may impose additional administrative penalties for impaired driving, such as immediate license suspensions, vehicle impoundment, and mandatory education programs.",
        source: "Various provincial statutes",
        relevanceScore: 0.75
      }
    ],
    relevantCases: [
      {
        name: "R. v. Bernshaw",
        citation: "[1995] 1 SCR 254",
        relevance: "This Supreme Court case addressed the reliability of breathalyzer tests and established that police must observe suspects for 15-20 minutes before administering a breath test to ensure accurate results.",
        year: "1995",
        jurisdiction: "Supreme Court of Canada",
        keyPoints: [
          "Officers must observe suspects for 15-20 minutes before breath testing to ensure mouth alcohol doesn't affect results",
          "Improper observation period may affect admissibility of breathalyzer evidence",
          "Scientific reliability of breath testing procedures is crucial to their evidential value"
        ]
      },
      {
        name: "R. v. St-Onge Lamoureux",
        citation: "2012 SCC 57",
        relevance: "This case challenged the constitutionality of provisions that limit challenges to breathalyzer evidence. The Supreme Court struck down some aspects but upheld the core presumption that breathalyzer results are reliable evidence of blood alcohol content.",
        year: "2012",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "R. v. Goodwin",
        citation: "2015 SCC 46",
        relevance: "This case upheld the constitutionality of provincial administrative penalty schemes for impaired driving that operate alongside the criminal system, such as immediate roadside prohibitions.",
        year: "2015",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "R. v. Gubbins",
        citation: "2018 SCC 44",
        relevance: "This case addressed disclosure obligations regarding maintenance records for breathalyzer devices, finding that such records are generally not relevant to defense challenges.",
        year: "2018",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "R. v. Sharma",
        citation: "2022 ONCA 105",
        relevance: "This Ontario Court of Appeal case challenged the constitutionality of mandatory alcohol screening provisions introduced in 2018, which allow police to demand breath samples without reasonable suspicion.",
        year: "2022",
        jurisdiction: "Ontario Court of Appeal"
      }
    ],
    legalConcepts: [
      {
        concept: "Care or Control",
        definition: "A legal concept that extends impaired driving offenses beyond actual driving to situations where a person has care or control of a vehicle, even if not driving (such as sitting in a parked car with keys).",
        relevance: "This concept expands the scope of impaired driving laws to prevent situations where intoxicated individuals might attempt to operate vehicles."
      },
      {
        concept: "Mandatory Minimum Penalties",
        definition: "Legislatively prescribed minimum punishments that judges must impose upon conviction, regardless of mitigating circumstances.",
        relevance: "Impaired driving offenses carry mandatory minimum penalties that increase with repeated offenses: $1,000 fine for first offense, 30 days imprisonment for second offense, and 120 days for third and subsequent offenses."
      },
      {
        concept: "Approved Screening Device (ASD)",
        definition: "A portable breath testing instrument used by police at roadside to obtain a preliminary indication of a driver's blood alcohol concentration.",
        relevance: "ASDs are used in mandatory alcohol screening and can provide grounds for more accurate evidentiary breath testing at a police station."
      },
      {
        concept: "Reasonable Suspicion",
        definition: "The legal standard previously required for police to demand a roadside breath sample, based on indications of alcohol consumption.",
        relevance: "The 2018 amendments to the Criminal Code eliminated the requirement for reasonable suspicion before demanding a breath sample, allowing for mandatory alcohol screening without cause."
      },
      {
        concept: "Approved Instrument",
        definition: "Formally approved breath testing equipment used to obtain evidentiary breath samples at police stations that can be used as evidence in court.",
        relevance: "Results from these instruments benefit from evidentiary presumptions that make them difficult to challenge without showing equipment malfunction or improper operation."
      }
    ]
  }
};

// Mock data for employment law queries
const employmentLawMockData: MockDataByType = {
  'wrongful dismissal': {
    summary: "Wrongful dismissal in Canada occurs when an employee is terminated without reasonable notice or adequate compensation in lieu of notice. Unlike 'unjust dismissal' (which concerns the reasons for termination), wrongful dismissal focuses on insufficient notice or severance. Non-unionized employees in the private sector typically have recourse through civil courts, while those in federally regulated industries can file complaints under the Canada Labour Code. Common law notice periods are based on factors including length of service, age, position, and availability of similar employment.",
    relevantLaws: [
      {
        title: "Employment Standards Act (Ontario)",
        description: "Provincial legislation that establishes minimum standards for employment relationships in Ontario, including minimum notice periods and severance pay requirements for termination without cause.",
        source: "S.O. 2000, c. 41",
        url: "https://www.ontario.ca/laws/statute/00e41",
        relevanceScore: 0.95
      },
      {
        title: "Canada Labour Code",
        description: "Federal legislation governing employment relationships in federally regulated industries, providing protections against unjust dismissal for employees with at least 12 months of continuous employment.",
        source: "R.S.C., 1985, c. L-2",
        url: "https://laws-lois.justice.gc.ca/eng/acts/L-2/",
        relevanceScore: 0.90
      },
      {
        title: "British Columbia Employment Standards Act",
        description: "Provincial legislation in British Columbia establishing minimum standards for employment relationships, including notice requirements for termination.",
        source: "RSBC 1996, c 113",
        url: "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/00_96113_01",
        relevanceScore: 0.75
      },
      {
        title: "Alberta Employment Standards Code",
        description: "Provincial legislation in Alberta establishing minimum employment standards, including termination notice requirements based on length of service.",
        source: "RSA 2000, c E-9",
        url: "https://www.qp.alberta.ca/documents/Acts/E09.pdf",
        relevanceScore: 0.75
      },
      {
        title: "Quebec Civil Code",
        description: "Provincial legislation in Quebec that governs employment contracts and provides for reasonable notice of termination based on civil law principles.",
        source: "CQLR c CCQ-1991, Articles 2091-2095",
        url: "http://legisquebec.gouv.qc.ca/en/showdoc/cs/ccq-1991",
        relevanceScore: 0.70
      }
    ],
    relevantCases: [
      {
        name: "Bardal v. Globe & Mail Ltd.",
        citation: "(1960), 24 DLR (2d) 140 (ON HCJ)",
        relevance: "Landmark case establishing the 'Bardal factors' used to determine reasonable notice periods in wrongful dismissal cases, including character of employment, length of service, age, and availability of similar employment.",
        year: "1960",
        jurisdiction: "Ontario High Court of Justice",
        keyPoints: [
          "There is no fixed formula for determining reasonable notice periods",
          "Courts must consider the character of employment, length of service, age of employee, and availability of similar employment",
          "These factors (now known as the Bardal factors) must be applied based on the specific circumstances of each case"
        ]
      },
      {
        name: "Honda Canada Inc. v. Keays",
        citation: "2008 SCC 39",
        relevance: "Supreme Court case addressing bad faith in dismissal and damages for mental distress, establishing that employers have a duty of good faith and fair dealing in the manner of dismissal.",
        year: "2008",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Matthews v. Ocean Nutrition Canada Ltd.",
        citation: "2020 SCC 26",
        relevance: "Recent Supreme Court case confirming that employees are entitled to bonuses and other benefits that would have been earned during the reasonable notice period, regardless of contractual language attempting to limit such entitlements.",
        year: "2020",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Waksdale v. Swegon North America Inc.",
        citation: "2020 ONCA 391",
        relevance: "Ontario Court of Appeal case finding that if any termination provision in an employment contract violates employment standards, the entire termination clause is void, even if the employer relies on a separate, valid provision.",
        year: "2020",
        jurisdiction: "Ontario Court of Appeal"
      },
      {
        name: "Wallace v. United Grain Growers Ltd.",
        citation: "[1997] 3 SCR 701",
        relevance: "Supreme Court case that established the principle of extending the notice period when employers engage in bad faith conduct during dismissal (later modified by Honda Canada Inc. v. Keays).",
        year: "1997",
        jurisdiction: "Supreme Court of Canada"
      }
    ],
    legalConcepts: [
      {
        concept: "Reasonable Notice",
        definition: "The period of notice or pay in lieu that a dismissed employee without cause is entitled to, based on common law principles and considering factors such as age, length of service, character of employment, and availability of similar employment.",
        relevance: "Reasonable notice under common law typically exceeds statutory minimum notice requirements and is the central concept in wrongful dismissal cases."
      },
      {
        concept: "Just Cause",
        definition: "Serious misconduct by an employee that justifies immediate termination without notice or severance pay, such as theft, fraud, or serious insubordination.",
        relevance: "Employers who allege just cause bear the burden of proving the employee's misconduct was sufficiently serious to justify dismissal without notice."
      },
      {
        concept: "Constructive Dismissal",
        definition: "A situation where an employer unilaterally makes a substantial change to essential terms of employment, effectively forcing the employee to leave, which is treated as a termination without cause.",
        relevance: "Examples include significant reduction in compensation, demotion, change in work location, or creating a toxic work environment."
      },
      {
        concept: "Mitigation of Damages",
        definition: "The legal obligation of dismissed employees to make reasonable efforts to find comparable employment to reduce their financial losses.",
        relevance: "Failure to make reasonable efforts to mitigate can reduce the damages an employee can recover in a wrongful dismissal claim."
      },
      {
        concept: "Statutory Minimum Notice",
        definition: "The minimum notice period or termination pay required by provincial or federal employment standards legislation, typically based on length of service.",
        relevance: "These are minimum requirements that cannot be contracted out of, but common law notice periods are typically more generous."
      }
    ]
  }
};

// Mock data for real estate law queries
const realEstateLawMockData: MockDataByType = {
  'landlord tenant': {
    summary: "Landlord-tenant relationships in Canada are governed primarily by provincial legislation, with each province having its own residential tenancy act. These laws establish rights and obligations for both parties, including rules for rent increases, evictions, repairs, and dispute resolution. Most provinces have specialized tribunals like Ontario's Landlord and Tenant Board to handle disputes, offering a more accessible alternative to courts. While provisions vary by province, all jurisdictions provide basic tenant protections regarding habitability, privacy, and security of tenure.",
    relevantLaws: [
      {
        title: "Residential Tenancies Act (Ontario)",
        description: "Provincial legislation governing residential rental relationships in Ontario, establishing rights and responsibilities for landlords and tenants, rules for rent increases, evictions, and dispute resolution through the Landlord and Tenant Board.",
        source: "S.O. 2006, c. 17",
        url: "https://www.ontario.ca/laws/statute/06r17",
        relevanceScore: 0.95
      },
      {
        title: "Residential Tenancy Act (British Columbia)",
        description: "Provincial legislation in British Columbia governing residential tenancies, establishing rights and obligations for landlords and tenants, and procedures for dispute resolution through the Residential Tenancy Branch.",
        source: "SBC, 2002, c. 78",
        url: "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02078_01",
        relevanceScore: 0.85
      },
      {
        title: "Civil Code of Quebec, Book Five, Title Second",
        description: "Provincial legislation in Quebec governing lease agreements, including residential leases, with provisions for rights and obligations of landlords and tenants, termination of leases, and rent increases.",
        source: "CQLR c CCQ-1991, Articles 1851-2000",
        url: "http://legisquebec.gouv.qc.ca/en/showdoc/cs/ccq-1991",
        relevanceScore: 0.80
      },
      {
        title: "Residential Tenancies Act (Alberta)",
        description: "Provincial legislation in Alberta governing residential tenancies, establishing minimum standards for security deposits, rent increases, termination notices, and evictions.",
        source: "SA 2004, c R-17.1",
        url: "https://www.qp.alberta.ca/documents/Acts/R17P1.pdf",
        relevanceScore: 0.75
      },
      {
        title: "Human Rights Codes",
        description: "Federal and provincial human rights legislation prohibiting discrimination in rental housing based on protected grounds such as race, gender, disability, family status, and source of income.",
        source: "Various federal and provincial statutes",
        relevanceScore: 0.70
      }
    ],
    relevantCases: [
      {
        name: "Kokanee Mortgage MIC Ltd. v. Concord Pacific Developments Ltd.",
        citation: "2022 BCCA 151",
        relevance: "British Columbia Court of Appeal case addressing the interpretation of commercial lease provisions regarding rent abatement during COVID-19 pandemic restrictions.",
        year: "2022",
        jurisdiction: "British Columbia Court of Appeal",
        keyPoints: [
          "Force majeure clauses in leases must be interpreted based on their specific wording",
          "Courts will generally not rewrite contracts to address unforeseen circumstances",
          "Doctrines like frustration may apply only in limited circumstances where the lease's fundamental purpose is destroyed"
        ]
      },
      {
        name: "Scherbak v. MacKlem",
        citation: "2016 ONCA 371",
        relevance: "Ontario Court of Appeal case clarifying landlords' duty to mitigate damages when tenants abandon a rental unit before the end of the lease term.",
        year: "2016",
        jurisdiction: "Ontario Court of Appeal"
      },
      {
        name: "Rental Housing Enforcement Unit v. Wasell",
        citation: "2017 ONCJ 797",
        relevance: "Ontario Court of Justice case addressing harassment and interference with tenants' reasonable enjoyment, resulting in significant fines for the landlord.",
        year: "2017",
        jurisdiction: "Ontario Court of Justice"
      },
      {
        name: "Metropolitan Toronto Housing Authority v. Godwin",
        citation: "[1974] SCR 777",
        relevance: "Supreme Court case addressing procedural fairness requirements when public housing providers terminate tenancies.",
        year: "1974",
        jurisdiction: "Supreme Court of Canada"
      },
      {
        name: "Choules v. Marler",
        citation: "2016 BCSC 1256",
        relevance: "British Columbia Supreme Court case addressing landlord liability for tenant injuries caused by dangerous conditions on the property.",
        year: "2016",
        jurisdiction: "British Columbia Supreme Court"
      }
    ],
    legalConcepts: [
      {
        concept: "Security of Tenure",
        definition: "The legal principle that tenants have the right to continue occupying a rental unit unless there are legitimate grounds for eviction as specified in residential tenancy legislation.",
        relevance: "This concept protects tenants from arbitrary evictions and is a fundamental principle in Canadian residential tenancy law."
      },
      {
        concept: "Duty to Repair and Maintain",
        definition: "The landlord's legal obligation to keep the rental unit in a good state of repair, fit for habitation, and compliant with health, safety, and housing standards.",
        relevance: "This is a fundamental landlord obligation across all Canadian jurisdictions, though specific standards may vary by province."
      },
      {
        concept: "Quiet Enjoyment",
        definition: "The tenant's right to reasonable use and enjoyment of the rental unit without substantial interference from the landlord or other tenants.",
        relevance: "Landlords who interfere with this right through harassment, unauthorized entry, or failing to address significant disturbances may face penalties."
      },
      {
        concept: "Material Breach",
        definition: "A significant violation of lease terms or statutory obligations that may justify termination of the tenancy.",
        relevance: "Not all breaches of a lease justify termination; courts and tribunals consider the seriousness, frequency, and impact of the breach."
      },
      {
        concept: "N12/N13 Notices (Ontario)",
        definition: "Specific forms in Ontario used by landlords to terminate tenancies for personal use (N12) or extensive renovations/demolition (N13).",
        relevance: "These notices require specific timelines, compensation in some cases, and good faith intent, with significant penalties for bad faith evictions."
      }
    ]
  }
};

// Generic template for different types of queries
const genericMockData: ResearchResult = {
  summary: "This is a summary of the research results on your query. It provides an overview of the relevant Canadian legal principles, key legislation, and important case law. For specific legal advice, please consult with a qualified legal professional who can assess your unique situation.",
  relevantLaws: [
    {
      title: "Criminal Code of Canada",
      description: "The federal law that codifies most criminal offenses and procedures in Canada. It defines criminal conduct, establishes penalties, and outlines court processes.",
      source: "R.S.C., 1985, c. C-46",
      url: "https://laws-lois.justice.gc.ca/eng/acts/c-46/",
      relevanceScore: 0.85
    },
    {
      title: "Charter of Rights and Freedoms",
      description: "Part of Canada's Constitution that guarantees fundamental rights and freedoms to all Canadians, including legal rights that affect criminal investigations and proceedings.",
      source: "Constitution Act, 1982, Schedule B to the Canada Act 1982 (UK), 1982, c 11",
      url: "https://laws-lois.justice.gc.ca/eng/const/page-12.html",
      relevanceScore: 0.78
    },
    {
      title: "Canada Evidence Act",
      description: "Federal legislation governing the rules of evidence in criminal and civil proceedings within federal jurisdiction.",
      source: "R.S.C., 1985, c. C-5",
      url: "https://laws-lois.justice.gc.ca/eng/acts/c-5/",
      relevanceScore: 0.72
    },
    {
      title: "Controlled Drugs and Substances Act",
      description: "Federal legislation regulating the possession, production, and distribution of controlled substances in Canada.",
      source: "S.C. 1996, c. 19",
      url: "https://laws-lois.justice.gc.ca/eng/acts/c-38.8/",
      relevanceScore: 0.65
    },
    {
      title: "Youth Criminal Justice Act",
      description: "Federal legislation establishing a separate criminal justice system for youths (12-17 years) that emphasizes rehabilitation and reintegration.",
      source: "S.C. 2002, c. 1",
      url: "https://laws-lois.justice.gc.ca/eng/acts/y-1.5/",
      relevanceScore: 0.60
    }
  ],
  relevantCases: [
    {
      name: "R. v. Jordan",
      citation: "2016 SCC 27",
      relevance: "Supreme Court case establishing new framework for determining unreasonable delay in criminal trials under s. 11(b) of the Charter, setting presumptive ceilings of 18 months for provincial court trials and 30 months for superior court trials.",
      year: "2016",
      jurisdiction: "Supreme Court of Canada",
      keyPoints: [
        "Established presumptive ceilings for trial delay: 18 months for provincial courts, 30 months for superior courts",
        "Delays beyond these periods are presumptively unreasonable and may violate the accused's Charter rights",
        "The Crown may rebut this presumption by showing exceptional circumstances beyond its control"
      ]
    },
    {
      name: "R. v. Gladue",
      citation: "[1999] 1 SCR 688",
      relevance: "Supreme Court case addressing sentencing principles for Indigenous offenders, requiring courts to consider the unique systemic and background factors affecting Indigenous peoples.",
      year: "1999",
      jurisdiction: "Supreme Court of Canada"
    },
    {
      name: "R. v. Oakes",
      citation: "[1986] 1 SCR 103",
      relevance: "Landmark Supreme Court case establishing the Oakes test for determining whether a law that limits Charter rights can be justified under section 1 of the Charter.",
      year: "1986",
      jurisdiction: "Supreme Court of Canada"
    },
    {
      name: "R. v. Grant",
      citation: "2009 SCC 32",
      relevance: "Supreme Court case establishing a revised framework for determining when evidence obtained in violation of Charter rights should be excluded under section 24(2).",
      year: "2009",
      jurisdiction: "Supreme Court of Canada"
    },
    {
      name: "R. v. Morgentaler",
      citation: "[1988] 1 SCR 30",
      relevance: "Landmark Supreme Court case striking down Canada's abortion law as a violation of women's rights to security of the person under section 7 of the Charter.",
      year: "1988",
      jurisdiction: "Supreme Court of Canada"
    }
  ],
  legalConcepts: [
    {
      concept: "Beyond a Reasonable Doubt",
      definition: "The standard of proof required to secure a criminal conviction, requiring that evidence be so complete and convincing that there is no reasonable doubt in the mind of the judge or jury.",
      relevance: "This high standard is fundamental to criminal law in Canada and reflects the principle that it is better for guilty individuals to go free than for innocent people to be wrongfully convicted."
    },
    {
      concept: "Mens Rea",
      definition: "The mental element of a crime - the intent or knowledge of wrongdoing that constitutes part of a criminal offense.",
      relevance: "Most criminal offenses require proof of both the prohibited act (actus reus) and the mental intent (mens rea) to establish guilt."
    },
    {
      concept: "Stare Decisis",
      definition: "The legal principle of following precedents established by previous court decisions when ruling on similar cases.",
      relevance: "This principle provides consistency and predictability in the legal system, though courts (especially higher courts) can depart from precedent when necessary."
    },
    {
      concept: "Reasonable Expectation of Privacy",
      definition: "A legal test used to determine whether a person has Charter protection against unreasonable search or seizure in a particular context.",
      relevance: "This concept is central to search and seizure law in Canada and determines when police require warrants or other authorization."
    },
    {
      concept: "Rule of Law",
      definition: "The principle that all individuals, organizations, and the government itself are subject to and accountable to law that is fairly applied and enforced.",
      relevance: "This foundational concept underpins the entire Canadian legal system and ensures that no one is above the law."
    }
  ]
};

// Function to get mock data based on query, jurisdiction and practice area
export function getMockResearchData(
  query: string,
  jurisdiction: string = "canada",
  practiceArea: string = "all"
): ResearchResult {
  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase();
  
  // First check if there's a specific mock response for this query
  if (practiceArea === "family" || lowerQuery.includes("child") || lowerQuery.includes("divorce") || lowerQuery.includes("custody")) {
    if (lowerQuery.includes("child support") || lowerQuery.includes("child maintenance")) {
      return familyLawMockData["child support"];
    }
    if (lowerQuery.includes("divorce") || lowerQuery.includes("separation")) {
      return familyLawMockData["divorce"];
    }
  }
  
  if (practiceArea === "criminal" || lowerQuery.includes("criminal") || lowerQuery.includes("offense") || lowerQuery.includes("offence")) {
    if (lowerQuery.includes("dui") || lowerQuery.includes("drunk driving") || lowerQuery.includes("impaired driving")) {
      return criminalLawMockData["dui"];
    }
  }
  
  if (practiceArea === "employment" || lowerQuery.includes("employ") || lowerQuery.includes("work") || lowerQuery.includes("job")) {
    if (lowerQuery.includes("wrongful dismissal") || lowerQuery.includes("termination") || lowerQuery.includes("fired")) {
      return employmentLawMockData["wrongful dismissal"];
    }
  }
  
  if (practiceArea === "property" || lowerQuery.includes("landlord") || lowerQuery.includes("tenant") || lowerQuery.includes("rent")) {
    if (lowerQuery.includes("landlord") || lowerQuery.includes("tenant") || lowerQuery.includes("lease") || lowerQuery.includes("rental")) {
      return realEstateLawMockData["landlord tenant"];
    }
  }
  
  // If no specific match found, use the generic template but personalize it with the query
  const result = {...genericMockData};
  result.summary = `Research results for "${query}" in ${jurisdiction} jurisdiction focusing on ${practiceArea} law. This provides an overview of relevant Canadian legal principles, key legislation, and important case law related to your query. For specific legal advice, please consult with a qualified legal professional who can assess your unique situation.`;
  
  return result;
}