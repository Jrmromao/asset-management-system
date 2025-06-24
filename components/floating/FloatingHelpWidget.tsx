"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  BookOpen,
  Zap,
  Wrench,
  MessageCircle,
  Mail,
  X,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface HelpResource {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
  color: string;
  external?: boolean;
}

const helpResources: HelpResource[] = [
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Quick Start",
    description: "Get started in 10 minutes",
    href: "/docs/maintenance-flows-quickstart.md",
    badge: "10 min",
    color: "bg-green-500",
    external: true,
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "Complete Guide",
    description: "Master all features",
    href: "/docs/maintenance-flows-guide.md",
    badge: "25 min",
    color: "bg-blue-500",
    external: true,
  },
  {
    icon: <Wrench className="w-4 h-4" />,
    title: "Troubleshooting",
    description: "Fix common issues",
    href: "/docs/maintenance-flows-troubleshooting.md",
    badge: "5 min",
    color: "bg-orange-500",
    external: true,
  },
  {
    icon: <MessageCircle className="w-4 h-4" />,
    title: "Live Chat",
    description: "Get instant help",
    href: "#",
    badge: "Online",
    color: "bg-green-500",
  },
  {
    icon: <Mail className="w-4 h-4" />,
    title: "Email Support",
    description: "Detailed assistance",
    href: "mailto:support@yourcompany.com",
    badge: "24h",
    color: "bg-blue-500",
    external: true,
  },
];

export const FloatingHelpWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleResourceClick = (resource: HelpResource) => {
    if (resource.external) {
      window.open(resource.href, "_blank");
    } else if (resource.href.startsWith("/")) {
      router.push(resource.href);
    } else {
      window.location.href = resource.href;
    }
    setIsOpen(false);
  };

  const handleViewAllDocs = () => {
    router.push("/help");
    setIsOpen(false);
  };

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-6 right-6 z-[9999]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ pointerEvents: "auto" }}
    >
      {/* Help Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2">
          <Card className="w-80 shadow-xl border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Need Help?
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get started with our guides
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-3 space-y-2">
                {helpResources.map((resource, index) => (
                  <button
                    key={index}
                    onClick={() => handleResourceClick(resource)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left"
                  >
                    <div
                      className={`p-2 rounded-lg ${resource.color} text-white group-hover:scale-110 transition-transform`}
                    >
                      {resource.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {resource.title}
                        </h4>
                        {resource.badge && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {resource.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {resource.description}
                      </p>
                    </div>
                    {resource.external && (
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={handleViewAllDocs}
                  className="w-full justify-center border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded text-sm"
                >
                  <BookOpen className="w-4 h-4 mr-2 inline" />
                  View All Documentation
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Help Button - Using working approach */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out",
          "bg-emerald-600 hover:bg-emerald-700 text-white",
          "flex items-center justify-center",
          "border border-emerald-300 dark:border-emerald-600",
          "cursor-pointer",
          isHovered && "scale-105",
          isOpen && "rotate-180",
        )}
        aria-label="Help & Documentation"
        type="button"
      >
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <HelpCircle className="w-5 h-5" />
        )}
      </button>

      {/* Subtle hover ring - only on hover */}
      {isHovered && !isOpen && (
        <div className="absolute inset-0 rounded-full border border-emerald-400 dark:border-emerald-500 animate-pulse" />
      )}

      {/* Tooltip for first-time users */}
      {!isOpen && isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-emerald-800 dark:bg-emerald-700 text-white text-xs rounded-lg opacity-90 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Need help? Click for guides & support
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-800 dark:border-t-emerald-700" />
        </div>
      )}
    </div>
  );
};
