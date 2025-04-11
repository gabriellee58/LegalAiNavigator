import pg from 'pg';
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Civil Procedure data
const civilProcedureSample = {
  categoryId: 1, // Civil Procedure category
  name: 'Ontario Superior Court Civil Procedure',
  description: 'Process for filing and pursuing a civil lawsuit in the Ontario Superior Court',
  jurisdiction: 'Ontario',
  steps: JSON.stringify([
    {
      title: 'Prepare Statement of Claim',
      description: 'Draft a Statement of Claim detailing your case',
      order: 1
    },
    {
      title: 'Issue Statement of Claim',
      description: 'File your Statement of Claim with the court',
      order: 2
    },
    {
      title: 'Serve the defendant',
      description: 'Provide a copy of the Statement of Claim to the defendant',
      order: 3
    },
    {
      title: 'Wait for Statement of Defence',
      description: 'The defendant has 20 days to file a defence (30 days if served outside Ontario)',
      order: 4
    },
    {
      title: 'Exchange documents (Discovery)',
      description: 'Exchange relevant documents with the other party',
      order: 5
    },
    {
      title: 'Examinations for Discovery',
      description: 'Question the other party under oath before trial',
      order: 6
    },
    {
      title: 'Pre-trial Conference',
      description: 'Meet with a judge to discuss settlement and trial management',
      order: 7
    },
    {
      title: 'Trial',
      description: 'Present your case before a judge or jury',
      order: 8
    },
    {
      title: 'Judgment and costs',
      description: 'Receive the court\'s decision and determination of costs',
      order: 9
    }
  ]),
  flowchartData: JSON.stringify({
    nodes: [
      { id: 'start', label: 'Start', type: 'start' },
      { id: 'prepare', label: 'Prepare Statement of Claim', type: 'process' },
      { id: 'issue', label: 'Issue Statement of Claim', type: 'process' },
      { id: 'serve', label: 'Serve Defendant', type: 'process' },
      { id: 'defence', label: 'Defendant Files Defence?', type: 'decision' },
      { id: 'default', label: 'Motion for Default Judgment', type: 'process' },
      { id: 'discovery', label: 'Documentary Discovery', type: 'process' },
      { id: 'examination', label: 'Examinations for Discovery', type: 'process' },
      { id: 'settlement', label: 'Settlement Conference/Mediation', type: 'process' },
      { id: 'settled', label: 'Case Settled?', type: 'decision' },
      { id: 'pretrial', label: 'Pre-trial Conference', type: 'process' },
      { id: 'trial', label: 'Trial', type: 'process' },
      { id: 'judgment', label: 'Judgment', type: 'process' },
      { id: 'appeal', label: 'Appeal?', type: 'decision' },
      { id: 'appealProcess', label: 'Appeal Process', type: 'process' },
      { id: 'end', label: 'End', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'prepare' },
      { from: 'prepare', to: 'issue' },
      { from: 'issue', to: 'serve' },
      { from: 'serve', to: 'defence' },
      { from: 'defence', to: 'default', label: 'No' },
      { from: 'defence', to: 'discovery', label: 'Yes' },
      { from: 'default', to: 'judgment' },
      { from: 'discovery', to: 'examination' },
      { from: 'examination', to: 'settlement' },
      { from: 'settlement', to: 'settled' },
      { from: 'settled', to: 'end', label: 'Yes' },
      { from: 'settled', to: 'pretrial', label: 'No' },
      { from: 'pretrial', to: 'trial' },
      { from: 'trial', to: 'judgment' },
      { from: 'judgment', to: 'appeal' },
      { from: 'appeal', to: 'end', label: 'No' },
      { from: 'appeal', to: 'appealProcess', label: 'Yes' },
      { from: 'appealProcess', to: 'end' }
    ]
  }),
  estimatedTimeframes: JSON.stringify({
    total: '2-3 years',
    phases: {
      'Filing to Close of Pleadings': '1-3 months',
      'Discovery': '6-12 months',
      'Pre-trial to Trial': '6-18 months',
      'Judgment to Appeal Deadline': '30 days'
    }
  }),
  courtFees: JSON.stringify({
    'Filing Statement of Claim': '$229',
    'Filing Motion Materials': '$160',
    'Filing Trial Record': '$810',
    'Court Reporter': 'Varies'
  }),
  requirements: JSON.stringify({
    jurisdiction: 'Civil claims over $35,000',
    documentation: [
      'Statement of Claim',
      'Affidavit of Service',
      'Supporting evidence documents',
      'Expert reports (if applicable)'
    ],
    limitations: 'Most claims must be filed within 2 years of the event',
    fees: 'Substantial filing fees apply'
  }),
  sourceName: 'Ontario Superior Court of Justice',
  sourceUrl: 'https://www.ontariocourts.ca/scj/civil/',
  relatedForms: JSON.stringify({
    'Form 14A': 'Statement of Claim',
    'Form 18A': 'Statement of Defence',
    'Form 29A': 'Affidavit of Documents',
    'Form 48A': 'Trial Record'
  }),
  isActive: true,
};

// Criminal Procedure data
const criminalProcedureSample = {
  categoryId: 2, // Criminal Procedure category
  name: 'Ontario Criminal Court Procedure',
  description: 'Process for criminal cases in Ontario courts',
  jurisdiction: 'Ontario',
  steps: JSON.stringify([
    {
      title: 'Arrest or Summons',
      description: 'Police arrest or issue a summons/appearance notice',
      order: 1
    },
    {
      title: 'First Appearance',
      description: 'Initial court appearance to receive disclosure and information',
      order: 2
    },
    {
      title: 'Bail Hearing',
      description: 'If detained, a hearing to determine release conditions',
      order: 3
    },
    {
      title: 'Crown Pre-trial',
      description: 'Meeting with Crown prosecutor to discuss case and possible resolutions',
      order: 4
    },
    {
      title: 'Judicial Pre-trial',
      description: 'Meeting with judge, Crown, and defence to discuss case management',
      order: 5
    },
    {
      title: 'Preliminary Inquiry',
      description: 'For indictable offences, hearing to determine if sufficient evidence exists',
      order: 6
    },
    {
      title: 'Trial',
      description: 'Formal court proceeding to determine guilt',
      order: 7
    },
    {
      title: 'Sentencing',
      description: 'If found guilty, court determines appropriate penalty',
      order: 8
    }
  ]),
  flowchartData: JSON.stringify({
    nodes: [
      { id: 'start', label: 'Start', type: 'start' },
      { id: 'arrest', label: 'Arrest/Summons', type: 'process' },
      { id: 'first', label: 'First Appearance', type: 'process' },
      { id: 'detained', label: 'Detained?', type: 'decision' },
      { id: 'bail', label: 'Bail Hearing', type: 'process' },
      { id: 'released', label: 'Released?', type: 'decision' },
      { id: 'crownPretrial', label: 'Crown Pre-trial', type: 'process' },
      { id: 'resolution', label: 'Early Resolution?', type: 'decision' },
      { id: 'guilty', label: 'Guilty Plea', type: 'process' },
      { id: 'judicialPretrial', label: 'Judicial Pre-trial', type: 'process' },
      { id: 'indictable', label: 'Indictable Offence?', type: 'decision' },
      { id: 'preliminary', label: 'Preliminary Inquiry', type: 'process' },
      { id: 'commited', label: 'Committed to Trial?', type: 'decision' },
      { id: 'discharged', label: 'Discharged', type: 'process' },
      { id: 'trial', label: 'Trial', type: 'process' },
      { id: 'verdict', label: 'Verdict', type: 'decision' },
      { id: 'acquittal', label: 'Acquittal', type: 'process' },
      { id: 'sentencing', label: 'Sentencing', type: 'process' },
      { id: 'appeal', label: 'Appeal?', type: 'decision' },
      { id: 'appealProcess', label: 'Appeal Process', type: 'process' },
      { id: 'end', label: 'End', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'arrest' },
      { from: 'arrest', to: 'first' },
      { from: 'first', to: 'detained' },
      { from: 'detained', to: 'crownPretrial', label: 'No' },
      { from: 'detained', to: 'bail', label: 'Yes' },
      { from: 'bail', to: 'released' },
      { from: 'released', to: 'crownPretrial', label: 'Yes' },
      { from: 'released', to: 'end', label: 'No' },
      { from: 'crownPretrial', to: 'resolution' },
      { from: 'resolution', to: 'guilty', label: 'Yes' },
      { from: 'resolution', to: 'judicialPretrial', label: 'No' },
      { from: 'guilty', to: 'sentencing' },
      { from: 'judicialPretrial', to: 'indictable' },
      { from: 'indictable', to: 'preliminary', label: 'Yes' },
      { from: 'indictable', to: 'trial', label: 'No' },
      { from: 'preliminary', to: 'commited' },
      { from: 'commited', to: 'trial', label: 'Yes' },
      { from: 'commited', to: 'discharged', label: 'No' },
      { from: 'discharged', to: 'end' },
      { from: 'trial', to: 'verdict' },
      { from: 'verdict', to: 'acquittal', label: 'Not Guilty' },
      { from: 'verdict', to: 'sentencing', label: 'Guilty' },
      { from: 'acquittal', to: 'end' },
      { from: 'sentencing', to: 'appeal' },
      { from: 'appeal', to: 'end', label: 'No' },
      { from: 'appeal', to: 'appealProcess', label: 'Yes' },
      { from: 'appealProcess', to: 'end' }
    ]
  }),
  estimatedTimeframes: JSON.stringify({
    total: '6 months to 2 years',
    phases: {
      'Arrest to First Appearance': '1-30 days',
      'First Appearance to Pre-trial': '1-3 months',
      'Pre-trial to Trial': '3-12 months',
      'Trial to Sentencing': '0-2 months',
      'Appeal Deadline': '30 days from judgment'
    }
  }),
  courtFees: JSON.stringify({
    'Transcripts': '$4.30 per page',
    'Appeal Filing': 'Varies'
  }),
  requirements: JSON.stringify({
    jurisdiction: 'Criminal Code offences and provincial offences',
    documentation: [
      'Charging document/Information',
      'Disclosure materials',
      'Notice of constitutional challenge (if applicable)',
      'Expert reports (if applicable)'
    ],
    limitations: 'Charter right to trial within a reasonable time',
    legal: 'Right to counsel under Section 10(b) of the Charter'
  }),
  sourceName: 'Ontario Court of Justice',
  sourceUrl: 'https://www.ontariocourts.ca/ocj/criminal/',
  relatedForms: JSON.stringify({
    'Form 2': 'Information',
    'Form 10': 'Recognizance',
    'Form 11': 'Release Order',
    'Form 5': 'Summons'
  }),
  isActive: true,
};

// Family Court Procedure data
const familyCourtProcedureSample = {
  categoryId: 3, // Family Court category
  name: 'Ontario Family Court Procedure',
  description: 'Process for family law cases in Ontario courts',
  jurisdiction: 'Ontario',
  steps: JSON.stringify([
    {
      title: 'File Application',
      description: 'Complete and file Form 8: Application (General) or Form 8A: Application (Divorce)',
      order: 1
    },
    {
      title: 'Serve documents',
      description: 'Serve the application and supporting documents on the respondent',
      order: 2
    },
    {
      title: 'Wait for Answer',
      description: 'Respondent has 30 days to file an Answer (Form 10)',
      order: 3
    },
    {
      title: 'Mandatory Information Program',
      description: 'Attend a court-mandated information session',
      order: 4
    },
    {
      title: 'Financial Disclosure',
      description: 'Exchange financial statements and supporting documents',
      order: 5
    },
    {
      title: 'Case Conference',
      description: 'Meet with a judge to discuss issues and possible settlement',
      order: 6
    },
    {
      title: 'Settlement Conference',
      description: 'Second conference with a judge focused on settlement',
      order: 7
    },
    {
      title: 'Trial Management Conference',
      description: 'Final conference to prepare for trial',
      order: 8
    },
    {
      title: 'Trial',
      description: 'Present your case before a judge',
      order: 9
    }
  ]),
  flowchartData: JSON.stringify({
    nodes: [
      { id: 'start', label: 'Start', type: 'start' },
      { id: 'application', label: 'File Application', type: 'process' },
      { id: 'serve', label: 'Serve Documents', type: 'process' },
      { id: 'answer', label: 'Answer Filed?', type: 'decision' },
      { id: 'default', label: 'Uncontested Proceeding', type: 'process' },
      { id: 'mip', label: 'Mandatory Information Program', type: 'process' },
      { id: 'financial', label: 'Financial Disclosure', type: 'process' },
      { id: 'case', label: 'Case Conference', type: 'process' },
      { id: 'settled1', label: 'Case Settled?', type: 'decision' },
      { id: 'settlement', label: 'Settlement Conference', type: 'process' },
      { id: 'settled2', label: 'Case Settled?', type: 'decision' },
      { id: 'trial', label: 'Trial Management Conference', type: 'process' },
      { id: 'trialProper', label: 'Trial', type: 'process' },
      { id: 'order', label: 'Final Order', type: 'process' },
      { id: 'appeal', label: 'Appeal?', type: 'decision' },
      { id: 'appealProcess', label: 'Appeal Process', type: 'process' },
      { id: 'end', label: 'End', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'application' },
      { from: 'application', to: 'serve' },
      { from: 'serve', to: 'answer' },
      { from: 'answer', to: 'default', label: 'No' },
      { from: 'answer', to: 'mip', label: 'Yes' },
      { from: 'default', to: 'order' },
      { from: 'mip', to: 'financial' },
      { from: 'financial', to: 'case' },
      { from: 'case', to: 'settled1' },
      { from: 'settled1', to: 'order', label: 'Yes' },
      { from: 'settled1', to: 'settlement', label: 'No' },
      { from: 'settlement', to: 'settled2' },
      { from: 'settled2', to: 'order', label: 'Yes' },
      { from: 'settled2', to: 'trial', label: 'No' },
      { from: 'trial', to: 'trialProper' },
      { from: 'trialProper', to: 'order' },
      { from: 'order', to: 'appeal' },
      { from: 'appeal', to: 'end', label: 'No' },
      { from: 'appeal', to: 'appealProcess', label: 'Yes' },
      { from: 'appealProcess', to: 'end' }
    ]
  }),
  estimatedTimeframes: JSON.stringify({
    total: '6 months to 2 years',
    phases: {
      'Filing to Case Conference': '3-4 months',
      'Case Conference to Settlement Conference': '2-6 months',
      'Settlement Conference to Trial': '3-12 months'
    }
  }),
  courtFees: JSON.stringify({
    'Filing Application': '$202',
    'Filing Motion': '$165',
    'Issue of Divorce Order': '$280',
    'Trial Fee': '$800'
  }),
  requirements: JSON.stringify({
    jurisdiction: 'Divorce, custody, support, property division',
    documentation: [
      'Application (Form 8 or 8A)',
      'Financial Statement (Form 13 or 13.1)',
      'Marriage Certificate (for divorce)',
      'Parenting Affidavit (Form 35.1 for custody/access)'
    ],
    limitations: 'Divorce requires 1-year separation',
    fees: 'Court filing fees apply'
  }),
  sourceName: 'Ontario Court of Justice - Family',
  sourceUrl: 'https://www.ontariocourts.ca/ocj/family/',
  relatedForms: JSON.stringify({
    'Form 8': 'Application (General)',
    'Form 8A': 'Application (Divorce)',
    'Form 10': 'Answer',
    'Form 13': 'Financial Statement (Property and Support)',
    'Form 13.1': 'Financial Statement (Support Only)',
    'Form 35.1': 'Affidavit (Custody and Access)'
  }),
  isActive: true,
};

// Administrative Tribunal Procedure
const administrativeTribunalProcedureSample = {
  categoryId: 5, // Administrative Tribunals category
  name: 'Ontario Landlord and Tenant Board Procedure',
  description: 'Process for resolving residential tenancy disputes in Ontario',
  jurisdiction: 'Ontario',
  steps: JSON.stringify([
    {
      title: 'File Application',
      description: 'Complete and file the appropriate application form with the LTB',
      order: 1
    },
    {
      title: 'Pay filing fee',
      description: 'Pay the required filing fee (varies by application type)',
      order: 2
    },
    {
      title: 'Notice of Hearing',
      description: 'Receive a Notice of Hearing with the date, time, and location',
      order: 3
    },
    {
      title: 'Serve documents',
      description: 'Serve a copy of the application and Notice of Hearing on the respondent',
      order: 4
    },
    {
      title: 'Respondent files response',
      description: 'Respondent may file a response to the application',
      order: 5
    },
    {
      title: 'Mediation (optional)',
      description: 'Attempt to resolve the dispute through LTB-facilitated mediation',
      order: 6
    },
    {
      title: 'Hearing',
      description: 'Present your case at the hearing (in-person, telephone, or video)',
      order: 7
    },
    {
      title: 'Decision/Order',
      description: 'Receive the written decision and order from the LTB',
      order: 8
    }
  ]),
  flowchartData: JSON.stringify({
    nodes: [
      { id: 'start', label: 'Start', type: 'start' },
      { id: 'application', label: 'File Application', type: 'process' },
      { id: 'fee', label: 'Pay Filing Fee', type: 'process' },
      { id: 'notice', label: 'Notice of Hearing', type: 'process' },
      { id: 'serve', label: 'Serve Documents', type: 'process' },
      { id: 'response', label: 'Response Filed?', type: 'decision' },
      { id: 'mediation', label: 'Mediation', type: 'process' },
      { id: 'settled', label: 'Dispute Settled?', type: 'decision' },
      { id: 'hearing', label: 'Hearing', type: 'process' },
      { id: 'order', label: 'Decision/Order', type: 'process' },
      { id: 'review', label: 'Request Review?', type: 'decision' },
      { id: 'reviewHearing', label: 'Review Hearing', type: 'process' },
      { id: 'appeal', label: 'Appeal to Divisional Court?', type: 'decision' },
      { id: 'appealProcess', label: 'Appeal Process', type: 'process' },
      { id: 'end', label: 'End', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'application' },
      { from: 'application', to: 'fee' },
      { from: 'fee', to: 'notice' },
      { from: 'notice', to: 'serve' },
      { from: 'serve', to: 'response' },
      { from: 'response', to: 'mediation', label: 'Yes' },
      { from: 'response', to: 'mediation', label: 'No' },
      { from: 'mediation', to: 'settled' },
      { from: 'settled', to: 'order', label: 'Yes' },
      { from: 'settled', to: 'hearing', label: 'No' },
      { from: 'hearing', to: 'order' },
      { from: 'order', to: 'review' },
      { from: 'review', to: 'reviewHearing', label: 'Yes' },
      { from: 'review', to: 'appeal', label: 'No' },
      { from: 'reviewHearing', to: 'appeal' },
      { from: 'appeal', to: 'end', label: 'No' },
      { from: 'appeal', to: 'appealProcess', label: 'Yes' },
      { from: 'appealProcess', to: 'end' }
    ]
  }),
  estimatedTimeframes: JSON.stringify({
    total: '2-6 months',
    phases: {
      'Filing to Hearing': '6-12 weeks',
      'Hearing to Decision': '1-4 weeks',
      'Review Request Deadline': '30 days from order',
      'Appeal Deadline': '30 days from order'
    }
  }),
  courtFees: JSON.stringify({
    'Tenant Application': '$53 (most forms)',
    'Landlord Application': '$201 (Form L1/L2)',
    'Request for Review': '$55',
    'Certified Copy of Order': '$15'
  }),
  requirements: JSON.stringify({
    jurisdiction: 'Residential tenancy disputes in Ontario',
    documentation: [
      'Completed application form',
      'Copy of lease agreement (if available)',
      'Evidence (photos, receipts, correspondence)',
      'Witness information (if applicable)'
    ],
    limitations: 'Must relate to issues under the Residential Tenancies Act',
    fees: 'Filing fees apply (can request waiver if low income)'
  }),
  sourceName: 'Landlord and Tenant Board',
  sourceUrl: 'https://tribunalsontario.ca/ltb/',
  relatedForms: JSON.stringify({
    'Form L1': 'Application to Evict for Non-payment of Rent',
    'Form L2': 'Application to End a Tenancy and Evict a Tenant',
    'Form T2': 'Application About Tenant Rights',
    'Form T6': 'Tenant Application - Maintenance'
  }),
  isActive: true,
};

// Civil Procedure steps
const civilProcedureSteps = [
  {
    procedureId: null, // Will be set during insert
    title: 'Prepare Statement of Claim',
    description: 'Draft a detailed Statement of Claim outlining your case',
    stepOrder: 1,
    estimatedTime: '2-4 weeks',
    requiredDocuments: JSON.stringify([
      'Relevant contracts or agreements',
      'Correspondence between parties',
      'Evidence of damages',
      'Expert opinions (if applicable)'
    ]),
    instructions: 'Prepare a Statement of Claim that includes: the names and addresses of all parties, the facts upon which you rely, the legal basis for your claim, and the remedy you seek.',
    tips: JSON.stringify([
      'Be specific about dates, amounts, and events',
      'Clearly state how the defendant\'s actions caused you harm',
      'Include all relevant facts but be concise',
      'Consult with a lawyer to ensure proper legal framing'
    ]),
    warnings: JSON.stringify([
      'Most claims must be filed within 2 years of the incident',
      'Claims against government entities may have shorter limitation periods',
      'Ensure you have the correct legal names of all parties',
      'Anticipate possible defenses and address them if possible'
    ]),
    fees: JSON.stringify({
      'Legal consultation': '$300-500/hour if using a lawyer'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([2]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Rules of Civil Procedure, Rule 14',
        url: 'https://www.ontario.ca/laws/regulation/900194'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Issue Statement of Claim',
    description: 'File your Statement of Claim with the court',
    stepOrder: 2,
    estimatedTime: '1 day',
    requiredDocuments: JSON.stringify([
      'Completed Statement of Claim (3 copies)',
      'Filing fee payment'
    ]),
    instructions: 'Take your completed Statement of Claim to the court office in the appropriate jurisdiction. Pay the filing fee. The court will issue the claim by stamping it with the court seal and assigning a court file number.',
    tips: JSON.stringify([
      'Choose the correct court location based on where the incident occurred or where parties reside/do business',
      'Bring exact change or credit card for payment',
      'Request additional certified copies if needed',
      'File electronically if available in your jurisdiction'
    ]),
    warnings: JSON.stringify([
      'Filing fees must be paid in full',
      'The claim must be filed in the proper court location',
      'Make sure all copies are identical',
      'Keep your court file number for all future correspondence'
    ]),
    fees: JSON.stringify({
      'Filing Statement of Claim': '$229',
      'Additional certified copies': '$5 each'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([3]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Superior Court of Justice - Civil',
        url: 'https://www.ontariocourts.ca/scj/civil/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Serve the defendant',
    description: 'Provide a copy of the Statement of Claim to the defendant',
    stepOrder: 3,
    estimatedTime: '1-3 weeks',
    requiredDocuments: JSON.stringify([
      'Issued Statement of Claim',
      'Affidavit of Service'
    ]),
    instructions: 'The defendant must be personally served with the Statement of Claim. This can be done by anyone over 18 who is not a party to the action. After service, complete an Affidavit of Service and file it with the court.',
    tips: JSON.stringify([
      'Consider using a professional process server',
      'Service on individuals must be in person unless the court orders otherwise',
      'Corporations can be served at their registered office',
      'Keep detailed records of the service attempt(s)'
    ]),
    warnings: JSON.stringify([
      'Service must occur within 6 months of issuing the claim',
      'Improper service may lead to delays or dismissal',
      'You cannot personally serve documents if you are a party to the action',
      'Special rules apply for serving governments or minors'
    ]),
    fees: JSON.stringify({
      'Process server': '$75-200 depending on difficulty',
      'Filing Affidavit of Service': 'No fee'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([4]),
    alternatePathInfo: 'If you cannot locate the defendant or standard service is impractical, you may apply for substituted service or an order dispensing with service.',
    sourceReferences: JSON.stringify([
      {
        name: 'Rules of Civil Procedure, Rule 16',
        url: 'https://www.ontario.ca/laws/regulation/900194'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Wait for Statement of Defence',
    description: 'The defendant has 20 days to file a defence (30 days if served outside Ontario)',
    stepOrder: 4,
    estimatedTime: '20-30 days',
    requiredDocuments: JSON.stringify([]),
    instructions: 'After being served, the defendant must file a Statement of Defence within the prescribed time limit. If no defence is filed, you may proceed to obtain default judgment.',
    tips: JSON.stringify([
      'Calendar the deadline for the defence',
      'Check with the court after the deadline to confirm if a defence was filed',
      'Begin preparing for a motion for default judgment if no defence is filed',
      'If a defence is filed, obtain a copy from the court'
    ]),
    warnings: JSON.stringify([
      'The defendant may request an extension of time',
      'The defendant may file a counterclaim against you',
      'The defendant may file a defence and crossclaim against other defendants',
      'Default judgment is not automatic; you must request it'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([5]),
    alternatePathInfo: 'If no defence is filed, proceed with a motion for default judgment. If a defence is filed, proceed to documentary discovery.',
    sourceReferences: JSON.stringify([
      {
        name: 'Rules of Civil Procedure, Rule 18',
        url: 'https://www.ontario.ca/laws/regulation/900194'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Exchange documents (Discovery)',
    description: 'Exchange relevant documents with the other party',
    stepOrder: 5,
    estimatedTime: '1-3 months',
    requiredDocuments: JSON.stringify([
      'Affidavit of Documents (Form 30A)',
      'All relevant documents in your possession'
    ]),
    instructions: 'Each party must prepare an Affidavit of Documents listing all relevant documents in their possession or control, including those that may be privileged. Exchange these affidavits and provide copies of non-privileged documents to the other party.',
    tips: JSON.stringify([
      'Be thorough and honest in your disclosure',
      'Organize documents by category and date',
      'Consider creating a joint document brief for frequently referenced documents',
      'Keep a log of all documents exchanged'
    ]),
    warnings: JSON.stringify([
      'Failure to disclose relevant documents can result in severe penalties',
      'Continuing obligation to disclose new relevant documents',
      'Do not destroy or alter any relevant documents',
      'Privileged documents must be identified but need not be produced'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([6]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Rules of Civil Procedure, Rule 30',
        url: 'https://www.ontario.ca/laws/regulation/900194'
      }
    ])
  }
];

// Criminal procedure steps
const criminalProcedureSteps = [
  {
    procedureId: null,
    title: 'Arrest or Summons',
    description: 'Police arrest or issue a summons/appearance notice',
    stepOrder: 1,
    estimatedTime: 'Immediate to several weeks',
    requiredDocuments: JSON.stringify([
      'Charging document (Information)',
      'Warrants (if applicable)',
      'Release documents (if applicable)'
    ]),
    instructions: 'If arrested, you will be taken into custody, informed of your charges, and either released or held for a bail hearing. If issued a summons, you will receive a document requiring you to appear in court on a specific date.',
    tips: JSON.stringify([
      'Request to speak with a lawyer immediately',
      'Exercise your right to remain silent',
      'Take note of all details of the interaction',
      'Comply with all conditions of release'
    ]),
    warnings: JSON.stringify([
      'Anything you say can be used as evidence',
      'Failure to appear as required is a separate criminal offense',
      'Violating release conditions can result in additional charges',
      'Request duty counsel if you cannot afford a lawyer'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([2]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Criminal Code of Canada, Part XVI',
        url: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'First Appearance',
    description: 'Initial court appearance to receive disclosure and information',
    stepOrder: 2,
    estimatedTime: '15-60 minutes',
    requiredDocuments: JSON.stringify([
      'Notice to appear/summons',
      'Identification'
    ]),
    instructions: 'Attend court on the specified date. The charges will be read, and you may receive initial disclosure. You will be asked about legal representation and may be offered an opportunity to speak with duty counsel.',
    tips: JSON.stringify([
      'Arrive at least 30 minutes early',
      'Dress respectfully',
      'Speak only when addressed by the court',
      'Request disclosure if not provided',
      'Consider requesting an adjournment to obtain counsel'
    ]),
    warnings: JSON.stringify([
      'Do not miss your court date',
      'Do not interrupt court proceedings',
      'Do not plead guilty without understanding the consequences',
      'Request an interpreter if needed'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([3, 4]),
    alternatePathInfo: 'If you are in custody, you will proceed to a bail hearing. If you are not in custody, you will proceed to a Crown pre-trial.',
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Court of Justice - Criminal',
        url: 'https://www.ontariocourts.ca/ocj/criminal/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Bail Hearing',
    description: 'If detained, a hearing to determine release conditions',
    stepOrder: 3,
    estimatedTime: '1-3 hours',
    requiredDocuments: JSON.stringify([
      'Bail plan',
      'Surety information (if applicable)'
    ]),
    instructions: 'The Crown will present reasons why detention is justified. You or your lawyer will present a plan for release. A judge or justice of the peace will decide whether to release you and under what conditions.',
    tips: JSON.stringify([
      'Have reliable sureties present if possible',
      'Develop a detailed supervision plan',
      'Address the court\'s concerns about attendance, public safety, and confidence in the justice system',
      'Be prepared to suggest appropriate conditions'
    ]),
    warnings: JSON.stringify([
      'The onus is on the Crown for most offenses',
      'For certain offenses, the onus shifts to the accused',
      'Bail hearings can be adjourned for up to 3 days without consent',
      'Violating bail conditions results in additional charges'
    ]),
    isOptional: true,
    nextStepIds: JSON.stringify([4]),
    alternatePathInfo: 'Occurs only if you are detained after arrest or breach bail conditions.',
    sourceReferences: JSON.stringify([
      {
        name: 'Criminal Code of Canada, Section 515',
        url: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/section-515.html'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Crown Pre-trial',
    description: 'Meeting with Crown prosecutor to discuss case and possible resolutions',
    stepOrder: 4,
    estimatedTime: '30-60 minutes',
    requiredDocuments: JSON.stringify([
      'Disclosure materials',
      'Notes on legal issues',
      'Character references (if relevant)'
    ]),
    instructions: 'Meet with the Crown prosecutor to discuss the case, potential resolutions, and any issues. This is typically an informal meeting where possible plea agreements and sentencing positions can be discussed.',
    tips: JSON.stringify([
      'Review disclosure thoroughly before the meeting',
      'Have a clear understanding of your position',
      'Bring any information that supports your position',
      'Listen carefully to the Crown\'s position',
      'Take notes of any offers made'
    ]),
    warnings: JSON.stringify([
      'Anything you say may be used against you',
      'Having legal representation is strongly recommended',
      'No agreement is final until accepted by the court',
      'Consider potential immigration consequences if applicable'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([5]),
    alternatePathInfo: 'If a resolution is reached, proceed to plea. If not, proceed to judicial pre-trial.',
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Court of Justice - Practice Direction',
        url: 'https://www.ontariocourts.ca/ocj/criminal/practice-directions/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Judicial Pre-trial',
    description: 'Meeting with judge, Crown, and defence to discuss case management',
    stepOrder: 5,
    estimatedTime: '30-60 minutes',
    requiredDocuments: JSON.stringify([
      'Crown pre-trial form',
      'Defence pre-trial form',
      'Disclosure materials'
    ]),
    instructions: 'Attend a meeting with a judge, the Crown, and defence counsel to discuss legal issues, evidence, trial management, and possible resolutions. This is typically held in the judge\'s chambers or a conference room.',
    tips: JSON.stringify([
      'Be prepared to discuss time estimates',
      'Identify key legal issues',
      'Be clear about witness requirements',
      'Consider making final resolution offers',
      'Address any Charter applications'
    ]),
    warnings: JSON.stringify([
      'The trial judge will typically not be the JPT judge',
      'Judge cannot force a plea agreement',
      'Statements made are generally without prejudice',
      'Trial dates may be set at this conference'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([6, 7]),
    alternatePathInfo: 'For indictable offences where a preliminary inquiry is requested, proceed to preliminary inquiry. Otherwise, set a trial date.',
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Superior Court of Justice - Criminal Proceedings Rules',
        url: 'https://www.ontariocourts.ca/scj/practice/practice-directions/criminal/'
      }
    ])
  }
];

// Family Court procedure steps
const familyCourtProcedureSteps = [
  {
    procedureId: null,
    title: 'File Application',
    description: 'Complete and file Form 8: Application (General) or Form 8A: Application (Divorce)',
    stepOrder: 1,
    estimatedTime: '1-2 weeks',
    requiredDocuments: JSON.stringify([
      'Form 8 or 8A',
      'Form 13: Financial Statement (if property or support)',
      'Form 35.1: Affidavit (if children involved)',
      'Marriage Certificate (for divorce)',
      'Supporting documents'
    ]),
    instructions: 'Complete the appropriate application form based on your case. Include all required supporting documents. File these documents at the family court in your jurisdiction and pay the filing fee.',
    tips: JSON.stringify([
      'Be specific about the orders you want the court to make',
      'Complete all sections of the form fully',
      'Make multiple copies of all documents',
      'Include supporting evidence where necessary',
      'Consider consulting with a lawyer before filing'
    ]),
    warnings: JSON.stringify([
      'Filing fees must be paid',
      'Incorrect or incomplete forms may be rejected',
      'Ensure you file in the correct court location',
      'Be aware of limitation periods (e.g., property claims must be made within 6 years of separation)'
    ]),
    fees: JSON.stringify({
      'Filing Application': '$202',
      'Filing Divorce Application': '$632'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([2]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Family Law Rules',
        url: 'https://www.ontario.ca/laws/regulation/990114'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Serve documents',
    description: 'Serve the application and supporting documents on the respondent',
    stepOrder: 2,
    estimatedTime: '1-3 weeks',
    requiredDocuments: JSON.stringify([
      'Copy of filed application and supporting documents',
      'Form 6B: Affidavit of Service',
      'Form 13A: Certificate of Financial Disclosure'
    ]),
    instructions: 'The respondent must be personally served with the application and supporting documents. This can be done by anyone over 18 who is not a party to the case. After service, file an Affidavit of Service with the court.',
    tips: JSON.stringify([
      'Consider using a professional process server',
      'Keep detailed records of service attempts',
      'Include all required forms and documents',
      'Ensure the person serving documents understands the requirements',
      'File the Affidavit of Service promptly'
    ]),
    warnings: JSON.stringify([
      'You cannot serve documents yourself',
      'Improper service can cause delays',
      'Service must be complete - all required documents must be served',
      'Special rules apply for serving parties outside Ontario'
    ]),
    fees: JSON.stringify({
      'Process server': '$75-200 depending on location and difficulty'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([3]),
    alternatePathInfo: 'If you cannot locate the respondent or personal service is impractical, you may apply for substituted service.',
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Family Law Rules, Rule 6',
        url: 'https://www.ontario.ca/laws/regulation/990114'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Wait for Answer',
    description: 'Respondent has 30 days to file an Answer (Form 10)',
    stepOrder: 3,
    estimatedTime: '30 days',
    requiredDocuments: JSON.stringify([]),
    instructions: 'After being served, the respondent has 30 days to file an Answer (60 days if served outside Canada or US). If no Answer is filed, you may proceed with an uncontested hearing.',
    tips: JSON.stringify([
      'Mark the deadline on your calendar',
      'Check with the court after the deadline to confirm if an Answer was filed',
      'Begin preparing for the next steps based on whether an Answer is filed',
      'If an Answer is filed, obtain a copy from the court'
    ]),
    warnings: JSON.stringify([
      'The respondent may request an extension of time',
      'The respondent may file an Answer and claim of their own',
      'Do not assume your case will proceed uncontested',
      'If no Answer is filed, you still need to prepare evidence'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([4]),
    alternatePathInfo: 'If no Answer is filed, proceed with uncontested hearing steps. If an Answer is filed, proceed with the contested case process.',
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Family Law Rules, Rule 10',
        url: 'https://www.ontario.ca/laws/regulation/990114'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Mandatory Information Program',
    description: 'Attend a court-mandated information session',
    stepOrder: 4,
    estimatedTime: '2-3 hours',
    requiredDocuments: JSON.stringify([
      'Notice to attend MIP',
      'Court file number',
      'Identification'
    ]),
    instructions: 'Attend the Mandatory Information Program (MIP) session as scheduled. Both parties typically attend separate sessions. The program provides information about the legal process, effects of separation on adults and children, and alternatives to litigation.',
    tips: JSON.stringify([
      'Arrive on time',
      'Take notes during the session',
      'Ask questions if permitted',
      'Collect any handouts or resources provided',
      'Consider the alternatives to litigation discussed'
    ]),
    warnings: JSON.stringify([
      'Attendance is mandatory in most cases',
      'Failure to attend can delay your case',
      'You will receive a certificate of completion',
      'You cannot bring children to the session'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([5]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Court of Justice - Family',
        url: 'https://www.ontariocourts.ca/ocj/family/programs/mandatory-information-program/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Financial Disclosure',
    description: 'Exchange financial statements and supporting documents',
    stepOrder: 5,
    estimatedTime: '2-6 weeks',
    requiredDocuments: JSON.stringify([
      'Form 13 or 13.1: Financial Statement',
      'Income tax returns for last 3 years',
      'Notices of assessment for last 3 years',
      'Pay stubs or other income proof',
      'Property valuations',
      'Bank statements and investment records',
      'Form 13A: Certificate of Financial Disclosure'
    ]),
    instructions: 'Prepare and exchange detailed financial information. Complete the appropriate Financial Statement form. Gather all supporting documents. Serve these documents on the other party and file them with the court.',
    tips: JSON.stringify([
      'Be thorough and honest in your disclosure',
      'Organize documents by category',
      'Keep copies of everything you provide',
      'Update your disclosure if circumstances change',
      'Request missing information from the other party promptly'
    ]),
    warnings: JSON.stringify([
      'Incomplete or inaccurate disclosure can result in serious penalties',
      'The court can draw adverse inferences from non-disclosure',
      'Financial disclosure is an ongoing obligation',
      'The court may order costs against a party who fails to disclose'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([6]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Family Law Rules, Rule 13',
        url: 'https://www.ontario.ca/laws/regulation/990114'
      }
    ])
  }
];

// Administrative tribunal steps
const administrativeTribunalSteps = [
  {
    procedureId: null,
    title: 'File Application',
    description: 'Complete and file the appropriate application form with the LTB',
    stepOrder: 1,
    estimatedTime: '1-2 weeks',
    requiredDocuments: JSON.stringify([
      'Appropriate LTB application form',
      'Supporting documents (lease, notices, correspondence)',
      'Evidence (photos, receipts, etc.)'
    ]),
    instructions: 'Select the correct application form based on your issue. Complete all sections fully. Attach supporting documents. Submit the application online, by mail, or in person at an LTB office.',
    tips: JSON.stringify([
      'Review the application guide before completing the form',
      'Keep copies of all documents submitted',
      'Be specific about the remedy you seek',
      'Include calculations for any monetary claims',
      'Check for completeness before submitting'
    ]),
    warnings: JSON.stringify([
      'Different forms have different time limits for filing',
      'Incorrect information may delay your application',
      'Missing information may result in dismissal',
      'Ensure you have the correct legal names of all parties'
    ]),
    fees: JSON.stringify({
      'Tenant applications': '$53 (most forms)',
      'Landlord applications': '$201 (L1/L2)'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([2]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Landlord and Tenant Board - Application and Hearing Process',
        url: 'https://tribunalsontario.ca/ltb/application-and-hearing-process/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Pay filing fee',
    description: 'Pay the required filing fee (varies by application type)',
    stepOrder: 2,
    estimatedTime: 'Same day',
    requiredDocuments: JSON.stringify([
      'Application form',
      'Fee payment method'
    ]),
    instructions: 'Pay the required fee by credit card (online), money order, certified cheque, or cash (in person). Keep your receipt. You can request a fee waiver if you have low income.',
    tips: JSON.stringify([
      'Online payment is fastest',
      'Money orders should be made payable to "Minister of Finance"',
      'Keep proof of payment',
      'If eligible, apply for a fee waiver before filing',
      'Some applications have different fees'
    ]),
    warnings: JSON.stringify([
      'Applications without proper payment will not be processed',
      'Personal cheques are not accepted',
      'Fee waiver requests require financial information',
      'Fees are non-refundable if you withdraw your application'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([3]),
    alternatePathInfo: 'If you cannot afford the fee, you can apply for a fee waiver using the Fee Waiver Request form.',
    sourceReferences: JSON.stringify([
      {
        name: 'Landlord and Tenant Board - Fee Schedule',
        url: 'https://tribunalsontario.ca/ltb/forms/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Notice of Hearing',
    description: 'Receive a Notice of Hearing with the date, time, and location',
    stepOrder: 3,
    estimatedTime: '2-4 weeks after filing',
    requiredDocuments: JSON.stringify([]),
    instructions: 'After your application is processed, the LTB will mail you a Notice of Hearing with the hearing date, time, location, and format (in person, telephone, or video). Review this notice carefully.',
    tips: JSON.stringify([
      'Mark the hearing date on your calendar immediately',
      'Note any deadlines for submitting additional documents',
      'Verify the hearing format and prepare accordingly',
      'Request an interpreter if needed',
      'Contact the LTB if you need accommodation'
    ]),
    warnings: JSON.stringify([
      'If you move, update your address with the LTB',
      'The hearing date is not negotiable except in emergencies',
      'Failure to appear can result in dismissal',
      'Check the notice for specific instructions about your hearing'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([4]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Landlord and Tenant Board - Notice of Hearing',
        url: 'https://tribunalsontario.ca/ltb/application-and-hearing-process/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Serve documents',
    description: 'Serve a copy of the application and Notice of Hearing on the respondent',
    stepOrder: 4,
    estimatedTime: '1-2 weeks',
    requiredDocuments: JSON.stringify([
      'Copy of application',
      'Notice of Hearing',
      'Certificate of Service',
      'Supporting documents'
    ]),
    instructions: 'Serve the respondent with a copy of your application, the Notice of Hearing, and all supporting documents. The method of service depends on who you are serving and is specified in the LTB Rules. Complete and file a Certificate of Service.',
    tips: JSON.stringify([
      'Follow the rules for service exactly',
      'Keep proof of service (tracking number, courier receipt)',
      'Allow enough time for mail delivery if using mail service',
      'Consider using a method that provides proof of delivery',
      'File your Certificate of Service promptly'
    ]),
    warnings: JSON.stringify([
      'Different respondents may have different service requirements',
      'Service deadlines are strict',
      'Improper service can lead to adjournment or dismissal',
      'The LTB may serve some documents directly'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([5, 6]),
    alternatePathInfo: 'In some cases, the LTB will serve the documents for you. Check your Notice of Hearing carefully.',
    sourceReferences: JSON.stringify([
      {
        name: 'Landlord and Tenant Board - Rules of Practice',
        url: 'https://tribunalsontario.ca/ltb/rules/'
      }
    ])
  },
  {
    procedureId: null,
    title: 'Respondent files response',
    description: 'Respondent may file a response to the application',
    stepOrder: 5,
    estimatedTime: 'Up to the hearing date',
    requiredDocuments: JSON.stringify([]),
    instructions: 'The respondent may file a written response but is not required to do so. If they file a response, you will receive a copy. Review it carefully and prepare to address the points raised.',
    tips: JSON.stringify([
      'Check if the response raises new issues',
      'Prepare counterarguments to the respondent\'s claims',
      'Gather evidence to refute inaccurate statements',
      'Consider how the response affects your case',
      'Organize your evidence to address the response'
    ]),
    warnings: JSON.stringify([
      'The respondent may not file a written response but still attend',
      'The lack of written response doesn\'t mean the respondent agrees',
      'The respondent may bring documentation to the hearing',
      'Be prepared for unexpected arguments'
    ]),
    isOptional: true,
    nextStepIds: JSON.stringify([6, 7]),
    alternatePathInfo: 'This step may not occur as responses are not mandatory in LTB proceedings.',
    sourceReferences: JSON.stringify([
      {
        name: 'Landlord and Tenant Board - Respondent Instructions',
        url: 'https://tribunalsontario.ca/ltb/application-and-hearing-process/'
      }
    ])
  }
];

async function addProcedureWithSteps(client, procedure, steps) {
  try {
    // Insert the procedure
    const procedureResult = await client.query(
      `INSERT INTO court_procedures 
       (category_id, name, description, jurisdiction, steps, flowchart_data, 
        estimated_timeframes, court_fees, requirements, source_name, source_url, 
        related_forms, is_active, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
       RETURNING id`,
      [
        procedure.categoryId,
        procedure.name,
        procedure.description,
        procedure.jurisdiction,
        procedure.steps,
        procedure.flowchartData,
        procedure.estimatedTimeframes,
        procedure.courtFees,
        procedure.requirements,
        procedure.sourceName,
        procedure.sourceUrl,
        procedure.relatedForms,
        procedure.isActive
      ]
    );
    
    const procedureId = procedureResult.rows[0].id;
    console.log(`Inserted procedure: ${procedure.name} with ID: ${procedureId}`);
    
    // Update steps with the correct procedure ID
    const stepsWithId = steps.map(step => ({
      ...step,
      procedureId
    }));
    
    // Insert each step
    for (const step of stepsWithId) {
      await client.query(
        `INSERT INTO court_procedure_steps
         (procedure_id, title, description, step_order, estimated_time, 
          required_documents, instructions, tips, warnings, fees, 
          is_optional, next_step_ids, alternate_path_info, source_references,
          created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
        [
          step.procedureId,
          step.title,
          step.description,
          step.stepOrder,
          step.estimatedTime,
          step.requiredDocuments,
          step.instructions,
          step.tips,
          step.warnings,
          step.fees,
          step.isOptional || false,
          step.nextStepIds,
          step.alternatePathInfo,
          step.sourceReferences
        ]
      );
      console.log(`Inserted step: ${step.title} for procedure ID: ${procedureId}`);
    }
    
    return procedureId;
  } catch (error) {
    console.error(`Error adding procedure ${procedure.name}:`, error);
    throw error;
  }
}

async function populateCourtProcedures() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Populating additional court procedures...');
    
    // Add Civil Procedure with steps
    await addProcedureWithSteps(client, civilProcedureSample, civilProcedureSteps);
    
    // Add Criminal Procedure with steps
    await addProcedureWithSteps(client, criminalProcedureSample, criminalProcedureSteps);
    
    // Add Family Court Procedure with steps
    await addProcedureWithSteps(client, familyCourtProcedureSample, familyCourtProcedureSteps);
    
    // Add Administrative Tribunal Procedure with steps
    await addProcedureWithSteps(client, administrativeTribunalProcedureSample, administrativeTribunalSteps);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Successfully populated all court procedures.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error populating court procedures:', error);
  } finally {
    client.release();
  }
}

// Run the function
populateCourtProcedures().catch(console.error);