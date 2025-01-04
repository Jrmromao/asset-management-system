import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CookiePopupProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookiePopup: React.FC<CookiePopupProps> = ({ onAccept, onDecline }) => {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const consentStatus = localStorage.getItem("cookie-consent-status");
    if (!consentStatus) {
      setShowDialog(true);
    } else if (consentStatus === "accepted") {
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent-status", "accepted");
    setShowDialog(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent-status", "declined");
    setShowDialog(false);
    onDecline();
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Cookie Settings</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              We use cookies and similar technologies to help personalize
              content, tailor and measure ads, and provide a better experience.
            </p>
            <p>
              By clicking &quot;Accept Cookies&quot;, you agree to this use of
              cookies. You can change your cookie settings at any time by
              clicking &quot;Cookie Settings&quot; in the footer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <AlertDialogCancel
              onClick={handleDecline}
              className="text-sm sm:mr-2"
            >
              Decline All
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              className="text-sm bg-primary hover:bg-primary/90"
            >
              Accept Cookies
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CookiePopup;
