import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiService } from '../../services/api.service';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  environment: string;
  services: {
    database: boolean;
    ai: {
      anthropic: boolean;
      openai: boolean;
      deepseek: boolean;
    };
    streaming: boolean;
  };
  timestamp: string;
}

export const SystemHealth: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<HealthStatus>({
    queryKey: ['/api/health'],
    refetchInterval: 60000, // Auto-refresh every minute
    refetchOnWindowFocus: true,
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: 'ok' | 'degraded' | 'down') => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getServiceStatus = (isActive: boolean) => {
    return isActive ? (
      <span className="flex items-center text-green-500">
        <Check className="w-4 h-4 mr-1" /> Operational
      </span>
    ) : (
      <span className="flex items-center text-red-500">
        <X className="w-4 h-4 mr-1" /> Unavailable
      </span>
    );
  };

  const allAIServicesDown = data?.services.ai 
    ? !data.services.ai.anthropic && !data.services.ai.openai && !data.services.ai.deepseek
    : false;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading System Status...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="w-full border-red-300">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            System Status Unavailable
          </CardTitle>
          <CardDescription>
            Unable to fetch system health information. The monitoring service may be down.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 mt-2 text-sm bg-primary text-white rounded hover:bg-primary/80"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            System Status
            <Badge className={`ml-2 ${getStatusColor(data.status)}`}>
              {data.status.toUpperCase()}
            </Badge>
          </CardTitle>
          <button 
            onClick={() => refetch()}
            className="p-2 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
            title="Refresh status"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
          </button>
        </div>
        <CardDescription>
          Last updated: {formatTimestamp(data.timestamp)} • Version: {data.version} • Environment: {data.environment}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Database</span>
            {getServiceStatus(data.services.database)}
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">AI Services</span>
              {allAIServicesDown ? (
                <span className="flex items-center text-red-500">
                  <X className="w-4 h-4 mr-1" /> All Unavailable
                </span>
              ) : (
                <span className="flex items-center text-green-500">
                  <Check className="w-4 h-4 mr-1" /> Available
                </span>
              )}
            </div>
            
            <div className="pl-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Anthropic Claude</span>
                {getServiceStatus(data.services.ai.anthropic)}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>OpenAI GPT</span>
                {getServiceStatus(data.services.ai.openai)}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>DeepSeek AI</span>
                {getServiceStatus(data.services.ai.deepseek)}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Real-time Streaming</span>
            {getServiceStatus(data.services.streaming)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;