import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ImmigrationLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("Immigration Law");

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
          Immigration Law
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
              title="Immigration Law"
              description="Immigration law covers entry, residence, citizenship, and refugee protection in Canada. Our templates help with visa applications, permanent residence, citizenship, and related immigration documents for individuals and sponsors."
              templateTypes={["immigration"]}
              relatedDomains={[
                { name: "Family Law", path: "/legal-domains/family-law" },
                { name: "Employment", path: "/legal-domains/employment" },
                { name: "Human Rights", path: "/legal-domains/human-rights" },
                { name: "Administrative", path: "/legal-domains/administrative" }
              ]}
              resources={[
                {
                  title: "Immigration, Refugees and Citizenship Canada",
                  description: "Official government information on immigration programs, application procedures, and requirements.",
                  link: "https://www.canada.ca/en/immigration-refugees-citizenship.html"
                },
                {
                  title: "Canada Immigration and Visa Information",
                  description: "Resources on various immigration pathways, including Express Entry, Provincial Nominee Programs, and family sponsorship.",
                  link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html"
                },
                {
                  title: "Immigration and Refugee Board of Canada",
                  description: "Information on refugee claims, appeals, and immigration hearings in Canada.",
                  link: "https://irb-cisr.gc.ca/en/Pages/index.aspx"
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
        title="Immigration Law"
        description="Immigration law covers entry, residence, citizenship, and refugee protection in Canada. Our templates help with visa applications, permanent residence, citizenship, and related immigration documents for individuals and sponsors."
        templateTypes={["immigration"]}
        relatedDomains={[
          { name: "Family Law", path: "/legal-domains/family-law" },
          { name: "Employment", path: "/legal-domains/employment" },
          { name: "Human Rights", path: "/legal-domains/human-rights" },
          { name: "Administrative", path: "/legal-domains/administrative" }
        ]}
        resources={[
          {
            title: "Immigration, Refugees and Citizenship Canada",
            description: "Official government information on immigration programs, application procedures, and requirements.",
            link: "https://www.canada.ca/en/immigration-refugees-citizenship.html"
          },
          {
            title: "Canada Immigration and Visa Information",
            description: "Resources on various immigration pathways, including Express Entry, Provincial Nominee Programs, and family sponsorship.",
            link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html"
          },
          {
            title: "Immigration and Refugee Board of Canada",
            description: "Information on refugee claims, appeals, and immigration hearings in Canada.",
            link: "https://irb-cisr.gc.ca/en/Pages/index.aspx"
          }
        ]}
      />
    </div>
  );
}

export default ImmigrationLawPage;