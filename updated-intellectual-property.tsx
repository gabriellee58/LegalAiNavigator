import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function IntellectualPropertyPage() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("intellectual property law");

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
          Intellectual Property
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
      title="Intellectual Property"
      description="Intellectual property law protects creations of the mind, including patents, trademarks, copyrights, and trade secrets. Our templates help with IP registration, protection, and licensing under Canadian intellectual property regulations."
      templateTypes={["intellectual-property", "copyright", "trademark"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Entertainment", path: "/legal-domains/entertainment" },
        { name: "Technology", path: "/legal-domains/technology" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Intellectual Property Office",
          description: "Official government resource for registering and protecting patents, trademarks, and copyrights in Canada.",
          link: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home"
        },
        {
          title: "Copyright Board of Canada",
          description: "Information on copyright law, royalties, and licensing requirements for creative works.",
          link: "https://cb-cda.gc.ca/en"
        },
        {
          title: "IP Law Information",
          description: "Educational resources on intellectual property protection, infringement, and enforcement in Canada.",
          link: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/h_wr04234.html"
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
      title="Intellectual Property"
      description="Intellectual property law protects creations of the mind, including patents, trademarks, copyrights, and trade secrets. Our templates help with IP registration, protection, and licensing under Canadian intellectual property regulations."
      templateTypes={["intellectual-property", "copyright", "trademark"]}
      relatedDomains={[
        { name: "Business", path: "/legal-domains/business" },
        { name: "Entertainment", path: "/legal-domains/entertainment" },
        { name: "Technology", path: "/legal-domains/technology" },
        { name: "Civil Litigation", path: "/legal-domains/civil-litigation" }
      ]}
      resources={[
        {
          title: "Canadian Intellectual Property Office",
          description: "Official government resource for registering and protecting patents, trademarks, and copyrights in Canada.",
          link: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home"
        },
        {
          title: "Copyright Board of Canada",
          description: "Information on copyright law, royalties, and licensing requirements for creative works.",
          link: "https://cb-cda.gc.ca/en"
        },
        {
          title: "IP Law Information",
          description: "Educational resources on intellectual property protection, infringement, and enforcement in Canada.",
          link: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/h_wr04234.html"
        }
      ]}
    />
  
    </div>
  );
}

export default IntellectualPropertyPage;