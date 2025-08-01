"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import HeaderIcon from "@/components/page/HeaderIcon";
import Footer from "./Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface SidebarLinkProps {
  item: {
    route: string;
    label: string;
    imgURL: string;
  };
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarLink = React.memo(
  ({ item, isActive, isCollapsed }: SidebarLinkProps) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.route}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                {
                  "bg-green-600 text-white shadow-md": isActive,
                  "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white":
                    !isActive,
                  "justify-center px-3": isCollapsed,
                },
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative size-5 flex-shrink-0">
                <Image
                  src={item.imgURL}
                  alt={`${item.label} icon`}
                  fill
                  className={cn(
                    "object-contain transition-transform duration-200",
                    {
                      "brightness-[3] invert-0": isActive,
                      "group-hover:scale-110": !isActive,
                    },
                  )}
                  priority
                />
              </div>
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-green-700 text-white px-4 py-2 rounded-xl shadow-lg font-semibold border border-green-800 transition-all duration-200 scale-95 data-[state=open]:scale-100"
            >
              {item.label}
              <TooltipPrimitive.Arrow className="fill-green-700" />
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  },
);

SidebarLink.displayName = "SidebarLink";

const Sidebar = () => {
  const pathName = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm transition-all duration-300 ease-in-out h-screen sticky top-0 z-40 overflow-visible",
        {
          "w-20": isCollapsed,
          "w-72": !isCollapsed,
        },
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && <HeaderIcon isCollapsed={false} />}
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105",
                {
                  "ml-auto": !isCollapsed,
                  "mx-auto": isCollapsed,
                },
              )}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="size-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft className="size-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              isActive={
                pathName === item.route || pathName.startsWith(`${item.route}/`)
              }
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Footer isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
