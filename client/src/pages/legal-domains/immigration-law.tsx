import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProceduralGuides from "@/components/legal-domains/ProceduralGuides";

function ImmigrationLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("immigration law");

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
              title="Immigration Law"
              description="Immigration law governs who can enter and remain in Canada. This includes permanent residence, temporary visas, work permits, refugee claims, and citizenship applications."
              templateTypes={["immigration", "visa", "citizenship"]}
              relatedDomains={[
                { name: "Family Law", path: "/legal-domains/family-law" },
                { name: "Employment Law", path: "/legal-domains/employment-law" },
                { name: "Administrative Law", path: "/legal-domains/administrative" },
                { name: "Human Rights", path: "/legal-domains/human-rights" }
              ]}
              resources={[
                {
                  title: "Immigration, Refugees and Citizenship Canada",
                  description: "Official government resource for immigration programs, applications and requirements.",
                  link: "https://www.canada.ca/en/immigration-refugees-citizenship.html"
                },
                {
                  title: "Express Entry System",
                  description: "Information on Canada's flagship immigration system for skilled workers.",
                  link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html"
                },
                {
                  title: "Immigration and Refugee Board of Canada",
                  description: "Canada's largest independent administrative tribunal, responsible for making decisions on immigration and refugee matters.",
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
        description="Immigration law governs who can enter and remain in Canada. This includes permanent residence, temporary visas, work permits, refugee claims, and citizenship applications."
        templateTypes={["immigration", "visa", "citizenship"]}
        relatedDomains={[
          { name: "Family Law", path: "/legal-domains/family-law" },
          { name: "Employment Law", path: "/legal-domains/employment-law" },
          { name: "Administrative Law", path: "/legal-domains/administrative" },
          { name: "Human Rights", path: "/legal-domains/human-rights" }
        ]}
        resources={[
          {
            title: "Immigration, Refugees and Citizenship Canada",
            description: "Official government resource for immigration programs, applications and requirements.",
            link: "https://www.canada.ca/en/immigration-refugees-citizenship.html"
          },
          {
            title: "Express Entry System",
            description: "Information on Canada's flagship immigration system for skilled workers.",
            link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html"
          },
          {
            title: "Immigration and Refugee Board of Canada",
            description: "Canada's largest independent administrative tribunal, responsible for making decisions on immigration and refugee matters.",
            link: "https://irb-cisr.gc.ca/en/Pages/index.aspx"
          }
        ]}
      />
    </div>
  );
}

export default ImmigrationLawPage;