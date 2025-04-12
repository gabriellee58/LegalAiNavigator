import { ProcedureDescriptionData } from '@/components/court-procedures/ProcedureDescription';

export const criminalProcedureDescription: ProcedureDescriptionData = {
  title: 'Criminal Procedure',
  iconType: 'criminal',
  overview: 'Criminal Procedure in Canada, governed by the Criminal Code, addresses the prosecution of individuals accused of crimes. This is a federal process, consistent across provinces, though there may be some procedural variations.',
  steps: [
    {
      title: 'Crime Committed',
      description: 'The process starts with the occurrence of an alleged criminal act. This may be reported by victims, witnesses, or discovered through police investigation.'
    },
    {
      title: 'Police Investigation',
      description: 'Law enforcement gathers evidence to determine if a crime occurred and identify a suspect. This may include interviewing witnesses, collecting physical evidence, and other investigative techniques.'
    },
    {
      title: 'Charges Laid',
      description: 'If evidence is sufficient, the Crown prosecutor authorizes charges against the accused. The Crown must believe there is a reasonable prospect of conviction and that prosecution is in the public interest.'
    },
    {
      title: 'Accused Arrested or Summoned',
      description: 'The accused is either arrested or issued a summons to appear in court. Following arrest, the police may release the accused with conditions or hold them for a bail hearing.'
    },
    {
      title: 'First Court Appearance',
      description: 'The charges are read, and the accused may enter a plea (guilty or not guilty). In this initial appearance, the court also addresses matters such as disclosure of evidence and legal representation.'
    },
    {
      title: 'Bail Hearing (If Applicable)',
      description: 'If detained, the accused may request release on bail; the court decides based on flight risk and public safety. These hearings determine if the accused will remain in custody until trial or be released with conditions.'
    },
    {
      title: 'Preliminary Inquiry (For Indictable Offenses)',
      description: 'For serious crimes, a hearing determines if there\'s enough evidence to proceed to trial. This step is optional and applies only to indictable offenses if requested by the defense.',
      isAlternatePath: true
    },
    {
      title: 'Trial',
      description: 'The case is heard by a judge alone or with a jury, with evidence presented by the Crown and defense. The prosecution must prove guilt beyond a reasonable doubt.'
    },
    {
      title: 'Alternative Path: Plea Bargain',
      description: 'A plea bargain may resolve the case before or during trial, skipping to sentencing. The accused may plead guilty, often to a lesser charge or with an agreed-upon sentencing recommendation.',
      isAlternatePath: true
    },
    {
      title: 'Verdict',
      description: 'The court determines guilt or innocence. In jury trials, the verdict must be unanimous; in judge-alone trials, the judge makes this determination.'
    },
    {
      title: 'Sentencing (If Guilty)',
      description: 'If convicted, a separate hearing sets the punishment (e.g., jail, fine). The judge considers aggravating and mitigating factors, precedent cases, and sentencing principles outlined in the Criminal Code.'
    },
    {
      title: 'Appeals (Optional)',
      description: 'The accused or Crown may appeal the verdict or sentence to a higher court. Appeals must be based on errors of law or procedure, not simply disagreement with the outcome.'
    }
  ],
  notes: 'Early guilty pleas or plea bargains can shorten the process significantly. The criminal procedure in Canada emphasizes due process and the presumption of innocence. For youth offenders (ages 12-17), there is a separate process under the Youth Criminal Justice Act.'
};