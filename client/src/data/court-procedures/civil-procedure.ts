import { CourtProcedureData } from './types';

const civilProcedureData: CourtProcedureData = {
  id: 'civil-procedure',
  slug: 'civil-procedure',
  title: 'Civil Court Procedure',
  description: 'A guide to understanding civil litigation procedure in Canadian courts.',
  category: 'Civil',
  overview: {
    summary: 'Civil procedure in Canada governs disputes between individual parties, companies, or organizations. It provides a structured process for resolving conflicts through the court system when parties cannot reach an agreement on their own.',
    applicability: [
      'Breach of contract disputes',
      'Personal injury claims',
      'Property disputes',
      'Debt collection',
      'Professional negligence claims',
      'Employment disputes'
    ],
    jurisdiction: 'Provincial/territorial superior courts and small claims courts across Canada',
    timeframe: 'From several months to 3+ years depending on complexity',
    costRange: 'Small claims: CAD $1,000-$15,000; Superior court: CAD $15,000-$100,000+',
    resources: [
      {
        name: 'Rules of Civil Procedure',
        url: 'https://www.canlii.org/en/on/laws/regu/rro-1990-reg-194/latest/rro-1990-reg-194.html'
      },
      {
        name: 'Self-Help Guide for Civil Claims',
        url: 'https://www.justice.gc.ca/eng/rp-pr/csj-sjc/just/11160/'
      }
    ]
  },
  steps: [
    {
      id: 'pre-filing',
      title: 'Pre-Filing Considerations',
      description: 'Evaluating your case before starting legal proceedings',
      details: 'Before filing a civil claim, evaluate the legal and factual basis of your case, consider alternative dispute resolution options, and ensure you\'re within the limitation period (typically 2 years for most claims).',
      timeline: {
        minDays: 1,
        maxDays: 90,
        description: 'Varies based on case complexity and urgency'
      },
      tips: [
        'Consider sending a demand letter before filing a claim',
        'Consult with a lawyer to evaluate the merits of your case',
        'Gather all relevant documents and evidence'
      ]
    },
    {
      id: 'pleadings',
      title: 'Pleadings',
      description: 'Filing initial court documents to start the case',
      details: 'The pleadings stage begins with the plaintiff filing a Statement of Claim or Notice of Civil Claim (varies by province) outlining the facts, legal basis, and remedy sought. The defendant must file a Statement of Defence within a specified time (typically 20-30 days).',
      timeline: {
        minDays: 20,
        maxDays: 60,
        description: 'Approximately 1-2 months for initial pleadings exchange'
      },
      forms: [
        {
          id: 'statement-of-claim',
          name: 'Statement of Claim',
          description: 'Document that initiates a lawsuit, outlining the plaintiff\'s claims',
          url: 'https://www.ontariocourts.ca/scj/civil/'
        },
        {
          id: 'statement-of-defence',
          name: 'Statement of Defence',
          description: 'Document responding to the claims made against the defendant',
          url: 'https://www.ontariocourts.ca/scj/civil/'
        }
      ]
    },
    {
      id: 'discovery',
      title: 'Discovery',
      description: 'Exchange of information and evidence between parties',
      details: 'The discovery phase includes document disclosure (affidavit of documents), written discovery (interrogatories), and examinations for discovery (depositions). Parties must disclose all relevant documents and information, even if unfavorable to their case.',
      timeline: {
        minDays: 60,
        maxDays: 365,
        description: 'Typically 3-12 months depending on complexity'
      },
      forms: [
        {
          id: 'affidavit-of-documents',
          name: 'Affidavit of Documents',
          description: 'Sworn statement listing all relevant documents in a party\'s possession',
          url: 'https://www.ontariocourts.ca/scj/civil/'
        }
      ]
    },
    {
      id: 'mediation',
      title: 'Mediation',
      description: 'Attempt to resolve the dispute with a neutral third party',
      details: 'In many Canadian jurisdictions, mandatory mediation is required before proceeding to trial. A neutral mediator helps parties negotiate a settlement. While not binding, agreements reached can be formalized into court orders.',
      timeline: {
        minDays: 1,
        maxDays: 180,
        description: 'Usually scheduled within 6 months of pleadings completion'
      },
      tips: [
        'Prepare a mediation brief outlining your position',
        'Consider your BATNA (Best Alternative To a Negotiated Agreement)',
        'Be prepared to compromise'
      ]
    },
    {
      id: 'pre-trial',
      title: 'Pre-Trial Conference',
      description: 'Meeting with a judge to prepare for trial',
      details: 'The pre-trial conference is a meeting with a judge to discuss settlement possibilities, narrow issues for trial, address procedural matters, and estimate trial length. Parties must prepare a pre-trial conference brief summarizing their position.',
      timeline: {
        minDays: 1,
        maxDays: 1,
        description: 'Usually a single day, scheduled several months before trial'
      },
      forms: [
        {
          id: 'pre-trial-conference-brief',
          name: 'Pre-Trial Conference Brief',
          description: 'Document summarizing the case and issues for the pre-trial judge',
          url: 'https://www.ontariocourts.ca/scj/civil/'
        }
      ]
    },
    {
      id: 'trial-preparation',
      title: 'Trial Preparation',
      description: 'Final preparations before the court hearing',
      details: 'Trial preparation includes finalizing witness lists, preparing witnesses, organizing exhibits, researching legal issues, preparing opening and closing statements, and finalizing a trial brief or trial record.',
      timeline: {
        minDays: 30,
        maxDays: 90,
        description: '1-3 months before trial date'
      },
      forms: [
        {
          id: 'trial-record',
          name: 'Trial Record',
          description: 'Collection of pleadings and other key documents for the trial',
          url: 'https://www.ontariocourts.ca/scj/civil/'
        }
      ]
    },
    {
      id: 'trial',
      title: 'Trial',
      description: 'Formal court hearing to determine the case outcome',
      details: 'At trial, each party presents evidence through witnesses and documents. The trial follows a structured format: opening statements, plaintiff\'s case, defendant\'s case, and closing arguments. The judge (or jury in some cases) renders a decision based on the evidence presented.',
      timeline: {
        minDays: 1,
        maxDays: 30,
        description: 'From half a day for simple matters to weeks for complex cases'
      },
      tips: [
        'Be professional and respectful in court',
        'Speak clearly and directly when called as a witness',
        'Address the judge as "Your Honour"'
      ]
    },
    {
      id: 'judgment',
      title: 'Judgment',
      description: 'Court\'s decision on the case',
      details: 'The judgment is the court\'s decision on the case, which may be delivered immediately after trial or reserved for a later date. The judgment will determine liability and any damages or other remedies awarded.',
      timeline: {
        minDays: 1,
        maxDays: 180,
        description: 'Immediate to 6 months after trial completion'
      }
    },
    {
      id: 'costs',
      title: 'Costs Assessment',
      description: 'Determining who pays the legal costs',
      details: 'In Canada, the losing party typically pays a portion of the winning party\'s legal costs. The court assesses costs based on factors such as success in the litigation, reasonableness of costs, and conduct of the parties.',
      timeline: {
        minDays: 30,
        maxDays: 90,
        description: '1-3 months after judgment'
      },
      forms: [
        {
          id: 'bill-of-costs',
          name: 'Bill of Costs',
          description: 'Itemized statement of legal costs incurred by a party',
          url: 'https://www.ontariocourts.ca/scj/civil/'
        }
      ]
    },
    {
      id: 'enforcement',
      title: 'Judgment Enforcement',
      description: 'Collecting on the judgment if the losing party doesn\'t pay',
      details: 'If the losing party doesn\'t voluntarily comply with the judgment, the winning party can use enforcement mechanisms such as garnishment of wages or bank accounts, liens on property, seizure and sale of assets, or examination in aid of execution.',
      timeline: {
        minDays: 30,
        maxDays: 730,
        description: 'From 1 month to several years depending on complexity'
      },
      forms: [
        {
          id: 'writ-of-seizure',
          name: 'Writ of Seizure and Sale',
          description: 'Court order allowing the seizure and sale of the debtor\'s property',
          url: 'https://www.ontariocourts.ca/scj/civil/'
        }
      ]
    },
    {
      id: 'appeal',
      title: 'Appeals',
      description: 'Challenging the judgment in a higher court',
      details: 'If there are grounds for appeal (typically errors of law or procedure), a party may appeal to a higher court. Appeals must be filed within strict time limits (usually 30 days from judgment) and are not a re-trial of the case but a review of the lower court\'s decision.',
      timeline: {
        minDays: 30,
        maxDays: 730,
        description: 'Notice of appeal usually within 30 days; appeal process 1-2 years'
      },
      forms: [
        {
          id: 'notice-of-appeal',
          name: 'Notice of Appeal',
          description: 'Document initiating an appeal, outlining grounds for appeal',
          url: 'https://www.ontariocourts.ca/coa/en/'
        }
      ]
    }
  ],
  requiredDocuments: [
    {
      name: 'Statement of Claim/Notice of Civil Claim',
      description: 'The document that initiates a lawsuit, setting out the facts, legal basis, and remedy sought by the plaintiff.',
      source: 'Prepared by plaintiff or plaintiff\'s lawyer'
    },
    {
      name: 'Statement of Defence',
      description: 'The defendant\'s response to the Statement of Claim, addressing each allegation and stating any defences.',
      source: 'Prepared by defendant or defendant\'s lawyer'
    },
    {
      name: 'Affidavit of Documents',
      description: 'A sworn statement listing all documents in a party\'s possession relevant to the issues in the litigation.',
      source: 'Both parties must prepare'
    },
    {
      name: 'Expert Reports',
      description: 'Written opinions from qualified experts on technical or specialized matters relevant to the case.',
      source: 'Commissioned by either party'
    },
    {
      name: 'Trial Brief',
      description: 'A document summarizing the facts, issues, and legal arguments for the trial judge.',
      source: 'Prepared by each party\'s lawyer'
    }
  ],
  faqs: [
    {
      question: 'What is the difference between small claims court and superior court?',
      answer: 'Small claims court handles cases with lower monetary values (limits vary by province, typically $5,000-$50,000) with simplified procedures, while superior courts handle cases of higher monetary value and more complex legal issues. Small claims courts are designed to be more accessible for self-represented litigants.'
    },
    {
      question: 'How long does a civil lawsuit typically take in Canada?',
      answer: 'The duration varies significantly based on complexity, jurisdiction, and court backlog. Simple small claims matters might be resolved in 6-12 months, while complex superior court cases can take 2-5 years from filing to judgment, especially if there are appeals.'
    },
    {
      question: 'What are the costs involved in civil litigation?',
      answer: 'Costs include court filing fees, lawyer fees, expert witness fees, copying and document preparation, and potentially a portion of the opposing party\'s costs if you lose. Lawyer fees often represent the largest expense, typically ranging from $250-$600 per hour depending on experience and location.'
    },
    {
      question: 'What is the limitation period for filing a civil claim?',
      answer: 'Most civil claims in Canada have a limitation period of 2 years from when the claim was discovered. Some claims have different periods (e.g., 6 years for some contracts in certain provinces). Once the limitation period expires, you may lose your right to sue.'
    },
    {
      question: 'Can I represent myself in a civil case?',
      answer: 'Yes, you can represent yourself (called being a "self-represented litigant") in any civil proceeding. However, the complexity of civil procedure and rules of evidence makes self-representation challenging in superior court. Consider consulting with a lawyer even if you plan to represent yourself.'
    }
  ]
};

export default civilProcedureData;