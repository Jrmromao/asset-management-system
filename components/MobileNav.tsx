"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import React from "react";

const MobileNav = () => {
  const pathName = usePathname();

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <Image
            src={"/icons/hamburger.svg"}
            alt="menu item"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent side={"left"} className="border-none bg-white">
          <SheetClose asChild>
            <nav className="flex h-full flex-col gap-6 pt-16 text-white">
              {sidebarLinks.map((item) => {
                const isActive =
                  pathName === item.route ||
                  pathName.startsWith(`${item.route}/`);
                return (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.route}
                      id={item.label}
                      className={cn("mobilenav-sheet_close w-full", {
                        "bg-green-600": isActive,
                      })}
                    >
                      <div className="relative size-6">
                        <Image
                          src={item.imgURL}
                          alt={item.label}
                          width={20}
                          height={20}
                          className={cn({
                            "brightness-[3] invert-0": isActive,
                          })}
                        />
                      </div>
                      <p
                        className={cn("text-16 font-semibold text-black-2", {
                          "!text-white": isActive,
                        })}
                      >
                        {item.label}
                      </p>
                    </Link>
                  </SheetClose>
                );
              })}
              USER
            </nav>
          </SheetClose>
          <Footer type={"mobile"} />
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
