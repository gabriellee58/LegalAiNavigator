import { t } from "@/lib/i18n";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { 
  Clock, CalendarDays, UserPlus, MessageSquare, FileText, CheckCircle, ShieldAlert, 
  RotateCw, Scale, FileUp, ArrowUpDown, MoreHorizontal, History, Loader2, AlertCircle,
  CircleDot
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActivityItem {
  id: number;
  disputeId: number;
  userId: number | null;
  activityType: string;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  userDetails?: {
    name?: string;
    role?: string;
  }
}

interface DisputeActivityTimelineProps {
  disputeId: number;
  limit?: number;
  filter?: string;
}

export default function DisputeActivityTimeline({ 
  disputeId, 
  limit = 20,
  filter
}: DisputeActivityTimelineProps) {
  const [timelineView, setTimelineView] = useState<'chronological' | 'grouped'>('chronological');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  
  // Fetch activity timeline
  const {
    data: activities = [] as ActivityItem[],
    isLoading,
    error
  } = useQuery<ActivityItem[]>({
    queryKey: ['/api/disputes', disputeId, 'activities', { limit, filter }],
    enabled: !!disputeId,
  });

  // Helper function to format date with relative time
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return `Today, ${format(date, 'p')}`;
      } else if (isYesterday(date)) {
        return `Yesterday, ${format(date, 'p')}`;
      } else if (isThisWeek(date)) {
        return format(date, 'EEEE, p');
      } else if (isThisMonth(date)) {
        return format(date, 'MMMM d, p');
      } else {
        return format(date, 'PPP, p');
      }
    } catch (error) {
      return dateString || "Unknown date";
    }
  };
  
  // Get icon for activity type
  const getActivityIcon = (activityType: string | undefined) => {
    // Default icon if activityType is undefined
    if (!activityType) {
      return <CircleDot className="h-5 w-5" />;
    }
    
    switch (activityType.toLowerCase()) {
      case 'party_added':
        return <UserPlus className="h-5 w-5" />;
      case 'message_sent':
        return <MessageSquare className="h-5 w-5" />;
      case 'document_uploaded':
        return <FileUp className="h-5 w-5" />;
      case 'document_shared':
        return <FileText className="h-5 w-5" />;
      case 'session_started':
        return <Clock className="h-5 w-5" />;
      case 'session_completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'status_changed':
        return <ArrowUpDown className="h-5 w-5" />;
      case 'proposal_created':
        return <Scale className="h-5 w-5" />;
      case 'proposal_accepted':
        return <CheckCircle className="h-5 w-5" />;
      case 'proposal_rejected':
        return <ShieldAlert className="h-5 w-5" />;
      case 'dispute_resolved':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <RotateCw className="h-5 w-5" />;
    }
  };
  
  // Get color for activity type
  const getActivityColor = (activityType: string | undefined): string => {
    // Default color if activityType is undefined
    if (!activityType) {
      return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200";
    }
    
    switch (activityType.toLowerCase()) {
      case 'party_added':
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200";
      case 'message_sent':
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200";
      case 'document_uploaded':
      case 'document_shared':
        return "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-200";
      case 'session_started':
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200";
      case 'session_completed':
        return "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-200";
      case 'proposal_created':
        return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200";
      case 'proposal_accepted':
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200";
      case 'proposal_rejected':
        return "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-200";
      case 'status_changed':
        return "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-200";
      case 'dispute_resolved':
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  // Activity label formatter
  const getActivityLabel = (activity: ActivityItem): string => {
    const userName = activity.userDetails?.name || t("someone");
    const activityType = activity.activityType?.toLowerCase() || "";
    
    switch (activityType) {
      case 'party_added':
        return t("party_added_activity", { name: userName });
      case 'message_sent':
        return t("message_sent_activity", { name: userName });
      case 'document_uploaded':
        return t("document_uploaded_activity", { name: userName });
      case 'document_shared':
        return t("document_shared_activity", { name: userName });
      case 'session_started':
        return t("session_started_activity");
      case 'session_completed':
        return t("session_completed_activity");
      case 'status_changed':
        const newStatus = activity.metadata?.newStatus || "unknown";
        return t("status_changed_activity", { status: t(newStatus) || newStatus });
      case 'proposal_created':
        return t("proposal_created_activity", { name: userName });
      case 'proposal_accepted':
        return t("proposal_accepted_activity", { name: userName });
      case 'proposal_rejected':
        return t("proposal_rejected_activity", { name: userName });
      case 'dispute_resolved':
        return t("dispute_resolved_activity");
      default:
        return activity.description || t("unknown_activity");
    }
  };
  
  // Group activities by date
  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    return activities.reduce<Record<string, ActivityItem[]>>((groups, activity) => {
      try {
        if (!activity.createdAt) return groups;
        
        const date = parseISO(activity.createdAt);
        let groupKey: string;
        
        if (isToday(date)) {
          groupKey = 'Today';
        } else if (isYesterday(date)) {
          groupKey = 'Yesterday';
        } else if (isThisWeek(date)) {
          groupKey = 'This Week';
        } else if (isThisMonth(date)) {
          groupKey = 'This Month';
        } else {
          groupKey = 'Older';
        }
        
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        
        groups[groupKey].push(activity);
        return groups;
      } catch (error) {
        console.error('Error grouping activities:', error);
        return groups;
      }
    }, {});
  };
  
  // Helper to sort grouped activities by date (newest first)
  const sortGroupedActivities = (a: ActivityItem, b: ActivityItem) => {
    try {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    } catch (error) {
      return 0;
    }
  };
  
  // Group activities by date
  const dateGroupedActivities = groupActivitiesByDate(activities);
  
  // Handle group expansion
  const toggleGroup = (groupKey: string) => {
    setExpandedGroup(expandedGroup === groupKey ? null : groupKey);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("error")}</AlertTitle>
        <AlertDescription>
          {t("activities_fetch_error")}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Render empty state
  if (activities.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md border-dashed">
        <History className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-1">{t("no_activities")}</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          {t("no_activities_description")}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("activity_timeline")}</h3>
        <Tabs value={timelineView} onValueChange={(v) => setTimelineView(v as 'chronological' | 'grouped')}>
          <TabsList className="grid grid-cols-2 h-8">
            <TabsTrigger value="chronological" className="px-3 text-xs">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {t("chronological")}
            </TabsTrigger>
            <TabsTrigger value="grouped" className="px-3 text-xs">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              {t("grouped")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="chronological" className="m-0 space-y-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="flex-none mr-4 mt-1">
                <div className={`p-2 rounded-full ${getActivityColor(activity.activityType)}`}>
                  {getActivityIcon(activity.activityType)}
                </div>
              </div>
              
              <div className="flex-1 space-y-1 pb-4 border-l-2 border-muted pl-6 -ml-3 relative">
                <div className="absolute -left-[5px] top-0 h-3 w-3 rounded-full border-2 border-background bg-border"></div>
                <div className="font-medium">{getActivityLabel(activity)}</div>
                <div className="text-sm text-muted-foreground">{activity.description}</div>
                <div className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</div>
                
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="text-xs bg-muted p-2 rounded-md mt-2">
                    <code className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {activities.length > 0 && activities.length >= limit && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              {t("load_more_activities")}
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="grouped" className="m-0 space-y-6">
        {Object.entries(dateGroupedActivities).map(([dateGroup, dateActivities]) => (
          <Card key={dateGroup} className="overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">{t(dateGroup.toLowerCase()) || dateGroup}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleGroup(dateGroup)}
                  className="h-8 px-2"
                >
                  {expandedGroup === dateGroup ? t("collapse") : t("expand")}
                </Button>
              </div>
              <CardDescription>
                {dateActivities.length} {dateActivities.length === 1 ? t("activity") : t("activities")}
              </CardDescription>
            </CardHeader>
            
            {(expandedGroup === dateGroup || !expandedGroup) && (
              <CardContent className="px-4 divide-y">
                {[...dateActivities].sort(sortGroupedActivities).map((activity) => (
                  <div key={activity.id} className="py-3 flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${getActivityColor(activity.activityType)}`}>
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{getActivityLabel(activity)}</div>
                          <div className="text-sm text-muted-foreground">{activity.description}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(activity.createdAt), 'p')}
                        </div>
                      </div>
                      
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="text-xs bg-muted p-2 rounded-md mt-2">
                          <code className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </TabsContent>
    </div>
  );
}