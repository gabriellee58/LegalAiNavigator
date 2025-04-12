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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, CalendarClock, CalendarRange, Clock, Loader2 } from 'lucide-react';

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

// Case complexity levels
const complexityLevels = [
  { value: 'simple', label: 'Simple - Straightforward facts, few legal issues, limited evidence' },
  { value: 'moderate', label: 'Moderate - Some complexity, moderate evidence, potential for negotiated resolution' },
  { value: 'complex', label: 'Complex - Multiple legal issues, substantial evidence, expert testimony required' },
  { value: 'very_complex', label: 'Very Complex - Multiple parties, extensive documentation, novel legal questions' },
];

// Define a timeline milestone
interface TimelineMilestone {
  title: string;
  description: string;
  estimatedTimeFromStart: number; // in days
  estimatedDuration?: number; // in days
  variabilityFactor: number; // 0.0 to 1.0 representing how variable the timing can be
  isKeyDate: boolean;
}

// Define a timeline result
interface TimelineResult {
  totalEstimatedDuration: number; // in days
  milestones: TimelineMilestone[];
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  variableFactors: string[];
  complexityMultiplier: number;
}

// Form validation schema
const formSchema = z.object({
  procedureType: z.string().min(1, { message: 'Please select a procedure type' }),
  jurisdiction: z.string().min(1, { message: 'Please select a jurisdiction' }),
  caseStatus: z.string().min(1, { message: 'Please select the case status' }),
  role: z.string().min(1, { message: 'Please select your role' }),
  complexity: z.string().min(1, { message: 'Please select a complexity level' }),
  hasOpposition: z.string().min(1, { message: 'Please indicate if the case is contested' }),
  selfRepresented: z.string().min(1, { message: 'Please indicate if you are self-represented' }),
  additionalDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Base timeline data (simplified for the example)
const baseTimelineData = {
  civil: {
    milestones: [
      {
        title: 'Filing Initial Claim',
        description: 'Prepare and file the initial claim with the court',
        estimatedTimeFromStart: 0,
        estimatedDuration: 1,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Serving the Claim',
        description: 'Serve the claim on the defendant(s)',
        estimatedTimeFromStart: 1,
        estimatedDuration: 14,
        variabilityFactor: 0.3,
        isKeyDate: false,
      },
      {
        title: 'Statement of Defence Deadline',
        description: 'Deadline for defendant to file a statement of defence',
        estimatedTimeFromStart: 30,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Discovery Process',
        description: 'Exchange of documents and examination of witnesses',
        estimatedTimeFromStart: 60,
        estimatedDuration: 120,
        variabilityFactor: 0.5,
        isKeyDate: false,
      },
      {
        title: 'Pre-Trial Conference',
        description: 'Meeting with judge to prepare for trial',
        estimatedTimeFromStart: 240,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Trial',
        description: 'Court hearing of the case',
        estimatedTimeFromStart: 365,
        estimatedDuration: 5,
        variabilityFactor: 0.4,
        isKeyDate: true,
      },
      {
        title: 'Judgment',
        description: 'Final decision by the court',
        estimatedTimeFromStart: 395,
        variabilityFactor: 0.3,
        isKeyDate: true,
      },
    ],
    totalEstimatedDuration: 395,
    variableFactors: [
      'Court backlog in your jurisdiction',
      'Complexity of legal issues',
      'Number of parties involved',
      'Volume of evidence',
      'Judicial availability',
    ],
  },
  family: {
    milestones: [
      {
        title: 'Filing Application',
        description: 'Prepare and file the family court application',
        estimatedTimeFromStart: 0,
        estimatedDuration: 1,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Serving Documents',
        description: 'Serve documents on the other party',
        estimatedTimeFromStart: 1,
        estimatedDuration: 14,
        variabilityFactor: 0.3,
        isKeyDate: false,
      },
      {
        title: 'Response Deadline',
        description: 'Deadline for the other party to respond',
        estimatedTimeFromStart: 30,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Case Conference',
        description: 'Initial meeting with judge to discuss the case',
        estimatedTimeFromStart: 45,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Mandatory Mediation',
        description: 'Attempt to resolve issues through mediation',
        estimatedTimeFromStart: 75,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Settlement Conference',
        description: 'Conference focused on settling the case',
        estimatedTimeFromStart: 120,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Trial Management Conference',
        description: 'Preparation for trial if settlement not reached',
        estimatedTimeFromStart: 180,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Trial',
        description: 'Court hearing if the case is not settled',
        estimatedTimeFromStart: 240,
        estimatedDuration: 3,
        variabilityFactor: 0.4,
        isKeyDate: true,
      },
      {
        title: 'Final Order',
        description: 'Final decision on the family matter',
        estimatedTimeFromStart: 270,
        variabilityFactor: 0.3,
        isKeyDate: true,
      },
    ],
    totalEstimatedDuration: 270,
    variableFactors: [
      'Willingness of parties to negotiate',
      'Complexity of family assets',
      'Child custody disagreements',
      'Court backlog in your jurisdiction',
      'Need for expert assessments',
    ],
  },
  criminal: {
    milestones: [
      {
        title: 'First Appearance',
        description: 'Initial appearance in court',
        estimatedTimeFromStart: 0,
        estimatedDuration: 1,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Bail Hearing (if applicable)',
        description: 'Hearing to determine if defendant will be released pending trial',
        estimatedTimeFromStart: 2,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Disclosure of Evidence',
        description: 'Crown provides evidence to the defense',
        estimatedTimeFromStart: 30,
        estimatedDuration: 30,
        variabilityFactor: 0.3,
        isKeyDate: false,
      },
      {
        title: 'Preliminary Inquiry (if applicable)',
        description: 'Hearing to determine if there is enough evidence for trial',
        estimatedTimeFromStart: 90,
        estimatedDuration: 2,
        variabilityFactor: 0.3,
        isKeyDate: true,
      },
      {
        title: 'Pre-Trial Conference',
        description: 'Meeting with judge to prepare for trial',
        estimatedTimeFromStart: 120,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Trial',
        description: 'Criminal trial proceedings',
        estimatedTimeFromStart: 180,
        estimatedDuration: 5,
        variabilityFactor: 0.5,
        isKeyDate: true,
      },
      {
        title: 'Verdict',
        description: 'Decision on guilt or innocence',
        estimatedTimeFromStart: 185,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Sentencing (if convicted)',
        description: 'Hearing to determine sentence',
        estimatedTimeFromStart: 215,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
    ],
    totalEstimatedDuration: 215,
    variableFactors: [
      'Complexity of charges',
      'Number of witnesses',
      'Volume of evidence',
      'Court backlog',
      'Pre-trial motions',
      'Charter applications',
    ],
  },
  smallclaims: {
    milestones: [
      {
        title: 'Filing Claim',
        description: 'Filing the small claims court document',
        estimatedTimeFromStart: 0,
        estimatedDuration: 1,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Serving the Claim',
        description: 'Serve the claim on the defendant',
        estimatedTimeFromStart: 1,
        estimatedDuration: 14,
        variabilityFactor: 0.3,
        isKeyDate: false,
      },
      {
        title: 'Response Deadline',
        description: 'Deadline for defendant to file a response',
        estimatedTimeFromStart: 20,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Settlement Conference',
        description: 'Mandatory meeting to attempt settlement',
        estimatedTimeFromStart: 60,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Trial',
        description: 'Small claims court hearing',
        estimatedTimeFromStart: 120,
        estimatedDuration: 1,
        variabilityFactor: 0.3,
        isKeyDate: true,
      },
      {
        title: 'Judgment',
        description: 'Decision by the court',
        estimatedTimeFromStart: 135,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
    ],
    totalEstimatedDuration: 135,
    variableFactors: [
      'Court backlog',
      'Complexity of claim',
      'Availability of settlement conference',
      'Preparedness of parties',
    ],
  },
  administrative: {
    milestones: [
      {
        title: 'Filing Application',
        description: 'Filing initial application with the tribunal',
        estimatedTimeFromStart: 0,
        estimatedDuration: 1,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Notice to Respondent',
        description: 'Tribunal notifies respondent of application',
        estimatedTimeFromStart: 10,
        estimatedDuration: 5,
        variabilityFactor: 0.2,
        isKeyDate: false,
      },
      {
        title: 'Response Deadline',
        description: 'Deadline for respondent to file a response',
        estimatedTimeFromStart: 30,
        variabilityFactor: 0.1,
        isKeyDate: true,
      },
      {
        title: 'Document Exchange',
        description: 'Parties exchange relevant documents',
        estimatedTimeFromStart: 45,
        estimatedDuration: 30,
        variabilityFactor: 0.3,
        isKeyDate: false,
      },
      {
        title: 'Mediation (if applicable)',
        description: 'Attempt to resolve the dispute through mediation',
        estimatedTimeFromStart: 75,
        estimatedDuration: 1,
        variabilityFactor: 0.2,
        isKeyDate: true,
      },
      {
        title: 'Hearing',
        description: 'Tribunal hearing of the case',
        estimatedTimeFromStart: 120,
        estimatedDuration: 1,
        variabilityFactor: 0.3,
        isKeyDate: true,
      },
      {
        title: 'Decision',
        description: 'Tribunal issues a decision',
        estimatedTimeFromStart: 150,
        variabilityFactor: 0.4,
        isKeyDate: true,
      },
    ],
    totalEstimatedDuration: 150,
    variableFactors: [
      'Tribunal backlog',
      'Complexity of case',
      'Procedural requests',
      'Administrative delays',
    ],
  },
};

// Function to format a date in a readable format
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const TimelineEstimator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timelineResult, setTimelineResult] = useState<TimelineResult | null>(null);
  const [formData, setFormData] = useState<FormValues | null>(null);
  
  const totalSteps = 2;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      procedureType: '',
      jurisdiction: '',
      caseStatus: 'new',
      role: '',
      complexity: '',
      hasOpposition: '',
      selfRepresented: '',
      additionalDetails: '',
    },
  });

  // Generate a timeline based on the form data
  const generateTimeline = (values: FormValues): TimelineResult => {
    // Get the base timeline for the selected procedure type
    const baseTimeline = baseTimelineData[values.procedureType as keyof typeof baseTimelineData] || baseTimelineData.civil;
    
    // Calculate complexity multiplier
    let complexityMultiplier = 1.0;
    switch (values.complexity) {
      case 'simple':
        complexityMultiplier = 0.8;
        break;
      case 'moderate':
        complexityMultiplier = 1.0;
        break;
      case 'complex':
        complexityMultiplier = 1.5;
        break;
      case 'very_complex':
        complexityMultiplier = 2.0;
        break;
    }
    
    // Apply jurisdiction factor (simplified)
    let jurisdictionFactor = 1.0;
    if (['on', 'bc', 'qc'].includes(values.jurisdiction)) {
      jurisdictionFactor = 1.2; // Busier courts in larger provinces
    }
    
    // Apply opposition factor
    const oppositionFactor = values.hasOpposition === 'yes' ? 1.3 : 0.7;
    
    // Apply self-representation factor
    const selfRepFactor = values.selfRepresented === 'yes' ? 1.2 : 1.0;
    
    // Calculate total multiplier
    const totalMultiplier = complexityMultiplier * jurisdictionFactor * oppositionFactor * selfRepFactor;
    
    // Adjust milestones based on the multiplier
    const adjustedMilestones = baseTimeline.milestones.map(milestone => ({
      ...milestone,
      estimatedTimeFromStart: Math.round(milestone.estimatedTimeFromStart * totalMultiplier),
      estimatedDuration: milestone.estimatedDuration 
        ? Math.round(milestone.estimatedDuration * totalMultiplier) 
        : undefined,
    }));
    
    // Calculate total duration
    const totalEstimatedDuration = Math.round(baseTimeline.totalEstimatedDuration * totalMultiplier);
    
    // Set dates
    const today = new Date();
    const estimatedEndDate = addDays(today, totalEstimatedDuration);
    
    return {
      totalEstimatedDuration,
      milestones: adjustedMilestones,
      estimatedStartDate: today,
      estimatedEndDate,
      variableFactors: baseTimeline.variableFactors,
      complexityMultiplier: totalMultiplier,
    };
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setFormData(values);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate timeline
      const result = generateTimeline(values);
      setTimelineResult(result);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error generating timeline:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionnaireStep = () => {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold mb-4 text-foreground">Procedural Timeline Questionnaire</h2>
        <p className="text-muted-foreground mb-6">
          Answer these questions about your legal matter to receive an estimated timeline for your procedure.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="procedureType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What type of legal procedure are you involved in?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a procedure type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {legalProcedureTypes.map((option) => (
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
            
            <FormField
              control={form.control}
              name="jurisdiction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>In which province or territory will your legal procedure take place?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a jurisdiction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {provinces.map((option) => (
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
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is your role in this legal matter?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plaintiff" id="plaintiff" />
                        <label htmlFor="plaintiff" className="text-sm font-normal">
                          Plaintiff / Applicant (initiating the case)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="defendant" id="defendant" />
                        <label htmlFor="defendant" className="text-sm font-normal">
                          Defendant / Respondent (responding to a case)
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseStatus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is this a new case or an ongoing matter?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" />
                        <label htmlFor="new" className="text-sm font-normal">
                          New case (not yet filed)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ongoing" id="ongoing" />
                        <label htmlFor="ongoing" className="text-sm font-normal">
                          Ongoing case (already filed)
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="complexity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How complex is your legal matter?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {complexityLevels.map((option) => (
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
            
            <FormField
              control={form.control}
              name="hasOpposition"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is your case contested by the other party?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="opposed-yes" />
                        <label htmlFor="opposed-yes" className="text-sm font-normal">
                          Yes, the other party contests the case
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="opposed-no" />
                        <label htmlFor="opposed-no" className="text-sm font-normal">
                          No, the case is uncontested
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="selfRepresented"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Are you self-represented (without a lawyer)?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="self-rep-yes" />
                        <label htmlFor="self-rep-yes" className="text-sm font-normal">
                          Yes, I am self-represented
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="self-rep-no" />
                        <label htmlFor="self-rep-no" className="text-sm font-normal">
                          No, I have legal representation
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any additional details about your case that might affect timing?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any relevant details here..."
                      {...field}
                      className="h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Timeline...
                  </>
                ) : (
                  <>
                    Generate Timeline
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

  const renderTimelineStep = () => {
    if (!timelineResult) return null;
    
    const procedureType = formData?.procedureType || '';
    const procedureLabel = legalProcedureTypes.find(p => p.value === procedureType)?.label || 'Legal Procedure';
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-6">
            <CalendarClock className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-bold text-foreground">Estimated Timeline for {procedureLabel}</h2>
          </div>
          
          <div className="mb-4 bg-primary/5 p-4 rounded-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Duration</p>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span className="text-lg font-semibold">
                    {timelineResult.totalEstimatedDuration} days
                    {timelineResult.totalEstimatedDuration > 30 && 
                      ` (approximately ${Math.round(timelineResult.totalEstimatedDuration / 30)} months)`}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-muted-foreground">Expected Completion</p>
                <div className="flex items-center">
                  <CalendarRange className="h-5 w-5 text-primary mr-2" />
                  <span className="text-lg font-semibold">
                    {formatDate(timelineResult.estimatedEndDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative mb-8 mt-12">
            <div className="absolute left-9 top-0 h-full w-0.5 bg-gray-200"></div>
            
            {timelineResult.milestones.map((milestone, index) => {
              const date = addDays(
                timelineResult.estimatedStartDate, 
                milestone.estimatedTimeFromStart
              );
              
              return (
                <div key={index} className="mb-8 relative">
                  <div className={`absolute left-0 -top-1 z-10 w-5 h-5 rounded-full flex items-center justify-center ${
                    milestone.isKeyDate ? 'bg-primary' : 'bg-gray-300'
                  }`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="ml-16">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                      <h3 className={`font-semibold ${milestone.isKeyDate ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {milestone.title}
                      </h3>
                      <span className={`text-sm ${milestone.isKeyDate ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {formatDate(date)}
                        {milestone.estimatedDuration && milestone.estimatedDuration > 1 && 
                          ` - ${formatDate(addDays(date, milestone.estimatedDuration))}`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    {milestone.estimatedDuration && milestone.estimatedDuration > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated duration: {milestone.estimatedDuration} days
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Note</h3>
            <p className="text-sm text-yellow-700">
              This timeline is an estimate based on average case durations. Actual timing may vary 
              significantly based on many factors, including:
            </p>
            <ul className="text-sm text-yellow-700 list-disc pl-5 mt-2 space-y-1">
              {timelineResult.variableFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8 flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              Edit Information
            </Button>
            <Button 
              onClick={() => window.print()}
              className="flex-1"
            >
              Print Timeline
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
            <span className="text-xs text-muted-foreground">Timeline</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderProgressBar()}
      
      {currentStep === 1 && renderQuestionnaireStep()}
      {currentStep === 2 && renderTimelineStep()}
    </div>
  );
};

export default TimelineEstimator;