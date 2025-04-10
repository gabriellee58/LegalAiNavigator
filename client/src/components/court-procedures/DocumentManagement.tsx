import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Download, Eye, Search, File, CheckCircle2, Edit3, 
  Printer, Share2, HelpCircle, FileQuestion
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RelatedForm, ProcedureStep } from '@/types/court-procedures';

interface DocumentManagementProps {
  relatedForms: RelatedForm[];
  procedureSteps: ProcedureStep[];
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  relatedForms = [],
  procedureSteps = []
}) => {
  const [activeTab, setActiveTab] = useState<string>('forms');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  // Extract all required documents from procedure steps
  const allRequiredDocuments = procedureSteps
    .flatMap(step => step.requiredDocuments || [])
    .filter((doc, index, self) => self.indexOf(doc) === index); // Remove duplicates
  
  // Filter forms based on search query
  const filteredForms = relatedForms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Get selected form
  const selectedForm = relatedForms.find(form => form.id === selectedFormId);
  
  // Get document count by type
  const documentCounts = {
    forms: relatedForms.length,
    required: allRequiredDocuments.length,
    completed: 0, // This would come from user data
    upcoming: 0   // This would be calculated based on user progress
  };
  
  // Find steps with required documents
  const stepsWithDocuments = procedureSteps.filter(
    step => step.requiredDocuments && step.requiredDocuments.length > 0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Document Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search forms and documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <HelpCircle className="h-4 w-4" />
              Form Assistance
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="forms" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="forms" className="text-xs sm:text-sm">
              Forms ({documentCounts.forms})
            </TabsTrigger>
            <TabsTrigger value="required" className="text-xs sm:text-sm">
              Required ({documentCounts.required})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              Completed ({documentCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="steps" className="text-xs sm:text-sm">
              By Step
            </TabsTrigger>
          </TabsList>
          
          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            {filteredForms.length === 0 ? (
              <div className="text-center py-8">
                <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No forms found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery 
                    ? `No forms match "${searchQuery}"`
                    : "There are no forms available for this procedure."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredForms.map(form => (
                  <div key={form.id} className="p-4 border rounded-lg flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <h3 className="font-medium">{form.name}</h3>
                      </div>
                      {form.description && (
                        <p className="text-sm text-muted-foreground mt-1 ml-7">{form.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedFormId(form.id);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedFormId(form.id);
                          // Logic to download would go here
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Required Documents Tab */}
          <TabsContent value="required" className="space-y-4">
            {allRequiredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No required documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This procedure does not have any specifically required documents.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allRequiredDocuments.map((doc, index) => (
                  <div key={index} className="p-4 border rounded-lg flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <File className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">{doc}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">Required</Badge>
                          {/* This would be dynamic based on the form status */}
                          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Pending
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-xs"
                      >
                        <Download className="h-3 w-3" />
                        Download Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="h-3 w-3" />
                        Complete Form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Completed Documents Tab */}
          <TabsContent value="completed" className="space-y-4">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No completed documents</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You haven't completed any documents for this procedure yet.
              </p>
              <Button variant="outline" className="mt-4">
                Start Completing Forms
              </Button>
            </div>
          </TabsContent>
          
          {/* By Step Tab */}
          <TabsContent value="steps" className="space-y-4">
            {stepsWithDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No documents by step</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This procedure doesn't have documents organized by steps.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {stepsWithDocuments.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                        {index + 1}
                      </span>
                      {step.title}
                    </h3>
                    <div className="ml-8 space-y-2">
                      {step.requiredDocuments?.map((doc, docIndex) => (
                        <div key={docIndex} className="flex items-center justify-between p-2 bg-muted/40 rounded">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-primary" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            <Download className="h-3 w-3" />
                            <span className="text-xs">Get Template</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Document Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{selectedForm?.name || 'Document Preview'}</DialogTitle>
            </DialogHeader>
            
            <div className="flex-grow border rounded-md overflow-hidden my-4 bg-muted/30 relative">
              {selectedForm ? (
                <div className="flex items-center justify-center h-full">
                  {/* This would be replaced with an actual document viewer */}
                  <div className="text-center p-8">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-40 mb-4" />
                    <p className="text-muted-foreground">
                      Document preview will be available in the next update.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No document selected.</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
              <Button variant="default" size="sm" onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DocumentManagement;