import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, HardDrive, RefreshCw, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CacheStats {
  memoryCache: {
    size: number;
    keys: string[];
  };
  databaseCache?: {
    count: number;
    providers: Record<string, number>;
  };
}

export function CacheManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: cacheStats, isLoading: isLoadingStats } = useQuery<CacheStats>({
    queryKey: ['/api/admin/ai-service/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/ai-service/status');
      const data = await response.json();
      return data.cacheStats;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/ai-service/clear-cache');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-service/status'] });
      toast({
        title: "Cache cleared",
        description: "The AI response cache has been successfully cleared",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to clear cache",
        description: error.message || "An error occurred while clearing the cache",
        variant: "destructive",
      });
    }
  });

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear all cached AI responses? This action cannot be undone.")) {
      clearCacheMutation.mutate();
    }
  };

  const totalCacheEntries = (cacheStats?.memoryCache.size || 0) + 
    (cacheStats?.databaseCache?.count || 0);
  
  const formatProviderName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          AI Response Cache Manager
        </CardTitle>
        <CardDescription>
          Monitor and manage cached AI responses to optimize performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            {isLoadingStats ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <HardDrive className="mr-2 h-4 w-4" />
                        Memory Cache
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {cacheStats?.memoryCache.size || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cached responses in memory
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Database className="mr-2 h-4 w-4" />
                        Database Cache
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {cacheStats?.databaseCache?.count || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cached responses in database
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cache Distribution by Provider
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cacheStats?.databaseCache?.providers && 
                     Object.keys(cacheStats.databaseCache.providers).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(cacheStats.databaseCache.providers).map(([provider, count]) => {
                          const percentage = totalCacheEntries > 0 
                            ? Math.round((count / cacheStats.databaseCache!.count) * 100)
                            : 0;
                          
                          return (
                            <div key={provider} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2">
                                    {formatProviderName(provider)}
                                  </Badge>
                                  <span className="text-sm font-medium">{count} entries</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{percentage}%</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        No cached entries found in database
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            {isLoadingStats ? (
              <div className="space-y-3">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Cache Keys</CardTitle>
                  <CardDescription>
                    First 10 cache keys in memory, sorted by most recent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cacheStats?.memoryCache.keys && cacheStats.memoryCache.keys.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {cacheStats.memoryCache.keys.slice(0, 10).map((key, index) => (
                        <div key={index} className="p-2 bg-muted rounded-md">
                          <code className="text-xs break-all">{key.substring(0, 50)}...</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                      No cached keys found in memory
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-service/status'] })}
          disabled={isLoadingStats}
        >
          {isLoadingStats ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Stats
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleClearCache}
          disabled={clearCacheMutation.isPending || totalCacheEntries === 0}
        >
          {clearCacheMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Clear Cache
        </Button>
      </CardFooter>
    </Card>
  );
}