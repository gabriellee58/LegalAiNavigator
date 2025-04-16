import { useState } from "react";
import { Link } from "wouter";
import { t } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function Header() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to search results page with query
    window.location.href = `/legal-research?query=${encodeURIComponent(searchQuery)}`;
  };
  
  return (
    <header className="purple-gradient-bg shadow-md py-3 px-4 md:px-8 flex md:justify-between items-center sticky top-0 z-10">
      {/* Mobile menu button and logo */}
      <div className="flex items-center md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="p-2 rounded-md text-white focus:outline-none hover:bg-white/10">
              <span className="material-icons">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="ml-2 flex items-center">
          <div className="bg-white rounded-lg w-7 h-7 flex items-center justify-center mr-2">
            <span className="material-icons text-primary text-sm">Balance</span>
          </div>
          <h1 className="font-heading font-bold text-lg text-white">LegalAI</h1>
        </Link>
      </div>
      
      {/* Logo for desktop */}
      <div className="hidden md:flex items-center">
        <Link href="/" className="flex items-center">
          <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center mr-2">
            <span className="material-icons text-primary text-md">Balance</span>
          </div>
          <h1 className="font-heading font-bold text-xl text-white">LegalAI</h1>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6 ml-10">
        <Link href="/legal-assistant" className="text-white/90 hover:text-white font-medium text-sm">
          Virtual Assistant
        </Link>
        <Link href="/document-generator" className="text-white/90 hover:text-white font-medium text-sm">
          Documents
        </Link>
        <Link href="/legal-research" className="text-white/90 hover:text-white font-medium text-sm">
          Research
        </Link>
        <Link href="/contract-analysis" className="text-white/90 hover:text-white font-medium text-sm">
          Contracts
        </Link>
        <Link href="/dispute-resolution" className="text-white/90 hover:text-white font-medium text-sm">
          Disputes
        </Link>
        <Link href="/notarization-guide" className="text-white/90 hover:text-white font-medium text-sm">
          Notarization
        </Link>
      </div>
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-4 md:mx-0 max-w-xs relative ml-auto mr-4">
        <span className="absolute left-3 top-3 text-neutral-400">
          <span className="material-icons text-sm">Search</span>
        </span>
        <Input
          type="text"
          placeholder={t("global_search_placeholder")}
          className="pl-10 pr-4 py-2 bg-white/10 text-white rounded-full w-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 border-white/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      
      {/* User profile and actions */}
      <div className="flex items-center ml-auto md:ml-0">
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-4 flex items-center text-white hover:bg-white/10">
              <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden border-2 border-white/30 flex items-center justify-center text-white">
                {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">
                {user?.fullName || user?.username || 'User'}
              </span>
              <span className="material-icons text-sm ml-1">Arrow_Drop_Down</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center w-full">
                <span className="material-icons mr-2 text-sm">person</span>
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center w-full">
                <span className="material-icons mr-2 text-sm">settings</span>
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/logout" className="flex items-center w-full">
                <span className="material-icons mr-2 text-sm">logout</span>
                Logout
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MobileSidebar() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col h-full">
      <div className="purple-gradient-bg p-5 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center mr-2">
            <span className="material-icons text-primary text-lg">Balance</span>
          </div>
          <h1 className="font-heading font-bold text-xl text-white">LegalAI</h1>
        </div>
      </div>
      
      {/* User info in mobile view */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden border-2 border-primary/30 flex items-center justify-center text-primary font-medium">
          {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="ml-3">
          <p className="font-medium">{user?.fullName || user?.username || 'User'}</p>
          <p className="text-xs text-gray-500">{user?.username}</p>
        </div>
      </div>
      
      <nav className="overflow-y-auto py-4 flex-grow">
        <div className="px-4 mb-6">
          <p className="text-primary text-xs uppercase font-bold mb-3">{t("services")}</p>
          <ul className="space-y-2">
            <li>
              <Link href="/legal-assistant" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Smart_Toy</span>
                <span className="font-medium">{t("legal_assistant")}</span>
              </Link>
            </li>
            <li>
              <Link href="/document-generator" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Description</span>
                <span className="font-medium">{t("document_generator")}</span>
              </Link>
            </li>
            <li>
              <Link href="/legal-research" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Search</span>
                <span className="font-medium">{t("legal_research")}</span>
              </Link>
            </li>
            <li>
              <Link href="/contract-analysis" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Insert_Drive_File</span>
                <span className="font-medium">{t("contract_analysis")}</span>
              </Link>
            </li>
            <li>
              <Link href="/dispute-resolution" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Gavel</span>
                <span className="font-medium">{t("dispute_resolution")}</span>
              </Link>
            </li>
            <li>
              <Link href="/compliance-checker" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Verified</span>
                <span className="font-medium">{t("compliance_checker")}</span>
              </Link>
            </li>
            <li>
              <Link href="/notarization-guide" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Approval</span>
                <span className="font-medium">{t("notarization_guide")}</span>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="px-4 mb-6">
          <p className="text-primary text-xs uppercase font-bold mb-3">{t("document_templates")}</p>
          <ul className="space-y-2">
            <li>
              <Link href="/documents/contracts" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Assignment</span>
                <span className="font-medium">{t("contracts")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/family" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Family_Restroom</span>
                <span className="font-medium">{t("family_law")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/real-estate" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Home</span>
                <span className="font-medium">{t("real_estate")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/wills-estates" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Account_Balance</span>
                <span className="font-medium">{t("wills_estates")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/business" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">Business</span>
                <span className="font-medium">{t("business")}</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="border-t border-neutral-100 p-4">
        <Link href="/help-resources" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">Help_Outline</span>
          <span className="font-medium">{t("help_resources")}</span>
        </Link>
        <Link href="/profile" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">Person</span>
          <span className="font-medium">{t("profile")}</span>
        </Link>
        <Link href="/settings" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">Settings</span>
          <span className="font-medium">{t("settings")}</span>
        </Link>
        <Link href="/logout" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">Logout</span>
          <span className="font-medium">{t("logout")}</span>
        </Link>
      </div>
    </div>
  );
}

export default Header;
