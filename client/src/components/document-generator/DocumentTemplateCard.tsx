import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentTemplate } from "@shared/schema";

interface DocumentTemplateCardProps {
  template: DocumentTemplate;
}

function DocumentTemplateCard({ template }: DocumentTemplateCardProps) {
  // Get template icon based on type
  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return 'assignment';
      case 'lease':
        return 'home';
      case 'will':
        return 'account_balance';
      case 'business':
        return 'business';
      case 'ip':
        return 'copyright';
      default:
        return 'description';
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-md bg-blue-50 text-primary">
            <span className="material-icons">{getTemplateIcon(template.templateType)}</span>
          </div>
          <Badge variant="outline">{template.language === 'en' ? 'English' : 'Français'}</Badge>
        </div>
        <CardTitle className="mt-2">{template.title}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-xs text-neutral-500">
          <div className="flex items-center mb-1">
            <span className="material-icons text-xs mr-1">list</span>
            <span>{template.fields.length} fields to complete</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-xs mr-1">description</span>
            <span>Standard {template.templateType} template</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/document-generator/${template.id}`}>
          <Button className="w-full bg-primary hover:bg-primary-dark">
            <span className="material-icons mr-1 text-sm">edit_document</span> 
            Use Template
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default DocumentTemplateCard;
