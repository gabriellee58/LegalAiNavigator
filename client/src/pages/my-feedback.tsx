import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoveLeft, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Link, Redirect } from "wouter";

interface Feedback {
  id: number;
  type: string;
  contextType: string;
  contextId: number | null;
  contextTitle: string | null;
  rating: number | null;
  content: string;
  status: string;
  response: string | null;
  createdAt: string;
  respondedAt: string | null;
}

function getStatusBadgeColor(status: string): string {
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

export default function MyFeedbackPage() {
  const { user } = useAuth();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // If user is not logged in, redirect to login
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Fetch user's feedback
  const { data: feedbackList, isLoading } = useQuery({
    queryKey: ["/api/my-feedback"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/my-feedback");
      return await response.json();
    },
  });

  const handleOpenFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDialogOpen(true);
  };

  // Filter feedback by type if a specific tab is selected
  const filteredFeedback = feedbackList
    ? activeTab === "all"
      ? feedbackList
      : feedbackList.filter((feedback: Feedback) => feedback.type === activeTab)
    : [];

  const renderStarRating = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex space-x-1 mt-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-5 w-5 ${
              value <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mr-4">
            <MoveLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">My Feedback</h1>
      </div>
      <p className="text-gray-500 mb-6">
        Review your feedback and suggestions submitted to our platform.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto mb-6">
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="rating">Ratings</TabsTrigger>
          <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
          <TabsTrigger value="question">Questions</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Your Feedback</CardTitle>
            <CardDescription>
              Track the status and responses to your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredFeedback && filteredFeedback.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((feedback: Feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{getTypeIcon(feedback.type)}</span>
                          <span className="capitalize">{feedback.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{feedback.contextType}</Badge>
                        {feedback.contextTitle ? (
                          <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {feedback.contextTitle}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(feedback.status)}>
                          {feedback.status}
                        </Badge>
                        {feedback.response && (
                          <div className="text-xs text-green-600 mt-1">Has response</div>
                        )}
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
                          variant="outline"
                          onClick={() => handleOpenFeedback(feedback)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-gray-500">
                You haven't submitted any{" "}
                {activeTab !== "all" ? activeTab + " " : ""}
                feedback yet.
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Feedback detail dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <span className="text-xl mr-2">
                    {getTypeIcon(selectedFeedback.type)}
                  </span>
                  <span className="capitalize">{selectedFeedback.type} Details</span>
                  <Badge
                    className={`ml-4 ${getStatusBadgeColor(selectedFeedback.status)}`}
                  >
                    {selectedFeedback.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Submitted:{" "}
                  {selectedFeedback.createdAt
                    ? new Date(selectedFeedback.createdAt).toLocaleString()
                    : "Unknown"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div>
                  <h3 className="text-lg font-medium">Context</h3>
                  <div className="mt-2">
                    <Badge>{selectedFeedback.contextType}</Badge>
                    {selectedFeedback.contextTitle && (
                      <p className="text-sm mt-1">{selectedFeedback.contextTitle}</p>
                    )}
                  </div>
                </div>

                {selectedFeedback.rating && (
                  <div>
                    <h3 className="text-lg font-medium">Your Rating</h3>
                    {renderStarRating(selectedFeedback.rating)}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium">Your Message</h3>
                  <p className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedFeedback.content}
                  </p>
                </div>

                {selectedFeedback.response && (
                  <div>
                    <h3 className="text-lg font-medium">Response</h3>
                    <div className="mt-2 p-4 bg-primary/10 rounded-md whitespace-pre-wrap">
                      {selectedFeedback.response}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Responded:{" "}
                      {selectedFeedback.respondedAt
                        ? new Date(selectedFeedback.respondedAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}