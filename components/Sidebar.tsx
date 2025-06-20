"use client";

import { sidebarLinks, roles } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import React, { useMemo } from "react";
import HeaderIcon from "@/components/page/HeaderIcon";
import { useSession } from "@/lib/SessionProvider";
import { User } from "@supabase/supabase-js";

type Role = (typeof roles)[keyof typeof roles];

interface UserMetadata {
  role?: Role;
}

interface UserWithMetadata extends User {
  user_metadata: UserMetadata;
}

interface SidebarLinkProps {
  item: {
    route: string;
    label: string;
    imgURL: string;
    visibleTo: Role[];
  };
  isActive: boolean;
  userRole: Role;
}

const SidebarLink = React.memo(
  ({ item, isActive, userRole }: SidebarLinkProps) => {
    // Early return if user doesn't have access
    if (!item.visibleTo.includes(userRole)) {
      return null;
    }

    return (
      <Link
        href={item.route}
        id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
        className={cn("sidebar-link transition-colors duration-200", {
          "bg-green-600 text-white": isActive,
          "hover:bg-gray-100 dark:hover:bg-gray-800": !isActive,
          "text-gray-700 dark:text-gray-300": !isActive,
        })}
        aria-current={isActive ? "page" : undefined}
        aria-label={`Navigate to ${item.label}`}
      >
        <div className="relative size-6 flex-shrink-0">
          <Image
            src={item.imgURL}
            alt={`${item.label} icon`}
            fill
            className={cn("object-contain", {
              "brightness-[3] invert-0": isActive,
              "dark:invert": !isActive,
            })}
            priority={true}
          />
        </div>
        <p
          className={cn("sidebar-label", {
            "!text-white": isActive,
            "dark:text-gray-300": !isActive,
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
  const { user, session } = useSession();
  const isLoading = !session;

  // Safely extract user role with fallback
  const userRole = useMemo(() => {
    if (!user) return roles.USER;

    const userWithMetadata = user as UserWithMetadata;
    const role = userWithMetadata?.user_metadata?.role;

    // Validate that the role exists in our roles object
    if (role && Object.values(roles).includes(role)) {
      return role;
    }

    return roles.USER;
  }, [user]);

  // Memoize filtered links to prevent unnecessary re-renders
  const filteredLinks = useMemo(
    () =>
      sidebarLinks
        .filter((item) => item.visibleTo.includes(userRole))
        .map((item) => ({
          ...item,
          isActive:
            pathName === item.route || pathName.startsWith(`${item.route}/`),
        })),
    [pathName, userRole],
  );

  // Show loading state while session is loading
  if (isLoading) {
    return (
      <section
        className={cn("sidebar", { "2xl:hidden": false })}
        aria-label="Loading sidebar"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("sidebar dark:bg-gray-900 dark:border-gray-800", {
        "2xl:hidden": false,
      })}
      aria-label="Main navigation"
    >
      <nav className="flex flex-col gap-4" role="navigation">
        <div className="mb-4">
          <HeaderIcon />
        </div>

        {filteredLinks.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No navigation items available</p>
          </div>
        ) : (
          filteredLinks.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              isActive={item.isActive}
              userRole={userRole}
            />
          ))
        )}
      </nav>

      <Footer />
    </section>
  );
};

export default React.memo(Sidebar);
