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
                        user={'Joao' || 'Guest'}
                        subtext="Access and manage your account and transactions efficiently."
                    />

                    {JSON.stringify(session, null, 2)}
<br/>
                    TODO
                    <p>- register new users - done</p>
                    <p> - register Accessories</p>
                    <p> - register licenses - done</p>
                    <p> - assign assets to people</p>
                    <p> - assign consumables to people??</p>
                    <p> - assign licenses to people</p>
                    <p> - create kits</p>
                    <p> - reformat the create asset pages - done</p>
                    <p> - Fix the DB relations - done</p>
                    <p>- Protect the API ?? </p>


                </header>
            </div>
        </section>
    )

}

export default Home