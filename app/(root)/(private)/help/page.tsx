"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderBox from "@/components/HeaderBox";
import { DocumentationAnnouncement } from "@/components/announcements/DocumentationAnnouncement";
import { HelpSection } from "@/components/help/HelpSection";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { 
  BookOpen, 
  Zap, 
  Wrench, 
  HelpCircle,
  Video,
  MessageCircle,
  Mail,
  ExternalLink,
  Download,
  Star,
  Clock,
  Users,
  Lightbulb,
  CheckCircle
} from "lucide-react";

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const documentationResources = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Quick Start Guide",
      description: "Build your first maintenance flow in under 10 minutes with step-by-step instructions.",
      href: "/docs/maintenance-flows-quickstart.md",
      type: "documentation" as const,
      time: "10 min read",
      badge: "Beginner Friendly",
      color: "bg-green-500"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Complete Guide",
      description: "Master every feature with comprehensive guides, real-world examples, and best practices.",
      href: "/docs/maintenance-flows-guide.md",
      type: "documentation" as const,
      time: "25 min read",
      badge: "Comprehensive",
      color: "bg-blue-500"
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      title: "Troubleshooting Guide",
      description: "Quick solutions to common problems, error messages, and debugging techniques.",
      href: "/docs/maintenance-flows-troubleshooting.md",
      type: "documentation" as const,
      time: "5 min read",
      badge: "Problem Solver",
      color: "bg-orange-500"
    }
  ];

  const supportResources = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Live Chat Support",
      description: "Get instant help from our support team during business hours.",
      href: "#",
      type: "support" as const,
      badge: "Instant Response",
      color: "bg-green-500"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      description: "Send detailed questions and get comprehensive technical assistance.",
      href: "mailto:support@yourcompany.com",
      type: "support" as const,
      badge: "24h Response",
      color: "bg-blue-500"
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video Tutorials",
      description: "Watch step-by-step visual guides for complex workflows.",
      href: "#",
      type: "video" as const,
      badge: "Coming Soon",
      color: "bg-purple-500"
    }
  ];

  const popularTopics = [
    { title: "Creating your first maintenance flow", views: 1250, difficulty: "Beginner" },
    { title: "Setting up approval workflows", views: 890, difficulty: "Intermediate" },
    { title: "Troubleshooting flow triggers", views: 745, difficulty: "Beginner" },
    { title: "Advanced condition logic", views: 623, difficulty: "Advanced" },
    { title: "Email notification setup", views: 567, difficulty: "Beginner" },
    { title: "Performance optimization tips", views: 445, difficulty: "Advanced" }
  ];

  const quickTips = [
    {
      icon: <Lightbulb className="w-4 h-4 text-yellow-500" />,
      title: "Start Simple",
      tip: "Begin with basic flows before adding complex conditions and actions."
    },
    {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      title: "Test Thoroughly",
      tip: "Always test your flows with sample data before activating them."
    },
    {
      icon: <Users className="w-4 h-4 text-blue-500" />,
      title: "Team Training",
      tip: "Ensure your team understands the purpose and benefits of each flow."
    },
    {
      icon: <Clock className="w-4 h-4 text-purple-500" />,
      title: "Regular Reviews",
      tip: "Monitor flow performance monthly and optimize based on usage patterns."
    }
  ];

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/help">Help & Documentation</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Help & Documentation"
        subtitle="Everything you need to master maintenance flows and get the most out of your asset management system"
        icon={<HelpCircle className="w-4 h-4" />}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Support</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Community</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DocumentationAnnouncement showDismiss={false} />
          
          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Quick Tips for Success</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{tip.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tip.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Popular Help Topics</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{topic.title}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{topic.views} views</span>
                          <Badge variant="outline" className="text-xs">
                            {topic.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {documentationResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.open(resource.href, '_blank')}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${resource.color} text-white`}>
                      {resource.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {resource.time}
                    </span>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Read Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Download Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Download Complete Documentation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get all guides as PDF for offline reading and team sharing
                    </p>
                  </div>
                </div>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {supportResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.open(resource.href, '_blank')}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${resource.color} text-white`}>
                      {resource.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {resource.description}
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Get Support
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Support Status */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Support Status</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <h4 className="font-medium text-gray-900 dark:text-white">All Systems Operational</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Last updated: 2 minutes ago</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Average Response</h4>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">2 hours</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Star className="w-4 h-4 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Satisfaction Rate</h4>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">98.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Join Our Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with other users, share tips, and get help from the community
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Community Forum</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Ask questions, share experiences, and learn from other users
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Join Forum
                  </Button>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Feature Requests</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Suggest new features and vote on community ideas
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Submit Ideas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpPage; 