import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Scale, 
  Gavel, 
  Home, 
  Coins, 
  Building, 
  ArrowDown, 
  ArrowRight, 
  Check, 
  AlertCircle,
  FileText 
} from 'lucide-react';

// Interface for procedure description data
export interface ProcedureDescriptionData {
  title: string;
  overview: string;
  steps: ProcedureStep[];
  iconType?: 'civil' | 'criminal' | 'family' | 'small-claims' | 'administrative';
  notes?: string;
}

interface ProcedureStep {
  title: string;
  description: string;
  isAlternatePath?: boolean;
}

interface ProcedureDescriptionProps {
  data: ProcedureDescriptionData;
}

const ProcedureDescription: React.FC<ProcedureDescriptionProps> = ({ data }) => {
  // Determine the icon to display based on the type
  const getIcon = () => {
    switch (data.iconType) {
      case 'civil':
        return <Scale className="h-6 w-6 text-primary" />;
      case 'criminal':
        return <Gavel className="h-6 w-6 text-primary" />;
      case 'family':
        return <Home className="h-6 w-6 text-primary" />;
      case 'small-claims':
        return <Coins className="h-6 w-6 text-primary" />;
      case 'administrative':
        return <Building className="h-6 w-6 text-primary" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            {getIcon()}
          </div>
          <CardTitle className="text-xl font-bold">{data.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-muted-foreground">{data.overview}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Process Flow</h3>
              <div className="space-y-2">
                {data.steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className={`p-4 rounded-lg border ${step.isAlternatePath ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'border-muted bg-card'}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {step.isAlternatePath ? (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          ) : (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add arrow connector if not the last step */}
                    {index < data.steps.length - 1 && !data.steps[index + 1].isAlternatePath && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Add alternate path arrow if next step is alternate */}
                    {index < data.steps.length - 1 && data.steps[index + 1].isAlternatePath && (
                      <div className="flex justify-end py-1 pr-4">
                        <ArrowRight className="h-6 w-6 text-amber-500" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {data.notes && (
              <div className="pt-4 mt-4 border-t border-muted">
                <h3 className="text-sm font-medium mb-2">Additional Notes</h3>
                <p className="text-sm text-muted-foreground">{data.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProcedureDescription;