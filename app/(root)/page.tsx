'use client'
import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import CustomAssetTable from "@/components/tables/CustomAssetTable";
import AuthForm from "@/components/forms/AuthForm";
import {useSession, signOut} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";



const Home =  ({searchParams: {id, page}}: SearchParamProps) => {
    const currentPage = Number(page as string) || 1;


    const navigate = useRouter();


    // if (!accounts) return;
    // const accountsData = accounts?.data;
    // const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;
    // const account = await getAccount({appwriteItemId})
     const { data: session, status } = useSession();


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
                    </header>
                </div>
            </section>
        )

}

export default Home