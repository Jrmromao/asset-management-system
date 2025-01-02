import React from "react";
import Script from "next/script";

interface ReCAPTCHAProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaVerify?: (token: string) => void;
  }
}

const ReCAPTCHA: React.FC<ReCAPTCHAProps> = ({ siteKey, onVerify }) => {
  React.useEffect(() => {
    window.onRecaptchaVerify = onVerify;
    return () => {
      if (window.onRecaptchaVerify) delete window.onRecaptchaVerify;
    };
  }, [onVerify]);

  return (
    <div className="mb-4">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          window.grecaptcha?.ready(() => {
            window.grecaptcha.render("recaptcha-container", {
              sitekey: siteKey,
              callback: "onRecaptchaVerify",
            });
          });
        }}
      />
      <div id="recaptcha-container" className="flex justify-center" />
    </div>
  );
};

export default ReCAPTCHA;
