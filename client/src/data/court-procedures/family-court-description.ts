import { ProcedureDescriptionData } from '@/components/court-procedures/ProcedureDescription';

export const familyCourtProcedureDescription: ProcedureDescriptionData = {
  title: 'Family Court Procedure',
  iconType: 'family',
  overview: 'Family Court in Canada handles matters like divorce, custody, and support, with procedures varying by province. This description reflects a general provincial framework for resolving family law disputes.',
  steps: [
    {
      title: 'Family Law Issue Arises',
      description: 'The process begins with a dispute, such as a divorce or custody disagreement. Family issues may include separation, divorce, child custody and access, child and spousal support, or division of property.'
    },
    {
      title: 'Applicant Files Application',
      description: 'One party submits a petition or application to the court, detailing the issues and relief sought. The specific forms vary by province, but typically include an application form and supporting affidavits.'
    },
    {
      title: 'Service on Respondent',
      description: 'The application is delivered to the other party, notifying them of the legal action. Proper service is required and must generally be done in person for initial applications.'
    },
    {
      title: 'Respondent Files Response',
      description: 'The respondent submits a reply, agreeing or contesting the claims. The response must typically be filed within a specific timeframe (e.g., 30 days in many provinces).'
    },
    {
      title: 'Case Conference',
      description: 'A judge meets with the parties to identify issues, encourage settlement, and plan next steps. This is a procedural step to help manage the case and narrow the issues in dispute.'
    },
    {
      title: 'Optional: Interim Motions',
      description: 'Interim motions may be filed here for temporary orders (e.g., child support). These are requests for temporary arrangements while the case proceeds.',
      isAlternatePath: true
    },
    {
      title: 'Discovery',
      description: 'Both parties exchange relevant information, such as financial disclosures. This typically includes financial statements, income information, and other documents relevant to the issues.'
    },
    {
      title: 'Settlement Attempts',
      description: 'Mediation or negotiation may resolve the dispute without a trial. Many jurisdictions require mandatory mediation for family disputes.'
    },
    {
      title: 'Alternative Path: Settlement',
      description: 'If settled, the process ends with an agreement or consent order. The settlement is formalized in a written agreement that can be filed with the court.',
      isAlternatePath: true
    },
    {
      title: 'Trial or Hearing',
      description: 'If unresolved, a judge hears evidence and arguments. Family trials follow specific procedures, with each party presenting evidence and witnesses.'
    },
    {
      title: 'Judgment or Order',
      description: 'The court issues a decision, such as a divorce order or custody arrangement. The decision is legally binding on all parties.'
    },
    {
      title: 'Enforcement',
      description: 'If the order is not followed, enforcement measures (e.g., wage garnishment) may be pursued. Various enforcement mechanisms are available depending on the type of order.'
    },
    {
      title: 'Appeal (Optional)',
      description: 'Either party may appeal if there are legal grounds. Appeals must generally be filed within strict time limits and must be based on errors of law or procedure.'
    }
  ],
  notes: 'Settlement is encouraged throughout the family court process, often reducing the need for a trial. Many provinces have specialized family courts with unique procedures. Family disputes involving children often require consideration of the "best interests of the child" as the paramount consideration.'
};

// Ontario-specific family court procedure
export const ontarioFamilyCourtProcedureDescription: ProcedureDescriptionData = {
  title: 'Ontario Family Court Procedure',
  iconType: 'family',
  overview: 'Ontario\'s family court system handles matters like divorce, separation, custody, access, support, and property division. The process may vary slightly depending on which court the matter is heard in (Ontario Court of Justice, Superior Court of Justice, or Family Court branch of the Superior Court).',
  steps: [
    {
      title: 'Family Law Issue Arises',
      description: 'A family dispute occurs requiring court intervention, such as separation, divorce, child custody, or support matters.'
    },
    {
      title: 'Mandatory Information Program (MIP)',
      description: 'In most family court locations in Ontario, parties must attend an information session about the legal process, alternatives to litigation, and impacts on children.'
    },
    {
      title: 'Applicant Files Application',
      description: 'The applicant files the appropriate forms with the court, typically Form 8 (Application) or Form 8A (Application - Divorce), along with supporting documents like financial statements (Form 13 or 13.1).'
    },
    {
      title: 'Service on Respondent',
      description: 'The application must be served on the respondent, typically by personal service. The applicant must file an Affidavit of Service (Form 6B) proving service was completed.'
    },
    {
      title: 'Respondent Files Answer',
      description: 'The respondent has 30 days (if served in Ontario) to file an Answer (Form 10). They may also file a claim of their own through a Counter-Application.'
    },
    {
      title: 'Early Intervention Conference',
      description: 'In some courts, parties meet with court staff to identify issues, required documents, and next steps. This helps streamline the process.'
    },
    {
      title: 'Case Conference',
      description: 'A meeting with a judge to discuss issues, explore settlement options, and determine next steps. Parties must file a Case Conference Brief (Form 17A) before the conference.'
    },
    {
      title: 'Motions (If Necessary)',
      description: 'Either party may bring motions for temporary orders (Form 14/14B) regarding urgent matters like temporary support, custody, or access.',
      isAlternatePath: true
    },
    {
      title: 'Financial Disclosure',
      description: 'Both parties exchange financial information, including income documentation, assets, and debts. Full financial disclosure is mandatory in cases involving support or property.'
    },
    {
      title: 'Settlement Conference',
      description: 'A more focused attempt at settlement with a judge. Parties must file a Settlement Conference Brief (Form 17C) outlining their positions and proposals.'
    },
    {
      title: 'Alternative Path: Settlement',
      description: 'If parties reach an agreement, they can file a consent agreement or minutes of settlement that the court can incorporate into an order.',
      isAlternatePath: true
    },
    {
      title: 'Trial Management Conference',
      description: 'If settlement isn\'t reached, a final conference focuses on preparing for trial, including scheduling, witnesses, and evidence.'
    },
    {
      title: 'Trial',
      description: 'A formal hearing where both parties present evidence and witnesses. The trial follows specific procedures and rules of evidence.'
    },
    {
      title: 'Judgment',
      description: 'The judge issues a decision on all outstanding issues, which may be delivered immediately or as a written decision later.'
    },
    {
      title: 'Enforcement',
      description: 'Orders for support are typically enforced through the Family Responsibility Office (FRO). Custody and access orders may be enforced through contempt proceedings.'
    },
    {
      title: 'Appeal',
      description: 'Appeals must be filed within 30 days to the appropriate court (typically the Divisional Court or Court of Appeal depending on the originating court).'
    }
  ],
  notes: 'Ontario family law procedures are governed by the Family Law Rules (O. Reg. 114/99). Multiple conferences are designed to promote settlement at every stage. The Ontario family court system emphasizes mediation and other alternative dispute resolution methods through Family Mediation Services available at courthouses.'
};