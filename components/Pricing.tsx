import React, { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PricingTable() {
  // const [assetCount, setAssetCount] = useState(100);
  // const [inputValue, setInputValue] = useState("100");
  // const [isAnnual, setIsAnnual] = useState(true);
  // const [currency, setCurrency] = useState("EUR");

  // const pricePerAsset = currency === "EUR" ? "0.37" : "0.40";
  // const annualDiscount = 0.1;
  const [assetCount, setAssetCount] = useState(100);
  const [inputValue, setInputValue] = useState("100");
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState("EUR");

  const pricePerAsset = currency === "EUR" ? "0.37" : "0.40";
  const annualDiscount = 0.1;

  const calculatePrice = () => ({
    monthly: (assetCount * Number(pricePerAsset)).toFixed(2),
    annual: (
      assetCount *
      Number(pricePerAsset) *
      12 *
      (1 - annualDiscount)
    ).toFixed(2),
  });
  const handleInputChange = (value: string) => {
    const parsed = parseInt(value);
    setInputValue(value);
    if (!isNaN(parsed)) {
      setAssetCount(Math.min(Math.max(parsed, 100), 10000));
    }
  };
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  const priceVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  useEffect(() => {
    setInputValue(assetCount.toString());
  }, [assetCount]);

  const calculateMonthlyPrice = () => {
    return (assetCount * Number(pricePerAsset)).toFixed(2);
  };

  const calculateAnnualPrice = () => {
    return (
      assetCount *
      Number(pricePerAsset) *
      12 *
      (1 - annualDiscount)
    ).toFixed(2);
  };
  const priceAnimation = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    exit: { opacity: 0, y: 20 },
  };

  const enterpriseAnimation = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
    exit: { opacity: 0, y: -50 },
  };

  const features = [
    {
      name: "Unlimited users",
      tooltip: "Add as many team members as you need at no extra cost",
    },
    {
      name: "24/7 support",
      tooltip: "Access to our dedicated support team around the clock",
    },
    {
      name: "Real-time asset tracking",
      tooltip: "Monitor your assets' location and status in real-time",
    },
    {
      name: "Carbon footprint monitoring",
      tooltip: "Track and analyze your organization's environmental impact",
    },
    {
      name: "Customizable sustainability reports",
      tooltip: "Generate detailed reports tailored to your needs",
    },
    {
      name: "Data export",
      tooltip: "Export your data in various formats (CSV, PDF, Excel)",
    },
    {
      name: "Low stock alerts",
      tooltip: "Get notified when your assets are running low on resources",
    },
    {
      name: "Inventory management",
      tooltip: "Effortlessly manage your inventories and track usage",
    },
    {
      name: "License & Accessories management",
      tooltip: "Manage your license and accessories inventory effortlessly",
    },
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg"
    >
      {/* Header Section */}
      <motion.div variants={featureVariants} className="p-6 border-b">
        <h2 className="text-2xl font-bold text-emerald-800">EcoKeepr Pro</h2>
        <p className="mt-2 text-gray-600">Complete asset management solution</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 p-6">
        {/* Features List */}
        <div className="space-y-6">
          <motion.h3
            variants={featureVariants}
            className="text-base font-semibold text-emerald-800 pb-3"
          >
            Features Included
          </motion.h3>
          <TooltipProvider>
            <motion.div variants={containerVariants} className="grid gap-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.name}
                  custom={i}
                  variants={featureVariants}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-emerald-50 transition-colors group text-sm"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                  <span className="font-medium text-gray-600">
                    {feature.name}
                  </span>
                  <Tooltip>
                    <TooltipTrigger className="ml-auto">
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <HelpCircle className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-emerald-800 text-white">
                      <p className="text-xs">{feature.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          </TooltipProvider>
        </div>

        {/* Price Calculator */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 px-4 border rounded-lg bg-white hover:border-emerald-500 transition-colors"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>

              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                <span className={!isAnnual ? "font-medium" : "text-gray-500"}>
                  Monthly
                </span>
                <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                <span className={isAnnual ? "font-medium" : "text-gray-500"}>
                  Annual (-10%)
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Assets to track</h3>
                <span className="text-sm text-gray-500">
                  {assetCount} assets
                </span>
              </div>

              <Input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                min={100}
                max={10000}
                className="mb-4"
              />

              <Slider
                value={[assetCount]}
                onValueChange={(value) => setAssetCount(value[0])}
                min={100}
                max={10000}
                step={100}
                className="mb-2"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {assetCount < 10000 ? (
              <motion.div
                key="standard-price"
                className="bg-emerald-50 rounded-xl p-6"
              >
                <motion.div
                  key={
                    isAnnual
                      ? calculatePrice().annual
                      : calculatePrice().monthly
                  }
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={priceAnimation}
                  className="text-center mb-4"
                >
                  <div className="text-4xl font-bold text-emerald-800 mb-2">
                    {currency === "EUR" ? "€" : "$"}
                    {isAnnual
                      ? calculatePrice().annual
                      : calculatePrice().monthly}
                  </div>
                  <span className="text-gray-600">
                    per {isAnnual ? "year" : "month"}
                  </span>
                </motion.div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Base price per asset:</span>
                    <span className="font-medium">
                      {currency === "EUR" ? "€" : "$"}
                      {pricePerAsset}
                    </span>
                  </div>
                  {isAnnual && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Annual discount:</span>
                      <span className="font-medium">-10%</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span>Total assets:</span>
                    <motion.span
                      key={
                        isAnnual
                          ? calculatePrice().annual
                          : calculatePrice().monthly
                      }
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={priceAnimation}
                      className="font-medium"
                    >
                      {assetCount}
                    </motion.span>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="enterprise"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={enterpriseAnimation}
                className="bg-emerald-50 rounded-xl p-6 text-center"
              >
                <h3 className="text-xl font-bold text-emerald-800 mb-3">
                  Enterprise Solution
                </h3>
                <p className="text-gray-600 mb-6">
                  Custom pricing and advanced features for organizations
                  tracking 10,000+ assets
                </p>
                <div className="grid grid-cols-2 gap-4 text-left mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Priority Support
                      </p>
                      <p className="text-sm text-gray-600">
                        Dedicated account manager & 24/7 priority support
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Custom Integration
                      </p>
                      <p className="text-sm text-gray-600">
                        API access & custom system integrations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Advanced Analytics
                      </p>
                      <p className="text-sm text-gray-600">
                        Custom reports & predictive insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Enhanced Security
                      </p>
                      <p className="text-sm text-gray-600">
                        SSO, audit logs & compliance features
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    window.location.href = "mailto:sales@ecokeepr.com";
                  }}
                >
                  Contact Sales
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
