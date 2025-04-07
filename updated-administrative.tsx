import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AdministrativeLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("administrative law");

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
          Administrative Law
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
      title="Administrative Law"
      description="Administrative law governs the activities of government agencies, boards, and tribunals. Our templates help with administrative proceedings, appeals, and documentation for interactions with Canadian regulatory bodies and government agencies."
      templateTypes={["administrative", "regulatory"]}
      relatedDomains={[
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Immigration", path: "/legal-domains/immigration" },
        { name: "Environmental", path: "/legal-domains/environmental" }
      ]}
      resources={[
        {
          title: "Administrative Tribunals in Canada",
          description: "Information on federal and provincial administrative tribunals, their procedures, and jurisdiction.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/just/08.html"
        },
        {
          title: "Judicial Review Process",
          description: "Resources on challenging administrative decisions through judicial review in Canadian courts.",
          link: "https://www.canlii.org/en/commentary/judicial-review/"
        },
        {
          title: "Administrative Law Resources",
          description: "Educational materials on administrative law principles, procedures, and practices in Canada.",
          link: "https://www.canada.ca/en/services/benefits/disability.html"
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
      title="Administrative Law"
      description="Administrative law governs the activities of government agencies, boards, and tribunals. Our templates help with administrative proceedings, appeals, and documentation for interactions with Canadian regulatory bodies and government agencies."
      templateTypes={["administrative", "regulatory"]}
      relatedDomains={[
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Employment", path: "/legal-domains/employment" },
        { name: "Immigration", path: "/legal-domains/immigration" },
        { name: "Environmental", path: "/legal-domains/environmental" }
      ]}
      resources={[
        {
          title: "Administrative Tribunals in Canada",
          description: "Information on federal and provincial administrative tribunals, their procedures, and jurisdiction.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/just/08.html"
        },
        {
          title: "Judicial Review Process",
          description: "Resources on challenging administrative decisions through judicial review in Canadian courts.",
          link: "https://www.canlii.org/en/commentary/judicial-review/"
        },
        {
          title: "Administrative Law Resources",
          description: "Educational materials on administrative law principles, procedures, and practices in Canada.",
          link: "https://www.canada.ca/en/services/benefits/disability.html"
        }
      ]}
    />
  
    </div>
  );
}

export default AdministrativeLawPage;