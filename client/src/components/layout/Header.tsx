import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { t } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Clock, ArrowRight, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// Common search suggestions based on legal categories
const FALLBACK_SUGGESTIONS = [
  "family law custody",
  "real estate contract",
  "divorce proceedings",
  "employment law",
  "small claims court",
  "immigration documents",
  "copyright infringement"
];

// Custom hook to fetch trending legal topics
function useTrendingTopics() {
  // This could be expanded to fetch from an API endpoint
  return useQuery({
    queryKey: ['/api/trending-topics'],
    enabled: false, // Disable auto-fetching until endpoint exists
    retry: false,
    initialData: [
      "employment discrimination",
      "contract termination clause",
      "landlord tenant rights",
      "child custody agreements",
      "divorce mediation",
      "immigration visa sponsorship",
      "intellectual property licensing"
    ]
  });
}

// Maximum search history items to store
const MAX_SEARCH_HISTORY = 5;

function Header() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  
  // Get trending topics
  const { data: trendingTopics = [] } = useTrendingTopics();
  
  // Get filtered suggestions based on current input
  const filteredSuggestions = searchQuery 
    ? FALLBACK_SUGGESTIONS.filter(
        suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];
  
  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
        localStorage.removeItem('searchHistory');
      }
    }
  }, []);
  
  // Add a search term to history
  const addToSearchHistory = (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;
    
    setSearchHistory(prevHistory => {
      // Remove the term if it exists already to avoid duplicates
      const filteredHistory = prevHistory.filter(item => item !== trimmedTerm);
      // Add the new term to the beginning
      const newHistory = [trimmedTerm, ...filteredHistory].slice(0, MAX_SEARCH_HISTORY);
      // Save to localStorage
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };
  
  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current && 
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a search term",
        variant: "default",
      });
      return;
    }
    
    // Add to search history
    addToSearchHistory(searchQuery);
    
    // Close search dropdown
    setSearchOpen(false);
    
    // Navigate to search results
    navigate(`/legal-research?query=${encodeURIComponent(searchQuery)}`);
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
        
        <Link href="/" className="ml-2 flex items-center">
          <div className="bg-white rounded-lg w-7 h-7 flex items-center justify-center mr-2">
            <span className="material-icons text-primary text-sm">balance</span>
          </div>
          <h1 className="font-heading font-bold text-lg text-white">LegalAI</h1>
        </Link>
      </div>
      
      {/* Logo for desktop */}
      <div className="hidden md:flex items-center">
        <Link href="/" className="flex items-center">
          <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center mr-2">
            <span className="material-icons text-primary text-md">balance</span>
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
      <div className="hidden md:block flex-1 mx-4 md:mx-0 max-w-xs relative ml-auto mr-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/70" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t("global_search_placeholder")}
            className="pl-10 pr-12 py-2 h-10 bg-white/10 text-white rounded-full w-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 border-white/20"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
              setActiveSuggestion(-1);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              // Handle keyboard navigation for suggestions
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                  Math.min(prev + 1, filteredSuggestions.length + searchHistory.length - 1)
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => Math.max(prev - 1, -1));
              } else if (e.key === 'Escape') {
                setSearchOpen(false);
              } else if (e.key === 'Enter' && activeSuggestion >= 0) {
                e.preventDefault();
                // Determine if selection is from history or suggestions
                const totalHistory = searchHistory.length;
                if (activeSuggestion < totalHistory) {
                  // Selection is from history
                  setSearchQuery(searchHistory[activeSuggestion]);
                } else {
                  // Selection is from suggestions
                  setSearchQuery(filteredSuggestions[activeSuggestion - totalHistory]);
                }
                // Submit form after a short delay to allow state update
                setTimeout(() => {
                  handleSearch(e);
                }, 10);
              }
            }}
          />
          {searchQuery && (
            <button 
              type="button"
              className="absolute right-3 top-2.5 p-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>
        
        {/* Search dropdown with suggestions and history */}
        {searchOpen && (
          <div 
            ref={searchDropdownRef}
            className="absolute z-50 top-full mt-1 w-full bg-white rounded-md shadow-lg py-1 max-h-[300px] overflow-y-auto border border-gray-200"
          >
            {/* Search history section */}
            {searchHistory.length > 0 && (
              <div className="px-2 py-1.5">
                <h3 className="text-xs font-medium text-gray-500 mb-1.5 px-2">Recent Searches</h3>
                {searchHistory.map((item, index) => (
                  <button
                    key={`history-${index}`}
                    className={`flex items-center w-full text-left px-3 py-1.5 text-sm ${
                      activeSuggestion === index 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSearchQuery(item);
                      setTimeout(() => handleSearch({ preventDefault: () => {} } as React.FormEvent), 10);
                    }}
                  >
                    <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Divider if both history and suggestions exist */}
            {searchHistory.length > 0 && filteredSuggestions.length > 0 && (
              <div className="h-px bg-gray-200 mx-2 my-1"></div>
            )}
            
            {/* Suggestions section */}
            {filteredSuggestions.length > 0 && (
              <div className="px-2 py-1.5">
                <h3 className="text-xs font-medium text-gray-500 mb-1.5 px-2">Suggestions</h3>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    className={`flex items-center w-full text-left px-3 py-1.5 text-sm ${
                      activeSuggestion === index + searchHistory.length
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setTimeout(() => handleSearch({ preventDefault: () => {} } as React.FormEvent), 10);
                    }}
                  >
                    <Search className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Trending topics (shown when no search query) */}
            {!searchQuery && trendingTopics.length > 0 && (
              <div className="px-2 py-1.5">
                <h3 className="text-xs font-medium text-gray-500 mb-1.5 px-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending Topics
                </h3>
                {trendingTopics.slice(0, 5).map((topic, index) => (
                  <button
                    key={`trending-${index}`}
                    className="flex items-center w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setSearchQuery(topic);
                      setTimeout(() => handleSearch({ preventDefault: () => {} } as React.FormEvent), 10);
                    }}
                  >
                    <TrendingUp className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    <span className="truncate">{topic}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* No results state */}
            {searchQuery && !filteredSuggestions.length && !searchHistory.length && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No matching results found
              </div>
            )}
            
            {/* Direct search button */}
            {searchQuery && (
              <div className="border-t border-gray-200 mt-1">
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-primary hover:bg-gray-50 font-medium"
                  onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
                >
                  <span>Search for "{searchQuery}"</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile search button */}
      <button
        className="md:hidden p-2 rounded-full bg-white/10 text-white ml-auto mr-2"
        onClick={() => {
          // Show mobile search dialog or redirect to search page
          navigate("/legal-research");
        }}
      >
        <Search className="h-5 w-5" />
      </button>
      
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
              <span className="material-icons text-sm ml-1">arrow_drop_down</span>
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
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const { data: trendingTopics = [] } = useTrendingTopics();
  
  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/legal-research?query=${encodeURIComponent(mobileSearchQuery)}`);
    }
  };
  
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
      
      {/* Mobile search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <form onSubmit={handleMobileSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search legal topics..."
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md text-sm border-gray-300 focus:border-primary focus:ring-primary"
          />
          {mobileSearchQuery && (
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-gray-200 hover:bg-gray-300"
              onClick={() => setMobileSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>
        
        {/* Trending topics in mobile view */}
        {trendingTopics.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Trending Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.slice(0, 4).map((topic, index) => (
                <button
                  key={`mobile-trending-${index}`}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  onClick={() => {
                    navigate(`/legal-research?query=${encodeURIComponent(topic)}`);
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <nav className="overflow-y-auto py-4 flex-grow">
        <div className="px-4 mb-6">
          <p className="text-primary text-xs uppercase font-bold mb-3">{t("services")}</p>
          <ul className="space-y-2">
            <li>
              <Link href="/legal-assistant" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">smart_toy</span>
                <span className="font-medium">{t("legal_assistant")}</span>
              </Link>
            </li>
            <li>
              <Link href="/document-generator" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">description</span>
                <span className="font-medium">{t("document_generator")}</span>
              </Link>
            </li>
            <li>
              <Link href="/legal-research" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">search</span>
                <span className="font-medium">{t("legal_research")}</span>
              </Link>
            </li>
            <li>
              <Link href="/contract-analysis" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">insert_drive_file</span>
                <span className="font-medium">{t("contract_analysis")}</span>
              </Link>
            </li>
            <li>
              <Link href="/dispute-resolution" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">gavel</span>
                <span className="font-medium">{t("dispute_resolution")}</span>
              </Link>
            </li>
            <li>
              <Link href="/compliance-checker" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">verified</span>
                <span className="font-medium">{t("compliance_checker")}</span>
              </Link>
            </li>
            <li>
              <Link href="/notarization-guide" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">approval</span>
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
                <span className="material-icons mr-3 text-primary">assignment</span>
                <span className="font-medium">{t("contracts")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/family" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">family_restroom</span>
                <span className="font-medium">{t("family_law")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/real-estate" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">home</span>
                <span className="font-medium">{t("real_estate")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/wills-estates" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">account_balance</span>
                <span className="font-medium">{t("wills_estates")}</span>
              </Link>
            </li>
            <li>
              <Link href="/documents/business" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
                <span className="material-icons mr-3 text-primary">business</span>
                <span className="font-medium">{t("business")}</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="border-t border-neutral-100 p-4">
        <Link href="/help-resources" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">help_outline</span>
          <span className="font-medium">{t("help_resources")}</span>
        </Link>
        <Link href="/profile" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">person</span>
          <span className="font-medium">{t("profile")}</span>
        </Link>
        <Link href="/settings" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">settings</span>
          <span className="font-medium">{t("settings")}</span>
        </Link>
        <Link href="/logout" className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:bg-primary/5 hover:text-primary">
          <span className="material-icons mr-3 text-primary">logout</span>
          <span className="font-medium">{t("logout")}</span>
        </Link>
      </div>
    </div>
  );
}

export default Header;
