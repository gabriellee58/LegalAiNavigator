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
    <header className="bg-white shadow-sm py-2 px-4 md:px-6 flex md:justify-between items-center sticky top-0 z-10">
      {/* Mobile menu button and logo */}
      <div className="flex items-center md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="p-2 rounded-md text-neutral-600 focus:outline-none">
              <span className="material-icons">menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        
        <Link href="/">
          <a className="ml-2 flex items-center">
            <div className="bg-primary rounded-lg w-7 h-7 flex items-center justify-center mr-2">
              <span className="material-icons text-white text-sm">balance</span>
            </div>
            <h1 className="font-heading font-semibold text-lg text-primary">LegalAI</h1>
          </a>
        </Link>
      </div>
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-4 md:mx-0 max-w-xl relative">
        <span className="absolute left-3 top-3 text-neutral-400">
          <span className="material-icons text-sm">search</span>
        </span>
        <Input
          type="text"
          placeholder={t("search_placeholder")}
          className="pl-10 pr-4 py-2 bg-neutral-100 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      
      {/* User profile and actions */}
      <div className="flex items-center ml-auto md:ml-0">
        <Button variant="ghost" size="icon" className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 focus:outline-none relative">
          <span className="material-icons">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden">
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
      <div className="p-4 flex items-center justify-between border-b border-neutral-200">
        <div className="flex items-center">
          <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center mr-2">
            <span className="material-icons text-white text-lg">balance</span>
          </div>
          <h1 className="font-heading font-semibold text-xl text-primary">LegalAI</h1>
        </div>
      </div>
      
      <nav className="overflow-y-auto py-4 flex-grow">
        <div className="px-4 mb-4">
          <p className="text-neutral-500 text-xs uppercase font-medium mb-2">{t("services")}</p>
          <ul>
            <li>
              <Link href="/legal-assistant">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">smart_toy</span>
                  <span>{t("legal_assistant")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/document-generator">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">description</span>
                  <span>{t("document_generator")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/legal-research">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">search</span>
                  <span>{t("legal_research")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/dispute-resolution">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">gavel</span>
                  <span>{t("dispute_resolution")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/compliance-checker">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">verified</span>
                  <span>{t("compliance_checker")}</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="px-4 mb-4">
          <p className="text-neutral-500 text-xs uppercase font-medium mb-2">{t("document_templates")}</p>
          <ul>
            <li>
              <Link href="/documents/contracts">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">assignment</span>
                  <span>{t("contracts")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/leases">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">home</span>
                  <span>{t("leases")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/wills-estates">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">account_balance</span>
                  <span>{t("wills_estates")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/business-formation">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">business</span>
                  <span>{t("business_formation")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/ip-management">
                <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1">
                  <span className="material-icons mr-3 text-neutral-500">copyright</span>
                  <span>{t("ip_management")}</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="border-t border-neutral-200 p-4">
        <Link href="/help">
          <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary">
            <span className="material-icons mr-3 text-neutral-500">help_outline</span>
            <span>{t("help_resources")}</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary">
            <span className="material-icons mr-3 text-neutral-500">settings</span>
            <span>{t("settings")}</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

export default Header;
