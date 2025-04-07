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
        <div className="hero-section mb-12 md:mb-16 rounded-2xl overflow-hidden">
          <div className="max-w-4xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Build a <span className="underline decoration-4 decoration-white/70">team</span> <br/>
              you can trust
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Access comprehensive legal support through advanced AI technology and an expanding template library covering all major Canadian legal domains.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/legal-assistant">
                <Button className="primary-button bg-white text-primary hover:bg-white/90 py-3 px-6 text-base font-bold">
                  <span className="material-icons mr-2">smart_toy</span>
                  Chat with Legal AI
                </Button>
              </Link>
              <Link href="/document-generator">
                <Button variant="outline" className="secondary-button bg-primary/20 text-white border-white/30 hover:bg-primary/30 py-3 px-6 text-base font-bold">
                  <span className="material-icons mr-2">description</span>
                  Generate Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Value proposition section */}
        <div className="mb-16">
          <h2 className="gradient-text text-3xl md:text-4xl font-bold mb-10 text-center">
            Grow your vision with Licensed <br/>Legal AI Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-icons text-primary text-2xl">verified</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Accurate & Current</h3>
              <p className="text-neutral-600">Canadian law-specific AI trained on up-to-date legal resources and precedents.</p>
            </div>
            <div className="feature-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-icons text-primary text-2xl">lock</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-neutral-600">Your legal information is protected with enterprise-grade security protocols.</p>
            </div>
            <div className="feature-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-icons text-primary text-2xl">language</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Bilingual Support</h3>
              <p className="text-neutral-600">Full service in both English and French to meet Canada's bilingual needs.</p>
            </div>
          </div>
        </div>

        {/* Main features section */}
        <div className="mb-16">
          <h2 className="gradient-text text-3xl md:text-4xl font-bold mb-2 text-center">Our Services</h2>
          <p className="text-neutral-600 text-center max-w-2xl mx-auto mb-10">Comprehensive legal tools designed for Canadians</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Legal Assistant Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full purple-gradient-bg flex items-center justify-center mb-2">
                  <span className="material-icons text-white text-2xl">smart_toy</span>
                </div>
                <CardTitle className="text-xl font-bold">Virtual Legal Assistant</CardTitle>
                <CardDescription className="text-neutral-500">
                  Get answers to your legal questions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Instant responses to common legal questions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Information about Canadian legal procedures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Guidance on legal rights and obligations</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/legal-assistant" className="w-full">
                  <Button className="primary-button w-full">
                    Start Chatting
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Document Generator Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full purple-gradient-bg flex items-center justify-center mb-2">
                  <span className="material-icons text-white text-2xl">description</span>
                </div>
                <CardTitle className="text-xl font-bold">Document Generator</CardTitle>
                <CardDescription className="text-neutral-500">
                  Create custom legal documents in minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Templates for all major legal categories</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Customized to your specific needs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Download in multiple formats</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/document-generator" className="w-full">
                  <Button className="primary-button w-full">
                    Create Documents
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Legal Research Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full purple-gradient-bg flex items-center justify-center mb-2">
                  <span className="material-icons text-white text-2xl">search</span>
                </div>
                <CardTitle className="text-xl font-bold">Legal Research</CardTitle>
                <CardDescription className="text-neutral-500">
                  Find relevant laws and legal precedents
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Search Canadian case law and statutes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Analyze contracts for risks and issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary mr-2 mt-0.5">check_circle</span>
                    <span>Get summaries of complex legal concepts</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/legal-research" className="w-full">
                  <Button className="primary-button w-full">
                    Start Researching
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Template categories section */}
        <div className="mb-16">
          <h2 className="gradient-text text-3xl md:text-4xl font-bold mb-2 text-center">
            Comprehensive Legal Coverage
          </h2>
          <p className="text-neutral-600 text-center max-w-2xl mx-auto mb-10">
            Our platform offers templates and AI guidance across all major Canadian legal domains
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Linked domains with available pages */}
            <Link href="/legal-domains/family-law">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-primary">Family Law</p>
              </div>
            </Link>
            <Link href="/legal-domains/real-estate">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-primary">Real Estate</p>
              </div>
            </Link>
            <Link href="/legal-domains/business">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-primary">Business</p>
              </div>
            </Link>
            <Link href="/legal-domains/employment">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-primary">Employment</p>
              </div>
            </Link>
            <Link href="/legal-domains/immigration">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-primary">Immigration</p>
              </div>
            </Link>
            <Link href="/legal-domains/personal-injury">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-primary">Personal Injury</p>
              </div>
            </Link>
            
            {/* Future domains (no pages yet) */}
            {["Tax", "Estate Planning", "Consumer Rights", "Criminal", "Civil Litigation", "Indigenous Law", "Environmental"].map((category) => (
              <div key={category} className="bg-white border border-gray-100 rounded-lg p-4 text-center opacity-80">
                <p className="font-medium text-primary">{category}</p>
                <span className="text-xs text-neutral-500">Coming soon</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-12">
          <div className="flex items-start">
            <div className="mr-4 text-primary">
              <span className="material-icons text-2xl">info</span>
            </div>
            <div>
              <h3 className="gradient-text font-bold text-lg mb-2">Important Disclaimer</h3>
              <p className="text-neutral-600 mb-3">
                LegalAI provides information about Canadian law but is not a substitute for professional legal advice. 
                The information provided is for general guidance only. For specific legal issues, please consult with 
                a qualified lawyer licensed in your jurisdiction.
              </p>
              <p className="text-neutral-600">
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
