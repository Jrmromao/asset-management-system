// components/CookieConsent/CookieBanner.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CookieManager, { CookiePreferences } from "./CookieManager";

interface CookieBannerProps {
  onPreferencesChange: (preferences: CookiePreferences) => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
};

export default function CookieBanner({
  onPreferencesChange,
}: CookieBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if we have stored preferences
    const storedPreferences = localStorage.getItem("cookie-preferences");
    if (!storedPreferences) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(storedPreferences);
      setPreferences(parsed);
      onPreferencesChange(parsed);
    }
  }, [onPreferencesChange]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
    };
    savePreferences(allAccepted);
  };

  const handleDeclineAll = () => {
    const allDeclined: CookiePreferences = {
      necessary: true, // Always true
      analytics: false,
      functional: false,
    };
    savePreferences(allDeclined);
  };

  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem("cookie-preferences", JSON.stringify(newPreferences));
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowManager(false);
    onPreferencesChange(newPreferences);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-sm p-4 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. Please read our{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for more information.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowManager(true)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Manage preferences
            </button>
            <button
              onClick={handleDeclineAll}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-50"
            >
              Decline all
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>

      <CookieManager
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        onSave={savePreferences}
        initialPreferences={preferences}
      />
    </>
  );
}
