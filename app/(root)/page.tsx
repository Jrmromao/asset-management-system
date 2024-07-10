'use client'
import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import CustomAssetTable from "@/components/tables/CustomAssetTable";
import AuthForm from "@/components/forms/AuthForm";
import {useSession, signOut} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";


const Home = ({searchParams: {id, page}}: SearchParamProps) => {
    const currentPage = Number(page as string) || 1;


    const navigate = useRouter();
    const {data} = useSession()


    // if (!accounts) return;
    // const accountsData = accounts?.data;
    // const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;
    // const account = await getAccount({appwriteItemId})
    const {data: session, status} = useSession();

// if(status === 'unauthenticated') {
//     navigate.push('/sign-in')
// }
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


                    TODO
                    <p>- register new users</p>
                    <p> - register consumables</p>
                    <p> - register licenses // complete</p>
                    <p> - assign assets to people</p>
                    <p> - assign consumables to people</p>
                    <p> - assign licenses to people</p>
                    <p> - create kits</p>
                    <p> - reformat the create asset pages </p>
                    <p> - Fix the DB relations</p>
                    <p>- Protect the API</p>
                    <p>- All the additions will be done via a modal</p>


                </header>
            </div>
        </section>
    )

}

export default Home