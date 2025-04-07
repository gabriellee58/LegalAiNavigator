/**
 * This is a temporary helper script to generate the standardized domain page templates
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root directory of the domain pages
const domainsDir = join(__dirname, 'client/src/pages/legal-domains');

// Get list of domain files
const domainFiles = readdirSync(domainsDir)
  .filter(file => file.endsWith('.tsx'))
  .filter(file => !['index.tsx', 'template.tsx', 'domain-page.tsx', 'business.tsx', 'tax.tsx', 'employment.tsx', 'family-law.tsx', 'immigration.tsx'].includes(file));

// Process each domain file
domainFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  
  // Read the file content
  const filePath = join(domainsDir, file);
  const content = readFileSync(filePath, 'utf8');
  
  // Extract the domain title from the file
  let titleMatch = content.match(/title="([^"]+)"/);
  if (!titleMatch) {
    console.log(`Could not extract title from ${file}, skipping...`);
    return;
  }
  
  const domainTitle = titleMatch[1];
  
  // Convert file name to domain name for the API (e.g., 'real-estate.tsx' to 'real estate law')
  const domainNameForApi = file
    .replace('.tsx', '')
    .replace(/-/g, ' ');
  
  // Original content to replace
  const functionStart = content.match(/function (\w+)\(\) \{/);
  if (!functionStart) {
    console.log(`Could not find function declaration in ${file}, skipping...`);
    return;
  }
  
  const functionName = functionStart[1];
  
  // Generate the new content
  const updatedContent = `import LegalDomainPage from "./template";
import { useLegalDomainByName } from "@/hooks/use-legal-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { DomainDetail } from "@/components/legal-domains/DomainDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ${functionName}() {
  // Fetch domain data from the database
  const { domain, domainId, isLoading } = useLegalDomainByName("${domainNameForApi} law");

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
          ${domainTitle}
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
            ${content.split('return (')[1].split(');')[0]}
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
      
      ${content.split('return (')[1].split(');')[0]}
    </div>
  );
}

export default ${functionName};`;

  // Output the updated content
  console.log(`Generated template for ${file}`);
  
  // Uncomment to write the files directly
  // writeFileSync(filePath, updatedContent, 'utf8');
  // console.log(`Updated ${file}`);
  
  // Write to a new file for review
  writeFileSync(join(__dirname, `updated-${file}`), updatedContent, 'utf8');
});

console.log('Done! Check the updated-*.tsx files for the generated templates.');