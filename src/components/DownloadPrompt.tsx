import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const DownloadPrompt = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem("hasSeenDownloadPrompt");
    
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownload = () => {
    localStorage.setItem("hasSeenDownloadPrompt", "true");
    setOpen(false);
    window.location.href = "/install";
  };

  const handleClose = () => {
    localStorage.setItem("hasSeenDownloadPrompt", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Download Brunson App
          </DialogTitle>
          <DialogDescription>
            Get the best trading experience with our mobile app. Install now for quick access and enhanced features!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleDownload} variant="gradient" size="lg">
            Download Now
          </Button>
          <Button onClick={handleClose} variant="ghost">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadPrompt;
