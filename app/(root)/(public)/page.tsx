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
                // { name: "Integrations", href: "#integrations" },
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

      {/* Integrations Section */}
      {/*<section id="integrations" className="py-20">*/}
      {/*  <div className="max-w-7xl mx-auto px-4">*/}
      {/*    <h2 className="text-3xl font-bold text-center mb-12">*/}
      {/*      Seamless Integrations*/}
      {/*    </h2>*/}
      {/*    <div className="grid md:grid-cols-2 gap-12">*/}
      {/*      <div className="space-y-6">*/}
      {/*        <p className="text-lg text-muted-foreground">*/}
      {/*          EcoKeepr integrates with your existing tools and systems to*/}
      {/*          provide a comprehensive asset management and sustainability*/}
      {/*          solution.*/}
      {/*        </p>*/}
      {/*        <ul className="space-y-4">*/}
      {/*          {[*/}
      {/*            {*/}
      {/*              icon: Cog,*/}
      {/*              text: "Enterprise Resource Planning (ERP) Systems",*/}
      {/*            },*/}
      {/*            { icon: Puzzle, text: "Internet of Things (IoT) Platforms" },*/}
      {/*            { icon: BarChart2, text: "Business Intelligence Tools" },*/}
      {/*            { icon: Wifi, text: "Building Management Systems" },*/}
      {/*          ].map((item, index) => (*/}
      {/*            <li key={index} className="flex items-center gap-3">*/}
      {/*              <item.icon className="w-6 h-6 text-green-600" />*/}
      {/*              <span>{item.text}</span>*/}
      {/*            </li>*/}
      {/*          ))}*/}
      {/*        </ul>*/}
      {/*        <Button className="bg-green-600 hover:bg-green-700">*/}
      {/*          Explore all integrations*/}
      {/*        </Button>*/}
      {/*      </div>*/}
      {/*      <div className="grid grid-cols-3 gap-6">*/}
      {/*        /!*{[...Array(9)].map((_, i) => (*!/*/}
      {/*        /!*  <div*!/*/}
      {/*        /!*    key={i}*!/*/}
      {/*        /!*    className="flex items-center justify-center bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg hover:scale-105"*!/*/}
      {/*        /!*  >*!/*/}
      {/*        /!*    <Image*!/*/}
      {/*        /!*      src={`/placeholder.svg?height=80&width=80&text=${i + 1}`}*!/*/}
      {/*        /!*      alt={`Integration partner ${i + 1}`}*!/*/}
      {/*        /!*      width={80}*!/*/}
      {/*        /!*      height={80}*!/*/}
      {/*        /!*      className="grayscale hover:grayscale-0 transition-all"*!/*/}
      {/*        /!*    />*!/*/}
      {/*        /!*  </div>*!/*/}
      {/*        /!*))}*!/*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* Trust Section */}
      {/*<section className="bg-muted/40 border-t py-20">*/}
      {/*  <div className="max-w-7xl mx-auto px-4">*/}
      {/*    <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-12">*/}
      {/*      Trusted by sustainable organizations worldwide*/}
      {/*    </h2>*/}
      {/*    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">*/}
      {/*      {[...Array(6)].map((_, i) => (*/}
      {/*        <div key={i} className="flex items-center justify-center">*/}
      {/*          <Image*/}
      {/*            src={`/placeholder.svg?height=60&width=120&text=Logo ${i + 1}`}*/}
      {/*            alt={`Customer logo ${i + 1}`}*/}
      {/*            width={120}*/}
      {/*            height={60}*/}
      {/*            className="grayscale hover:grayscale-0 transition-all"*/}
      {/*          />*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      <Footer />
    </div>
  );
};

export default LandingPage;
