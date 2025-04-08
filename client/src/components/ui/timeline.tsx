import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-6", className)}>
      {children}
    </div>
  );
}

interface TimelineItemProps {
  children: ReactNode;
  className?: string;
}

export function TimelineItem({ children, className }: TimelineItemProps) {
  return (
    <div className={cn("relative flex gap-4", className)}>
      {children}
    </div>
  );
}

interface TimelineIconProps {
  icon: LucideIcon;
  className?: string;
}

export function TimelineIcon({ icon: Icon, className }: TimelineIconProps) {
  return (
    <div className="relative z-10 flex h-6 w-6 items-center justify-center">
      <Icon className={cn("h-5 w-5 text-primary", className)} />
    </div>
  );
}

interface TimelineConnectorProps {
  className?: string;
}

export function TimelineConnector({ className }: TimelineConnectorProps) {
  return (
    <div
      className={cn(
        "absolute left-3 top-6 -bottom-6 w-[1px] -translate-x-1/2 bg-border",
        className
      )}
    />
  );
}

interface TimelineContentProps {
  children: ReactNode;
  className?: string;
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  return (
    <div className={cn("flex-1 pt-0.5", className)}>
      {children}
    </div>
  );
}