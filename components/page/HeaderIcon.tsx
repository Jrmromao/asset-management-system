import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { APP_NAME } from "@/constants";

const HeaderIcon = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
    >
      <Leaf className="w-7 h-7 text-emerald-600" />
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-gray-800">{APP_NAME}</span>
        <span className="text-sm text-gray-500">Asset Management</span>
      </div>
    </Link>
  );
};

export default HeaderIcon;
