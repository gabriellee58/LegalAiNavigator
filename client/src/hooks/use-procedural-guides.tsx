import { useQuery } from "@tanstack/react-query";
import { ProceduralGuide } from "@shared/schema";

export function useProceduralGuides(domainId: number) {
  return useQuery<ProceduralGuide[]>({
    queryKey: ["/api/legal-domains", domainId, "guides"],
    enabled: !!domainId,
  });
}

export function useProceduralGuide(guideId: number) {
  return useQuery<ProceduralGuide>({
    queryKey: ["/api/procedural-guides", guideId],
    enabled: !!guideId,
  });
}