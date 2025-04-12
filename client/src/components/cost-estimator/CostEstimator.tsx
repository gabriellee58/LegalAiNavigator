import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Calculator, DollarSign, Loader2, Scale } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Canadian provinces and territories (same as in Timeline Estimator)
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

// Legal matter categories
const legalMatterTypes = [
  { value: 'civil_litigation', label: 'Civil Litigation' },
  { value: 'family', label: 'Family Law' },
  { value: 'criminal', label: 'Criminal Defense' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'corporate', label: 'Corporate Law' },
  { value: 'employment', label: 'Employment Law' },
  { value: 'wills_estates', label: 'Wills & Estates' },
  { value: 'personal_injury', label: 'Personal Injury' },
  { value: 'tax', label: 'Tax Law' },
  { value: 'intellectual_property', label: 'Intellectual Property' },
];

// Case complexity levels
const complexityLevels = [
  { value: 'simple', label: 'Simple - Straightforward facts, few legal issues, limited evidence' },
  { value: 'moderate', label: 'Moderate - Some complexity, moderate evidence, potential for settlement' },
  { value: 'complex', label: 'Complex - Multiple legal issues, substantial evidence, expert testimony' },
  { value: 'very_complex', label: 'Very Complex - Multiple parties, extensive documentation, novel legal issues' },
];

// Court levels for legal proceedings
const courtLevels = [
  { value: 'small_claims', label: 'Small Claims Court' },
  { value: 'provincial', label: 'Provincial Court' },
  { value: 'superior', label: 'Superior Court' },
  { value: 'appeal', label: 'Court of Appeal' },
  { value: 'supreme', label: 'Supreme Court of Canada' },
  { value: 'federal', label: 'Federal Court' },
  { value: 'tax', label: 'Tax Court' },
  { value: 'administrative', label: 'Administrative Tribunal' },
];

// Define expense categories
interface ExpenseCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const expenseCategories: ExpenseCategory[] = [
  {
    name: 'Legal Fees',
    description: 'Fees charged by legal professionals for services',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    name: 'Court Fees',
    description: 'Fees charged by the court for filing documents and proceedings',
    icon: <Scale className="h-5 w-5" />,
  },
  {
    name: 'Disbursements',
    description: 'Additional expenses like expert witnesses, photocopying, etc.',
    icon: <Calculator className="h-5 w-5" />,
  },
];

// Define the cost estimation result interface
interface CostEstimationResult {
  totalCostRange: {
    min: number;
    max: number;
  };
  categories: {
    name: string;
    min: number;
    max: number;
    description: string;
    icon: React.ReactNode;
    items: {
      name: string;
      min: number;
      max: number;
      note?: string;
    }[];
  }[];
  factors: string[];
  isWithLawyer: boolean;
  hoursRange: {
    min: number;
    max: number;
  };
}

// Form validation schema
const formSchema = z.object({
  matterType: z.string().min(1, { message: 'Please select a legal matter type' }),
  jurisdiction: z.string().min(1, { message: 'Please select a jurisdiction' }),
  courtLevel: z.string().min(1, { message: 'Please select a court level' }),
  complexity: z.string().min(1, { message: 'Please select a complexity level' }),
  representationType: z.string().min(1, { message: 'Please select representation type' }),
  estimatedDuration: z.number().min(1).max(60),
  expectedTrialDays: z.number().min(0).max(30),
  hasExperts: z.boolean().default(false),
  hasMultipleParties: z.boolean().default(false),
  additionalDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Base cost data by province and matter type
const baseCostData: Record<string, Record<string, any>> = {
  // Civil litigation base costs by province
  civil_litigation: {
    on: { // Ontario
      lawyer_hourly_rate: { min: 250, max: 500 },
      filing_fees: { min: 200, max: 300 },
      small_claims: { min: 1000, max: 5000 },
      provincial: { min: 5000, max: 15000 },
      superior: { min: 15000, max: 50000 },
      appeal: { min: 25000, max: 75000 },
    },
    bc: { // British Columbia  
      lawyer_hourly_rate: { min: 250, max: 450 },
      filing_fees: { min: 200, max: 300 },
      small_claims: { min: 1200, max: 5500 },
      provincial: { min: 5500, max: 18000 },
      superior: { min: 18000, max: 55000 },
      appeal: { min: 28000, max: 80000 },
    },
    // Default values for provinces not specifically listed
    default: {
      lawyer_hourly_rate: { min: 200, max: 400 },
      filing_fees: { min: 150, max: 250 },
      small_claims: { min: 1000, max: 4500 },
      provincial: { min: 4500, max: 12000 },
      superior: { min: 12000, max: 40000 },
      appeal: { min: 20000, max: 65000 },
    }
  },
  // Family law base costs by province
  family: {
    on: {
      lawyer_hourly_rate: { min: 300, max: 500 },
      filing_fees: { min: 150, max: 250 },
      uncontested_divorce: { min: 1200, max: 2500 },
      contested_divorce: { min: 10000, max: 40000 },
      child_custody: { min: 5000, max: 25000 },
      provincial: { min: 5000, max: 20000 },
      superior: { min: 15000, max: 60000 },
    },
    bc: {
      lawyer_hourly_rate: { min: 250, max: 450 },
      filing_fees: { min: 200, max: 300 },
      uncontested_divorce: { min: 1000, max: 2000 },
      contested_divorce: { min: 8000, max: 35000 },
      child_custody: { min: 5000, max: 25000 },
      provincial: { min: 5000, max: 20000 },
      superior: { min: 15000, max: 55000 },
    },
    default: {
      lawyer_hourly_rate: { min: 200, max: 400 },
      filing_fees: { min: 150, max: 250 },
      uncontested_divorce: { min: 800, max: 2000 },
      contested_divorce: { min: 8000, max: 30000 },
      child_custody: { min: 4000, max: 20000 },
      provincial: { min: 4000, max: 18000 },
      superior: { min: 12000, max: 45000 },
    }
  },
  // Criminal defense base costs by province
  criminal: {
    on: {
      lawyer_hourly_rate: { min: 300, max: 600 },
      summary_offence: { min: 2500, max: 7500 },
      indictable_offence: { min: 5000, max: 50000 },
      provincial: { min: 3500, max: 10000 },
      superior: { min: 10000, max: 50000 },
      appeal: { min: 15000, max: 60000 },
    },
    bc: {
      lawyer_hourly_rate: { min: 250, max: 550 },
      summary_offence: { min: 2000, max: 7000 },
      indictable_offence: { min: 5000, max: 45000 },
      provincial: { min: 3000, max: 9000 },
      superior: { min: 9000, max: 45000 },
      appeal: { min: 15000, max: 55000 },
    },
    default: {
      lawyer_hourly_rate: { min: 200, max: 500 },
      summary_offence: { min: 1500, max: 6000 },
      indictable_offence: { min: 4000, max: 40000 },
      provincial: { min: 2500, max: 8000 },
      superior: { min: 8000, max: 40000 },
      appeal: { min: 12000, max: 50000 },
    }
  },
  // Default for all other legal matters
  default: {
    default: {
      lawyer_hourly_rate: { min: 200, max: 400 },
      filing_fees: { min: 100, max: 300 },
      small_claims: { min: 800, max: 4000 },
      provincial: { min: 3000, max: 10000 },
      superior: { min: 8000, max: 35000 },
      appeal: { min: 15000, max: 60000 },
      administrative: { min: 2500, max: 8000 },
      tax: { min: 4000, max: 15000 },
      federal: { min: 5000, max: 20000 },
    }
  }
};

// Format currency in Canadian dollars
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const CostEstimator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costResult, setCostResult] = useState<CostEstimationResult | null>(null);
  const [formData, setFormData] = useState<FormValues | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matterType: '',
      jurisdiction: '',
      courtLevel: '',
      complexity: '',
      representationType: 'lawyer',
      estimatedDuration: 6,
      expectedTrialDays: 0,
      hasExperts: false,
      hasMultipleParties: false,
      additionalDetails: '',
    },
  });

  // Generate a cost estimation based on the form data
  const generateCostEstimation = (values: FormValues): CostEstimationResult => {
    // Get the base cost data for this matter type and jurisdiction
    const matterTypeData = baseCostData[values.matterType] || baseCostData.default;
    const jurisdictionData = matterTypeData[values.jurisdiction] || matterTypeData.default;
    
    // Determine court level costs
    const courtLevelKey = values.courtLevel === 'small_claims' 
      ? 'small_claims' 
      : values.courtLevel === 'provincial' 
        ? 'provincial' 
        : values.courtLevel === 'superior' 
          ? 'superior'
          : values.courtLevel === 'appeal'
            ? 'appeal'
            : values.courtLevel;
    
    // Use court level costs if available, otherwise use a default range
    const courtCosts = jurisdictionData[courtLevelKey] || { min: 3000, max: 15000 };
    
    // Get hourly rate range for lawyers in this jurisdiction
    const hourlyRate = jurisdictionData.lawyer_hourly_rate || { min: 200, max: 400 };
    
    // Calculate complexity multiplier
    let complexityMultiplier = 1.0;
    switch (values.complexity) {
      case 'simple':
        complexityMultiplier = 0.7;
        break;
      case 'moderate':
        complexityMultiplier = 1.0;
        break;
      case 'complex':
        complexityMultiplier = 1.5;
        break;
      case 'very_complex':
        complexityMultiplier = 2.2;
        break;
    }
    
    // Calculate estimated hours based on complexity and duration
    const baseHours = { 
      min: values.estimatedDuration * 5, 
      max: values.estimatedDuration * 15 
    };
    const adjustedHours = {
      min: Math.round(baseHours.min * complexityMultiplier),
      max: Math.round(baseHours.max * complexityMultiplier)
    };
    
    // Calculate trial costs if applicable
    const trialCostsPerDay = { min: 1500, max: 4000 };
    const trialCosts = {
      min: values.expectedTrialDays * trialCostsPerDay.min,
      max: values.expectedTrialDays * trialCostsPerDay.max
    };
    
    // Additional cost factors
    const expertWitnessCost = values.hasExperts ? { min: 3000, max: 8000 } : { min: 0, max: 0 };
    const multiplePartiesFactor = values.hasMultipleParties ? 1.3 : 1.0;
    
    // Filing fees and court costs
    const filingFees = jurisdictionData.filing_fees || { min: 150, max: 300 };
    
    // Calculate legal fees (if represented by a lawyer)
    const legalFees = values.representationType === 'lawyer' ? {
      min: Math.round(adjustedHours.min * hourlyRate.min),
      max: Math.round(adjustedHours.max * hourlyRate.max)
    } : { min: 0, max: 0 };
    
    // Calculate disbursements
    const basicDisbursements = {
      min: Math.round(courtCosts.min * 0.1),
      max: Math.round(courtCosts.max * 0.2)
    };
    
    // Calculate total cost ranges
    let totalMin = 0;
    let totalMax = 0;
    
    if (values.representationType === 'lawyer') {
      // With lawyer representation
      totalMin = Math.round((legalFees.min + filingFees.min + basicDisbursements.min + 
                            expertWitnessCost.min + trialCosts.min) * multiplePartiesFactor);
      
      totalMax = Math.round((legalFees.max + filingFees.max + basicDisbursements.max + 
                            expertWitnessCost.max + trialCosts.max) * multiplePartiesFactor);
    } else {
      // Self-represented
      totalMin = Math.round((filingFees.min + basicDisbursements.min + 
                            expertWitnessCost.min) * multiplePartiesFactor);
      
      totalMax = Math.round((filingFees.max + basicDisbursements.max + 
                            expertWitnessCost.max) * multiplePartiesFactor);
    }
    
    // Format the result
    const result: CostEstimationResult = {
      totalCostRange: {
        min: totalMin,
        max: totalMax
      },
      categories: [
        {
          name: 'Legal Fees',
          min: legalFees.min,
          max: legalFees.max,
          description: 'Fees charged by legal professionals for services',
          icon: <DollarSign className="h-5 w-5" />,
          items: [
            {
              name: 'Professional Services',
              min: legalFees.min,
              max: legalFees.max,
              note: values.representationType === 'lawyer' 
                ? `Based on ${adjustedHours.min}-${adjustedHours.max} hours at ${formatCurrency(hourlyRate.min)}-${formatCurrency(hourlyRate.max)} per hour`
                : 'Self-representation (no lawyer fees)'
            }
          ]
        },
        {
          name: 'Court Fees',
          min: filingFees.min,
          max: filingFees.max,
          description: 'Fees charged by the court for filing documents and proceedings',
          icon: <Scale className="h-5 w-5" />,
          items: [
            {
              name: 'Filing Fees',
              min: filingFees.min,
              max: filingFees.max,
              note: 'Required to file documents with the court'
            }
          ]
        },
        {
          name: 'Disbursements',
          min: basicDisbursements.min + expertWitnessCost.min + trialCosts.min,
          max: basicDisbursements.max + expertWitnessCost.max + trialCosts.max,
          description: 'Additional expenses like expert witnesses, photocopying, etc.',
          icon: <Calculator className="h-5 w-5" />,
          items: [
            {
              name: 'Basic Disbursements',
              min: basicDisbursements.min,
              max: basicDisbursements.max,
              note: 'Photocopying, courier, travel, etc.'
            },
            {
              name: 'Expert Witness Fees',
              min: expertWitnessCost.min,
              max: expertWitnessCost.max,
              note: values.hasExperts ? 'Expert witness costs and reports' : 'No expert witnesses'
            },
            {
              name: 'Trial Costs',
              min: trialCosts.min,
              max: trialCosts.max,
              note: values.expectedTrialDays > 0 
                ? `${values.expectedTrialDays} day(s) of trial` 
                : 'No trial expected'
            }
          ]
        }
      ],
      factors: [
        'Jurisdiction',
        'Case complexity',
        'Type of legal matter',
        'Court level',
        'Representation type',
        'Duration of proceedings',
        'Number of parties involved',
        'Need for expert witnesses',
        'Trial duration'
      ],
      isWithLawyer: values.representationType === 'lawyer',
      hoursRange: adjustedHours
    };
    
    return result;
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setFormData(values);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate cost estimate
      const result = generateCostEstimation(values);
      setCostResult(result);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error generating cost estimate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionnaireStep = () => {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold mb-4 text-foreground">Legal Cost Estimator Questionnaire</h2>
        <p className="text-muted-foreground mb-6">
          Answer these questions about your legal matter to receive an estimated cost breakdown.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="matterType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What type of legal matter do you need help with?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a legal matter type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {legalMatterTypes.map((option) => (
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
                  <FormLabel>In which province or territory is your legal matter?</FormLabel>
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
              name="courtLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which court or tribunal will handle your matter?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a court level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courtLevels.map((option) => (
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
              name="representationType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How do you plan to handle legal representation?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lawyer" id="lawyer" />
                        <label htmlFor="lawyer" className="text-sm font-normal">
                          Hire a lawyer
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="self" id="self" />
                        <label htmlFor="self" className="text-sm font-normal">
                          Self-representation
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
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated duration of your legal matter (in months)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={60}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 month</span>
                        <span>{field.value} {field.value === 1 ? 'month' : 'months'}</span>
                        <span>5 years</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expectedTrialDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected number of trial days (if applicable)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={30}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 days (no trial)</span>
                        <span>{field.value} {field.value === 1 ? 'day' : 'days'}</span>
                        <span>30 days</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hasExperts"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Will you need expert witnesses or reports?</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Expert witnesses significantly increase costs but may be necessary for complex matters
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasMultipleParties"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Does your case involve multiple parties?</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Cases with multiple opposing parties tend to be more complex and costly
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any additional details that might affect costs?</FormLabel>
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
                    Calculating Costs...
                  </>
                ) : (
                  <>
                    Calculate Cost Estimate
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

  const renderResultStep = () => {
    if (!costResult) return null;
    
    const matterType = formData?.matterType || '';
    const matterLabel = legalMatterTypes.find(m => m.value === matterType)?.label || 'Legal Matter';
    
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center mb-2">
              <Scale className="h-6 w-6 text-primary mr-2" />
              <CardTitle>Cost Estimate for {matterLabel}</CardTitle>
            </div>
            <CardDescription>
              Based on the information provided, here is an estimated cost breakdown for your legal matter.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-6 p-4 bg-primary/10 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Total Estimated Cost Range</h3>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(costResult.totalCostRange.min)} - {formatCurrency(costResult.totalCostRange.max)}
              </div>
              
              {costResult.isWithLawyer && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Based on approximately {costResult.hoursRange.min}-{costResult.hoursRange.max} hours of legal work</p>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Cost Breakdown</h3>
              
              <Accordion type="single" collapsible className="w-full">
                {costResult.categories.map((category, index) => (
                  <AccordionItem value={`category-${index}`} key={index}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between flex-1 pr-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            {category.icon}
                          </div>
                          <span>{category.name}</span>
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(category.min)} - {formatCurrency(category.max)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-1 px-4">
                        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                        <div className="space-y-4">
                          {category.items.map((item, itemIndex) => (
                            (item.min > 0 || item.max > 0) && (
                              <div key={itemIndex} className="border-b border-gray-100 pb-3">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">{item.name}</span>
                                  <span className="text-sm font-medium">
                                    {formatCurrency(item.min)} - {formatCurrency(item.max)}
                                  </span>
                                </div>
                                {item.note && (
                                  <p className="text-xs text-muted-foreground">{item.note}</p>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Note</h3>
              <p className="text-sm text-yellow-700">
                This cost estimate is based on general information and should not be considered a quote. 
                Actual legal costs can vary significantly based on many factors, including:
              </p>
              <ul className="text-sm text-yellow-700 list-disc pl-5 mt-2 space-y-1">
                {costResult.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
              <p className="text-sm text-yellow-700 mt-2">
                For a more accurate cost assessment, consult directly with a legal professional who can 
                evaluate your specific situation.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
            >
              Adjust Estimate
            </Button>
            <Button 
              onClick={() => window.print()}
            >
              Print Estimate
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Cost Saving Opportunities</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Consider mediation or alternative dispute resolution options</li>
                  <li>Prepare your own documents where possible under legal guidance</li>
                  <li>Be organized and efficient when communicating with your lawyer</li>
                  <li>Consider legal aid or pro bono services if you qualify</li>
                  <li>Explore limited scope retainers (paying a lawyer for specific tasks only)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Potential Additional Costs Not Included</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Appeal costs (if the decision is appealed)</li>
                  <li>Enforcement of judgments or orders</li>
                  <li>Costs related to specialized research or investigations</li>
                  <li>Translation services</li>
                  <li>Costs of accommodating disabilities or special needs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <span className="text-xs text-muted-foreground">Results</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderProgressBar()}
      
      {currentStep === 1 && renderQuestionnaireStep()}
      {currentStep === 2 && renderResultStep()}
    </div>
  );
};

export default CostEstimator;