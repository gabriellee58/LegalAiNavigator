import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Shield, FileText, Building } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ComplianceCheckerTutorialPage() {
  const complianceAreas = [
    "Business Registration and Licensing",
    "Employment Laws",
    "Privacy and Data Protection",
    "Tax Compliance",
    "Health and Safety Regulations",
    "Environmental Regulations",
    "Industry-Specific Requirements",
    "Consumer Protection Laws",
    "Intellectual Property Compliance"
  ];

  const complianceSteps = [
    {
      title: "Select your business type and location",
      description: "Specify your business structure and where you operate.",
      details: "The compliance requirements vary significantly based on your business type (sole proprietorship, corporation, partnership) and the provinces or territories where you operate."
    },
    {
      title: "Choose compliance areas to check",
      description: "Select the regulatory areas relevant to your business.",
      details: "You can select multiple areas such as employment laws, privacy requirements, tax compliance, licensing, and industry-specific regulations."
    },
    {
      title: "Answer the compliance questionnaire",
      description: "Respond to focused questions about your business practices.",
      details: "The AI will generate targeted questions based on your selections. Your responses help determine your compliance status in each area."
    },
    {
      title: "Review your compliance report",
      description: "Get a comprehensive assessment with actionable recommendations.",
      details: "The report highlights compliance strengths, gaps, and specific steps to address any issues. Each finding includes references to relevant laws and regulations."
    }
  ];

  const complianceReport = {
    complianceScore: 78,
    compliantAreas: [
      "Business Registration",
      "Basic Tax Filings",
      "Workplace Health & Safety"
    ],
    nonCompliantAreas: [
      "Privacy Policy Implementation",
      "Employee Records Management"
    ],
    partiallyCompliantAreas: [
      "Website Accessibility",
      "Data Breach Protocol"
    ]
  };

  const implementationTips = [
    {
      title: "Prioritize high-risk areas",
      description: "Address critical compliance issues first, especially those with potential penalties or legal consequences."
    },
    {
      title: "Create an implementation schedule",
      description: "Develop a timeline for addressing compliance gaps based on complexity and importance."
    },
    {
      title: "Assign responsibility",
      description: "Designate specific team members to oversee compliance remediation in each area."
    },
    {
      title: "Document your efforts",
      description: "Keep records of compliance improvements to demonstrate due diligence."
    },
    {
      title: "Schedule regular reviews",
      description: "Plan periodic reassessments to ensure ongoing compliance as regulations change."
    }
  ];

  return (
    <MainLayout>
      <div className="container py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("back_to_home")}
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{t("compliance_checker_tutorial")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
          {t("compliance_checker_description")}
        </p>
        
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Why Compliance Matters</AlertTitle>
          <AlertDescription>
            Business compliance isn't just about avoiding penalties—it's about building a foundation for sustainable growth, establishing trust with customers and partners, and mitigating legal risks. Our Compliance Checker helps you identify and address potential compliance issues before they become problems.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="howto" className="space-y-6">
          <TabsList>
            <TabsTrigger value="howto">{t("how_to_check")}</TabsTrigger>
            <TabsTrigger value="understanding">{t("understanding_reports")}</TabsTrigger>
            <TabsTrigger value="implementation">{t("implementation_guide")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="howto" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("using_the_compliance_checker")}</CardTitle>
                <CardDescription>
                  {t("compliance_checker_steps_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {complianceSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="bg-primary/10 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center text-primary font-medium mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">{step.title}</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-2">{step.description}</p>
                        <p className="text-sm bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">{t("compliance_areas_covered")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {complianceAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("compliance_questionnaire_tips")}</CardTitle>
                <CardDescription>
                  {t("questionnaire_tips_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      {t("be_thorough_and_accurate")}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Answer all questions completely and honestly. The quality of your compliance assessment depends on the accuracy of your responses.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      {t("gather_information_beforehand")}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Have key business documents and information ready, such as business registration details, employee count, industry classification, and current policies.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      {t("use_uncertain_option_when_needed")}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      If you're unsure about an answer, use the "I'm not sure" option rather than guessing. The system will flag these areas for further investigation.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      {t("provide_context_when_possible")}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Use the comment fields to provide additional context or explanation for your answers when appropriate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="understanding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("anatomy_of_a_compliance_report")}</CardTitle>
                <CardDescription>
                  {t("compliance_report_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Overall Compliance Score</h3>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Compliance: {complianceReport.complianceScore}%</span>
                        <Badge variant="outline" className={
                          complianceReport.complianceScore >= 80 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800" :
                          complianceReport.complianceScore >= 60 ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800" :
                          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                        }>
                          {complianceReport.complianceScore >= 80 ? "Good" :
                           complianceReport.complianceScore >= 60 ? "Needs Improvement" :
                           "At Risk"}
                        </Badge>
                      </div>
                      <Progress value={complianceReport.complianceScore} className="h-2" />
                      <p className="text-xs text-neutral-500 mt-2">
                        Based on {complianceAreas.length} compliance areas relevant to your business
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-green-50 dark:bg-green-950/20 px-4 py-3">
                        <h3 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Compliant Areas
                        </h3>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {complianceReport.compliantAreas.map((area, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 px-4 py-3">
                        <h3 className="font-medium text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Partially Compliant
                        </h3>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {complianceReport.partiallyCompliantAreas.map((area, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-red-50 dark:bg-red-950/20 px-4 py-3">
                        <h3 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                          <XCircle className="h-5 w-5" />
                          Non-Compliant Areas
                        </h3>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {complianceReport.nonCompliantAreas.map((area, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Detailed Findings and Recommendations</h3>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <h4 className="font-medium">Privacy Policy Implementation</h4>
                        </div>
                        <div className="ml-7 space-y-2">
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            Your business collects personal information but does not have a comprehensive privacy policy in place.
                          </p>
                          <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                            <h5 className="text-sm font-medium mb-1">Recommendation:</h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              Develop and implement a privacy policy that complies with PIPEDA (Personal Information Protection and Electronic Documents Act) requirements, including consent, purpose limitation, and access provisions.
                            </p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Relevant Legislation:</h5>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              PIPEDA, Sections 5-10 (Fair Information Principles)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-medium">Website Accessibility</h4>
                        </div>
                        <div className="ml-7 space-y-2">
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            Your website has some accessibility features but does not fully comply with WCAG 2.1 standards.
                          </p>
                          <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                            <h5 className="text-sm font-medium mb-1">Recommendation:</h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              Conduct an accessibility audit and implement improvements to ensure compliance with WCAG 2.1 AA standards, including proper contrast ratios, alt text for images, and keyboard navigation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="implementation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("implementing_compliance_recommendations")}</CardTitle>
                <CardDescription>
                  {t("implementation_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {implementationTips.map((tip, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {tip.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Sample Implementation Plan</h3>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 px-4 py-3">
                      <h4 className="font-medium">Privacy Compliance Implementation</h4>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">1</div>
                          <div>
                            <p className="text-sm font-medium">Audit current practices (1-2 weeks)</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              Document what personal information is collected, how it's used, and current security measures.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">2</div>
                          <div>
                            <p className="text-sm font-medium">Draft privacy policy (2-3 weeks)</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              Create a PIPEDA-compliant privacy policy using our document generator or legal templates.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">3</div>
                          <div>
                            <p className="text-sm font-medium">Implement policy and procedures (3-4 weeks)</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              Update websites, forms, and staff training to align with the new privacy policy.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">4</div>
                          <div>
                            <p className="text-sm font-medium">Review and test (1 week)</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              Conduct an internal review to ensure all aspects of the policy are implemented correctly.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <span className="text-xs text-neutral-500">Overall timeline: 7-10 weeks</span>
                        </div>
                        <Button size="sm" variant="outline">Generate Full Implementation Plan</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-400">Compliance Resources</AlertTitle>
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                      LegalAI provides document templates for common compliance documents, including privacy policies, terms of service, employee handbooks, and data breach protocols. Access these in the Document Generator section.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-2">
                    <h3 className="font-medium mb-3">Ongoing Compliance Maintenance</h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
                        Compliance is not a one-time task but an ongoing process. We recommend:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Scheduling quarterly compliance reviews for critical areas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Setting up alerts for regulatory changes in your industry</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Conducting annual comprehensive compliance checks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Training employees on compliance requirements regularly</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("ready_to_check_compliance")}</CardTitle>
              <CardDescription>
                {t("ready_to_check_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button className="w-full sm:w-auto">
                <Shield className="h-4 w-4 mr-2" />
                {t("go_to_compliance_checker")}
              </Button>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {t("compliance_checker_help")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}