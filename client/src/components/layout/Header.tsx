import { useState } from "react";
import { Link } from "wouter";
import { t } from "@/lib/i18n";
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
              <span className="material-icons">menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        
        <Link href="/">
          <a className="ml-2 flex items-center">
            <div className="bg-white rounded-lg w-7 h-7 flex items-center justify-center mr-2">
              <span className="material-icons text-primary text-sm">balance</span>
            </div>
            <h1 className="font-heading font-bold text-lg text-white">LegalAI</h1>
          </a>
        </Link>
      </div>
      
      {/* Logo for desktop */}
      <div className="hidden md:flex items-center">
        <Link href="/">
          <a className="flex items-center">
            <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center mr-2">
              <span className="material-icons text-primary text-md">balance</span>
            </div>
            <h1 className="font-heading font-bold text-xl text-white">LegalAI</h1>
          </a>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6 ml-10">
        <Link href="/legal-assistant">
          <a className="text-white/90 hover:text-white font-medium text-sm">Virtual Assistant</a>
        </Link>
        <Link href="/document-generator">
          <a className="text-white/90 hover:text-white font-medium text-sm">Documents</a>
        </Link>
        <Link href="/legal-research">
          <a className="text-white/90 hover:text-white font-medium text-sm">Research</a>
        </Link>
        <Link href="/contract-analysis">
          <a className="text-white/90 hover:text-white font-medium text-sm">Contracts</a>
        </Link>
        <Link href="/dispute-resolution">
          <a className="text-white/90 hover:text-white font-medium text-sm">Disputes</a>
        </Link>
      </div>
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-4 md:mx-0 max-w-xs relative ml-auto mr-4">
        <span className="absolute left-3 top-3 text-neutral-400">
          <span className="material-icons text-sm">search</span>
        </span>
        <Input
          type="text"
          placeholder={t("search_placeholder")}
          className="pl-10 pr-4 py-2 bg-white/10 text-white rounded-full w-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 border-white/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      
      {/* User profile and actions */}
      <div className="flex items-center ml-auto md:ml-0">
        <Button variant="ghost" size="icon" className="p-2 rounded-full text-white hover:bg-white/10 focus:outline-none relative">
          <span className="material-icons">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-4 flex items-center text-white hover:bg-white/10">
              <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
                <img
                  src="https://randomuser.me/api/portraits/women/43.jpg"
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">Sarah Mitchell</span>
              <span className="material-icons text-sm ml-1">arrow_drop_down</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/profile">
                <a className="flex items-center w-full">
                  <span className="material-icons mr-2 text-sm">person</span>
                  Profile
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings">
                <a className="flex items-center w-full">
                  <span className="material-icons mr-2 text-sm">settings</span>
                  Settings
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/logout">
                <a className="flex items-center w-full">
                  <span className="material-icons mr-2 text-sm">logout</span>
                  Logout
                </a>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MobileSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="purple-gradient-bg p-5 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center mr-2">
            <span className="material-icons text-primary text-lg">balance</span>
          </div>
          <h1 className="font-heading font-bold text-xl text-white">LegalAI</h1>
        </div>
      </div>
      
      <nav className="overflow-y-auto py-4 flex-grow">
        <div className="px-4 mb-6">
          <p className="text-primary text-xs uppercase font-bold mb-3">{t("services")}</p>
          <ul className="space-y-2">
            <li>
              <Link href="/legal-assistant">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">smart_toy</span>
                  <span className="font-medium">{t("legal_assistant")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/document-generator">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">description</span>
                  <span className="font-medium">{t("document_generator")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/legal-research">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">search</span>
                  <span className="font-medium">{t("legal_research")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/contract-analysis">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">insert_drive_file</span>
                  <span className="font-medium">Contract Analysis</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/dispute-resolution">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">gavel</span>
                  <span className="font-medium">{t("dispute_resolution")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/compliance-checker">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">verified</span>
                  <span className="font-medium">{t("compliance_checker")}</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="px-4 mb-6">
          <p className="text-primary text-xs uppercase font-bold mb-3">{t("document_templates")}</p>
          <ul className="space-y-2">
            <li>
              <Link href="/documents/contracts">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">assignment</span>
                  <span className="font-medium">{t("contracts")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/family">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">family_restroom</span>
                  <span className="font-medium">Family Law</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/real-estate">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">home</span>
                  <span className="font-medium">Real Estate</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/wills-estates">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">account_balance</span>
                  <span className="font-medium">Wills & Estates</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/business">
                <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                  <span className="material-icons mr-3 text-primary">business</span>
                  <span className="font-medium">Business</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="border-t border-neutral-100 p-4">
        <Link href="/help">
          <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
            <span className="material-icons mr-3 text-primary">help_outline</span>
            <span className="font-medium">{t("help_resources")}</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
            <span className="material-icons mr-3 text-primary">settings</span>
            <span className="font-medium">{t("settings")}</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

export default Header;
