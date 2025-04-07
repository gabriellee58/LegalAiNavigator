import { useQuery, useMutation } from "@tanstack/react-query";
import { LegalDomain } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Hook to fetch all legal domains
export function useLegalDomains() {
  return useQuery<LegalDomain[]>({
    queryKey: ["/api/legal-domains"],
  });
}

// Hook to fetch a specific legal domain by ID
export function useLegalDomain(id: number | null) {
  return useQuery<LegalDomain>({
    queryKey: id ? [`/api/legal-domains/${id}`] : [""],
    enabled: !!id,
  });
}

// Hook to fetch a specific legal domain by name (slug)
export function useLegalDomainByName(name: string | null) {
  // Get all domains and find the one with matching name
  const { data: domains = [], isLoading } = useQuery<LegalDomain[]>({
    queryKey: ["/api/legal-domains"],
    enabled: !!name,
  });
  
  // Convert input name to normalized form for comparison
  const normalizedName = name ? normalizeDomainName(name) : '';
  
  // Find domain with matching name
  const domain = domains.find(d => normalizeDomainName(d.name) === normalizedName);
  
  // Create a domain ID
  const domainId = domain?.id || null;
  
  return {
    domain,
    domainId,
    isLoading
  };
}

// Helper function to normalize domain names for comparison
function normalizeDomainName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')  // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
}

// Hook to fetch subdomains for a specific domain
export function useLegalSubdomains(parentId: number | null) {
  return useQuery<LegalDomain[]>({
    queryKey: parentId ? [`/api/legal-domains/${parentId}/subdomains`] : [""],
    enabled: !!parentId,
  });
}

// Hook to fetch domain knowledge
export function useDomainKnowledge(domainId: number | null, language?: string) {
  const langParam = language ? `?language=${language}` : '';
  
  return useQuery({
    queryKey: domainId ? [`/api/legal-domains/${domainId}/knowledge${langParam}`] : [""],
    enabled: !!domainId,
  });
}

// Hook to fetch procedural guides
export function useProceduralGuides(domainId: number | null, language?: string) {
  const langParam = language ? `?language=${language}` : '';
  
  return useQuery({
    queryKey: domainId ? [`/api/legal-domains/${domainId}/guides${langParam}`] : [""],
    enabled: !!domainId,
  });
}

// Hook to search domain knowledge
export function useSearchDomainKnowledge(query: string, domainId?: number, language?: string) {
  let searchParams = `?q=${encodeURIComponent(query)}`;
  if (domainId) searchParams += `&domainId=${domainId}`;
  if (language) searchParams += `&language=${language}`;
  
  return useQuery({
    queryKey: query ? [`/api/knowledge/search${searchParams}`] : [""],
    enabled: query.length >= 3, // Only search if query is at least 3 characters
  });
}