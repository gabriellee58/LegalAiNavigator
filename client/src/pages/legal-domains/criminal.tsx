import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CriminalLawPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("Criminal Law");

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
          Criminal Law
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
      title="Criminal Law"
      description="Criminal law involves offenses against the public, prosecuted by the state. Our templates help with understanding criminal procedures, rights of the accused, and documentation relevant to the Canadian criminal justice system."
      templateTypes={["criminal"]}
      relatedDomains={[
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Youth Justice", path: "/legal-domains/youth-justice" }
      ]}
      resources={[
        {
          title: "Department of Justice - Criminal Justice",
          description: "Official information on the Canadian criminal justice system, procedures, and recent reforms.",
          link: "https://www.justice.gc.ca/eng/cj-jp/index.html"
        },
        {
          title: "Legal Aid Programs",
          description: "Provincial legal aid services available to those facing criminal charges who cannot afford representation.",
          link: "https://www.justice.gc.ca/eng/fund-fina/gov-gouv/aid-aide.html"
        },
        {
          title: "Criminal Code of Canada",
          description: "Full text of Canada's criminal laws, offenses, and procedures with annotations.",
          link: "https://laws-lois.justice.gc.ca/eng/acts/c-46/"
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
      title="Criminal Law"
      description="Criminal law involves offenses against the public, prosecuted by the state. Our templates help with understanding criminal procedures, rights of the accused, and documentation relevant to the Canadian criminal justice system."
      templateTypes={["criminal"]}
      relatedDomains={[
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" },
        { name: "Human Rights", path: "/legal-domains/human-rights" },
        { name: "Administrative", path: "/legal-domains/administrative" },
        { name: "Youth Justice", path: "/legal-domains/youth-justice" }
      ]}
      resources={[
        {
          title: "Department of Justice - Criminal Justice",
          description: "Official information on the Canadian criminal justice system, procedures, and recent reforms.",
          link: "https://www.justice.gc.ca/eng/cj-jp/index.html"
        },
        {
          title: "Legal Aid Programs",
          description: "Provincial legal aid services available to those facing criminal charges who cannot afford representation.",
          link: "https://www.justice.gc.ca/eng/fund-fina/gov-gouv/aid-aide.html"
        },
        {
          title: "Criminal Code of Canada",
          description: "Full text of Canada's criminal laws, offenses, and procedures with annotations.",
          link: "https://laws-lois.justice.gc.ca/eng/acts/c-46/"
        }
      ]}
    />
  
    </div>
  );
}

export default CriminalLawPage;