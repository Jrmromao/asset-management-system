import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

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
          <Image src={"/icons/logo2.png"} width={30} height={30} alt="Logo" />
          <div>
            <MobileNav />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
