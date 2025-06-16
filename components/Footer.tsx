"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

const Footer = ({ type = "desktop" }: { type?: "desktop" | "mobile" }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  // Get username with fallback
  const username = user?.user_metadata?.name || user?.email || "Guest";
  const firstLetter =
    typeof username === "string" && username.length > 0 ? username[0] : "G";

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
