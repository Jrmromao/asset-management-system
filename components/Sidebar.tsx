"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import React, { useMemo } from "react";
import HeaderIcon from "@/components/page/HeaderIcon";
import { useSession } from "next-auth/react"; // Remove getSession import

interface SidebarLinkProps {
  item: {
    route: string;
    label: string;
    imgURL: string;
    visibleTo: string[];
  };
  isActive: boolean;
  userRole: string;
}

const SidebarLink = React.memo(
  ({ item, isActive, userRole }: SidebarLinkProps) => {
    if (!item.visibleTo.includes(userRole)) {
      return null;
    }

    return (
      <Link
        href={item.route}
        id={item.label}
        className={cn("sidebar-link", { "bg-green-600": isActive })}
      >
        <div className="relative size-6">
          <Image
            src={item.imgURL}
            alt={item.label}
            fill
            className={cn({ "brightness-[3] invert-0": isActive })}
            priority={true}
          />
        </div>
        <p
          className={cn("sidebar-label", {
            "!text-white": isActive,
          })}
        >
          {item.label}
        </p>
      </Link>
    );
  },
);

SidebarLink.displayName = "SidebarLink";
const Sidebar = () => {
  const pathName = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // Handle unauthenticated state if needed
    },
  });
  const userRole = session?.user?.role || "guest";

  // Memoize filtered links
  const filteredLinks = useMemo(
    () =>
      sidebarLinks.map((item) => ({
        ...item,
        isActive:
          pathName === item.route || pathName.startsWith(`${item.route}/`),
      })),
    [pathName],
  );

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <section className={cn("sidebar", { "2xl:hidden": false })}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4" />
          {sidebarLinks.map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded mb-2" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("sidebar", { "2xl:hidden": false })}>
      <nav className="flex flex-col gap-4">
        <div className="mb-4">
          <HeaderIcon />
        </div>

        {filteredLinks.map((item) => (
          <SidebarLink
            key={item.label}
            item={item}
            isActive={item.isActive}
            userRole={userRole}
          />
        ))}
      </nav>
      <Footer />
    </section>
  );
};

export default React.memo(Sidebar);
