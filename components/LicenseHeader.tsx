import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";
import Image from "next/image";
import React from "react";

interface LicenseHeaderProps {
  name: string;
  seatsAllocated: number;
  seats: number;
  belowReorder: boolean;
}

export const LicenseHeader: React.FC<LicenseHeaderProps> = ({
  name,
  seatsAllocated,
  seats,
  belowReorder,
}) => (
  <div className="flex items-center gap-3 min-h-[40px]">
    <Image
      src="/icons/license.svg"
      alt="License Icon"
      width={24}
      height={24}
      className="inline-block"
    />
    <span className="font-semibold text-xl">{name}</span>
    <Badge
      className="rounded-full bg-blue-50 px-2 py-0.5 flex items-center gap-1 border border-blue-100 shadow-none text-xs"
      style={{
        fontWeight: 400,
        fontSize: "0.85rem",
        color: "#2051CC",
        letterSpacing: 0,
        boxShadow: "0 1px 2px rgba(32,81,204,0.03)",
      }}
      aria-label={`${seatsAllocated} of ${seats} seats allocated`}
    >
      <Users className="inline-block h-3.5 w-3.5 text-blue-700" />
      <span className="ml-1">
        <span style={{ fontWeight: 600, fontSize: "1rem", color: "#2051CC" }}>
          {seatsAllocated} / {seats}
        </span>
        <span className="ml-1" style={{ fontWeight: 400 }}>
          Seats
        </span>
      </span>
    </Badge>
    {belowReorder && (
      <Badge
        className="rounded-full bg-yellow-50 px-2 py-0.5 flex items-center gap-1 border border-yellow-100 shadow-none text-xs"
        style={{
          color: "#8a5a00",
          fontWeight: 400,
          fontSize: "0.85rem",
          boxShadow: "0 1px 2px rgba(138,90,0,0.03)",
        }}
        title="Below reorder point!"
      >
        <AlertTriangle className="h-3.5 w-3.5 text-yellow-700" />
        <span
          className="ml-1"
          style={{ fontWeight: 600, fontSize: "1rem", color: "#8a5a00" }}
        >
          Below reorder point!
        </span>
      </Badge>
    )}
  </div>
);
