import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatWidget = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant="gradient"
        size="lg"
        className="rounded-full w-16 h-16 shadow-2xl hover:shadow-primary/50"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">Chat</span>
      </Button>
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
        1
      </div>
    </div>
  );
};

export default ChatWidget;
