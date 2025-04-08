import { useQuery } from '@tanstack/react-query';

export interface Step {
  title: string;
  description: string;
}

export interface ProceduralGuide {
  id: number;
  domainId: number;
  title: string;
  description: string;
  steps: Step[];
  jurisdiction: string;
  language: string;
  estimatedTime?: string;
  prerequisites?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export function useProceduralGuides(domainId?: number) {
  const endpoint = domainId 
    ? `/api/procedural-guides?domainId=${domainId}` 
    : '/api/procedural-guides';

  const { data, isLoading, error } = useQuery<ProceduralGuide[], Error>({
    queryKey: [endpoint],
    enabled: !!domainId,
  });

  return {
    guides: data || [],
    isLoading,
    error,
  };
}

export function useProceduralGuide(guideId: number) {
  const endpoint = `/api/procedural-guides/${guideId}`;
  
  const { data, isLoading, error } = useQuery<ProceduralGuide, Error>({
    queryKey: [endpoint],
    enabled: !!guideId,
  });

  return {
    guide: data,
    isLoading,
    error,
  };
}