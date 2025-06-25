"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Zap,
  Wrench,
  ExternalLink,
  HelpCircle,
  Video,
  MessageCircle,
  Mail,
  ArrowRight,
} from "lucide-react";

interface HelpResource {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  type: "documentation" | "video" | "support" | "community";
  time?: string;
  badge?: string;
}

interface HelpSectionProps {
  title?: string;
  subtitle?: string;
  resources?: HelpResource[];
  compact?: boolean;
  showAllResources?: boolean;
}

const defaultResources: HelpResource[] = [
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Quick Start Guide",
    description: "Get your first maintenance flow running in 10 minutes",
    href: "/docs/maintenance-flows-quickstart.md",
    type: "documentation",
    time: "10 min",
    badge: "Beginner",
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "Complete Documentation",
    description: "Master all features with comprehensive guides",
    href: "/docs/maintenance-flows-guide.md",
    type: "documentation",
    time: "25 min",
    badge: "Complete",
  },
  {
    icon: <Wrench className="w-4 h-4" />,
    title: "Troubleshooting",
    description: "Quick solutions to common problems",
    href: "/docs/maintenance-flows-troubleshooting.md",
    type: "documentation",
    time: "5 min",
    badge: "Problem Solver",
  },
  {
    icon: <Video className="w-4 h-4" />,
    title: "Video Tutorials",
    description: "Watch step-by-step visual guides",
    href: "#",
    type: "video",
    badge: "Coming Soon",
  },
  {
    icon: <MessageCircle className="w-4 h-4" />,
    title: "Live Chat Support",
    description: "Get instant help from our team",
    href: "#",
    type: "support",
    badge: "Instant",
  },
  {
    icon: <Mail className="w-4 h-4" />,
    title: "Email Support",
    description: "Detailed technical assistance",
    href: "mailto:support@yourcompany.com",
    type: "support",
    badge: "24h Response",
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "documentation":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "video":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "support":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "community":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const HelpSection: React.FC<HelpSectionProps> = ({
  title = "Need Help?",
  subtitle = "Get started with our comprehensive guides and support resources",
  resources = defaultResources,
  compact = false,
  showAllResources = true,
}) => {
  const displayResources = showAllResources ? resources : resources.slice(0, 3);

  if (compact) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayResources.map((resource, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 justify-start"
                onClick={() => window.open(resource.href, "_blank")}
              >
                <div className="flex items-center space-x-2 w-full">
                  <div className="text-blue-500">{resource.icon}</div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{resource.title}</div>
                    {resource.time && (
                      <div className="text-xs text-gray-500">
                        {resource.time}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayResources.map((resource, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
              onClick={() => window.open(resource.href, "_blank")}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                  {resource.icon}
                </div>
                {resource.badge && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getTypeColor(resource.type)}`}
                  >
                    {resource.badge}
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {resource.title}
              </h4>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {resource.description}
              </p>

              <div className="flex items-center justify-between">
                {resource.time && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {resource.time}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors ml-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Can't find what you're looking for?
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/docs/README.md", "_blank")}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                All Documentation
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  window.open("mailto:support@yourcompany.com", "_blank")
                }
              >
                <Mail className="w-4 h-4 mr-1" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
