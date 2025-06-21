"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const HeaderIcon = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/icons/logo.svg" width={34} height={34} alt="Horizon logo" />
      <h1
        className={cn("text-26 font-ibm-plex-serif font-bold text-black-1", {
          hidden: isCollapsed,
        })}
      >
        EcoKeepr
      </h1>
    </Link>
  );
};

export default HeaderIcon;
