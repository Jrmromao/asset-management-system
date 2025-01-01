import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { APP_NAME } from "@/constants";

const HeaderIcon = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Leaf className="w-8 h-8 text-green-600" />
      <span className="text-xl font-bold"> {APP_NAME}</span>
    </Link>
  );
};
export default HeaderIcon;
