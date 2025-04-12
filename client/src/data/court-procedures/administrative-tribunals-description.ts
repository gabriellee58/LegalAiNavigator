import { ProcedureDescriptionData } from '@/components/court-procedures/ProcedureDescription';

export const administrativeTribunalsProcedureDescription: ProcedureDescriptionData = {
  title: 'Administrative Tribunals Procedure',
  iconType: 'administrative',
  overview: 'Administrative Tribunals in Canada adjudicate specialized disputes (e.g., labor, immigration), with procedures varying by tribunal. This is a general framework for the process common to most administrative bodies.',
  steps: [
    {
      title: 'Administrative Law Issue Arises',
      description: 'The process starts with a dispute or application within a tribunal\'s jurisdiction. This could involve employment matters, human rights complaints, immigration issues, landlord-tenant disputes, or other specialized areas of law.'
    },
    {
      title: 'Applicant Files Application',
      description: 'The claimant submits the required forms or complaint to the tribunal. Each tribunal has specific forms and filing procedures that must be followed within prescribed time limits.'
    },
    {
      title: 'Notice to Respondent',
      description: 'The tribunal notifies the other party of the proceedings. The respondent is provided with the complaint or application and information about the process.'
    },
    {
      title: 'Respondent Files Response',
      description: 'The respondent submits their position or defense. This response must typically be filed within a specific timeframe set by the tribunal\'s rules.'
    },
    {
      title: 'Pre-Hearing Procedures',
      description: 'Steps like document disclosure, witness lists, or motions occur to prepare for the hearing. Many tribunals have case management procedures to streamline the process.'
    },
    {
      title: 'Alternative Path: Mediation/Settlement',
      description: 'Many administrative tribunals offer or require mediation or settlement conferences before proceeding to a hearing.',
      isAlternatePath: true
    },
    {
      title: 'Hearing',
      description: 'Both parties present evidence and arguments before the tribunal panel or adjudicator. Hearings are typically less formal than court proceedings but follow specific rules of procedure.'
    },
    {
      title: 'Decision',
      description: 'The tribunal issues a ruling based on the evidence and applicable law. Administrative tribunal decisions are typically written and include reasons.'
    },
    {
      title: 'Review or Appeal (Optional)',
      description: 'Depending on the tribunal, parties may request an internal review or appeal to a court. Some tribunals have internal appeal processes, while others allow for judicial review by the courts.'
    }
  ],
  notes: 'Specific rules depend on the tribunal (e.g., Human Rights Tribunal vs. Labour Relations Board), but this captures the core flow. Administrative tribunals are created by statute and have jurisdiction only over matters assigned to them by law. Their procedures are generally designed to be more accessible and less formal than courts.'
};

// Example of a specific administrative tribunal procedure - Canadian Human Rights Tribunal
export const humanRightsTribunalProcedureDescription: ProcedureDescriptionData = {
  title: 'Canadian Human Rights Tribunal Procedure',
  iconType: 'administrative',
  overview: 'The Canadian Human Rights Tribunal adjudicates cases referred by the Canadian Human Rights Commission involving alleged discrimination or harassment under the Canadian Human Rights Act.',
  steps: [
    {
      title: 'Human Rights Complaint Filed',
      description: 'A person files a complaint with the Canadian Human Rights Commission (CHRC) alleging discrimination based on prohibited grounds (e.g., race, gender, disability).'
    },
    {
      title: 'Commission Investigation',
      description: 'The CHRC investigates the complaint to determine if it has merit. This includes gathering evidence and statements from all parties.'
    },
    {
      title: 'Alternative Path: Early Resolution',
      description: 'The CHRC offers mediation services at any point in the process which may resolve the complaint without proceeding further.',
      isAlternatePath: true
    },
    {
      title: 'Commission Decision',
      description: 'The CHRC decides whether to dismiss the complaint, recommend a settlement, or refer the case to the Canadian Human Rights Tribunal.'
    },
    {
      title: 'Referral to Tribunal',
      description: 'If referred, the complaint becomes a formal case before the Canadian Human Rights Tribunal, which operates independently from the Commission.'
    },
    {
      title: 'Statement of Particulars',
      description: 'The Commission files a Statement of Particulars outlining the allegations, and the respondent files a response. These documents frame the issues for the hearing.'
    },
    {
      title: 'Case Management Conference',
      description: 'The Tribunal holds a conference to establish timelines, disclosure requirements, and hearing dates. Procedural matters are addressed at this stage.'
    },
    {
      title: 'Disclosure of Documents',
      description: 'Parties exchange all relevant documents and evidence that will be used at the hearing, according to the schedule established.'
    },
    {
      title: 'Alternative Path: Settlement Conference',
      description: 'The Tribunal may conduct a settlement conference to explore resolution options before proceeding to a hearing.',
      isAlternatePath: true
    },
    {
      title: 'Hearing',
      description: 'A formal hearing is held where parties present evidence, examine witnesses, and make legal arguments. While less formal than court, specific rules of procedure apply.'
    },
    {
      title: 'Decision',
      description: 'The Tribunal issues a written decision with reasons, determining if discrimination occurred and ordering remedies if appropriate.'
    },
    {
      title: 'Remedies (If Applicable)',
      description: 'If discrimination is found, the Tribunal may order various remedies including compensation, policy changes, or specific accommodations.'
    },
    {
      title: 'Judicial Review',
      description: 'Either party may apply to the Federal Court for judicial review of the Tribunal\'s decision, typically within 30 days of the decision.'
    }
  ],
  notes: 'The Canadian Human Rights Tribunal process is governed by the Canadian Human Rights Act and the Tribunal\'s Rules of Procedure. While this example is specific to the federal human rights system, each province has its own human rights tribunal with similar but distinct procedures. The process emphasizes accessibility for self-represented individuals.'
};