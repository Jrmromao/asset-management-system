"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

const formatUsername = (user: User | null): string => {
  if (!user) return "Guest";

  // First try to get the user's name from metadata
  if (user.user_metadata?.name) {
    return user.user_metadata.name;
  }

  // If no name, clean up the email
  if (user.email) {
    // Remove everything after +
    const cleanEmail = user.email.split("+")[0];
    // Remove domain
    const localPart = cleanEmail.split("@")[0];
    // Convert to title case and replace dots/underscores with spaces
    return localPart
      .split(/[._]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  return "Guest";
};

const Footer = ({ type = "desktop" }: { type?: "desktop" | "mobile" }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  const username = formatUsername(user);
  const firstLetter = username.charAt(0).toUpperCase();

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
      </div>

      <div
        className="footer_image"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/sign-in";
        }}
      >
        <Image src="/icons/logout.svg" fill alt="logout" />
      </div>
    </footer>
  );
};

export default Footer;
