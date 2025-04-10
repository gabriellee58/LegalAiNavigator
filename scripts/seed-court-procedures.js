import pg from 'pg';
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initial court procedure categories data
const courtProcedureCategories = [
  {
    name: 'Civil Procedure',
    description: 'Procedures for civil cases in Canadian courts',
    icon: 'scale',
    slug: 'civil-procedure',
    order: 1,
    isActive: true,
  },
  {
    name: 'Criminal Procedure',
    description: 'Procedures for criminal cases in Canadian courts',
    icon: 'gavel',
    slug: 'criminal-procedure',
    order: 2,
    isActive: true,
  },
  {
    name: 'Family Court',
    description: 'Procedures for family law cases in Canadian courts',
    icon: 'home',
    slug: 'family-court',
    order: 3,
    isActive: true,
  },
  {
    name: 'Small Claims',
    description: 'Procedures for small claims court in Canadian provinces',
    icon: 'coins',
    slug: 'small-claims',
    order: 4,
    isActive: true,
  },
  {
    name: 'Administrative Tribunals',
    description: 'Procedures for administrative tribunals in Canada',
    icon: 'building',
    slug: 'administrative-tribunals',
    order: 5,
    isActive: true,
  },
];

// Sample court procedure for Small Claims Court in Ontario
const ontarioSmallClaimsProcedure = {
  categoryId: 4, // Will reference Small Claims category
  name: 'Ontario Small Claims Court Procedure',
  description: 'Process for filing and pursuing a small claims case in Ontario for claims up to $35,000',
  jurisdiction: 'Ontario',
  steps: JSON.stringify([
    {
      title: 'Prepare your claim',
      description: 'Gather evidence and documentation related to your claim',
      order: 1
    },
    {
      title: 'File your claim',
      description: 'Complete Form 7A (Plaintiff\'s Claim) and file it with the court',
      order: 2
    },
    {
      title: 'Serve the defendant',
      description: 'Provide a copy of the claim to the defendant',
      order: 3
    },
    {
      title: 'Wait for a response',
      description: 'The defendant has 20 days to file a defense',
      order: 4
    },
    {
      title: 'Settlement conference',
      description: 'Mandatory meeting with a judge to try to settle the case',
      order: 5
    },
    {
      title: 'Trial preparation',
      description: 'If no settlement is reached, prepare for trial',
      order: 6
    },
    {
      title: 'Trial',
      description: 'Present your case before a judge',
      order: 7
    }
  ]),
  flowchartData: JSON.stringify({
    nodes: [
      { id: 'start', label: 'Start', type: 'start' },
      { id: 'prepare', label: 'Prepare Claim', type: 'process' },
      { id: 'file', label: 'File Claim', type: 'process' },
      { id: 'serve', label: 'Serve Defendant', type: 'process' },
      { id: 'response', label: 'Response?', type: 'decision' },
      { id: 'settlement', label: 'Settlement Conference', type: 'process' },
      { id: 'settled', label: 'Case Settled?', type: 'decision' },
      { id: 'trial', label: 'Trial', type: 'process' },
      { id: 'judgment', label: 'Judgment', type: 'process' },
      { id: 'end', label: 'End', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'prepare' },
      { from: 'prepare', to: 'file' },
      { from: 'file', to: 'serve' },
      { from: 'serve', to: 'response' },
      { from: 'response', to: 'settlement', label: 'Defended' },
      { from: 'response', to: 'judgment', label: 'No Defense' },
      { from: 'settlement', to: 'settled' },
      { from: 'settled', to: 'end', label: 'Yes' },
      { from: 'settled', to: 'trial', label: 'No' },
      { from: 'trial', to: 'judgment' },
      { from: 'judgment', to: 'end' }
    ]
  }),
  estimatedTimeframes: JSON.stringify({
    total: '4-8 months',
    phases: {
      'Filing to Service': '1-2 weeks',
      'Service to Defense': '20 days',
      'Defense to Settlement Conference': '2-3 months',
      'Settlement Conference to Trial': '1-3 months'
    }
  }),
  courtFees: JSON.stringify({
    'Filing Fee': '$102',
    'Service Fee': 'Varies (approximately $30-100)',
    'Motion Fee': '$45',
    'Certified Copies': '$5 per copy'
  }),
  requirements: JSON.stringify({
    jurisdiction: 'Claim must be for $35,000 or less',
    documentation: [
      'Completed Form 7A (Plaintiff\'s Claim)',
      'Evidence supporting your claim',
      'Government-issued ID'
    ],
    limitations: 'Must be filed within 2 years of the event',
    fees: 'Filing fees apply'
  }),
  sourceName: 'Ontario Court of Justice',
  sourceUrl: 'https://www.ontariocourts.ca/ocj/self-represented-parties/guide-for-defendants-in-small-claims-court/',
  relatedForms: JSON.stringify({
    'Form 7A': 'Plaintiff\'s Claim',
    'Form 9A': 'Certificate of Service',
    'Form 18A': 'Settlement Conference Brief',
    'Form 20A': 'Notice of Default Judgment'
  }),
  isActive: true,
};

// Sample procedure steps for Ontario Small Claims
const ontarioSmallClaimsSteps = [
  {
    procedureId: 1, // Will be set to match the procedure
    title: 'Prepare your claim',
    description: 'Gather all evidence and documentation related to your claim',
    stepOrder: 1,
    estimatedTime: '1-2 weeks',
    requiredDocuments: JSON.stringify([
      'Contracts or agreements',
      'Receipts or invoices',
      'Correspondence (emails, letters)',
      'Photos or videos if relevant',
      'Witness information'
    ]),
    instructions: 'Collect and organize all documentation that supports your claim. Make copies of everything.',
    tips: JSON.stringify([
      'Make a timeline of events',
      'Calculate the exact amount you are claiming',
      'Include interest calculations if applicable',
      'Prepare a summary of your case in simple language'
    ]),
    warnings: JSON.stringify([
      'Claims must be filed within 2 years of the incident',
      'You can only claim up to $35,000 in Small Claims Court',
      'Ensure you have the correct legal name of the defendant'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([2]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Ontario Small Claims Court Guide',
        url: 'https://www.attorneygeneral.jus.gov.on.ca/english/courts/scc/'
      }
    ])
  },
  {
    procedureId: 1,
    title: 'File your claim',
    description: 'Complete Form 7A (Plaintiff\'s Claim) and file it with the court',
    stepOrder: 2,
    estimatedTime: '1 day',
    requiredDocuments: JSON.stringify([
      'Completed Form 7A',
      'Filing fee payment',
      'Supporting documents (optional)'
    ]),
    instructions: 'Fill out Form 7A completely. File it at the Small Claims Court in the jurisdiction where the incident occurred or where the defendant lives/works.',
    tips: JSON.stringify([
      'Double-check all defendant information',
      'Be specific about the amount claimed',
      'Provide a clear, concise statement of your claim',
      'Keep your filing receipt'
    ]),
    warnings: JSON.stringify([
      'Filing fees must be paid',
      'Form must be complete and accurate',
      'File in the correct court location'
    ]),
    fees: JSON.stringify({
      'Filing Fee': '$102'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([3]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Form 7A - Plaintiff\'s Claim',
        url: 'http://ontariocourtforms.on.ca/static/media/uploads/courtforms/scc/7a/rcp_e_0307a_11_fillable.pdf'
      }
    ])
  },
  {
    procedureId: 1,
    title: 'Serve the defendant',
    description: 'Provide a copy of the claim to the defendant within 6 months of filing',
    stepOrder: 3,
    estimatedTime: '1-2 weeks',
    requiredDocuments: JSON.stringify([
      'Copy of filed Form 7A',
      'Form 9A (Certificate of Service)'
    ]),
    instructions: 'The defendant must be personally served with a copy of your claim. This can be done by someone over 18 who is not a party to the action. After service, complete Form 9A (Certificate of Service) and file it with the court.',
    tips: JSON.stringify([
      'Consider using a professional process server',
      'Keep proof of service',
      'File the Certificate of Service promptly',
      'Service must be completed within 6 months of filing'
    ]),
    warnings: JSON.stringify([
      'You cannot serve the documents yourself',
      'Improper service can delay your case',
      'Keep track of the 6-month deadline'
    ]),
    fees: JSON.stringify({
      'Process Server': '$30-100'
    }),
    isOptional: false,
    nextStepIds: JSON.stringify([4]),
    alternatePathInfo: 'If you cannot locate the defendant, you may need to request alternative service methods from the court.',
    sourceReferences: JSON.stringify([
      {
        name: 'Form 9A - Certificate of Service',
        url: 'http://ontariocourtforms.on.ca/static/media/uploads/courtforms/scc/9a/rcp_e_0309a_11_ac.pdf'
      }
    ])
  },
  {
    procedureId: 1,
    title: 'Wait for a response',
    description: 'The defendant has 20 days to file a defense',
    stepOrder: 4,
    estimatedTime: '20 days',
    requiredDocuments: JSON.stringify([]),
    instructions: 'After being served, the defendant has 20 days to file a Defense (Form 9B). If they don\'t respond, you can request a default judgment.',
    tips: JSON.stringify([
      'Mark the calendar for the 20-day deadline',
      'Check with the court after 20 days to confirm if a defense was filed',
      'Prepare Form 20A (Notice of Default Judgment) in case no defense is filed'
    ]),
    warnings: JSON.stringify([
      'The defendant may file for an extension',
      'The defendant may file a counterclaim against you',
      'Do not assume you will win by default'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([5, 7]),
    alternatePathInfo: 'If no defense is filed, you can request a default judgment. If a defense is filed, the case will proceed to a settlement conference.',
    sourceReferences: JSON.stringify([
      {
        name: 'Default Judgment Procedure',
        url: 'https://www.ontariocourts.ca/ocj/self-represented-parties/guide-for-defendants-in-small-claims-court/guide/'
      }
    ])
  },
  {
    procedureId: 1,
    title: 'Settlement conference',
    description: 'Mandatory meeting with a judge to try to settle the case',
    stepOrder: 5,
    estimatedTime: '1-2 hours for the conference; 2-3 months from filing to get a date',
    requiredDocuments: JSON.stringify([
      'Form 18A (Settlement Conference Brief)',
      'All documents you intend to use at trial',
      'List of witnesses'
    ]),
    instructions: 'Prepare and file Form 18A at least 14 days before the settlement conference. Attend the conference prepared to discuss settlement options.',
    tips: JSON.stringify([
      'Be prepared to compromise',
      'Bring all relevant documents',
      'Consider what you would accept to settle',
      'Listen carefully to the judge\'s assessment of your case'
    ]),
    warnings: JSON.stringify([
      'Failing to attend can result in penalties or dismissal',
      'Be respectful and professional',
      'You must file your settlement conference brief on time'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([6, 7]),
    alternatePathInfo: 'If the case settles at the conference, the terms will be put in writing and the case will end. If not, a trial date will be set.',
    sourceReferences: JSON.stringify([
      {
        name: 'Form 18A - Settlement Conference Brief',
        url: 'http://ontariocourtforms.on.ca/static/media/uploads/courtforms/scc/18a/scc18a_e.pdf'
      }
    ])
  },
  {
    procedureId: 1,
    title: 'Trial preparation',
    description: 'If no settlement is reached, prepare for trial',
    stepOrder: 6,
    estimatedTime: '2-4 weeks',
    requiredDocuments: JSON.stringify([
      'All evidence documents (organized)',
      'Witness list',
      'Written questions for witnesses',
      'Timeline of events',
      'Summary of your legal arguments'
    ]),
    instructions: 'Organize all your evidence. Contact witnesses to ensure they can attend. Prepare questions for all witnesses, including the defendant\'s witnesses. Practice your presentation.',
    tips: JSON.stringify([
      'Visit a court to observe a trial if possible',
      'Create a binder with tabbed sections for easy reference',
      'Prepare a brief opening statement',
      'Consider how to address weaknesses in your case',
      'Dress professionally for court'
    ]),
    warnings: JSON.stringify([
      'All evidence must be shared with the defendant before trial',
      'Witnesses must have first-hand knowledge (not hearsay)',
      'Expert witnesses require special notice',
      'Be prepared for cross-examination'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([7]),
    alternatePathInfo: null,
    sourceReferences: JSON.stringify([
      {
        name: 'Preparing for Trial - Small Claims Court',
        url: 'https://www.attorneygeneral.jus.gov.on.ca/english/courts/scc/preparing_for_trial.php'
      }
    ])
  },
  {
    procedureId: 1,
    title: 'Trial',
    description: 'Present your case before a judge',
    stepOrder: 7,
    estimatedTime: '1-4 hours (depending on complexity)',
    requiredDocuments: JSON.stringify([
      'All evidence documents (3 copies)',
      'Notes for testimony',
      'List of expenses and damages'
    ]),
    instructions: 'Arrive early. Present your case clearly and concisely. Call your witnesses. Cross-examine the defendant\'s witnesses. Provide a brief closing statement.',
    tips: JSON.stringify([
      'Address the judge as "Your Honour"',
      'Speak clearly and remain calm',
      'Focus on facts, not emotions',
      'Listen carefully to questions',
      'Take notes during the defendant\'s presentation'
    ]),
    warnings: JSON.stringify([
      'Do not interrupt the judge or witnesses',
      'Be truthful at all times',
      'The judge may reserve decision (not decide immediately)',
      'Follow courtroom protocol'
    ]),
    isOptional: false,
    nextStepIds: JSON.stringify([]),
    alternatePathInfo: 'The judge may give the decision immediately or "reserve" it to provide a written decision later.',
    sourceReferences: JSON.stringify([
      {
        name: 'Small Claims Court Trial Guide',
        url: 'https://www.attorneygeneral.jus.gov.on.ca/english/courts/scc/'
      }
    ])
  }
];

async function seedCourtProcedures() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Inserting court procedure categories...');
    
    // Insert categories
    for (const category of courtProcedureCategories) {
      const result = await client.query(
        `INSERT INTO court_procedure_categories 
         (name, description, icon, slug, "order", is_active, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
         RETURNING id`,
        [category.name, category.description, category.icon, category.slug, category.order, category.isActive]
      );
      
      console.log(`Inserted category: ${category.name} with ID: ${result.rows[0].id}`);
    }
    
    console.log('Inserting court procedures...');
    
    // Insert Ontario Small Claims procedure
    const procedureResult = await client.query(
      `INSERT INTO court_procedures 
       (category_id, name, description, jurisdiction, steps, flowchart_data, 
        estimated_timeframes, court_fees, requirements, source_name, source_url, 
        related_forms, is_active, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
       RETURNING id`,
      [
        ontarioSmallClaimsProcedure.categoryId,
        ontarioSmallClaimsProcedure.name,
        ontarioSmallClaimsProcedure.description,
        ontarioSmallClaimsProcedure.jurisdiction,
        ontarioSmallClaimsProcedure.steps,
        ontarioSmallClaimsProcedure.flowchartData,
        ontarioSmallClaimsProcedure.estimatedTimeframes,
        ontarioSmallClaimsProcedure.courtFees,
        ontarioSmallClaimsProcedure.requirements,
        ontarioSmallClaimsProcedure.sourceName,
        ontarioSmallClaimsProcedure.sourceUrl,
        ontarioSmallClaimsProcedure.relatedForms,
        ontarioSmallClaimsProcedure.isActive
      ]
    );
    
    const procedureId = procedureResult.rows[0].id;
    console.log(`Inserted procedure: ${ontarioSmallClaimsProcedure.name} with ID: ${procedureId}`);
    
    console.log('Inserting procedure steps...');
    
    // Insert procedure steps
    for (const step of ontarioSmallClaimsSteps) {
      step.procedureId = procedureId; // Set the actual procedure ID
      
      await client.query(
        `INSERT INTO court_procedure_steps 
         (procedure_id, title, description, step_order, estimated_time, 
          required_documents, instructions, tips, warnings, fees, 
          is_optional, next_step_ids, alternate_path_info, source_references, created_at) 
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
          step.isOptional,
          step.nextStepIds,
          step.alternatePathInfo,
          step.sourceReferences
        ]
      );
      
      console.log(`Inserted step: ${step.title} for procedure ID: ${procedureId}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Court procedures seeding completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding court procedures:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seeding function
try {
  await seedCourtProcedures();
  console.log('Court procedures seeding script completed');
  pool.end();
} catch (err) {
  console.error('Seeding script failed:', err);
  pool.end();
  process.exit(1);
}