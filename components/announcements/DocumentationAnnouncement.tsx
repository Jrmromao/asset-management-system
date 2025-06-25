"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Zap,
  Wrench,
  ExternalLink,
  X,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface DocumentationAnnouncementProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const DocumentationAnnouncement: React.FC<
  DocumentationAnnouncementProps
> = ({ onDismiss, showDismiss = true }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const guides = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Quick Start Guide",
      description: "Build your first automation in 10 minutes",
      time: "10 min read",
      href: "/docs/maintenance-flows-quickstart.md",
      color: "bg-green-500",
      highlight: "New User Friendly",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Complete Guide",
      description: "Master every feature with real-world examples",
      time: "25 min read",
      href: "/docs/maintenance-flows-guide.md",
      color: "bg-blue-500",
      highlight: "Comprehensive",
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      title: "Troubleshooting",
      description: "Quick solutions to common problems",
      time: "5 min read",
      href: "/docs/maintenance-flows-troubleshooting.md",
      color: "bg-orange-500",
      highlight: "Problem Solver",
    },
  ];

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-lg">
      <CardHeader className="relative pb-4">
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                New Documentation Available!
              </h3>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                Just Released
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Master maintenance flows with our comprehensive guides written by
              experts
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Clock className="w-4 h-4" />,
              text: "Save 2+ hours weekly",
            },
            {
              icon: <CheckCircle className="w-4 h-4" />,
              text: "Reduce manual errors",
            },
            { icon: <Zap className="w-4 h-4" />, text: "Automate workflows" },
          ].map((benefit, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
            >
              <div className="text-green-500">{benefit.icon}</div>
              <span className="text-sm font-medium">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Documentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => window.open(guide.href, "_blank")}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${guide.color} text-white`}>
                  {guide.icon}
                </div>
                <Badge variant="outline" className="text-xs">
                  {guide.highlight}
                </Badge>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {guide.title}
              </h4>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {guide.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {guide.time}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Ready to get started?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your learning path and build your first flow today
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/docs/README.md", "_blank")}
              className="flex items-center space-x-1"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All Docs</span>
            </Button>
            <Button
              size="sm"
              onClick={() =>
                window.open("/docs/maintenance-flows-quickstart.md", "_blank")
              }
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4" />
              <span>Start Now</span>
            </Button>
          </div>
        </div>

        {/* Popular Templates Preview */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            Popular Flow Templates
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                name: "High-Value Asset Protection",
                desc: "Auto-require approval for expensive equipment",
              },
              {
                name: "Emergency Response",
                desc: "Fast-track critical maintenance",
              },
              {
                name: "Preventive Maintenance Loop",
                desc: "Never miss scheduled maintenance",
              },
              {
                name: "Budget Alert System",
                desc: "Flag when costs exceed limits",
              },
            ].map((template, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {template.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
