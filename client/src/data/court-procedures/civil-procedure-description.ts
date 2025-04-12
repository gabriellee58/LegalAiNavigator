import { ProcedureDescriptionData } from '@/components/court-procedures/ProcedureDescription';

export const civilProcedureDescription: ProcedureDescriptionData = {
  title: 'Civil Procedure',
  iconType: 'civil',
  overview: 'Civil Procedure in Canada governs disputes between individuals or organizations, often involving claims for damages or specific performance. The process below is based on a general Canadian framework, with influence from Ontario\'s system as an example.',
  steps: [
    {
      title: 'Dispute Arises',
      description: 'The process begins when a disagreement occurs that cannot be resolved informally. This may include contract disputes, property damage, personal injury claims, or other civil matters.'
    },
    {
      title: 'Plaintiff Issues Statement of Claim',
      description: 'The plaintiff files a legal document with the court outlining the allegations and remedy sought. This document establishes the basis for the lawsuit and must meet certain legal requirements.'
    },
    {
      title: 'Service on Defendant',
      description: 'The statement of claim is formally delivered to the defendant, notifying them of the action. Proper service is essential and must follow court rules regarding timing and method of delivery.'
    },
    {
      title: 'Defendant Files Statement of Defense',
      description: 'The defendant responds with a document addressing the allegations, typically within a set timeframe (e.g., 20 days in Ontario). The defendant may also file a counterclaim if they have claims against the plaintiff.'
    },
    {
      title: 'Discovery',
      description: 'Both parties exchange relevant documents and may conduct oral examinations to gather evidence. This includes document discovery, interrogatories, and examinations for discovery (depositions).'
    },
    {
      title: 'Optional: Motions',
      description: 'Parties may file various motions during this stage (e.g., to compel disclosure or dismiss the case). These are interim applications to the court for specific rulings.',
      isAlternatePath: true
    },
    {
      title: 'Setting Down for Trial',
      description: 'Once discovery is complete, the case is formally scheduled for trial by filing a trial record. This indicates that all pre-trial steps have been completed and the case is ready for trial.'
    },
    {
      title: 'Pre-Trial Conference',
      description: 'The parties meet with a judge to clarify issues, explore settlement, and prepare for trial. This conference helps narrow the issues and may lead to a resolution without trial.'
    },
    {
      title: 'Alternative Path: Settlement',
      description: 'If a settlement is reached here (or at any prior stage), the process ends. Most civil cases settle before trial.',
      isAlternatePath: true
    },
    {
      title: 'Trial',
      description: 'Evidence and arguments are presented before a judge (or jury in some cases), leading to a decision. The trial follows a specific order with each party presenting their case.'
    },
    {
      title: 'Judgment',
      description: 'The court issues a ruling, which may include damages or other remedies. The judgment is the court\'s formal decision in the case.'
    },
    {
      title: 'Enforcement',
      description: 'If the losing party does not comply, the winning party may take steps to enforce the judgment (e.g., seizing assets, garnishing wages).'
    },
    {
      title: 'Appeal (Optional)',
      description: 'Either party may appeal to a higher court if they believe there was a legal or procedural error. Appeals must generally be filed within strict time limits.'
    }
  ],
  notes: 'Settlements can occur at multiple points, bypassing later steps and ending the process early. Each province has specific rules of civil procedure that may vary in details, but the general framework is similar across Canada.'
};

// Ontario-specific civil procedure
export const ontarioCivilProcedureDescription: ProcedureDescriptionData = {
  title: 'Ontario Civil Procedure',
  iconType: 'civil',
  overview: 'Ontario\'s civil procedure is governed by the Rules of Civil Procedure, which apply to actions in the Superior Court of Justice. This process is for claims exceeding the Small Claims Court limit of $35,000.',
  steps: [
    {
      title: 'Dispute Arises',
      description: 'A civil dispute occurs that cannot be resolved through negotiation or other means.'
    },
    {
      title: 'Plaintiff Issues Statement of Claim',
      description: 'The plaintiff files a Statement of Claim (Form 14A) with the court, outlining the facts, legal basis for the claim, and remedy sought. Claims must be issued within the applicable limitation period (generally 2 years).'
    },
    {
      title: 'Service on Defendant',
      description: 'The claim must be served on the defendant within 6 months of issuance. Personal service is typically required for individuals, with specific rules for corporations and other entities.'
    },
    {
      title: 'Defendant Files Statement of Defense',
      description: 'The defendant has 20 days (if served in Ontario) to file a Statement of Defense (Form 18A) addressing the allegations. If no defense is filed, the plaintiff may seek default judgment.'
    },
    {
      title: 'Reply (Optional)',
      description: 'The plaintiff may file a Reply within 10 days of receiving the Defense if they wish to address new issues raised.',
      isAlternatePath: true
    },
    {
      title: 'Discovery Plan',
      description: 'Parties must agree on a discovery plan outlining how discovery will proceed, including timelines and scope.'
    },
    {
      title: 'Affidavit of Documents',
      description: 'Each party must prepare and serve an Affidavit of Documents (Form 30A) listing all relevant documents in their possession, control, or power.'
    },
    {
      title: 'Examinations for Discovery',
      description: 'Parties conduct oral examinations under oath (similar to depositions) to gather evidence from opposing parties.'
    },
    {
      title: 'Motions (As Needed)',
      description: 'Either party may bring motions throughout the process for various purposes (e.g., summary judgment, production of documents, dismissal).',
      isAlternatePath: true
    },
    {
      title: 'Mediation',
      description: 'In Toronto, Ottawa, and Essex County, mandatory mediation must occur within 180 days of the first defense being filed, though parties elsewhere may pursue voluntary mediation.'
    },
    {
      title: 'Setting Down for Trial',
      description: 'The plaintiff files a Trial Record when all discoveries are complete, along with a Certificate of Readiness confirming all pre-trial steps are complete.'
    },
    {
      title: 'Pre-Trial Conference',
      description: 'A mandatory meeting with a judge to identify issues, explore settlement, and organize the trial. Parties must file Pre-Trial Conference Briefs before attending.'
    },
    {
      title: 'Settlement (Any Stage)',
      description: 'The case may settle at any point through negotiation, mediation, or at the pre-trial conference, which would end the process.',
      isAlternatePath: true
    },
    {
      title: 'Trial',
      description: 'The case is heard by a judge (or jury if requested). Each side presents evidence and witnesses, with specific rules for order of presentation and examination.'
    },
    {
      title: 'Judgment',
      description: 'The court issues a decision, which may be given immediately or reserved for written reasons later.'
    },
    {
      title: 'Costs',
      description: 'The court determines which party must pay legal costs, often following the principle that "costs follow the event" (the losing party pays a portion of the winner\'s costs).'
    },
    {
      title: 'Enforcement',
      description: 'The successful party may use various enforcement methods including writs of seizure and sale, garnishment, or examination in aid of execution.'
    },
    {
      title: 'Appeal',
      description: 'Appeals must generally be filed within 30 days to the Court of Appeal for Ontario. Leave to appeal may be required for certain interlocutory orders.'
    }
  ],
  notes: 'Ontario civil procedure follows Rules of Civil Procedure (R.R.O. 1990, Regulation 194). The specific process may vary based on the type of claim and jurisdictional considerations. The court also offers the Simplified Procedure for claims between $35,000 and $200,000, which streamlines some of these steps.'
};