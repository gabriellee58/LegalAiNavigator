import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Auto-resize textarea (max 150px height)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
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
    // Skip handling if using IME (for languages like Chinese, Japanese, Korean)
    if (isComposing) return;
    
    // Submit on Enter (but not with Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Handle IME composition for languages like Chinese, Japanese, Korean
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);

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
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            aria-label={t("message_aria_label")}
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 bottom-2 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  aria-label={t("upload_document")}
                >
                  <span className="material-icons text-sm">attach_file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t("upload_document")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="ml-2 bg-primary hover:bg-primary-dark text-white rounded-full w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={isLoading ? t("sending_message") : t("send_message")}
              >
                {isLoading ? (
                  <span className="animate-spin material-icons text-sm">sync</span>
                ) : (
                  <span className="material-icons text-sm">send</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{t("send_message")}</p>
              {!isMobile && <p className="text-xs opacity-70">{t("enter_to_send")}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
      
      <div className="flex justify-between items-center text-xs text-neutral-500 mt-2 px-1">
        <div>
          <span>{t("powered_by")} </span>
          <span className="font-medium">LegalAI</span>
        </div>
        <div className="flex items-center">
          <span className="material-icons text-xs mr-1">verified</span>
          <span>{t("canadian_law")}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
