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
import { UserContext } from "@/components/providers/UserContext";

const LandingPage = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      router.replace("/admin");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Banner */}
      <DevelopmentBanner />
      <div className="hidden md:block bg-muted/40 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-end">
          <nav className="flex gap-6">
            {["About EcoKeepr", "Careers", "Contact"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm hover:text-green-600 transition-colors"
              >
                {item}
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
                { name: "Blog", href: "#" },
                { name: "Pricing", href: "#pricing" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium hover:text-green-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button
                className="bg-green-600 hover:bg-green-700"
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
                  className="bg-green-600 hover:bg-green-700"
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

      {/* Features Section */}
      <Features />

      {/* Industries Section */}
      <Industries />

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-green-100">
        <div className="max-w-7xl mx-auto px-4">
          <PricingTable />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
