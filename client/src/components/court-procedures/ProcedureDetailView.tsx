import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  ListChecks,
  ChevronLeft
} from 'lucide-react';
import { VerticalFlowChart } from './FlowChart';
import HorizontalFlowChart, { BranchingFlowChart } from './HorizontalFlowChart';
// import { useTranslation } from 'react-i18next';
// Temporarily implementing translation function in-place
const useTranslation = () => {
  return {
    t: (key: string, options?: any) => {
      // Basic translation mapping
      const translations: Record<string, string> = {
        'courtProcedures.backToProcedures': 'Back to Procedures',
        'courtProcedures.procedureFlow': 'Procedure Flow',
        'courtProcedures.verticalView': 'Vertical',
        'courtProcedures.horizontalView': 'Horizontal',
        'courtProcedures.branchingView': 'Branching',
        'courtProcedures.flowchartDescription': 'Visualize the steps of this court procedure in different formats.',
        'courtProcedures.stepDescription': `Step ${options?.order || ''} of ${options?.total || ''}`,
        'courtProcedures.description': 'Description',
        'courtProcedures.requirements': 'Requirements',
        'courtProcedures.estimatedTime': 'Estimated Time',
        'courtProcedures.forms': 'Forms',
        'courtProcedures.resources': 'Resources',
        'courtProcedures.noForms': 'No forms required for this step.',
        'courtProcedures.noResources': 'No additional resources for this step.',
        'courtProcedures.procedureInfo': 'Procedure Information',
        'courtProcedures.timeframe': 'Timeframe',
        'courtProcedures.courtFees': 'Court Fees',
        'courtProcedures.applicableLaws': 'Applicable Laws',
        'courtProcedures.source': 'Source',
        'courtProcedures.officialSource': 'Official Source',
        'courtProcedures.startProcedure': 'Start Procedure',
        'courtProcedures.relatedForms': 'Related Forms',
        'courtProcedures.noRelatedForms': 'No related forms found for this procedure.'
      };
      
      return translations[key] || key;
    }
  };
};

interface ProcedureStep {
  id: number;
  procedureId: number;
  order: number;
  title: string;
  description: string;
  estimatedTimeframe?: string;
  requirements?: string[];
  formLinks?: Array<{ title: string, url: string }>;
  resourceLinks?: Array<{ title: string, url: string }>;
  isRequired: boolean;
}

interface ProcedureDetail {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  complexity: string;
  jurisdiction: string;
  applicableLaws?: string[];
  estimatedTimeframes: string;
  courtFees: string;
  requirements: string[];
  sourceName?: string;
  sourceUrl?: string;
  relatedForms?: Array<{ title: string, url: string }>;
  steps: ProcedureStep[];
  isActive: boolean;
}

interface ProcedureDetailViewProps {
  procedure: ProcedureDetail;
  onBack: () => void;
  onStartProcedure?: () => void;
}

const ProcedureDetailView: React.FC<ProcedureDetailViewProps> = ({
  procedure,
  onBack,
  onStartProcedure
}) => {
  const { t } = useTranslation();
  const [selectedStepId, setSelectedStepId] = useState<number | null>(
    procedure.steps.length > 0 ? procedure.steps[0].id : null
  );
  const [flowchartType, setFlowchartType] = useState<'vertical' | 'horizontal' | 'branching'>('vertical');

  // Convert procedure steps to flowchart nodes
  const flowchartNodes = procedure.steps.map(step => ({
    id: step.id.toString(),
    label: step.title,
    description: step.description.substring(0, 60) + (step.description.length > 60 ? '...' : ''),
    status: 'pending' as 'pending' | 'completed' | 'current' | 'optional',
    type: step.order === 1 ? 'start' as const : 
           step.order === procedure.steps.length ? 'end' as const :
           !step.isRequired ? 'process' as const : 'process' as const
  }));

  // Create simple connections between steps
  const flowchartConnections = procedure.steps.slice(0, -1).map((step, index) => ({
    fromId: step.id.toString(),
    toId: procedure.steps[index + 1].id.toString(),
    direction: 'horizontal' as 'horizontal' | 'vertical'
  }));

  const selectedStep = procedure.steps.find(step => step.id === selectedStepId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-1">
          <ChevronLeft size={16} />
          {t('courtProcedures.backToProcedures')}
        </Button>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10">
            {procedure.jurisdiction}
          </Badge>
          <Badge variant="outline" className="bg-secondary/10">
            {procedure.complexity}
          </Badge>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{procedure.title}</h1>
        <p className="text-muted-foreground">{procedure.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-8 space-y-6">
          {/* Flowchart section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('courtProcedures.procedureFlow')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={flowchartType === 'vertical' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFlowchartType('vertical')}
                  >
                    {t('courtProcedures.verticalView')}
                  </Button>
                  <Button 
                    variant={flowchartType === 'horizontal' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFlowchartType('horizontal')}
                  >
                    {t('courtProcedures.horizontalView')}
                  </Button>
                  <Button 
                    variant={flowchartType === 'branching' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFlowchartType('branching')}
                  >
                    {t('courtProcedures.branchingView')}
                  </Button>
                </div>
              </div>
              <CardDescription>
                {t('courtProcedures.flowchartDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                {flowchartType === 'vertical' && (
                  <VerticalFlowChart 
                    nodes={flowchartNodes} 
                    connections={flowchartConnections}
                    currentNodeId={selectedStepId?.toString()}
                    onNodeClick={(nodeId) => setSelectedStepId(parseInt(nodeId))}
                  />
                )}
                {flowchartType === 'horizontal' && (
                  <HorizontalFlowChart 
                    nodes={flowchartNodes} 
                    connections={flowchartConnections}
                    currentNodeId={selectedStepId?.toString()}
                    onNodeClick={(nodeId) => setSelectedStepId(parseInt(nodeId))}
                  />
                )}
                {flowchartType === 'branching' && (
                  <BranchingFlowChart 
                    nodes={flowchartNodes} 
                    connections={flowchartConnections}
                    currentNodeId={selectedStepId?.toString()}
                    onNodeClick={(nodeId) => setSelectedStepId(parseInt(nodeId))}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step details */}
          {selectedStep && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedStep.title}</CardTitle>
                <CardDescription>
                  {t('courtProcedures.stepDescription', { order: selectedStep.order, total: procedure.steps.length })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">{t('courtProcedures.description')}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStep.description}</p>
                </div>

                {selectedStep.requirements && selectedStep.requirements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ListChecks size={16} />
                      {t('courtProcedures.requirements')}
                    </h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {selectedStep.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStep.estimatedTimeframe && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock size={16} />
                      {t('courtProcedures.estimatedTime')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedStep.estimatedTimeframe}</p>
                  </div>
                )}

                {/* Forms and Resources */}
                <Tabs defaultValue="forms">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="forms">{t('courtProcedures.forms')}</TabsTrigger>
                    <TabsTrigger value="resources">{t('courtProcedures.resources')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="forms" className="pt-4">
                    {selectedStep.formLinks && selectedStep.formLinks.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedStep.formLinks.map((form, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <FileText size={16} className="text-muted-foreground" />
                            <a 
                              href={form.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {form.title}
                              <ExternalLink size={12} />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('courtProcedures.noForms')}</p>
                    )}
                  </TabsContent>
                  <TabsContent value="resources" className="pt-4">
                    {selectedStep.resourceLinks && selectedStep.resourceLinks.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedStep.resourceLinks.map((resource, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <LinkIcon size={16} className="text-muted-foreground" />
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {resource.title}
                              <ExternalLink size={12} />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('courtProcedures.noResources')}</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - right side */}
        <div className="lg:col-span-4 space-y-6">
          {/* Procedure Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('courtProcedures.procedureInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <Calendar size={16} />
                  {t('courtProcedures.timeframe')}
                </h3>
                <p className="text-sm text-muted-foreground">{procedure.estimatedTimeframes}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <DollarSign size={16} />
                  {t('courtProcedures.courtFees')}
                </h3>
                <p className="text-sm text-muted-foreground">{procedure.courtFees}</p>
              </div>
              
              {procedure.applicableLaws && procedure.applicableLaws.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    {t('courtProcedures.applicableLaws')}
                  </h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {procedure.applicableLaws.map((law, index) => (
                      <li key={index}>{law}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {procedure.sourceUrl && (
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    {t('courtProcedures.source')}
                  </h3>
                  <a 
                    href={procedure.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {procedure.sourceName || t('courtProcedures.officialSource')}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={onStartProcedure}
              >
                {t('courtProcedures.startProcedure')}
              </Button>
            </CardFooter>
          </Card>

          {/* Related Forms */}
          <Card>
            <CardHeader>
              <CardTitle>{t('courtProcedures.relatedForms')}</CardTitle>
            </CardHeader>
            <CardContent>
              {procedure.relatedForms && procedure.relatedForms.length > 0 ? (
                <ul className="space-y-3">
                  {procedure.relatedForms.map((form, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FileText size={16} className="text-muted-foreground mt-0.5" />
                      <a 
                        href={form.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {form.title}
                        <ExternalLink size={12} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t('courtProcedures.noRelatedForms')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProcedureDetailView;