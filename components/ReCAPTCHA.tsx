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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<number | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);

  React.useEffect(() => {
    // Set up callbacks
    window.onRecaptchaVerify = (token: string) => {
      onVerify(token);
    };

    window.onRecaptchaExpire = () => {
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

  React.useEffect(() => {
    if (
      !isScriptLoaded ||
      !containerRef.current ||
      widgetIdRef.current !== null
    ) {
      return;
    }

    const renderRecaptcha = () => {
      if (window.grecaptcha?.render) {
        try {
          widgetIdRef.current = window.grecaptcha.render(
            containerRef.current!,
            {
              sitekey: siteKey,
              callback: "onRecaptchaVerify",
              "expired-callback": "onRecaptchaExpire",
            },
          );
        } catch (error) {
          console.error("Failed to render reCAPTCHA:", error);
        }
      }
    };

    // Try to render immediately if grecaptcha is available
    if (window.grecaptcha?.render) {
      renderRecaptcha();
    } else {
      // Poll for grecaptcha availability
      const interval = setInterval(() => {
        if (window.grecaptcha?.render) {
          clearInterval(interval);
          renderRecaptcha();
        }
      }, 100);

      // Clear interval after 5 seconds if not loaded
      setTimeout(() => clearInterval(interval), 5000);
    }
  }, [isScriptLoaded, siteKey]);

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js"
        onLoad={() => {
          setIsScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Error loading reCAPTCHA:", e);
        }}
      />
      <div
        ref={containerRef}
        className="flex justify-center items-center"
        style={{ minHeight: "78px" }}
      />
    </>
  );
};

export default ReCAPTCHA;
