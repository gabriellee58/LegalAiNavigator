import { useRoute } from 'wouter';
import { DomainDetail } from '@/components/legal-domains/DomainDetail';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function DomainPage() {
  const [match, params] = useRoute('/legal-domains/:id');
  const domainId = match && params?.id ? parseInt(params.id) : null;

  if (!domainId) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Domain ID not found. Please select a valid legal domain.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-transparent bg-clip-text">
        Legal Domain Details
      </h1>
      <DomainDetail domainId={domainId} />
    </div>
  );
}