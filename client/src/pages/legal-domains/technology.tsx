import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TechnologyLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("technology law");

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-5 w-2/3 mb-10" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // If we have domain data from the database, show the domain detail component
  if (domainId) {
    return (
      <div className="container py-6 max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-transparent bg-clip-text">
          Technology Law
        </h1>
        
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Domain Details</TabsTrigger>
            <TabsTrigger value="templates">Templates & Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <DomainDetail domainId={domainId} />
          </TabsContent>
          
          <TabsContent value="templates">
            
    <LegalDomainPage
      title="Technology Law"
      description="Technology law addresses legal issues related to software, internet, data privacy, and emerging technologies. Our templates help with technology contracts, privacy policies, and digital rights protection under Canadian technology regulations."
      templateTypes={["technology", "privacy", "digital"]}
      relatedDomains={[
        { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Entertainment", path: "/legal-domains/entertainment" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" }
      ]}
      resources={[
        {
          title: "Office of the Privacy Commissioner of Canada",
          description: "Federal resources on privacy laws, data protection requirements, and compliance for tech companies.",
          link: "https://www.priv.gc.ca/en/"
        },
        {
          title: "Canadian Radio-television and Telecommunications Commission",
          description: "Information on telecommunications regulations, internet policies, and digital communication laws.",
          link: "https://crtc.gc.ca/eng/home-accueil.htm"
        },
        {
          title: "Innovation, Science and Economic Development Canada",
          description: "Resources on technology policy, digital economy initiatives, and innovation regulations.",
          link: "https://www.ic.gc.ca/eic/site/icgc.nsf/eng/home"
        }
      ]}
    />
  
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // If no domain data is found, fall back to the static template
  return (
    <div className="container py-6">
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This domain hasn't been fully integrated with our knowledge base yet. 
          You can still access templates and resources below.
        </AlertDescription>
      </Alert>
      
      
    <LegalDomainPage
      title="Technology Law"
      description="Technology law addresses legal issues related to software, internet, data privacy, and emerging technologies. Our templates help with technology contracts, privacy policies, and digital rights protection under Canadian technology regulations."
      templateTypes={["technology", "privacy", "digital"]}
      relatedDomains={[
        { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Entertainment", path: "/legal-domains/entertainment" },
        { name: "Consumer Rights", path: "/legal-domains/consumer-rights" }
      ]}
      resources={[
        {
          title: "Office of the Privacy Commissioner of Canada",
          description: "Federal resources on privacy laws, data protection requirements, and compliance for tech companies.",
          link: "https://www.priv.gc.ca/en/"
        },
        {
          title: "Canadian Radio-television and Telecommunications Commission",
          description: "Information on telecommunications regulations, internet policies, and digital communication laws.",
          link: "https://crtc.gc.ca/eng/home-accueil.htm"
        },
        {
          title: "Innovation, Science and Economic Development Canada",
          description: "Resources on technology policy, digital economy initiatives, and innovation regulations.",
          link: "https://www.ic.gc.ca/eic/site/icgc.nsf/eng/home"
        }
      ]}
    />
  
    </div>
  );
}

export default TechnologyLawPage;