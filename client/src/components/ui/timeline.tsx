import React from 'react';
import { Check, Circle, Clock, CalendarDays, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface TimelineStep {
  title: string;
  description: string;
  status?: 'completed' | 'current' | 'upcoming';
  customIcon?: React.ReactNode;
  date?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  estimatedTime?: string;
  prerequisites?: string[];
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function Timeline({
  steps,
  estimatedTime,
  prerequisites,
  direction = 'vertical',
  className,
}: TimelineProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {estimatedTime && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Estimated time: <span className="font-medium text-foreground">{estimatedTime}</span>
          </span>
        </div>
      )}
      
      {prerequisites && prerequisites.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Prerequisites</span>
          </div>
          <ul className="ml-6 list-disc text-sm text-muted-foreground space-y-1">
            {prerequisites.map((prereq, i) => (
              <li key={i}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={cn(
          'relative',
          direction === 'vertical'
            ? 'space-y-6'
            : 'flex flex-row gap-4 overflow-x-auto pb-4'
        )}
      >
        {direction === 'vertical' && (
          <div className="absolute left-5 top-5 h-[calc(100%-40px)] w-[1px] bg-border" />
        )}

        {steps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;
          const isCurrent = step.status === 'current';
          const isCompleted = step.status === 'completed';

          // Determine step icon based on status
          let StepIcon = Circle;
          
          if (isCompleted) {
            StepIcon = Check;
          }
          
          if (step.customIcon) {
            StepIcon = () => <>{step.customIcon}</>;
          }

          return (
            <div
              key={index}
              className={cn(
                'relative',
                direction === 'horizontal' && 'flex-shrink-0 w-72',
                direction === 'horizontal' && !isLast && 'after:content-[""] after:absolute after:top-5 after:right-[-20px] after:w-4 after:h-[1px] after:bg-border'
              )}
            >
              <div
                className={cn(
                  'relative flex',
                  direction === 'vertical' ? 'flex-row items-start gap-4' : 'flex-col gap-2'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                    isCurrent && 'bg-primary border-primary text-primary-foreground',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    !isCurrent && !isCompleted && 'bg-background border-border text-muted-foreground'
                  )}
                >
                  <StepIcon className="h-5 w-5" />
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {step.title}
                    </h3>
                    {isCurrent && <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-xs">Current</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {step.date && (
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <CalendarDays className="mr-1 h-3 w-3" />
                      {step.date}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TimelineCard({ 
  title, 
  description, 
  steps,
  estimatedTime,
  prerequisites,
  direction = 'vertical',
  className 
}: { 
  title: string;
  description?: string;
  steps: TimelineStep[];
  estimatedTime?: string;
  prerequisites?: string[];
  direction?: 'vertical' | 'horizontal';
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <Timeline 
          steps={steps} 
          estimatedTime={estimatedTime}
          prerequisites={prerequisites}
          direction={direction} 
        />
      </CardContent>
    </Card>
  );
}