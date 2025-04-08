import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TaxLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("Tax Law");

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
          Tax Law
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
              title="Tax Law"
              description="Tax law encompasses the rules and regulations governing taxation of individuals and businesses. Our templates help with tax planning, disputes with tax authorities, and documentation related to Canadian federal and provincial tax matters."
              templateTypes={["tax"]}
              relatedDomains={[
                { name: "Business", path: "/legal-domains/business" },
                { name: "Estate Planning", path: "/legal-domains/estate-planning" },
                { name: "Real Estate", path: "/legal-domains/real-estate" },
                { name: "Administrative", path: "/legal-domains/administrative" }
              ]}
              resources={[
                {
                  title: "Canada Revenue Agency",
                  description: "Official tax resources, forms, guides, and procedures for individual and business tax matters.",
                  link: "https://www.canada.ca/en/revenue-agency.html"
                },
                {
                  title: "Tax Court of Canada",
                  description: "Information on tax disputes, appeals procedures, and resolving disagreements with tax authorities.",
                  link: "https://www.tcc-cci.gc.ca/en/home.html"
                },
                {
                  title: "Tax Planning Resources",
                  description: "Educational materials on tax planning strategies, deductions, and credits available in Canada.",
                  link: "https://www.canada.ca/en/services/taxes/income-tax.html"
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
        title="Tax Law"
        description="Tax law encompasses the rules and regulations governing taxation of individuals and businesses. Our templates help with tax planning, disputes with tax authorities, and documentation related to Canadian federal and provincial tax matters."
        templateTypes={["tax"]}
        relatedDomains={[
          { name: "Business", path: "/legal-domains/business" },
          { name: "Estate Planning", path: "/legal-domains/estate-planning" },
          { name: "Real Estate", path: "/legal-domains/real-estate" },
          { name: "Administrative", path: "/legal-domains/administrative" }
        ]}
        resources={[
          {
            title: "Canada Revenue Agency",
            description: "Official tax resources, forms, guides, and procedures for individual and business tax matters.",
            link: "https://www.canada.ca/en/revenue-agency.html"
          },
          {
            title: "Tax Court of Canada",
            description: "Information on tax disputes, appeals procedures, and resolving disagreements with tax authorities.",
            link: "https://www.tcc-cci.gc.ca/en/home.html"
          },
          {
            title: "Tax Planning Resources",
            description: "Educational materials on tax planning strategies, deductions, and credits available in Canada.",
            link: "https://www.canada.ca/en/services/taxes/income-tax.html"
          }
        ]}
      />
    </div>
  );
}

export default TaxLawPage;