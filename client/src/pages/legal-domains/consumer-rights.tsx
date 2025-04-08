import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ConsumerRightsPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("Consumer Rights Law");

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
          Consumer Rights
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
      title="Consumer Rights"
      description="Consumer rights law protects buyers of goods and services against unfair practices, fraud, and safety hazards. Our templates help with consumer complaints, refund requests, and protection of your rights in Canadian marketplace transactions."
      templateTypes={["consumer"]}
      relatedDomains={[
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Insurance", path: "/legal-domains/insurance" },
        { name: "Personal Injury", path: "/legal-domains/personal-injury" }
      ]}
      resources={[
        {
          title: "Office of Consumer Affairs",
          description: "Federal consumer information on rights, complaints, and marketplace issues across Canada.",
          link: "https://www.ic.gc.ca/eic/site/oca-bc.nsf/eng/home"
        },
        {
          title: "Competition Bureau Canada",
          description: "Information on consumer protection from false advertising, price-fixing, and other unfair business practices.",
          link: "https://www.competitionbureau.gc.ca/eic/site/cb-bc.nsf/eng/home"
        },
        {
          title: "Provincial Consumer Protection Offices",
          description: "Local consumer protection authorities that handle complaints and enforce provincial regulations.",
          link: "https://www.canada.ca/en/services/finance/consumer-affairs.html"
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
      title="Consumer Rights"
      description="Consumer rights law protects buyers of goods and services against unfair practices, fraud, and safety hazards. Our templates help with consumer complaints, refund requests, and protection of your rights in Canadian marketplace transactions."
      templateTypes={["consumer"]}
      relatedDomains={[
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Business", path: "/legal-domains/business" },
        { name: "Insurance", path: "/legal-domains/insurance" },
        { name: "Personal Injury", path: "/legal-domains/personal-injury" }
      ]}
      resources={[
        {
          title: "Office of Consumer Affairs",
          description: "Federal consumer information on rights, complaints, and marketplace issues across Canada.",
          link: "https://www.ic.gc.ca/eic/site/oca-bc.nsf/eng/home"
        },
        {
          title: "Competition Bureau Canada",
          description: "Information on consumer protection from false advertising, price-fixing, and other unfair business practices.",
          link: "https://www.competitionbureau.gc.ca/eic/site/cb-bc.nsf/eng/home"
        },
        {
          title: "Provincial Consumer Protection Offices",
          description: "Local consumer protection authorities that handle complaints and enforce provincial regulations.",
          link: "https://www.canada.ca/en/services/finance/consumer-affairs.html"
        }
      ]}
    />
  
    </div>
  );
}

export default ConsumerRightsPage;