import { CourtProcedureData } from "./types";

export const smallClaimsData: CourtProcedureData = {
  id: "small-claims",
  title: "Small Claims Court",
  description: "The simplified process for resolving minor civil disputes with limited monetary value",
  icon: "coins",
  overview: {
    summary: "Small Claims Court provides a streamlined, accessible process for resolving civil disputes involving claims below a specific monetary threshold, which varies by province.",
    purpose: "To provide an efficient, less formal, and less expensive forum for resolving disputes involving relatively modest sums without requiring legal representation.",
    applicability: "Applied to a wide range of civil disputes including unpaid debts, property damage, consumer issues, minor contract disputes, and landlord-tenant matters.",
    mainFeatures: [
      "Simplified procedures with less formal rules of evidence and procedure",
      "Lower filing fees than superior courts",
      "Designed to be navigable without a lawyer",
      "Limited monetary jurisdiction (varies by province)",
      "Expedited timelines compared to regular civil courts"
    ],
  },
  steps: [
    {
      id: "small-claims-1",
      title: "1. Pre-Filing Considerations",
      description: "Evaluating whether Small Claims Court is appropriate for your dispute.",
      details: "Before filing, evaluate if your claim falls within the monetary and subject matter jurisdiction of Small Claims Court, and consider demand letters or negotiation.",
      timeframe: "1-4 weeks",
      documents: [
        {
          name: "Demand Letter",
          description: "Written request for payment or remedy before legal action",
          required: false
        },
        {
          name: "Evidence Collection",
          description: "Gathering contracts, receipts, photos, correspondence, etc.",
          required: true
        },
        {
          name: "Settlement Offer",
          description: "Written proposal to resolve the dispute without court",
          required: false
        }
      ],
      considerations: [
        "Check monetary jurisdiction limits (varies by province)",
        "Consider whether your claim is appropriate for Small Claims Court",
        "Assess if the defendant has the ability to pay if you win",
        "Some matters are excluded from Small Claims jurisdiction"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario Small Claims Court handles claims up to $35,000. Some matters, like family law and certain landlord-tenant issues, cannot be heard in Small Claims Court.",
          resources: ["https://www.ontario.ca/page/suing-someone-small-claims-court"]
        },
        quebec: {
          notes: "Quebec Small Claims Division handles civil cases up to $15,000 between individuals or an individual and a legal person (business/organization).",
          resources: ["https://www.justice.gouv.qc.ca/en/your-disputes/small-claims"]
        },
        britishColumbia: {
          notes: "BC Civil Resolution Tribunal handles claims up to $5,000, while Provincial Court (Small Claims) handles claims between $5,001 and $35,000.",
          resources: ["https://www.provincialcourt.bc.ca/types-of-cases/small-claims-matters"]
        },
        alberta: {
          notes: "Alberta Provincial Court Civil handles claims up to $50,000, with a simplified procedure for claims under $7,500.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/civil"]
        }
      }
    },
    {
      id: "small-claims-2",
      title: "2. Filing a Claim",
      description: "Preparing and submitting the formal court documents to initiate your case.",
      details: "To start a case, you must complete the appropriate claim form (typically called a Plaintiff's Claim or Statement of Claim), pay the filing fee, and file with the court.",
      timeframe: "1-2 hours to prepare; 1-5 days to process",
      documents: [
        {
          name: "Plaintiff's Claim Form",
          description: "Official court form detailing your claim and the remedy sought",
          required: true
        },
        {
          name: "Supporting Documents",
          description: "Copies of evidence supporting your claim",
          required: true
        },
        {
          name: "Fee Waiver Application",
          description: "Request to reduce or waive filing fees based on financial need",
          required: false
        }
      ],
      considerations: [
        "Claim must include specific monetary amount and factual basis",
        "Filing fees vary by claim amount and province",
        "Limitation periods (typically 2 years) must be observed",
        "Choose the correct courthouse (usually where defendant lives/works or incident occurred)"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario uses Form 7A (Plaintiff's Claim). Filing fees range from $102-$258 depending on claim amount. Claims can be filed online through Small Claims Court E-Filing Service.",
          resources: ["https://www.ontario.ca/page/file-small-claims-online"]
        },
        quebec: {
          notes: "Quebec uses the Small Claims Division Application Form. Filing fees range from $108-$324 depending on claim amount. The court clerk can assist with form preparation.",
          resources: ["https://www.justice.gouv.qc.ca/en/your-disputes/small-claims/filing-an-application"]
        },
        britishColumbia: {
          notes: "BC uses the Notice of Claim form for Provincial Court Small Claims. Filing fees range from $100-$200. Claims under $5,000 must start with the Civil Resolution Tribunal.",
          resources: ["https://www2.gov.bc.ca/gov/content/justice/courthouse-services/small-claims/how-to-start"]
        },
        alberta: {
          notes: "Alberta uses the Civil Claim form. Filing fees range from $100-$300 depending on claim amount. Claims can be filed at any Provincial Court location.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/civil/forms"]
        }
      }
    },
    {
      id: "small-claims-3",
      title: "3. Serving the Defendant",
      description: "Legally delivering claim documents to the defendant.",
      details: "After filing, you must deliver a copy of the claim and any supporting documents to each defendant according to specific service rules.",
      timeframe: "1-30 days",
      documents: [
        {
          name: "Affidavit of Service",
          description: "Sworn statement confirming when and how documents were served",
          required: true
        },
        {
          name: "Certificate of Service",
          description: "Alternative to affidavit in some jurisdictions",
          required: false
        },
        {
          name: "Motion for Alternative Service",
          description: "Request to serve documents by alternative means if regular service is impractical",
          required: false
        }
      ],
      considerations: [
        "Personal service is often required (handing documents directly to defendant)",
        "Time limits apply for completing service (typically 6 months from filing)",
        "Service on corporations, partnerships, and minors has special requirements",
        "International service has additional complexities"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario requires personal service by anyone 18+ other than the plaintiff. Service must be proven with an Affidavit of Service (Form 8A).",
          resources: ["https://www.ontario.ca/page/guide-serving-documents-small-claims-court"]
        },
        quebec: {
          notes: "Quebec Small Claims Division uniquely handles service for plaintiffs. The court clerk sends documents by registered mail.",
          resources: ["https://www.justice.gouv.qc.ca/en/your-disputes/small-claims/filing-an-application"]
        },
        britishColumbia: {
          notes: "BC requires personal service for individuals. Corporate service can be done at a registered office. Certificate of Service (Form 4) must be filed.",
          resources: ["https://www2.gov.bc.ca/gov/content/justice/courthouse-services/small-claims/how-to-start/serving-documents"]
        },
        alberta: {
          notes: "Alberta permits personal service by anyone 18+. Corporations may be served at registered office. Affidavit of Service must be filed.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/civil/service-options"]
        }
      }
    },
    {
      id: "small-claims-4",
      title: "4. Defendant's Response",
      description: "The defendant's formal reply to the claim.",
      details: "The defendant must respond within a specified timeframe, either disputing the claim, admitting it, or proposing a payment plan.",
      timeframe: "Typically 20-30 days after service",
      documents: [
        {
          name: "Defence Form",
          description: "Defendant's formal response disputing all or part of the claim",
          required: false
        },
        {
          name: "Admission of Liability",
          description: "Defendant's acknowledgment of owing money with proposed payment terms",
          required: false
        },
        {
          name: "Counterclaim",
          description: "Defendant's claim against the plaintiff arising from the same matter",
          required: false
        }
      ],
      considerations: [
        "Defendant must respond within strict timeframes or risk default judgment",
        "Response must address each allegation in the claim",
        "Filing fees may apply for counterclaims",
        "Settlement can occur at any time"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario defendants must file a Defence (Form 9A) within 20 days of service. Counterclaims, crossclaims, and third party claims are permitted.",
          resources: ["https://www.ontario.ca/page/being-sued-small-claims-court"]
        },
        quebec: {
          notes: "Quebec defendants receive summons to appear at a specific date. There is no formal written defence before the hearing.",
          resources: ["https://www.justice.gouv.qc.ca/en/your-disputes/small-claims/being-the-defendant"]
        },
        britishColumbia: {
          notes: "BC defendants must file a Reply (Form 2) within 14 days if served in BC, longer if served elsewhere. Counterclaims must be filed with the Reply.",
          resources: ["https://www2.gov.bc.ca/gov/content/justice/courthouse-services/small-claims/how-to-reply"]
        },
        alberta: {
          notes: "Alberta defendants must file a Dispute Note within 20 days. Counterclaims and third party claims are permitted.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/civil/claims-and-disputes"]
        }
      }
    },
    {
      id: "small-claims-5",
      title: "5. Pre-Trial Procedures",
      description: "Settlement conferences, mediation, and trial preparation steps.",
      details: "Most small claims jurisdictions have mandatory settlement discussions or mediation before trial to encourage resolution.",
      timeframe: "1-3 months",
      documents: [
        {
          name: "Settlement Conference Brief",
          description: "Summary of positions, issues, and evidence for settlement discussions",
          required: false
        },
        {
          name: "List of Witnesses",
          description: "Identification of people who will testify at trial",
          required: false
        },
        {
          name: "Disclosure of Documents",
          description: "Sharing of all relevant documents with the other party",
          required: true
        }
      ],
      considerations: [
        "Settlement conferences are typically mandatory",
        "Be prepared to discuss settlement options",
        "Bring all relevant documents to pre-trial proceedings",
        "Consider expert reports or assessments if needed"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario requires mandatory settlement conferences before trial dates are set. A judge presides but cannot impose a settlement.",
          resources: ["https://www.ontario.ca/page/what-expect-settlement-conference"]
        },
        quebec: {
          notes: "Quebec Small Claims Division judges may attempt conciliation (settlement discussion) immediately before the hearing.",
          resources: ["https://www.justice.gouv.qc.ca/en/your-disputes/small-claims/preparing-for-trial"]
        },
        britishColumbia: {
          notes: "BC requires a settlement conference with a judge before trial. Mediation is also available through the Notice to Mediate process.",
          resources: ["https://www2.gov.bc.ca/gov/content/justice/courthouse-services/small-claims/how-to-guide/settlement-conference"]
        },
        alberta: {
          notes: "Alberta requires a Dispute Resolution Conference before trial, which may be a mediation, judicial dispute resolution, or pre-trial conference.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/civil/mediation"]
        }
      }
    },
    {
      id: "small-claims-6",
      title: "6. Trial",
      description: "The formal hearing where evidence is presented and a decision is made.",
      details: "If settlement efforts fail, the case proceeds to trial where each party presents evidence and arguments before a judge or adjudicator.",
      timeframe: "Typically 1-3 hours; complex cases may take a full day",
      documents: [
        {
          name: "Trial Evidence",
          description: "Documents, photos, videos to be presented at trial",
          required: true
        },
        {
          name: "Witness Summons",
          description: "Court order requiring witness attendance",
          required: false
        },
        {
          name: "Written Authorities",
          description: "Relevant laws or precedents supporting your position",
          required: false
        }
      ],
      considerations: [
        "Prepare a clear, concise presentation of your case",
        "Organize documents in chronological order",
        "Prepare questions for witnesses in advance",
        "Dress appropriately and be respectful to court personnel"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario Small Claims trials are heard by deputy judges (typically practicing lawyers). Formal rules of evidence are somewhat relaxed but still apply.",
          resources: ["https://www.ontario.ca/page/what-expect-day-trial"]
        },
        quebec: {
          notes: "Quebec Small Claims trials are informal with the judge actively questioning parties. No lawyers are permitted to represent parties in hearings.",
          resources: ["https://www.justice.gouv.qc.ca/en/your-disputes/small-claims/the-hearing"]
        },
        britishColumbia: {
          notes: "BC Small Claims trials are heard by Provincial Court judges in a simplified but formal process. Each party presents evidence and witnesses.",
          resources: ["https://www2.gov.bc.ca/gov/content/justice/courthouse-services/small-claims/how-to-guide/trial"]
        },
        alberta: {
          notes: "Alberta Civil Claims trials are heard by Provincial Court judges. The process is less formal than higher courts but follows basic rules of evidence.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/civil/trial"]
        }
      }
    },
    {
      id: "small-claims-7",
      title: "7. Judgment and Enforcement",
      description: "Receiving the court's decision and collecting on a successful claim.",
      details: "After trial, the judge issues a decision. If successful, you may need to take additional steps to collect the judgment amount.",
      timeframe: "Judgment: immediately to 3 months; Enforcement: weeks to years",
      documents: [
        {
          name: "Judgment Order",
          description: "Official court decision and order for payment",
          required: true
        },
        {
          name: "Writ of Seizure and Sale",
          description: "Order allowing seizure of debtor's property",
          required: false
        },
        {
          name: "Garnishment Order",
          description: "Order to redirect debtor's income or funds to creditor",
          required: false
        },
        {
          name: "Debtor Examination",
          description: "Court-ordered questioning about debtor's assets and income",
          required: false
        }
      ],
      considerations: [
        "Winning a judgment doesn't guarantee payment",
        "Enforcement requires additional steps and fees",
        "Information about debtor's assets is crucial for effective enforcement",
        "Appeals must be filed within strict timeframes (usually 30 days)"
      ],
      provinceSpecific: {
        ontario: {
          notes: "Ontario judgments can be enforced through writs of seizure and sale, garnishment, or debtor examinations. Appeals go to Divisional Court within 30 days.",
          resources: ["https://www.ontario.ca/page/after-judgment-guide-getting-results-small-claims-court"]
        },
        quebec: {
          notes: "Quebec Small Claims judgments are enforceable by bailiffs. The court can also order wage garnishment or seizure of property.",
          resources: ["https://www.justice.gouv.qc.ca/en/your-disputes/small-claims/after-the-judgment"]
        },
        britishColumbia: {
          notes: "BC offers various enforcement tools including payment hearing, garnishing orders, and payment schedules. Appeals go to Supreme Court within 40 days.",
          resources: ["https://www2.gov.bc.ca/gov/content/justice/courthouse-services/small-claims/how-to-guide/getting-results"]
        },
        alberta: {
          notes: "Alberta judgments can be enforced through various methods including garnishment, seizure of property, and financial examinations.",
          resources: ["https://www.albertacourts.ca/pc/areas-of-law/civil/enforcement"]
        }
      }
    }
  ],
  faq: [
    {
      question: "Do I need a lawyer for Small Claims Court?",
      answer: "No, Small Claims Court is designed to be accessible without legal representation. Many people successfully represent themselves. However, you may benefit from consulting a lawyer for initial advice or in more complex cases. Some provinces (like Quebec) actually prohibit lawyer representation in Small Claims hearings."
    },
    {
      question: "What types of disputes can be heard in Small Claims Court?",
      answer: "Small Claims Court handles most civil monetary disputes under the jurisdictional limit, including unpaid debts, property damage, consumer complaints, breach of contract, and some landlord-tenant issues. It cannot handle family matters, land ownership disputes, wills and estates, or injunctions. Jurisdictions vary slightly by province."
    },
    {
      question: "How much does it cost to file a Small Claims case?",
      answer: "Filing fees typically range from $100 to $300, depending on the claim amount and province. Additional costs may include service fees ($30-100), fees for filing motions or enforcement documents, and potentially expert witness fees. Fee waiver programs exist for those with financial need in most provinces."
    },
    {
      question: "How long does a Small Claims case take?",
      answer: "The timeframe varies by province and case complexity, but typically ranges from 6-12 months from filing to trial. Settlement conferences usually occur 3-6 months after filing. Simple or uncontested matters may resolve more quickly. Delays can occur in busy court districts."
    },
    {
      question: "What if the defendant doesn't respond to my claim?",
      answer: "If the defendant fails to respond within the required timeframe (typically 20-30 days), you can request a default judgment from the court. This process varies by province but generally requires filing an affidavit confirming proper service and lack of response, followed by a request for judgment."
    },
    {
      question: "What if I win but the defendant doesn't pay?",
      answer: "Winning a judgment doesn't automatically guarantee payment. If the defendant doesn't voluntarily pay, you must take enforcement steps, which may include garnishment of wages or bank accounts, seizure and sale of property, or examination of the debtor about their assets. Each enforcement method requires additional court filings and fees."
    }
  ]
};