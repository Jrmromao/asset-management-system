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
  Database,
  Box,
  Key,
  PlugZap,
  Info,
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
  baseMonthlyPrice: number;
  maxItems: number;
  activeUserLimit: number;
  overagePerItem: number;
  features: string[];
  badge?: string;
  popular?: boolean;
  cta: string;
  savings?: string;
}

export default function PricingTable() {
  const [userCount, setUserCount] = useState(5);
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useRouter();

  // Set minimums for item slider/input
  const MIN_ITEMS = 100;
  const MAX_ITEMS = 5000;
  const [totalItemCount, setTotalItemCount] = useState(MIN_ITEMS);
  const [totalItemInputValue, setTotalItemInputValue] = useState(
    MIN_ITEMS.toString(),
  );

  // Beta pricing tiers - competitive early access pricing
  const pricingTiers: PricingTier[] = [
    {
      name: "Beta Starter",
      description:
        "Essential asset management with AI-powered carbon tracking for early adopters",
      baseMonthlyPrice: 19,
      maxItems: 100,
      activeUserLimit: 3,
      overagePerItem: 0.25,
      features: [
        "Complete asset, license, and accessory lifecycle tracking",
        "AI-powered carbon footprint calculations",
        "QR/barcode generation",
        "Depreciation calculations",
        "Auditing capabilities",
        // "Check-in/check-out workflows",
        "Basic reporting",
        "CSV import/export capabilities",
        "User roles & permissions",
        "Direct feedback channel to development team",
        "Early access to new features",
      ],
      badge: "Beta Access",
      cta: "Join Beta Program",
    },
    {
      name: "Beta Professional",
      description:
        "Advanced AI features with sustainability tracking for growing businesses",
      baseMonthlyPrice: 79,
      maxItems: 1000,
      activeUserLimit: 10,
      overagePerItem: 0.1,
      features: [
        "Everything in Beta Starter, plus:",
        "AI-powered cost optimization insights",
        "Advanced CO₂ tracking & ESG reporting",
        "Bulk operations & mass updates",
        "Purchase order management",
        "Priority beta support",
        "API access & integrations",
        "Influence product roadmap",
        "Exclusive beta community access",
      ],
      popular: true,
      badge: "Most Popular",
      cta: "Join Beta Program",
      savings: "30% off launch pricing",
    },
    // Enterprise tier hidden for first release
    // {
    //   name: "Enterprise",
    //   description: "Complete platform with custom integrations and dedicated support for large organizations",
    //   baseMonthlyPrice: 399,
    //   maxAssets: 10000,
    //   assetOveragePrice: 0.03, // $0.03 per additional item per month
    //   features: [
    //     "Everything in Professional, plus:",
    //     "AI anomaly detection & alerts",
    //     "Custom integrations & webhooks",
    //     "SSO & enterprise security",
    //     "Custom branding & white-labeling",
    //     "Multi-location & department management",
    //     "Advanced workflow automation",
    //     "Dedicated account manager",
    //     "White-glove onboarding & training",
    //     "24/7 phone support & SLA guarantee",
    //   ],
    //   cta: "Contact Sales",
    // },
  ];

  // Calculate plan price based on baseMonthlyPrice and overage
  const calculatePrice = (tier: PricingTier, items: number) => {
    const included = tier.maxItems;
    const overageItems = items > included ? items - included : 0;
    const overageAmount = overageItems * tier.overagePerItem;
    const monthly = tier.baseMonthlyPrice + overageAmount;
    const annual = monthly * 12 * 0.85; // 15% discount for annual (not 10%)
    return {
      monthly,
      annual,
      baseMonthlyPrice: tier.baseMonthlyPrice,
      overage: overageAmount,
      overageItems,
    };
  };

  const getRecommendedTier = () => {
    // Consider both users and assets for recommendation
    if (totalItemCount <= 500 && userCount <= 10) return "Starter";
    return "Professional";
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
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const handleUserInputChange = (value: string) => {
    const parsed = parseInt(value);
    setUserCount(Math.min(Math.max(parsed, 1), 100));
  };

  const handleTotalItemInputChange = (value: string) => {
    const parsed = parseInt(value);
    setTotalItemInputValue(value);
    if (!isNaN(parsed)) {
      setTotalItemCount(Math.min(Math.max(parsed, MIN_ITEMS), MAX_ITEMS));
    }
  };

  // Enforce minimum total item count
  useEffect(() => {
    if (totalItemCount < MIN_ITEMS) {
      const diff = MIN_ITEMS - totalItemCount;
      setTotalItemCount((prev) => prev + diff);
      setTotalItemInputValue((prev) => (parseInt(prev) + diff).toString());
    }
    // eslint-disable-next-line
  }, [totalItemCount]);

  const recommendedTier = getRecommendedTier();

  // Calculate all plan prices - no artificial monotonicity enforcement
  const getTierPrices = (users: number, assets: number, isAnnual: boolean) => {
    const basePrices = pricingTiers.map((tier) => {
      const pricing = calculatePrice(tier, assets);
      return {
        name: tier.name,
        price: isAnnual ? pricing.annual : pricing.monthly,
        pricing,
      };
    });
    return basePrices;
  };

  // Use getTierPrices for main pricing cards
  const tierPrices = getTierPrices(userCount, totalItemCount, isAnnual);

  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const conversionRate = 0.92; // 1 USD = 0.92 EUR (example)

  const formatPrice = (price: number) =>
    currency === "USD"
      ? `$${price.toLocaleString()}`
      : `€${Math.round(price * conversionRate).toLocaleString()}`;

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
          Beta Launch: 50% Off Market Rate + Early Adopter Benefits
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Complete asset management platform with AI-powered optimization. Track
          assets, licenses, and accessories with maintenance scheduling, CO2
          impact analysis, and cost optimization insights.
        </p>
      </motion.div>

      {/* Annual vs Monthly Toggle - sticky and full width */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md py-4 mb-8 w-full flex justify-center border-b border-gray-100 shadow">
        <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur-md shadow-md px-8 py-4 rounded-full border border-gray-200">
          <span
            className={
              !isAnnual ? "font-semibold text-gray-900" : "text-gray-500"
            }
          >
            Monthly
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span
            className={
              isAnnual ? "font-semibold text-gray-900" : "text-gray-500"
            }
          >
            Annual
            <Badge
              variant="secondary"
              className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200"
            >
              Save 15%
            </Badge>
          </span>
        </div>
      </div>

      {/* Currency Selector */}
      <div className="flex items-center gap-4 mb-4">
        <span className="font-semibold">Currency:</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Select USD"
                className={`px-3 py-1 rounded-full border transition-all duration-150 ${currency === "USD" ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105" : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"}`}
                onClick={() => setCurrency("USD")}
              >
                USD
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Billed in USD. EUR prices are for reference only.</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Select EUR"
                className={`px-3 py-1 rounded-full border transition-all duration-150 ${currency === "EUR" ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105" : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"}`}
                onClick={() => setCurrency("EUR")}
              >
                EUR
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Billed in USD. EUR prices are for reference only.</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Calculator - full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center justify-center gap-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 p-10 mb-4 w-full max-w-5xl mx-auto"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          border: "1.5px solid rgba(255,255,255,0.25)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.85) 60%, rgba(236,254,255,0.7) 100%)",
        }}
      >
        <div className="flex flex-col items-center mb-2">
          <h4 className="text-3xl font-extrabold text-brand-700 tracking-tight mb-1">
            Total Items Tracked
          </h4>
          <span className="text-base text-brand-500 mt-1 flex items-center gap-1">
            Assets, licenses, and accessories—all in one place.
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-brand-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    &quot;Items&quot; are any asset, license, or accessory you
                    track in the platform.
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </div>
        <div className="flex items-center justify-between w-full max-w-2xl">
          <span className="text-base font-semibold text-gray-700">
            Number of items
          </span>
          <Input
            type="number"
            value={totalItemInputValue}
            onChange={(e) => handleTotalItemInputChange(e.target.value)}
            min={MIN_ITEMS}
            max={MAX_ITEMS}
            className="w-32 text-center text-lg font-bold bg-white/80 border border-gray-200 rounded-lg shadow-sm"
          />
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Minimum: 100 items &nbsp;|&nbsp; Maximum: 5,000 items
          <br />
          Starter plan includes up to 250 items. Overage applies above this
          limit.
        </div>
        <Slider
          value={[totalItemCount]}
          onValueChange={(value) => {
            setTotalItemCount(value[0]);
            setTotalItemInputValue(value[0].toString());
          }}
          min={MIN_ITEMS}
          max={MAX_ITEMS}
          step={100}
          className="mb-4 w-full max-w-2xl"
        />
        <div className="text-center mt-4">
          <span className="text-xl font-extrabold text-emerald-600 drop-shadow-sm">
            {`Your price: ${formatPrice(Math.min(...tierPrices.map((t) => t.price)))} / ${isAnnual ? "year" : "month"}`}
          </span>
          <div className="text-sm text-gray-600 mt-2">
            {(() => {
              const cheapestTier = tierPrices.reduce((min, tier) =>
                tier.price < min.price ? tier : min,
              );
              return `Best value: ${cheapestTier.name} plan`;
            })()}
          </div>
        </div>
      </motion.div>
      <div className="text-center text-xs text-gray-500 mb-12">
        All prices exclude VAT. Billed in USD. EUR prices are for reference
        only.
      </div>

      {/* Special Deal Banner */}
      <div className="w-full flex justify-center mb-6">
        <div className="bg-amber-100 text-amber-800 px-6 py-3 rounded-full font-semibold shadow-md text-center text-base animate-pulse">
          🎉 Special Deal: 20% off your first year – Use code{" "}
          <span className="font-mono bg-amber-200 px-2 py-1 rounded">
            LAUNCH20
          </span>{" "}
          at checkout! <span className="ml-2 text-xs">(Ends August 31)</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto"
      >
        {pricingTiers.map((tier, index) => {
          const tierPriceObj = tierPrices.find((t) => t.name === tier.name);
          const price = tierPriceObj ? tierPriceObj.price : 0;
          const pricing = calculatePrice(tier, totalItemCount);
          const isRecommended = tier.name === recommendedTier;
          const period = isAnnual ? "year" : "month";

          // Add Best Value badge to Professional
          const showBestValue = tier.name === "Professional";

          // Special deal: 20% off first year for Starter and Professional
          const isSpecialDeal =
            tier.name === "Starter" || tier.name === "Professional";
          const specialDealDiscount = 0.2;
          const specialDealPrice = Math.round(
            price * (1 - specialDealDiscount),
          );

          return (
            <motion.div
              key={tier.name}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              className={`relative ${isRecommended ? "ring-4 ring-emerald-400 scale-105 shadow-emerald-200 animate-pulse-slow" : ""}`}
              aria-label={`Pricing card for ${tier.name}`}
            >
              <Card
                className={`h-full flex flex-col transition-all duration-300 ${
                  isRecommended
                    ? "ring-2 ring-emerald-500 shadow-xl scale-105"
                    : "hover:shadow-lg"
                }`}
              >
                {(tier.badge || showBestValue || isRecommended) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {tier.badge && (
                      <Badge
                        className={`px-4 py-1 ${
                          tier.popular
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {tier.badge}
                      </Badge>
                    )}
                    {showBestValue && (
                      <Badge
                        className="px-4 py-1 bg-amber-400 text-amber-900 font-bold animate-bounce"
                        aria-label="Best Value"
                      >
                        Best Value
                      </Badge>
                    )}
                    {isRecommended && (
                      <Badge
                        className="px-4 py-1 bg-emerald-600 text-white font-bold animate-pulse"
                        aria-label="Recommended"
                      >
                        Recommended
                      </Badge>
                    )}
                  </div>
                )}

                <CardHeader className="text-center pb-4 flex-shrink-0">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {tier.name}
                  </h3>
                  <p className="text-gray-600">{tier.description}</p>

                  <div className="mt-4">
                    {tier.name === "Enterprise" ? (
                      <div className="text-center">
                        {/* <div className="text-4xl font-bold text-gray-900 mb-2">
                          Custom Pricing
                        </div> */}
                        <p className="text-sm text-gray-600">
                          Tailored to your organization&apos;s needs
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Volume discounts available
                        </p>
                        {/* <Button
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
                          aria-label="Contact Sales"
                          onClick={() => window.open('mailto:sales@yourcompany.com?subject=Enterprise%20Pricing%20Inquiry', '_blank')}
                        >
                          Contact Sales
                        </Button> */}
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        {isSpecialDeal ? (
                          <>
                            <span className="text-lg text-gray-400 line-through mr-2">
                              {formatPrice(price)}
                            </span>
                            <span className="text-4xl font-bold text-emerald-600">
                              {formatPrice(specialDealPrice)}
                            </span>
                            <span className="ml-2 bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs font-semibold">
                              20% Off First Year
                            </span>
                            <span className="text-gray-600">/{period}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-4xl font-bold text-gray-900">
                              {formatPrice(price)}
                            </span>
                            <span className="text-gray-600">/{period}</span>
                          </>
                        )}
                      </div>
                    )}
                    {tier.name !== "Enterprise" && (
                      <>
                        {isAnnual && (
                          <p className="text-sm text-emerald-600 font-medium mt-1">
                            {tier.savings}
                          </p>
                        )}
                        {/* Price Breakdown */}
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                          <div>
                            Base:{" "}
                            {formatPrice(
                              tierPriceObj && tierPriceObj.pricing
                                ? tierPriceObj.pricing.baseMonthlyPrice
                                : pricing.baseMonthlyPrice,
                            )}
                            /month
                          </div>
                          {(tierPriceObj && tierPriceObj.pricing
                            ? tierPriceObj.pricing.overage
                            : pricing.overage) > 0 && (
                            <div>
                              Assets: +
                              {formatPrice(
                                tierPriceObj && tierPriceObj.pricing
                                  ? tierPriceObj.pricing.overage
                                  : pricing.overage,
                              )}
                              /month
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-grow">
                  {/* New: Plan limits summary */}
                  <div className="mb-4 space-y-1 text-sm text-gray-700">
                    <div>
                      <b>Items included:</b> {tier.maxItems.toLocaleString()}
                    </div>
                    <div>
                      <b>Active users (can log in):</b> {tier.activeUserLimit}
                    </div>
                    <div>
                      <b>Registered users (for assignment):</b> Unlimited
                    </div>
                    <div>
                      <b>Overage per item:</b> ${tier.overagePerItem.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-3 flex-grow">
                    {tier.features.map((feature, featureIndex) => {
                      // Features that are coming soon
                      const comingSoonFeatures = [
                        "API access & integrations",
                        "SSO & enterprise security",
                        "Custom integrations & webhooks",
                        "24/7 phone support & SLA guarantee",
                        "AI anomaly detection & alerts",
                        "Advanced workflow automation",
                        "Custom branding & white-labeling",
                        "Dedicated account manager",
                        "White-glove onboarding & training",
                      ];
                      const isComingSoon = comingSoonFeatures.some((soon) =>
                        feature.includes(soon),
                      );
                      return (
                        <div
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 flex items-center gap-2">
                            {feature}
                            {isComingSoon && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-200">
                                Coming Soon
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button
                      size="lg"
                      className={`w-full text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                        isRecommended
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-300"
                          : tier.name === "Enterprise"
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300"
                            : "bg-gray-800 hover:bg-gray-900 shadow-gray-200 hover:shadow-gray-300"
                      }`}
                      onClick={() => {
                        if (tier.name === "Enterprise") {
                          window.open(
                            "mailto:sales@yourcompany.com?subject=Enterprise%20Pricing%20Inquiry",
                            "_blank",
                          );
                        } else {
                          navigate.push(
                            `/sign-up?plan=${tier.name.toLowerCase()}&users=${userCount}&assets=${totalItemCount}&billing=${isAnnual ? "annual" : "monthly"}`,
                          );
                        }
                      }}
                      aria-label={`Select ${tier.name} plan`}
                    >
                      {isSpecialDeal ? (
                        <>
                          {tier.cta}
                          <span className="ml-2 bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs font-semibold">
                            20% Off First Year
                          </span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
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
        <h3 className="text-xl font-bold text-center mb-2 text-blue-900">
          💡 Example: Small Team with 1,000 Items
        </h3>
        <p className="text-center text-sm text-blue-700 mb-6">
          Items include assets, licenses, and accessories.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {pricingTiers.map((tier) => {
            const exampleTierPrices = getTierPrices(5, 1000, false);
            const tierPriceObj = exampleTierPrices.find(
              (t) => t.name === tier.name,
            );
            const monthlyPrice = tierPriceObj ? tierPriceObj.price : 0;
            const pricing = calculatePrice(tier, 1000);
            return (
              <div
                key={tier.name}
                className="bg-white rounded-lg p-4 text-center"
              >
                <h4 className="font-semibold text-gray-900 mb-2">
                  {tier.name}
                </h4>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatPrice(monthlyPrice)}/month
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Base: {formatPrice(tier.baseMonthlyPrice)}/month</div>
                    {pricing.overage > 0 && (
                      <div>Assets: +{formatPrice(pricing.overage)} /month</div>
                    )}
                  </div>
                </div>
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
          <h4 className="font-semibold text-gray-900 mb-2">
            30-Day Free Trial
          </h4>
          <p className="text-sm text-gray-600">No credit card required</p>
        </div>

        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Quick Setup</h4>
          <p className="text-sm text-gray-600">
            Get started in under 10 minutes
          </p>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Expert Support</h4>
          <p className="text-sm text-gray-600">
            Dedicated customer success team
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Proven ROI</h4>
          <p className="text-sm text-gray-600">
            Average 25% cost reduction in first year
          </p>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-50 rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              What&apos;s included in the free trial?
            </h4>
            <p className="text-sm text-gray-600">
              Full access to Professional plan features for 30 days. A Stripe
              subscription is required to start your free trial, but you will
              not be charged until the trial period ends. You can cancel anytime
              before the trial ends to avoid charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              What AI features are currently available?
            </h4>
            <p className="text-sm text-gray-600">
              Smart Cleanup Engine with intelligent file protection, AI-powered
              cost optimization analysis, CO2 footprint calculation and
              tracking, automated maintenance recommendations, and intelligent
              insights for asset lifecycle management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              What types of items can I track?
            </h4>
            <p className="text-sm text-gray-600">
              Track physical assets (laptops, equipment), software licenses
              (with compliance monitoring), and accessories (cables,
              peripherals) all in one unified platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              How does maintenance tracking work?
            </h4>
            <p className="text-sm text-gray-600">
              Schedule maintenance events, track costs, assign technicians,
              monitor asset health, and analyze environmental impact. Includes
              automated CO2 footprint calculation for maintenance activities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Is there an API available?
            </h4>
            <p className="text-sm text-gray-600">
              REST API access for integrating with your existing systems is
              coming soon.
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-200 align-middle">
                Coming Soon
              </span>
              <br />
              API documentation will be available for the Enterprise plan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              How does the Smart Cleanup Engine work?
            </h4>
            <p className="text-sm text-gray-600">
              Our AI analyzes your reports and files to recommend optimal
              cleanup actions while protecting important documents. You can
              permanently protect critical files with one click, and the system
              learns from your preferences.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Do you offer volume discounts?
            </h4>
            <p className="text-sm text-gray-600">
              Yes, we offer custom pricing for large organizations. Contact our
              sales team for enterprise pricing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
