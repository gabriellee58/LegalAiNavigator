import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scale, 
  Gavel, 
  Home, 
  Coins, 
  Building, 
  ArrowRight, 
  ChevronRight,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllProcedures } from '@/data/court-procedures';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CourtProcedureData } from '@/data/court-procedures/types';

const CourtProceduresStaticPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const allProcedures = getAllProcedures();

  // Function to get icon component based on category
  const getIconComponent = (procedure: CourtProcedureData) => {
    const category = procedure.category.toLowerCase();
    
    switch (category) {
      case 'civil':
        return <Scale className="w-6 h-6" />;
      case 'criminal':
        return <Gavel className="w-6 h-6" />;
      case 'family':
        return <Home className="w-6 h-6" />;
      case 'small claims':
        return <Coins className="w-6 h-6" />;
      case 'administrative':
        return <Building className="w-6 h-6" />;
      default:
        return <Scale className="w-6 h-6" />;
    }
  };

  // Filter procedures based on search query
  const filteredProcedures = searchQuery 
    ? allProcedures.filter(procedure => 
        procedure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        procedure.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProcedures;

  const handleProcedureSelect = (procedureId: string) => {
    setLocation(`/court-procedures/${procedureId}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Court Procedures</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold tracking-tight mt-4 mb-2">Canadian Court Procedures</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Understand the Canadian court system with comprehensive guides and step-by-step procedures
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search court procedures..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProcedures.map((procedure) => (
          <Card key={procedure.id} className="overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl">{procedure.title}</CardTitle>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {getIconComponent(procedure)}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base min-h-[60px]">
                {procedure.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between"
                onClick={() => handleProcedureSelect(procedure.id)}
              >
                <span>View Procedure</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted/40 rounded-lg">
        <h3 className="font-semibold mb-2">About Canadian Court Procedures</h3>
        <p className="text-muted-foreground text-sm">
          These guides provide general information about court procedures in Canada. 
          They are designed to help you understand the basic steps and requirements of 
          different court processes. The information is not legal advice, and procedures 
          may vary by province and specific court. For legal advice, please consult a 
          qualified legal professional.
        </p>
      </div>
    </div>
  );
};

export default CourtProceduresStaticPage;