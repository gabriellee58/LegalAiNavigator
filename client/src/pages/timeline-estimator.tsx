import React from 'react';
import TimelineEstimator from '../components/timeline-estimator/TimelineEstimator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const TimelineEstimatorPage: React.FC = () => {
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
            Procedural Timeline Estimator
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Get an estimated timeline for your legal procedure based on Canadian court statistics and your specific case details.
          </p>
        </div>
      </div>
      
      <TimelineEstimator />
      
      <div className="mt-12 max-w-2xl mx-auto border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            The Procedural Timeline Estimator helps you understand approximately how long your legal 
            procedure may take based on historical court data and the specifics of your case.
          </p>
          <p>
            <strong className="text-foreground">How it works:</strong> By analyzing information about your 
            legal matter, the complexity of your case, and the jurisdiction, our system provides an estimated 
            timeline with major procedural milestones.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Get estimated duration for each phase of your legal procedure</li>
            <li>See important milestones and deadlines</li>
            <li>Plan your legal strategy with a better understanding of timing</li>
            <li>Prepare for court appearances and document submissions</li>
          </ul>
          <p>
            <strong className="text-foreground">Please note:</strong> These timelines are estimates 
            based on average case duration data. Actual timelines can vary significantly based on 
            court backlogs, case complexity, and many other factors not captured in this simple estimator.
            Always consult with a legal professional for more specific timing information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimelineEstimatorPage;