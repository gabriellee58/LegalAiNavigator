import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EmploymentLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("employment law");

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
          Employment Law
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
              title="Employment Law"
              description="Employment law regulates the relationship between employers and employees, covering hiring, workplace conditions, compensation, termination, and worker rights. Our templates help with employment contracts, workplace policies, and related documents."
              templateTypes={["employment"]}
              relatedDomains={[
                { name: "Business", path: "/legal-domains/business" },
                { name: "Personal Injury", path: "/legal-domains/personal-injury" },
                { name: "Human Rights", path: "/legal-domains/human-rights" },
                { name: "Tax", path: "/legal-domains/tax" }
              ]}
              resources={[
                {
                  title: "Employment and Social Development Canada",
                  description: "Federal information on employment standards, workplace safety, and labor relations.",
                  link: "https://www.canada.ca/en/employment-social-development.html"
                },
                {
                  title: "Canadian Human Rights Commission",
                  description: "Resources on workplace discrimination, accommodation, and human rights complaints.",
                  link: "https://www.chrc-ccdp.gc.ca/en"
                },
                {
                  title: "Provincial Labour Standards",
                  description: "Information on provincial employment standards, which vary by jurisdiction.",
                  link: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards.html"
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
        title="Employment Law"
        description="Employment law regulates the relationship between employers and employees, covering hiring, workplace conditions, compensation, termination, and worker rights. Our templates help with employment contracts, workplace policies, and related documents."
        templateTypes={["employment"]}
        relatedDomains={[
          { name: "Business", path: "/legal-domains/business" },
          { name: "Personal Injury", path: "/legal-domains/personal-injury" },
          { name: "Human Rights", path: "/legal-domains/human-rights" },
          { name: "Tax", path: "/legal-domains/tax" }
        ]}
        resources={[
          {
            title: "Employment and Social Development Canada",
            description: "Federal information on employment standards, workplace safety, and labor relations.",
            link: "https://www.canada.ca/en/employment-social-development.html"
          },
          {
            title: "Canadian Human Rights Commission",
            description: "Resources on workplace discrimination, accommodation, and human rights complaints.",
            link: "https://www.chrc-ccdp.gc.ca/en"
          },
          {
            title: "Provincial Labour Standards",
            description: "Information on provincial employment standards, which vary by jurisdiction.",
            link: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards.html"
          }
        ]}
      />
    </div>
  );
}

export default EmploymentLawPage;