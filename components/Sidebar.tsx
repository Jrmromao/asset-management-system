"use client";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

import React from "react";
import HeaderIcon from "@/components/page/HeaderIcon";

const Sidebar = () => {
  const pathName = usePathname();

  const user: any = {
    role: "admin",
  };

  return (
    <section className={cn("sidebar", { "2xl:hidden": false })}>
      <nav className="flex flex-col gap-4">
        <div className="mb-4">
          <HeaderIcon />
        </div>

        {sidebarLinks.map((item) => {
          const isActive =
            pathName === item.route || pathName.startsWith(`${item.route}/`);

          if (!item.visibleTo.includes(user.role)) {
            return null;
          }
          return (
            <Link
              href={item.route}
              id={item.label}
              className={cn("sidebar-link", { "bg-green-600 ": isActive })}
              key={item.label}
            >
              <div className="relative size-6">
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({ "brightness-[3] invert-0": isActive })}
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
        })}
      </nav>
      <Footer />
    </section>
  );
};

export default Sidebar;
