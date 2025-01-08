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
    onRecaptchaLoad?: () => void;
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
    window.onRecaptchaLoad = () => {
      setIsScriptLoaded(true);
    };

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
      delete window.onRecaptchaLoad;
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
      if (!window.grecaptcha?.render) return;

      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current!, {
          sitekey: siteKey,
          callback: "onRecaptchaVerify",
          "expired-callback": "onRecaptchaExpire",
          size: "normal", // Add explicit size
        });
      } catch (error) {
        console.error("Failed to render reCAPTCHA:", error);
      }
    };

    // Add a delay before attempting to render
    setTimeout(renderRecaptcha, 100);
  }, [isScriptLoaded, siteKey]);

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`}
        strategy="afterInteractive"
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
