"use client";
import React from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useSession } from "@/lib/SessionProvider";
import { useRouter } from "next/navigation";

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

const Footer = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const supabase = createClient();
  const { user } = useSession();
  const router = useRouter();

  const username = formatUsername(user);
  const firstLetter = username.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh(); // Refresh the page to clear session state
  };

  return (
    <footer className="footer">
      <div className={isCollapsed ? "footer_name-mobile" : "footer_name"}>
        <p className="text-xl font-bold text-gray-700">{firstLetter}</p>
      </div>

      <div className={isCollapsed ? "hidden" : "footer_email"}>
        <h1 className="text-14 truncate font-semibold text-gray-700">
          {username}
        </h1>
        <p className="text-14 truncate font-normal text-gray-600">
          {user?.email}
        </p>
      </div>

      <div className="footer_image" onClick={handleLogout}>
        <Image src="/icons/logout.svg" fill alt="logout" />
      </div>
    </footer>
  );
};

export default Footer;
