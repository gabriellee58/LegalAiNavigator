import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function BusinessLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("business law");

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
          Business Law
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
              title="Business Law"
              description="Business law governs commercial activities, corporate formation, operations, and transactions. Our templates help with incorporation, partnerships, contracts, and other documents essential for Canadian businesses."
              templateTypes={["business", "contract"]}
              relatedDomains={[
                { name: "Employment", path: "/legal-domains/employment" },
                { name: "Tax", path: "/legal-domains/tax" },
                { name: "Real Estate", path: "/legal-domains/real-estate" },
                { name: "Intellectual Property", path: "/legal-domains/intellectual-property" }
              ]}
              resources={[
                {
                  title: "Corporations Canada",
                  description: "Federal corporate registry with information on incorporation, filing requirements, and corporate compliance.",
                  link: "https://corporationscanada.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home"
                },
                {
                  title: "Business Development Bank of Canada",
                  description: "Resources and financing for Canadian businesses, with guides on business planning, growth, and management.",
                  link: "https://www.bdc.ca/en"
                },
                {
                  title: "Canada Business Network",
                  description: "Government services for businesses and start-ups, including regulations, financing, and market research.",
                  link: "https://www.canada.ca/en/services/business.html"
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
        title="Business Law"
        description="Business law governs commercial activities, corporate formation, operations, and transactions. Our templates help with incorporation, partnerships, contracts, and other documents essential for Canadian businesses."
        templateTypes={["business", "contract"]}
        relatedDomains={[
          { name: "Employment", path: "/legal-domains/employment" },
          { name: "Tax", path: "/legal-domains/tax" },
          { name: "Real Estate", path: "/legal-domains/real-estate" },
          { name: "Intellectual Property", path: "/legal-domains/intellectual-property" }
        ]}
        resources={[
          {
            title: "Corporations Canada",
            description: "Federal corporate registry with information on incorporation, filing requirements, and corporate compliance.",
            link: "https://corporationscanada.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home"
          },
          {
            title: "Business Development Bank of Canada",
            description: "Resources and financing for Canadian businesses, with guides on business planning, growth, and management.",
            link: "https://www.bdc.ca/en"
          },
          {
            title: "Canada Business Network",
            description: "Government services for businesses and start-ups, including regulations, financing, and market research.",
            link: "https://www.canada.ca/en/services/business.html"
          }
        ]}
      />
    </div>
  );
}

export default BusinessLawPage;