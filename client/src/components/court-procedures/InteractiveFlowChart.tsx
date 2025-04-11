import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { FlowChartNode, FlowChartConnection } from './FlowChart';

export interface InteractiveFlowChartProps {
  nodes: FlowChartNode[];
  connections: FlowChartConnection[];
  currentNodeId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  layout?: 'vertical' | 'horizontal' | 'branching';
  className?: string;
}

export const InteractiveFlowChart: React.FC<InteractiveFlowChartProps> = ({
  nodes,
  connections,
  currentNodeId,
  onNodeClick,
  layout = 'vertical',
  className
}) => {
  // State for interactivity
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<FlowChartNode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isHighContrastMode, setIsHighContrastMode] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset position when layout changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  }, [layout]);

  // Handle zooming
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return; // Only single touch
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Accessibility helpers
  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>, nodeId: string) => {
    const currentIndex = nodes.findIndex(node => node.id === nodeId);
    if (currentIndex === -1) return;

    // Handle arrow key navigation between nodes
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < nodes.length - 1) {
          onNodeClick?.(nodes[currentIndex + 1].id);
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          onNodeClick?.(nodes[currentIndex - 1].id);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelectedNode(nodes[currentIndex]);
        setIsDialogOpen(true);
        break;
    }
  };

  const handleNodeClick = (node: FlowChartNode) => {
    if (onNodeClick) onNodeClick(node.id);
    setSelectedNode(node);
  };

  // Helper functions for node styling
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Completed" />;
      case 'current':
        return <Circle className="h-5 w-5 text-blue-500 fill-blue-500" aria-label="Current" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" aria-label="Pending" />;
      case 'optional':
        return <AlertCircle className="h-5 w-5 text-amber-500" aria-label="Optional" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" aria-label="Pending" />;
    }
  };

  const getNodeTypeClass = (type?: string, isHighContrast?: boolean) => {
    if (isHighContrast) {
      switch (type) {
        case 'start':
          return 'border-4 border-black dark:border-white';
        case 'end':
          return 'border-4 border-black dark:border-white border-dashed';
        case 'decision':
          return 'border-4 border-black dark:border-white border-dotted';
        case 'document':
          return 'border-4 border-black dark:border-white';
        default:
          return 'border-2 border-black dark:border-white';
      }
    }
    
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

  const getStatusClass = (status?: string, isHighContrast?: boolean) => {
    if (isHighContrast) {
      switch (status) {
        case 'completed':
          return 'bg-black dark:bg-white text-white dark:text-black';
        case 'current':
          return 'bg-pattern-stripe border-4 border-black dark:border-white';
        case 'optional':
          return 'border-4 border-dashed border-black dark:border-white';
        default:
          return '';
      }
    }
    
    switch (status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-950/20';
      case 'current':
        return 'bg-blue-50 dark:bg-blue-950/20';
      case 'optional':
        return 'bg-amber-50 dark:bg-amber-950/20';
      default:
        return '';
    }
  };

  // Render the flowchart based on layout
  const renderFlowchart = () => {
    switch (layout) {
      case 'horizontal':
        return (
          <div className="flex flex-row items-center gap-4 pb-6 min-w-max">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className={cn(
                          "w-60 min-w-60 cursor-pointer transition-all hover:shadow-md",
                          currentNodeId === node.id ? 'ring-2 ring-primary' : '',
                          getNodeTypeClass(node.type, isHighContrastMode),
                          getStatusClass(node.status, isHighContrastMode)
                        )}
                        onClick={() => handleNodeClick(node)}
                        onKeyDown={(e) => handleKeyNav(e, node.id)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={currentNodeId === node.id}
                        aria-label={`Step ${index + 1}: ${node.label} (${node.status || 'pending'})`}
                      >
                        <CardContent className="pt-4 pb-3 px-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0">
                              {getStatusIcon(node.status)}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm mb-1">{node.label}</h3>
                              {node.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{node.description}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode(node);
                                setIsDialogOpen(true);
                              }}
                              aria-label="View details"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{node.label}</p>
                      {node.status && <p>Status: {node.status}</p>}
                      <p>Click for more details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Add arrow connector if not the last node */}
                {index < nodes.length - 1 && (
                  <ArrowRight className={cn(
                    "h-6 w-6 flex-shrink-0",
                    isHighContrastMode ? "text-black dark:text-white" : "text-gray-400"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        );
        
      case 'branching':
        return (
          <div className="relative min-h-[400px] min-w-[800px]">
            {/* Main path (simplified) */}
            <div className="flex flex-row items-center gap-4 pb-6 absolute top-0 left-0">
              {nodes.slice(0, Math.ceil(nodes.length / 2)).map((node, index) => (
                <React.Fragment key={node.id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card 
                          className={cn(
                            "w-48 cursor-pointer transition-all hover:shadow-md",
                            currentNodeId === node.id ? 'ring-2 ring-primary' : '',
                            getNodeTypeClass(node.type, isHighContrastMode),
                            getStatusClass(node.status, isHighContrastMode)
                          )}
                          onClick={() => handleNodeClick(node)}
                          onKeyDown={(e) => handleKeyNav(e, node.id)}
                          tabIndex={0}
                          role="button"
                          aria-pressed={currentNodeId === node.id}
                          aria-label={`Step ${index + 1}: ${node.label} (${node.status || 'pending'})`}
                        >
                          <CardContent className="pt-3 pb-2 px-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-1 flex-shrink-0">
                                {getStatusIcon(node.status)}
                              </div>
                              <div>
                                <h3 className="font-medium text-xs mb-1">{node.label}</h3>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNode(node);
                                  setIsDialogOpen(true);
                                }}
                                aria-label="View details"
                              >
                                <Info className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{node.label}</p>
                        {node.status && <p>Status: {node.status}</p>}
                        <p>Click for more details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Add arrow connector if not the last node */}
                  {index < Math.ceil(nodes.length / 2) - 1 && (
                    <ArrowRight className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isHighContrastMode ? "text-black dark:text-white" : "text-gray-400"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Branch path */}
            <div className="flex flex-row items-center gap-4 pb-6 absolute top-32 left-48">
              <div className={cn(
                "h-24 w-px absolute -top-24 left-6",
                isHighContrastMode ? "bg-black dark:bg-white" : "bg-gray-300"
              )}></div>
              <ArrowRight className={cn(
                "h-5 w-5 flex-shrink-0 -rotate-90 absolute -top-6 left-4",
                isHighContrastMode ? "text-black dark:text-white" : "text-gray-400"
              )} />
              
              {nodes.slice(Math.ceil(nodes.length / 2)).map((node, index) => (
                <React.Fragment key={node.id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card 
                          className={cn(
                            "w-48 cursor-pointer transition-all hover:shadow-md",
                            currentNodeId === node.id ? 'ring-2 ring-primary' : '',
                            getNodeTypeClass(node.type, isHighContrastMode),
                            getStatusClass(node.status, isHighContrastMode)
                          )}
                          onClick={() => handleNodeClick(node)}
                          onKeyDown={(e) => handleKeyNav(e, node.id)}
                          tabIndex={0}
                          role="button"
                          aria-pressed={currentNodeId === node.id}
                          aria-label={`Step ${Math.ceil(nodes.length / 2) + index + 1}: ${node.label} (${node.status || 'pending'})`}
                        >
                          <CardContent className="pt-3 pb-2 px-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-1 flex-shrink-0">
                                {getStatusIcon(node.status)}
                              </div>
                              <div>
                                <h3 className="font-medium text-xs mb-1">{node.label}</h3>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNode(node);
                                  setIsDialogOpen(true);
                                }}
                                aria-label="View details"
                              >
                                <Info className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{node.label}</p>
                        {node.status && <p>Status: {node.status}</p>}
                        <p>Click for more details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Add arrow connector if not the last node */}
                  {index < nodes.slice(Math.ceil(nodes.length / 2)).length - 1 && (
                    <ArrowRight className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isHighContrastMode ? "text-black dark:text-white" : "text-gray-400"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      
      default: // vertical
        return (
          <div className="flex flex-col items-center gap-4 pb-6">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className={cn(
                          "w-full max-w-md cursor-pointer transition-all hover:shadow-md",
                          currentNodeId === node.id ? 'ring-2 ring-primary' : '',
                          getNodeTypeClass(node.type, isHighContrastMode),
                          getStatusClass(node.status, isHighContrastMode)
                        )}
                        onClick={() => handleNodeClick(node)}
                        onKeyDown={(e) => handleKeyNav(e, node.id)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={currentNodeId === node.id}
                        aria-label={`Step ${index + 1}: ${node.label} (${node.status || 'pending'})`}
                      >
                        <CardContent className="pt-4 pb-3 px-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0">
                              {getStatusIcon(node.status)}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm mb-1">{node.label}</h3>
                              {node.description && (
                                <p className="text-xs text-muted-foreground">{node.description}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode(node);
                                setIsDialogOpen(true);
                              }}
                              aria-label="View details"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{node.label}</p>
                      {node.status && <p>Status: {node.status}</p>}
                      <p>Click for more details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Add arrow connector if not the last node */}
                {index < nodes.length - 1 && (
                  <ArrowDown className={cn(
                    "h-6 w-6",
                    isHighContrastMode ? "text-black dark:text-white" : "text-gray-400"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={cn("p-4 bg-white dark:bg-slate-950 rounded-lg overflow-hidden", className)}>
      {/* Control bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            aria-label="Reset view"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant={isHighContrastMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsHighContrastMode(!isHighContrastMode)}
          aria-label={isHighContrastMode ? "Disable high contrast mode" : "Enable high contrast mode"}
        >
          High Contrast Mode
        </Button>
      </div>

      {/* Flowchart container with zoom and pan */}
      <div 
        className="overflow-auto max-h-[600px] max-w-full relative border rounded-lg"
        style={{ 
          touchAction: 'none' // Disable browser touch actions for mobile
        }}
      >
        <div
          ref={containerRef}
          className={cn(
            "p-4 min-w-full min-h-[300px] cursor-grab transition-transform",
            isDragging && "cursor-grabbing"
          )}
          style={{
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          role="presentation"
        >
          {renderFlowchart()}
        </div>
      </div>

      {/* Node detail dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedNode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedNode.status)}
                  {selectedNode.label}
                </DialogTitle>
                <DialogDescription>
                  {selectedNode.type && (
                    <span className="inline-block px-2 py-1 bg-muted rounded-full text-xs mb-2">
                      {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                {selectedNode.description && (
                  <p className="text-sm mb-4">
                    {selectedNode.description}
                  </p>
                )}
                
                {/* Here you can add more detailed information about the step */}
                <div className="flex justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    {selectedNode.status === 'completed' ? 'This step is completed' : 
                     selectedNode.status === 'current' ? 'This is your current step' :
                     selectedNode.status === 'optional' ? 'This step is optional' :
                     'This step is pending'}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Accessibility note */}
      <p className="mt-4 text-xs text-muted-foreground">
        <span className="sr-only">Accessibility information: </span>
        Use arrow keys to navigate, Enter or Space to view details. Click and drag to pan, zoom controls available above.
      </p>
    </div>
  );
};

export default InteractiveFlowChart;