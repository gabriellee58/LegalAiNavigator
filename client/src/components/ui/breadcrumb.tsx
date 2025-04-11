import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  href: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  homeHref = "/",
  className,
}) => {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex flex-wrap items-center space-x-1 md:space-x-2">
        <li className="flex items-center">
          <Link href={homeHref}>
            <span className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {index === items.length - 1 ? (
              <span className="ml-1 md:ml-2 text-sm font-medium text-foreground">
                {item.label}
              </span>
            ) : (
              <Link href={item.href}>
                <span className="ml-1 md:ml-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                  {item.label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Helper function to auto-generate breadcrumbs based on current path
export function useBreadcrumbs() {
  const [location] = useLocation();
  
  const generateBreadcrumbs = React.useCallback(() => {
    // Skip empty path
    if (!location || location === '/') return [];
    
    // Split the path into segments and remove empty strings
    const segments = location.split('/').filter(Boolean);
    
    // Map each segment to a breadcrumb item
    return segments.map((segment, index) => {
      // Build the path up to this segment
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      
      // Format the label by replacing hyphens with spaces and capitalizing
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return { href: path, label };
    });
  }, [location]);
  
  return generateBreadcrumbs();
}

// A higher-order component to easily add breadcrumbs to any page
export function withBreadcrumbs<P extends object>(
  Component: React.ComponentType<P>,
  customBreadcrumbs?: BreadcrumbItem[]
): React.FC<P> {
  const WithBreadcrumbsComponent: React.FC<P> = (props) => {
    const autoBreadcrumbs = useBreadcrumbs();
    const breadcrumbs = customBreadcrumbs || autoBreadcrumbs;
    
    return (
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
        <Component {...props} />
      </div>
    );
  };
  
  return WithBreadcrumbsComponent;
}

export default Breadcrumbs;