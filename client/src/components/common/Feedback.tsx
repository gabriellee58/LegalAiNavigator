import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbsUp, ThumbsDown, Send, Star, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FeedbackProps {
  contextType: 'general' | 'document' | 'guide' | 'domain' | 'research';
  contextId?: number;
  contextTitle?: string;
  className?: string;
}

export function Feedback({ contextType, contextId, contextTitle, className = '' }: FeedbackProps) {
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('rating');
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleSubmitFeedback = async () => {
    if (!rating && activeFeedbackTab === 'rating') {
      toast({
        title: "Please provide a rating",
        description: "Please select a rating before submitting feedback",
        variant: "destructive"
      });
      return;
    }

    if ((feedback.trim() === '' && activeFeedbackTab === 'rating') || 
        (suggestion.trim() === '' && activeFeedbackTab === 'suggestion') ||
        (question.trim() === '' && activeFeedbackTab === 'question')) {
      toast({
        title: "Empty comment",
        description: "Please provide some details in your feedback",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Determine which content to send based on the active tab
      let content = '';
      let feedbackType = '';
      
      switch (activeFeedbackTab) {
        case 'rating':
          content = feedback;
          feedbackType = 'rating';
          break;
        case 'suggestion':
          content = suggestion;
          feedbackType = 'suggestion';
          break;
        case 'question':
          content = question;
          feedbackType = 'question';
          break;
      }
      
      await apiRequest('POST', '/api/feedback', {
        type: feedbackType,
        contextType,
        contextId,
        contextTitle,
        rating: rating || 0,
        content
      });
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setRating(null);
      setFeedback('');
      setSuggestion('');
      setQuestion('');
      
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">Help us improve</CardTitle>
        <CardDescription>
          Share your thoughts to help us make this tool better
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeFeedbackTab} onValueChange={setActiveFeedbackTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rating">
            <Star className="h-4 w-4 mr-1" /> Rate
          </TabsTrigger>
          <TabsTrigger value="suggestion">
            <ThumbsUp className="h-4 w-4 mr-1" /> Suggest
          </TabsTrigger>
          <TabsTrigger value="question">
            <HelpCircle className="h-4 w-4 mr-1" /> Ask
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rating">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`p-1 rounded-full ${rating === value ? 'text-yellow-500' : 'text-gray-300'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                    onClick={() => handleRatingChange(value)}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <Textarea
              placeholder="Tell us what you think. What worked well? What could be improved?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="suggestion">
          <CardContent className="pt-4">
            <Textarea
              placeholder="Share your ideas for improving this feature or content"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="question">
          <CardContent className="pt-4">
            <Textarea
              placeholder="Ask a question about this feature or content"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter>
        <Button 
          className="ml-auto" 
          onClick={handleSubmitFeedback}
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </CardFooter>
    </Card>
  );
}