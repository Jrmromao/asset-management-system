"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeaderIcon from "@/components/page/HeaderIcon";
import Footer from "@/components/page/Footer";
import {
  Users,
  Target,
  Award,
  Globe,
  Leaf,
  TrendingUp,
  Shield,
  Clock,
  ArrowLeft,
} from "lucide-react";

const AboutPage = () => {
  const stats = [
    { number: "Beta", label: "Early Access Program", icon: TrendingUp },
    { number: "50+", label: "Beta Users", icon: Users },
    { number: "AI-Powered", label: "CO2 Calculations", icon: Leaf },
    { number: "2024", label: "Founded", icon: Clock },
  ];

  const values = [
    {
      icon: Leaf,
      title: "Sustainability First",
      description:
        "Every decision we make considers environmental impact and long-term sustainability.",
    },
    {
      icon: Shield,
      title: "Data Security",
      description:
        "Enterprise-grade security ensures your asset data is protected and compliant.",
    },
    {
      icon: Users,
      title: "Customer Success",
      description:
        "We measure our success by the positive outcomes we deliver for our customers.",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "Continuous innovation drives our AI-powered solutions and user experience.",
    },
  ];

  const team = [
    {
      name: "João Romão",
      role: "Founder & CEO",
      description:
        "Passionate about building sustainable technology solutions for modern businesses.",
      image: "/placeholder-avatar.jpg",
    },
    {
      name: "Development Team",
      role: "Engineering",
      description:
        "Working on AI-powered asset management and sustainability tracking features.",
      image: "/placeholder-avatar.jpg",
    },
    {
      name: "Advisory Board",
      role: "Advisors",
      description:
        "Industry experts guiding our product development and go-to-market strategy.",
      image: "/placeholder-avatar.jpg",
    },
    {
      name: "Join Us",
      role: "We're Hiring",
      description:
        "Looking for passionate individuals to help build the future of asset management.",
      image: "/placeholder-avatar.jpg",
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
                className="text-sm font-medium text-green-600"
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
                className="text-sm font-medium hover:text-green-600 transition-colors"
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
              Transforming Asset Management for a{" "}
              <span className="text-green-600">Sustainable Future</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Founded in 2024, EcoKeepr is an early-stage startup building the
              next generation of intelligent asset management tools with
              sustainability at the core.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that effective asset management and environmental
                responsibility go hand in hand. We're building a platform that
                will empower organizations to make data-driven decisions that
                optimize both operational efficiency and sustainability
                outcomes.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our vision is to combine cutting-edge AI technology with deep
                domain expertise to create the future of asset management—where
                every decision contributes to a more sustainable world.
              </p>
              <div className="flex items-center gap-4">
                <Globe className="w-6 h-6 text-green-600" />
                <span className="text-gray-600">
                  Currently in beta with early adopters
                </span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Why We Started EcoKeepr
              </h3>
              <p className="text-gray-600 mb-4">
                "We saw organizations struggling to balance operational
                efficiency with sustainability goals, and realized there was an
                opportunity to build something better—smarter asset management
                with environmental impact at its core."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">CEO & Co-Founder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do, from product
              development to customer relationships.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center h-full">
                <CardContent className="p-6">
                  <value.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
              Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're a small but passionate team building the future of
              sustainable asset management. Want to join us?
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {member.name}
                  </h3>
                  <div className="text-green-600 font-medium mb-3">
                    {member.role}
                  </div>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
            Ready to Join Our Early Access Program?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Be among the first to experience the future of asset management.
            Join our beta program and help shape the product.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50"
              asChild
            >
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
