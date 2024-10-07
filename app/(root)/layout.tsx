import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Script from "next/script";



export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <main className="flex min-h-screen w-full font-inter">

            <header>
                <Script async src="https://www.googletagmanager.com/gtag/js?id=G-K3TNF3MCG4"></Script>
                <Script id={'google-analytics'}>
                    {`window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-K3TNF3MCG4');
                    `}
                </Script>
            </header>

            <Sidebar key={'jhvbjhvjhvbj'}/>
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <Image src={'/icons/logo2.png'} width={30} height={30} alt="Logo"/>
                    <div>
                        <MobileNav/>
                    </div>
                </div>
                {children}

            </div>
        </main>
    );
}
