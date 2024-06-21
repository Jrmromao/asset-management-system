import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
// import {getLoggedInUser} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";


export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {

    // const loggedIn = await getLoggedInUser();

    // if(!loggedIn)
    //     redirect('/sign-in')


    return (
        <main className="flex h-screen w-full font-inter" >
            <Sidebar key={'jhvbjhvjhvbj'}/>
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <Image src={'/icons/logo.svg'} width={30} height={30} alt="Logo"/>
                    <div>
                        <MobileNav/>
                    </div>
                </div>
                {children}
            </div>
        </main>
    );
}
