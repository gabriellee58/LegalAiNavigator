import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNavbar from "./MobileNavbar";
import { SubscriptionStatusBanner } from "../subscription/SubscriptionStatusBanner";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar (desktop only) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Subscription Status Banner (only show for authenticated users) */}
        {user && <SubscriptionStatusBanner />}
        
        {/* Top Navigation Bar */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-8">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavbar />
      </div>
    </div>
  );
}

export default MainLayout;
