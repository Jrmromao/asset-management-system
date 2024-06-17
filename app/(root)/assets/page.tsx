'use client'

import React, {useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {Pagination} from "@/components/Pagination";
import RecentTransactions from "@/components/RecentTransactions";
import CustomTable from "@/components/CustomTable";
import SideDrawer from "@/components/SideDrawer";
import MySideDrawer from "@/components/MySideDrawer";
import MyDrawer from "@/components/MyDrawer";
import AssetForm from "@/components/AssetForm";


const Assets = () => {
    const [open, setOpen] = useState(false);

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
                    <div className="flex space-x-4 items-center">
                        <button className=" py-2 px-4 rounded"><MySideDrawer/></button>
                        <span className="text-black">|</span>
                        <button className=" py-2 px-4 rounded">Add Asset</button>
                        <span className="text-black">|</span>
                        <button className=" py-2 px-4 rounded">Add Asset</button>
                    </div>

                </section>
                <section className="flex w-full flex-col gap-6">
                    <CustomTable assets={[]}/>
                </section>


            </div>
        </div>
    )
}
export default Assets
