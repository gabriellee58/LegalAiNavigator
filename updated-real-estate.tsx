import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RealEstateLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("real estate law");

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
          Real Estate Law
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
      title="Real Estate Law"
      description="Real estate law covers property rights, transactions, landlord-tenant relations, and land use regulations. Our templates help with property purchases, leases, and other real estate documents common in Canadian property transactions."
      templateTypes={["real-estate"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Environmental", path: "/legal-domains/environmental" },
        { name: "Municipal", path: "/legal-domains/municipal" }
      ]}
      resources={[
        {
          title: "Canada Mortgage and Housing Corporation",
          description: "Information on housing market data, mortgage loan insurance, and programs to support Canadians in finding affordable housing.",
          link: "https://www.cmhc-schl.gc.ca/en"
        },
        {
          title: "Canadian Real Estate Association",
          description: "National organization representing real estate professionals, with resources for buyers and sellers.",
          link: "https://www.crea.ca/"
        },
        {
          title: "Land Registry Information",
          description: "Provincial land registry systems for property searches and land title information.",
          link: "https://www.canada.ca/en/services/business/permits/federallyregulatedbusinessactivities/landsurvey.html"
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
      title="Real Estate Law"
      description="Real estate law covers property rights, transactions, landlord-tenant relations, and land use regulations. Our templates help with property purchases, leases, and other real estate documents common in Canadian property transactions."
      templateTypes={["real-estate"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Family Law", path: "/legal-domains/family-law" },
        { name: "Environmental", path: "/legal-domains/environmental" },
        { name: "Municipal", path: "/legal-domains/municipal" }
      ]}
      resources={[
        {
          title: "Canada Mortgage and Housing Corporation",
          description: "Information on housing market data, mortgage loan insurance, and programs to support Canadians in finding affordable housing.",
          link: "https://www.cmhc-schl.gc.ca/en"
        },
        {
          title: "Canadian Real Estate Association",
          description: "National organization representing real estate professionals, with resources for buyers and sellers.",
          link: "https://www.crea.ca/"
        },
        {
          title: "Land Registry Information",
          description: "Provincial land registry systems for property searches and land title information.",
          link: "https://www.canada.ca/en/services/business/permits/federallyregulatedbusinessactivities/landsurvey.html"
        }
      ]}
    />
  
    </div>
  );
}

export default RealEstateLawPage;