import React from "react";

interface AvailabilityConfig {
  color: string;
  bgColor: string;
  label: string;
}

const getAvailabilityStyle = (status: string): AvailabilityConfig => {
  switch (status) {
    case "Available":
      return {
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
        label: "Available",
      };
    case "On Loan":
      return {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        label: "On Loan",
      };
    default:
      return {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        label: status || "Unknown",
      };
  }
};

const AvailabilityChecker = ({ status }: { status: string }) => {
  const availabilityConfig = getAvailabilityStyle(status);

  console.log(status);
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full  ${availabilityConfig.bgColor} ${availabilityConfig.color}`}
    >
      {availabilityConfig.label}
    </span>
  );
};

export default AvailabilityChecker;
