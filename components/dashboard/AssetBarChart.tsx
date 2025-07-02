"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

export interface AssetBarChartData {
  name: string;
  value: number;
  color?: string;
}

interface AssetBarChartProps {
  data: AssetBarChartData[];
}

const premiumColors = [
  "#2563eb", // blue
  "#f59e42", // orange
  "#16a34a", // green
  "#dc2626", // red
  "#a21caf", // purple
  "#64748b", // slate
];

export const AssetBarChart = ({ data }: AssetBarChartProps) => {
  // Sort data by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const total = sortedData.reduce((sum, d) => sum + d.value, 0);

  // Assign premium colors if not provided
  const coloredData = sortedData.map((d, i) => ({
    ...d,
    color: d.color || premiumColors[i % premiumColors.length],
  }));

  // Custom tooltip to show count and percentage
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
      return (
        <div className="rounded-lg bg-white/95 shadow-lg px-4 py-2 border border-gray-200">
          <div className="font-semibold text-gray-800">{name}</div>
          <div className="text-blue-700 font-bold text-lg">
            {value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">{percent}% of total</div>
        </div>
      );
    }
    return null;
  };

  // Custom label above bars (split into two lines)
  const renderLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 24}
          textAnchor="middle"
          fontWeight="bold"
          fontSize={20}
          fill="#1e293b"
        >
          {value}
        </text>
        <text
          x={x + width / 2}
          y={y - 6}
          textAnchor="middle"
          fontSize={14}
          fill="#64748b"
        >
          ({percent}%)
        </text>
      </g>
    );
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-4"
      aria-label="Depreciation Methods Bar Chart"
      role="img"
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={coloredData}
          margin={{ top: 32, right: 32, left: 8, bottom: 32 }}
          barCategoryGap={32}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 14, fontWeight: 500, fill: "#334155" }}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 13, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            minPointSize={4}
          >
            {coloredData.map((entry, idx) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.color}
                style={{
                  filter: "drop-shadow(0 2px 6px rgba(30,41,59,0.10))",
                  transition:
                    "transform 0.2s cubic-bezier(.4,2,.6,1), fill 0.2s cubic-bezier(.4,2,.6,1)",
                  cursor: "pointer",
                }}
                onMouseOver={(e: React.MouseEvent<SVGRectElement>) => {
                  if (e && e.target) {
                    (e.target as SVGRectElement).setAttribute(
                      "transform",
                      "scale(1.10,1.10)",
                    );
                    (e.target as SVGRectElement).setAttribute(
                      "fill",
                      darkenColor(entry.color, 0.15),
                    );
                  }
                }}
                onMouseOut={(e: React.MouseEvent<SVGRectElement>) => {
                  if (e && e.target) {
                    (e.target as SVGRectElement).setAttribute(
                      "transform",
                      "scale(1,1)",
                    );
                    (e.target as SVGRectElement).setAttribute(
                      "fill",
                      entry.color,
                    );
                  }
                }}
                aria-label={`${entry.name}: ${entry.value} (${total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0"}%)`}
              />
            ))}
            <LabelList dataKey="value" content={renderLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend for more than 2 methods */}
      {coloredData.length > 2 && (
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {coloredData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                style={{
                  background: entry.color,
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  display: "inline-block",
                  border: "1px solid #e5e7eb",
                }}
              />
              <span className="text-sm text-gray-700">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function darkenColor(hex: string, amount: number): string {
  // Clamp amount between 0 and 1
  amount = Math.max(0, Math.min(1, amount));
  // Remove # if present
  hex = hex.replace("#", "");
  // Parse r, g, b
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  // Darken each channel
  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));
  // Return as hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
