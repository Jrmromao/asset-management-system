// components/CookieConsent/CookieManager.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
};

interface CookieManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: CookiePreferences) => void;
  initialPreferences: CookiePreferences;
}

export default function CookieManager({
  isOpen,
  onClose,
  onSave,
  initialPreferences,
}: CookieManagerProps) {
  const [preferences, setPreferences] =
    useState<CookiePreferences>(initialPreferences);

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold">Cookie Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-4 space-y-6">
            {/* Necessary Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">Essential Cookies</h3>
                  <span className="text-xs text-gray-500">Always active</span>
                </div>
                <div className="relative inline-block">
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600 cursor-not-allowed"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                These cookies are necessary for the website to function and
                cannot be switched off. They are usually only set in response to
                actions made by you which amount to a request for services, such
                as setting your privacy preferences, logging in or filling in
                forms.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Analytics Cookies</h3>
                <div className="relative inline-block">
                  <button
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.analytics ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.analytics
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                These cookies allow us to count visits and traffic sources so we
                can measure and improve the performance of our site. They help
                us to know which pages are the most and least popular and see
                how visitors move around the site. All information these cookies
                collect is aggregated and therefore anonymous.
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Functional Cookies</h3>
                <div className="relative inline-block">
                  <button
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        functional: !prev.functional,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.functional ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.functional
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                These cookies enable the website to provide enhanced
                functionality and personalisation. They may be set by us or by
                third party providers whose services we have added to our pages.
                If you do not allow these cookies then some or all of these
                services may not function properly.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
            >
              Save preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
