import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <main className={cn("flex-1 w-full min-h-[calc(100vh-4rem)]", className)}>
      {children}
    </main>
  );
};

export default PageContainer;