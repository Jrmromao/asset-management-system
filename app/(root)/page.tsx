'use client'
import HeaderBox from '@/components/HeaderBox'
import {auth} from "@/auth"
import { useSession } from "next-auth/react";
import {date} from "zod";

const Home = ({searchParams}: SearchParamProps) => {
    const { data: session } = useSession();

    return (
        <section className="home">
            <div className=" flex flex-col flex-grow">
                <header className="home-header">

                    {session?.user?.name && <HeaderBox
                      type="greeting"
                      title="Welcome"
                      user={String(session?.user?.name)}
                      subtext="Select an option to continue"
                    />}



                    <p> - create kits</p>

                </header>
            </div>
        </section>
    )

}

export default Home