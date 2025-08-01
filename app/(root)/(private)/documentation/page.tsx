import React from "react";
import {
  BookOpen,
  Zap,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Play,
  Users,
  MessageCircle,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Asset Management System Documentation
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Complete guides for mastering your asset management workflows
        </p>
      </div>

      {/* Maintenance Flows Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-emerald-600" />
            Maintenance Flows Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              New to Maintenance Flows?
            </h2>
            <p className="text-gray-700 mb-2">
              Start here to understand what flows are and how they can transform
              your maintenance operations.
            </p>
            <ul className="list-disc ml-6 text-gray-600">
              <li>What are maintenance flows and why use them</li>
              <li>Deep dive into triggers, conditions, and actions</li>
              <li>Real-world examples and use cases</li>
              <li>Analytics and optimization strategies</li>
              <li>Security and permissions overview</li>
              <li>Best practices from power users</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-4 text-gray-600">
                  <li>Step-by-step setup for beginners</li>
                  <li>Build a high-value asset protection flow</li>
                  <li>Test your flow with real data</li>
                  <li>Troubleshoot common first-time issues</li>
                  <li>Ideas for your next flows</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-yellow-600" />
                  Troubleshooting Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-4 text-gray-600">
                  <li>Flow not triggering? Start here</li>
                  <li>Email notifications not working</li>
                  <li>Approval workflows broken</li>
                  <li>Performance and timing issues</li>
                  <li>Complete debugging checklist</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Choose Your Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-4 text-gray-600">
                  <li>👋 I'm New to Automation</li>
                  <li>⚡ I Want to Build Flows Now</li>
                  <li>🔧 I'm Having Issues</li>
                  <li>🏆 I Want to Master Flows</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Popular Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" />
          Popular Flow Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Repeat for each template */}
          <Card>
            <CardHeader>
              <CardTitle>🏢 High-Value Asset Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Automatically require manager approval for expensive equipment
                maintenance.
              </p>
              <ul className="list-disc ml-4 text-gray-600">
                <li>Trigger: On Creation</li>
                <li>Condition: Asset Value &gt; $10,000</li>
                <li>Actions: Require Approval + Notify Manager</li>
              </ul>
            </CardContent>
          </Card>
          {/* ...other templates */}
        </div>
      </div>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Flow Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">What Good Flows Look Like:</h3>
              <ul className="list-disc ml-4 text-gray-600">
                <li>✅ 95%+ Success Rate</li>
                <li>✅ &lt;5 Second Execution</li>
                <li>✅ High Usage</li>
                <li>✅ Positive Feedback</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Warning Signs:</h3>
              <ul className="list-disc ml-4 text-gray-600">
                <li>❌ &lt;80% Success Rate</li>
                <li>❌ Slow Execution</li>
                <li>❌ Low Usage</li>
                <li>❌ User Complaints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Getting Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Badge variant="secondary">📖 Documentation</Badge>
            <Badge variant="secondary">🎥 Video Tutorials</Badge>
            <Badge variant="secondary">💬 Community Forum</Badge>
            <Badge variant="secondary">📊 Knowledge Base</Badge>
            <Badge variant="secondary">💬 Live Chat</Badge>
            <Badge variant="secondary">📧 Email Support</Badge>
            <Badge variant="secondary">📞 Phone Support</Badge>
            <Badge variant="secondary">🎫 Support Portal</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
