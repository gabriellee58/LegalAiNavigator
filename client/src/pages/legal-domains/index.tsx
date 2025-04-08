import { useLegalDomains } from '@/hooks/use-legal-domains';
import { DomainExplorer } from '@/components/legal-domains/DomainExplorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function LegalDomainsPage() {
  const { data: domains = [], isLoading } = useLegalDomains();
  
  // Get top-level domains (those without parentId)
  const topLevelDomains = domains.filter(domain => !domain.parentId);
  
  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-transparent bg-clip-text">
        Legal Domains
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Domain Explorer</CardTitle>
              <CardDescription>Browse the hierarchy of legal domains</CardDescription>
            </CardHeader>
            <CardContent>
              <DomainExplorer />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Featured Legal Domains</CardTitle>
              <CardDescription>
                Explore specialized knowledge and guides for Canadian legal practice areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="border border-muted">
                      <CardHeader className="p-4 pb-2">
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Display the featured domains with specific named routes */}
                  <FeaturedDomainCard 
                    title="Family Law" 
                    description="Deals with marriage, divorce, child custody, adoption, and other family-related matters."
                    path="/legal-domains/family-law"
                    tags={["Divorce", "Child Custody", "Support"]}
                  />
                  <FeaturedDomainCard 
                    title="Real Estate Law" 
                    description="Covers property transactions, land use, mortgages, title issues, and landlord-tenant relations."
                    path="/legal-domains/real-estate"
                    tags={["Property", "Leases", "Transactions"]}
                  />
                  <FeaturedDomainCard 
                    title="Business Law" 
                    description="Governs commercial activities, corporate formation, operations, and transactions."
                    path="/legal-domains/business"
                    tags={["Corporations", "Contracts", "Compliance"]}
                  />
                  <FeaturedDomainCard 
                    title="Employment Law" 
                    description="Covers workplace rights, employer obligations, and labor regulations."
                    path="/legal-domains/employment"
                    tags={["Labor", "Benefits", "Workplace"]}
                  />
                  <FeaturedDomainCard 
                    title="Immigration Law" 
                    description="Deals with immigration, citizenship, visas, refugee status, and border control."
                    path="/legal-domains/immigration"
                    tags={["Visas", "Citizenship", "Immigration"]}
                  />
                  <FeaturedDomainCard 
                    title="Personal Injury" 
                    description="Covers negligence claims, civil wrongs, physical or psychological injuries, and compensation."
                    path="/legal-domains/personal-injury"
                    tags={["Accidents", "Compensation", "Liability"]}
                  />
                  <FeaturedDomainCard 
                    title="Criminal Law" 
                    description="Deals with offenses against the public, prosecuted by the state. Includes criminal procedures and rights."
                    path="/legal-domains/criminal"
                    tags={["Defense", "Offenses", "Procedures"]}
                  />
                  <FeaturedDomainCard 
                    title="Civil Litigation" 
                    description="Legal process for resolving disputes between individuals, businesses, or entities seeking compensation."
                    path="/legal-domains/civil-litigation"
                    tags={["Disputes", "Lawsuits", "Resolution"]}
                  />
                  <FeaturedDomainCard 
                    title="Indigenous Law" 
                    description="Legal matters relating to Indigenous peoples, including treaty rights, land claims, and self-governance."
                    path="/legal-domains/indigenous-law"
                    tags={["Aboriginal", "Treaties", "Rights"]}
                  />
                  <FeaturedDomainCard 
                    title="Environmental Law" 
                    description="Regulations governing human impact on the natural environment, resources, and sustainability."
                    path="/legal-domains/environmental"
                    tags={["Conservation", "Compliance", "Resources"]}
                  />
                  <FeaturedDomainCard 
                    title="Consumer Rights" 
                    description="Laws protecting consumers in transactions with businesses, product safety, and fair trade."
                    path="/legal-domains/consumer-rights"
                    tags={["Protection", "Complaints", "Safety"]}
                  />
                  <FeaturedDomainCard 
                    title="Estate Planning" 
                    description="Preparation for the management and transfer of a person's assets after death or incapacitation."
                    path="/legal-domains/estate-planning"
                    tags={["Wills", "Trusts", "Succession"]}
                  />
                </div>
              )}
              
              {!isLoading && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Other Legal Domains:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/legal-domains/criminal">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Criminal Law</Badge>
                    </Link>
                    <Link href="/legal-domains/tax">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Tax Law</Badge>
                    </Link>
                    <Link href="/legal-domains/intellectual-property">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Intellectual Property</Badge>
                    </Link>
                    <Link href="/legal-domains/estate-planning">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Estate Planning</Badge>
                    </Link>
                    <Link href="/legal-domains/human-rights">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Human Rights</Badge>
                    </Link>
                    <Link href="/legal-domains/indigenous-law">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Indigenous Law</Badge>
                    </Link>
                    <Link href="/legal-domains/environmental">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Environmental Law</Badge>
                    </Link>
                    <Link href="/legal-domains/civil-litigation">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Civil Litigation</Badge>
                    </Link>
                    <Link href="/legal-domains/consumer-rights">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">Consumer Rights</Badge>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component for featured domain cards
function FeaturedDomainCard({ 
  title, 
  description, 
  path, 
  tags = [] 
}: { 
  title: string; 
  description: string; 
  path: string; 
  tags?: string[] 
}) {
  return (
    <Link href={path}>
      <Card className="h-full border border-muted hover:border-primary/20 hover:shadow-md transition-all cursor-pointer">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}