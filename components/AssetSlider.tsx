"use client";
import { Slider } from "@/components/ui/slider";

interface AssetSliderProps {
  value?: number;
  onChange: (value: number) => void;
}

export default function AssetSlider({
  value = 100,
  onChange,
}: AssetSliderProps) {
  const ticks = [
    { value: 100, label: "100" },
    { value: 500, label: "500" },
    { value: 1000, label: "1000" },
    { value: 1500, label: "1500+" },
  ];

  return (
    <div className="w-full">
      <h3 className="font-semibold mb-1">Assets to be tracked</h3>
      <p className="text-sm text-gray-600 mb-4">
        Drag the slider to see how the price changes
      </p>

      <div className="relative bg-white rounded-lg border border-gray-100 p-6">
        {/* Remove duplicate title and subtitle */}

        <Slider
          value={[value]}
          onValueChange={(newValue: number[]) => onChange(newValue[0])}
          min={100}
          max={1500}
          step={10}
          className="mb-8"
        />

        {/* Ruler marks */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="relative w-full flex justify-between">
            {ticks.map((tick) => (
              <div
                key={tick.value}
                className="absolute -translate-x-1/2"
                style={{
                  left: `${((tick.value - 100) / (1500 - 100)) * 100}%`,
                }}
              >
                <div className="h-4 w-px bg-emerald-200" />
                <span className="text-sm text-gray-600 mt-1 block text-center">
                  {tick.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
