import { ReactNode } from "react";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string | ReactNode;
  timestamp?: Date;
}

function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex items-start justify-end">
        <div className="mr-3 bg-primary text-white p-3 rounded-lg rounded-tr-none shadow-sm chat-message">
          {typeof content === "string" ? (
            <p>{content}</p>
          ) : (
            content
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden">
          <img
            src="https://randomuser.me/api/portraits/women/43.jpg"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-start">
        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
          <span className="material-icons text-sm">smart_toy</span>
        </div>
        <div className="ml-3 bg-white p-3 rounded-lg rounded-tl-none shadow-sm chat-message">
          {typeof content === "string" ? (
            <p className="text-neutral-800 whitespace-pre-line">{content}</p>
          ) : (
            content
          )}
        </div>
      </div>
    );
  }
}

export function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
        <span className="material-icons text-sm">smart_toy</span>
      </div>
      <div className="ml-3 bg-white p-2 rounded-lg rounded-tl-none shadow-sm typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export default ChatMessage;
