import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProceduralGuides from "@/components/legal-domains/ProceduralGuides";

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
            <TabsTrigger value="guides">Procedural Guides</TabsTrigger>
            <TabsTrigger value="templates">Templates & Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <DomainDetail domainId={domainId} />
          </TabsContent>
          
          <TabsContent value="guides">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <ProceduralGuides domainId={domainId} />
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <LegalDomainPage
              title="Business Law"
              description="Business law governs the formation, operation, and dissolution of businesses and commercial transactions. Our resources cover incorporation, contracts, intellectual property protection, and regulatory compliance."
              templateTypes={["incorporation", "business", "contracts", "commercial"]}
              relatedDomains={[
                { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
                { name: "Tax Law", path: "/legal-domains/tax-law" },
                { name: "Employment Law", path: "/legal-domains/employment-law" },
                { name: "Real Estate", path: "/legal-domains/real-estate" }
              ]}
              resources={[
                {
                  title: "Corporations Canada",
                  description: "Federal incorporation resources, forms, and online filing services.",
                  link: "https://www.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home"
                },
                {
                  title: "Canada Business Network",
                  description: "Government services for entrepreneurs and detailed guides for business planning.",
                  link: "https://www.canada.ca/en/services/business.html"
                },
                {
                  title: "Competition Bureau Canada",
                  description: "Resources about Canadian competition law, mergers, and fair business practices.",
                  link: "https://www.competitionbureau.gc.ca/eic/site/cb-bc.nsf/eng/home"
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
        description="Business law governs the formation, operation, and dissolution of businesses and commercial transactions. Our resources cover incorporation, contracts, intellectual property protection, and regulatory compliance."
        templateTypes={["incorporation", "business", "contracts", "commercial"]}
        relatedDomains={[
          { name: "Intellectual Property", path: "/legal-domains/intellectual-property" },
          { name: "Tax Law", path: "/legal-domains/tax-law" },
          { name: "Employment Law", path: "/legal-domains/employment-law" },
          { name: "Real Estate", path: "/legal-domains/real-estate" }
        ]}
        resources={[
          {
            title: "Corporations Canada",
            description: "Federal incorporation resources, forms, and online filing services.",
            link: "https://www.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home"
          },
          {
            title: "Canada Business Network",
            description: "Government services for entrepreneurs and detailed guides for business planning.",
            link: "https://www.canada.ca/en/services/business.html"
          },
          {
            title: "Competition Bureau Canada",
            description: "Resources about Canadian competition law, mergers, and fair business practices.",
            link: "https://www.competitionbureau.gc.ca/eic/site/cb-bc.nsf/eng/home"
          }
        ]}
      />
    </div>
  );
}

export default BusinessLawPage;