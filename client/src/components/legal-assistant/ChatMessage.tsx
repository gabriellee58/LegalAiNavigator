import { ReactNode } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string | ReactNode;
  timestamp?: Date;
  isLoading?: boolean;
}

function ChatMessage({ role, content, timestamp, isLoading }: ChatMessageProps) {
  const { user } = useAuth();
  const formattedTime = timestamp ? format(timestamp, 'h:mm a') : '';
  
  if (role === "user") {
    return (
      <div className="flex flex-col items-end space-y-1">
        <div className="flex items-start justify-end">
          <div 
            className={cn(
              "mr-3 bg-primary text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-[85%]",
              "chat-message transition-opacity",
              isLoading && "opacity-70"
            )}
          >
            {typeof content === "string" ? (
              <p className="whitespace-pre-line break-words">{content}</p>
            ) : (
              content
            )}
          </div>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.fullName?.[0] || user?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        {timestamp && (
          <span className="text-xs text-neutral-500 mr-11">{formattedTime}</span>
        )}
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-start">
          <Avatar className="w-8 h-8 bg-primary flex-shrink-0 flex items-center justify-center text-white">
            <AvatarFallback>
              <span className="material-icons text-sm">smart_toy</span>
            </AvatarFallback>
          </Avatar>
          <div 
            className={cn(
              "ml-3 bg-white border border-neutral-100 p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%]",
              "chat-message transition-opacity",
              isLoading && "opacity-70"
            )}
          >
            {typeof content === "string" ? (
              <div className="text-neutral-800 whitespace-pre-line break-words">{content}</div>
            ) : (
              content
            )}
          </div>
        </div>
        {timestamp && (
          <span className="text-xs text-neutral-500 ml-11">{formattedTime}</span>
        )}
      </div>
    );
  }
}

export function TypingIndicator() {
  return (
    <div className="flex flex-col items-start space-y-1">
      <div className="flex items-start">
        <Avatar className="w-8 h-8 bg-primary flex-shrink-0 flex items-center justify-center text-white">
          <AvatarFallback>
            <span className="material-icons text-sm">smart_toy</span>
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 bg-white border border-neutral-100 p-3 rounded-lg rounded-tl-none shadow-sm typing-indicator max-w-[85%]">
          <div className="flex space-x-1">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
