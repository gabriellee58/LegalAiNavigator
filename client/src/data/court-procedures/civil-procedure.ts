import { CourtProcedureData } from './types';

const civilProcedureData: CourtProcedureData = {
  id: 'civil-procedure',
  slug: 'civil-procedure',
  title: 'Civil Court Procedure',
  description: 'A comprehensive guide to navigating civil litigation in Canadian courts.',
  category: 'Civil',
  overview: {
    summary: 'Civil procedure in Canada governs how non-criminal disputes between parties are resolved through the court system. These procedures establish the rules and standards for bringing a lawsuit, gathering evidence, conducting trials, and appealing decisions.',
    applicability: [
      'Contract disputes',
      'Property damage claims',
      'Personal injury cases',
      'Professional negligence claims',
      'Debt collection matters'
    ],
    jurisdiction: 'Provincial and territorial superior courts across Canada',
    timeframe: 'Typically 1-3 years from filing to trial',
    costRange: 'CAD $10,000 - $100,000+ depending on complexity and duration',
    resources: [
      {
        name: 'Rules of Civil Procedure (Ontario)',
        url: 'https://www.ontario.ca/laws/regulation/900194'
      },
      {
        name: 'Supreme Court Civil Rules (British Columbia)',
        url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/168_2009_00'
      }
    ]
  },
  steps: [
    {
      id: 'pre-action',
      title: 'Pre-Action Considerations',
      description: 'Steps to take before initiating a lawsuit',
      details: 'Before filing a lawsuit, parties should explore alternative dispute resolution methods such as negotiation or mediation, gather relevant evidence, assess the strength of their case, consider limitation periods, and determine the appropriate court and jurisdiction for filing.',
      timeline: {
        minDays: 30,
        maxDays: 90,
        description: 'Time needed to gather evidence, attempt resolution, and consult with legal counsel'
      },
      tips: [
        'Send a demand letter outlining your claim and proposed resolution',
        'Research limitation periods that may apply to your claim',
        'Consult with a lawyer to assess the merits of your case'
      ]
    },
    {
      id: 'pleadings',
      title: 'Pleadings Stage',
      description: 'Filing and responding to the initial court documents',
      details: 'The pleadings stage begins when the plaintiff files a Statement of Claim (or Notice of Civil Claim in BC) which outlines the basis of their case, the relief sought, and the material facts. The defendant then files a Statement of Defence within the prescribed time limit (usually 20-30 days).',
      requirements: [
        'Statement of Claim/Notice of Civil Claim',
        'Statement of Defence',
        'Reply (if applicable)'
      ],
      forms: [
        {
          id: 'statement-of-claim',
          name: 'Statement of Claim',
          description: 'The document that initiates a lawsuit',
          url: 'https://www.ontariocourtforms.on.ca/forms/civil/'
        }
      ],
      timeline: {
        minDays: 30,
        maxDays: 60,
        description: 'Time from filing claim to receiving defence'
      }
    },
    {
      id: 'discovery',
      title: 'Discovery Process',
      description: 'Exchange of information and evidence between parties',
      details: 'The discovery process involves the exchange of relevant documents, written questions (interrogatories), and oral examinations under oath (examinations for discovery/depositions). This allows parties to discover facts, narrow issues, and assess the strength of the opposing case.',
      timeline: {
        minDays: 90,
        maxDays: 365,
        description: 'Can vary greatly depending on case complexity and cooperation between parties'
      }
    },
    {
      id: 'pre-trial',
      title: 'Pre-Trial Procedures',
      description: 'Final preparations before trial',
      details: 'Pre-trial procedures include mediation (mandatory in some jurisdictions), pre-trial conferences with a judge, and the exchange of expert reports. These steps aim to narrow issues, encourage settlement, and ensure trial readiness.',
      timeline: {
        minDays: 60,
        maxDays: 180,
        description: 'Typically occurs 2-6 months before trial date'
      }
    },
    {
      id: 'trial',
      title: 'Trial',
      description: 'Formal court hearing to decide the dispute',
      details: 'The trial involves opening statements, presentation of evidence, examination and cross-examination of witnesses, closing arguments, and finally the judge\'s decision. Most civil trials are heard by a judge alone, though jury trials are possible in some circumstances.',
      timeline: {
        minDays: 1,
        maxDays: 60,
        description: 'From one day to several weeks depending on complexity'
      }
    },
    {
      id: 'judgment',
      title: 'Judgment and Appeals',
      description: 'Decision and potential review by higher courts',
      details: 'After trial, the judge renders a decision with reasons. The prevailing party typically receives a cost award. Either party may appeal the decision to a higher court if there are grounds to believe the trial judge made an error of law.',
      timeline: {
        minDays: 30,
        maxDays: 730,
        description: 'Appeals can take 1-2 years to resolve'
      }
    },
    {
      id: 'enforcement',
      title: 'Enforcement of Judgment',
      description: 'Collecting on a successful judgment',
      details: 'If the losing party doesn\'t voluntarily comply with the judgment, the successful party can use various enforcement mechanisms including garnishment of wages or bank accounts, liens on property, seizure and sale of assets, or examination in aid of execution.',
      timeline: {
        minDays: 30,
        maxDays: 365,
        description: 'Can be quick if the debtor has accessible assets, or lengthy if enforcement is challenging'
      }
    }
  ],
  requiredDocuments: [
    {
      name: 'Statement of Claim',
      description: 'The initiating document that sets out the plaintiff\'s claim and the relief sought.',
      source: 'Prepared by plaintiff\'s counsel'
    },
    {
      name: 'Statement of Defence',
      description: 'The defendant\'s response to the claim, setting out their version of events and any defences.',
      source: 'Prepared by defendant\'s counsel'
    },
    {
      name: 'Affidavit of Documents',
      description: 'A sworn statement listing all relevant documents in a party\'s possession or control.',
      source: 'Prepared by each party\'s legal team'
    },
    {
      name: 'Expert Reports',
      description: 'Written opinions from qualified experts on technical or specialized matters relevant to the case.',
      source: 'Commissioned from independent experts'
    },
    {
      name: 'Pre-Trial Conference Memorandum',
      description: 'A document summarizing the issues, evidence, and positions of each party before trial.',
      source: 'Prepared by each party\'s legal team'
    }
  ],
  faqs: [
    {
      question: 'How long do I have to file a civil lawsuit?',
      answer: 'Limitation periods vary by province and type of claim. In most provinces, the basic limitation period is 2 years from the date the claim was discovered, but some claims have shorter periods.'
    },
    {
      question: 'What\'s the difference between Small Claims Court and Superior Court?',
      answer: 'Small Claims Court handles cases with lower monetary values (typically up to $25,000-$50,000 depending on the province) with simplified procedures. Superior Court handles claims of any value and more complex matters.'
    },
    {
      question: 'Can I represent myself in civil court?',
      answer: 'Yes, you can represent yourself (appear as a "self-represented litigant"), but civil procedure is complex. If your case is significant, consulting with a lawyer is recommended, even if only for limited assistance.'
    },
    {
      question: 'What costs might I have to pay if I lose my case?',
      answer: 'The unsuccessful party typically pays a portion of the successful party\'s legal costs (usually 30-60% of actual costs). This is in addition to your own legal fees and disbursements.'
    },
    {
      question: 'Is alternative dispute resolution mandatory?',
      answer: 'In some provinces, certain types of cases require mandatory mediation before trial. Even when not mandatory, courts strongly encourage parties to attempt settlement through negotiation, mediation, or arbitration.'
    }
  ]
};

export default civilProcedureData;