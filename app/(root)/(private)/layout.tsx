import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import React from "react";
import HeaderIcon from "@/components/page/HeaderIcon";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full font-inter">
      <Sidebar key={"jhvbjhvjhvbj"} />
      <div className="flex size-full flex-col">
        <div className="root-layout">
          <HeaderIcon />
          <div>
            <MobileNav />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
