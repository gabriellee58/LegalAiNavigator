import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, CheckCircle2, FileCheck, Loader2 } from 'lucide-react';

// Define the document interface
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

// Define the question interface
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

// Canadian provinces and territories
const provinces = [
  { value: 'ab', label: 'Alberta' },
  { value: 'bc', label: 'British Columbia' },
  { value: 'mb', label: 'Manitoba' },
  { value: 'nb', label: 'New Brunswick' },
  { value: 'nl', label: 'Newfoundland and Labrador' },
  { value: 'nt', label: 'Northwest Territories' },
  { value: 'ns', label: 'Nova Scotia' },
  { value: 'nu', label: 'Nunavut' },
  { value: 'on', label: 'Ontario' },
  { value: 'pe', label: 'Prince Edward Island' },
  { value: 'qc', label: 'Quebec' },
  { value: 'sk', label: 'Saskatchewan' },
  { value: 'yt', label: 'Yukon' },
];

// Legal procedure categories
const legalProcedureTypes = [
  { value: 'civil', label: 'Civil Litigation' },
  { value: 'family', label: 'Family Court' },
  { value: 'criminal', label: 'Criminal Proceedings' },
  { value: 'administrative', label: 'Administrative Tribunal' },
  { value: 'smallclaims', label: 'Small Claims' },
  { value: 'immigration', label: 'Immigration Proceedings' },
  { value: 'landlord_tenant', label: 'Landlord-Tenant Dispute' },
  { value: 'employment', label: 'Employment Dispute' },
  { value: 'human_rights', label: 'Human Rights Complaint' },
];

// Questions for the document requirement wizard
const questions: Question[] = [
  {
    id: 'q1',
    text: 'What type of legal procedure are you involved in?',
    type: 'select',
    options: legalProcedureTypes,
    key: 'procedureType',
  },
  {
    id: 'q2',
    text: 'In which province or territory is your legal matter taking place?',
    type: 'select',
    options: provinces,
    key: 'jurisdiction',
  },
  {
    id: 'q3',
    text: 'What is your role in this legal matter?',
    type: 'radio',
    options: [
      { value: 'plaintiff', label: 'Plaintiff / Applicant (initiating the case)' },
      { value: 'defendant', label: 'Defendant / Respondent (responding to a case)' },
      { value: 'thirdparty', label: 'Third-party (other involvement)' },
    ],
    key: 'role',
  },
  {
    id: 'q4',
    text: 'Is this a new case or an ongoing legal matter?',
    type: 'radio',
    options: [
      { value: 'new', label: 'New case (not yet filed with the court)' },
      { value: 'ongoing', label: 'Ongoing case (already filed with the court)' },
    ],
    key: 'caseStatus',
  },
  {
    id: 'q5',
    text: 'What type of evidence will you need to present?',
    type: 'checkbox',
    options: [
      { value: 'documents', label: 'Documents or records' },
      { value: 'witness', label: 'Witness testimony' },
      { value: 'expert', label: 'Expert testimony or reports' },
      { value: 'physical', label: 'Physical evidence' },
      { value: 'digital', label: 'Digital evidence (emails, messages, etc.)' },
    ],
    key: 'evidenceTypes',
  },
  {
    id: 'q6',
    text: 'What is the approximate value or importance of your case?',
    type: 'radio',
    options: [
      { value: 'minor', label: 'Minor (under $5,000)' },
      { value: 'moderate', label: 'Moderate ($5,000 - $35,000)' },
      { value: 'significant', label: 'Significant (over $35,000)' },
      { value: 'non_monetary', label: 'Non-monetary importance' },
    ],
    key: 'caseValue',
  },
  {
    id: 'q7',
    text: 'Do you have legal representation?',
    type: 'radio',
    options: [
      { value: 'full', label: 'Yes, full representation' },
      { value: 'partial', label: 'Yes, partial representation (limited scope)' },
      { value: 'none', label: 'No, I am self-represented' },
    ],
    key: 'legalRepresentation',
  },
  {
    id: 'q8',
    text: 'Please provide any additional details about your case that might help us determine document requirements:',
    type: 'textarea',
    placeholder: 'Enter details here...',
    key: 'additionalDetails',
  },
];

// Sample documents (would be dynamically determined based on answers)
const sampleDocuments: Document[] = [
  {
    id: 'd1',
    name: 'Notice of Civil Claim',
    description: 'The document that initiates a civil lawsuit in the Supreme Court',
    required: true,
    category: 'court_filing',
    obtainmentInfo: 'Available from the court registry or online court services',
    complexity: 'moderate',
    jurisdictionSpecific: true,
    jurisdictions: ['bc']
  },
  {
    id: 'd2',
    name: 'Form 1: Notice of Claim',
    description: 'The document that initiates a small claims action',
    required: true,
    category: 'court_filing',
    obtainmentInfo: 'Available from the provincial court registry or online',
    complexity: 'simple',
    jurisdictionSpecific: true,
    jurisdictions: ['bc', 'on']
  },
  {
    id: 'd3',
    name: 'Affidavit of Service',
    description: 'Proves that court documents were properly served to the other party',
    required: true,
    category: 'court_filing',
    obtainmentInfo: 'Available from the court registry or online',
    complexity: 'simple',
    jurisdictionSpecific: false
  },
  {
    id: 'd4',
    name: 'Financial Statement',
    description: 'Detailed disclosure of financial information, required in family law cases',
    required: false,
    category: 'financial',
    obtainmentInfo: 'Templates available from family court',
    complexity: 'complex',
    jurisdictionSpecific: true,
    jurisdictions: ['on', 'bc', 'ab']
  },
  {
    id: 'd5',
    name: 'List of Documents',
    description: 'Catalog of all relevant documents in your possession',
    required: true,
    category: 'evidence',
    obtainmentInfo: 'You must prepare this yourself or with legal counsel',
    complexity: 'moderate',
    jurisdictionSpecific: false
  },
  {
    id: 'd6',
    name: 'Expert Witness Report',
    description: 'Written opinion from a qualified expert on matters relevant to your case',
    required: false,
    category: 'evidence',
    obtainmentInfo: 'Must be prepared by a qualified expert in the relevant field',
    complexity: 'complex',
    jurisdictionSpecific: false
  },
  {
    id: 'd7',
    name: 'Application for Fee Waiver',
    description: 'Request to waive court fees based on financial hardship',
    required: false,
    category: 'court_filing',
    obtainmentInfo: 'Available from the court registry',
    complexity: 'simple',
    jurisdictionSpecific: true,
    jurisdictions: ['on', 'bc', 'ab', 'mb', 'ns']
  },
];

// Form validation schema
const formSchema = z.object({
  procedureType: z.string().min(1, { message: 'Please select a procedure type' }),
  jurisdiction: z.string().min(1, { message: 'Please select a jurisdiction' }),
  role: z.string().min(1, { message: 'Please select your role' }),
  caseStatus: z.string().min(1, { message: 'Please select the case status' }),
  evidenceTypes: z.array(z.string()).min(1, { message: 'Please select at least one evidence type' }),
  caseValue: z.string().min(1, { message: 'Please select a case value' }),
  legalRepresentation: z.string().min(1, { message: 'Please select your representation status' }),
  additionalDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DocumentRequirementNavigator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendedDocuments, setRecommendedDocuments] = useState<Document[]>([]);
  const [formData, setFormData] = useState<FormValues | null>(null);
  
  const totalSteps = 3;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      procedureType: '',
      jurisdiction: '',
      role: '',
      caseStatus: '',
      evidenceTypes: [],
      caseValue: '',
      legalRepresentation: '',
      additionalDetails: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setFormData(values);
    
    try {
      // In a real application, we would make an API call to get document recommendations
      // based on the form values. For now, we'll simulate this with a timeout.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Filter documents based on form values
      // This is a simplified version - in a real app this would be done server-side
      let filtered = [...sampleDocuments];
      
      // Filter by jurisdiction if document is jurisdiction specific
      filtered = filtered.filter(doc => 
        !doc.jurisdictionSpecific || !doc.jurisdictions || doc.jurisdictions.includes(values.jurisdiction)
      );
      
      // Add more complex filtering logic here based on other form fields
      // For example, show certain documents only for plaintiffs vs defendants
      if (values.role === 'plaintiff') {
        // Show plaintiff-specific documents
      } else if (values.role === 'defendant') {
        // Show defendant-specific documents
      }
      
      setRecommendedDocuments(filtered);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error generating document requirements:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionStep = () => {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold mb-4 text-foreground">Document Requirement Questionnaire</h2>
        <p className="text-muted-foreground mb-6">Please answer the following questions about your legal matter to help us identify the documents you'll need.</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {questions.map((question) => {
              switch (question.type) {
                case 'select':
                  return (
                    <FormField
                      key={question.id}
                      control={form.control}
                      name={question.key as keyof FormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{question.text}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {question.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                case 'radio':
                  return (
                    <FormField
                      key={question.id}
                      control={form.control}
                      name={question.key as keyof FormValues}
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{question.text}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-1"
                            >
                              {question.options?.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.value} id={option.value} />
                                  <label htmlFor={option.value} className="text-sm font-normal">
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                case 'checkbox':
                  return (
                    <FormField
                      key={question.id}
                      control={form.control}
                      name={question.key as keyof FormValues}
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>{question.text}</FormLabel>
                          </div>
                          <div className="space-y-2">
                            {question.options?.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name={question.key as keyof FormValues}
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={(field.value as string[])?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value as string[] || [];
                                            const updatedValue = checked
                                              ? [...currentValue, option.value]
                                              : currentValue.filter((value) => value !== option.value);
                                            field.onChange(updatedValue);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                case 'textarea':
                  return (
                    <FormField
                      key={question.id}
                      control={form.control}
                      name={question.key as keyof FormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{question.text}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={question.placeholder}
                              {...field}
                              className="h-32"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                default:
                  return null;
              }
            })}
            
            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Requirements...
                  </>
                ) : (
                  <>
                    Get Document Requirements
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  };

  const renderResultsStep = () => {
    const requiredDocuments = recommendedDocuments.filter(doc => doc.required);
    const optionalDocuments = recommendedDocuments.filter(doc => !doc.required);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <FileCheck className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-bold text-foreground">Your Document Requirements</h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-red-500 mr-1">*</span> Required Documents 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({requiredDocuments.length})
              </span>
            </h3>
            <div className="space-y-4">
              {requiredDocuments.map(doc => (
                <Card key={doc.id} className="border-l-4 border-l-primary">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{doc.name}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{doc.description}</p>
                      </div>
                      <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        {doc.complexity === 'simple' ? 'Simple' : 
                         doc.complexity === 'moderate' ? 'Moderate' : 'Complex'}
                      </div>
                    </div>
                    {doc.obtainmentInfo && (
                      <div className="mt-3 text-sm">
                        <span className="font-medium">How to obtain:</span> {doc.obtainmentInfo}
                      </div>
                    )}
                    {doc.jurisdictionSpecific && (
                      <div className="text-xs text-muted-foreground mt-2">
                        * Specific to: {doc.jurisdictions?.map(j => 
                          provinces.find(p => p.value === j)?.label).join(', ')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Optional Documents
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({optionalDocuments.length})
              </span>
            </h3>
            <div className="space-y-4">
              {optionalDocuments.map(doc => (
                <Card key={doc.id}>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{doc.name}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{doc.description}</p>
                      </div>
                      <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {doc.complexity === 'simple' ? 'Simple' : 
                         doc.complexity === 'moderate' ? 'Moderate' : 'Complex'}
                      </div>
                    </div>
                    {doc.obtainmentInfo && (
                      <div className="mt-3 text-sm">
                        <span className="font-medium">How to obtain:</span> {doc.obtainmentInfo}
                      </div>
                    )}
                    {doc.jurisdictionSpecific && (
                      <div className="text-xs text-muted-foreground mt-2">
                        * Specific to: {doc.jurisdictions?.map(j => 
                          provinces.find(p => p.value === j)?.label).join(', ')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              Edit Answers
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              className="flex-1"
            >
              Get Detailed Checklist
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderChecklistStep = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-6">
            <CheckCircle2 className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-bold text-foreground">Document Checklist</h2>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Use this checklist to track your document preparation progress. Click items to mark them as complete.
          </p>
          
          <div className="space-y-4 mb-8">
            {recommendedDocuments.map((doc, index) => (
              <div key={doc.id} className="flex items-start p-3 border rounded hover:bg-gray-50">
                <Checkbox id={`doc-${doc.id}`} className="mt-1 mr-3" />
                <div>
                  <label 
                    htmlFor={`doc-${doc.id}`} 
                    className="font-medium text-foreground cursor-pointer flex items-center"
                  >
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                  
                  {doc.obtainmentInfo && (
                    <div className="mt-2 text-sm">
                      <p className="text-foreground"><strong>How to obtain:</strong> {doc.obtainmentInfo}</p>
                    </div>
                  )}
                  
                  {doc.alternatives && doc.alternatives.length > 0 && (
                    <div className="mt-2 text-sm">
                      <p className="text-foreground"><strong>Alternatives:</strong> {doc.alternatives.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(2)}
              className="flex-1"
            >
              Back to Document List
            </Button>
            <Button 
              onClick={() => window.print()}
              className="flex-1"
            >
              Print Checklist
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className="text-xs text-muted-foreground">Questionnaire</span>
          </div>
          <div className="flex-1 flex items-center px-4">
            <div className={`h-1 w-full ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className="text-xs text-muted-foreground">Requirements</span>
          </div>
          <div className="flex-1 flex items-center px-4">
            <div className={`h-1 w-full ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
            <span className="text-xs text-muted-foreground">Checklist</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderProgressBar()}
      
      {currentStep === 1 && renderQuestionStep()}
      {currentStep === 2 && renderResultsStep()}
      {currentStep === 3 && renderChecklistStep()}
    </div>
  );
};

export default DocumentRequirementNavigator;