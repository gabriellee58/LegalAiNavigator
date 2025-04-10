import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, Eye, Upload as UploadIcon, Plus, Search, File, Clock, 
  CheckCircle, AlertCircle, Filter, X, ExternalLink 
} from 'lucide-react';

// Temp interfaces until we properly migrate them
interface ProcedureStep {
  id: number;
  procedureId: number;
  title: string;
  description: string;
  stepOrder: number;
  estimatedTime?: string;
  requiredDocuments?: string[];
  instructions?: string;
  tips?: string[];
  warnings?: string[];
  fees?: Record<string, string>;
  isOptional: boolean;
  nextStepIds?: number[];
  alternatePathInfo?: string | null;
  sourceReferences?: { name: string; url: string }[];
}

interface RelatedForm {
  id: number;
  name: string;
  description?: string;
  templateId?: number;
  url?: string;
}

interface DocumentManagementProps {
  relatedForms: RelatedForm[];
  procedureSteps: ProcedureStep[];
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({
  relatedForms,
  procedureSteps
}) => {
  const [activeTab, setActiveTab] = useState<string>('required-forms');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedForm, setSelectedForm] = useState<RelatedForm | null>(null);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState<boolean>(false);
  
  // User documents (would typically come from server)
  const [userDocuments, setUserDocuments] = useState<any[]>([
    {
      id: 1,
      name: 'Notice of Civil Claim',
      status: 'completed',
      dateUploaded: '2025-04-08',
      type: 'application/pdf',
      size: '245 KB',
      relatedStepId: 1
    },
    {
      id: 2,
      name: 'Affidavit of Service',
      status: 'draft',
      dateUploaded: '2025-04-09',
      type: 'application/pdf',
      size: '128 KB',
      relatedStepId: 2
    }
  ]);
  
  // Filter forms based on search query
  const filteredForms = relatedForms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Group forms by step
  const formsByStep = procedureSteps.map(step => {
    const requiredDocs = step.requiredDocuments || [];
    const stepForms = relatedForms.filter(form => 
      requiredDocs.some(doc => doc.toLowerCase().includes(form.name.toLowerCase()))
    );
    
    return {
      step,
      forms: stepForms
    };
  }).filter(item => item.forms.length > 0);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      
      // Simulate upload
      setTimeout(() => {
        const file = e.target.files![0];
        
        // Add the new document to the user documents
        const newDocument = {
          id: userDocuments.length + 1,
          name: file.name.split('.')[0],
          status: 'draft',
          dateUploaded: new Date().toISOString().split('T')[0],
          type: file.type,
          size: `${Math.round(file.size / 1024)} KB`,
          relatedStepId: null
        };
        
        setUserDocuments([...userDocuments, newDocument]);
        setUploading(false);
        setFileUploadDialogOpen(false);
      }, 1500);
    }
  };
  
  // Handle form preview
  const handleFormPreview = (form: RelatedForm) => {
    setSelectedForm(form);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document Management
          </CardTitle>
          <CardDescription>
            Manage and track all required documents for your legal procedure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="required-forms" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="required-forms">Required Forms</TabsTrigger>
              <TabsTrigger value="my-documents">My Documents</TabsTrigger>
              <TabsTrigger value="by-step">Forms by Step</TabsTrigger>
            </TabsList>
            
            {/* Required Forms Tab */}
            <TabsContent value="required-forms" className="space-y-4 mt-4">
              <div className="flex justify-between items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search forms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Dialog open={fileUploadDialogOpen} onOpenChange={setFileUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>
                        Upload a completed form or other documentation related to your procedure.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
                        <p className="text-xs text-muted-foreground mb-4">Supports PDF, DOCX, JPG, PNG (max 10MB)</p>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.jpg,.png"
                          onChange={handleFileUpload}
                        />
                        <Label htmlFor="file-upload" asChild>
                          <Button size="sm">Select File</Button>
                        </Label>
                      </div>
                      {uploading && (
                        <div className="text-center">
                          <Clock className="h-4 w-4 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        {searchQuery ? (
                          <p className="text-muted-foreground">
                            No forms matching "{searchQuery}" were found
                          </p>
                        ) : (
                          <p className="text-muted-foreground">No forms available</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredForms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium">{form.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            PDF
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {form.description || "Official court form"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleFormPreview(form)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            {form.url && (
                              <Button size="sm" variant="ghost" asChild>
                                <a 
                                  href={form.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* My Documents Tab */}
            <TabsContent value="my-documents" className="space-y-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                
                <Dialog open={fileUploadDialogOpen} onOpenChange={setFileUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>
                        Upload a completed form or other documentation related to your procedure.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
                        <p className="text-xs text-muted-foreground mb-4">Supports PDF, DOCX, JPG, PNG (max 10MB)</p>
                        <Input
                          id="file-upload-2"
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.jpg,.png"
                          onChange={handleFileUpload}
                        />
                        <Label htmlFor="file-upload-2" asChild>
                          <Button size="sm">Select File</Button>
                        </Label>
                      </div>
                      {uploading && (
                        <div className="text-center">
                          <Clock className="h-4 w-4 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDocuments.map((doc, docIndex) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={doc.status === 'completed' ? 'default' : 'outline'}
                          className="font-normal flex items-center gap-1 w-fit"
                        >
                          {doc.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {doc.dateUploaded}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {doc.size}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {userDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        <p className="text-muted-foreground">
                          You haven't uploaded any documents yet
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* Forms by Step Tab */}
            <TabsContent value="by-step" className="space-y-6 mt-4">
              {formsByStep.map(({ step, forms }) => (
                <Card key={step.id} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Step {step.stepOrder}: {step.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {forms.length} {forms.length === 1 ? 'form' : 'forms'} required
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {forms.map(form => (
                        <li key={form.id} className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span>{form.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
              
              {formsByStep.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No forms available by step</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    There are no forms associated with specific procedure steps.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Form Preview Dialog */}
      <Dialog open={!!selectedForm} onOpenChange={() => setSelectedForm(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedForm?.name}</DialogTitle>
            <DialogDescription>
              {selectedForm?.description || "Official court form preview"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-1">Form Preview</p>
              <p className="text-sm text-muted-foreground mb-6">
                This is a placeholder for the actual form preview.
              </p>
              <div className="flex justify-center gap-2">
                <Button className="gap-1">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                {selectedForm?.url && (
                  <Button variant="outline" asChild>
                    <a 
                      href={selectedForm.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Official Form
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedForm(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement;