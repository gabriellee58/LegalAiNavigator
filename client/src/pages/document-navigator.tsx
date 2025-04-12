import React from 'react';
import DocumentRequirementNavigator from '@/components/document-navigator/DocumentRequirementNavigator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const DocumentNavigatorPage: React.FC = () => {
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
            Document Requirement Navigator
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Our AI assistant will help you identify the exact documents you need for your legal procedure
            based on your specific situation and jurisdiction.
          </p>
        </div>
      </div>
      
      <DocumentRequirementNavigator />
      
      <div className="mt-12 max-w-2xl mx-auto border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            The Document Requirement Navigator uses intelligent logic to determine exactly which documents
            you need for your specific legal procedure. By answering a few simple questions, you'll receive
            a tailored checklist of required and optional documents.
          </p>
          <p>
            <strong className="text-foreground">How it works:</strong> The system analyzes your answers about 
            your legal situation, jurisdiction, and case details to generate a personalized document list
            based on Canadian legal requirements. The AI considers factors like:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Type of legal procedure (civil, family, criminal, etc.)</li>
            <li>Your role in the case (plaintiff, defendant, etc.)</li>
            <li>Provincial/territorial jurisdiction</li>
            <li>Case complexity and specific circumstances</li>
            <li>Evidence types you plan to present</li>
          </ul>
          <p>
            <strong className="text-foreground">Please note:</strong> While our system provides guidance
            based on general requirements, specific courts or cases may have additional or different requirements.
            Always verify the complete document list with the court or a legal professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentNavigatorPage;