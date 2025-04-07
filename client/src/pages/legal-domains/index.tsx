import { useRoute } from 'wouter';
import { DomainExplorer } from '@/components/legal-domains/DomainExplorer';
import { DomainDetail } from '@/components/legal-domains/DomainDetail';

export default function LegalDomainsPage() {
  const [, params] = useRoute('/legal-domains/:id');
  const domainId = params?.id ? parseInt(params.id) : null;

  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-transparent bg-clip-text">
        Legal Domains
      </h1>

      {domainId ? (
        <DomainDetail domainId={domainId} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <DomainExplorer />
          </div>
          <div className="md:col-span-2 flex items-center justify-center p-12 text-center bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg border border-muted">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select a Legal Domain</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Browse through the comprehensive collection of Canadian legal domains to find information, 
                guides, and resources for your specific legal needs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}