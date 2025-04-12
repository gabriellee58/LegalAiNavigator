import { CourtProcedureData } from './types';

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
      },
      {
        name: 'Legal Aid Ontario',
        url: 'https://www.legalaid.on.ca/services/criminal-legal-issues/'
      }
    ]
  },
  steps: [
    {
      id: 'investigation',
      title: 'Investigation',
      description: 'Police gather evidence about a potential crime',
      details: 'The criminal process typically begins with a police investigation. This can be triggered by a complaint, observation of criminal activity, or as part of ongoing investigative work. Police may interview witnesses, collect physical evidence, execute search warrants, and conduct surveillance. This stage concludes when police either determine there is insufficient evidence to proceed or decide they have reasonable grounds to believe an offence has been committed.',
      timeline: {
        minDays: 1,
        maxDays: 365,
        description: 'Can range from immediate to years for complex cases'
      },
      tips: [
        'You have the right to remain silent when questioned by police',
        'You have the right to speak to a lawyer if detained or arrested',
        'Police must follow legal requirements for searches and seizures'
      ],
      warnings: [
        'Do not interfere with police investigations',
        'False statements to police can lead to additional charges',
        'Evidence obtained improperly may still be used if courts deem its inclusion would not bring the administration of justice into disrepute'
      ]
    },
    {
      id: 'arrest-charge',
      title: 'Arrest and Charge',
      description: 'Official detention and formal accusation',
      details: 'If police have reasonable grounds to believe a person has committed an offence, they may arrest the individual or issue a summons to appear in court. Following arrest, the accused must be informed of the reason for arrest, the right to counsel, and be given the opportunity to speak with a lawyer. Police may release the accused with conditions or hold them for a bail hearing. Crown prosecutors review the evidence and determine whether to proceed with charges.',
      requirements: [
        'Proper arrest procedure and Charter rights notification',
        'Access to legal counsel',
        'Formal charging document'
      ],
      timeline: {
        minDays: 1,
        maxDays: 7,
        description: 'Usually within 24 hours for bail hearing following arrest'
      },
      forms: [
        {
          id: 'information',
          name: 'Information',
          description: 'The formal charging document that initiates criminal proceedings'
        },
        {
          id: 'promise-to-appear',
          name: 'Promise to Appear',
          description: 'Document issued when police release an accused with an obligation to appear in court'
        }
      ],
      warnings: [
        'Failure to appear in court as required will result in additional charges',
        'Violation of release conditions can result in detention until trial'
      ]
    },
    {
      id: 'bail-hearing',
      title: 'Bail Hearing',
      description: 'Determination of pre-trial release or detention',
      details: 'If not released by police, the accused must be brought before a judge or justice of the peace within 24 hours for a bail hearing (also called a "show cause" or "judicial interim release" hearing). The Crown must show cause why the accused should remain in custody, except for certain serious offences where the accused must justify why they should be released. The court may order release with conditions, release with a surety, or detention until trial.',
      requirements: [
        'Bail hearing within 24 hours of arrest',
        'Legal representation (duty counsel available if needed)',
        'Potential surety (person who vouches for accused)'
      ],
      timeline: {
        minDays: 1,
        maxDays: 3,
        description: 'Initial hearing within 24 hours; may be adjourned briefly to arrange sureties'
      },
      costs: [
        {
          description: 'Bail amount (if applicable)',
          amount: 'Varies widely based on offence and risk factors'
        }
      ],
      warnings: [
        'Some serious charges carry a reverse onus where the accused must show why they should be released',
        'Violation of bail conditions can result in immediate re-arrest'
      ]
    },
    {
      id: 'first-appearance',
      title: 'First Appearance',
      description: 'Initial court proceeding',
      details: 'The first appearance is typically administrative in nature. The accused is formally advised of the charges, and matters regarding disclosure of evidence and legal representation are addressed. For less serious offences, the accused may be asked to enter a plea at this stage. For indictable (more serious) offences, the plea typically comes later. This appearance may be adjourned to allow time for the accused to review disclosure and obtain legal advice.',
      requirements: [
        'Appearance in person or by counsel',
        'Review of charges'
      ],
      timeline: {
        minDays: 1,
        maxDays: 30,
        description: 'Usually within 1-4 weeks after arrest/summons'
      },
      tips: [
        'Consider applying for legal aid if you cannot afford a lawyer',
        'Do not enter a plea until you have reviewed disclosure and obtained legal advice',
        'Ask about diversion programs if eligible'
      ]
    },
    {
      id: 'disclosure',
      title: 'Disclosure',
      description: 'Crown provides evidence to the defence',
      details: 'The Crown has a constitutional obligation to provide the defence with all relevant evidence in its possession, whether favorable or unfavorable to the accused. This includes witness statements, police notes, scientific reports, video recordings, and any other material relevant to the case. Disclosure is an ongoing process, and the Crown must continue to provide new evidence as it becomes available. The defence reviews this material to prepare the case.',
      requirements: [
        'Crown must provide all relevant evidence',
        'Defence must follow confidentiality rules regarding disclosure'
      ],
      timeline: {
        minDays: 30,
        maxDays: 120,
        description: 'Initial disclosure within 4-8 weeks; ongoing as needed'
      },
      tips: [
        'Review disclosure carefully with your lawyer',
        'Identify any missing evidence and request it formally',
        'Look for inconsistencies or Charter violations'
      ]
    },
    {
      id: 'election-plea',
      title: 'Election and Plea',
      description: 'Choosing trial type and formally responding to charges',
      details: 'For hybrid or indictable offences, the accused must make an election regarding the type of trial: provincial court judge alone, superior court judge alone, or superior court judge and jury. After reviewing disclosure and obtaining legal advice, the accused enters a plea of guilty or not guilty. A guilty plea results in proceeding to sentencing, while a not guilty plea leads to trial scheduling.',
      requirements: [
        'Understanding of election options',
        'Informed decision on plea'
      ],
      timeline: {
        minDays: 1,
        maxDays: 60,
        description: 'Usually after sufficient time to review disclosure'
      },
      tips: [
        'Consider the practical implications of different trial options',
        'A guilty plea typically results in a more lenient sentence than if convicted after trial',
        'Discuss all options thoroughly with your lawyer before making decisions'
      ]
    },
    {
      id: 'preliminary-inquiry',
      title: 'Preliminary Inquiry',
      description: 'Pre-trial hearing to determine if sufficient evidence exists',
      details: 'For certain indictable offences where the accused has elected trial in superior court, a preliminary inquiry may be held. This is a hearing before a provincial court judge to determine if there is sufficient evidence for the case to proceed to trial. The Crown presents evidence, and the defence may cross-examine witnesses. If the judge finds sufficient evidence, the accused is committed to stand trial.',
      requirements: [
        'Request for preliminary inquiry',
        'Statement of issues to be explored'
      ],
      timeline: {
        minDays: 60,
        maxDays: 180,
        description: 'Typically 2-6 months after election'
      },
      tips: [
        'Use the preliminary inquiry to test Crown evidence',
        'Witnesses\' testimony under oath may be used at trial if they change their story',
        'Consider whether a preliminary inquiry serves your defence strategy'
      ],
      warnings: [
        'Preliminary inquiries are now limited in scope and availability following recent legal reforms'
      ]
    },
    {
      id: 'pre-trial-motions',
      title: 'Pre-Trial Motions',
      description: 'Legal arguments before trial begins',
      details: 'Before trial, either side may bring motions to address legal issues. Common pre-trial motions include Charter applications to exclude evidence obtained in violation of the accused\'s rights, disclosure motions seeking specific evidence, and third-party records applications. These motions may significantly impact the evidence available at trial and sometimes result in charges being dismissed.',
      requirements: [
        'Written motion materials',
        'Legal arguments and case law',
        'Supporting evidence'
      ],
      timeline: {
        minDays: 30,
        maxDays: 120,
        description: 'Typically heard 1-4 months before trial'
      },
      tips: [
        'Identify potential Charter violations early',
        'File motions within prescribed timelines',
        'Prepare thorough written materials to support your position'
      ]
    },
    {
      id: 'trial',
      title: 'Trial',
      description: 'Formal hearing to determine guilt or innocence',
      details: 'The trial is where the Crown presents its case against the accused, who is presumed innocent until proven guilty beyond a reasonable doubt. The process includes opening statements, Crown evidence, defence evidence (if any), closing arguments, and the judge\'s decision or jury verdict. The Crown bears the burden of proving all elements of the offence. The accused has the right to remain silent and is not required to testify or call evidence.',
      requirements: [
        'Thorough trial preparation',
        'Witness preparation if applicable',
        'Legal arguments on admissibility of evidence'
      ],
      timeline: {
        minDays: 1,
        maxDays: 120,
        description: 'From hours for simple cases to months for complex ones'
      },
      costs: [
        {
          description: 'Legal representation at trial',
          amount: 'CAD $1,500-10,000+ per trial day'
        },
        {
          description: 'Expert witness fees (if applicable)',
          amount: 'CAD $2,000-5,000 per day'
        }
      ],
      tips: [
        'Maintain professional demeanor in court',
        'Focus on reasonable doubt in the Crown\'s case',
        'Prepare thoroughly for potential cross-examination if testifying'
      ]
    },
    {
      id: 'sentencing',
      title: 'Sentencing',
      description: 'Determination of penalty following conviction',
      details: 'If the accused pleads guilty or is found guilty after trial, the court proceeds to sentencing. Both Crown and defence make submissions on the appropriate sentence, considering factors such as the severity of the offence, the offender\'s criminal record, aggravating and mitigating circumstances, and relevant sentencing principles. The judge determines the sentence, which may include discharge, probation, fines, imprisonment, or a combination of these.',
      requirements: [
        'Pre-sentence report (in some cases)',
        'Victim impact statements (if provided)',
        'Sentencing submissions'
      ],
      timeline: {
        minDays: 1,
        maxDays: 90,
        description: 'May occur immediately after conviction or be adjourned for preparation'
      },
      tips: [
        'Gather character references and evidence of rehabilitation',
        'Address factors like remorse, rehabilitation prospects, and root causes',
        'Consider alternative or restorative justice options if appropriate'
      ]
    },
    {
      id: 'appeal',
      title: 'Appeal',
      description: 'Challenging conviction or sentence in a higher court',
      details: 'Either the Crown or defence may appeal a verdict or sentence under certain circumstances. Appeals must be filed within strict time limits (typically 30 days). Grounds for appeal may include errors of law, misapprehension of evidence, or unreasonable verdict. The appeal court may uphold the decision, order a new trial, or modify the sentence. Further appeals to the Supreme Court of Canada require leave (permission) and typically involve important questions of law.',
      requirements: [
        'Notice of appeal within time limit',
        'Grounds of appeal',
        'Transcripts of proceedings'
      ],
      timeline: {
        minDays: 180,
        maxDays: 540,
        description: 'Typically 6-18 months from filing to hearing'
      },
      costs: [
        {
          description: 'Appeal filing fees',
          amount: 'CAD $200-500'
        },
        {
          description: 'Transcript costs',
          amount: 'CAD $2,000-10,000'
        },
        {
          description: 'Legal fees for appeal',
          amount: 'CAD $5,000-25,000+'
        }
      ],
      warnings: [
        'Appeals are limited to errors of law or serious errors of fact',
        'Crown can also appeal acquittals on questions of law',
        'The "fresh evidence" rule strictly limits introduction of new evidence on appeal'
      ]
    }
  ],
  requiredDocuments: [
    {
      name: 'Information/Indictment',
      description: 'The formal charging document outlining the offences alleged against the accused.',
      source: 'Crown prosecutor\'s office'
    },
    {
      name: 'Disclosure Package',
      description: 'All relevant evidence in the Crown\'s possession related to the case.',
      source: 'Crown prosecutor\'s office'
    },
    {
      name: 'Notice of Constitutional Challenge',
      description: 'Document filed when the defence intends to challenge the constitutionality of a law or seek exclusion of evidence based on Charter violations.',
      source: 'Prepared by defence counsel'
    },
    {
      name: 'Pre-Trial Conference Report',
      description: 'Summary of issues for trial, estimated length, and other procedural matters.',
      source: 'Jointly prepared by Crown and defence'
    },
    {
      name: 'Election Form',
      description: 'Document recording the accused\'s choice of trial type (provincial court, superior court judge alone, or judge and jury).',
      source: 'Court registry'
    },
    {
      name: 'Notice of Appeal',
      description: 'Document initiating an appeal, stating grounds and relief sought.',
      source: 'Prepared by appellant\'s counsel'
    }
  ],
  faqs: [
    {
      question: 'What is the difference between summary and indictable offences?',
      answer: 'Summary offences are less serious crimes with simpler procedures, lower maximum penalties (generally up to two years less a day imprisonment), and typically heard in provincial court. Indictable offences are more serious, often have higher maximum penalties, and may be tried in either provincial or superior court, sometimes with a jury. Many offences are "hybrid," meaning the Crown can elect to proceed summarily or by indictment.'
    },
    {
      question: 'Do I need a lawyer for a criminal case?',
      answer: 'While not legally required, it is strongly recommended to have legal representation in criminal matters due to the complexity of the law and the serious potential consequences. If you cannot afford a lawyer, you may qualify for legal aid. At minimum, consider consulting duty counsel (free lawyers available at courthouses) for initial advice.'
    },
    {
      question: 'What is a conditional discharge?',
      answer: 'A conditional discharge is a sentence where you are found guilty but not convicted if you comply with certain conditions for a specified period. After successfully completing the conditions and waiting period, the discharge should be automatically removed from your criminal record. This sentence is not available for offences with minimum penalties or those with maximum penalties of 14 years or more.'
    },
    {
      question: 'Can the police search me or my property without a warrant?',
      answer: 'Police can conduct searches without a warrant in limited circumstances: with your informed consent, incident to a lawful arrest, in emergency situations where evidence might be destroyed, during traffic stops in some circumstances, and where there are "exigent circumstances." If police conduct an illegal search, the evidence may still be admissible if the court decides that excluding it would bring the administration of justice into disrepute.'
    },
    {
      question: 'What happens if I violate my bail conditions?',
      answer: 'Violating bail conditions is a separate criminal offence that can result in arrest, new charges, and detention until trial on both the original and new charges. Courts treat bail violations seriously as they represent a breach of trust, making it harder to get bail in the future.'
    },
    {
      question: 'Will my criminal record ever be cleared?',
      answer: 'Canada has a record suspension (formerly pardon) system. After a waiting period (5 years for summary offences, 10 years for indictable) following completion of your sentence, you can apply to have your record suspended if you\'ve been of good conduct. This doesn\'t erase the record but sets it apart from active records. Some serious offences are ineligible for record suspensions.'
    },
    {
      question: 'What is diversion or alternative measures?',
      answer: 'These programs allow eligible first-time or low-risk offenders to take responsibility for their actions outside the formal court process. Requirements may include community service, counseling, restitution, or apology letters. Upon successful completion, charges are withdrawn or stayed. Typically available for non-violent, less serious offences, particularly for youth and first-time offenders.'
    }
  ]
};

export default criminalProcedureData;