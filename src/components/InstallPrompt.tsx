import { useState } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setIsDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border border-border rounded-xl shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Install TravelMate</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add to your home screen for quick access and offline support
          </p>
        </div>
      </div>
      
      <Button
        onClick={handleInstall}
        className="w-full mt-4"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>
    </div>
  );
};
