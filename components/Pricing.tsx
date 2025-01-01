"use client";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingTable() {
  const [assetCount, setAssetCount] = useState<number>(100);
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");

  const basePrice = currency === "EUR" ? 91.08 : 99;
  const pricePerAsset = currency === "EUR" ? 0.46 : 0.5;
  const annualDiscount = 0.1;
  const router = useRouter();

  const calculateTotal = () => {
    let total = basePrice + assetCount * pricePerAsset;
    if (isAnnual) {
      total = total * 12 * (1 - annualDiscount);
    }
    return total.toFixed(2);
  };

  const features = [
    "Unlimited users",
    "24/7 support",
    "Real-time asset tracking",
    "Carbon footprint monitoring",
    "Customizable sustainability reports",
    "Data export",
  ];

  const handleEnterprise = () => {
    router.push("/contact-sales");
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 lg:p-12 flex flex-col lg:flex-row gap-12">
      <div className="lg:flex-1">
        <h2 className="text-2xl font-bold text-emerald-800 mb-4">
          EcoKeepr Pro
        </h2>
        <p className="text-gray-600 mb-8">
          Perfect for businesses of all sizes. Get full access to our powerful
          asset management and sustainability tracking tools.
        </p>

        <div>
          <h3 className="text-emerald-600 font-semibold mb-6">
            What&#39;s included
          </h3>
          <ul className="grid gap-4">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-x-3 text-gray-600"
              >
                <CheckCircle2 className="h-5 w-5 flex-none text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lg:w-[448px]">
        <div className="flex justify-between items-center mb-8">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "EUR" | "USD")}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>

          <div className="flex items-center gap-2 text-sm border rounded-md p-2">
            <span className={!isAnnual ? "font-semibold" : ""}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={isAnnual ? "font-semibold" : ""}>
              Annual (-10%)
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1">Assets to be tracked</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag the slider to see how the price changes
          </p>

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <Slider
              value={[assetCount]}
              onValueChange={(value) => setAssetCount(value[0])}
              min={100}
              max={10000}
              step={1}
              className="mb-8"
            />

            <div className="relative -mt-4">
              <div className="absolute w-full flex justify-between">
                <span className="text-sm text-gray-600">100</span>
                <span className="text-sm text-gray-600">10000</span>
              </div>
            </div>
          </div>
        </div>

        {assetCount < 10000 ? (
          <>
            <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {currency === "EUR" ? "€" : "$"}
                {calculateTotal()}
                <span className="text-base font-normal text-gray-600 ml-1">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                For tracking {assetCount} assets
              </p>

              <div className="flex justify-between text-sm text-gray-600">
                <div>
                  Base price: {currency === "EUR" ? "€" : "$"}
                  {basePrice}/month
                </div>
                <div>
                  Per asset: {currency === "EUR" ? "€" : "$"}
                  {pricePerAsset}/asset
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-white"
              onClick={() => router.push("/sign-up")}
            >
              Start free trial
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-emerald-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                Enterprise Pricing
              </h3>
              <p className="text-sm text-emerald-600 mb-4">
                For organizations tracking over 10000 assets, we offer custom
                enterprise solutions with additional features and dedicated
                support.
              </p>
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-white"
              onClick={handleEnterprise}
            >
              Contact Sales
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
