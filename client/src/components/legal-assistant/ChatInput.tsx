import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message.trim());
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-white px-4 py-3 md:px-6">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            id="message-input"
            placeholder={t("message_placeholder")}
            className="w-full py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none overflow-hidden"
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none"
          >
            <span className="material-icons">attach_file</span>
          </Button>
        </div>
        <Button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="ml-2 bg-primary hover:bg-primary-dark text-white rounded-full w-10 h-10 flex items-center justify-center focus:outline-none"
        >
          {isLoading ? (
            <span className="animate-spin material-icons">sync</span>
          ) : (
            <span className="material-icons">send</span>
          )}
        </Button>
      </form>
      <div className="flex justify-between text-xs text-neutral-500 mt-2 px-1">
        <span>{t("powered_by")}</span>
        <span>{t("canadian_law")}</span>
      </div>
    </div>
  );
}

export default ChatInput;
