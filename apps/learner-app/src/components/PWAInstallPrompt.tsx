import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone
    ) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      // Prevent the default prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show custom prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Show again in 7 days
    localStorage.setItem(
      'aivo_pwa_dismissed',
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );
  };

  // Don't show if already installed or dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('aivo_pwa_dismissed');
    if (dismissed && new Date(dismissed) > new Date()) {
      setShowPrompt(false);
    }
  }, []);

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white shadow-2xl">
        <button
          onClick={handleDismiss}
          className="float-right -mr-2 -mt-2"
          aria-label="Dismiss"
        >
          <svg
            className="h-5 w-5 text-white opacity-75 hover:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-3 flex items-center gap-3">
          <div className="flex-shrink-0 rounded-lg bg-white p-2">
            <svg
              className="h-8 w-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Install Aivo Learning</h3>
            <p className="text-sm text-white/90">
              Add to your home screen for quick access
            </p>
          </div>
        </div>

        <ul className="mb-4 space-y-1 text-sm text-white/90">
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Works offline
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Faster loading
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Full-screen experience
          </li>
        </ul>

        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 rounded-lg bg-white px-4 py-2 font-semibold text-purple-600 transition-transform hover:scale-105"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg border border-white/30 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
