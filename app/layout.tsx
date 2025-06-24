// app/layout.tsx
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/providers/QueryClientProvider";
import { UserProvider } from "@/components/providers/UserContext";
import ClientLayout from "@/components/layout/ClientLayout";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${iBMPlexSerif.variable}`}
          suppressHydrationWarning={true}
        >
          <UserProvider>
            <QueryProvider>
              <ClientLayout>{children}</ClientLayout>
            </QueryProvider>
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
