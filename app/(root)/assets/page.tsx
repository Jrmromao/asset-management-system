import React from 'react'
import HeaderBox from "@/components/HeaderBox";
import {Pagination} from "@/components/Pagination";
import RecentTransactions from "@/components/RecentTransactions";




const Assets = () => {
    return (
        <div className="transactions">
            <div className="transactions-header">
                <HeaderBox
                    title="Assets"
                    subtext="Manage your assets."
                />
            </div>
            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">
                    <RecentTransactions
                    accounts={[]}
                    transactions={[]}
                    appwriteItemId={'appwriteItemId'}
                    page={1}
                />
                </section>
            </div>
        </div>
    )
}
export default Assets
