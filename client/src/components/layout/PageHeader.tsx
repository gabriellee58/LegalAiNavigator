import React from "react";
import { BookOpen } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * PageHeader component
 * Used at the top of each page to display a title, description, and optional actions
 */
export default function PageHeader({ 
  title, 
  description, 
  icon, 
  children 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
            {icon || <BookOpen className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
}