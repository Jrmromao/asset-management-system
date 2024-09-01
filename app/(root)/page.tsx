'use client'
import HeaderBox from '@/components/HeaderBox'
import { auth } from "@/auth"


const Home = async ({searchParams}: SearchParamProps) => {

    const session = await auth()
    return (
        <section className="home">
            <div className=" flex flex-col flex-grow">
                <header className="home-header">

                    <HeaderBox
                        type="greeting"
                        title="Welcome"
                        user={String(session?.user?.name)}
                        subtext="Select an option to continue"
                    />

                    <p> - register Accessories</p>
                    <p> - assign assets to people</p>
                    <p> - assign consumables to people??</p>
                    <p> - assign licenses to people</p>
                    <p> - create kits</p>

                </header>
            </div>
        </section>
    )

}

export default Home