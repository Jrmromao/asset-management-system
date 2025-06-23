"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PricingTable from "@/components/Pricing";
import HeaderIcon from "@/components/page/HeaderIcon";
import React, { useContext, useEffect } from "react";
import Footer from "@/components/page/Footer";
import DevelopmentBanner from "@/components/DevelopmentBanner";
import { Features } from "@/components/page/Features";
import Industries from "@/components/page/Industries";
import Hero from "@/components/page/Hero";
import { ValuePropositionSection } from "@/components/page/ProblemSection";
import { UserContext } from "@/components/providers/UserContext";

const LandingPage = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Banner */}
      <DevelopmentBanner />
      <div className="hidden md:block bg-muted/40 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-end">
          <nav className="flex gap-6">
            {[
              { name: "About EcoKeepr", href: "/about" },
              { name: "Careers", href: "/careers" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm hover:text-emerald-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <HeaderIcon />
            <nav className="hidden md:flex gap-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Industries", href: "#industries" },
                { name: "About", href: "/about" },
                { name: "Pricing", href: "#pricing" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium hover:text-emerald-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => router.push("/dashboard")}
              >
                Go to App
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/sign-in")}>
                  Login
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push("/sign-up")}
                >
                  Free trial
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Problem Section */}
      <ValuePropositionSection />

      {/* Features Section */}
      <Features />

      {/* Industries Section */}
      <Industries />

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              🤖 AI Carbon Calculation Included in All Plans
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our flexible pricing model.{" "}
              <strong>AI-powered carbon footprint calculation</strong> is
              included in every plan—no extra charges for sustainability
              insights.
            </p>
          </div>
          <PricingTable />

          {/* Additional messaging */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-200 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                What&apos;s Included in Every Plan
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-bold text-sm">
                      AI
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Instant Carbon Calculations
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Lifecycle assessments with confidence scoring
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Detailed Carbon Reports
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Comprehensive carbon tracking with export capabilities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">
                      ⚡
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      95% Time Savings
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Automated sustainability reporting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
