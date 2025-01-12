"use client";
import React from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const Footer = ({ type = "desktop" }: { type?: "desktop" | "mobile" }) => {
  const { data: session, status } = useSession();

  // Get username with fallback
  const username = session?.user?.name || "Guest";
  const firstLetter = username[0] || "G";
  const userEmail = session?.user?.email || "";

  // Optional: Show loading state while session is loading
  if (status === "loading") {
    return <div className="footer">Loading...</div>;
  }

  return (
    <footer className="footer">
      <div className={type === "mobile" ? "footer_name-mobile" : "footer_name"}>
        <p className="text-xl font-bold text-gray-700">{firstLetter}</p>
      </div>
      <div
        className={type === "mobile" ? "footer_email-mobile" : "footer_email"}
      >
        <h1 className="text-14 truncate text-gray-700 font-semibold">
          {username}
        </h1>
        {/*<p className="text-14 truncate font-small text-gray-600">{userEmail}</p>*/}
      </div>

      <div
        className="footer_image"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
      >
        <Image src="/icons/logout.svg" fill alt="logout" />
      </div>
    </footer>
  );
};

export default Footer;
