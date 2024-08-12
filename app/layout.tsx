import {getServerSession} from "next-auth";

export const dynamic = 'force-dynamic'
import type {Metadata} from "next";
import {Inter, IBM_Plex_Serif} from "next/font/google";
import "./globals.css";
import {SessionProvider} from 'next-auth/react';
import {ClientProviders} from "@/lib/SessionProvider";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {Toaster} from "sonner";

const inter = Inter({subsets: ["latin"], variable: '--font-inter'});
const ibmPlexSerif = IBM_Plex_Serif({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-ibm-plex-serif'
})

export const metadata: Metadata = {
    title: "Asset Management System",
    description: "This is my banking app for the people",
    icons: {
        icon: '/icons/logo.svg'
    }
};

export default async function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
        <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <Toaster richColors  />
        <ThemeProvider
            attribute="class"
            defaultTheme="newyork"
            enableSystem
            disableTransitionOnChange
        ><ClientProviders>

                {children}

        </ClientProviders> </ThemeProvider>
        </body>
        </html>
    );
}
