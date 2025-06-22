"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";
import { APP_NAME } from "@/constants";

const HeaderIcon = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  return (
    // <Link href="/" className="flex items-center gap-2">
    //   <Image src="/icons/logo.svg" width={34} height={34} alt="Horizon logo" />
    //   <h1
      //   className={cn("text-26 font-ibm-plex-serif font-bold text-black-1", {
      //     hidden: isCollapsed,
      //   })}
      // >
    //     EcoKeepr
    //   </h1>
    // </Link>


<Link
href={true ? "/admin" : "/"}
className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
>
<Leaf className="w-7 h-7 text-emerald-600" />
<div className="flex flex-col">
  <span  className={cn("text-26 font-ibm-plex-serif font-bold text-black-1", {
          hidden: isCollapsed,
        })}
      >
    {APP_NAME}</span>
</div>
</Link>
  );
};

export default HeaderIcon;



