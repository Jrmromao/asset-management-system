import React, { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle2, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Database
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface PricingTier {
  name: string;
  description: string;
  pricePerUser: number;
  maxAssets: number;
  features: string[];
  badge?: string;
  popular?: boolean;
  cta: string;
  savings?: string;
  assetOveragePrice?: number; // Price per additional asset beyond limit
}

export default function PricingTable() {
  const [userCount, setUserCount] = useState(5);
  const [assetCount, setAssetCount] = useState(1000);
  const [userInputValue, setUserInputValue] = useState("5");
  const [assetInputValue, setAssetInputValue] = useState("1000");
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useRouter();

  // Competitive pricing tiers - per user per month + asset overages
  const pricingTiers: PricingTier[] = [
    {
      name: "Launch",
      description: "Perfect for small teams getting started with asset management",
      pricePerUser: 25,
      maxAssets: 1000,
      assetOveragePrice: 0.02, // $0.02 per additional asset per month
      features: [
        "Physical assets, licenses & accessories",
        "Asset tracking & QR code generation",
        "Basic maintenance tracking",
        "Basic reporting & analytics",
        "Web-based dashboard",
        "Email support",
        "CSV import/export",
        "User roles & permissions",
        "Company data isolation"
      ],
      cta: "Start Free Trial",
      savings: "Save 15% annually"
    },
    {
      name: "Scale",
      description: "AI-powered optimization for growing businesses",
      pricePerUser: 45,
      maxAssets: 10000,
      assetOveragePrice: 0.015, // $0.015 per additional asset per month
      features: [
        "Everything in Launch, plus:",
        "License compliance tracking",
        "Accessory inventory management",
        "AI-powered cost optimization & insights",
        "Advanced analytics & dashboards",
        "CO2 footprint tracking & analysis",
        "Automated reporting & scheduling",
        "Advanced maintenance workflows",
        "REST API access",
        "Priority email support"
      ],
      badge: "Most Popular",
      popular: true,
      cta: "Start Free Trial",
      savings: "Save 15% annually"
    },
    {
      name: "Transform",
      description: "Enterprise-grade features with dedicated support",
      pricePerUser: 85,
      maxAssets: 50000,
      assetOveragePrice: 0.01, // $0.01 per additional asset per month
      features: [
        "Everything in Scale, plus:",
        "Advanced AI analytics & insights",
        "Custom reporting & dashboards",
        "Advanced user permissions",
        "Dedicated email support",
        "Advanced API features",
        "Data export & backup",
        "Priority feature requests",
        "Coming soon: Multi-company management",
        "Coming soon: SSO integration",
        "Coming soon: Custom branding",
        "Coming soon: Phone support"
      ],
      badge: "Best Value",
      cta: "Contact Our Team",
      savings: "Save 15% annually"
    }
  ];

  const calculatePrice = (tier: PricingTier, users: number, assets: number) => {
    const basePrice = tier.pricePerUser * users;
    const assetOverage = Math.max(0, assets - tier.maxAssets);
    const assetOveragePrice = assetOverage * (tier.assetOveragePrice || 0);
    const monthly = basePrice + assetOveragePrice;
    const annual = Math.round(monthly * 12 * 0.85); // 15% annual discount
    return { 
      monthly, 
      annual, 
      basePrice, 
      assetOveragePrice, 
      assetOverage 
    };
  };

  const getRecommendedTier = () => {
    // Consider both users and assets for recommendation
    if (assetCount <= 1000 && userCount <= 5) return "Launch";
    if (assetCount <= 10000 && userCount <= 25) return "Scale";
    return "Transform";
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
      },
    }),
    hover: {
      y: -5,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const handleUserInputChange = (value: string) => {
    const parsed = parseInt(value);
    setUserInputValue(value);
    if (!isNaN(parsed)) {
      setUserCount(Math.min(Math.max(parsed, 1), 100));
    }
  };

  const handleAssetInputChange = (value: string) => {
    const parsed = parseInt(value);
    setAssetInputValue(value);
    if (!isNaN(parsed)) {
      setAssetCount(Math.min(Math.max(parsed, 1), 100000));
    }
  };

  useEffect(() => {
    setUserInputValue(userCount.toString());
  }, [userCount]);

  useEffect(() => {
    setAssetInputValue(assetCount.toString());
  }, [assetCount]);

  const recommendedTier = getRecommendedTier();

  return (
    <div className="w-full max-w-7xl mx-auto py-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          Limited Time: 30-Day Free Trial + 15% Annual Discount
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Complete asset management platform with AI-powered optimization. Track assets, licenses, and accessories with maintenance scheduling, CO2 impact analysis, and cost optimization insights.
        </p>
      </motion.div>

      {/* Calculator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border p-8 mb-12"
      >
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Calculate Your Pricing</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Users */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
                <h4 className="text-lg font-semibold">Team Members</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Number of users</span>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={userInputValue}
                    onChange={(e) => handleUserInputChange(e.target.value)}
                    min={1}
                    max={100}
                    className="w-24 text-center"
                  />
                  <span className="text-sm text-gray-500">users</span>
                </div>
              </div>

              <Slider
                value={[userCount]}
                onValueChange={(value) => {
                  setUserCount(value[0]);
                  setUserInputValue(value[0].toString());
                }}
                min={1}
                max={100}
                step={1}
                className="mb-4"
              />
            </div>

            {/* Assets */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-semibold">Items to Track</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Assets, licenses & accessories</span>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={assetInputValue}
                    onChange={(e) => handleAssetInputChange(e.target.value)}
                    min={1}
                    max={100000}
                    className="w-32 text-center"
                  />
                  <span className="text-sm text-gray-500">items</span>
                </div>
              </div>

              <Slider
                value={[assetCount]}
                onValueChange={(value) => {
                  setAssetCount(value[0]);
                  setAssetInputValue(value[0].toString());
                }}
                min={1}
                max={100000}
                step={10}
                className="mb-4"
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-lg">
              <span className={!isAnnual ? "font-medium text-gray-900" : "text-gray-500"}>
                Monthly
              </span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={isAnnual ? "font-medium text-gray-900" : "text-gray-500"}>
                Annual
                <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                  Save 15%
                </Badge>
              </span>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-emerald-600 font-medium">
              Recommended: <span className="font-bold">{recommendedTier}</span> plan for {userCount} {userCount === 1 ? 'user' : 'users'} and {assetCount.toLocaleString()} items
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-8 mb-12"
      >
        {pricingTiers.map((tier, index) => {
          const pricing = calculatePrice(tier, userCount, assetCount);
          const isRecommended = tier.name === recommendedTier;
          const price = isAnnual ? pricing.annual : pricing.monthly;
          const period = isAnnual ? "year" : "month";

          return (
            <motion.div
              key={tier.name}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              className="relative"
            >
              <Card className={`h-full flex flex-col transition-all duration-300 ${
                isRecommended 
                  ? 'ring-2 ring-emerald-500 shadow-xl scale-105' 
                  : 'hover:shadow-lg'
              }`}>
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className={`px-4 py-1 ${
                      tier.popular 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}>
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4 flex-shrink-0">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-gray-600">{tier.description}</p>
                  
                  <div className="mt-4">
                    {tier.name === "Transform" ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          Custom Pricing
                        </div>
                        <p className="text-sm text-gray-600">
                          Tailored to your organization's needs
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Volume discounts available
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            ${price.toLocaleString()}
                          </span>
                          <span className="text-gray-600">/{period}</span>
                        </div>
                        {isAnnual && (
                          <p className="text-sm text-emerald-600 font-medium mt-1">
                            {tier.savings}
                          </p>
                        )}
                        
                        {/* Price Breakdown */}
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                          <div>Base: ${pricing.basePrice.toFixed(2)}/month</div>
                          {pricing.assetOverage > 0 && (
                            <div>Assets: +${pricing.assetOveragePrice.toFixed(2)}/month</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-grow">
                  <div className="space-y-3 flex-grow">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button
                      size="lg"
                      className={`w-full text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                        isRecommended
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-300'
                          : tier.name === "Transform"
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300'
                          : 'bg-gray-800 hover:bg-gray-900 shadow-gray-200 hover:shadow-gray-300'
                      }`}
                      onClick={() => {
                        if (tier.name === "Transform") {
                          navigate.push('/contact');
                        } else {
                          navigate.push(`/sign-up?plan=${tier.name.toLowerCase()}&users=${userCount}&assets=${assetCount}&billing=${isAnnual ? 'annual' : 'monthly'}`);
                        }
                      }}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Example Scenario */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 rounded-2xl p-8 mb-12"
      >
        <h3 className="text-xl font-bold text-center mb-6 text-blue-900">
          💡 Example: Solo User with 4,000 Items (Assets + Licenses + Accessories)
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => {
            const pricing = calculatePrice(tier, 1, 4000);
            const monthlyPrice = pricing.monthly;
            
            return (
              <div key={tier.name} className="bg-white rounded-lg p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">{tier.name}</h4>
                {tier.name === "Transform" ? (
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      Custom Quote
                    </div>
                    <div className="text-xs text-gray-500">
                      Contact sales for pricing
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ${monthlyPrice.toFixed(2)}/month
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Base: ${tier.pricePerUser}/month</div>
                      {pricing.assetOverage > 0 && (
                        <div>
                          Assets: {pricing.assetOverage.toLocaleString()} × ${tier.assetOveragePrice} = ${pricing.assetOveragePrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-4 gap-8 mb-12"
      >
        <div className="text-center">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-emerald-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">30-Day Free Trial</h4>
          <p className="text-sm text-gray-600">No credit card required</p>
        </div>
        
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Quick Setup</h4>
          <p className="text-sm text-gray-600">Get started in under 10 minutes</p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Expert Support</h4>
          <p className="text-sm text-gray-600">Dedicated customer success team</p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Proven ROI</h4>
          <p className="text-sm text-gray-600">Average 25% cost reduction in first year</p>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-50 rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What's included in the free trial?</h4>
            <p className="text-sm text-gray-600">Full access to Scale plan features for 30 days. No credit card required to start.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What AI features are currently available?</h4>
            <p className="text-sm text-gray-600">AI-powered cost optimization analysis, CO2 footprint calculation and tracking, automated maintenance recommendations, and intelligent insights for asset lifecycle management.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What types of items can I track?</h4>
            <p className="text-sm text-gray-600">Track physical assets (laptops, equipment), software licenses (with compliance monitoring), and accessories (cables, peripherals) all in one unified platform.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How does maintenance tracking work?</h4>
            <p className="text-sm text-gray-600">Schedule maintenance events, track costs, assign technicians, monitor asset health, and analyze environmental impact. Includes automated CO2 footprint calculation for maintenance activities.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Is there an API available?</h4>
            <p className="text-sm text-gray-600">Yes, we provide REST API access for integrating with your existing systems. API documentation is available for Scale and Transform plans.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Do you offer volume discounts?</h4>
            <p className="text-sm text-gray-600">Yes, we offer custom pricing for large organizations. Contact our sales team for enterprise pricing.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
