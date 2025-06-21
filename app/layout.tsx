// app/layout.tsx
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/SessionProvider";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const iBMPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

export const metadata = {
  title: "Asset Management Pro",
  description: "A modern asset management solution for your business.",
  icons: {
    icon: "/icons/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${iBMPlexSerif.variable}`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
