"use client";

import { ArrowRight, BarChart2, Box, Leaf, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Banner */}
      <div className="hidden md:block bg-muted/40 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm">1-888-ECO-KEEP</span>
          </div>
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
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold">EcoKeepr</span>
            </Link>
            <nav className="hidden md:flex gap-8">
              {[
                "Features",
                "Industries",
                "Integrations",
                "Blog",
                "Pricing",
              ].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-sm font-medium hover:text-green-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/sign-in")}>
              Login
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
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
              <span className="inline-block bg-green-100 text-green-800 rounded-full px-4 py-1.5 text-sm font-medium">
                SUSTAINABLE ASSET MANAGEMENT SOFTWARE
              </span>
              <h1 className="mt-6 text-4xl lg:text-6xl font-bold tracking-tight">
                Smart asset management with environmental impact tracking
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Track, maintain, and optimize your equipment&apos;s environmental
              impact all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start free trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Book a demo
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Carbon Reduction",
                value: "50%",
                description: "Average reduction in carbon footprint",
              },
              {
                title: "Cost Savings",
                value: "$1M+",
                description: "Annual savings for enterprise clients",
              },
              {
                title: "Asset Efficiency",
                value: "95%",
                description: "Improved asset utilization rate",
              },
              {
                title: "Compliance",
                value: "100%",
                description: "Meet sustainability reporting standards",
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
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
      {/*            src="/placeholder.svg?height=60&width=120"*/}
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
    </div>
  );
};

export default LandingPage;
