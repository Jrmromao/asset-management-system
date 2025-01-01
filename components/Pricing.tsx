import React, { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PricingTable() {
  const [assetCount, setAssetCount] = useState(100);
  const [inputValue, setInputValue] = useState("100");
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState("EUR");

  const pricePerAsset = currency === "EUR" ? "0.37" : "0.40";
  const annualDiscount = 0.1;

  const handleInputChange = (value: string) => {
    const parsed = parseInt(value);
    setInputValue(value);
    if (!isNaN(parsed)) {
      setAssetCount(Math.min(Math.max(parsed, 100), 10000));
    }
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
    <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-emerald-800">EcoKeepr Pro</h2>
        <p className="mt-2 text-base text-gray-600">
          Streamline your asset management and sustainability tracking
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 p-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Features Included</h3>
          <div className="grid gap-4">
            <TooltipProvider>
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-center gap-3 group"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature.name}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{feature.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:border-emerald-500 transition-colors"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>

            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
              <span className={!isAnnual ? "font-medium" : "text-gray-500"}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-emerald-600"
              />
              <span className={isAnnual ? "font-medium" : "text-gray-500"}>
                Annual (-10%)
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Assets to track</h3>
              <span className="text-sm text-gray-500">{assetCount} assets</span>
            </div>

            <Input
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              min={100}
              max={10000}
              className="mb-4"
              placeholder="Enter number of assets (100-10000)"
            />

            <Slider
              value={[assetCount]}
              onValueChange={(value) => setAssetCount(value[0])}
              min={100}
              max={10000}
              step={100}
              className="mb-2"
            />

            <div className="flex justify-between text-sm text-gray-500">
              <span>100 min</span>
              <span>10000 max</span>
            </div>
          </div>

          {assetCount < 10000 ? (
            <div className="bg-emerald-50 rounded-xl p-6 shadow-sm">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-emerald-800 mb-1">
                  {currency === "EUR" ? "€" : "$"}
                  {isAnnual ? calculateAnnualPrice() : calculateMonthlyPrice()}
                </div>
                <span className="text-base text-gray-600">
                  per {isAnnual ? "year" : "month"}
                </span>
              </div>

              <div className="space-y-3 text-gray-600">
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
                  <span className="font-medium">{assetCount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50  rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-emerald-800 mb-3">
                Enterprise Solution
              </h3>
              <p className="text-gray-600 mb-4">
                Custom pricing and features for organizations tracking 10,000+
                assets
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors">
                Contact Sales Team
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
