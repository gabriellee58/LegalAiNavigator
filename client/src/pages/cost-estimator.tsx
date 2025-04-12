import React from 'react';
import CostEstimator from '../components/cost-estimator/CostEstimator';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const CostEstimatorPage: React.FC = () => {
  const [location, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="mt-4 text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent">
            Legal Cost Estimator
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Get an estimated cost breakdown for your legal matter based on Canadian legal fee data and your specific case details.
          </p>
        </div>
      </div>
      
      <CostEstimator />
      
      <div className="mt-12 max-w-2xl mx-auto border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            The Legal Cost Estimator helps you understand approximately how much your legal 
            matter may cost based on typical fee ranges in your jurisdiction.
          </p>
          <p>
            <strong className="text-foreground">How it works:</strong> By analyzing information about your 
            legal matter, the complexity of your case, and the jurisdiction, our system provides an estimated 
            cost breakdown across different expense categories.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold">Features</h3>
              </div>
              <ul className="list-disc pl-6 space-y-1">
                <li>Get estimated cost ranges for your legal matter</li>
                <li>See detailed expense category breakdowns</li>
                <li>Compare lawyer representation vs. self-representation costs</li>
                <li>Identify major cost factors specific to your case</li>
                <li>Discover potential cost-saving opportunities</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="material-icons text-yellow-600 mr-2">info</span>
                <h3 className="font-semibold text-yellow-800">Important Notes</h3>
              </div>
              <ul className="list-disc pl-6 space-y-1 text-yellow-700">
                <li>Estimates are based on typical fee ranges and may vary</li>
                <li>Not a substitute for a formal quote or retainer agreement</li>
                <li>Actual costs depend on many case-specific factors</li>
                <li>Always consult directly with legal professionals for accurate pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimatorPage;