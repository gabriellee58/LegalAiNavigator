import { Link } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

function HomePage() {
  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Hero section */}
        <div className="mb-12 md:mb-16">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-neutral-800 mb-4">
              AI-Powered Legal Assistance for <span className="text-primary">Canadians</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 mb-6">
              Get legal guidance, generate documents, and research Canadian law with the power of artificial intelligence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/legal-assistant">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  <span className="material-icons mr-2">smart_toy</span>
                  Chat with Legal Assistant
                </Button>
              </Link>
              <Link href="/document-generator">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <span className="material-icons mr-2">description</span>
                  Generate Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main features section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-6">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Legal Assistant Card */}
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <span className="material-icons text-primary text-2xl">smart_toy</span>
                </div>
                <CardTitle>Virtual Legal Assistant</CardTitle>
                <CardDescription>
                  Get answers to your legal questions from our AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Instant responses to common legal questions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Information about Canadian legal procedures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Guidance on legal rights and obligations</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/legal-assistant" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    Start Chatting
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Document Generator Card */}
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <span className="material-icons text-primary text-2xl">description</span>
                </div>
                <CardTitle>Document Generator</CardTitle>
                <CardDescription>
                  Create custom legal documents in minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Contracts and agreements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Wills and estate planning documents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Residential and commercial leases</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/document-generator" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    Create Documents
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Legal Research Card */}
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <span className="material-icons text-primary text-2xl">search</span>
                </div>
                <CardTitle>Legal Research</CardTitle>
                <CardDescription>
                  Find relevant laws and legal precedents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Search Canadian case law and statutes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Analyze contracts for risks and issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-xs mr-2 mt-1 text-primary">check_circle</span>
                    <span>Get summaries of complex legal concepts</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/legal-research" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    Start Researching
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Disclaimer section */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 md:p-6">
          <div className="flex items-start">
            <div className="mr-4 text-primary">
              <span className="material-icons">info</span>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-2">Important Disclaimer</h3>
              <p className="text-neutral-600 text-sm mb-3">
                LegalAI provides information about Canadian law but is not a substitute for professional legal advice. 
                The information provided is for general guidance only. For specific legal issues, please consult with 
                a qualified lawyer licensed in your jurisdiction.
              </p>
              <p className="text-neutral-600 text-sm">
                The documents generated by this service are templates and may need to be reviewed by a legal 
                professional before use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;
