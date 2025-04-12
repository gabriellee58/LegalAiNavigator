import { CourtProcedureData } from "./types";

export const administrativeData: CourtProcedureData = {
  id: "administrative-tribunals",
  title: "Administrative Tribunals",
  description: "Specialized procedures for resolving disputes related to government agencies and regulations",
  icon: "building",
  overview: {
    summary: "Administrative tribunals are specialized quasi-judicial bodies that resolve disputes arising from government regulations, social benefits, and specific regulated sectors.",
    purpose: "To provide efficient, accessible, and specialized adjudication of disputes in specific regulated domains outside traditional courts.",
    applicability: ["Applied to areas including employment standards, human rights, landlord-tenant relations, immigration, social benefits, professional regulation, and other specialized domains."],
    mainFeatures: [
      "More informal and expeditious process than courts",
      "Lower costs and typically more accessible procedures",
      "Subject-matter expertise in the specific regulatory domain",
      "Emphasis on accessibility, efficiency, and specialized knowledge",
      "Functions like courts but with more flexible procedures"
    ],
  },
  steps: [
    {
      id: "admin-1",
      title: "1. Determining Jurisdiction",
      description: "Identifying the appropriate tribunal for your specific dispute.",
      details: "Before filing, determine which administrative tribunal has authority over your specific type of dispute, as jurisdiction is strictly defined by enabling legislation.",
      timeline: {
        minDays: 7,
        maxDays: 14,
        description: "1-2 weeks for research and consultation"
      },
      documents: [
        {
          name: "Enabling Legislation",
          description: "Laws establishing the tribunal and defining its powers",
          required: false
        },
        {
          name: "Tribunal Rules of Procedure",
          description: "Specific procedural rules governing the tribunal",
          required: true
        },
        {
          name: "Jurisdictional Research",
          description: "Documentation confirming the tribunal's authority over your issue",
          required: false
        }
      ],
      considerations: [
        "Each tribunal has a specific and limited jurisdiction",
        "Limitation periods vary by tribunal (typically 6 months to 2 years)",
        "Some disputes may fall under multiple tribunals' jurisdiction",
        "Some remedies may only be available from specific tribunals"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario has various tribunals including the Landlord and Tenant Board, Human Rights Tribunal, and Social Benefits Tribunal, often grouped under Tribunals Ontario.",
          resources: ["https://tribunalsontario.ca/"]
        },
        quebec: {
          notes: "Quebec has the Administrative Tribunal of Quebec (TAQ) with several divisions handling different matters, plus other specialized tribunals.",
          resources: ["https://www.taq.gouv.qc.ca/en"]
        },
        britishColumbia: {
          notes: "BC has numerous tribunals including the Civil Resolution Tribunal (for small claims, strata disputes), Residential Tenancy Branch, and Human Rights Tribunal.",
          resources: ["https://www2.gov.bc.ca/gov/content/justice/about-bcs-justice-system/administrative-tribunals"]
        },
        alberta: {
          notes: "Alberta has various tribunals including the Residential Tenancy Dispute Resolution Service, Human Rights Commission, and Labour Relations Board.",
          resources: ["https://www.alberta.ca/administrative-tribunals.aspx"]
        }
      }
    },
    {
      id: "admin-2",
      title: "2. Pre-Application Procedures",
      description: "Required steps before formally filing with the tribunal.",
      details: "Many tribunals require preliminary steps such as internal reviews, complaints to regulatory bodies, or mandatory mediation before a formal application.",
      timeline: {
        minDays: 30,
        maxDays: 180,
        description: "1-6 months"
      },
      documents: [
        {
          name: "Internal Complaint Documentation",
          description: "Evidence of prior attempts to resolve through internal processes",
          required: false
        },
        {
          name: "Mediation Certificate",
          description: "Proof of attempted mediation where required",
          required: false
        },
        {
          name: "Notice of Intent",
          description: "Formal notice to respondent of upcoming application",
          required: false
        }
      ],
      considerations: [
        "Exhaustion of internal remedies is often required before tribunal access",
        "Some tribunals have mandatory pre-application mediation",
        "Strict timelines often apply to pre-application steps",
        "Documentation of all pre-application attempts at resolution is crucial"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario's Human Rights Tribunal requires complaints to be filed with the Human Rights Commission first. Employment matters often require Ministry of Labour intervention before tribunal applications.",
          resources: ["http://www.ohrc.on.ca/en/learning/ohrc-code-litigation"]
        },
        quebec: {
          notes: "Quebec's Administrative Tribunal (TAQ) generally requires prior decisions from a government agency before accepting an appeal or review application.",
          resources: ["https://www.taq.gouv.qc.ca/en/filing-an-application/prior-decision-required"]
        },
        britishColumbia: {
          notes: "BC's Residential Tenancy Branch requires attempted direct resolution between landlords and tenants before application. Employment Standards complaints must go through Employment Standards Branch first.",
          resources: ["https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems"]
        },
        alberta: {
          notes: "Alberta's Human Rights Commission mandates a complaint process before tribunal hearings. Employment standards complaints must first go through Employment Standards.",
          resources: ["https://www.albertahumanrights.ab.ca/complaints/Pages/process.aspx"]
        }
      }
    },
    {
      id: "admin-3",
      title: "3. Filing an Application",
      description: "Formally initiating the tribunal process with the proper documentation.",
      details: "Applications must be filed on prescribed forms with supporting documentation within strict timelines, often with filing fees.",
      timeline: {
        minDays: 7,
        maxDays: 14,
        description: "1-2 weeks to prepare; 1-4 weeks to process"
      },
      documents: [
        {
          name: "Application Form",
          description: "Tribunal-specific form initiating the process",
          required: true
        },
        {
          name: "Supporting Documentation",
          description: "Evidence supporting your claims",
          required: true
        },
        {
          name: "Fee Waiver Application",
          description: "Request to reduce or waive filing fees based on financial need",
          required: false
        }
      ],
      considerations: [
        "Applications must include all essential facts and requested remedies",
        "Filing fees vary but are typically lower than court fees",
        "Electronic filing is increasingly available",
        "Some tribunals provide help with application completion"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario tribunals each have specific forms and filing requirements. The Landlord and Tenant Board has different forms for different application types. Human Rights applications use Form 1.",
          resources: ["https://tribunalsontario.ca/en/"]
        },
        quebec: {
          notes: "Quebec's TAQ uses standardized forms depending on the division (social affairs, immovable property, economic affairs, etc.). Filing fees apply to most applications.",
          resources: ["https://www.taq.gouv.qc.ca/en/filing-an-application/forms"]
        },
        britishColumbia: {
          notes: "BC's Civil Resolution Tribunal has an online Solution Explorer to help users prepare applications. The Human Rights Tribunal has specific complaint forms.",
          resources: ["https://civilresolutionbc.ca/how-the-crt-works/getting-started/"]
        },
        alberta: {
          notes: "Alberta's tribunals have specific forms for different applications. The Residential Tenancy Dispute Resolution Service has an online application system.",
          resources: ["https://www.alberta.ca/rtdrs-apply.aspx"]
        }
      }
    },
    {
      id: "admin-4",
      title: "4. Respondent's Reply",
      description: "The opposing party's formal response to the application.",
      details: "After notification, respondents must file a formal reply addressing the allegations and providing their own supporting documentation.",
      timeline: {
        minDays: 30,
        maxDays: 30,
        description: "Typically 14-30 days after notification"
      },
      documents: [
        {
          name: "Response Form",
          description: "Respondent's formal answer to the application",
          required: true
        },
        {
          name: "Supporting Documentation",
          description: "Evidence supporting the respondent's position",
          required: true
        },
        {
          name: "Preliminary Objections",
          description: "Challenges to jurisdiction or procedure",
          required: false
        }
      ],
      considerations: [
        "Strict deadlines apply to responses",
        "Failing to respond can result in proceeding without the respondent",
        "Jurisdictional challenges should be raised early",
        "Some tribunals require detailed responses to each allegation"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario tribunal respondents typically have 30 days to file responses. The Landlord and Tenant Board requires responses within 10 days for many application types.",
          resources: ["https://tribunalsontario.ca/ltb/forms/"]
        },
        quebec: {
          notes: "Quebec's TAQ generally allows 30 days for respondents to file contestations. Government agencies must provide their case records within this timeframe.",
          resources: ["https://www.taq.gouv.qc.ca/en/case-processing"]
        },
        britishColumbia: {
          notes: "BC's Civil Resolution Tribunal gives respondents 14 days to respond. The Human Rights Tribunal allows 35 days for responses to complaints.",
          resources: ["http://www.bchrt.bc.ca/law-library/guides-info-sheets/responding.htm"]
        },
        alberta: {
          notes: "Alberta tribunal response times vary. The Human Rights Commission typically allows 30 days for responses to complaints. The Residential Tenancy Dispute Resolution Service requires responses before scheduled hearings.",
          resources: ["https://www.albertahumanrights.ab.ca/respondents/Pages/process.aspx"]
        }
      }
    },
    {
      id: "admin-5",
      title: "5. Case Management and Mediation",
      description: "Pre-hearing processes to narrow issues and attempt resolution.",
      details: "Most tribunals have case management conferences to clarify issues and procedures, and many offer or mandate mediation before proceeding to hearing.",
      timeline: {
        minDays: 30,
        maxDays: 90,
        description: "1-3 months"
      },
      documents: [
        {
          name: "Case Management Directions",
          description: "Formal instructions from the tribunal about process",
          required: false
        },
        {
          name: "Mediation Brief",
          description: "Summary of position and settlement parameters",
          required: false
        },
        {
          name: "Issue Statement",
          description: "Agreed statement of issues in dispute",
          required: false
        },
        {
          name: "Settlement Agreement",
          description: "Formal resolution if mediation succeeds",
          required: false
        }
      ],
      considerations: [
        "Mediation is often highly effective in tribunal contexts",
        "Case management can streamline the hearing process",
        "Disclosure of documents is typically required before mediation",
        "Failure to participate may have negative consequences"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario tribunals like the Human Rights Tribunal have mandatory mediation sessions. The Landlord and Tenant Board offers mediation on hearing day.",
          resources: ["http://www.sjto.gov.on.ca/en/dispute-resolution/"]
        },
        quebec: {
          notes: "Quebec's TAQ offers conciliation (mediation) services as an alternative to hearings. Pre-hearing conferences are held for complex cases.",
          resources: ["https://www.taq.gouv.qc.ca/en/case-processing/conciliation"]
        },
        britishColumbia: {
          notes: "BC's Civil Resolution Tribunal has a mandatory negotiation phase followed by facilitated settlement if needed. Most tribunals offer mediation services.",
          resources: ["https://civilresolutionbc.ca/how-the-crt-works/tribunal-process/facilitated-settlement/"]
        },
        alberta: {
          notes: "Alberta's Human Rights Commission offers conciliation before tribunal hearings. The Labour Relations Board holds informal settlement conferences.",
          resources: ["https://www.albertahumanrights.ab.ca/complaints/Pages/conciliation.aspx"]
        }
      }
    },
    {
      id: "admin-6",
      title: "6. Disclosure and Evidence Exchange",
      description: "Sharing of relevant documents and information before the hearing.",
      details: "Parties must exchange all relevant documents and witness information according to tribunal rules before the hearing.",
      timeline: {
        minDays: 30,
        maxDays: 60,
        description: "1-2 months before hearing"
      },
      documents: [
        {
          name: "Document Disclosure List",
          description: "Inventory of all relevant documents",
          required: true
        },
        {
          name: "Witness List",
          description: "Names and contact information for witnesses",
          required: false
        },
        {
          name: "Expert Reports",
          description: "Opinions from qualified experts",
          required: false
        },
        {
          name: "Disclosure Objections",
          description: "Challenges to relevance or privilege of documents",
          required: false
        }
      ],
      considerations: [
        "Disclosure obligations are ongoing up to and during hearings",
        "Tribunals may have specific disclosure formats and deadlines",
        "Failure to disclose may result in exclusion of evidence",
        "Privilege claims must be specifically identified"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario tribunals typically require disclosure 2-3 weeks before hearings. The Human Rights Tribunal requires disclosure of expert evidence 45 days before hearing.",
          resources: ["http://www.sjto.gov.on.ca/hrto/rules-of-procedure/#rule17"]
        },
        quebec: {
          notes: "Quebec's TAQ requires exchange of documents before hearings. The tribunal can order additional disclosure if needed.",
          resources: ["https://www.taq.gouv.qc.ca/en/case-processing/preparing-for-a-hearing"]
        },
        britishColumbia: {
          notes: "BC's Human Rights Tribunal requires disclosure at least 35 days before hearing. The Civil Resolution Tribunal uses a staged disclosure process during case management.",
          resources: ["http://www.bchrt.bc.ca/law-library/guides-info-sheets/preparing-for-hearing.htm"]
        },
        alberta: {
          notes: "Alberta tribunals set disclosure deadlines in procedural orders. The Alberta Human Rights Tribunal typically requires disclosure 3-4 weeks before hearing.",
          resources: ["https://www.albertahumanrights.ab.ca/tribunal/Pages/tribunal.aspx"]
        }
      }
    },
    {
      id: "admin-7",
      title: "7. Hearing",
      description: "The formal presentation of evidence and arguments before the tribunal.",
      details: "During the hearing, parties present evidence, examine witnesses, and make legal arguments. Procedures are typically less formal than courts.",
      timeline: {
        minDays: 7,
        maxDays: 30,
        description: "Half-day to multiple days depending on complexity"
      },
      documents: [
        {
          name: "Hearing Brief",
          description: "Summary of evidence and arguments",
          required: false
        },
        {
          name: "Document Book",
          description: "Organized compilation of documentary evidence",
          required: true
        },
        {
          name: "Legal Authorities",
          description: "Relevant cases and legislation",
          required: false
        },
        {
          name: "Written Submissions",
          description: "Detailed legal arguments (may be required before or after hearing)",
          required: false
        }
      ],
      considerations: [
        "Hearings may be in-person, written, or virtual",
        "Rules of evidence are typically more relaxed than courts",
        "Self-representation is common and accommodated",
        "Tribunal members may ask questions directly to witnesses"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario tribunal hearings vary in formality. Human Rights Tribunal hearings are relatively formal, while Social Benefits Tribunal hearings are more informal. Many now offer video hearings.",
          resources: ["https://tribunalsontario.ca/en/preparing-for-a-hearing/"]
        },
        quebec: {
          notes: "Quebec's TAQ hearings are inquisitorial with the tribunal taking an active role in questioning. Hearings are typically recorded.",
          resources: ["https://www.taq.gouv.qc.ca/en/case-processing/the-hearing"]
        },
        britishColumbia: {
          notes: "BC tribunal hearings vary. The Civil Resolution Tribunal primarily uses written hearings. Human Rights Tribunal hearings are more formal with witness testimony.",
          resources: ["http://www.bchrt.bc.ca/law-library/guides-info-sheets/at-the-hearing.htm"]
        },
        alberta: {
          notes: "Alberta tribunal hearings range from informal to quasi-judicial. Labour Relations Board hearings are relatively formal with examination of witnesses, while residential tenancy hearings are more informal.",
          resources: ["https://www.alrb.gov.ab.ca/procedures.html"]
        }
      }
    },
    {
      id: "admin-8",
      title: "8. Decision and Remedies",
      description: "The tribunal's ruling and orders addressing the dispute.",
      details: "After the hearing, the tribunal issues a written decision with reasons and any remedial orders or directions.",
      timeline: {
        minDays: 7,
        maxDays: 30,
        description: "2 weeks to 6 months after hearing"
      },
      documents: [
        {
          name: "Written Decision",
          description: "Tribunal's ruling with reasons",
          required: true
        },
        {
          name: "Order",
          description: "Enforceable directions from the tribunal",
          required: false
        },
        {
          name: "Remedy Decision",
          description: "Separate ruling on appropriate remedies (in some cases)",
          required: false
        },
        {
          name: "Costs Decision",
          description: "Ruling on whether legal costs are awarded",
          required: false
        }
      ],
      considerations: [
        "Tribunals have specific remedial powers defined by legislation",
        "Decisions are typically published and may be precedential",
        "Costs awards are less common than in courts",
        "Compliance monitoring may be part of remedial orders"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario tribunal decisions are typically published. Human Rights Tribunal can order monetary compensation, non-monetary remedies, and public interest remedies.",
          resources: ["https://www.canlii.org/en/on/"]
        },
        quebec: {
          notes: "Quebec's TAQ decisions include reasons and are published. The tribunal can overturn administrative decisions and substitute its own decision.",
          resources: ["https://www.taq.gouv.qc.ca/en/case-processing/the-decision"]
        },
        britishColumbia: {
          notes: "BC tribunal decisions are published online. Human Rights Tribunal can order monetary damages (including for dignity, feelings, and self-respect), plus non-monetary remedies.",
          resources: ["http://www.bchrt.bc.ca/law-library/decisions/index.htm"]
        },
        alberta: {
          notes: "Alberta tribunal decisions vary in publication practices. Human Rights Tribunal decisions include monetary and non-monetary remedies and are published online.",
          resources: ["https://www.canlii.org/en/ab/"]
        }
      }
    },
    {
      id: "admin-9",
      title: "9. Appeals and Judicial Review",
      description: "Challenging tribunal decisions in courts.",
      details: "Tribunal decisions may be appealed (if legislation permits) or challenged through judicial review based on jurisdictional or procedural errors.",
      timeline: {
        minDays: 30,
        maxDays: 30,
        description: "Appeal/review applications typically due within 30 days; process takes 6-18 months"
      },
      documents: [
        {
          name: "Notice of Appeal",
          description: "Formal application to appeal (where permitted)",
          required: false
        },
        {
          name: "Application for Judicial Review",
          description: "Court application challenging tribunal decision",
          required: false
        },
        {
          name: "Appeal Book",
          description: "Compilation of tribunal record and proceedings",
          required: false
        },
        {
          name: "Factum",
          description: "Written legal arguments",
          required: false
        }
      ],
      considerations: [
        "Appeal rights vary by tribunal and are defined by statute",
        "Judicial review focuses on procedural fairness and jurisdiction, not merits",
        "Courts typically defer to tribunal expertise in their domain",
        "Strict timelines apply to appeals and judicial reviews"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario tribunal decisions may be appealed to Divisional Court on questions of law if enabling legislation permits. All decisions are subject to judicial review.",
          resources: ["https://www.ontario.ca/page/application-judicial-review"]
        },
        quebec: {
          notes: "Quebec's TAQ decisions may be appealed to Quebec Superior Court with permission and only on questions of law or jurisdiction.",
          resources: ["https://www.taq.gouv.qc.ca/en/case-processing/contesting-a-decision"]
        },
        britishColumbia: {
          notes: "BC tribunal decisions may be appealed if enabling legislation permits. Judicial review applications go to BC Supreme Court within 60 days of the decision.",
          resources: ["https://www.bccourts.ca/supreme_court/about_the_supreme_court/administrative_law.aspx"]
        },
        alberta: {
          notes: "Alberta tribunal decisions may have statutory appeal rights. Judicial review applications go to Court of King's Bench within 6 months (though 30 days is advisable).",
          resources: ["https://www.albertacourts.ca/kb/areas-of-law/civil/judicial-review"]
        }
      }
    }
  ],
  faq: [
    {
      question: "What is the difference between a tribunal and a court?",
      answer: "Administrative tribunals are specialized bodies created by legislation to resolve disputes in specific domains. Unlike courts, tribunals have limited jurisdiction, more flexible procedures, typically lower costs, and decision-makers with subject-matter expertise rather than judges. Their procedures are less formal, they can act more proactively in investigations, and they often emphasize accessibility for self-represented parties."
    },
    {
      question: "Do I need a lawyer for a tribunal hearing?",
      answer: "While not required, legal representation can be beneficial for complex cases. Many people successfully represent themselves before tribunals, which are designed to be more accessible than courts. Some tribunals (like Quebec Small Claims) prohibit lawyers, while others allow non-lawyer representatives like paralegals, union representatives, or community advocates. Many tribunals provide resources to help self-represented parties."
    },
    {
      question: "How much does it cost to file a tribunal application?",
      answer: "Filing fees vary by tribunal but are typically lower than court fees, ranging from free to about $200. Human rights complaints are often free to file. Some tribunals, like landlord-tenant boards, charge different fees based on application type. Fee waiver programs are available for those with financial need. Additional costs may include document preparation, expert reports, and legal advice."
    },
    {
      question: "How long does a tribunal process take?",
      answer: "Timeframes vary significantly by tribunal and case complexity, ranging from 3-18 months from application to decision. Simpler matters with active case management may resolve in 3-6 months. More complex cases with multiple parties or legal issues may take a year or longer. Some tribunals offer expedited processes for urgent matters. Case backlogs can cause additional delays."
    },
    {
      question: "What remedies can tribunals provide?",
      answer: "Remedies depend on the tribunal's enabling legislation but may include: monetary compensation (including damages for discrimination in human rights contexts), ordering specific actions (reinstatement, accommodation, rule changes), declaratory relief (formal findings about legal rights), licensing decisions, and public interest remedies (training, policy development). Unlike courts, tribunals cannot generally award punitive damages or make Charter declarations."
    },
    {
      question: "Are tribunal decisions binding and enforceable?",
      answer: "Yes, tribunal decisions are legally binding and enforceable, though enforcement mechanisms vary. Most tribunal orders can be filed with a court to be enforced like court orders. Some tribunals (like human rights tribunals) may monitor compliance with remedial orders. Parties who don't comply may face contempt proceedings or additional penalties. Decisions may be appealed or judicially reviewed only on specific grounds."
    }
  ]
};