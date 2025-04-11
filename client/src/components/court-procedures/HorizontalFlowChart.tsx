import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlowChartNode, FlowChartConnection } from './FlowChart';

interface HorizontalFlowChartProps {
  nodes: FlowChartNode[];
  connections: FlowChartConnection[];
  currentNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
}

const HorizontalFlowChart: React.FC<HorizontalFlowChartProps> = ({
  nodes,
  connections,
  currentNodeId,
  onNodeClick
}) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-950 rounded-lg overflow-auto max-w-full">
      <div className="flex flex-row items-center gap-4 pb-6 min-w-max">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <Card 
              className={cn(
                "w-60 min-w-60 cursor-pointer transition-all hover:shadow-md",
                currentNodeId === node.id ? 'ring-2 ring-primary' : '',
                node.type === 'start' ? 'border-green-500' : '',
                node.type === 'end' ? 'border-red-500' : '',
                node.type === 'decision' ? 'border-amber-500' : '',
                node.type === 'document' ? 'border-blue-500' : '',
                node.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20' : '',
                node.status === 'current' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
              )}
              onClick={() => onNodeClick && onNodeClick(node.id)}
            >
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {node.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : node.status === 'current' ? (
                      <Circle className="h-5 w-5 text-blue-500 fill-blue-500" />
                    ) : node.status === 'optional' ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">{node.label}</h3>
                    {node.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{node.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Add arrow connector if not the last node */}
            {index < nodes.length - 1 && (
              <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// A branching flowchart for decision points
export const BranchingFlowChart: React.FC<HorizontalFlowChartProps> = ({
  nodes,
  connections,
  currentNodeId,
  onNodeClick
}) => {
  // For a more complex layout we would compute the positions
  // Here's a simplified representation with main path and one branch
  
  // Identify decision nodes (nodes with multiple outgoing connections)
  const decisionNodesIds = connections
    .reduce((acc, conn) => {
      acc[conn.fromId] = (acc[conn.fromId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const decisionNodes = Object.keys(decisionNodesIds).filter(id => decisionNodesIds[id] > 1);
  
  return (
    <div className="p-4 bg-white dark:bg-slate-950 rounded-lg overflow-auto max-w-full">
      <div className="relative min-h-[400px] min-w-[800px]">
        {/* Main path (simplified) */}
        <div className="flex flex-row items-center gap-4 pb-6 absolute top-0 left-0">
          {nodes.slice(0, Math.ceil(nodes.length / 2)).map((node, index) => (
            <React.Fragment key={node.id}>
              <Card 
                className={cn(
                  "w-48 cursor-pointer transition-all hover:shadow-md",
                  currentNodeId === node.id ? 'ring-2 ring-primary' : '',
                  node.type === 'decision' ? 'border-amber-500' : '',
                  node.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20' : '',
                  node.status === 'current' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                )}
                onClick={() => onNodeClick && onNodeClick(node.id)}
              >
                <CardContent className="pt-3 pb-2 px-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0">
                      {node.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : node.status === 'current' ? (
                        <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-xs mb-1">{node.label}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Add arrow connector if not the last node */}
              {index < Math.ceil(nodes.length / 2) - 1 && (
                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Branch path (simplified) */}
        <div className="flex flex-row items-center gap-4 pb-6 absolute top-32 left-48">
          <div className="h-24 w-px bg-gray-300 absolute -top-24 left-6"></div>
          <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 -rotate-90 absolute -top-6 left-4" />
          
          {nodes.slice(Math.ceil(nodes.length / 2)).map((node, index) => (
            <React.Fragment key={node.id}>
              <Card 
                className={cn(
                  "w-48 cursor-pointer transition-all hover:shadow-md",
                  currentNodeId === node.id ? 'ring-2 ring-primary' : '',
                  node.type === 'end' ? 'border-red-500' : '',
                  node.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20' : '',
                  node.status === 'current' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                )}
                onClick={() => onNodeClick && onNodeClick(node.id)}
              >
                <CardContent className="pt-3 pb-2 px-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0">
                      {node.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : node.status === 'current' ? (
                        <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-xs mb-1">{node.label}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Add arrow connector if not the last node */}
              {index < nodes.slice(Math.ceil(nodes.length / 2)).length - 1 && (
                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalFlowChart;