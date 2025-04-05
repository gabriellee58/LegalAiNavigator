import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNavbar from "./MobileNavbar";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar (desktop only) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col">
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
