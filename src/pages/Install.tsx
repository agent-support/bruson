import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Check, Smartphone, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 md:p-8">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-primary flex items-center justify-center">
            <Smartphone className="w-12 h-12 text-white" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Install Brunson</h1>
            <p className="text-muted-foreground">
              Get the full app experience on your device
            </p>
          </div>

          {isInstalled ? (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                <div className="flex items-center gap-3 justify-center text-success">
                  <Check className="w-6 h-6" />
                  <span className="font-semibold">App Already Installed!</span>
                </div>
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                Open App
              </Button>
            </div>
          ) : (
            <>
              {isIOS ? (
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                    <p className="font-semibold text-sm">To install on iOS:</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Tap the <strong>Share</strong> button (square with arrow)</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                      <li>Tap <strong>"Add"</strong> in the top right</li>
                    </ol>
                  </div>
                  <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                    Maybe Later
                  </Button>
                </div>
              ) : deferredPrompt ? (
                <div className="space-y-4">
                  <Button onClick={handleInstall} className="w-full" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Install App
                  </Button>
                  <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                    Maybe Later
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This app can be installed on your device for a better experience.
                      Use your browser's menu to add it to your home screen.
                    </p>
                  </div>
                  <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                    Continue to App
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="pt-6 border-t space-y-3">
            <h3 className="font-semibold text-sm">App Features</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-card/50 rounded-lg">
                <Monitor className="w-5 h-5 mb-2 text-primary" />
                <p className="font-medium">Works Offline</p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg">
                <Smartphone className="w-5 h-5 mb-2 text-success" />
                <p className="font-medium">Fast Loading</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Install;
