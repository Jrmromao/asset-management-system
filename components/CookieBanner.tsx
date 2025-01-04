import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  privacyPolicyUrl?: string; // Make it configurable
}

const CookieBanner: React.FC<CookieBannerProps> = ({
  onAccept,
  onDecline,
  privacyPolicyUrl = "/privacy-policy", // Default value
}) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consentStatus = localStorage.getItem("cookie-consent-status");
    if (!consentStatus) {
      setShowBanner(true);
      document.body.style.paddingTop = "64px";
    } else if (consentStatus === "accepted") {
      onAccept();
    }

    return () => {
      document.body.style.paddingTop = "0px";
    };
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent-status", "accepted");
    setShowBanner(false);
    document.body.style.paddingTop = "0px";
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent-status", "declined");
    setShowBanner(false);
    document.body.style.paddingTop = "0px";
    onDecline();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-sm p-4 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            We use cookies to analyze website traffic and optimize your
            experience. Your data will be aggregated with all other user data.{" "}
            <Link
              href={privacyPolicyUrl}
              className="text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline transition-colors"
            >
              Learn more in our Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
