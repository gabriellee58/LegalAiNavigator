import { t } from "@/lib/i18n";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Calendar, Download, FileText, Loader2, MessageSquare, User2, UserPlus, Handshake, AlertTriangle, CheckCircle, XCircle, Scale, Upload, Users, Search, Filter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DisputeActivity {
  id: number;
  disputeId: number;
  userId: number;
  activityType: string;
  description: string;
  metadata: any;
  createdAt: string;
  userName?: string;
}

interface DisputeActivityTimelineProps {
  disputeId: number;
}

export default function DisputeActivityTimeline({ disputeId }: DisputeActivityTimelineProps) {
  const [activityFilters, setActivityFilters] = useState<string[]>([]);
  
  // Fetch activities from the API
  const { 
    data: activities = [], 
    isLoading: isActivitiesLoading,
    error: activitiesError
  } = useQuery({
    queryKey: ['/api/disputes', disputeId, 'activities'],
    enabled: !!disputeId,
  });

  // Activity type definitions with corresponding icons and colors
  const activityTypes: Record<string, { icon: React.ReactNode, color: string, label: string }> = {
    created: { 
      icon: <FileText className="h-4 w-4" />, 
      color: "text-blue-500", 
      label: t("activity_created") 
    },
    updated: { 
      icon: <FileText className="h-4 w-4" />, 
      color: "text-amber-500", 
      label: t("activity_updated") 
    },
    document_added: { 
      icon: <Upload className="h-4 w-4" />, 
      color: "text-indigo-500", 
      label: t("activity_document_added") 
    },
    document_viewed: { 
      icon: <Search className="h-4 w-4" />, 
      color: "text-teal-500", 
      label: t("activity_document_viewed") 
    },
    document_downloaded: { 
      icon: <Download className="h-4 w-4" />, 
      color: "text-purple-500", 
      label: t("activity_document_downloaded") 
    },
    party_added: { 
      icon: <UserPlus className="h-4 w-4" />, 
      color: "text-green-500", 
      label: t("activity_party_added") 
    },
    party_updated: { 
      icon: <User2 className="h-4 w-4" />, 
      color: "text-yellow-500", 
      label: t("activity_party_updated") 
    },
    party_removed: { 
      icon: <User2 className="h-4 w-4" />, 
      color: "text-red-500", 
      label: t("activity_party_removed") 
    },
    mediation_started: { 
      icon: <Users className="h-4 w-4" />, 
      color: "text-blue-500", 
      label: t("activity_mediation_started") 
    },
    message_sent: { 
      icon: <MessageSquare className="h-4 w-4" />, 
      color: "text-blue-500", 
      label: t("activity_message_sent") 
    },
    proposal_created: { 
      icon: <Scale className="h-4 w-4" />, 
      color: "text-purple-500", 
      label: t("activity_proposal_created") 
    },
    proposal_accepted: { 
      icon: <CheckCircle className="h-4 w-4" />, 
      color: "text-green-500", 
      label: t("activity_proposal_accepted") 
    },
    proposal_rejected: { 
      icon: <XCircle className="h-4 w-4" />, 
      color: "text-red-500", 
      label: t("activity_proposal_rejected") 
    },
    dispute_resolved: { 
      icon: <Handshake className="h-4 w-4" />, 
      color: "text-green-500", 
      label: t("activity_dispute_resolved") 
    },
    dispute_closed: { 
      icon: <AlertTriangle className="h-4 w-4" />, 
      color: "text-red-500", 
      label: t("activity_dispute_closed") 
    },
  };

  // Filter activities based on selected filters
  const filteredActivities = activityFilters.length > 0
    ? activities.filter((activity: DisputeActivity) => activityFilters.includes(activity.activityType))
    : activities;

  // Helper function to get formatted date for grouping
  const getActivityDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((acc: Record<string, DisputeActivity[]>, activity: DisputeActivity) => {
    const date = getActivityDate(activity.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {});

  // Toggle filter for activity type
  const toggleFilter = (activityType: string) => {
    setActivityFilters(prev => 
      prev.includes(activityType)
        ? prev.filter(type => type !== activityType)
        : [...prev, activityType]
    );
  };

  // Function to clear all filters
  const clearFilters = () => {
    setActivityFilters([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("activity_timeline")}</h3>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5 mr-2" />
              {activityFilters.length > 0 ? t("filter_active", { count: activityFilters.length }) : t("filter")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{t("filter_by_activity_type")}</h4>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-xs" 
                  onClick={clearFilters}
                >
                  {t("clear_all")}
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(activityTypes).map(([type, { label }]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`filter-${type}`}
                      checked={activityFilters.includes(type)}
                      onCheckedChange={() => toggleFilter(type)}
                    />
                    <Label 
                      htmlFor={`filter-${type}`}
                      className="text-sm cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {isActivitiesLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          {t("loading_activities")}
        </div>
      ) : activitiesError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>
            {t("failed_to_load_activities")}
          </AlertDescription>
        </Alert>
      ) : filteredActivities.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground border rounded-lg">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>
            {activityFilters.length > 0 
              ? t("no_matching_activities") 
              : t("no_activities_recorded")}
          </p>
          {activityFilters.length > 0 && (
            <Button 
              variant="link" 
              className="mt-2" 
              onClick={clearFilters}
            >
              {t("clear_filters")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, dateActivities]) => (
              <div key={date} className="space-y-2">
                <div className="sticky top-0 bg-background z-10 py-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {format(new Date(date), 'PPPP')}
                  </h4>
                </div>
                <div className="border-l-2 border-muted-foreground/20 pl-4 ml-2 space-y-4">
                  {dateActivities
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((activity) => {
                      const activityType = activityTypes[activity.activityType] || {
                        icon: <AlertCircle className="h-4 w-4" />,
                        color: "text-muted-foreground",
                        label: activity.activityType
                      };
                      
                      return (
                        <div key={activity.id} className="relative">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[23px] w-4 h-4 rounded-full bg-background flex items-center justify-center border-2 border-muted-foreground/20 ${activityType.color}`}>
                            {activityType.icon}
                          </div>
                          
                          <div className="bg-muted/50 rounded-md p-3">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-medium">
                                  {activityType.label}
                                </Badge>
                                {activity.userName && (
                                  <span className="text-sm text-muted-foreground">
                                    {t("by")} {activity.userName}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(activity.createdAt), 'p')}
                              </span>
                            </div>
                            <p className="text-sm">{activity.description}</p>
                            
                            {/* Render additional metadata based on activity type */}
                            {activity.metadata && activity.activityType === 'document_added' && (
                              <div className="mt-2 text-sm border border-border rounded-sm p-2 bg-background flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span>{activity.metadata.documentName || t("document")}</span>
                                </div>
                                {activity.metadata.documentSize && (
                                  <span className="text-xs text-muted-foreground">
                                    {(activity.metadata.documentSize / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}