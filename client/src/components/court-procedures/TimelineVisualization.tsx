import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Flag, AlertCircle, CalendarDays, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ProcedureStep, EstimatedTimeframe } from '@/types/court-procedures';

interface TimelineVisualizationProps {
  steps: ProcedureStep[];
  timeframes: EstimatedTimeframe[];
  startDate?: Date;
  completedSteps?: number[];
  currentStepId?: number;
}

export const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  steps,
  timeframes,
  startDate = new Date(),
  completedSteps = [],
  currentStepId
}) => {
  // Calculate estimated completion dates for each step
  const calculateDates = () => {
    let currentDate = new Date(startDate);
    
    return steps.map(step => {
      const timeframe = timeframes.find(t => t.stepId === step.id);
      const durationDays = timeframe 
        ? parseInt(timeframe.minDuration.split(' ')[0]) // Assuming format like "5 days"
        : 7; // Default to 7 days if no timeframe
      
      const startDateForStep = new Date(currentDate);
      
      // Add duration days to current date for next step
      currentDate.setDate(currentDate.getDate() + durationDays);
      const endDateForStep = new Date(currentDate);
      
      return {
        step,
        startDate: startDateForStep,
        endDate: endDateForStep,
        duration: durationDays,
        isCompleted: completedSteps.includes(step.id),
        isCurrent: step.id === currentStepId
      };
    });
  };
  
  const timelineData = calculateDates();
  
  // Calculate overall timeline duration
  const totalDuration = timelineData.reduce((total, item) => total + item.duration, 0);
  const estimatedEndDate = new Date(startDate);
  estimatedEndDate.setDate(estimatedEndDate.getDate() + totalDuration);
  
  // Calculate progress percentage
  const completedDuration = timelineData
    .filter(item => item.isCompleted)
    .reduce((total, item) => total + item.duration, 0);
    
  const progressPercentage = Math.round((completedDuration / totalDuration) * 100);
  
  // Find critical milestones (for demonstration, we'll consider steps with warnings as critical)
  const criticalMilestones = steps
    .filter(step => step.warnings && step.warnings.length > 0)
    .map(step => step.id);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Procedure Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Timeline Progress</p>
            <div className="flex items-center gap-3">
              <div className="w-full max-w-[200px] h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-primary rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Start Date:</span>{' '}
              <span className="font-medium">{format(startDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Est. Completion:</span>{' '}
              <span className="font-medium">{format(estimatedEndDate, 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden md:inline">Add to Calendar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add timeline events to your calendar (Coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="relative">
          {/* Timeline axis */}
          <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-muted"></div>
          
          {/* Timeline steps */}
          <div className="space-y-8 ml-4 pl-6 relative">
            {timelineData.map((item, index) => (
              <div key={item.step.id} className="relative">
                {/* Milestone marker */}
                <div 
                  className={`absolute -left-8 w-4 h-4 rounded-full border-2 ${
                    item.isCompleted 
                      ? 'bg-primary border-primary' 
                      : item.isCurrent 
                        ? 'bg-white border-primary' 
                        : 'bg-white border-muted-foreground'
                  }`}
                ></div>
                
                <div className={`
                  p-4 rounded-lg border 
                  ${item.isCurrent ? 'border-primary bg-primary/5' : 'border-border'}
                  ${item.isCompleted ? 'opacity-70' : ''}
                `}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <h3 className="font-medium text-base flex items-center gap-2">
                      <span>{index + 1}. {item.step.title}</span>
                      {criticalMilestones.includes(item.step.id) && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <Flag className="h-3 w-3" /> Critical
                        </Badge>
                      )}
                      {item.step.isOptional && (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Est. Duration: {item.duration} days
                      </span>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1 h-7 px-2">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{format(item.startDate, 'MMM d')}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={item.startDate}
                            month={item.startDate}
                            disabled
                            className="rounded-md border"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{item.step.description}</p>
                  
                  {item.isCurrent && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="default" size="sm" className="gap-1">
                        <Flag className="h-3 w-3" />
                        Mark as Complete
                      </Button>
                      
                      {item.step.requiredDocuments && item.step.requiredDocuments.length > 0 && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Download Forms
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Connector line to next item */}
                {index < timelineData.length - 1 && (
                  <div className="absolute -left-6 top-8 bottom-0 h-[calc(100%-24px)] w-px border-l-2 border-dashed border-muted"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Timeline estimates are based on standard processing times and may vary.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineVisualization;