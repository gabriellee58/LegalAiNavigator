import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, Scale, Gavel, Home, Coins, Building } from 'lucide-react';

// Import SVG flowcharts
import civilFlowchart from '@/assets/flowcharts/civil-procedure-flowchart.svg';
import criminalFlowchart from '@/assets/flowcharts/criminal-procedure-flowchart.svg';
import familyCourtFlowchart from '@/assets/flowcharts/family-court-flowchart.svg';
import smallClaimsFlowchart from '@/assets/flowcharts/small-claims-flowchart.svg';
import administrativeFlowchart from '@/assets/flowcharts/administrative-tribunals-flowchart.svg';

interface FlowchartData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  source: string;
}

const flowcharts: FlowchartData[] = [
  {
    id: 'civil',
    title: 'Civil Procedure',
    description: 'The formal process for resolving disputes between individuals or organizations in civil courts',
    icon: <Scale className="h-5 w-5 text-primary" />,
    source: civilFlowchart
  },
  {
    id: 'criminal',
    title: 'Criminal Procedure',
    description: 'The process for handling criminal cases from investigation through trial and sentencing',
    icon: <Gavel className="h-5 w-5 text-primary" />,
    source: criminalFlowchart
  },
  {
    id: 'family',
    title: 'Family Court',
    description: 'The process for resolving family law matters including divorce, custody and support',
    icon: <Home className="h-5 w-5 text-primary" />,
    source: familyCourtFlowchart
  },
  {
    id: 'small-claims',
    title: 'Small Claims Court',
    description: 'The simplified process for resolving minor civil disputes with limited monetary value',
    icon: <Coins className="h-5 w-5 text-primary" />,
    source: smallClaimsFlowchart
  },
  {
    id: 'administrative',
    title: 'Administrative Tribunals',
    description: 'Specialized procedures for resolving disputes related to government agencies and regulations',
    icon: <Building className="h-5 w-5 text-primary" />,
    source: administrativeFlowchart
  }
];

interface ProcedureFlowchartViewProps {
  initialFlowchartId?: string;
}

const ProcedureFlowchartView: React.FC<ProcedureFlowchartViewProps> = ({ 
  initialFlowchartId = 'civil'
}) => {
  const [activeFlowchart, setActiveFlowchart] = useState(initialFlowchartId);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const currentFlowchart = flowcharts.find(f => f.id === activeFlowchart) || flowcharts[0];
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
  };
  
  const handleDownload = () => {
    // Create a download link for the SVG
    const svgBlob = new Blob([currentFlowchart.source], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentFlowchart.id}-procedure-flowchart.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="w-full">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Canadian Court Procedures Flowcharts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeFlowchart} value={activeFlowchart} onValueChange={setActiveFlowchart}>
            <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
              {flowcharts.map(flowchart => (
                <TabsTrigger key={flowchart.id} value={flowchart.id} className="flex items-center gap-2">
                  {flowchart.icon}
                  <span className="hidden md:inline">{flowchart.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="bg-muted/30 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  {currentFlowchart.icon}
                </div>
                <div>
                  <h3 className="font-medium">{currentFlowchart.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentFlowchart.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomOut}
                className="flex items-center gap-1"
              >
                <ZoomOut className="h-4 w-4" />
                <span>Zoom Out</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomIn}
                className="flex items-center gap-1"
              >
                <ZoomIn className="h-4 w-4" />
                <span>Zoom In</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
            
            <div className="overflow-auto max-h-[600px] rounded-lg border bg-white">
              {flowcharts.map(flowchart => (
                <TabsContent key={flowchart.id} value={flowchart.id} className="mt-0">
                  <div 
                    className="flex justify-center p-4 min-h-[500px]"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
                  >
                    <img 
                      src={flowchart.source} 
                      alt={`${flowchart.title} Flowchart`} 
                      className="max-w-full"
                    />
                  </div>
                </TabsContent>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>These flowcharts provide a general overview of Canadian court procedures. Specific details may vary by province and individual case. For legal advice, please consult a qualified legal professional.</p>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcedureFlowchartView;