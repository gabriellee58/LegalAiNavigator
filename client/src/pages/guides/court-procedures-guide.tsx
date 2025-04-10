import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Scale, Gavel, Home, Users, Building, Calendar, FileText, ListTodo, CheckSquare } from 'lucide-react';

const CourtProceduresGuide: React.FC = () => {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/guides/getting-started">
          <Button variant="ghost" className="gap-1">
            <ChevronLeft size={16} />
            Back to Guides
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Court Procedures Guide</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Navigate the Canadian court system with confidence using our step-by-step court procedures guide
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="using">Using The Tool</TabsTrigger>
            <TabsTrigger value="tracking">Tracking Progress</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is the Court Procedures Tool?</CardTitle>
                <CardDescription>
                  Understanding Canadian court procedures made simple
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Court Procedures tool provides comprehensive, step-by-step guidance on navigating various 
                  Canadian court processes across different jurisdictions. Whether you're dealing with a civil 
                  claim, criminal proceeding, family court matter, or administrative tribunal, our tool breaks 
                  down complex legal procedures into manageable steps.
                </p>
                <p>
                  Each procedure is carefully documented with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Step-by-step instructions with detailed explanations</li>
                  <li>Required documents and forms for each step</li>
                  <li>Estimated timeframes for completion</li>
                  <li>Court fees and associated costs</li>
                  <li>Important warnings and tips from legal experts</li>
                  <li>Visual flowcharts of the entire process</li>
                  <li>Links to official court resources and references</li>
                </ul>
                <p>
                  You can also track your progress through a procedure, making notes along the way, and ensuring 
                  you don't miss any critical steps in your legal journey.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="text-lg">Browse Procedure Categories</CardTitle>
                  <Scale className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Explore procedures organized by court type and jurisdiction.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="text-lg">Follow Detailed Steps</CardTitle>
                  <ListTodo className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Each procedure contains detailed steps with instructions, documents, and tips.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="text-lg">Track Your Progress</CardTitle>
                  <CheckSquare className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Mark steps as complete and track your progress through any procedure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Procedure Categories</CardTitle>
                <CardDescription>
                  Our database covers major court procedure types across Canada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Court Procedures tool organizes procedures into five main categories to help you quickly 
                  find the information most relevant to your situation:
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Civil Procedure</h3>
                      <p className="text-sm text-muted-foreground">
                        Procedures for civil cases in Canadian courts, including lawsuits, monetary claims, 
                        and non-criminal legal disputes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Gavel className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Criminal Procedure</h3>
                      <p className="text-sm text-muted-foreground">
                        Procedures for criminal cases in Canadian courts, from charges and arraignment through 
                        trial and sentencing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Family Court</h3>
                      <p className="text-sm text-muted-foreground">
                        Procedures for family law matters including divorce, child custody, support payments, 
                        and protection orders.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Small Claims</h3>
                      <p className="text-sm text-muted-foreground">
                        Simplified procedures for small claims courts across Canadian provinces, typically 
                        for disputes under $35,000 (varies by province).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Administrative Tribunals</h3>
                      <p className="text-sm text-muted-foreground">
                        Procedures for administrative tribunals and boards in Canada, handling matters like 
                        employment, rental disputes, human rights, and regulatory issues.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Link href="/court-procedures">
                <Button>
                  Explore Court Procedures
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Using the Tool Tab */}
          <TabsContent value="using" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Use the Court Procedures Tool</CardTitle>
                <CardDescription>
                  A step-by-step guide to navigating the tool effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center">
                      <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Browse Procedure Categories
                    </h3>
                    <p className="pl-8">
                      Start by selecting one of the five main procedure categories (Civil, Criminal, Family, Small Claims, 
                      or Administrative). Each category contains specific procedures relevant to that area of law.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center">
                      <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Select a Specific Procedure
                    </h3>
                    <p className="pl-8">
                      After choosing a category, you'll see a list of specific procedures. Each procedure includes a brief 
                      description, jurisdiction information, and estimated timeframe. Click "View Details" to learn more.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center">
                      <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Review Procedure Details
                    </h3>
                    <p className="pl-8">
                      The procedure details page provides comprehensive information including:
                    </p>
                    <ul className="list-disc pl-14 space-y-1">
                      <li>Overview of the entire process</li>
                      <li>Estimated timeframes for each phase</li>
                      <li>Court fees and costs</li>
                      <li>Step-by-step breakdown with detailed instructions</li>
                      <li>Required documents and forms</li>
                      <li>Tips and warnings for each step</li>
                      <li>References to official sources</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center">
                      <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                      Start Tracking a Procedure
                    </h3>
                    <p className="pl-8">
                      If you're actively working through a court procedure, click "Start This Procedure" to create a 
                      personalized tracker. This allows you to track your progress, make notes, and receive reminders 
                      about upcoming deadlines.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center">
                      <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                      Track Your Progress
                    </h3>
                    <p className="pl-8">
                      Access your active procedures from the "My Procedures" tab. For each procedure, you can:
                    </p>
                    <ul className="list-disc pl-14 space-y-1">
                      <li>Mark steps as complete</li>
                      <li>Add personal notes</li>
                      <li>View your current step and overall progress</li>
                      <li>Set expected completion dates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Progress Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tracking Your Progress</CardTitle>
                <CardDescription>
                  How to effectively manage your active court procedures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Court Procedures tool allows you to track your progress through any legal process. This feature 
                  helps you stay organized, meet deadlines, and ensure you're completing all required steps.
                </p>

                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Starting a Procedure</h3>
                    <p className="text-sm">
                      When viewing a procedure's details, click "Start This Procedure" to begin tracking. You'll be 
                      prompted to give your procedure a title (e.g., "My Small Claims Case against Company X") and 
                      you can add initial notes if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Viewing Your Active Procedures</h3>
                    <p className="text-sm">
                      Access all your active procedures from the "My Procedures" tab. This dashboard shows:
                    </p>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      <li>All procedures you're currently tracking</li>
                      <li>Current status of each procedure</li>
                      <li>Progress bar indicating overall completion</li>
                      <li>Start date and expected completion date</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Managing Individual Steps</h3>
                    <p className="text-sm">
                      When viewing a specific procedure, you'll see:
                    </p>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      <li>Your current step highlighted</li>
                      <li>Detailed instructions for the current step</li>
                      <li>Required documents and forms</li>
                      <li>"Mark as Complete" button to advance to the next step</li>
                      <li>Option to add notes specific to each step</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Adding Notes</h3>
                    <p className="text-sm">
                      The notes feature allows you to document important information:
                    </p>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      <li>Court dates and times</li>
                      <li>Contact information for court officials</li>
                      <li>Details about your specific case</li>
                      <li>Questions for your legal advisor</li>
                      <li>Reminders for additional documents</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Completing a Procedure</h3>
                    <p className="text-sm">
                      Once you've completed all steps in a procedure, click "Mark as Complete" to archive it. 
                      Completed procedures remain accessible in your history for future reference.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Link href="/court-procedures">
                <Button>
                  Start Tracking a Procedure
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions about the Court Procedures tool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">How accurate is the information in the Court Procedures tool?</h3>
                    <p className="text-sm mt-1">
                      All procedures are researched and verified against official court resources and legal references. 
                      However, court procedures can change over time. Always verify current requirements with your local 
                      court or a legal professional. Sources and references are provided for each procedure.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Can I use this tool instead of hiring a lawyer?</h3>
                    <p className="text-sm mt-1">
                      While our Court Procedures tool provides detailed guidance, it is not a substitute for legal advice. 
                      It's designed to help you understand the process and prepare, but complex legal matters often 
                      benefit from professional legal assistance. Consider using this tool alongside consultations with 
                      a qualified legal professional.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">What jurisdictions are covered?</h3>
                    <p className="text-sm mt-1">
                      Our database includes procedures from all Canadian provinces and territories, with a focus on 
                      federal courts and the most populous provinces. Each procedure clearly indicates the jurisdiction 
                      it applies to. We continuously add new procedures to expand our coverage.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Can I download or print procedure information?</h3>
                    <p className="text-sm mt-1">
                      Yes, each procedure page includes a "Print" option that formats the content for printing. You can 
                      print the entire procedure or specific sections as needed for reference when you're away from your 
                      computer.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Are court forms included with the procedures?</h3>
                    <p className="text-sm mt-1">
                      We provide links to official court forms where available, but we don't host the forms directly. 
                      Each procedure includes details about which forms are required at each step and where to obtain them.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">How often is the information updated?</h3>
                    <p className="text-sm mt-1">
                      Our legal research team regularly reviews and updates procedure information to reflect changes in 
                      court rules and processes. Each procedure indicates when it was last updated. If you notice 
                      outdated information, please contact us.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Is my case information private?</h3>
                    <p className="text-sm mt-1">
                      Yes, any notes or progress tracking information you add to your procedures is private and 
                      only accessible to your account. We implement strong security measures to protect your data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center pt-6">
          <Link href="/court-procedures">
            <Button size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              Go to Court Procedures
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourtProceduresGuide;