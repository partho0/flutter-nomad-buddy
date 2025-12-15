import { useEffect, useState } from "react";
import { Download, Smartphone, Share, PlusSquare, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const Install = () => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  const handleInstall = async () => {
    await installApp();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
            <Smartphone className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Install TravelMate</h1>
          <p className="text-muted-foreground">
            Get quick access to TravelMate right from your home screen
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Already Installed!</h3>
                <p className="text-sm text-muted-foreground">
                  TravelMate is already installed on your device. Look for it on your home screen.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isInstallable ? (
          <Card>
            <CardHeader>
              <CardTitle>Quick Install</CardTitle>
              <CardDescription>
                Click the button below to install TravelMate instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleInstall} size="lg" className="w-full">
                <Download className="h-5 w-5 mr-2" />
                Install TravelMate
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {isIOS ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share className="h-5 w-5" />
                    iOS Installation
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to install TravelMate on your iPhone or iPad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Tap the Share button</p>
                      <p className="text-sm text-muted-foreground">
                        Look for the share icon at the bottom of Safari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        Select "Add to Home Screen"
                        <PlusSquare className="h-4 w-4" />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scroll down in the share menu to find this option
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Tap "Add"</p>
                      <p className="text-sm text-muted-foreground">
                        TravelMate will appear on your home screen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MoreVertical className="h-5 w-5" />
                    Android / Desktop Installation
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to install TravelMate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Open browser menu</p>
                      <p className="text-sm text-muted-foreground">
                        Tap the three dots (⋮) in your browser
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Select "Install app" or "Add to Home screen"</p>
                      <p className="text-sm text-muted-foreground">
                        The wording may vary by browser
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Confirm installation</p>
                      <p className="text-sm text-muted-foreground">
                        TravelMate will be added to your apps
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Download className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground">Quick Access</h3>
              <p className="text-sm text-muted-foreground">Launch directly from your home screen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Smartphone className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground">Native Feel</h3>
              <p className="text-sm text-muted-foreground">Full screen experience like a real app</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Check className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground">Always Updated</h3>
              <p className="text-sm text-muted-foreground">Automatically gets the latest features</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Install;
