"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PricingTable from "@/components/Pricing";
import HeaderIcon from "@/components/page/HeaderIcon";
import Footer from "@/components/page/Footer";
import DevelopmentBanner from "@/components/DevelopmentBanner";
import { Features } from "@/components/page/Features";
import Hero from "@/components/page/Hero";
import { ValuePropositionSection } from "@/components/page/ProblemSection";
import { useAuth } from "@clerk/nextjs";

// Navigation data constants
const TOP_NAV_ITEMS = [
  { name: "About EcoKeepr", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
] as const;

const MAIN_NAV_ITEMS = [
  { name: "Features", href: "#features" },
  { name: "About", href: "/about" },
  { name: "Beta Pricing", href: "#pricing" },
] as const;

const LandingPage = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const renderAuthButtons = () => {
    if (!isLoaded) {
      return <div className="w-32 h-10 bg-gray-200 animate-pulse rounded" />;
    }

    if (isSignedIn) {
      return (
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => router.push("/dashboard")}
        >
          Go to App
        </Button>
      );
    }

    return (
      <>
        <Button variant="ghost" onClick={() => router.push("/sign-in")}>
          Login
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => router.push("/sign-up")}
        >
          Join Beta
        </Button>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Banner */}
      <DevelopmentBanner />

      {/* Top Navigation */}
      <div className="hidden md:block bg-muted/40 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-end">
          <nav
            className="flex gap-6"
            role="navigation"
            aria-label="Top navigation"
          >
            {TOP_NAV_ITEMS.map((item) => (
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
            <nav
              className="hidden md:flex gap-8"
              role="navigation"
              aria-label="Main navigation"
            >
              {MAIN_NAV_ITEMS.map((item) => (
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
          <div className="flex items-center gap-4">{renderAuthButtons()}</div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Problem Section */}
      <ValuePropositionSection />

      {/* Features Section */}
      <Features />

      {/* Industries Section - Currently commented out */}
      {/* <Industries /> */}

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <PricingTable />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
