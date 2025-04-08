import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

type FeedbackStatus = "new" | "reviewed" | "addressed" | "closed";

interface Feedback {
  id: number;
  userId: number | null;
  type: string;
  contextType: string;
  contextId: number | null;
  contextTitle: string | null;
  rating: number | null;
  content: string;
  status: FeedbackStatus;
  response: string | null;
  createdAt: string;
  updatedAt: string | null;
  respondedAt: string | null;
}

function getStatusColor(status: FeedbackStatus): string {
  switch (status) {
    case "new":
      return "bg-yellow-500";
    case "reviewed":
      return "bg-blue-500";
    case "addressed":
      return "bg-green-500";
    case "closed":
      return "bg-gray-500";
    default:
      return "bg-gray-300";
  }
}

function getTypeIcon(type: string): React.ReactNode {
  switch (type) {
    case "rating":
      return "⭐";
    case "suggestion":
      return "💡";
    case "question":
      return "❓";
    default:
      return "📝";
  }
}

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedbackStatus>("new");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // If user is not an admin, redirect to home
  if (!user || !(user as any).isAdmin) {
    return <Redirect to="/" />;
  }

  // Fetch feedback data based on active tab
  const { data: feedbackList, isLoading } = useQuery({
    queryKey: ["/api/feedback", activeTab],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/feedback?status=${activeTab}`);
      return await response.json();
    },
  });

  // Update feedback status mutation
  const updateFeedbackMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      response,
    }: {
      id: number;
      status: FeedbackStatus;
      response?: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/feedback/${id}`, {
        status,
        response,
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate feedback queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Feedback updated",
        description: "The feedback has been updated successfully",
      });
      // Close dialog and reset state
      setIsDialogOpen(false);
      setSelectedFeedback(null);
      setResponseText("");
    },
    onError: (error: Error) => {
      console.error("Error updating feedback:", error);
      toast({
        title: "Error updating feedback",
        description: "There was an error updating the feedback",
        variant: "destructive",
      });
    },
  });

  const handleOpenFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || "");
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (status: FeedbackStatus) => {
    if (!selectedFeedback) return;

    updateFeedbackMutation.mutate({
      id: selectedFeedback.id,
      status,
      response: responseText,
    });
  };

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Feedback Management</h1>
      <p className="text-gray-500 mb-6">
        Review and respond to user feedback and suggestions.
      </p>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedbackStatus)}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="reviewed">In Review</TabsTrigger>
          <TabsTrigger value="addressed">Addressed</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        {["new", "reviewed", "addressed", "closed"].map((status) => (
          <TabsContent key={status} value={status} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>
                  {status.charAt(0).toUpperCase() + status.slice(1)} Feedback
                </CardTitle>
                <CardDescription>
                  {status === "new"
                    ? "Recently submitted feedback waiting for review"
                    : status === "reviewed"
                    ? "Feedback that has been reviewed but not yet addressed"
                    : status === "addressed"
                    ? "Feedback that has been addressed with a response"
                    : "Feedback that has been closed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : feedbackList && feedbackList.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Context</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbackList.map((feedback: Feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-xl mr-2">
                                {getTypeIcon(feedback.type)}
                              </span>
                              <span className="capitalize">{feedback.type}</span>
                              {feedback.rating ? (
                                <span className="ml-2">({feedback.rating}⭐)</span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge>{feedback.contextType}</Badge>
                            {feedback.contextTitle ? (
                              <div className="text-sm text-gray-500 mt-1">
                                {feedback.contextTitle}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {feedback.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {feedback.createdAt
                                ? formatDistanceToNow(new Date(feedback.createdAt), {
                                    addSuffix: true,
                                  })
                                : "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleOpenFeedback(feedback)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    No {status} feedback available.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Feedback detail dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <span className="text-xl mr-2">
                    {getTypeIcon(selectedFeedback.type)}
                  </span>
                  <span className="capitalize">{selectedFeedback.type} Feedback</span>
                  <Badge
                    className={`ml-4 ${getStatusColor(selectedFeedback.status)}`}
                  >
                    {selectedFeedback.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Feedback ID: #{selectedFeedback.id} | Submitted:{" "}
                  {selectedFeedback.createdAt
                    ? new Date(selectedFeedback.createdAt).toLocaleString()
                    : "Unknown"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 my-4">
                <div>
                  <h3 className="text-lg font-medium">Context</h3>
                  <div className="mt-2">
                    <Badge>{selectedFeedback.contextType}</Badge>
                    {selectedFeedback.contextTitle && (
                      <p className="text-sm mt-1">{selectedFeedback.contextTitle}</p>
                    )}
                    {selectedFeedback.contextId && (
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {selectedFeedback.contextId}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">User's Message</h3>
                  <p className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedFeedback.content}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Your Response</h3>
                  <Textarea
                    className="mt-2"
                    placeholder="Enter your response to the user's feedback..."
                    rows={5}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {selectedFeedback.status !== "closed" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus("closed")}
                    >
                      Close
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  {selectedFeedback.status === "new" && (
                    <Button onClick={() => handleUpdateStatus("reviewed")}>
                      Mark as Reviewed
                    </Button>
                  )}
                  {(selectedFeedback.status === "new" ||
                    selectedFeedback.status === "reviewed") && (
                    <Button
                      onClick={() => handleUpdateStatus("addressed")}
                      disabled={!responseText.trim()}
                    >
                      Address with Response
                    </Button>
                  )}
                  {selectedFeedback.status === "addressed" && (
                    <Button
                      onClick={() => handleUpdateStatus("addressed")}
                      disabled={!responseText.trim()}
                    >
                      Update Response
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}