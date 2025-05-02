import { useState } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export default function RegulatoryCompliancePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MainLayout>
      <Helmet>
        <title>Regulatory Compliance | LegalAI</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("Regulatory Compliance")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("Information about our compliance with Canadian regulations governing AI legal assistants")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
            <TabsTrigger value="provincial">Provincial Guidelines</TabsTrigger>
            <TabsTrigger value="ethics">Ethics & Transparency</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Framework</CardTitle>
                <CardDescription>
                  Key regulations governing AI legal assistants in Canada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Artificial Intelligence and Data Act (AIDA)</h3>
                  <p>
                    Initially introduced as part of Bill C-27 in 2022, AIDA was designed to regulate high-impact AI systems. 
                    Canada has not yet enacted federal AI legislation, but we proactively align with proposed frameworks to 
                    ensure future compliance.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-6">Provincial Law Society Regulations</h3>
                  <p>
                    Several Canadian law societies have issued guidelines for using generative AI in legal contexts. We monitor 
                    and comply with guidelines from all provincial law societies, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Law Society of British Columbia</li>
                    <li>Law Society of Alberta ("The Generative AI Playbook")</li>
                    <li>Law Society of Ontario</li>
                    <li>Law Society of Manitoba</li>
                    <li>Law Society of Saskatchewan</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold mt-6">Unauthorized Practice of Law (UPL) Restrictions</h3>
                  <p>
                    Provincial law societies strictly regulate who can provide legal services. Our AI platform is designed
                    to assist with legal information rather than provide legal advice, with clear disclaimers about our limitations.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-6">Privacy Laws</h3>
                  <p>
                    PIPEDA (Personal Information Protection and Electronic Documents Act) at the federal level and provincial
                    privacy laws impose strict requirements on handling sensitive client information. Our platform implements
                    robust data protection measures compliant with these regulations.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-6">Canadian Bar Association Guidelines</h3>
                  <p>
                    The CBA has published ethics guidelines for AI use by legal practitioners. We adhere to these guidelines,
                    with particular emphasis on data privacy, security, and competence standards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Data Tab */}
          <TabsContent value="privacy" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data Protection</CardTitle>
                <CardDescription>
                  How we protect your data and comply with Canadian privacy laws
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>PIPEDA Compliance</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        The Personal Information Protection and Electronic Documents Act (PIPEDA) is Canada's federal privacy law
                        for private-sector organizations. Our privacy practices comply with PIPEDA's principles:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Accountability:</span> We've appointed a Privacy Officer responsible for ensuring compliance</li>
                        <li><span className="font-medium">Identifying Purposes:</span> We clearly state why we collect your data</li>
                        <li><span className="font-medium">Consent:</span> We obtain meaningful consent before collecting your information</li>
                        <li><span className="font-medium">Limiting Collection:</span> We only collect information necessary for stated purposes</li>
                        <li><span className="font-medium">Limiting Use, Disclosure, and Retention:</span> We use your data only for the purposes for which it was collected</li>
                        <li><span className="font-medium">Accuracy:</span> We maintain accurate and up-to-date information</li>
                        <li><span className="font-medium">Safeguards:</span> We protect your information with security measures</li>
                        <li><span className="font-medium">Openness:</span> We are transparent about our privacy practices</li>
                        <li><span className="font-medium">Individual Access:</span> You can access your personal information</li>
                        <li><span className="font-medium">Challenging Compliance:</span> You can challenge our compliance</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Data Retention Policy</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        We retain your data for only as long as necessary to fulfill the purposes for which it was collected
                        or to comply with legal requirements.
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><span className="font-medium">Account Information:</span> Retained as long as your account is active</li>
                        <li><span className="font-medium">Legal Documents:</span> Retained for 7 years unless you request deletion</li>
                        <li><span className="font-medium">Chat History:</span> Retained for 2 years unless you request deletion</li>
                        <li><span className="font-medium">Payment Information:</span> Retained for 7 years for tax purposes</li>
                        <li><span className="font-medium">Usage Analytics:</span> Retained for 2 years in anonymized form</li>
                      </ul>
                      <p className="mt-4">
                        You can request deletion of your data at any time through your account settings.
                        Some information may be retained for legal requirements even after deletion requests.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Data Security Measures</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        We implement robust security measures to protect your personal and legal information:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Encryption:</span> All data is encrypted both in transit and at rest</li>
                        <li><span className="font-medium">Access Controls:</span> Strict access controls limit who can access your data</li>
                        <li><span className="font-medium">Regular Audits:</span> We conduct regular security audits and vulnerability assessments</li>
                        <li><span className="font-medium">Breach Response:</span> We have a comprehensive breach response plan</li>
                        <li><span className="font-medium">Data Minimization:</span> We collect only what is necessary for service provision</li>
                        <li><span className="font-medium">Secure Infrastructure:</span> Our systems are hosted in Canadian data centers</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Your Privacy Rights</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Under Canadian privacy laws, you have the right to:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Access your personal information</li>
                        <li>Request corrections to inaccurate information</li>
                        <li>Withdraw consent for certain data uses</li>
                        <li>Request deletion of your data (subject to legal requirements)</li>
                        <li>Know how your information is used and disclosed</li>
                        <li>Be informed of data breaches affecting your information</li>
                      </ul>
                      <p className="mt-4">
                        To exercise these rights, visit your account settings or contact our Privacy Officer at privacy@legalaican.com.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Provincial Guidelines Tab */}
          <TabsContent value="provincial" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Provincial Law Society Guidelines</CardTitle>
                <CardDescription>
                  Law society guidelines on AI use in each province
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="bc">
                    <AccordionTrigger>Law Society of British Columbia</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        The Law Society of BC emphasizes that lawyers must maintain professional competence when using AI tools,
                        including understanding AI limitations. Key guidance includes:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Lawyers must exercise professional judgment when using AI-generated content</li>
                        <li>AI tools should be used as assistants, not replacements for legal analysis</li>
                        <li>Client confidentiality must be preserved when using third-party AI services</li>
                        <li>Lawyers must verify the accuracy of all AI-generated information</li>
                      </ul>
                      <p className="mt-4 text-sm">
                        <a href="https://www.lawsociety.bc.ca/support-and-resources-for-lawyers/act-rules-and-code/code-of-professional-conduct-for-british-columbia/" 
                           className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          View Law Society of BC Code of Professional Conduct
                        </a>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="alberta">
                    <AccordionTrigger>Law Society of Alberta</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        The Law Society of Alberta published "The Generative AI Playbook" with comprehensive guidelines for lawyers using AI tools.
                        Key recommendations include:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Conduct thorough vendor due diligence before adopting AI tools</li>
                        <li>Implement governance structures for responsible AI use</li>
                        <li>Maintain human oversight of all AI-generated content</li>
                        <li>Ensure client data remains confidential when using AI tools</li>
                        <li>Use AI tools to enhance, not replace, legal judgment</li>
                      </ul>
                      <p className="mt-4 text-sm">
                        <a href="https://www.lawsociety.ab.ca/lawyers-and-students/practice-resources/practice-management-resources/generative-ai/" 
                           className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          View Law Society of Alberta AI Resources
                        </a>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="ontario">
                    <AccordionTrigger>Law Society of Ontario</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        The Law Society of Ontario advises lawyers to exercise caution when using AI tools for legal work.
                        Their guidance emphasizes:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Lawyers remain responsible for all work product, even when using AI tools</li>
                        <li>Confidentiality must be maintained when sharing client information with AI systems</li>
                        <li>AI should be used as a supplement to, not a replacement for, legal expertise</li>
                        <li>Lawyers should stay informed about AI capabilities and limitations</li>
                        <li>Firms should develop policies for responsible AI use</li>
                      </ul>
                      <p className="mt-4 text-sm">
                        <a href="https://lso.ca/lawyers/practice-supports-and-resources/practice-management-topics/technological-resources" 
                           className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          View Law Society of Ontario Technology Resources
                        </a>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="other">
                    <AccordionTrigger>Other Provincial Law Societies</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Several other provincial law societies have issued guidance on AI use in legal practice:
                      </p>
                      <h4 className="font-semibold mt-2">Law Society of Manitoba</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Emphasizes lawyer accountability for AI-generated content</li>
                        <li>Recommends careful review of all AI outputs</li>
                        <li>Stresses importance of data security when using AI tools</li>
                      </ul>
                      
                      <h4 className="font-semibold mt-2">Law Society of Saskatchewan</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Provides guidance on client disclosure when using AI tools</li>
                        <li>Recommends technological competence when implementing AI</li>
                        <li>Advises on maintaining confidentiality with third-party AI services</li>
                      </ul>
                      
                      <h4 className="font-semibold mt-2">Law Society of Quebec (Barreau du Québec)</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Addresses AI use in the context of professional secrecy</li>
                        <li>Provides bilingual guidance on emerging technologies</li>
                        <li>Emphasizes the need for professional judgment alongside AI tools</li>
                      </ul>
                      
                      <p className="mt-4 text-sm">
                        <a href="https://flsc.ca/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          Federation of Law Societies of Canada Resources
                        </a>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ethics & Transparency Tab */}
          <TabsContent value="ethics" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ethics & AI Transparency</CardTitle>
                <CardDescription>
                  Our ethical AI principles and transparency measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Canadian Bar Association Ethics Guidelines</h3>
                    <p className="mb-4">
                      We follow the Canadian Bar Association's ethics guidelines for AI use in legal contexts:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><span className="font-medium">Competence:</span> Our team maintains expertise in both AI technology and Canadian law</li>
                      <li><span className="font-medium">Client Confidentiality:</span> We implement strong data protection to preserve confidentiality</li>
                      <li><span className="font-medium">Supervision:</span> All AI outputs are designed for human review, not autonomous use</li>
                      <li><span className="font-medium">Clear Communication:</span> We're transparent about AI capabilities and limitations</li>
                      <li><span className="font-medium">Avoiding Unauthorized Practice:</span> Our system is designed to provide information, not legal advice</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI Models & Data Sources</h3>
                    <p className="mb-4">
                      Transparency about our AI technology is essential to building trust. Our platform uses:
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">DeepSeek AI</h4>
                        <p className="text-sm">Primary language model for document generation and legal analysis, selected for accuracy on legal content.</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Anthropic Claude</h4>
                        <p className="text-sm">Secondary model for conversational legal assistance, chosen for its careful harm reduction approach.</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">OpenAI GPT</h4>
                        <p className="text-sm">Tertiary model for specialized tasks requiring specific capabilities.</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm">
                      All models are used through secure API connections with enterprise-grade data protection.
                      Your data is never used to train these models without explicit consent.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Limitations of Our AI</h3>
                    <p className="mb-4">
                      We are committed to transparent communication about what our AI can and cannot do:
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Not Legal Advice:</span> Our AI provides information, not personalized legal advice</p>
                      <p><span className="font-medium">Not a Replacement for Lawyers:</span> For complex legal matters, consultation with a qualified lawyer is essential</p>
                      <p><span className="font-medium">Knowledge Cutoffs:</span> Our AI models have knowledge cutoffs and may not reflect recent legal changes</p>
                      <p><span className="font-medium">Potential for Errors:</span> AI-generated content should always be verified by legal professionals</p>
                      <p><span className="font-medium">Limited Context Understanding:</span> AI may misinterpret complex legal scenarios without sufficient context</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Human Oversight</h3>
                    <p>
                      All aspects of our platform include human oversight to ensure quality and accuracy:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Our legal database is curated and updated by Canadian legal professionals</li>
                      <li>Document templates are created and reviewed by lawyers in each province</li>
                      <li>System responses are regularly audited for accuracy and compliance</li>
                      <li>We provide options for lawyer review of AI-generated documents</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}