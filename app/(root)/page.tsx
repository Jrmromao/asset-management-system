import HeaderBox from '@/components/HeaderBox'
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import {prisma} from "@/app/db";
import {Button} from "@/components/ui/button";
// import {getAccount, getAccounts} from '@/lib/actions/bank.actions';
// import {getLoggedInUser} from '@/lib/actions/user.actions';


const Home = async ({searchParams: {id, page}}: SearchParamProps) => {
    const currentPage = Number(page as string) || 1;
    // const loggedIn = await getLoggedInUser();
    // const accounts = await getAccounts({
    //     userId: loggedIn.$id
    // })


    // if (!accounts) return;
    // const accountsData = accounts?.data;
    // const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;
    // const account = await getAccount({appwriteItemId})

    return (
        <section className="home">
            <div className=" flex flex-col flex-grow">

                <div className='bg-amber-300'>ee</div>
                <div className='bg-red-300'>eee</div>
                {/*<header className="home-header">*/}
                {/*    <HeaderBox*/}
                {/*        type="greeting"*/}
                {/*        title="Welcome"*/}
                {/*        user={'Joao' || 'Guest'}*/}
                {/*        subtext="Access and manage your account and transactions efficiently."*/}
                {/*    />*/}
                {/*</header>*/}


            </div>



            {/*<RightSidebar*/}
            {/*    // user={loggedIn}*/}
            {/*    // transactions={account?.transactions}*/}
            {/*    // banks={accountsData?.slice(0, 2)}*/}
            {/*/>*/}
        </section>
    )
}

export default Home