"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import React, { useEffect, useMemo } from "react";
import HeaderIcon from "@/components/page/HeaderIcon";
import { getSession, useSession } from "next-auth/react";

// Separate SidebarLink component for better performance
const SidebarLink = React.memo(({ item, isActive, userRole }: any) => {
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
});

SidebarLink.displayName = "SidebarLink";

const Sidebar = () => {
  const pathName = usePathname();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const userRole = session?.user?.role || "guest";

  // Effect to handle session updates
  useEffect(() => {
    const handleSessionUpdate = async () => {
      const updatedSession = await getSession();
      if (updatedSession) {
        // Force session update
        await update();
      }
    };

    // Check session on mount and after login
    handleSessionUpdate();

    // Add event listener for auth state changes
    window.addEventListener("storage", handleSessionUpdate);

    return () => {
      window.removeEventListener("storage", handleSessionUpdate);
    };
  }, [update]);

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

  // Reload links when session status changes
  useEffect(() => {
    if (status === "authenticated") {
      router.refresh();
    }
  }, [status, router]);

  // Show loading state while session is loading
  if (status === "loading") {
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
