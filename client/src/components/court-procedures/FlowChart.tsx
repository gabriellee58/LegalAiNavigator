import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowDown, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlowChartNode {
  id: string;
  label: string;
  description?: string;
  status?: 'completed' | 'current' | 'pending' | 'optional';
  type?: 'start' | 'end' | 'decision' | 'process' | 'document';
}

export interface FlowChartConnection {
  fromId: string;
  toId: string;
  label?: string;
  direction?: 'horizontal' | 'vertical';
}

interface FlowChartProps {
  nodes: FlowChartNode[];
  connections: FlowChartConnection[];
  currentNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
}

const FlowChart: React.FC<FlowChartProps> = ({
  nodes,
  connections,
  currentNodeId,
  onNodeClick
}) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Circle className="h-5 w-5 text-blue-500 fill-blue-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'optional':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getNodeTypeClass = (type?: string) => {
    switch (type) {
      case 'start':
        return 'border-green-500 border-2';
      case 'end':
        return 'border-red-500 border-2';
      case 'decision':
        return 'border-amber-500 border-2 rounded-xl';
      case 'document':
        return 'border-blue-500 border-2';
      default:
        return '';
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-950 rounded-lg overflow-auto max-w-full">
      <div className="flowchart-container relative min-w-[700px] min-h-[400px]">
        {/* Render nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={cn(
              "flowchart-node absolute p-4 bg-white dark:bg-slate-900 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg",
              getNodeTypeClass(node.type),
              currentNodeId === node.id ? 'ring-2 ring-primary' : ''
            )}
            style={{
              // Position will be set via CSS or inline styles
              // For now, we'll just stack them
              position: 'relative',
              margin: '1rem 0',
              width: '200px',
            }}
            onClick={() => onNodeClick && onNodeClick(node.id)}
          >
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(node.status)}
              <h3 className="font-medium text-sm">{node.label}</h3>
            </div>
            {node.description && (
              <p className="text-xs text-muted-foreground">{node.description}</p>
            )}
          </div>
        ))}

        {/* In a real implementation, we would render SVG connections between nodes */}
        {/* This is a simplified representation */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Note: This is a simplified flowchart representation. Arrows between steps indicate process flow.
        </div>
      </div>
    </div>
  );
};

// A more visual flowchart layout with vertical steps
export const VerticalFlowChart: React.FC<FlowChartProps> = ({
  nodes,
  connections,
  currentNodeId,
  onNodeClick
}) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-950 rounded-lg overflow-auto max-w-full">
      <div className="flex flex-col items-center gap-4 pb-6">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <Card 
              className={cn(
                "w-full max-w-md cursor-pointer transition-all hover:shadow-md",
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
                      <p className="text-xs text-muted-foreground">{node.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Add arrow connector if not the last node */}
            {index < nodes.length - 1 && (
              <ArrowDown className="h-6 w-6 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FlowChart;