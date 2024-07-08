import {getServerSession} from "next-auth";

export const dynamic = 'force-dynamic'
import type {Metadata} from "next";
import {Inter, IBM_Plex_Serif} from "next/font/google";
import "./globals.css";

const inter = Inter({subsets: ["latin"], variable: '--font-inter'});
const ibmPlexSerif = IBM_Plex_Serif({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-ibm-plex-serif'
})

export const metadata: Metadata = {
    title: "Assest Managment System",
    description: "This is my banking app for the people",
    icons: {
        icon: '/icons/logo.svg'
    }
};

export default async function RootLayout({ children}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getServerSession()

    return (
        <html lang="en">
        <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>{children}</body>
        </html>
    );
}
