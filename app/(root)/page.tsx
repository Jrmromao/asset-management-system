"use client";

import {
  ArrowRight,
  BarChart2,
  Box,
  Building2,
  CheckCircle,
  Factory,
  Globe,
  Leaf,
  TreePine,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PricingTable from "@/components/Pricing";
import HeaderIcon from "@/components/page/HeaderIcon";
import React from "react";
import Footer from "@/components/page/Footer";
import DevelopmentBanner from "@/components/DevelopmentBanner";

const LandingPage = () => {
  const router = useRouter();

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
                // { name: "Blog", href: "#" },
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
            <Button variant="ghost" onClick={() => router.push("/sign-in")}>
              Login
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/sign-up")}
            >
              Free trial
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center gap-8">
            <div>
              <h1 className="mt-6 text-4xl lg:text-6xl font-bold tracking-tight">
                Smart asset management with environmental impact tracking
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Track, maintain, and optimize your equipment&apos;s environmental
              impact all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => router.push("/sign-up")}
              >
                Start free trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg"
                onClick={() => {
                  window.location.href =
                    "mailto:ecokeepr@gmail.com?subject=Book%20a%20Demo&body=I%20would%20like%20to%20schedule%20a%20demo.";
                }}
              >
                Book a demo
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Carbon Reduction",
                value: "Up to 50%",
                description:
                  "Projected reduction in carbon footprint based on industry models",
              },
              {
                title: "Cost Savings",
                value: "Up to $1M+",
                description:
                  "Estimated annual savings potential for enterprise deployments",
              },
              {
                title: "Asset Efficiency",
                value: "Target 95%",
                description: "Projected improvement in asset utilization rates",
              },
              {
                title: "Compliance",
                value: "100%",
                description:
                  "Built to meet current sustainability reporting standards",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg hover:scale-105"
              >
                <h3 className="text-lg font-semibold text-green-600">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold my-2">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Sustainable Asset Management
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Box,
                title: "Asset Tracking",
                description:
                  "Comprehensive tracking of all your physical and digital assets with detailed lifecycle management.",
              },
              {
                icon: Leaf,
                title: "Carbon Footprint",
                description:
                  "Monitor and analyze the environmental impact of your assets with real-time carbon footprint tracking.",
              },
              {
                icon: BarChart2,
                title: "Sustainability Reports",
                description:
                  "Generate detailed sustainability reports and get actionable insights to reduce your environmental impact.",
              },
              {
                icon: CheckCircle,
                title: "Compliance Management",
                description:
                  "Stay compliant with environmental regulations and standards with built-in compliance tracking and reporting.",
              },
              {
                icon: Globe,
                title: "Global Asset Visibility",
                description:
                  "Get a bird's-eye view of your assets across multiple locations and jurisdictions.",
              },
              {
                icon: Zap,
                title: "Energy Efficiency Optimization",
                description:
                  "Identify energy-hungry assets and optimize their usage for improved efficiency and reduced costs.",
              },
            ].map((feature, index) => (
              <div key={index} className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tailored Solutions for Various Industries
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Commercial Real Estate",
                description:
                  "Optimize building management and reduce environmental impact across your property portfolio.",
              },
              {
                icon: Factory,
                title: "Manufacturing",
                description:
                  "Track and improve the sustainability of your production lines and supply chain.",
              },
              {
                icon: TreePine,
                title: "Agriculture",
                description:
                  "Manage farm equipment and natural resources with a focus on sustainable practices.",
              },
              {
                icon: Zap,
                title: "Energy",
                description:
                  "Monitor and optimize energy production and distribution assets for maximum efficiency.",
              },
              {
                icon: Box,
                title: "Logistics",
                description:
                  "Streamline your fleet and warehouse operations while minimizing carbon footprint.",
              },
              {
                icon: Globe,
                title: "Government",
                description:
                  "Manage public assets and infrastructure with transparency and environmental responsibility.",
              },
            ].map((industry, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg hover:scale-105"
              >
                <industry.icon className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{industry.title}</h3>
                <p className="text-muted-foreground">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
