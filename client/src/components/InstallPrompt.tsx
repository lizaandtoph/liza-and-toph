import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
    } else {
      console.log('[PWA] User dismissed install prompt');
    }

    // Clear the deferred prompt (can only be used once)
    setDeferredPrompt(null);
  };

  const handleIOSInstallClick = () => {
    setShowIOSInstructions(true);
  };

  // Don't show anything if already installed
  if (isStandalone) {
    return null;
  }

  // iOS Install Button
  if (isIOS) {
    return (
      <>
        <Button 
          onClick={handleIOSInstallClick}
          variant="outline"
          className="w-full border-2 border-espresso/30 hover:border-olive hover:bg-olive/10 font-semibold transition-all cursor-pointer"
          data-testid="button-install-ios"
        >
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>

        <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Install Liza & Toph
              </DialogTitle>
              <DialogDescription>
                Add this app to your home screen for a better experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <div className="bg-olive/10 rounded-full p-2 mt-1">
                  <span className="text-olive font-bold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Tap the Share button</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Share className="w-4 h-4" />
                    <span>Look for this icon at the bottom of Safari</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-olive/10 rounded-full p-2 mt-1">
                  <span className="text-olive font-bold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Select "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    Scroll down in the menu to find this option
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-olive/10 rounded-full p-2 mt-1">
                  <span className="text-olive font-bold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground">
                    The app icon will appear on your home screen
                  </p>
                </div>
              </div>

              <div className="bg-blush/10 border border-blush/30 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-espresso">
                  💡 Note: This only works in Safari browser
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowIOSInstructions(false)}
                variant="outline"
                data-testid="button-close-ios-instructions"
              >
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Android/Desktop Install Button
  if (deferredPrompt) {
    return (
      <Button 
        onClick={handleInstallClick}
        className="w-full bg-olive hover:bg-ochre text-ivory font-semibold shadow-md hover:shadow-lg transition-all border-2 border-olive hover:border-ochre cursor-pointer"
        data-testid="button-install-android"
      >
        <Download className="w-4 h-4 mr-2" />
        Install App
      </Button>
    );
  }

  // No install prompt available
  return null;
}
