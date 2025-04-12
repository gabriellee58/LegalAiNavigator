import { CourtProcedureData } from "./types";

export const familyCourtData: CourtProcedureData = {
  id: "family-court",
  title: "Family Court",
  description: "The process for resolving family law matters including divorce, custody and support",
  category: "family",
  icon: "home",
  overview: {
    summary: "Family court procedures govern how family legal matters such as divorce, separation, child custody, and support are resolved in Canadian courts.",
    purpose: "To resolve family disputes in a manner that prioritizes the best interests of children and fair outcomes for all parties involved.",
    applicability: ["Applied in cases involving marriage dissolution, parenting arrangements, child and spousal support, division of property, and protection orders."],
    mainFeatures: [
      "Strong emphasis on negotiation, mediation, and alternative dispute resolution",
      "Focus on the 'best interests of the child' principle",
      "Specialized courts with judges experienced in family matters",
      "Varying provincial procedures with federal Divorce Act providing overarching framework",
    ],
  },
  steps: [
    {
      id: "family-1",
      title: "1. Initial Application",
      description: "The formal start of family court proceedings through filing of application documents.",
      details: "Initiating documents outline what the applicant is seeking from the court and the facts supporting their position.",
      timeline: {
        minDays: 7,
        maxDays: 28,
        description: "1-4 weeks to prepare and file documents"
      },
      documents: [
        {
          name: "Application (General)",
          description: "Primary document initiating family proceedings for multiple issues",
          required: true
        },
        {
          name: "Application (Divorce)",
          description: "Specific form for divorce proceedings",
          required: false
        },
        {
          name: "Financial Statement",
          description: "Detailed disclosure of income, expenses, assets, and liabilities",
          required: true
        },
        {
          name: "Parenting Plan",
          description: "Proposed arrangements for parenting time and decision-making",
          required: false
        }
      ],
      considerations: [
        "Consider whether emergency/urgent motions are needed for immediate issues",
        "Determine the appropriate court level (provincial or superior court)",
        "Be aware of jurisdiction issues if parties live in different provinces",
        "Consider mandatory mediation information sessions in some jurisdictions"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario family matters may be heard in the Ontario Court of Justice, Superior Court of Justice, or Family Court branch of the Superior Court, depending on location and issues.",
          resources: ["https://www.ontario.ca/page/family-law"]
        },
        quebec: {
          notes: "Quebec family matters are typically heard in the Superior Court, with different procedures reflecting Quebec's civil law system.",
          resources: ["https://www.justice.gouv.qc.ca/en/couples-and-families"]
        },
        britishColumbia: {
          notes: "BC family matters may be heard in either Provincial Court or Supreme Court, with different forms and procedures for each.",
          resources: ["https://www2.gov.bc.ca/gov/content/life-events/divorce/family-justice"]
        },
        alberta: {
          notes: "Alberta family matters may be heard in Provincial Court for parenting and support issues, or Court of King's Bench for all issues including property division.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/family"]
        }
      }
    },
    {
      id: "family-2",
      title: "2. Service and Response",
      description: "Process of legally delivering court documents to the other party and their formal response.",
      details: "After filing, documents must be properly served on the other party, who then has the opportunity to respond with their position.",
      timeline: {
        minDays: 30,
        maxDays: 30,
        description: "Respondent typically has 30 days to respond after service"
      },
      documents: [
        {
          name: "Affidavit of Service",
          description: "Proof that documents were properly delivered to the other party",
          required: true
        },
        {
          name: "Response",
          description: "Responding party's position on the issues raised",
          required: false
        },
        {
          name: "Counter-Application",
          description: "Respondent's own claims against the applicant",
          required: false
        },
        {
          name: "Reply",
          description: "Applicant's response to new issues raised in the Response",
          required: false
        }
      ],
      considerations: [
        "Service must follow specific rules (personal service is often required for initial documents)",
        "Alternative service may be ordered if personal service is not possible",
        "Failure to respond may result in an uncontested proceeding",
        "International service has additional requirements"
      ],
      provinceSpecific: {
        ontario: {
          notes: "In Ontario, initial applications generally require personal service. The respondent has 30 days to file an Answer (60 days if served outside Canada/US).",
          resources: ["https://www.ontario.ca/page/serving-family-court-documents"]
        },
        quebec: {
          notes: "Quebec requires personal service of family proceedings via bailiff, with 15-30 day response times depending on the proceeding.",
          resources: ["https://www.justice.gouv.qc.ca/en/couples-and-families/separation-and-divorce/the-trial-process-step-by-step"]
        },
        britishColumbia: {
          notes: "BC has different service requirements depending on whether the case is in Provincial Court or Supreme Court, with different timeframes for response.",
          resources: ["https://familylaw.lss.bc.ca/courts/provincial-court/forms-guides"]
        },
        alberta: {
          notes: "Alberta requires personal service for most initiating documents in family matters. Response deadlines vary by court and document type.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/family/forms"]
        }
      }
    },
    {
      id: "family-3",
      title: "3. Alternative Dispute Resolution",
      description: "Processes to resolve family disputes outside traditional courtroom litigation.",
      details: "Most family court systems strongly encourage or require parties to attempt resolution through negotiation, mediation, or other collaborative approaches.",
      timeline: {
        minDays: 30,
        maxDays: 90,
        description: "1-3 months"
      },
      documents: [
        {
          name: "Mediation Brief",
          description: "Summary of issues and position for mediator",
          required: false
        },
        {
          name: "Minutes of Settlement",
          description: "Written agreement resulting from negotiation or mediation",
          required: false
        },
        {
          name: "Parenting Coordinator Agreement",
          description: "Agreement to use parenting coordination for ongoing parenting disputes",
          required: false
        },
        {
          name: "Collaborative Law Participation Agreement",
          description: "Commitment to resolve issues through collaborative process",
          required: false
        }
      ],
      considerations: [
        "Many jurisdictions have mandatory mediation information sessions",
        "Financial disclosure must be complete and honest for effective mediation",
        "Power imbalances may make some ADR processes inappropriate",
        "Legal advice is important even when engaging in ADR"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario has mandatory information sessions about alternatives to litigation. Free mediation is available for select issues in some courts.",
          resources: ["https://www.ontario.ca/page/family-mediation-services"]
        },
        quebec: {
          notes: "Quebec offers free mediation sessions for couples with children and requires consideration of mediation before proceeding to court.",
          resources: ["https://www.justice.gouv.qc.ca/en/couples-and-families/separation-and-divorce/family-mediation-negotiating-a-fair-agreement"]
        },
        britishColumbia: {
          notes: "BC provides Family Justice Centers with free mediation services and requires consideration of dispute resolution options before court.",
          resources: ["https://www2.gov.bc.ca/gov/content/life-events/divorce/family-justice/who-can-help/family-justice-centres"]
        },
        alberta: {
          notes: "Alberta offers Family Mediation Services and requires parents to attend parenting education courses.",
          resources: ["https://www.alberta.ca/family-mediation.aspx"]
        }
      }
    },
    {
      id: "family-4",
      title: "4. Interim Motions and Case Conferences",
      description: "Procedures for establishing temporary arrangements and managing the case before final resolution.",
      details: "Interim motions address immediate issues while the case proceeds, and case conferences help manage the case efficiently and explore settlement.",
      timeline: {
        minDays: 30,
        maxDays: 180,
        description: "1-6 months"
      },
      documents: [
        {
          name: "Notice of Motion",
          description: "Request for temporary orders on specific issues",
          required: false
        },
        {
          name: "Affidavit",
          description: "Sworn statement providing evidence supporting motion or conference",
          required: true
        },
        {
          name: "Case Conference Brief",
          description: "Summary of issues, positions, and proposed resolution",
          required: false
        },
        {
          name: "Interim Order",
          description: "Temporary court order until final determination",
          required: false
        }
      ],
      considerations: [
        "Urgent motions may be heard with limited notice in emergency situations",
        "Case conferences focus on identifying issues, encouraging settlement, and procedural planning",
        "Interim orders often establish status quo for childcare arrangements",
        "Multiple case conferences may be required in complex cases"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario requires a case conference before most motions can be brought. Forms 14/14A are used for motions, Form 17A/B for conferences.",
          resources: ["https://www.ontario.ca/page/guide-procedures-family-court"]
        },
        quebec: {
          notes: "Quebec uses safeguard orders for interim measures. Case management conferences (case protocols) help structure the proceedings.",
          resources: ["https://www.justice.gouv.qc.ca/en/couples-and-families/separation-and-divorce/the-trial-process-step-by-step/provisional-measures"]
        },
        britishColumbia: {
          notes: "BC uses Family Management Conferences in Provincial Court and Judicial Case Conferences in Supreme Court to manage cases.",
          resources: ["https://www.provincialcourt.bc.ca/types-of-cases/family-matters/chief-judge-practice-directions"]
        },
        alberta: {
          notes: "Alberta uses Early Intervention Case Conferences and has specific procedures for emergency protection orders in family violence cases.",
          resources: ["https://www.albertacourts.ca/kb/areas-of-law/family/forms"]
        }
      }
    },
    {
      id: "family-5",
      title: "5. Disclosure and Discovery",
      description: "Exchange of financial and personal information relevant to family law issues.",
      details: "Parties must disclose relevant financial and personal information to ensure informed decision-making and fair outcomes.",
      timeline: {
        minDays: 60,
        maxDays: 180,
        description: "2-6 months"
      },
      documents: [
        {
          name: "Financial Statement",
          description: "Comprehensive statement of income, expenses, assets, and debts",
          required: true
        },
        {
          name: "Disclosure Request",
          description: "Formal request for specific information or documents",
          required: false
        },
        {
          name: "Net Family Property Statement",
          description: "Detailed accounting of assets for property division",
          required: false
        },
        {
          name: "Business Valuation",
          description: "Expert assessment of business value for property division",
          required: false
        }
      ],
      considerations: [
        "Full and accurate financial disclosure is a fundamental obligation",
        "Failure to disclose can result in penalties and set-aside of agreements",
        "Expert valuations may be needed for businesses, pensions, or complex assets",
        "Questioning (examination) of parties may be available in some jurisdictions"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario requires filing Financial Statements (Forms 13/13.1) and disclosure of specific documents. Rule 13 governs financial disclosure requirements.",
          resources: ["https://www.ontario.ca/page/complete-financial-disclosure-information-families"]
        },
        quebec: {
          notes: "Quebec requires a Statement of Income, Assets, and Liabilities, with additional disclosure through the case protocol process.",
          resources: ["https://educaloi.qc.ca/en/capsules/separation-and-divorce-dividing-up-property/"]
        },
        britishColumbia: {
          notes: "BC requires Financial Statements (Form F8 in Supreme Court) and full disclosure of relevant documents under Rule 5-1.",
          resources: ["https://familylaw.lss.bc.ca/finances-support/property-debt/dividing-property-and-debt"]
        },
        alberta: {
          notes: "Alberta requires Financial Statements in prescribed form and mandatory disclosure of specific documents for cases involving support or property division.",
          resources: ["https://www.albertacourts.ca/kb/areas-of-law/family/family-law-forms"]
        }
      }
    },
    {
      id: "family-6",
      title: "6. Trial Preparation and Trial",
      description: "Final preparation and formal hearing of evidence and arguments.",
      details: "If settlement is not reached, the case proceeds to trial where evidence is presented, witnesses testify, and a judge makes final determinations.",
      timeline: {
        minDays: 10,
        maxDays: 10,
        description: "Trial preparation: 2-6 months; Trial: 1-10 days (occasionally longer)"
      },
      documents: [
        {
          name: "Trial Record",
          description: "Compilation of pleadings and orders for the trial judge",
          required: true
        },
        {
          name: "Trial Brief",
          description: "Summary of facts, issues, and legal arguments",
          required: true
        },
        {
          name: "Expert Reports",
          description: "Custody evaluations, financial analyses, etc.",
          required: false
        },
        {
          name: "Book of Authorities",
          description: "Compilation of relevant case law and legislation",
          required: true
        }
      ],
      considerations: [
        "Pre-trial conferences help narrow issues and may lead to last-minute settlement",
        "Expert witnesses (e.g., custody evaluators) may play critical roles",
        "Consider the impact of litigation on children and family relationships",
        "Trial preparation is intensive and typically requires legal assistance"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario requires a Trial Management Conference before trial dates are assigned. Trial Record must be prepared per Rule 23.",
          resources: ["https://www.ontario.ca/page/guide-procedures-family-court"]
        },
        quebec: {
          notes: "Quebec requires a Pre-Trial Conference to plan trial logistics. Trial readiness certificates must be filed.",
          resources: ["https://www.justice.gouv.qc.ca/en/couples-and-families/separation-and-divorce/the-trial-process-step-by-step/trial"]
        },
        britishColumbia: {
          notes: "BC requires Trial Management Conferences in both Provincial and Supreme Court. Trial Briefs must follow specific requirements.",
          resources: ["https://www.bccourts.ca/supreme_court/practice_and_procedure/family_practice_directions.aspx"]
        },
        alberta: {
          notes: "Alberta requires Pre-Trial Conferences before trial dates are assigned. Special chambers applications may resolve some matters without full trial.",
          resources: ["https://www.albertacourts.ca/kb/areas-of-law/family/going-to-court"]
        }
      }
    },
    {
      id: "family-7",
      title: "7. Judgment and Enforcement",
      description: "The court's final decision and processes to ensure compliance.",
      details: "After trial, the judge issues a decision resolving all issues. The decision is formalized in orders, which can be enforced if not followed.",
      timeline: {
        minDays: 30,
        maxDays: 90,
        description: "Judgment: 1-3 months after trial; Enforcement: ongoing as needed"
      },
      documents: [
        {
          name: "Final Order",
          description: "Formal court order setting out the judge's decision",
          required: true
        },
        {
          name: "Reasons for Judgment",
          description: "Judge's explanation of the decision",
          required: false
        },
        {
          name: "Divorce Certificate",
          description: "Official document confirming divorce",
          required: false
        },
        {
          name: "Support Deduction Order",
          description: "Order for automatic deduction of support payments",
          required: false
        }
      ],
      considerations: [
        "Appeal periods are typically 30 days from judgment",
        "Support enforcement agencies exist in each province to assist with collection",
        "Orders may be varied if there is a material change in circumstances",
        "International enforcement mechanisms exist for support and some custody orders"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario's Family Responsibility Office enforces support orders. The Central Divorce Registry processes divorce certificates after 31-day appeal period.",
          resources: ["https://www.ontario.ca/page/family-support-payments"]
        },
        quebec: {
          notes: "Quebec's Support Payment Collection Program (Revenu Québec) enforces support orders. Special rules apply for civil unions in addition to marriage.",
          resources: ["https://www.revenuquebec.ca/en/support-payments/"]
        },
        britishColumbia: {
          notes: "BC's Family Maintenance Enforcement Program enforces support orders. The Divorce Registry issues certificates after appeal period.",
          resources: ["https://www.fmep.gov.bc.ca/"]
        },
        alberta: {
          notes: "Alberta's Maintenance Enforcement Program enforces support orders. Central Registry of Divorce Proceedings issues divorce certificates.",
          resources: ["https://www.alberta.ca/maintenance-enforcement-program.aspx"]
        }
      }
    }
  ],
  faq: [
    {
      question: "What is the difference between divorce and separation?",
      answer: "Separation is the act of living apart with the intention of ending the relationship, with no formal legal process required. Divorce is the legal dissolution of marriage, requiring a court application and order. In Canada, you must be separated for at least one year before finalizing a divorce, though you can resolve issues like support and parenting during separation."
    },
    {
      question: "How is child custody determined in Canada?",
      answer: "Canadian courts determine custody based on the 'best interests of the child' standard, considering factors like stability, parenting ability, existing relationships, sibling bonds, and each parent's willingness to facilitate the child's relationship with the other parent. Recent language changes in the Divorce Act focus on 'parenting time' and 'decision-making responsibility' rather than 'custody'."
    },
    {
      question: "How is child support calculated?",
      answer: "Child support in Canada is primarily calculated using the Federal Child Support Guidelines, which base support on the payor's income, number of children, and province of residence. Additional 'special or extraordinary expenses' (like childcare, education, and activities) are typically shared proportionally to income. Provincial variations may apply."
    },
    {
      question: "What property is divided during a divorce?",
      answer: "Generally, family property (assets acquired during marriage) is divided equally, though approaches vary by province. Excluded property may include pre-marriage assets, inheritances, and gifts, depending on provincial laws. The matrimonial home often receives special treatment. Common-law relationships have different rules than marriages in most provinces."
    },
    {
      question: "Can court orders be changed after they're made?",
      answer: "Yes, court orders for child support, spousal support, and parenting arrangements can be varied if there's a 'material change in circumstances' that wasn't anticipated when the original order was made. Examples include significant income changes, relocation, or shifts in children's needs. Property divisions are generally final unless fraud or non-disclosure occurred."
    },
    {
      question: "Do I need a lawyer for family court?",
      answer: "While not mandatory, legal representation is highly recommended for family court matters due to their complexity and significant long-term implications. If you cannot afford a lawyer, options include legal aid (income-based eligibility), duty counsel (limited day-of-court assistance), unbundled legal services, and legal clinics. Self-help resources are available through provincial court websites."
    }
  ]
};