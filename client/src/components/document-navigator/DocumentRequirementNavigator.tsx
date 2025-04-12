import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, ArrowLeft, FileCheck, FileText, Download, Clipboard, ClipboardCopy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the document type
interface Document {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: string;
  obtainmentInfo?: string;
  alternatives?: string[];
  jurisdictionSpecific?: boolean;
  jurisdictions?: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

// Define the question type
interface Question {
  id: string;
  text: string;
  type: 'select' | 'radio' | 'checkbox' | 'text' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  dependsOn?: { questionId: string; value: string | string[] };
  impactsDocuments?: string[];
  key: string;
}

// Sample questions for the wizard
const questions: Question[] = [
  {
    id: 'procedure-type',
    text: 'What type of court procedure are you involved in?',
    type: 'select',
    options: [
      { value: 'civil', label: 'Civil Procedure' },
      { value: 'criminal', label: 'Criminal Procedure' },
      { value: 'family', label: 'Family Court' },
      { value: 'small-claims', label: 'Small Claims' },
      { value: 'administrative', label: 'Administrative Tribunal' },
    ],
    key: 'procedureType'
  },
  {
    id: 'jurisdiction',
    text: 'In which province or territory will this matter be heard?',
    type: 'select',
    options: [
      { value: 'ontario', label: 'Ontario' },
      { value: 'quebec', label: 'Quebec' },
      { value: 'british-columbia', label: 'British Columbia' },
      { value: 'alberta', label: 'Alberta' },
      { value: 'manitoba', label: 'Manitoba' },
      { value: 'saskatchewan', label: 'Saskatchewan' },
      { value: 'nova-scotia', label: 'Nova Scotia' },
      { value: 'new-brunswick', label: 'New Brunswick' },
      { value: 'newfoundland', label: 'Newfoundland and Labrador' },
      { value: 'pei', label: 'Prince Edward Island' },
      { value: 'nunavut', label: 'Nunavut' },
      { value: 'nwt', label: 'Northwest Territories' },
      { value: 'yukon', label: 'Yukon' },
      { value: 'federal', label: 'Federal' },
    ],
    key: 'jurisdiction'
  },
  {
    id: 'role',
    text: 'What is your role in this procedure?',
    type: 'radio',
    options: [
      { value: 'plaintiff', label: 'Plaintiff/Applicant (Initiating the case)' },
      { value: 'defendant', label: 'Defendant/Respondent (Responding to a case against you)' },
      { value: 'third-party', label: 'Third Party (Witness, affected party, etc.)' },
    ],
    key: 'role'
  },
  {
    id: 'civil-case-type',
    text: 'What type of civil case is this?',
    type: 'select',
    options: [
      { value: 'contract', label: 'Contract Dispute' },
      { value: 'personal-injury', label: 'Personal Injury' },
      { value: 'property', label: 'Property Dispute' },
      { value: 'employment', label: 'Employment Matter' },
      { value: 'debt', label: 'Debt Collection' },
      { value: 'other', label: 'Other Civil Matter' },
    ],
    dependsOn: { questionId: 'procedure-type', value: 'civil' },
    key: 'civilCaseType'
  },
  {
    id: 'family-case-type',
    text: 'What type of family matter is this?',
    type: 'select',
    options: [
      { value: 'divorce', label: 'Divorce' },
      { value: 'custody', label: 'Child Custody/Access' },
      { value: 'support', label: 'Child/Spousal Support' },
      { value: 'property-division', label: 'Property Division' },
      { value: 'protection-order', label: 'Protection/Restraining Order' },
      { value: 'other', label: 'Other Family Matter' },
    ],
    dependsOn: { questionId: 'procedure-type', value: 'family' },
    key: 'familyCaseType'
  },
  {
    id: 'criminal-case-type',
    text: 'What type of criminal case is this?',
    type: 'select',
    options: [
      { value: 'summary', label: 'Summary Offence (less serious)' },
      { value: 'indictable', label: 'Indictable Offence (more serious)' },
      { value: 'hybrid', label: 'Hybrid Offence' },
      { value: 'not-sure', label: 'Not Sure' },
    ],
    dependsOn: { questionId: 'procedure-type', value: 'criminal' },
    key: 'criminalCaseType'
  },
  {
    id: 'representation',
    text: 'Will you have legal representation?',
    type: 'radio',
    options: [
      { value: 'self-represented', label: 'Self-Represented (No lawyer)' },
      { value: 'lawyer', label: 'Represented by a Lawyer' },
      { value: 'partial', label: 'Partial Representation (Lawyer for some aspects only)' },
    ],
    key: 'representation'
  },
  {
    id: 'case-complexity',
    text: 'How would you describe the complexity of your case?',
    type: 'radio',
    options: [
      { value: 'simple', label: 'Simple (straightforward facts, few issues)' },
      { value: 'moderate', label: 'Moderate (some complexity, multiple issues)' },
      { value: 'complex', label: 'Complex (complicated facts, many issues)' },
    ],
    key: 'caseComplexity'
  },
  {
    id: 'evidence-types',
    text: 'Which types of evidence might you need to present? (Select all that apply)',
    type: 'checkbox',
    options: [
      { value: 'documents', label: 'Documents (contracts, letters, emails, etc.)' },
      { value: 'testimony', label: 'Witness Testimony' },
      { value: 'expert', label: 'Expert Opinion/Reports' },
      { value: 'medical', label: 'Medical Records' },
      { value: 'financial', label: 'Financial Records' },
      { value: 'digital', label: 'Digital Evidence (photos, videos, recordings)' },
      { value: 'physical', label: 'Physical Evidence' },
    ],
    key: 'evidenceTypes'
  },
  {
    id: 'additional-info',
    text: 'Is there anything specific about your case that might affect document requirements?',
    type: 'textarea',
    placeholder: 'E.g., international aspects, multiple parties, special circumstances...',
    key: 'additionalInfo'
  }
];

// Sample document database - in a real application, this would be more extensive and come from a backend
const documentDatabase: Document[] = [
  // Civil Procedure Documents - Common
  {
    id: 'statement-of-claim',
    name: 'Statement of Claim',
    description: 'The document that initiates a civil lawsuit, setting out the facts, legal basis, and remedy sought.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from the court registry or website. Must be completed and filed with the court.',
    complexity: 'moderate',
  },
  {
    id: 'notice-of-civil-claim',
    name: 'Notice of Civil Claim',
    description: 'Used in some provinces instead of a Statement of Claim to initiate a civil lawsuit.',
    required: true,
    category: 'Filing',
    jurisdictionSpecific: true,
    jurisdictions: ['british-columbia'],
    obtainmentInfo: 'Available from BC courts website or registry.',
    complexity: 'moderate',
  },
  {
    id: 'statement-of-defense',
    name: 'Statement of Defence',
    description: 'The defendant\'s response to a Statement of Claim, setting out their position.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from the court registry or website. Must be completed and filed with the court.',
    complexity: 'moderate',
  },
  {
    id: 'affidavit-of-service',
    name: 'Affidavit of Service',
    description: 'Confirms that legal documents were properly served on the other party.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from the court registry or website. Must be completed after serving documents.',
    complexity: 'simple',
  },
  {
    id: 'notice-of-motion',
    name: 'Notice of Motion',
    description: 'Used to request specific action or decision from the court before or during a case.',
    required: false,
    category: 'Motion',
    obtainmentInfo: 'Available from the court registry or website. Used for specific requests to the court.',
    complexity: 'moderate',
  },
  {
    id: 'affidavit',
    name: 'Affidavit',
    description: 'A written statement confirmed by oath or affirmation, for use as evidence.',
    required: false,
    category: 'Evidence',
    obtainmentInfo: 'Must be prepared according to court rules and sworn before a commissioner for oaths.',
    complexity: 'moderate',
  },
  {
    id: 'financial-statement',
    name: 'Financial Statement',
    description: 'Disclosure of financial information, required in certain types of cases.',
    required: false,
    category: 'Disclosure',
    obtainmentInfo: 'Forms available from court. Must include supporting documentation.',
    complexity: 'moderate',
  },
  {
    id: 'expert-report',
    name: 'Expert Report',
    description: 'Report from a qualified expert providing opinion evidence on technical matters.',
    required: false,
    category: 'Evidence',
    obtainmentInfo: 'Must be prepared by a qualified expert according to court rules.',
    complexity: 'complex',
  },
  
  // Family Court Documents
  {
    id: 'application-divorce',
    name: 'Application for Divorce',
    description: 'The document that initiates divorce proceedings.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from family court or website. Must be filed with the court.',
    complexity: 'moderate',
  },
  {
    id: 'marriage-certificate',
    name: 'Marriage Certificate',
    description: 'Official document proving marriage, required for divorce proceedings.',
    required: true,
    category: 'Identification',
    obtainmentInfo: 'Obtain from vital statistics office in the province where marriage occurred.',
    complexity: 'simple',
  },
  {
    id: 'separation-agreement',
    name: 'Separation Agreement',
    description: 'A contract setting out the terms of separation, division of property, support, etc.',
    required: false,
    category: 'Evidence',
    obtainmentInfo: 'Negotiated between parties, often with legal assistance.',
    complexity: 'complex',
  },
  {
    id: 'parenting-plan',
    name: 'Parenting Plan',
    description: 'Details the arrangements for parenting time and decision-making for children.',
    required: false,
    category: 'Custody',
    obtainmentInfo: 'Develop with the other parent, possibly with mediator assistance.',
    complexity: 'moderate',
  },
  {
    id: 'financial-disclosure-family',
    name: 'Financial Disclosure (Family)',
    description: 'Comprehensive disclosure of income, assets, and debts for support and property division.',
    required: true,
    category: 'Disclosure',
    obtainmentInfo: 'Forms available from family court. Include tax returns, pay stubs, etc.',
    complexity: 'complex',
  },
  
  // Criminal Procedure Documents
  {
    id: 'information',
    name: 'Information',
    description: 'Document sworn by police officer or complainant initiating criminal charges.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Prepared by police or Crown prosecutor.',
    complexity: 'moderate',
  },
  {
    id: 'disclosure-package',
    name: 'Disclosure Package',
    description: 'Evidence and information the Crown intends to rely on in the prosecution.',
    required: true,
    category: 'Disclosure',
    obtainmentInfo: 'Provided by Crown prosecutor. Can request additional disclosure if incomplete.',
    complexity: 'complex',
  },
  {
    id: 'notice-of-intention',
    name: 'Notice of Intention (to call expert evidence)',
    description: 'Advance notice of expert witnesses the defense intends to call.',
    required: false,
    category: 'Notice',
    obtainmentInfo: 'Must be provided to Crown within timelines set by Criminal Code.',
    complexity: 'moderate',
  },
  {
    id: 'bail-documents',
    name: 'Bail Documents',
    description: 'Documents supporting application for release pending trial.',
    required: false,
    category: 'Bail',
    obtainmentInfo: 'Prepare with legal counsel, may include surety declarations.',
    complexity: 'moderate',
  },
  
  // Small Claims Documents
  {
    id: 'notice-of-claim-small',
    name: 'Notice of Claim (Small Claims)',
    description: 'Document that initiates a small claims court action.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from small claims court registry or website.',
    complexity: 'simple',
  },
  {
    id: 'reply-small-claims',
    name: 'Reply / Defense (Small Claims)',
    description: 'The defendant\'s response to a small claims action.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from small claims court registry or website.',
    complexity: 'simple',
  },
  {
    id: 'certificate-of-service-small',
    name: 'Certificate of Service (Small Claims)',
    description: 'Confirms documents were properly served in small claims proceedings.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from small claims court registry or website.',
    complexity: 'simple',
  },
  
  // Administrative Tribunal Documents
  {
    id: 'notice-of-appeal-tribunal',
    name: 'Notice of Appeal/Application (Tribunal)',
    description: 'Document initiating an administrative tribunal proceeding.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from specific tribunal\'s website or office.',
    complexity: 'moderate',
  },
  {
    id: 'response-tribunal',
    name: 'Response (Tribunal)',
    description: 'Response to a tribunal application or appeal.',
    required: true,
    category: 'Filing',
    obtainmentInfo: 'Available from specific tribunal\'s website or office.',
    complexity: 'moderate',
  },
  
  // Identification and Supporting Documents
  {
    id: 'identification',
    name: 'Government-Issued Identification',
    description: 'Photo ID such as driver\'s license or passport for identity verification.',
    required: true,
    category: 'Identification',
    obtainmentInfo: 'Must be current and valid.',
    complexity: 'simple',
  },
  {
    id: 'proof-of-income',
    name: 'Proof of Income',
    description: 'Documents proving income, such as pay stubs, tax returns, or employment letters.',
    required: false,
    category: 'Financial',
    obtainmentInfo: 'Obtain from employer, accountant, or tax records.',
    complexity: 'moderate',
  },
  {
    id: 'proof-of-address',
    name: 'Proof of Address',
    description: 'Documents confirming current residential address.',
    required: false,
    category: 'Identification',
    obtainmentInfo: 'Utility bills, lease agreement, or government documents showing current address.',
    complexity: 'simple',
  }
];

const DocumentRequirementNavigator: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [requiredDocuments, setRequiredDocuments] = useState<Document[]>([]);
  const [optionalDocuments, setOptionalDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  
  // Filter questions based on dependencies
  const filteredQuestions = questions.filter(question => {
    if (!question.dependsOn) return true;
    
    const dependentQuestion = question.dependsOn.questionId;
    const requiredValue = question.dependsOn.value;
    const actualValue = answers[dependentQuestion];
    
    if (Array.isArray(requiredValue)) {
      return requiredValue.includes(actualValue);
    }
    
    return actualValue === requiredValue;
  });
  
  // Calculate progress percentage
  const progress = Math.round((currentStep / (filteredQuestions.length + 1)) * 100);
  
  // Current question to display
  const currentQuestion = currentStep < filteredQuestions.length ? filteredQuestions[currentStep] : null;
  
  // Handle user inputs
  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };
  
  // Handle checkbox inputs specially (multiple selection)
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => {
      const currentValues = prev[currentQuestion.id] || [];
      
      if (checked) {
        return {
          ...prev,
          [currentQuestion.id]: [...currentValues, optionValue]
        };
      } else {
        return {
          ...prev,
          [currentQuestion.id]: currentValues.filter((v: string) => v !== optionValue)
        };
      }
    });
  };
  
  // Move to next question
  const handleNext = () => {
    // Validate current answer if needed
    if (!currentQuestion) {
      processAnswers();
      return;
    }
    
    if (!answers[currentQuestion.id] && currentQuestion.type !== 'textarea') {
      toast({
        title: "Please provide an answer",
        description: "This information helps us determine the required documents.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < filteredQuestions.length) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      processAnswers();
    }
  };
  
  // Move to previous question
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };
  
  // Process all answers and determine required documents
  const processAnswers = () => {
    setIsLoading(true);
    
    // In a real application, this would be an API call to a backend service
    // For this demo, we'll simulate AI processing with a timeout and simple filtering logic
    setTimeout(() => {
      // Basic filtering algorithm to determine required documents
      // In a real app, this would be much more sophisticated, using AI or complex rules
      const procedureType = answers['procedure-type'];
      const userRole = answers['role'];
      const jurisdiction = answers['jurisdiction'];
      const complexity = answers['case-complexity'];
      
      // Filter documents based on procedure type and other factors
      let filtered = documentDatabase.filter(doc => {
        // Filter by procedure specific documents
        if (procedureType === 'civil' && 
            (doc.id.includes('civil') || 
             ['statement-of-claim', 'statement-of-defense', 'affidavit-of-service', 'affidavit'].includes(doc.id))) {
          return true;
        }
        
        if (procedureType === 'family' && 
            (doc.id.includes('divorce') || 
             doc.id.includes('family') || 
             ['marriage-certificate', 'separation-agreement', 'parenting-plan', 'financial-disclosure-family'].includes(doc.id))) {
          return true;
        }
        
        if (procedureType === 'criminal' && 
            (doc.id.includes('criminal') || 
             ['information', 'disclosure-package', 'notice-of-intention', 'bail-documents'].includes(doc.id))) {
          return true;
        }
        
        if (procedureType === 'small-claims' && 
            (doc.id.includes('small') || 
             ['notice-of-claim-small', 'reply-small-claims', 'certificate-of-service-small'].includes(doc.id))) {
          return true;
        }
        
        if (procedureType === 'administrative' && 
            (doc.id.includes('tribunal') || 
             ['notice-of-appeal-tribunal', 'response-tribunal'].includes(doc.id))) {
          return true;
        }
        
        // Common documents that apply to all procedure types
        if (['identification', 'proof-of-income', 'proof-of-address'].includes(doc.id)) {
          return true;
        }
        
        return false;
      });
      
      // Further filter by role (plaintiff/defendant)
      if (userRole === 'plaintiff') {
        filtered = filtered.filter(doc => {
          if (['statement-of-defense', 'reply-small-claims', 'response-tribunal'].includes(doc.id)) {
            return false;  // Defendants-only documents
          }
          return true;
        });
      }
      
      if (userRole === 'defendant') {
        filtered = filtered.filter(doc => {
          if (['statement-of-claim', 'notice-of-civil-claim', 'application-divorce', 'notice-of-claim-small', 'notice-of-appeal-tribunal'].includes(doc.id)) {
            return false;  // Plaintiffs-only documents
          }
          return true;
        });
      }
      
      // Further filter by jurisdiction if applicable
      filtered = filtered.filter(doc => {
        if (doc.jurisdictionSpecific && doc.jurisdictions && !doc.jurisdictions.includes(jurisdiction)) {
          return false;
        }
        return true;
      });
      
      // Handle evidence types
      const evidenceTypes = answers['evidence-types'] || [];
      if (evidenceTypes.includes('expert')) {
        if (!filtered.some(doc => doc.id === 'expert-report')) {
          filtered.push(documentDatabase.find(doc => doc.id === 'expert-report')!);
        }
      }
      
      if (evidenceTypes.includes('financial')) {
        if (!filtered.some(doc => doc.id === 'financial-statement')) {
          filtered.push(documentDatabase.find(doc => doc.id === 'financial-statement')!);
        }
      }
      
      // Separate required and optional documents
      const required = filtered.filter(doc => doc.required);
      const optional = filtered.filter(doc => !doc.required);
      
      setRequiredDocuments(required);
      setOptionalDocuments(optional);
      setIsLoading(false);
      setIsComplete(true);
    }, 1500); // Simulate processing time
  };
  
  // Reset the wizard
  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setRequiredDocuments([]);
    setOptionalDocuments([]);
    setIsComplete(false);
  };
  
  // Copy document list to clipboard
  const copyToClipboard = () => {
    const requiredList = requiredDocuments.map(doc => `- ${doc.name} (Required): ${doc.description}`).join('\n');
    const optionalList = optionalDocuments.map(doc => `- ${doc.name} (Optional): ${doc.description}`).join('\n');
    
    const text = `DOCUMENT CHECKLIST\n\nRequired Documents:\n${requiredList}\n\nOptional Documents:\n${optionalList}`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Document checklist copied successfully.",
      });
    }).catch(err => {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard: " + err,
        variant: "destructive",
      });
    });
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            <span>AI Document Requirement Navigator</span>
          </CardTitle>
          <CardDescription>
            Answer a few questions to get a personalized list of documents needed for your legal procedure
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-right">Step {currentStep + 1} of {filteredQuestions.length + 1}</p>
          </div>
          
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-center text-lg font-medium">Analyzing your answers...</p>
              <p className="text-center text-muted-foreground">Our AI is determining which documents you'll need based on your specific situation.</p>
            </div>
          ) : isComplete ? (
            <div className="space-y-6">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Your Personalized Document Checklist</span>
                </h3>
                <p className="text-muted-foreground mt-1 mb-3">
                  Based on your answers, here are the documents you'll need for your {answers['procedure-type']?.replace('-', ' ')} procedure in {answers['jurisdiction']?.replace('-', ' ')}.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Required Documents ({requiredDocuments.length})</h4>
                    <ScrollArea className="h-[220px] rounded-md border p-4 mt-2">
                      <div className="space-y-4">
                        {requiredDocuments.map(doc => (
                          <div key={doc.id} className="space-y-1">
                            <h5 className="font-medium flex items-start gap-2">
                              <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
                              <span>{doc.name}</span>
                            </h5>
                            <p className="text-sm text-muted-foreground pl-6">{doc.description}</p>
                            {doc.obtainmentInfo && (
                              <p className="text-sm text-primary/80 pl-6 italic">
                                <span className="font-medium">How to obtain:</span> {doc.obtainmentInfo}
                              </p>
                            )}
                          </div>
                        ))}
                        
                        {requiredDocuments.length === 0 && (
                          <p className="text-muted-foreground italic">No required documents identified based on your current answers.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">Optional Documents ({optionalDocuments.length})</h4>
                    <p className="text-sm text-muted-foreground">These may be needed depending on specific circumstances.</p>
                    <ScrollArea className="h-[200px] rounded-md border p-4 mt-2">
                      <div className="space-y-4">
                        {optionalDocuments.map(doc => (
                          <div key={doc.id} className="space-y-1">
                            <h5 className="font-medium flex items-start gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                              <span>{doc.name}</span>
                            </h5>
                            <p className="text-sm text-muted-foreground pl-6">{doc.description}</p>
                            {doc.obtainmentInfo && (
                              <p className="text-sm text-primary/70 pl-6 italic">
                                <span className="font-medium">How to obtain:</span> {doc.obtainmentInfo}
                              </p>
                            )}
                          </div>
                        ))}
                        
                        {optionalDocuments.length === 0 && (
                          <p className="text-muted-foreground italic">No optional documents identified based on your current answers.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Important Note</h4>
                    <p className="text-sm text-muted-foreground">
                      This document list is generated based on general requirements and your responses. 
                      Courts and tribunals may have additional or different document requirements. 
                      Always verify with the specific court or a legal professional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
                
                {currentQuestion.type === 'select' && (
                  <Select
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswer(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {currentQuestion.type === 'radio' && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswer(value)}
                    className="space-y-3"
                  >
                    {currentQuestion.options?.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion.type === 'checkbox' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map(option => (
                      <div key={option.value} className="flex items-start space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={answers[currentQuestion.id]?.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(option.value, checked === true)
                          }
                        />
                        <Label htmlFor={option.value} className="leading-tight">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                
                {currentQuestion.type === 'text' && (
                  <Input
                    placeholder={currentQuestion.placeholder || ''}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                )}
                
                {currentQuestion.type === 'textarea' && (
                  <Textarea
                    placeholder={currentQuestion.placeholder || ''}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p>No questions available.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          {isComplete ? (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  Copy List
                </Button>
                <Button
                  variant="default"
                  className="gap-2"
                  onClick={() => {
                    toast({
                      title: "Feature in Development",
                      description: "The document download feature will be available soon.",
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download Checklist
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              
              <Button onClick={handleNext}>
                {currentStep < filteredQuestions.length - 1 ? 'Next' : 'Generate Document List'}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentRequirementNavigator;