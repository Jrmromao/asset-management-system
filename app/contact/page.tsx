"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HeaderIcon from "@/components/page/HeaderIcon";
import Footer from "@/components/page/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ArrowLeft,
  Send,
  Globe,
  Users,
  Headphones,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phoneNumber: "",
    inquiryType: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you for your message! We'll get back to you within 24 hours.",
        });
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          jobTitle: "",
          phoneNumber: "",
          inquiryType: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "hello@ecokeepr.com",
      action: "mailto:hello@ecokeepr.com",
    },
    {
      icon: Phone,
      title: "Call Sales",
      description: "Speak with our sales team about your needs",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available 9 AM - 6 PM PST",
      action: "#",
    },
    {
      icon: Headphones,
      title: "Support Center",
      description: "Browse our knowledge base and tutorials",
      contact: "help.ecokeepr.com",
      action: "#",
    },
  ];

  const offices = [
    {
      city: "Dublin",
      address: "123 Innovation Square, Suite 4",
      zipCode: "Dublin 2, Ireland",
      phone: "+353 1 234 5678",
      type: "Headquarters",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <HeaderIcon />
            <nav className="hidden md:flex gap-8">
              <Link
                href="/"
                className="text-sm font-medium hover:text-green-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium hover:text-green-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/careers"
                className="text-sm font-medium hover:text-green-600 transition-colors"
              >
                Careers
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-green-600"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/sign-up">Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
              Get in Touch with <span className="text-green-600">Our Team</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Have questions about EcoKeepr? Want to see a demo? Our team is
              here to help you discover how we can transform your asset
              management.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
              How Can We Help?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the best way to reach us based on your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="text-center h-full hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <method.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <div className="text-sm font-medium text-green-600 mb-4">
                    {method.contact}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={method.action}>Get Started</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                  Send Us a Message
                </CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>
              </CardHeader>
              <CardContent>
                {/* Success/Error Alerts */}
                {submitStatus.type && (
                  <Alert
                    className={`mb-6 ${
                      submitStatus.type === "success"
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    {submitStatus.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription
                      className={
                        submitStatus.type === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }
                    >
                      {submitStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        First Name *
                      </label>
                      <Input
                        required
                        disabled={isSubmitting}
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Last Name *
                      </label>
                      <Input
                        required
                        disabled={isSubmitting}
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Work Email *
                    </label>
                    <Input
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Company *
                      </label>
                      <Input
                        required
                        disabled={isSubmitting}
                        value={formData.company}
                        onChange={(e) =>
                          handleInputChange("company", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Job Title
                      </label>
                      <Input
                        disabled={isSubmitting}
                        value={formData.jobTitle}
                        onChange={(e) =>
                          handleInputChange("jobTitle", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      disabled={isSubmitting}
                      placeholder="+1 (555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      How can we help? *
                    </label>
                    <Select
                      disabled={isSubmitting}
                      value={formData.inquiryType}
                      onValueChange={(value) =>
                        handleInputChange("inquiryType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Request a Demo</SelectItem>
                        <SelectItem value="pricing">
                          Pricing Information
                        </SelectItem>
                        <SelectItem value="integration">
                          Integration Questions
                        </SelectItem>
                        <SelectItem value="support">
                          Technical Support
                        </SelectItem>
                        <SelectItem value="partnership">
                          Partnership Opportunities
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Message *
                    </label>
                    <Textarea
                      required
                      rows={4}
                      disabled={isSubmitting}
                      placeholder="Tell us more about your needs..."
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Office Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Our Offices
                </h3>
                <div className="space-y-6">
                  {offices.map((office, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <MapPin className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {office.city}
                              </h4>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                {office.type}
                              </span>
                            </div>
                            <p className="text-gray-600">{office.address}</p>
                            <p className="text-gray-600">{office.zipCode}</p>
                            <p className="text-gray-600 mt-2">{office.phone}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Support Hours
                    </h4>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 2:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
              Quick Answers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions or contact us for more
              information.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">
                  How quickly can we get started?
                </h4>
                <p className="text-gray-600">
                  Most customers are up and running within 2-4 weeks. Our
                  implementation team works closely with you to ensure a smooth
                  onboarding process.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">
                  Do you offer custom integrations?
                </h4>
                <p className="text-gray-600">
                  Yes! We offer custom integrations with your existing systems
                  including ERP, IoT platforms, and other business applications.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">
                  Is my data secure?
                </h4>
                <p className="text-gray-600">
                  Absolutely. We use enterprise-grade security with SOC 2 Type
                  II compliance, end-to-end encryption, and regular security
                  audits.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">
                  What support do you provide?
                </h4>
                <p className="text-gray-600">
                  We offer 24/7 support for enterprise customers, comprehensive
                  documentation, training sessions, and a dedicated customer
                  success manager.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
            Ready to See EcoKeepr in Action?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Schedule a personalized demo and discover how EcoKeepr can transform
            your asset management and sustainability reporting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50"
            >
              Schedule Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
