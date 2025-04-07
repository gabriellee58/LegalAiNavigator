import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Container({
  children,
  className,
  size = "lg",
  ...props
}: ContainerProps) {
  // Size mapping
  const sizeClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg", 
    xl: "max-w-screen-xl",
    full: "max-w-full"
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}