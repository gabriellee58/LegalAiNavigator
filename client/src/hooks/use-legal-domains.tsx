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

// Hook to fetch a specific legal domain by name (exact match)
export function useLegalDomainByName(name: string | null) {
  // Get all domains and find the one with matching name
  const { data: domains = [], isLoading } = useQuery<LegalDomain[]>({
    queryKey: ["/api/legal-domains"],
    enabled: !!name,
  });
  
  // Find domain with matching name (exact case-sensitive match)
  const domain = domains.find(d => d.name === name);
  
  // For debugging
  console.log(`Looking for domain: "${name}"`, 
              `Available domains:`, domains.map(d => d.name), 
              `Found:`, domain);
  
  // Create a domain ID
  const domainId = domain?.id || null;
  
  return {
    domain,
    domainId,
    isLoading
  };
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