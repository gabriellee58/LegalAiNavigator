import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ChatMessage, { TypingIndicator, ChatMessageProps } from "./ChatMessage";
import ChatInput from "./ChatInput";
import { sendChatMessage } from "@/lib/openai";

// Default user ID for demo purposes
const DEMO_USER_ID = 1;

function ChatInterface() {
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/chat/messages", DEMO_USER_ID],
    staleTime: 0, // Always refresh on component mount
  });
  
  // Local state for messages
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  
  // Update local messages when chat history changes
  useEffect(() => {
    if (chatHistory) {
      const formattedMessages = chatHistory.map((message: any) => ({
        role: message.role,
        content: message.content,
        timestamp: new Date(message.timestamp)
      }));
      
      // If no messages, add welcome message
      if (formattedMessages.length === 0) {
        formattedMessages.push({
          role: "assistant",
          content: (
            <>
              <p className="text-neutral-800">{t("welcome_message")}</p>
              <p className="text-neutral-600 text-sm mt-2">{t("topics_title")}</p>
              <ul className="mt-1 text-sm text-neutral-700 space-y-1">
                <li className="flex items-center">
                  <span className="material-icons text-xs mr-1 text-primary">check_circle</span>
                  {t("topic_rental")}
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-xs mr-1 text-primary">check_circle</span>
                  {t("topic_business")}
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-xs mr-1 text-primary">check_circle</span>
                  {t("topic_employment")}
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-xs mr-1 text-primary">check_circle</span>
                  {t("topic_estate")}
                </li>
              </ul>
            </>
          ),
          timestamp: new Date()
        });
      }
      
      setMessages(formattedMessages);
    }
  }, [chatHistory]);
  
  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: (content: string) => sendChatMessage(DEMO_USER_ID, content),
    onMutate: async (content) => {
      // Optimistically update UI
      const newMessage: ChatMessageProps = {
        role: "user",
        content,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, newMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return { newMessage };
    },
    onSuccess: (response) => {
      // Add AI response from server
      const aiMessage: ChatMessageProps = {
        role: "assistant",
        content: response.aiMessage.content,
        timestamp: new Date(response.aiMessage.timestamp)
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Invalidate chat history query
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", DEMO_USER_ID] });
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    onError: () => {
      // Add error message
      const errorMessage: ChatMessageProps = {
        role: "assistant",
        content: "I'm sorry, but there was an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  });
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <h1 className="text-xl md:text-2xl font-heading font-semibold">
          {t("assistant_title")}
        </h1>
        <p className="text-neutral-600 mt-1">
          {t("assistant_subtitle")}
        </p>
      </div>
      
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-y-auto">
        {/* Disclaimer Notice */}
        <Alert className="bg-blue-50 border-l-4 border-primary p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="material-icons text-primary">info</span>
            </div>
            <div className="ml-3">
              <AlertTitle className="text-sm font-medium text-primary">
                {t("disclaimer_title")}
              </AlertTitle>
              <AlertDescription className="text-sm text-neutral-700 mt-1">
                {t("disclaimer_text")}
              </AlertDescription>
            </div>
          </div>
        </Alert>
        
        {/* Chat messages container */}
        <div className="flex-1 space-y-4" ref={chatContainerRef}>
          {isLoadingHistory ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isSending && <TypingIndicator />}
            </>
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <ChatInput onSendMessage={sendMessage} isLoading={isSending} />
    </div>
  );
}

export default ChatInterface;
