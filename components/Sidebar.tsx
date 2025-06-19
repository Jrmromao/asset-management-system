"use client";

import { sidebarLinks, roles } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import React, { useMemo } from "react";
import HeaderIcon from "@/components/page/HeaderIcon";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

type Role = (typeof roles)[keyof typeof roles];

interface UserMetadata {
  role: Role;
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
    if (!item.visibleTo.includes(userRole)) {
      return null;
    }

    return (
      <Link
        href={item.route}
        id={item.label}
        className={cn("sidebar-link", {
          "bg-green-600": isActive,
          "dark:hover:bg-gray-800": !isActive,
          "dark:text-gray-300": !isActive,
        })}
      >
        <div className="relative size-6">
          <Image
            src={item.imgURL}
            alt={item.label}
            fill
            className={cn({
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
  const router = useRouter();

  const [user, setUser] = React.useState<UserWithMetadata | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser((data?.user as UserWithMetadata) || null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const userRole = user?.user_metadata?.role || roles.USER;

  // Memoize filtered links
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
      <section className={cn("sidebar", { "2xl:hidden": false })}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded mb-2" />
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
    >
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
