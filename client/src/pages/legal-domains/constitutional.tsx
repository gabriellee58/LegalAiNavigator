import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ConstitutionalLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("constitutional law");

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
          Constitutional Law
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
      title="Constitutional Law"
      description="Constitutional law deals with the interpretation and application of the Canadian Constitution, including the Charter of Rights and Freedoms. Our templates help with constitutional challenges, rights claims, and documentation related to constitutional issues in Canada."
      templateTypes={["constitutional", "charter"]}
      relatedDomains={[
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Criminal", path: "/legal-domains/criminal" }
      ]}
      resources={[
        {
          title: "Department of Justice - Constitutional Law",
          description: "Federal resources on constitutional principles, Charter rights, and constitutional litigation.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/charter-charte/index.html"
        },
        {
          title: "Supreme Court of Canada",
          description: "Information on constitutional cases, precedents, and the court's role in constitutional interpretation.",
          link: "https://www.scc-csc.ca/home-accueil/index-eng.aspx"
        },
        {
          title: "Charter of Rights and Freedoms",
          description: "Full text and explanatory materials on Canada's constitutional rights and freedoms.",
          link: "https://laws-lois.justice.gc.ca/eng/const/page-12.html"
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
      title="Constitutional Law"
      description="Constitutional law deals with the interpretation and application of the Canadian Constitution, including the Charter of Rights and Freedoms. Our templates help with constitutional challenges, rights claims, and documentation related to constitutional issues in Canada."
      templateTypes={["constitutional", "charter"]}
      relatedDomains={[
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Indigenous Law", path: "/legal-domains/indigenous-law" },
        { name: "Criminal", path: "/legal-domains/criminal" }
      ]}
      resources={[
        {
          title: "Department of Justice - Constitutional Law",
          description: "Federal resources on constitutional principles, Charter rights, and constitutional litigation.",
          link: "https://www.justice.gc.ca/eng/csj-sjc/charter-charte/index.html"
        },
        {
          title: "Supreme Court of Canada",
          description: "Information on constitutional cases, precedents, and the court's role in constitutional interpretation.",
          link: "https://www.scc-csc.ca/home-accueil/index-eng.aspx"
        },
        {
          title: "Charter of Rights and Freedoms",
          description: "Full text and explanatory materials on Canada's constitutional rights and freedoms.",
          link: "https://laws-lois.justice.gc.ca/eng/const/page-12.html"
        }
      ]}
    />
  
    </div>
  );
}

export default ConstitutionalLawPage;