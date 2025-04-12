import { ProcedureDescriptionData } from '@/components/court-procedures/ProcedureDescription';

export const smallClaimsProcedureDescription: ProcedureDescriptionData = {
  title: 'Small Claims Court Procedure',
  iconType: 'small-claims',
  overview: 'Small Claims Court in Canada resolves minor civil disputes, with monetary limits varying by province (e.g., $35,000 in Ontario). The process is designed to be simple and accessible for parties representing themselves.',
  steps: [
    {
      title: 'Small Claim Dispute Arises',
      description: 'The process begins with a disagreement involving a limited monetary amount that falls within the small claims court jurisdiction of your province.'
    },
    {
      title: 'Plaintiff Files Claim',
      description: 'The claimant submits a form to the court, specifying the amount and reason for the claim. Each province has specific forms and procedures for filing.'
    },
    {
      title: 'Service on Defendant',
      description: 'The claim is delivered to the defendant, who is given time to respond (typically 20 days). Service must be done according to court rules to be valid.'
    },
    {
      title: 'Defendant Files Defense',
      description: 'The defendant submits a response, contesting or admitting the claim. If no defense is filed within the time limit, the plaintiff may be able to get default judgment.'
    },
    {
      title: 'Settlement Conference',
      description: 'The parties meet with a judge or official to attempt resolution without a trial. This is a mandatory step in most provinces and helps narrow issues even if settlement isn\'t reached.'
    },
    {
      title: 'Alternative Path: Settlement',
      description: 'A settlement here ends the process. The parties may enter into minutes of settlement that can be filed with the court.',
      isAlternatePath: true
    },
    {
      title: 'Trial',
      description: 'If unresolved, a simplified trial occurs where both sides present evidence. The process is less formal than higher courts but follows rules of evidence and procedure.'
    },
    {
      title: 'Judgment',
      description: 'The judge issues a decision, typically for payment or dismissal. The decision is legally binding on all parties.'
    },
    {
      title: 'Enforcement',
      description: 'If the losing party does not pay, the winner may enforce the judgment through various means such as garnishment of wages, bank accounts, or seizure of property.'
    },
    {
      title: 'Appeal (Limited)',
      description: 'Some provinces allow appeals, though rights are often restricted in small claims. Appeals must typically be based on errors of law rather than factual disagreements.'
    }
  ],
  notes: 'The process emphasizes efficiency, with fewer formalities than higher courts. Many litigants represent themselves, though legal representation is permitted. Specific monetary limits and procedures vary by province and territory.'
};

// Ontario-specific small claims procedure
export const ontarioSmallClaimsProcedureDescription: ProcedureDescriptionData = {
  title: 'Ontario Small Claims Court Procedure',
  iconType: 'small-claims',
  overview: 'Ontario\'s Small Claims Court handles civil disputes for claims up to $35,000 (exclusive of interest and costs). The process is designed to be accessible to self-represented litigants.',
  steps: [
    {
      title: 'Small Claim Dispute Arises',
      description: 'A civil dispute occurs where the amount claimed is $35,000 or less, excluding interest and costs.'
    },
    {
      title: 'Plaintiff Files Claim',
      description: 'The plaintiff completes Form 7A (Plaintiff\'s Claim) and files it with the Small Claims Court in the appropriate jurisdiction, along with the filing fee ($102 for claims up to $3,000, $155 for claims over $3,000).'
    },
    {
      title: 'Service on Defendant',
      description: 'The plaintiff must serve the claim on the defendant within 6 months of issuance. Service can be done by personal delivery, registered mail, or in some cases, alternatives approved by the court.'
    },
    {
      title: 'Defendant Files Defense',
      description: 'The defendant has 20 days to file a Defense (Form 9A). They may also file a Defendant\'s Claim (Form 10A) against the plaintiff or others if they believe they are entitled to money related to the transaction.'
    },
    {
      title: 'Settlement Conference',
      description: 'A mandatory meeting with a judge to discuss settlement, narrow issues, and prepare for trial. All parties must attend and be prepared to discuss their case.'
    },
    {
      title: 'Alternative Path: Settlement',
      description: 'If parties reach an agreement, they may file a Terms of Settlement (Form 14D) with the court.',
      isAlternatePath: true
    },
    {
      title: 'Trial Scheduling',
      description: 'If the case doesn\'t settle, a trial date will be set. The court will send a notice of trial date with the time and location.'
    },
    {
      title: 'Trial',
      description: 'Both parties present evidence and witnesses before a judge (no jury in Small Claims Court). The trial follows a specific order: plaintiff\'s case, defendant\'s case, and closing submissions.'
    },
    {
      title: 'Judgment',
      description: 'The judge may give a decision immediately after trial or reserve judgment and provide a written decision later.'
    },
    {
      title: 'Enforcement',
      description: 'If the judgment isn\'t paid, the creditor can enforce it through garnishment (Form 20D/E), a writ of seizure and sale of land or personal property (Form 20C), or a debtor examination (Form 20H).'
    },
    {
      title: 'Appeal (Limited)',
      description: 'Appeals from Small Claims Court go to the Divisional Court and must be filed within 30 days. Appeals are generally limited to questions of law rather than factual findings.'
    }
  ],
  notes: 'Ontario Small Claims Court follows the Rules of the Small Claims Court (O. Reg. 258/98). Forms are available online through the Ontario Court Forms website. While lawyers or paralegals are permitted, many litigants represent themselves.'
};