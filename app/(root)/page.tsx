import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import CustomAssetTable from "@/components/tables/CustomAssetTable";



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

                <header className="home-header">
                    <HeaderBox
                        type="greeting"
                        title="Welcome"
                        user={'Joao' || 'Guest'}
                        subtext="Access and manage your account and transactions efficiently."
                    />

                </header>


                {/*<div className=" flex flex-col flex-grow">*/}
                {/*    <div className="home-content">*/}
                {/*        <TotalBalanceBox*/}
                {/*            accounts={[]}*/}
                {/*            totalBanks={0}*/}
                {/*            totalCurrentBalance={0}*/}
                {/*        />*/}
                {/*        <CustomAssetTable assets={[]}/>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>

            {/*<RightSidebar*/}
            {/*    user={loggedIn}*/}
            {/*    transactions={account?.transactions}*/}
            {/*    banks={accountsData?.slice(0, 2)}*/}
            {/*/>*/}
        </section>
    )
}

export default Home