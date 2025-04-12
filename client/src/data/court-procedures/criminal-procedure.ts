import { CourtProcedureData } from './types';

const criminalProcedureData: CourtProcedureData = {
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
    },
    {
      id: 'arrest-charge',
      title: 'Arrest and Charge',
      description: 'Formal accusation of criminal conduct',
      details: 'If police believe there are reasonable and probable grounds that you committed an offence, they may arrest you. After arrest, the Crown prosecutor decides whether to lay charges based on the likelihood of conviction and public interest in prosecution.',
      timeline: {
        minDays: 1,
        maxDays: 7,
        description: 'Charges are typically laid shortly after arrest'
      },
      forms: [
        {
          id: 'information',
          name: 'Information',
          description: 'The formal document that starts a criminal proceeding',
          url: 'https://www.justice.gc.ca/eng/cj-jp/victims-victimes/court-tribunaux/charges.html'
        }
      ]
    },
    {
      id: 'bail',
      title: 'Bail Hearing',
      description: 'Determination if accused should be released before trial',
      details: 'A bail hearing (also called a "show cause hearing") determines whether you will be released while awaiting trial, and under what conditions. The onus is usually on the Crown to show why you should be detained.',
      timeline: {
        minDays: 1,
        maxDays: 3,
        description: 'Must occur within 24 hours of arrest (excluding holidays and weekends)'
      }
    },
    {
      id: 'first-appearance',
      title: 'First Appearance',
      description: 'Initial court appearance to address procedural matters',
      details: 'At the first appearance, you will be informed of the charges against you and may be asked how you plead. Often, this is adjourned to allow time to retain a lawyer, review disclosure, or discuss resolution with the Crown.',
      timeline: {
        minDays: 1,
        maxDays: 30,
        description: 'Typically within days or weeks of charge'
      }
    },
    {
      id: 'disclosure',
      title: 'Disclosure',
      description: 'Receipt of evidence the Crown has against the accused',
      details: 'The Crown must provide all relevant evidence they have against you, including potentially exculpatory evidence. This includes police reports, witness statements, videos, etc.',
      timeline: {
        minDays: 30,
        maxDays: 180,
        description: 'Initial disclosure before plea, continuing obligation thereafter'
      }
    },
    {
      id: 'plea',
      title: 'Plea',
      description: 'Formal response to the charges',
      details: 'After reviewing disclosure, you will be asked to enter a plea of guilty or not guilty. If you plead guilty, the process moves to sentencing. If not guilty, the process continues to trial.',
      timeline: {
        minDays: 1,
        maxDays: 1,
        description: 'Takes place during a court appearance'
      }
    },
    {
      id: 'pre-trial',
      title: 'Pre-Trial Proceedings',
      description: 'Preparation and procedural matters before trial',
      details: 'Pre-trial proceedings may include judicial pre-trials (meetings between judge, Crown, and defence), preliminary inquiries (for indictable offences to determine if there is sufficient evidence to proceed to trial), and Charter applications (to challenge aspects of the case).',
      timeline: {
        minDays: 30,
        maxDays: 365,
        description: 'Varies greatly depending on complexity of case'
      }
    },
    {
      id: 'trial',
      title: 'Trial',
      description: 'Formal court process to determine guilt or innocence',
      details: 'At trial, the Crown presents evidence to prove guilt beyond a reasonable doubt. The defence may challenge this evidence and/or present its own evidence. For serious offences, you may have the right to a jury trial.',
      timeline: {
        minDays: 1,
        maxDays: 90,
        description: 'From half a day for simple matters to weeks or months for complex cases'
      }
    },
    {
      id: 'verdict',
      title: 'Verdict',
      description: 'Decision on guilt or innocence',
      details: 'After hearing all evidence, the judge or jury renders a verdict of guilty or not guilty. A finding of not guilty results in acquittal. A guilty verdict moves the process to sentencing.',
      timeline: {
        minDays: 1,
        maxDays: 30,
        description: 'Immediately after trial or after a period of deliberation'
      }
    },
    {
      id: 'sentencing',
      title: 'Sentencing',
      description: 'Determination of punishment if found guilty',
      details: 'If convicted, the judge determines the appropriate sentence considering factors such as the severity of the offence, your criminal record, mitigating factors, aggravating factors, and sentencing principles in the Criminal Code.',
      timeline: {
        minDays: 1,
        maxDays: 90,
        description: 'May occur immediately after verdict or at a later date'
      }
    },
    {
      id: 'appeal',
      title: 'Appeals',
      description: 'Challenging the verdict or sentence',
      details: 'If there are legal grounds, you may appeal your conviction and/or sentence to a higher court. Appeals are typically based on errors of law or procedure, not simply disagreement with the outcome.',
      timeline: {
        minDays: 30,
        maxDays: 730,
        description: 'Notice of appeal usually must be filed within 30 days; appeal process may take 1-2 years'
      }
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
      description: 'All relevant evidence the Crown has related to the charges, including police reports, witness statements, and other evidence.',
      source: 'Crown prosecutor\'s office'
    },
    {
      name: 'Bail Order',
      description: 'Document outlining the conditions of release while awaiting trial, if bail is granted.',
      source: 'Court registry'
    },
    {
      name: 'Notice of Application',
      description: 'Filed by defence counsel to make pre-trial applications, such as Charter challenges.',
      source: 'Prepared by defence counsel'
    },
    {
      name: 'Notice of Appeal',
      description: 'Document filed to initiate an appeal of conviction or sentence.',
      source: 'Prepared by defence counsel'
    }
  ],
  faqs: [
    {
      question: 'What is the difference between summary and indictable offences?',
      answer: 'Summary offences are less serious, with simpler procedures and lesser maximum penalties (generally up to 2 years imprisonment). Indictable offences are more serious, often with higher penalties, and may include the right to a jury trial. Some offences are "hybrid," meaning the Crown can elect to proceed either way.'
    },
    {
      question: 'Do I need a lawyer for a criminal case?',
      answer: 'While you have the right to represent yourself, it\'s strongly recommended to have legal representation for criminal matters due to the complexity of criminal law and the potential serious consequences. If you cannot afford a lawyer, you may qualify for legal aid.'
    },
    {
      question: 'What happens if I can\'t afford bail?',
      answer: 'If you cannot afford bail, you may remain in custody until your trial. In some provinces, there are bail verification and supervision programs that can provide support. You may also be able to have a surety (someone who promises to supervise you) help secure your release.'
    },
    {
      question: 'What rights do I have when arrested?',
      answer: 'Under the Charter of Rights and Freedoms, you have the right to be informed of the reason for arrest, to speak to a lawyer without delay, to remain silent, to be brought before a justice within 24 hours, and to a fair trial. You also have the right to be protected from unreasonable search and seizure.'
    },
    {
      question: 'What is a conditional sentence or discharge?',
      answer: 'A conditional discharge means you\'re found guilty but no conviction is registered if you fulfill certain conditions. An absolute discharge means you\'re found guilty but no conviction is registered and no conditions are imposed. A conditional sentence is a jail sentence served in the community under strict conditions.'
    }
  ]
};

export default criminalProcedureData;