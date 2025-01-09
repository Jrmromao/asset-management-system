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

    [key: string]: any; // Add index signature to allow dynamic properties
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

  const callbackIds = React.useMemo(
    () => ({
      load: `recaptcha_load_${Math.random().toString(36).slice(2)}`,
      verify: `recaptcha_verify_${Math.random().toString(36).slice(2)}`,
      expire: `recaptcha_expire_${Math.random().toString(36).slice(2)}`,
    }),
    [],
  );

  React.useEffect(() => {
    // Set up callbacks with unique names
    window[callbackIds.load] = () => {
      setIsScriptLoaded(true);
    };

    window[callbackIds.verify] = (token: string) => {
      onVerify(token);
    };

    window[callbackIds.expire] = () => {
      onExpire?.();
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    };

    return () => {
      // Cleanup unique callbacks
      delete window[callbackIds.load];
      delete window[callbackIds.verify];
      delete window[callbackIds.expire];

      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          console.error("Failed to reset reCAPTCHA:", error);
        }
      }
      widgetIdRef.current = null;
    };
  }, [callbackIds, onVerify, onExpire]);

  React.useEffect(() => {
    if (!isScriptLoaded || !containerRef.current) {
      return;
    }

    const renderRecaptcha = () => {
      if (!window.grecaptcha?.render) return;

      try {
        if (widgetIdRef.current === null) {
          widgetIdRef.current = window.grecaptcha.render(
            containerRef.current!,
            {
              sitekey: siteKey,
              callback: callbackIds.verify,
              "expired-callback": callbackIds.expire,
              size: "normal",
            },
          );
        }
      } catch (error) {
        console.error("Failed to render reCAPTCHA:", error);
      }
    };

    if (window.grecaptcha?.render) {
      renderRecaptcha();
    } else {
      const checkInterval = setInterval(() => {
        if (window.grecaptcha?.render) {
          renderRecaptcha();
          clearInterval(checkInterval);
        }
      }, 100);

      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    return () => {
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          console.error("Failed to reset reCAPTCHA:", error);
        }
      }
    };
  }, [isScriptLoaded, siteKey, callbackIds]);

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?onload=${callbackIds.load}&render=explicit`}
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
