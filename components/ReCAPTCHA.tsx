import React from "react";
import Script from "next/script";

interface ReCAPTCHAProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaVerify?: (token: string) => void;
    onRecaptchaExpire?: () => void;
  }
}

const ReCAPTCHA: React.FC<ReCAPTCHAProps> = ({
  siteKey,
  onVerify,
  onExpire,
}) => {
  const [isReady, setIsReady] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<number | null>(null);

  // Set up global callbacks
  React.useEffect(() => {
    window.onRecaptchaVerify = (token: string) => {
      console.log("Verification callback triggered");
      onVerify(token);
    };

    window.onRecaptchaExpire = () => {
      console.log("Expiration callback triggered");
      onExpire?.();
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    };

    return () => {
      delete window.onRecaptchaVerify;
      delete window.onRecaptchaExpire;
    };
  }, [onVerify, onExpire]);

  // Initialize reCAPTCHA when ready
  const initializeRecaptcha = React.useCallback(() => {
    if (!isReady || !containerRef.current || widgetIdRef.current !== null) {
      return;
    }

    try {
      console.log("Attempting to render reCAPTCHA");
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: "onRecaptchaVerify",
        "expired-callback": "onRecaptchaExpire",
      });
      console.log("reCAPTCHA rendered successfully");
    } catch (error) {
      console.error("Error rendering reCAPTCHA:", error);
    }
  }, [isReady, siteKey]);

  React.useEffect(() => {
    if (window.grecaptcha?.render) {
      setIsReady(true);
    }
  }, []);

  React.useEffect(() => {
    initializeRecaptcha();
  }, [initializeRecaptcha]);

  return (
    <div className="mb-4">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("reCAPTCHA script loaded");
          setIsReady(true);
        }}
        onError={(e) => {
          console.error("Error loading reCAPTCHA script:", e);
        }}
      />
      <div
        ref={containerRef}
        className="flex justify-center"
        style={{ minHeight: "78px" }} // Prevent layout shift
      />
    </div>
  );
};

export default ReCAPTCHA;
