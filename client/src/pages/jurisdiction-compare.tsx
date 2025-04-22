import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle, Save, Share2 } from "lucide-react";
import { t } from "@/lib/i18n";

// Define types for our data structures
interface Province {
  code: string;
  name: string;
  system: "common_law" | "civil_law";
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
}

interface Requirement {
  title: string;
  description: string;
  statute: string;
}

interface RequirementsByProvince {
  [provinceCode: string]: {
    requirements: Requirement[];
  };
}

interface RequirementsBySubcategory {
  [subcategory: string]: RequirementsByProvince;
}

interface SubcategoriesByCategory {
  [category: string]: Subcategory[];
}

// Data will be fetched from the API

export default function JurisdictionCompare() {
  const { toast } = useToast();
  const [category, setCategory] = useState("family_law");
  const [subcategory, setSubcategory] = useState("divorce");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(["ON", "QC", "BC"]);
  const [activeTab, setActiveTab] = useState("ON");
  
  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user', {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
        
        if (res.status === 401) {
          // User is not authenticated, redirect to login
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch provinces from the API
  const {
    data: provinces,
    isLoading: isLoadingProvinces,
  } = useQuery<Province[]>({
    queryKey: ["/api/jurisdictions/provinces"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/jurisdictions/provinces", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });
        
        if (res.status === 401) {
          // Unauthorized - redirect to auth page
          window.location.href = '/auth';
          throw new Error("Authentication required");
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch provinces");
        }
        
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast({
          title: "Error",
          description: "Failed to load provinces. Please try again later.",
          variant: "destructive",
        });
        // Return empty array instead of mock data to be safer
        return [];
      }
    },
  });
  
  // Fetch categories from the API
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery<Category[]>({
    queryKey: ["/api/jurisdictions/categories"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/jurisdictions/categories", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });
        
        if (res.status === 401) {
          // Unauthorized - redirect to auth page
          window.location.href = '/auth';
          throw new Error("Authentication required");
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load legal categories. Please try again later.",
          variant: "destructive",
        });
        // Return empty array instead of mock data
        return [];
      }
    },
  });
  
  // Fetch subcategories from the API
  const {
    data: subcategories,
    isLoading: isLoadingSubcategories,
  } = useQuery<Subcategory[]>({
    queryKey: ["/api/jurisdictions/subcategories", category],
    queryFn: async () => {
      try {
        if (!category) return [];
        
        const res = await fetch(`/api/jurisdictions/subcategories/${category}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });
        
        if (res.status === 401) {
          // Unauthorized - redirect to auth page
          window.location.href = '/auth';
          throw new Error("Authentication required");
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch subcategories");
        }
        
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        toast({
          title: "Error",
          description: "Failed to load subcategories. Please try again later.",
          variant: "destructive",
        });
        // Return empty array instead of mock data
        return [];
      }
    },
    enabled: !!category,
  });

  // Fetch legal requirements from the API
  const {
    data: requirements,
    isLoading: isLoadingRequirements,
    error: requirementsError,
  } = useQuery<RequirementsByProvince>({
    queryKey: ["/api/jurisdictions/requirements", category, subcategory, selectedProvinces],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams({
          category,
          subcategory,
          provinces: selectedProvinces.join(','),
        });
        
        const res = await fetch(`/api/jurisdictions/requirements?${queryParams}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });
        
        if (res.status === 401) {
          // Unauthorized - redirect to auth page
          window.location.href = '/auth';
          throw new Error("Authentication required");
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch requirements");
        }
        
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching requirements:", error);
        toast({
          title: "Error",
          description: "Failed to load legal requirements. Please try again later.",
          variant: "destructive",
        });
        // Return empty object to prevent UI breaking
        return {} as RequirementsByProvince;
      }
    },
    enabled: !!subcategory && !!category && selectedProvinces.length > 0,
  });

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    // Subcategories will be fetched automatically due to the dependency in the useQuery
    // We'll set the default subcategory in the useEffect below
  };

  // Handle subcategory change
  const handleSubcategoryChange = (value: string) => {
    setSubcategory(value);
  };

  // Add province to comparison
  const addProvince = (provinceCode: string) => {
    if (selectedProvinces.includes(provinceCode)) return;
    if (selectedProvinces.length >= 4) {
      toast({
        title: "Maximum provinces reached",
        description: "You can compare up to 4 provinces at a time",
        variant: "destructive",
      });
      return;
    }
    setSelectedProvinces([...selectedProvinces, provinceCode]);
    setActiveTab(provinceCode);
  };

  // Remove province from comparison
  const removeProvince = (provinceCode: string) => {
    if (selectedProvinces.length <= 1) {
      toast({
        title: "Cannot remove province",
        description: "At least one province must be selected",
        variant: "destructive",
      });
      return;
    }
    
    const newSelectedProvinces = selectedProvinces.filter(p => p !== provinceCode);
    setSelectedProvinces(newSelectedProvinces);
    
    // If the active tab is the one being removed, select the first available tab
    if (activeTab === provinceCode) {
      setActiveTab(newSelectedProvinces[0]);
    }
  };

  // Save comparison
  const saveComparison = async () => {
    try {
      const comparisonData = {
        category,
        subcategory,
        provinces: selectedProvinces,
        title: `${subcategories?.find(s => s.id === subcategory)?.name || ''} Comparison - ${new Date().toLocaleDateString()}`
      };
      
      const response = await fetch('/api/jurisdictions/save-comparison', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(comparisonData),
      });
      
      if (response.status === 401) {
        // Unauthorized - redirect to auth page
        window.location.href = '/auth';
        throw new Error("Authentication required");
      }
      
      if (!response.ok) {
        throw new Error('Failed to save comparison');
      }
      
      toast({
        title: "Comparison saved",
        description: "Your comparison has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving comparison:', error);
      toast({
        title: "Error",
        description: "Failed to save comparison. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Share comparison
  const shareComparison = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "A link to this comparison has been copied to your clipboard",
    });
  };

  // Handle initial loading of default subcategory
  useEffect(() => {
    if (subcategories && subcategories.length > 0) {
      setSubcategory(subcategories[0].id);
    }
  }, [subcategories]);

  return (
    <MainLayout>
      <div className="container pb-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{t("multi_jurisdictional_comparison")}</h1>
            <p className="text-muted-foreground">
              {t("compare_legal_requirements_across_provinces")}
            </p>
          </div>

          {/* Controls section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    {t("legal_category")}
                  </label>
                  <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                          Loading...
                        </div>
                      ) : categories && categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No categories available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    {t("subcategory")}
                  </label>
                  <Select value={subcategory} onValueChange={handleSubcategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_subcategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSubcategories ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                          Loading...
                        </div>
                      ) : subcategories && subcategories.length > 0 ? (
                        subcategories.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.id}>
                            {subcat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No subcategories available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    {t("add_province")}
                  </label>
                  <Select
                    onValueChange={(value) => {
                      addProvince(value);
                    }}
                    value=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("add_province_to_compare")} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingProvinces ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                          Loading...
                        </div>
                      ) : provinces && provinces.length > 0 ? (
                        provinces.map((province) => (
                          <SelectItem
                            key={province.code}
                            value={province.code}
                            disabled={selectedProvinces.includes(province.code)}
                          >
                            {province.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No provinces available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={shareComparison}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t("share")}
                </Button>
                <Button onClick={saveComparison}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("save_comparison")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comparison results section */}
          {isLoadingProvinces || isLoadingRequirements ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {/* Tabs for provinces */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    {selectedProvinces.map((provinceCode) => {
                      const province = provinces?.find((p) => p.code === provinceCode);
                      return (
                        <TabsTrigger key={provinceCode} value={provinceCode} className="relative pl-8 pr-12">
                          {province?.name}
                          {selectedProvinces.length > 1 && (
                            <span
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeProvince(provinceCode);
                              }}
                            >
                              ✕
                            </span>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

                {/* Tab content for each province */}
                {selectedProvinces.map((provinceCode) => {
                  const province = provinces?.find((p) => p.code === provinceCode);
                  const provinceReqs = requirements?.[provinceCode]?.requirements || [];

                  return (
                    <TabsContent key={provinceCode} value={provinceCode}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            {province?.name}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              ({province?.system === "common_law" ? "Common Law" : "Civil Law"})
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {provinceReqs.length > 0 ? (
                            <div className="space-y-6">
                              {provinceReqs.map((req: Requirement, index: number) => (
                                <div key={index} className="border-b pb-4 last:border-0">
                                  <h3 className="font-semibold text-lg">{req.title}</h3>
                                  <p className="mt-1 text-gray-600">{req.description}</p>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-medium">Statute:</span> {req.statute}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No legal requirements data available for this jurisdiction.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}